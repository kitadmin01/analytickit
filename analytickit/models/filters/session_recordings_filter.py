from analytickit.models import Filter
from analytickit.models.filters.mixins.session_recordings import PersonUUIDMixin, SessionRecordingsMixin


class SessionRecordingsFilter(SessionRecordingsMixin, PersonUUIDMixin, Filter):
    pass
