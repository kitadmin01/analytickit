# Generated by Django 3.1.8 on 2021-06-23 16:01

import django.core.validators
from django.db import migrations, models

import posthog.models.utils


class Migration(migrations.Migration):

    dependencies = [
        ("posthog", "0157_plugin_metrics"),
    ]

    operations = [
        migrations.AlterField(
            model_name="personalapikey",
            name="value",
            field=models.CharField(
                default=posthog.models.utils.generate_random_token_personal, editable=False, max_length=50, unique=True
            ),
        ),
        migrations.AlterField(
            model_name="team",
            name="api_token",
            field=models.CharField(
                default=posthog.models.utils.generate_random_token_project,
                max_length=200,
                unique=True,
                validators=[
                    django.core.validators.MinLengthValidator(
                        10, "Project's API token must be at least 10 characters long!"
                    )
                ],
            ),
        ),
    ]
