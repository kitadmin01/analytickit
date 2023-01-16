from rest_framework import serializers

from analytickit.api.shared import UserBasicSerializer
from analytickit.api.tagged_item import TaggedItemSerializerMixin
from dpa.models.property_definition import EnterprisePropertyDefinition


class EnterprisePropertyDefinitionSerializer(TaggedItemSerializerMixin, serializers.ModelSerializer):
    updated_by = UserBasicSerializer(read_only=True)

    class Meta:
        model = EnterprisePropertyDefinition
        fields = (
            "id",
            "name",
            "description",
            "tags",
            "is_numerical",
            "updated_at",
            "updated_by",
            "query_usage_30_day",
            "is_event_property",
            "property_type",
        )
        read_only_fields = ["id", "name", "is_numerical", "query_usage_30_day", "is_event_property"]

    def update(self, event_definition: EnterprisePropertyDefinition, validated_data):
        validated_data["updated_by"] = self.context["request"].user
        if "property_type" in validated_data:
            if validated_data["property_type"] == "Numeric":
                validated_data["is_numerical"] = True
            else:
                validated_data["is_numerical"] = False

        return super().update(event_definition, validated_data)
