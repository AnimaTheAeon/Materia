using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using NLog;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;

namespace NzbDrone.Core.Update
{
    public interface IUpdatePackageProvider
    {
        UpdatePackage GetLatestUpdate(string branch, Version currentVersion);
        List<UpdatePackage> GetRecentUpdates(string branch, Version currentVersion, Version previousVersion = null);
    }

    // Materia gets its updates from the GitHub Releases of AnimaTheAeon/Materia,
    // not from Prowlarr's update server (which only has Prowlarr builds).
    public class UpdatePackageProvider : IUpdatePackageProvider
    {
        private const string ReleasesUrl = "https://api.github.com/repos/AnimaTheAeon/Materia/releases";
        private const string WindowsAssetSuffix = "-windows-x64-update.zip";
        private const string SynologyAssetSuffix = "-x86_64.spk";

        private readonly IHttpClient _httpClient;
        private readonly Logger _logger;

        public UpdatePackageProvider(IHttpClient httpClient, Logger logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public UpdatePackage GetLatestUpdate(string branch, Version currentVersion)
        {
            if (BuildInfo.IsDebug)
            {
                return null;
            }

            return GetPackages(branch)
                .Where(p => p.Version > currentVersion)
                .OrderByDescending(p => p.Version)
                .FirstOrDefault();
        }

        public List<UpdatePackage> GetRecentUpdates(string branch, Version currentVersion, Version previousVersion)
        {
            if (BuildInfo.IsDebug)
            {
                return new List<UpdatePackage>();
            }

            return GetPackages(branch)
                .OrderByDescending(p => p.Version)
                .Take(10)
                .ToList();
        }

        private List<UpdatePackage> GetPackages(string branch)
        {
            var request = new HttpRequestBuilder(ReleasesUrl)
                .AddQueryParam("per_page", 20)
                .Accept(HttpAccept.Json)
                .Build();

            request.Headers.Add("X-GitHub-Api-Version", "2022-11-28");

            var releases = _httpClient.Get<List<GitHubRelease>>(request).Resource ?? new List<GitHubRelease>();
            var suffix = OsInfo.IsWindows ? WindowsAssetSuffix : SynologyAssetSuffix;
            var packages = new List<UpdatePackage>();

            foreach (var release in releases.Where(r => !r.Draft && !r.Prerelease))
            {
                if (!Version.TryParse(release.TagName?.TrimStart('v', 'V'), out var version))
                {
                    continue;
                }

                // Tags are "v1.2.3"; installed builds are "1.2.3.<build>". Treat the
                // release you're running as your exact version so it shows as installed.
                var current = BuildInfo.Version;

                if (version.Major == current.Major && version.Minor == current.Minor && Math.Max(version.Build, 0) == Math.Max(current.Build, 0))
                {
                    version = current;
                }

                var asset = release.Assets?.FirstOrDefault(a => a.Name != null && a.Name.EndsWith(suffix, StringComparison.OrdinalIgnoreCase));

                if (asset == null)
                {
                    continue;
                }

                packages.Add(new UpdatePackage
                {
                    Version = version,
                    ReleaseDate = release.PublishedAt ?? DateTime.UtcNow,
                    FileName = asset.Name,
                    Url = asset.BrowserDownloadUrl,
                    Hash = GetHash(asset, release),
                    Branch = branch,
                    Changes = GetChanges(release.Body)
                });
            }

            return packages;
        }

        private string GetHash(GitHubAsset asset, GitHubRelease release)
        {
            if (asset.Digest.IsNotNullOrWhiteSpace() && asset.Digest.StartsWith("sha256:", StringComparison.OrdinalIgnoreCase))
            {
                return asset.Digest.Substring("sha256:".Length);
            }

            // Older GitHub responses have no digest; the build also publishes "<file>.sha256".
            var hashAsset = release.Assets.FirstOrDefault(a => a.Name == asset.Name + ".sha256");

            if (hashAsset == null)
            {
                return null;
            }

            try
            {
                var text = _httpClient.Get(new HttpRequest(hashAsset.BrowserDownloadUrl)).Content;

                return text.Trim().Split(' ', '\t', '\r', '\n').FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Couldn't read the checksum for {0}", asset.Name);

                return null;
            }
        }

        private static UpdateChanges GetChanges(string body)
        {
            var changes = new UpdateChanges();

            if (body.IsNullOrWhiteSpace())
            {
                return changes;
            }

            foreach (var line in body.Split('\n').Select(l => l.Trim()))
            {
                if (line.StartsWith("- ", StringComparison.Ordinal) || line.StartsWith("* ", StringComparison.Ordinal))
                {
                    changes.New.Add(line.Substring(2).Trim());
                }
            }

            return changes;
        }

        private class GitHubRelease
        {
            [JsonProperty("tag_name")]
            public string TagName { get; set; }

            [JsonProperty("body")]
            public string Body { get; set; }

            [JsonProperty("draft")]
            public bool Draft { get; set; }

            [JsonProperty("prerelease")]
            public bool Prerelease { get; set; }

            [JsonProperty("published_at")]
            public DateTime? PublishedAt { get; set; }

            [JsonProperty("assets")]
            public List<GitHubAsset> Assets { get; set; }
        }

        private class GitHubAsset
        {
            [JsonProperty("name")]
            public string Name { get; set; }

            [JsonProperty("browser_download_url")]
            public string BrowserDownloadUrl { get; set; }

            [JsonProperty("digest")]
            public string Digest { get; set; }
        }
    }
}
