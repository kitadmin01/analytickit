# Generated by Django 2.2.7 on 2020-02-06 22:07

import django.contrib.postgres.fields.jsonb
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posthog", "0016_user_temporary_token"),
    ]

    operations = [
        migrations.CreateModel(
            name="DashboardItem",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID",),),
                ("name", models.CharField(blank=True, max_length=400, null=True)),
                ("filters", django.contrib.postgres.fields.jsonb.JSONField(default=dict),),
                ("order", models.IntegerField(blank=True, null=True)),
                ("type", models.CharField(blank=True, max_length=400, null=True)),
                ("deleted", models.BooleanField(default=False)),
                ("team", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="posthog.Team"),),
            ],
        ),
    ]
