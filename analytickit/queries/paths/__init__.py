from analytickit.settings import EE_AVAILABLE

if EE_AVAILABLE:
    from dpa.clickhouse.queries.paths import ClickhousePaths as Paths
    from dpa.clickhouse.queries.paths import ClickhousePathsActors as PathsActors
else:
    from analytickit.queries.paths.paths import Paths  # type: ignore
    from analytickit.queries.paths.paths_actors import PathsActors  # type: ignore
