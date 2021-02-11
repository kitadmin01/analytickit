# Generated by Django 3.0.11 on 2021-01-21 14:16

from django.db import migrations, models


def forward(apps, schema_editor):
    Cohort = apps.get_model("posthog", "Cohort")
    Cohort.objects.filter(is_static=True, is_calculating=True).update(is_calculating=False)


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("posthog", "0123_organizationinvite_first_name"),
    ]

    operations = [
        migrations.RunPython(forward, reverse),
    ]
