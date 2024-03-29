import {
    Hub,
    Plugin,
    PluginAttachmentDB,
    PluginCapabilities,
    PluginConfig,
    PluginConfigId,
    PluginError,
    PluginLogEntrySource,
    PluginLogEntryType,
} from '../../types'

function pluginConfigsInForceQuery(specificField?: keyof PluginConfig): string {
    const fields = specificField
        ? `analytickit_pluginconfig.${specificField}`
        : `
        analytickit_pluginconfig.id,
        analytickit_pluginconfig.team_id,
        analytickit_pluginconfig.plugin_id,
        analytickit_pluginconfig.enabled,
        analytickit_pluginconfig.order,
        analytickit_pluginconfig.config,
        analytickit_pluginconfig.updated_at,
        analytickit_pluginconfig.created_at,
        analytickit_pluginconfig.error IS NOT NULL AS has_error
    `

    return `SELECT ${fields}
       FROM analytickit_pluginconfig
       LEFT JOIN analytickit_team ON analytickit_team.id = analytickit_pluginconfig.team_id
       LEFT JOIN analytickit_organization ON analytickit_organization.id = analytickit_team.organization_id
       LEFT JOIN analytickit_plugin ON analytickit_plugin.id = analytickit_pluginconfig.plugin_id
       WHERE (
           analytickit_pluginconfig.enabled='t' AND analytickit_organization.plugins_access_level > 0
           AND (analytickit_plugin.organization_id = analytickit_organization.id OR analytickit_plugin.is_global)
       )`
}

export async function getPluginRows(hub: Hub): Promise<Plugin[]> {
    const { rows }: { rows: Plugin[] } = await hub.db.postgresQuery(
        // `analytickit_plugin` columns have to be listed individually, as we want to exclude a few columns
        // and Postgres syntax unfortunately doesn't have a column exclusion feature. The excluded columns are:
        // - archive - this is a potentially large blob, only extracted in Django as a plugin server optimization
        // - latest_tag - not used in this service
        // - latest_tag_checked_at - not used in this service
        `SELECT
            analytickit_plugin.id,
            analytickit_plugin.name,
            analytickit_plugin.url,
            analytickit_plugin.tag,
            analytickit_plugin.from_json,
            analytickit_plugin.from_web,
            analytickit_plugin.error,
            analytickit_plugin.plugin_type,
            analytickit_plugin.organization_id,
            analytickit_plugin.is_global,
            analytickit_plugin.capabilities,
            analytickit_plugin.public_jobs,
            analytickit_plugin.is_stateless,
            analytickit_plugin.log_level,
            psf__plugin_json.source as source__plugin_json,
            psf__index_ts.source as source__index_ts,
            psf__frontend_tsx.source as source__frontend_tsx
        FROM analytickit_plugin
        LEFT JOIN analytickit_pluginsourcefile psf__plugin_json
            ON (psf__plugin_json.plugin_id = analytickit_plugin.id AND psf__plugin_json.filename = 'plugin.json')
        LEFT JOIN analytickit_pluginsourcefile psf__index_ts
            ON (psf__index_ts.plugin_id = analytickit_plugin.id AND psf__index_ts.filename = 'index.ts')
        LEFT JOIN analytickit_pluginsourcefile psf__frontend_tsx
            ON (psf__frontend_tsx.plugin_id = analytickit_plugin.id AND psf__frontend_tsx.filename = 'frontend.tsx')
        WHERE analytickit_plugin.id IN (${pluginConfigsInForceQuery('plugin_id')}
        GROUP BY analytickit_pluginconfig.plugin_id)`,
        undefined,
        'getPluginRows'
    )

    return rows
}

export async function getPluginAttachmentRows(hub: Hub): Promise<PluginAttachmentDB[]> {
    const { rows }: { rows: PluginAttachmentDB[] } = await hub.db.postgresQuery(
        `SELECT analytickit_pluginattachment.* FROM analytickit_pluginattachment
            WHERE plugin_config_id IN (${pluginConfigsInForceQuery('id')})`,
        undefined,
        'getPluginAttachmentRows'
    )
    return rows
}

export async function getPluginConfigRows(hub: Hub): Promise<PluginConfig[]> {
    const { rows }: { rows: PluginConfig[] } = await hub.db.postgresQuery(
        pluginConfigsInForceQuery(),
        undefined,
        'getPluginConfigRows'
    )
    return rows
}

export async function setPluginCapabilities(
    hub: Hub,
    pluginConfig: PluginConfig,
    capabilities: PluginCapabilities
): Promise<void> {
    await hub.db.postgresQuery(
        'UPDATE analytickit_plugin SET capabilities = ($1) WHERE id = $2',
        [capabilities, pluginConfig.plugin_id],
        'setPluginCapabilities'
    )
}

export async function setError(hub: Hub, pluginError: PluginError | null, pluginConfig: PluginConfig): Promise<void> {
    await hub.db.postgresQuery(
        'UPDATE analytickit_pluginconfig SET error = $1 WHERE id = $2',
        [pluginError, typeof pluginConfig === 'object' ? pluginConfig?.id : pluginConfig],
        'updatePluginConfigError'
    )
    if (pluginError) {
        await hub.db.queuePluginLogEntry({
            pluginConfig,
            source: PluginLogEntrySource.Plugin,
            type: PluginLogEntryType.Error,
            message: pluginError.stack ?? pluginError.message,
            instanceId: hub.instanceId,
            timestamp: pluginError.time,
        })
    }
}

export async function disablePlugin(hub: Hub, pluginConfigId: PluginConfigId): Promise<void> {
    await hub.db.postgresQuery(
        `UPDATE analytickit_pluginconfig SET enabled='f' WHERE id=$1 AND enabled='t'`,
        [pluginConfigId],
        'disablePlugin'
    )
    await hub.db.redisPublish(hub.PLUGINS_RELOAD_PUBSUB_CHANNEL, 'reload!')
}
