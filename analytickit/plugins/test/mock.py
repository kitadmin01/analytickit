import base64
import json
from typing import cast

# This method will be used by the mock to replace requests.get
from analytickit.plugins.utils import get_file_from_zip_archive, put_json_into_zip_archive

from .plugin_archives import (
    HELLO_WORLD_PLUGIN_GITHUB_ATTACHMENT_ZIP,
    HELLO_WORLD_PLUGIN_GITHUB_ZIP,
    HELLO_WORLD_PLUGIN_GITLAB_ZIP,
    HELLO_WORLD_PLUGIN_NPM_TGZ,
    HELLO_WORLD_PLUGIN_SECRET_GITHUB_ZIP,
)


def mocked_plugin_requests_get(*args, **kwargs):
    class MockJSONResponse:
        def __init__(self, json_data, status_code):
            self.json_data = json_data
            self.status_code = status_code

        def json(self):
            return self.json_data

        def ok(self):
            return self.status_code < 300

    class MockTextResponse:
        def __init__(self, text, status_code):
            self.text = text
            self.status_code = status_code

        def ok(self):
            return self.status_code < 300

    class MockBase64Response:
        def __init__(self, base64_data, status_code):
            self.content = base64.b64decode(base64_data)
            self.status_code = status_code

        def ok(self):
            return self.status_code < 300

    if args[0] == "https://api.github.com/repos/analytickit/analytickit/commits":
        return MockJSONResponse(
            [
                {
                    "sha": "MOCKLATESTCOMMIT",
                    "html_url": "https://www.github.com/analytickit/analytickit/commit/MOCKLATESTCOMMIT",
                }
            ],
            200,
        )

    if args[0] == "https://github.com/kitadmin01/analytickit-hello-world-plugin/commits":
        return MockJSONResponse(
            [
                {
                    "sha": HELLO_WORLD_PLUGIN_GITHUB_ZIP[0],
                    "html_url": "https://github.com/kitadmin01/analytickit-hello-world-plugin/commit/{}".format(
                        HELLO_WORLD_PLUGIN_GITHUB_ZIP[0]
                    ),
                }
            ],
            200,
        )

    if args[0].startswith("https://gitlab.com/api/v4/projects/mariusandra%2Fhelloworldplugin/repository/commits"):
        return MockJSONResponse(
            [
                {
                    "id": "ff78cbe1d70316055c610a962a8355a4616d874b",
                    "web_url": "https://gitlab.com/mariusandra/helloworldplugin/-/commit/ff78cbe1d70316055c610a962a8355a4616d874b",
                }
            ],
            200,
        )

    if args[0].startswith("https://gitlab.com/api/v4/projects/mariusandra%2Fhelloworldplugin-other/repository/commits"):
        return MockJSONResponse(
            [
                {
                    "id": "ff78cbe1d70316055c610a962a8355a4616d874b",
                    "web_url": "https://gitlab.com/mariusandra/helloworldplugin-other/-/commit/ff78cbe1d70316055c610a962a8355a4616d874b",
                }
            ],
            200,
        )

    if args[0] == "https://registry.npmjs.org/analytickit-helloworld-plugin/latest":
        return MockJSONResponse({"pkg": "analytickit-helloworld-plugin", "version": "MOCK"}, 200)

    if args[0] == "https://registry.npmjs.org/@analytickit/helloworldplugin/latest":
        return MockJSONResponse({"pkg": "@analytickit/helloworldplugin", "version": "MOCK"}, 200)

    if args[0] == "https://github.com/analytickit/helloworldplugin/archive/{}.zip".format(
        HELLO_WORLD_PLUGIN_GITHUB_ZIP[0]
    ):
        return MockBase64Response(HELLO_WORLD_PLUGIN_GITHUB_ZIP[1], 200)

    if args[0] == "https://github.com/analytickit/helloworldplugin/archive/{}.zip".format(
        HELLO_WORLD_PLUGIN_GITHUB_ATTACHMENT_ZIP[0]
    ):
        return MockBase64Response(HELLO_WORLD_PLUGIN_GITHUB_ATTACHMENT_ZIP[1], 200)

    if args[0] == "https://github.com/analytickit/helloworldplugin/archive/{}.zip".format(
        HELLO_WORLD_PLUGIN_SECRET_GITHUB_ZIP[0]
    ):
        return MockBase64Response(HELLO_WORLD_PLUGIN_SECRET_GITHUB_ZIP[1], 200)

    # https://github.com/analytickit-plugin/version-equals/commit/{vesrion}
    # https://github.com/analytickit-plugin/version-greater-than/commit/{vesrion}
    # https://github.com/analytickit-plugin/version-less-than/commit/{vesrion}
    if args[0].startswith(f"https://github.com/analytickit-plugin/version-"):
        url_repo = args[0].split("/")[4]
        url_version = args[0].split("/")[6].split(".zip")[0]

        archive = base64.b64decode(HELLO_WORLD_PLUGIN_GITHUB_ZIP[1])
        plugin_json = cast(dict, get_file_from_zip_archive(archive, "plugin.json", json_parse=True))
        plugin_json["analytickitVersion"] = url_version

        if url_repo == "version-greater-than":
            plugin_json["analytickitVersion"] = f">= {plugin_json['analytickitVersion']}"

        if url_repo == "version-less-than":
            plugin_json["analytickitVersion"] = f"< {plugin_json['analytickitVersion']}"

        archive = put_json_into_zip_archive(archive, plugin_json, "plugin.json")
        return MockBase64Response(base64.b64encode(archive), 200)

    if args[0].startswith(
        "https://gitlab.com/api/v4/projects/mariusandra%2Fhelloworldplugin/repository/archive.zip?sha={}".format(
            HELLO_WORLD_PLUGIN_GITLAB_ZIP[0]
        )
    ) or args[0].startswith(
        "https://gitlab.com/api/v4/projects/mariusandra%2Fhelloworldplugin-other/repository/archive.zip?sha={}".format(
            HELLO_WORLD_PLUGIN_GITLAB_ZIP[0]
        )
    ):
        return MockBase64Response(HELLO_WORLD_PLUGIN_GITLAB_ZIP[1], 200)

    if args[0] == "https://registry.npmjs.org/@analytickit/helloworldplugin/-/helloworldplugin-0.0.0.tgz":
        return MockBase64Response(HELLO_WORLD_PLUGIN_NPM_TGZ[1], 200)

    if args[0] == "https://registry.npmjs.org/analytickit-helloworld-plugin/-/analytickit-helloworld-plugin-0.0.0.tgz":
        return MockBase64Response(HELLO_WORLD_PLUGIN_NPM_TGZ[1], 200)

    if args[0] == "https://raw.githubusercontent.com/analytickit/integrations-repository/main/plugins.json":
        return MockTextResponse(
            json.dumps(
                [
                    {
                        "name": "analytickit-currency-normalization-plugin",
                        "url": "https://github.com/analytickit/analytickit-currency-normalization-plugin",
                        "description": "Normalise monerary values into a base currency",
                        "verified": False,
                        "maintainer": "official",
                    },
                    {
                        "name": "helloworldplugin",
                        "url": "https://github.com/analytickit/helloworldplugin",
                        "description": "Greet the World and Foo a Bar",
                        "verified": True,
                        "maintainer": "community",
                    },
                ]
            ),
            200,
        )

    return MockJSONResponse(None, 404)
