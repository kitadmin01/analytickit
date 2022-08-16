# Generated by Django 3.0.7 on 2020-08-07 09:15

from typing import List

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies: List = []

    operations = [
        migrations.CreateModel(
            name="License",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("plan", models.CharField(max_length=200)),
                ("valid_until", models.DateTimeField()),
                ("key", models.CharField(max_length=200)),
            ],
        ),
    ]
