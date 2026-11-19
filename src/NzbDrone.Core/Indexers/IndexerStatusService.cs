using System;
using System.Collections.Generic;
using NLog;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.ThingiProvider.Events;
using NzbDrone.Core.ThingiProvider.Status;

namespace NzbDrone.Core.Indexers
{
    public interface IIndexerStatusService : IProviderStatusServiceBase<IndexerStatus>
    {
        ReleaseInfo GetLastRssSyncReleaseInfo(int indexerId);
        IDictionary<string, string> GetIndexerCookies(int indexerId);
        DateTime GetIndexerCookiesExpirationDate(int indexerId);

        void UpdateRssSyncStatus(int indexerId, ReleaseInfo releaseInfo);
        void UpdateCookies(int indexerId, IDictionary<string, string> cookies, DateTime? expiration);
    }

    public class IndexerStatusService : ProviderStatusServiceBase<IIndexer, IndexerStatus>, IIndexerStatusService
    {
        // The longest an indexer is held back after failures. Sites that keep
        // dropping out (1337x, TorrentDownloads) used to climb to a 24 hour
        // wait; now they're tried again within the hour, and the retry task
        // (RetryUnavailableIndexersCommand) brings them back sooner when the
        // site answers. A wait the site itself asks for (rate limits) is kept.
        public static readonly TimeSpan MaximumBackOff = TimeSpan.FromHours(1);
        private static readonly int MaximumLevel = Array.IndexOf(EscalationBackOff.Periods, (int)MaximumBackOff.TotalSeconds);

        public IndexerStatusService(IIndexerStatusRepository providerStatusRepository, IEventAggregator eventAggregator, IRuntimeInfo runtimeInfo, Logger logger)
            : base(providerStatusRepository, eventAggregator, runtimeInfo, logger)
        {
            MaximumEscalationLevel = MaximumLevel;
        }

        /// <summary>A wait the site asked for (Retry-After, request limits) that's longer than the cap.
        /// Waits from before the cap (escalation above it) don't count: those are just long waits.</summary>
        public static bool IsSiteRequestedWait(IndexerStatus status)
        {
            return status.EscalationLevel <= MaximumLevel &&
                   status.DisabledTill.HasValue && status.MostRecentFailure.HasValue &&
                   status.DisabledTill.Value - status.MostRecentFailure.Value > MaximumBackOff + TimeSpan.FromMinutes(1);
        }

        // One success means the site is back: forget the failures completely
        // instead of stepping down one level per success.
        public override void RecordSuccess(int providerId)
        {
            if (providerId <= 0)
            {
                return;
            }

            lock (_syncRoot)
            {
                var status = GetProviderStatus(providerId);

                if (status.EscalationLevel == 0 && !status.DisabledTill.HasValue)
                {
                    return;
                }

                status.EscalationLevel = 0;
                status.InitialFailure = null;
                status.DisabledTill = null;

                _providerStatusRepository.Upsert(status);

                _eventAggregator.PublishEvent(new ProviderStatusChangedEvent<IIndexer>(providerId, status));
            }
        }

        protected override void RecordFailure(int providerId, TimeSpan minimumBackOff, bool escalate)
        {
            base.RecordFailure(providerId, minimumBackOff, escalate);

            if (providerId <= 0 || minimumBackOff <= MaximumBackOff)
            {
                return;
            }

            // The cap stops the escalation ladder, not a wait the site asked for.
            lock (_syncRoot)
            {
                var status = GetProviderStatus(providerId);
                var till = (status.MostRecentFailure ?? DateTime.UtcNow) + minimumBackOff;

                if (!status.DisabledTill.HasValue || status.DisabledTill.Value < till)
                {
                    status.DisabledTill = till;

                    _providerStatusRepository.Upsert(status);

                    _eventAggregator.PublishEvent(new ProviderStatusChangedEvent<IIndexer>(providerId, status));
                }
            }
        }

        public ReleaseInfo GetLastRssSyncReleaseInfo(int indexerId)
        {
            return GetProviderStatus(indexerId).LastRssSyncReleaseInfo;
        }

        public IDictionary<string, string> GetIndexerCookies(int indexerId)
        {
            return GetProviderStatus(indexerId)?.Cookies ?? null;
        }

        public DateTime GetIndexerCookiesExpirationDate(int indexerId)
        {
            return GetProviderStatus(indexerId)?.CookiesExpirationDate ?? DateTime.Now.AddDays(12);
        }

        public void UpdateRssSyncStatus(int indexerId, ReleaseInfo releaseInfo)
        {
            lock (_syncRoot)
            {
                var status = GetProviderStatus(indexerId);

                status.LastRssSyncReleaseInfo = releaseInfo;

                _providerStatusRepository.Upsert(status);
            }
        }

        public void UpdateCookies(int indexerId, IDictionary<string, string> cookies, DateTime? expiration)
        {
            if (indexerId > 0)
            {
                lock (_syncRoot)
                {
                    var status = GetProviderStatus(indexerId);
                    status.Cookies = cookies;
                    status.CookiesExpirationDate = expiration;
                    _providerStatusRepository.Upsert(status);
                }
            }
        }
    }
}
