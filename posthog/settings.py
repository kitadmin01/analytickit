"""
Django settings for posthog project.

Generated by 'django-admin startproject' using Django 2.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import ast
import os
import shutil
import sys
from distutils.util import strtobool
from typing import Dict, List, Optional, Sequence

import dj_database_url
import sentry_sdk
from django.core.exceptions import ImproperlyConfigured
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration


def get_env(key):
    try:
        return os.environ[key]
    except KeyError:
        raise ImproperlyConfigured(f'The environment var "{key}" is absolutely required to run this software')


def get_list(text: str) -> List[str]:
    if not text:
        return []
    return [item.strip() for item in text.split(",")]


def get_bool_from_env(name: str, default_value: bool) -> bool:
    if name in os.environ:
        value = os.environ[name]
        try:
            return bool(strtobool(str(value)))
        except ValueError as e:
            raise ValueError(f"{value} is an invalid value for {name}, expected boolean") from e
    return default_value


def print_warning(warning_lines: Sequence[str]):
    highlight_length = min(max(map(len, warning_lines)) // 2, shutil.get_terminal_size().columns)
    print("\n".join(("", "🔻" * highlight_length, *warning_lines, "🔺" * highlight_length, "",)))


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DEBUG = get_bool_from_env("DEBUG", False)
TEST = "test" in sys.argv

SITE_URL = os.environ.get("SITE_URL", "http://localhost:8000")

if DEBUG:
    JS_URL = os.environ.get("JS_URL", "http://localhost:8234/")
else:
    JS_URL = os.environ.get("JS_URL", "")

# This is set as a cross-domain cookie with a random value.
# Its existence is used by the toolbar to see that we are logged in.
TOOLBAR_COOKIE_NAME = "phtoolbar"

# SSL & cookie defaults
if os.environ.get("SECURE_COOKIES", None) is None:
    # Default to True if in production
    secure_cookies = not DEBUG and not TEST
else:
    secure_cookies = get_bool_from_env("SECURE_COOKIES", True)

TOOLBAR_COOKIE_SECURE = secure_cookies
SESSION_COOKIE_SECURE = secure_cookies
CSRF_COOKIE_SECURE = secure_cookies
SECURE_SSL_REDIRECT = secure_cookies

if not TEST:
    if os.environ.get("SENTRY_DSN"):
        # https://docs.sentry.io/platforms/python/
        sentry_sdk.init(
            dsn=os.environ["SENTRY_DSN"],
            integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
            request_bodies="always",
        )

if get_bool_from_env("DISABLE_SECURE_SSL_REDIRECT", False):
    SECURE_SSL_REDIRECT = False

if get_bool_from_env("IS_BEHIND_PROXY", False):
    USE_X_FORWARDED_HOST = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

ASYNC_EVENT_ACTION_MAPPING = False

if get_bool_from_env("ASYNC_EVENT_ACTION_MAPPING", False):
    ASYNC_EVENT_ACTION_MAPPING = True


# Clickhouse Settings
CLICKHOUSE_TEST_DB = "posthog_test"

CLICKHOUSE_HOST = os.environ.get("CLICKHOUSE_HOST", "localhost")
CLICKHOUSE_USERNAME = os.environ.get("CLICKHOUSE_USERNAME", "default")
CLICKHOUSE_PASSWORD = os.environ.get("CLICKHOUSE_PASSWORD", "")
CLICKHOUSE_DATABASE = CLICKHOUSE_TEST_DB if TEST else os.environ.get("CLICKHOUSE_DATABASE", "default")
CLICKHOUSE_CA = os.environ.get("CLICKHOUSE_CA", None)
CLICKHOUSE_SECURE = get_bool_from_env("CLICKHOUSE_SECURE", not TEST and not DEBUG)
CLICKHOUSE_VERIFY = get_bool_from_env("CLICKHOUSE_VERIFY", True)
CLICKHOUSE_REPLICATION = get_bool_from_env("CLICKHOUSE_REPLICATION", False)
CLICKHOUSE_ENABLE_STORAGE_POLICY = get_bool_from_env("CLICKHOUSE_ENABLE_STORAGE_POLICY", False)
CLICKHOUSE_ASYNC = get_bool_from_env("CLICKHOUSE_ASYNC", False)

_clickhouse_http_protocol = "http://"
_clickhouse_http_port = "8123"
if CLICKHOUSE_SECURE:
    _clickhouse_http_protocol = "https://"
    _clickhouse_http_port = "8443"

CLICKHOUSE_HTTP_URL = _clickhouse_http_protocol + CLICKHOUSE_HOST + ":" + _clickhouse_http_port + "/"

POSTGRES = "postgres"
CLICKHOUSE = "clickhouse"

PRIMARY_DB = os.environ.get("PRIMARY_DB", POSTGRES)


# IP block settings
ALLOWED_IP_BLOCKS = get_list(os.environ.get("ALLOWED_IP_BLOCKS", ""))
TRUSTED_PROXIES = os.environ.get("TRUSTED_PROXIES", False)
TRUST_ALL_PROXIES = os.environ.get("TRUST_ALL_PROXIES", False)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

DEFAULT_SECRET_KEY = "<randomly generated secret key>"

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY", DEFAULT_SECRET_KEY)

ALLOWED_HOSTS = get_list(os.environ.get("ALLOWED_HOSTS", "*"))

# Metrics - StatsD
STATSD_HOST = os.environ.get("STATSD_HOST", None)
STATSD_PORT = os.environ.get("STATSD_PORT", 8125)
STATSD_PREFIX = os.environ.get("STATSD_PREFIX", None)

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "posthog.apps.PostHogConfig",
    "rest_framework",
    "loginas",
    "corsheaders",
    "social_django",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "posthog.middleware.AllowIP",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "posthog.middleware.ToolbarCookieMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "posthog.middleware.CsrfOrKeyViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
]

if STATSD_HOST:
    MIDDLEWARE.insert(0, "django_statsd.middleware.StatsdMiddleware")
    MIDDLEWARE.append("django_statsd.middleware.StatsdMiddlewareTimer")

EE_AVAILABLE = False

# Append Enterprise Edition as an app if available
try:
    from ee.apps import EnterpriseConfig
except ImportError:
    pass
else:
    HOOK_EVENTS: Dict[str, str] = {}
    INSTALLED_APPS.append("rest_hooks")
    INSTALLED_APPS.append("ee.apps.EnterpriseConfig")
    EE_AVAILABLE = True

# Use django-extensions if it exists
try:
    import django_extensions
except ImportError:
    pass
else:
    INSTALLED_APPS.append("django_extensions")

INTERNAL_IPS = ["127.0.0.1", "172.18.0.1"]  # Docker IP
CORS_ORIGIN_ALLOW_ALL = True

ROOT_URLCONF = "posthog.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": ["frontend/dist", "posthog/templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "posthog.wsgi.application"

# Social Auth

SOCIAL_AUTH_POSTGRES_JSONFIELD = True
SOCIAL_AUTH_USER_MODEL = "posthog.User"

AUTHENTICATION_BACKENDS = (
    "social_core.backends.github.GithubOAuth2",
    "social_core.backends.gitlab.GitLabOAuth2",
    "django.contrib.auth.backends.ModelBackend",
)

SOCIAL_AUTH_PIPELINE = (
    "social_core.pipeline.social_auth.social_details",
    "social_core.pipeline.social_auth.social_uid",
    "social_core.pipeline.social_auth.auth_allowed",
    "social_core.pipeline.social_auth.social_user",
    "social_core.pipeline.user.get_username",
    "social_core.pipeline.social_auth.associate_by_email",
    "posthog.urls.social_create_user",
    "social_core.pipeline.social_auth.associate_user",
    "social_core.pipeline.social_auth.load_extra_data",
    "social_core.pipeline.user.user_details",
)

SOCIAL_AUTH_STRATEGY = "social_django.strategy.DjangoStrategy"
SOCIAL_AUTH_STORAGE = "social_django.models.DjangoStorage"
SOCIAL_AUTH_FIELDS_STORED_IN_SESSION = [
    "signup_token",
]

SOCIAL_AUTH_GITHUB_SCOPE = ["user:email"]
SOCIAL_AUTH_GITHUB_KEY = os.environ.get("SOCIAL_AUTH_GITHUB_KEY", "")
SOCIAL_AUTH_GITHUB_SECRET = os.environ.get("SOCIAL_AUTH_GITHUB_SECRET", "")

SOCIAL_AUTH_GITLAB_SCOPE = ["read_user"]
SOCIAL_AUTH_GITLAB_KEY = os.environ.get("SOCIAL_AUTH_GITLAB_KEY", "")
SOCIAL_AUTH_GITLAB_SECRET = os.environ.get("SOCIAL_AUTH_GITLAB_SECRET", "")
SOCIAL_AUTH_GITLAB_API_URL = os.environ.get("SOCIAL_AUTH_GITLAB_API_URL", "https://gitlab.com")

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

if TEST or DEBUG:
    DATABASE_URL = os.environ.get("DATABASE_URL", "postgres://localhost:5432/posthog")
else:
    DATABASE_URL = os.environ.get("DATABASE_URL", "")

if DATABASE_URL:
    DATABASES = {"default": dj_database_url.config(default=DATABASE_URL, conn_max_age=600)}
elif os.environ.get("POSTHOG_DB_NAME"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": get_env("POSTHOG_DB_NAME"),
            "USER": os.environ.get("POSTHOG_DB_USER", "postgres"),
            "PASSWORD": os.environ.get("POSTHOG_DB_PASSWORD", ""),
            "HOST": os.environ.get("POSTHOG_POSTGRES_HOST", "localhost"),
            "PORT": os.environ.get("POSTHOG_POSTGRES_PORT", "5432"),
            "CONN_MAX_AGE": 0,
        }
    }
else:
    raise ImproperlyConfigured(
        f'The environment vars "DATABASE_URL" or "POSTHOG_DB_NAME" are absolutely required to run this software'
    )

# Broker

# The last case happens when someone upgrades Heroku but doesn't have Redis installed yet. Collectstatic gets called before we can provision Redis.
if TEST or DEBUG or (len(sys.argv) > 1 and sys.argv[1] == "collectstatic"):
    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost/")
else:
    REDIS_URL = os.environ.get("REDIS_URL", "")

if not REDIS_URL and os.environ.get("POSTHOG_REDIS_HOST", ""):
    REDIS_URL = "redis://:{}@{}:{}/".format(
        os.environ.get("POSTHOG_REDIS_PASSWORD", ""),
        os.environ.get("POSTHOG_REDIS_HOST", ""),
        os.environ.get("POSTHOG_REDIS_PORT", "6379"),
    )

if not REDIS_URL:
    raise ImproperlyConfigured(
        "Env var REDIS_URL or POSTHOG_REDIS_HOST is absolutely required to run this software.\n"
        "If upgrading from PostHog 1.0.10 or earlier, see here: "
        "https://posthog.com/docs/deployment/upgrading-posthog#upgrading-from-before-1011"
    )

CELERY_IMPORTS = ["posthog.tasks.webhooks"]  # required to avoid circular import
CELERY_BROKER_URL = REDIS_URL  # celery connects to redis
CELERY_BEAT_MAX_LOOP_INTERVAL = 30  # sleep max 30sec before checking for new periodic events
CELERY_RESULT_BACKEND = REDIS_URL  # stores results for lookup when processing
REDBEAT_LOCK_TIMEOUT = 45  # keep distributed beat lock for 45sec

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",},
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATIC_URL = "/static/"
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "frontend/dist"),
]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

AUTH_USER_MODEL = "posthog.User"

LOGIN_URL = "/login"
LOGOUT_URL = "/logout"
LOGIN_REDIRECT_URL = "/"
APPEND_SLASH = False
CORS_URLS_REGEX = r"^/api/.*$"

REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 100,
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated",],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "posthog.utils.PersonalAPIKeyAuthentication",
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
}

# Email
EMAIL_HOST = os.environ.get("EMAIL_HOST")
EMAIL_PORT = os.environ.get("EMAIL_PORT")
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = get_bool_from_env("EMAIL_USE_TLS", False)
EMAIL_USE_SSL = get_bool_from_env("EMAIL_USE_SSL", False)
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "tim@posthog.com")


# You can pass a comma deliminated list of domains with which users can sign up to this service
RESTRICT_SIGNUPS = get_bool_from_env("RESTRICT_SIGNUPS", False)

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
        "KEY_PREFIX": "posthog",
    }
}

if TEST:
    CACHES["default"] = {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }

if DEBUG and not TEST:
    print_warning(
        (
            "️Environment variable DEBUG is set - PostHog is running in DEVELOPMENT MODE!",
            "Be sure to unset DEBUG if this is supposed to be a PRODUCTION ENVIRONMENT!",
        )
    )

    # Load debug_toolbar if we can
    try:
        import debug_toolbar
    except ImportError:
        pass
    else:
        INSTALLED_APPS.append("debug_toolbar")
        MIDDLEWARE.append("debug_toolbar.middleware.DebugToolbarMiddleware")

if not DEBUG and not TEST and SECRET_KEY == DEFAULT_SECRET_KEY:
    print_warning(
        (
            "You are using the default SECRET_KEY in a production environment!",
            "For the safety of your instance, you must generate and set a unique key.",
            "More information on https://posthog.com/docs/deployment/securing-posthog#secret-key",
        )
    )
    sys.exit("[ERROR] Default SECRET_KEY in production. Stopping Django server…\n")


def show_toolbar(request):
    return request.path.startswith("/api/") or request.path.startswith("/decide/") or request.path.startswith("/e/")


DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": "posthog.settings.show_toolbar",
}

# Extend and override these settings with EE's ones
if "ee.apps.EnterpriseConfig" in INSTALLED_APPS:
    from ee.settings import *
