# Generated by Django 3.1.8 on 2021-05-26 23:18

from django.db import migrations, models

import posthog.models.dashboard_item


def create_short_ids(apps, schema_editor):
    DashboardItem = apps.get_model("posthog", "DashboardItem")
    for obj in DashboardItem.objects.all():
        obj.short_id = posthog.models.dashboard_item.generate_short_id()
        obj.save()


class Migration(migrations.Migration):
    # This avoids: "cannot ALTER TABLE "posthog_dashboarditem" because it has pending trigger events"
    # Basically, we can't alter a table and change its data inside one transaction
    atomic = False

    dependencies = [
        ("posthog", "0155_organization_available_features"),
    ]

    operations = [
        migrations.AddField(
            model_name="dashboarditem", name="short_id", field=models.CharField(blank=True, max_length=12),
        ),
        migrations.RunPython(create_short_ids, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="dashboarditem",
            name="short_id",
            field=models.CharField(blank=True, max_length=12, default=posthog.models.dashboard_item.generate_short_id),
        ),
        migrations.AlterUniqueTogether(name="dashboarditem", unique_together={("team", "short_id")},),
    ]
