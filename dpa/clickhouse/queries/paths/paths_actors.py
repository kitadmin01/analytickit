from analytickit.queries.paths.paths_actors import PathsActors
from dpa.clickhouse.queries.paths.paths import ClickhousePaths


class ClickhousePathsActors(PathsActors, ClickhousePaths):  # type: ignore
    pass
