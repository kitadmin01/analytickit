from analytickit.queries.session_recordings.session_recording import SessionRecording
from analytickit.queries.session_recordings.test.test_session_recording import factory_session_recording_test
from analytickit.test.base import ClickhouseTestMixin


class TestClickhouseSessionRecording(ClickhouseTestMixin,
                                     factory_session_recording_test(SessionRecording)):  # type: ignore
    pass
