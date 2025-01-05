from unittest.mock import patch

from analytickit.models.async_migration import AsyncMigration, MigrationStatus
from analytickit.test.base import BaseTest


class AsyncMigrationBaseTest(BaseTest):
    def setUp(self):
        super().setUp()
        self.patcher = patch("analytickitanalytics.capture")
        self.patcher.start()
        self.addCleanup(self.patcher.stop)


def create_async_migration(
        name="test1",
        description="my desc",
        analytickit_min_version="1.0.0",
        analytickit_max_version="100000.0.0",
        status=MigrationStatus.NotStarted,
):
    return AsyncMigration.objects.create(
        name=name,
        description=description,
        analytickit_min_version=analytickit_min_version,
        analytickit_max_version=analytickit_max_version,
        status=status,
    )
