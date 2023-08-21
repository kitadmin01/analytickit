import requests
from django.conf import settings
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework import mixins, request, serializers, viewsets
from rest_framework.response import Response

import analytickitanalytics
from analytickit.event_usage import groups
from analytickit.models.organization import Organization
from analytickit.models.team import Team
from dpa.models.license import License, LicenseError


class LicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = License
        fields = [
            "id",
            "key",
            "plan",
            "valid_until",
            "max_users",
            "created_at",
        ]
        read_only_fields = ["plan", "valid_until", "max_users"]

    def validate(self, data):
        validation = requests.post("https://license.analytickit.com/licenses/activate", data={"key": data["key"]})
        resp = validation.json()
        user = self.context["request"].user
        if not validation.ok:
            analytickitanalytics.capture(
                user.distinct_id,
                "license key activation failure",
                properties={"error": validation.content},
                groups=groups(user.current_organization, user.current_team),
            )
            raise LicenseError(resp["code"], resp["detail"])

        analytickitanalytics.capture(
            user.distinct_id,
            "license key activation success",
            properties={},
            groups=groups(user.current_organization, user.current_team),
        )
        data["valid_until"] = resp["valid_until"]
        data["plan"] = resp["plan"]
        data["max_users"] = resp.get("max_users", 0)
        return data


class LicenseViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet,
):
    queryset = License.objects.all()
    serializer_class = LicenseSerializer

    def get_queryset(self) -> QuerySet:
        # check MULTI_TENANCY env added in kit-infra helm project, if it is not set return none
        if getattr(settings, "MULTI_TENANCY", False):
            return License.objects.none()

        return super().get_queryset()

    def destroy(self, request: request.Request, pk=None, **kwargs) -> Response:
        license = get_object_or_404(License, pk=pk)
        validation = requests.post("https://license.analytickit.com/licenses/deactivate", data={"key": license.key})
        validation.raise_for_status()

        has_another_valid_license = License.objects.filter(valid_until__gte=now()).exclude(pk=pk).exists()
        if not has_another_valid_license:
            teams = Team.objects.exclude(is_demo=True).order_by("pk")[1:]
            for team in teams:
                team.delete()

            #  delete any organization where we've deleted all teams
            # there is no way in the interface to create multiple organizations so we won't bother informing people that this is happening
            for organization in Organization.objects.all():
                if organization.teams.count() == 0:
                    organization.delete()

        license.delete()

        return Response({"ok": True})
