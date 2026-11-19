using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Indexers
{
    public class RetryUnavailableIndexersCommand : Command
    {
        public override bool SendUpdatesToClient => true;
    }
}
