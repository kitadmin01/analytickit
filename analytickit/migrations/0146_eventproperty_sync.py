# Generated by Django 3.0.11 on 2021-04-05 19:23

from django.db import migrations

ATTRIBUTES = (
    "event_names",
    "event_names_with_usage",
    "event_properties",
    "event_properties_with_usage",
    "event_properties_numerical",
)


def sync_event_and_properties_definitions(team_uuid: str, Team, EventDefinition, PropertyDefinition) -> None:
    team = None

    # It is possible that the team was deleted before the task could run
    team = Team.objects.only("uuid", *ATTRIBUTES).get(uuid=team_uuid)

    if team is None:
        return

    # Transform data for quick usability
    transformed_event_usage = {
        event_usage_record["event"]: event_usage_record for event_usage_record in team.event_names_with_usage
    }
    transformed_property_usage = {
        property_usage_record["key"]: property_usage_record
        for property_usage_record in team.event_properties_with_usage
    }

    # Add or update any existing events
    for event in team.event_names:
        instance, _ = EventDefinition.objects.get_or_create(team=team, name=event)
        instance.volume_30_day = transformed_event_usage.get(event, {}).get("volume")
        instance.query_usage_30_day = transformed_event_usage.get(event, {}).get("usage_count")
        instance.save()

    # Remove any deleted events
    EventDefinition.objects.filter(team=team).exclude(name__in=team.event_names).delete()

    # Add or update any existing properties
    for property in team.event_properties:
        property_instance, _ = PropertyDefinition.objects.get_or_create(team=team, name=property)
        property_instance.volume_30_day = transformed_property_usage.get(property, {}).get("volume")
        property_instance.query_usage_30_day = transformed_property_usage.get(property, {}).get("usage_count")
        property_instance.is_numerical = property in team.event_properties_numerical
        property_instance.save()

    # Remove any deleted properties
    PropertyDefinition.objects.filter(team=team).exclude(name__in=team.event_properties).delete()


def sync_team_event_names_and_properties(apps, schema_editor):
    Team = apps.get_model("analytickit", "Team")
    EventDefinition = apps.get_model("analytickit", "EventDefinition")
    PropertyDefinition = apps.get_model("analytickit", "PropertyDefinition")
    for team in Team.objects.all():
        try:
            sync_event_and_properties_definitions(team.uuid, Team, EventDefinition, PropertyDefinition)
        except Exception:
            pass


class Migration(migrations.Migration):
    dependencies = [
        ("analytickit", "0145_eventdefinition_propertydefinition"),
    ]

    operations = [
        migrations.RunPython(sync_team_event_names_and_properties, migrations.RunPython.noop),
    ]