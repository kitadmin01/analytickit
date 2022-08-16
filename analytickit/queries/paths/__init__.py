from analytickit.settings import EE_AVAILABLE

if EE_AVAILABLE:
    from ee.clickhouse.queries.paths import ClickhousePaths as Paths
    from ee.clickhouse.queries.paths import ClickhousePathsActors as PathsActors
else:
    from analytickit.queries.paths.paths import Paths  # type: ignore
    from analytickit.queries.paths.paths_actors import PathsActors  # type: ignore
