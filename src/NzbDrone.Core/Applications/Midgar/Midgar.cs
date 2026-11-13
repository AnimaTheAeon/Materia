using System.Collections.Generic;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Core.Applications.Sonarr;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.ThingiProvider;

namespace NzbDrone.Core.Applications.Midgar
{
    // Materia: Midgar (AnimaTheAeon/Midgar) is built on Sonarr and speaks its API, so it
    // gets its own entry in the Add Application list that behaves like Sonarr, with
    // Midgar's port (8990) filled in.
    public class Midgar : Sonarr.Sonarr
    {
        public Midgar(ICacheManager cacheManager, ISonarrV3Proxy sonarrV3Proxy, IConfigFileProvider configFileProvider, IAppIndexerMapService appIndexerMapService, IIndexerFactory indexerFactory, Logger logger)
            : base(cacheManager, sonarrV3Proxy, configFileProvider, appIndexerMapService, indexerFactory, logger)
        {
        }

        public override string Name => "Midgar";

        public override IEnumerable<ProviderDefinition> DefaultDefinitions
        {
            get
            {
                var settings = new SonarrSettings
                {
                    BaseUrl = "http://localhost:8990"
                };

                yield return new ApplicationDefinition
                {
                    SyncLevel = ApplicationSyncLevel.FullSync,
                    Implementation = GetType().Name,
                    Settings = settings
                };
            }
        }
    }
}
