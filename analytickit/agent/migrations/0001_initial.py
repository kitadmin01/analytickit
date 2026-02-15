import django.contrib.postgres.fields.jsonb
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("analytickit", "0015_normalize_wallet_addresses"),
    ]

    operations = [
        migrations.CreateModel(
            name="AggregationSnapshot",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField(db_index=True)),
                (
                    "web2_summary",
                    django.contrib.postgres.fields.jsonb.JSONField(default=dict, help_text="Aggregated web2 metrics"),
                ),
                (
                    "web3_summary",
                    django.contrib.postgres.fields.jsonb.JSONField(default=dict, help_text="Aggregated web3 metrics"),
                ),
                (
                    "cross_linked_summary",
                    django.contrib.postgres.fields.jsonb.JSONField(
                        default=dict, help_text="Cross-linked web2+web3 metrics"
                    ),
                ),
                (
                    "rolling_7d_summary",
                    django.contrib.postgres.fields.jsonb.JSONField(
                        blank=True, help_text="7-day rolling comparison", null=True
                    ),
                ),
                (
                    "rolling_30d_summary",
                    django.contrib.postgres.fields.jsonb.JSONField(
                        blank=True, help_text="30-day rolling comparison", null=True
                    ),
                ),
                ("token_count", models.IntegerField(default=0, help_text="Estimated tokens for this snapshot")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("team", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="analytickit.team")),
            ],
            options={
                "ordering": ["-date"],
                "unique_together": {("team", "date")},
            },
        ),
        migrations.CreateModel(
            name="Recommendation",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField(db_index=True)),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("engagement", "Engagement"),
                            ("transaction", "Transaction Health"),
                            ("campaign", "Campaign Attribution"),
                            ("churn", "Churn Risk"),
                            ("growth", "Growth Opportunity"),
                            ("anomaly", "Anomaly Detection"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "severity",
                    models.CharField(
                        choices=[
                            ("info", "Informational"),
                            ("warning", "Warning"),
                            ("action_required", "Action Required"),
                        ],
                        max_length=20,
                    ),
                ),
                ("title", models.CharField(max_length=255)),
                ("detail", models.TextField()),
                ("suggested_action", models.TextField()),
                (
                    "metric_references",
                    django.contrib.postgres.fields.jsonb.JSONField(
                        default=list, help_text="List of metric keys this rec references"
                    ),
                ),
                ("is_acted_on", models.BooleanField(default=False)),
                ("acted_on_at", models.DateTimeField(blank=True, null=True)),
                ("openai_model", models.CharField(help_text="Model used to generate this", max_length=50)),
                ("openai_tokens_used", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "snapshot",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="agent.aggregationsnapshot",
                    ),
                ),
                ("team", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="analytickit.team")),
            ],
            options={
                "ordering": ["-date", "-severity"],
            },
        ),
        migrations.AddIndex(
            model_name="recommendation",
            index=models.Index(fields=["team", "date"], name="agent_recom_team_id_date_idx"),
        ),
        migrations.AddIndex(
            model_name="recommendation",
            index=models.Index(fields=["team", "category"], name="agent_recom_team_id_cat_idx"),
        ),
    ]
