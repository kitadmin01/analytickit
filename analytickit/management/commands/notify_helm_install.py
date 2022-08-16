import os
from pprint import pprint

import analytickitanalytics
from django.conf import settings
from django.core.management.base import BaseCommand

from analytickit.tasks.status_report import get_helm_info_env
from analytickit.utils import get_machine_id
from analytickit.version import VERSION


class Command(BaseCommand):
    help = "Notify that helm install/upgrade has happened"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", type=bool, help="Print information instead of sending it")

    def handle(self, *args, **options):
        report = get_helm_info_env()
        report["analytickit_version"] = VERSION
        report["deployment"] = os.getenv("DEPLOYMENT", "unknown")

        print(f"Report for {get_machine_id()}:")
        pprint(report)

        if not options["dry_run"]:
            analytickitanalytics.api_key = "sTMFPsFhdP1Ssg"
            disabled = analytickitanalytics.disabled
            analytickitanalytics.disabled = False
            analytickitanalytics.capture(get_machine_id(), "helm_install", report,
                                         groups={"instance": settings.SITE_URL})
            analytickitanalytics.disabled = disabled
