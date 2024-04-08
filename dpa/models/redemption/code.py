from django.db import models
from django.conf import settings

class RedemptionCode(models.Model):
    code = models.CharField(max_length=200, unique=True)
    plan = models.IntegerField(choices=[(tag, tag.value) for tag in Plan])  # Using the existing Plan enum
    redeemed = models.BooleanField(default=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    redeemed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.code
