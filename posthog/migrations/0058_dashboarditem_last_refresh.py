# Generated by Django 3.0.5 on 2020-06-10 17:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posthog', '0057_action_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboarditem',
            name='last_refresh',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
