using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Update.Commands
{
    public class ApplicationUpdateCommand : Command
    {
        public bool InstallMajorUpdate { get; set; }
        public override bool SendUpdatesToClient => true;

        // Materia: an update starts right away instead of waiting for every other
        // task to finish (an indexer sync to an app that doesn't answer could hold
        // it for many minutes, with the page stuck at "Starting the download").
        // Other tasks just stop when Materia restarts into the new version. Only
        // one update runs at a time.
        public override bool IsTypeExclusive => true;
    }
}
