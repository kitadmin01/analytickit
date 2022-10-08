# Generated by Django 3.0.11 on 2021-01-25 13:20

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("analytickit", "0115_session_recording_viewed"),
    ]

    operations = [
        migrations.AddField(
            model_name="plugin", name="latest_tag", field=models.CharField(blank=True, max_length=800, null=True),
        ),
        migrations.AddField(
            model_name="plugin", name="latest_tag_checked_at", field=models.DateTimeField(blank=True, null=True),
        ),
    ]