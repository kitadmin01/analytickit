import * as contrib from '@analytickit/plugin-contrib'
import * as scaffold from '@analytickit/plugin-scaffold'
import * as bigquery from '@google-cloud/bigquery'
import * as pubsub from '@google-cloud/pubsub'
import * as gcs from '@google-cloud/storage'
import * as AWS from 'aws-sdk'
import crypto from 'crypto'
import * as ethers from 'ethers'
import * as faker from 'faker'
import * as genericPool from 'generic-pool'
import * as jsonwebtoken from 'jsonwebtoken'
import * as pg from 'pg'
import snowflake from 'snowflake-sdk'
import { PassThrough } from 'stream'
import * as url from 'url'
import * as zlib from 'zlib'

import fetch from '../../utils/fetch'
import { writeToFile } from './extensions/test-utils'

export const imports = {
    ...(process.env.NODE_ENV === 'test'
        ? {
            'test-utils/write-to-file': writeToFile,
        }
        : {

        }),
    '@google-cloud/bigquery': bigquery,
    '@google-cloud/pubsub': pubsub,
    '@google-cloud/storage': gcs,
    '@analytickit/plugin-contrib': contrib,
    '@analytickit/plugin-scaffold': scaffold,
    'aws-sdk': AWS,
    ethers: ethers,
    'generic-pool': genericPool,
    'node-fetch': fetch,
    'snowflake-sdk': snowflake,
    crypto: crypto,
    jsonwebtoken: jsonwebtoken,
    faker: faker,
    pg: pg,
    stream: { PassThrough },
    url: url,
    zlib: zlib,
}
