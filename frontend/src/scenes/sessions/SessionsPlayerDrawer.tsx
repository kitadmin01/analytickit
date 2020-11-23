import React from 'react'
import { Drawer } from 'antd'
import { useActions, useValues } from 'kea'
import { Loading } from 'lib/utils'
import { sessionsTableLogic } from 'scenes/sessions/sessionsTableLogic'
import { Player } from 'posthog-react-rrweb-player'

import 'posthog-react-rrweb-player/dist/index.css'

export default function SessionsPlayerDrawer(): JSX.Element {
    const { sessionPlayerData, sessionPlayerDataLoading, sessionRecordingNavigation: nav } = useValues(
        sessionsTableLogic
    )
    const { loadSessionPlayer, closeSessionPlayer } = useActions(sessionsTableLogic)

    return (
        <Drawer
            title="Session recording"
            width={window.innerWidth - 300}
            onClose={closeSessionPlayer}
            destroyOnClose={true}
            visible={true}
        >
            <div className="ph-no-capture" style={{ height: '90%' }}>
                {sessionPlayerDataLoading ? (
                    <Loading />
                ) : (
                    <Player
                        events={sessionPlayerData}
                        onPrevious={nav.prev ? () => loadSessionPlayer(nav.prev!) : undefined}
                        onNext={nav.next ? () => loadSessionPlayer(nav.next!) : undefined}
                    />
                )}
            </div>
        </Drawer>
    )
}
