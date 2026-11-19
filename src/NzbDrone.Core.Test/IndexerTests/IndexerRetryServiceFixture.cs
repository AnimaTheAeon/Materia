using System;
using System.Collections.Generic;
using FluentValidation.Results;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.IndexerTests
{
    public class IndexerRetryServiceFixture : CoreTest<IndexerRetryService>
    {
        [SetUp]
        public void SetUp()
        {
            Mocker.GetMock<IIndexerFactory>()
                .Setup(v => v.Test(It.IsAny<IndexerDefinition>()))
                .Returns(new ValidationResult());
        }

        private void VerifyTested(Times times)
        {
            Mocker.GetMock<IIndexerFactory>().Verify(v => v.Test(It.IsAny<IndexerDefinition>()), times);
        }

        private void WithIndexer(bool enabled, IndexerStatus status)
        {
            Mocker.GetMock<IIndexerFactory>()
                .Setup(v => v.All())
                .Returns(new List<IndexerDefinition> { new IndexerDefinition { Id = 1, Name = "1337x", Enable = enabled } });

            Mocker.GetMock<IIndexerStatusService>()
                .Setup(v => v.GetBlockedProviders())
                .Returns(new List<IndexerStatus> { status });
        }

        private static IndexerStatus Waiting(int level, TimeSpan wait)
        {
            var now = DateTime.UtcNow;
            return new IndexerStatus { ProviderId = 1, EscalationLevel = level, MostRecentFailure = now, DisabledTill = now + wait };
        }

        [Test]
        public void should_test_an_indexer_that_is_waiting_after_failures()
        {
            WithIndexer(true, Waiting(5, TimeSpan.FromHours(1)));

            Subject.Execute(new RetryUnavailableIndexersCommand());

            VerifyTested(Times.Once());
        }

        [Test]
        public void should_test_an_indexer_left_with_an_old_24_hour_wait()
        {
            WithIndexer(true, Waiting(9, TimeSpan.FromHours(24)));

            Subject.Execute(new RetryUnavailableIndexersCommand());

            VerifyTested(Times.Once());
        }

        [Test]
        public void should_leave_alone_a_wait_the_site_asked_for()
        {
            WithIndexer(true, Waiting(5, TimeSpan.FromHours(6)));

            Subject.Execute(new RetryUnavailableIndexersCommand());

            VerifyTested(Times.Never());
        }

        [Test]
        public void should_not_test_a_turned_off_indexer()
        {
            WithIndexer(false, Waiting(5, TimeSpan.FromHours(1)));

            Subject.Execute(new RetryUnavailableIndexersCommand());

            VerifyTested(Times.Never());
        }
    }
}
