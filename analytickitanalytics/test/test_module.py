import unittest

import analytickit


class TestModule(unittest.TestCase):
    def failed(self):
        self.failed = True

    def setUp(self):
        self.failed = False
        analytickit.api_key = "testsecret"
        analytickit.on_error = self.failed

    def test_no_api_key(self):
        analytickit.api_key = None
        self.assertRaises(Exception, analytickit.capture)

    def test_no_host(self):
        analytickit.host = None
        self.assertRaises(Exception, analytickit.capture)

    def test_track(self):
        analytickit.capture("distinct_id", "python module event")
        analytickit.flush()

    def test_identify(self):
        analytickit.identify("distinct_id", {"email": "user@email.com"})
        analytickit.flush()

    def test_alias(self):
        analytickit.alias("previousId", "distinct_id")
        analytickit.flush()

    def test_page(self):
        analytickit.page("distinct_id", "https://analytickit.com/contact")
        analytickit.flush()

    def test_flush(self):
        analytickit.flush()
