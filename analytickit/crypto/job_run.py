"""
Created on Sep 05 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""

from analytickit.crypto.config import ConfigHolder 
from analytickit.crypto.s3_ret import S3Retriever
from analytickit.crypto.txn_anz import DBRetriever

if __name__ == '__main__':
    config = ConfigHolder("./config.ini")
    db = DBRetriever()
    s3 = S3Retriever()

    records_today = db.get_campaign_records_today(config)
    s3.process_campaign_records(records_today, config, 'aws-public-blockchain')
