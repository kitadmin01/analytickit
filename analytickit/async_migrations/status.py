def async_migrations_ok() -> bool:
    from analytickit.async_migrations.runner import is_analytickit_version_compatible
    from analytickit.models.async_migration import AsyncMigration, MigrationStatus

    for migration in AsyncMigration.objects.all():
        migration_completed_or_running = migration.status in [
            MigrationStatus.CompletedSuccessfully,
            MigrationStatus.Running,
        ]
        migration_in_range = is_analytickit_version_compatible(migration.analytickit_min_version,
                                                               migration.analytickit_max_version)

        if not migration_completed_or_running and migration_in_range:
            return False

    return True
