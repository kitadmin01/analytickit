"""
Created on Aug 26 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""


# conftest.py
import pytest
from analytickit.crypto.txn_anz import TxnAnalyzer
from analytickit.crypto.config import ConfigHolder

@pytest.fixture
def config():
    return ConfigHolder("./analytickit/crypto/config.ini")

@pytest.fixture
def txn_analyzer(config):
    return TxnAnalyzer(config)
