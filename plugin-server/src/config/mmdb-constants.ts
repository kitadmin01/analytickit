export const MMDB_ENDPOINT = 'https://analytickit.s3.amazonaws.com/GeoLite2-City.mmdb'
export const MMDB_ATTACHMENT_KEY = '@analytickit/mmdb'
export const MMDB_STALE_AGE_DAYS = 45
export const MMDB_STATUS_REDIS_KEY = '@analytickit-plugin-server/mmdb-status'
export const MMDB_INTERNAL_SERVER_TIMEOUT_SECONDS = 10
export enum MMDBRequestStatus {
    TimedOut = 'Internal MMDB server connection timed out!',
    ServiceUnavailable = 'IP location capabilities are not available in this analytickit instance!',
    OK = 'OK',
}
