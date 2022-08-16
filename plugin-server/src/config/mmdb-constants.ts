exportconstMMDB_ENDPOINT = 'https://mmdbcdn.analytickit.net/'
exportconstMMDB_ATTACHMENT_KEY = '@analytickit/mmdb'
exportconstMMDB_STALE_AGE_DAYS = 45
exportconstMMDB_STATUS_REDIS_KEY = '@analytickit-plugin-server/mmdb-status'
exportconstMMDB_INTERNAL_SERVER_TIMEOUT_SECONDS = 10

exportenumMMDBRequestStatus {
    TimedOut = 'Internal MMDB server connection timed out!',
    ServiceUnavailable = 'IP location capabilities are not available in this analytickit instance!',
    OK = 'OK',
}
