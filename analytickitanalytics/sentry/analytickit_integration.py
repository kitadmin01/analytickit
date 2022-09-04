from sentry_sdk._types import MYPY
from sentry_sdk.client import Client
from sentry_sdk.hub import Hub
from sentry_sdk.integrations import Integration
from sentry_sdk.scope import add_global_event_processor
from sentry_sdk.utils import Dsn

import analytickit
from analytickitanalytics.request import DEFAULT_HOST
from analytickitanalytics.sentry import ANALYTICKIT__ID_TAG

if MYPY:
    from typing import Any, Dict, Optional

    from sentry_sdk._types import Event, Hint


class AnalyticKitIntegration(Integration):
    identifier = "analytickit-python"
    organization = None  # The Sentry organization, used to send a direct link from AnalyticKit to Sentry
    project_id = None  # The Sentry project id, used to send a direct link from AnalyticKit to Sentry
    prefix = "https://sentry.io/organizations/"  # URL of a hosted sentry instance (default: https://sentry.io/organizations/)

    @staticmethod
    def setup_once():
        @add_global_event_processor
        def processor(event, hint):
            # type: (Event, Optional[Hint]) -> Optional[Event]
            if Hub.current.get_integration(AnalyticKitIntegration) is not None:
                if event.get("level") != "error":
                    return event

                if event.get("tags", {}).get(ANALYTICKIT__ID_TAG):
                    analytickit_distinct_id = event["tags"][ANALYTICKIT__ID_TAG]
                    event["tags"]["AnalyticKit URL"] = f"{analytickit.host or DEFAULT_HOST}/person/{analytickit_distinct_id}"

                    properties = {
                        "$sentry_event_id": event["event_id"],
                        "$sentry_exception": event["exception"],
                    }

                    if AnalyticKitIntegration.organization:
                        project_id = AnalyticKitIntegration.project_id or (
                            not not Hub.current.client.dsn and Dsn(Hub.current.client.dsn).project_id
                        )
                        if project_id:
                            properties[
                                "$sentry_url"
                            ] = f"{AnalyticKitIntegration.prefix}{AnalyticKitIntegration.organization}/issues/?project={project_id}&query={event['event_id']}"

                    analytickit.capture(analytickit_distinct_id, "$exception", properties)

            return event
