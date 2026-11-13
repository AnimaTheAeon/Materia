using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Download.Clients.Transmission;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Localization;

namespace NzbDrone.Core.Download.Clients.Lifestream
{
    // Materia: Lifestream (AnimaTheAeon/Lifestream) speaks Transmission's remote-control
    // protocol on port 9091, so it gets its own entry that behaves like Transmission.
    public class Lifestream : Transmission.Transmission
    {
        public Lifestream(ITransmissionProxy proxy,
                          ITorrentFileInfoReader torrentFileInfoReader,
                          ISeedConfigProvider seedConfigProvider,
                          IConfigService configService,
                          IDiskProvider diskProvider,
                          ILocalizationService localizationService,
                          Logger logger)
            : base(proxy, torrentFileInfoReader, seedConfigProvider, configService, diskProvider, localizationService, logger)
        {
        }

        public override string Name => "Lifestream";
    }
}
