from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("analytickit", "0038_migrate_actions_to_precalculate_events"),
    ]

    operations = [
        migrations.RunSQL(
            """
            UPDATE "analytickit_event"
            SET properties = properties || jsonb_build_object('$ip', ip)
            WHERE ip IS NOT NULL;
            """,
            "",
        )
    ]
