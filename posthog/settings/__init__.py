"""
Django settings for posthog project.

Generated by 'django-admin startproject' using Django 2.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""
# isort: skip_file

import os
from typing import Dict, List

# :TRICKY: Imported before anything else to support overloads
from posthog.settings.overrides import *

from posthog.settings.ee import EE_AVAILABLE
from posthog.settings.base_variables import *

from posthog.settings.access import *
from posthog.settings.async_migrations import *
from posthog.settings.celery import *
from posthog.settings.data_stores import *
from posthog.settings.dynamic_settings import *
from posthog.settings.emails import *
from posthog.settings.feature_flags import *
from posthog.settings.logging import *
from posthog.settings.sentry import *
from posthog.settings.shell_plus import *
from posthog.settings.service_requirements import *
from posthog.settings.statsd import *

from posthog.settings.web import *

from posthog.settings.utils import get_from_env, get_list, str_to_bool

USE_PRECALCULATED_CH_COHORT_PEOPLE = not TEST
CALCULATE_X_COHORTS_PARALLEL = get_from_env("CALCULATE_X_COHORTS_PARALLEL", 2, type_cast=int)

# Instance configuration preferences
# https://posthog.com/docs/self-host/configure/environment-variables
SELF_CAPTURE = get_from_env("SELF_CAPTURE", DEBUG, type_cast=str_to_bool)
debug_queries = get_from_env("DEBUG_QUERIES", False, type_cast=str_to_bool)
disable_paid_fs = get_from_env("DISABLE_PAID_FEATURE_SHOWCASING", False, type_cast=str_to_bool)
INSTANCE_PREFERENCES = {
    "debug_queries": debug_queries,
    "disable_paid_fs": disable_paid_fs,
}

SITE_URL: str = os.getenv("SITE_URL", "http://localhost:8000").rstrip("/")

if DEBUG:
    JS_URL = os.getenv("JS_URL", "http://localhost:8234/")
else:
    JS_URL = os.getenv("JS_URL", "")

DISABLE_MMDB = get_from_env(
    "DISABLE_MMDB", TEST, type_cast=str_to_bool
)  # plugin server setting disabling GeoIP feature
PLUGINS_PREINSTALLED_URLS: List[str] = os.getenv(
    "PLUGINS_PREINSTALLED_URLS", "https://github.com/PostHog/posthog-plugin-geoip"
).split(",") if not DISABLE_MMDB else []
PLUGINS_CELERY_QUEUE = os.getenv("PLUGINS_CELERY_QUEUE", "posthog-plugins")
PLUGINS_RELOAD_PUBSUB_CHANNEL = os.getenv("PLUGINS_RELOAD_PUBSUB_CHANNEL", "reload-plugins")

# Tokens used when installing plugins, for example to get the latest commit SHA or to download private repositories.
# Used mainly to get around API limits and only if no ?private_token=TOKEN found in the plugin URL.
GITLAB_TOKEN = os.getenv("GITLAB_TOKEN", None)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", None)
NPM_TOKEN = os.getenv("NPM_TOKEN", None)

ACTION_EVENT_MAPPING_INTERVAL_SECONDS = get_from_env("ACTION_EVENT_MAPPING_INTERVAL_SECONDS", 300, type_cast=int)

ASYNC_EVENT_PROPERTY_USAGE = get_from_env("ASYNC_EVENT_PROPERTY_USAGE", False, type_cast=str_to_bool)
EVENT_PROPERTY_USAGE_INTERVAL_SECONDS = get_from_env(
    "ASYNC_EVENT_PROPERTY_USAGE_INTERVAL_SECONDS", 60 * 60, type_cast=int
)

UPDATE_CACHED_DASHBOARD_ITEMS_INTERVAL_SECONDS = get_from_env(
    "UPDATE_CACHED_DASHBOARD_ITEMS_INTERVAL_SECONDS", 90, type_cast=int
)


# Whether to capture internal metrics
CAPTURE_INTERNAL_METRICS = get_from_env("CAPTURE_INTERNAL_METRICS", False, type_cast=str_to_bool)

if EE_AVAILABLE:
    HOOK_EVENTS: Dict[str, str] = {}


# Support creating multiple organizations in a single instance. Requires a premium license.
MULTI_ORG_ENABLED = get_from_env("MULTI_ORG_ENABLED", False, type_cast=str_to_bool)

# Overriden by posthog-cloud
MULTI_TENANCY = False

# Whether this is a managed demo environment
DEMO = get_from_env("DEMO", False, type_cast=str_to_bool)

CACHED_RESULTS_TTL = 7 * 24 * 60 * 60  # how long to keep cached results for
TEMP_CACHE_RESULTS_TTL = 24 * 60 * 60  # how long to keep non dashboard cached results for
SESSION_RECORDING_TTL = 30  # how long to keep session recording cache. Relatively short because cached result is used throughout the duration a session recording loads.

AUTO_LOGIN = get_from_env("AUTO_LOGIN", False, type_cast=str_to_bool)

# Keep in sync with plugin-server
EVENTS_DEAD_LETTER_QUEUE_STATSD_METRIC = "events_added_to_dead_letter_queue"


# Extend and override these settings with EE's ones
if "ee.apps.EnterpriseConfig" in INSTALLED_APPS:
    from ee.settings import *  # noqa: F401, F403

# Lastly, cloud settings override and modify all
from posthog.settings.cloud import *
