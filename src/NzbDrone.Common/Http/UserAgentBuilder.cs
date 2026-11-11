using System;
using NzbDrone.Common.EnvironmentInfo;

namespace NzbDrone.Common.Http
{
    public interface IUserAgentBuilder
    {
        string GetUserAgent(bool simplified = false);
    }

    public class UserAgentBuilder : IUserAgentBuilder
    {
        // Indexers see the Prowlarr version Materia is built on (Materia's own
        // version number would look like a years-old Prowlarr to them).
        private static readonly Version ProwlarrVersion = new Version(3, 0, 2);

        private readonly string _userAgentSimplified;
        private readonly string _userAgent;

        public string GetUserAgent(bool simplified)
        {
            if (simplified)
            {
                return _userAgentSimplified;
            }

            return _userAgent;
        }

        public UserAgentBuilder(IOsInfo osInfo)
        {
            var osName = OsInfo.Os.ToString();

            if (!string.IsNullOrWhiteSpace(osInfo.Name))
            {
                osName = osInfo.Name.ToLower();
            }

            var osVersion = osInfo.Version?.ToLower();

            _userAgent = $"Prowlarr/{ProwlarrVersion} ({osName} {osVersion})";
            _userAgentSimplified = $"Prowlarr/{ProwlarrVersion.ToString(2)}";
        }
    }
}
