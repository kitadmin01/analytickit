# Generated by Django 3.2.14 on 2023-08-19 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("analytickit", "0002_alter_organization_plugins_access_level"),
    ]

    operations = [
        migrations.CreateModel(
            name="CommunityEngagement",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("team_id", models.IntegerField()),
                ("campaign_name", models.CharField(max_length=50)),
                ("token_address", models.CharField(max_length=42)),
                (
                    "contract_type",
                    models.CharField(
                        choices=[("ERC-20", "ERC-20"), ("ERC-721", "ERC-721"), ("ERC-777", "ERC-777")], max_length=10
                    ),
                ),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("date", models.DateField()),
                ("contract_address", models.CharField(max_length=42)),
                ("active_users", models.IntegerField()),
                ("total_contract_calls", models.IntegerField()),
                ("average_gas_used", models.DecimalField(decimal_places=5, max_digits=20)),
                ("function_calls_count", models.JSONField()),
                ("tot_tokens_transferred", models.DecimalField(decimal_places=10, max_digits=30)),
                ("referral_count", models.IntegerField()),
                ("last_modified", models.DateTimeField(auto_now=True)),
                ("tot_txns", models.IntegerField()),
                ("ave_gas_used", models.DecimalField(decimal_places=5, max_digits=20)),
                ("transaction_value_distribution", models.JSONField()),
                ("ave_txn_fee", models.DecimalField(decimal_places=5, max_digits=20)),
                ("tot_txn_from_address", models.JSONField()),
                ("tot_txn_to_address", models.JSONField()),
                ("freq_txn", models.JSONField()),
                ("token_transfer_volume", models.DecimalField(decimal_places=10, max_digits=30)),
                ("token_transfer_value", models.DecimalField(decimal_places=10, max_digits=30)),
                ("most_active_token_addresses", models.JSONField()),
                ("ave_token_transfer_value", models.DecimalField(decimal_places=10, max_digits=30)),
                ("token_flow", models.JSONField()),
                ("token_transfer_value_distribution", models.JSONField()),
            ],
        ),
    ]
