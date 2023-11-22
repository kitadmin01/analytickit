import {teamLogic} from'../../scenes/teamLogic'
import {TeamType} from '../../types'
import {getAppContext} from './getAppContext'

export function getCurrentTeamId(providedMaybeTeamId?: TeamType['id'] | null): TeamType['id'] {
    const maybeTeamId = providedMaybeTeamId !== undefined ? providedMaybeTeamId : teamLogic.values.currentTeamId
    if (!maybeTeamId) {
        throw new Error(`Campaign ID is not known.${getAppContext()?.anonymous ? ' User is anonymous.' : ''}`)
    }
    return maybeTeamId
}
