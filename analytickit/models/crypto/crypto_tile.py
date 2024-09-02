from typing import List

from django.db import models

from .crypto_dashboard import CryptoDashboard
from .crypto_analytic import CryptoAnalytic

class CryptoDashboardTile(models.Model):
    crypto_dashboard = models.ForeignKey("CryptoDashboard", on_delete=models.CASCADE)
    crypto_analytic = models.ForeignKey("CryptoAnalytic", on_delete=models.CASCADE)

    layouts: models.JSONField = models.JSONField(default=dict)
    color: models.CharField = models.CharField(max_length=400, null=True, blank=True)

    filters_hash: models.CharField = models.CharField(max_length=400, null=True, blank=True)
    last_refresh: models.DateTimeField = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs) -> None:
        if self.filters_hash is None and self.crypto_analytic.filters != {}:
            self.filters_hash = self.generate_filters_hash()
        super(CryptoDashboardTile, self).save(*args, **kwargs)

    def generate_filters_hash(self) -> str:
        return f"{self.crypto_analytic.id}_{self.crypto_dashboard.id}"

def get_crypto_tiles_ordered_by_position(crypto_dashboard: CryptoDashboard, size: str = "xs") -> List[CryptoDashboardTile]:
    tiles = list(
        CryptoDashboardTile.objects.filter(crypto_dashboard=crypto_dashboard).select_related("crypto_analytic").order_by("crypto_analytic__order").all()
    )
    tiles.sort(key=lambda x: x.layouts.get(size, {}).get("y", 100))
    return tiles
