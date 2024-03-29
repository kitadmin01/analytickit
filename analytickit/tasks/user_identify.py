import analytickitanalytics

from analytickit.celery import app
from analytickit.models import User


@app.task(ignore_result=True)
def identify_task(user_id: int) -> None:
    user = User.objects.get(id=user_id)
    analytickitanalytics.identify(user.distinct_id, user.get_analytics_metadata())
