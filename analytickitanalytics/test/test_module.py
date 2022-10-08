import unittest

import analytickitanalytics


class TestModule(unittest.TestCase):
    def failed(self):
        self.failed = True

    def setUp(self):
        self.failed = False
        analytickitanalytics.api_key = "testsecret"
        analytickitanalytics.on_error = self.failed

    def test_no_api_key(self):
        analytickitanalytics.api_key = None
        self.assertRaises(Exception, analytickitanalytics.capture)

    def test_no_host(self):
        analytickitanalytics.host = None
        self.assertRaises(Exception, analytickitanalytics.capture)

    def test_track(self):
        analytickitanalytics.capture("distinct_id", "python module event")
        analytickitanalytics.flush()

    def test_identify(self):
        analytickitanalytics.identify("distinct_id", {"email": "user@email.com"})
        analytickitanalytics.flush()

    def test_alias(self):
        analytickitanalytics.alias("previousId", "distinct_id")
        analytickitanalytics.flush()

    def test_page(self):
        analytickitanalytics.page("distinct_id", "https://analytickit.com/contact")
        analytickitanalytics.flush()

    def test_flush(self):
        analytickitanalytics.flush()
