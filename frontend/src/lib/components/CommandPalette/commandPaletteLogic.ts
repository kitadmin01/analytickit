import React from 'react'
import { kea } from 'kea'
import { router } from 'kea-router'
import type { commandPaletteLogicType } from './commandPaletteLogicType'
import { systemStatusLogic } from 'scenes/instance/SystemStatus/systemStatusLogic'
import { preflightLogic } from 'scenes/PreflightCheck/preflightLogic'

export interface CommandResult {
    icon: React.ComponentType<any>
    display: string
    synonyms?: string[]
    executor?: () => void
}

export const commandPaletteLogic = kea<commandPaletteLogicType>({
    path: ['lib', 'components', 'CommandPalette', 'commandPaletteLogic'],

    connect: {
        values: [systemStatusLogic, ['systemStatus'], preflightLogic, ['preflight']],
    },

    actions: {
        setCommandPaletteShown: (shown: boolean) => ({ shown }),
        registerCommand: (command: CommandResult) => ({ command }),
        deregisterCommand: (command: CommandResult) => ({ command }),
    },

    reducers: {
        isVisible: [
            false,
            {
                setCommandPaletteShown: (_, { shown }) => shown,
            },
        ],
        commandRegistrations: [
            [] as CommandResult[],
            {
                registerCommand: (state, { command }) => [...state, command],
                deregisterCommand: (state, { command }) => state.filter((c) => c !== command),
            },
        ],
    },
})
