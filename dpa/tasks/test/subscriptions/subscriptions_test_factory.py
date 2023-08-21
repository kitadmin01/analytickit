from datetime import datetime
from typing import Any

import pytz

from analytickit.models.subscription import Subscription


def create_subscription(**kwargs: Any) -> Subscription:
    payload = dict(
        target_type="email",
        target_value="test1@analytickit.com,test2@analytickit.com",
        frequency="daily",
        interval=1,
        start_date=datetime(2022, 1, 1, 9, 0).replace(tzinfo=pytz.UTC),
    )

    payload.update(kwargs)
    return Subscription.objects.create(**payload)
