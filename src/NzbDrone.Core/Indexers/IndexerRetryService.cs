using System;
using System.Linq;
using NLog;
using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Indexers
{
    // Every 15 minutes: test each enabled indexer that's being held back after
    // failures. A test that works clears its failures (RecordSuccess), so it's
    // back in searches right away instead of after its wait runs out. One that
    // still fails just waits on (never more than an hour). Indexers waiting
    // because the site asked (rate limits) are left alone.
    public class IndexerRetryService : IExecute<RetryUnavailableIndexersCommand>
    {
        private readonly IIndexerStatusService _indexerStatusService;
        private readonly IIndexerFactory _indexerFactory;
        private readonly Logger _logger;

        public IndexerRetryService(IIndexerStatusService indexerStatusService, IIndexerFactory indexerFactory, Logger logger)
        {
            _indexerStatusService = indexerStatusService;
            _indexerFactory = indexerFactory;
            _logger = logger;
        }

        public void Execute(RetryUnavailableIndexersCommand message)
        {
            var blocked = _indexerStatusService.GetBlockedProviders()
                .Where(s => !IndexerStatusService.IsSiteRequestedWait(s))
                .ToList();

            if (blocked.Count == 0)
            {
                return;
            }

            var definitions = _indexerFactory.All().Where(d => d.Enable).ToDictionary(d => d.Id);

            foreach (var status in blocked)
            {
                if (!definitions.TryGetValue(status.ProviderId, out var definition))
                {
                    continue;
                }

                try
                {
                    // The factory's test records the outcome: a pass clears the failures.
                    var result = _indexerFactory.Test(definition);

                    if (result == null || result.IsValid)
                    {
                        _logger.Info("{0} is answering again and is back in searches", definition.Name);
                    }
                    else
                    {
                        _logger.Debug("{0} is still unavailable: {1}", definition.Name, string.Join("; ", result.Errors.Select(e => e.ErrorMessage)));
                    }
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Couldn't retry {0}", definition.Name);
                }
            }
        }
    }
}
