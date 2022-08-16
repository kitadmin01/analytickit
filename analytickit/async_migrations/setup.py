from typing import Dict, Optional

from django.core.exceptions import ImproperlyConfigured
from infi.clickhouse_orm.utils import import_submodules
from semantic_version.base import Version

from analytickit.async_migrations.definition import AsyncMigrationDefinition
from analytickit.models.async_migration import AsyncMigration, get_all_completed_async_migrations
from analytickit.models.instance_setting import get_instance_setting
from analytickit.settings import TEST
from analytickit.version import VERSION


def reload_migration_definitions():
    for name, module in all_migrations.items():
        ALL_ASYNC_MIGRATIONS[name] = module.Migration(name)


ALL_ASYNC_MIGRATIONS: Dict[str, AsyncMigrationDefinition] = {}

ASYNC_MIGRATION_TO_DEPENDENCY: Dict[str, Optional[str]] = {}

# inverted mapping of ASYNC_MIGRATION_TO_DEPENDENCY
DEPENDENCY_TO_ASYNC_MIGRATION: Dict[Optional[str], str] = {}

analytickit_VERSION = Version(VERSION)

ASYNC_MIGRATIONS_MODULE_PATH = "analytickit.async_migrations.migrations"
ASYNC_MIGRATIONS_EXAMPLE_MODULE_PATH = "analytickit.async_migrations.examples"

all_migrations = import_submodules(ASYNC_MIGRATIONS_MODULE_PATH)
reload_migration_definitions()


def setup_async_migrations(ignore_analytickit_version: bool = False):
    """
    Execute the necessary setup for async migrations to work:
    1. Import all the migration definitions
    2. Create a database record for each
    3. Check if all migrations necessary for this analytickit version have completed (else don't start)
    4. Populate a dependencies map and in-memory record of migration definitions
    """

    applied_migrations = set(instance.name for instance in get_all_completed_async_migrations())
    unapplied_migrations = set(ALL_ASYNC_MIGRATIONS.keys()) - applied_migrations

    first_migration = None
    for migration_name, migration in ALL_ASYNC_MIGRATIONS.items():
        setup_model(migration_name, migration)

        dependency = migration.depends_on

        if not dependency:
            if first_migration:
                raise ImproperlyConfigured(
                    "Two or more async migrations have no dependency. Make sure only the first migration has no dependency."
                )

            first_migration = migration_name

        ASYNC_MIGRATION_TO_DEPENDENCY[migration_name] = dependency

        if (
                (not ignore_analytickit_version)
                and (migration_name in unapplied_migrations)
                and (analytickit_VERSION > Version(migration.analytickit_max_version))
        ):
            raise ImproperlyConfigured(
                f"Migration {migration_name} is required for analytickit versions above {VERSION}.")

    for key, val in ASYNC_MIGRATION_TO_DEPENDENCY.items():
        DEPENDENCY_TO_ASYNC_MIGRATION[val] = key

    if get_instance_setting("AUTO_START_ASYNC_MIGRATIONS") and first_migration:
        kickstart_migration_if_possible(first_migration, applied_migrations)


def setup_model(migration_name: str, migration: AsyncMigrationDefinition) -> Optional[AsyncMigration]:
    if migration.is_hidden():
        return None

    sm = AsyncMigration.objects.get_or_create(name=migration_name)[0]

    sm.description = migration.description
    sm.analytickit_max_version = migration.analytickit_max_version
    sm.analytickit_min_version = migration.analytickit_min_version

    sm.save()
    return sm


def kickstart_migration_if_possible(migration_name: str, applied_migrations: set):
    """
    Find the last completed migration, look for a migration that depends on it, and try to run it
    """

    while migration_name in applied_migrations:
        migration_name = DEPENDENCY_TO_ASYNC_MIGRATION.get(migration_name) or ""
        if not migration_name:
            return

    from analytickit.async_migrations.runner import run_next_migration

    # start running 30 minutes from now
    run_next_migration(migration_name)


def get_async_migration_definition(migration_name: str) -> AsyncMigrationDefinition:
    if TEST:
        test_migrations = import_submodules(ASYNC_MIGRATIONS_EXAMPLE_MODULE_PATH)
        if migration_name in test_migrations:
            return test_migrations[migration_name].Migration(migration_name)

    return ALL_ASYNC_MIGRATIONS[migration_name]


def get_async_migration_dependency(migration_name: str) -> Optional[str]:
    if TEST:
        return None

    return ASYNC_MIGRATION_TO_DEPENDENCY[migration_name]
