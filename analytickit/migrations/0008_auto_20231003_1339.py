# Generated by Django 3.2.14 on 2023-10-03 13:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analytickit', '0007_remove_campaignanalytic_average_gas_used'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='communityengagement',
            name='team_id',
        ),
        migrations.AddField(
            model_name='communityengagement',
            name='team',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='community_engagements', related_query_name='community_engagement', to='analytickit.team'),
            preserve_default=False,
        ),
    ]