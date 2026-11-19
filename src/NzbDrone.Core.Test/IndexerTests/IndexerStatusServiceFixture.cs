using System;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.EnvironmentInfo;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.IndexerTests
{
    public class IndexerStatusServiceFixture : CoreTest<IndexerStatusService>
    {
        private DateTime _epoch;

        [SetUp]
        public void SetUp()
        {
            _epoch = DateTime.UtcNow;

            Mocker.GetMock<IRuntimeInfo>()
                .SetupGet(v => v.StartTime)
                .Returns(_epoch - TimeSpan.FromHours(1));
        }

        private void WithStatus(IndexerStatus status)
        {
            Mocker.GetMock<IIndexerStatusRepository>()
                .Setup(v => v.FindByProviderId(1))
                .Returns(status);

            Mocker.GetMock<IIndexerStatusRepository>()
                .Setup(v => v.All())
                .Returns(new[] { status });
        }

        private void VerifyUpdate()
        {
            Mocker.GetMock<IIndexerStatusRepository>()
                .Verify(v => v.Upsert(It.IsAny<IndexerStatus>()), Times.Once());
        }

        private void VerifyNoUpdate()
        {
            Mocker.GetMock<IIndexerStatusRepository>()
                .Verify(v => v.Upsert(It.IsAny<IndexerStatus>()), Times.Never());
        }

        [Test]
        public void should_cancel_backoff_on_success()
        {
            WithStatus(new IndexerStatus { EscalationLevel = 2 });

            Subject.RecordSuccess(1);

            VerifyUpdate();

            var status = Subject.GetBlockedProviders().FirstOrDefault();
            status.Should().BeNull();
        }

        [Test]
        public void should_not_store_update_if_already_okay()
        {
            WithStatus(new IndexerStatus { EscalationLevel = 0 });

            Subject.RecordSuccess(1);

            VerifyNoUpdate();
        }

        [Test]
        public void should_not_record_failure_for_unknown_provider()
        {
            Subject.RecordFailure(0);

            Mocker.GetMock<IIndexerStatusRepository>()
                .Verify(v => v.FindByProviderId(1), Times.Never);

            VerifyNoUpdate();
        }

        [Test]
        public void should_clear_every_failure_on_one_success()
        {
            WithStatus(new IndexerStatus { EscalationLevel = 5, InitialFailure = _epoch - TimeSpan.FromHours(3), DisabledTill = _epoch + TimeSpan.FromMinutes(30) });

            Subject.RecordSuccess(1);

            VerifyUpdate();

            var status = Mocker.GetMock<IIndexerStatusRepository>().Object.FindByProviderId(1);
            status.EscalationLevel.Should().Be(0);
            status.DisabledTill.Should().BeNull();
            status.InitialFailure.Should().BeNull();
        }

        [Test]
        public void should_never_wait_longer_than_an_hour_after_failures()
        {
            WithStatus(new IndexerStatus { EscalationLevel = 9, InitialFailure = _epoch - TimeSpan.FromDays(2), MostRecentFailure = _epoch - TimeSpan.FromHours(2) });

            Subject.RecordFailure(1);

            var status = Mocker.GetMock<IIndexerStatusRepository>().Object.FindByProviderId(1);
            status.DisabledTill.Should().HaveValue();
            status.DisabledTill.Value.Should().BeOnOrBefore(DateTime.UtcNow + TimeSpan.FromHours(1));
            status.DisabledTill.Value.Should().BeAfter(DateTime.UtcNow + TimeSpan.FromMinutes(59));
            IndexerStatusService.IsSiteRequestedWait(status).Should().BeFalse();
        }

        [Test]
        public void should_keep_a_longer_wait_the_site_asked_for()
        {
            WithStatus(new IndexerStatus { EscalationLevel = 0 });

            Subject.RecordFailure(1, TimeSpan.FromHours(6));

            var status = Mocker.GetMock<IIndexerStatusRepository>().Object.FindByProviderId(1);
            status.DisabledTill.Value.Should().BeAfter(DateTime.UtcNow + TimeSpan.FromHours(5.9));
            IndexerStatusService.IsSiteRequestedWait(status).Should().BeTrue();
        }

        [Test]
        public void old_long_waits_are_not_mistaken_for_site_requests()
        {
            var old = new IndexerStatus { EscalationLevel = 9, MostRecentFailure = _epoch, DisabledTill = _epoch + TimeSpan.FromHours(24) };

            IndexerStatusService.IsSiteRequestedWait(old).Should().BeFalse();
        }
    }
}
