# Generated by Django 3.2.14 on 2023-10-18 13:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analytickit', '0009_auto_20231018_0138'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='campaignanalytic',
            name='gas_price_histogram',
        ),
        migrations.RemoveField(
            model_name='campaignanalytic',
            name='referral_count',
        ),
    ]
