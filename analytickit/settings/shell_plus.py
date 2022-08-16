from analytickit.settings.utils import get_from_env, str_to_bool

# shell_plus settings
# https://django-extensions.readthedocs.io/en/latest/shell_plus.html

SHELL_PLUS_PRINT_SQL = get_from_env("PRINT_SQL", False, type_cast=str_to_bool)
SHELL_PLUS_POST_IMPORTS = [
    ("analytickit.models.filters", ("Filter",)),
    ("analytickit.models.property", ("Property",)),
]

SHELL_PLUS_POST_IMPORTS.append(("analytickit.client", ("sync_execute",)))
SHELL_PLUS_POST_IMPORTS.append(("infi.clickhouse_orm.utils", ("import_submodules",)))
