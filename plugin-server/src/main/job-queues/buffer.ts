importPiscinafrom'@analytickit/piscina'
import {PluginEvent} from '@analytickit/plugin-scaffold'
import { Hub}from 'types'

export function runBufferEventPipeline(hub: Hub, piscina: Piscina, event: PluginEvent): Promise<void> {
    hub.lastActivity = new Date().valueOf()
    hub.lastActivityType = 'runBufferEventPipeline'
    return piscina.run({ task: 'runBufferEventPipeline', args: { event } })
}
