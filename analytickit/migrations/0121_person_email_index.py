# Generated by Django 3.0.11 on 2021-01-05 12:55

from django.db import migrations


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ("analytickit", "0120_organization_personalization"),
    ]

    operations = [
        migrations.RunSQL(
            "CREATE INDEX CONCURRENTLY IF NOT EXISTS analytickit_person_email ON analytickit_person((properties->>'email'));",
            reverse_sql='DROP INDEX "analytickit_person_email";',
        )
    ]