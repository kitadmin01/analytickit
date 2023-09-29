from rest_framework import generics, serializers, status
from rest_framework.response import Response

from analytickit.models import User
from dpa.models import Billing


class BillingSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Billing
        fields = [
            "id",
            "user",
            "should_setup_billing",
            "is_billing_active",
            "plan_name",
            "billing_period_starts",
            "billing_period_ends",
            "event_allocation",
            "current_usage",
            "subscription_url",
            "current_bill_amount",
            "current_usage",
            "should_display_current_bill",
            "billing_limit",
            "billing_limit_exceeded",
            "tier_name",
        ]


class BillingRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Billing.objects.all()
    serializer_class = BillingSerializer
    lookup_field = "user__id"
    lookup_url_kwarg = "user_id"

    def get_object(self):
        user_id = self.kwargs.get(self.lookup_url_kwarg)
        if user_id == "@current":
            user = self.request.user
        else:
            user = User.objects.get(id=user_id)

        # Get the billing instance with the latest billing_period_ends date for the user
        instance = Billing.objects.filter(user=user).order_by("-billing_period_ends").first()

        # If no billing instance exists for the user, create one
        if not instance:
            instance = Billing(user=user)
            instance.save()

        return instance

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)
