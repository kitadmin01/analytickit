# Generated by Django 3.2.14 on 2023-09-28 18:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("dpa", "0002_billing"),
    ]

    operations = [
        migrations.AddField(
            model_name="billing", name="event_allocation", field=models.PositiveIntegerField(default=0),
        ),
    ]