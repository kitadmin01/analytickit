import{GeoIPExtension}from'@analytickit/plugin-scaffold'

import {Hub }from '../../../types'
import {fetchIpLocationInternally}from '../../mmdb'

export function createGeoIp(server: Hub): GeoIPExtension {
    return {
        locate: async function (ipAddress) {
            return await fetchIpLocationInternally(ipAddress, server)
        },
    }
}
