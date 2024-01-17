import React, { MutableRefObject, useEffect, useRef } from 'react'
import { Handler, viewportResizeDimension } from 'rrweb/typings/types'
import { useActions, useValues } from 'kea'
import { sessionRecordingPlayerLogic } from 'scenes/session-recordings/player/sessionRecordingPlayerLogic'
import { SessionPlayerState } from '~/types'
import { IconPlay } from 'scenes/session-recordings/player/icons'

export const PlayerFrame = React.forwardRef<HTMLDivElement>(function PlayerFrameInner(_, ref): JSX.Element {
    const replayDimensionRef = useRef<viewportResizeDimension>()
    const { currentPlayerState, player } = useValues(sessionRecordingPlayerLogic)
    const { togglePlayPause, setScale } = useActions(sessionRecordingPlayerLogic)
    const frameRef = ref as MutableRefObject<HTMLDivElement>

    useEffect(() => {
        if (!player) {
            return
        }

        player.replayer.on('resize', updatePlayerDimensions as Handler)
        window.addEventListener('resize', windowResize)

        return () => window.removeEventListener('resize', windowResize)
    }, [player?.replayer])

    const windowResize = (): void => {
        updatePlayerDimensions(replayDimensionRef.current)
    }

    const updatePlayerDimensions = (replayDimensions: viewportResizeDimension | undefined): void => {
        if (!replayDimensions || !frameRef?.current?.parentElement || !player?.replayer) {
            return
        }
    
        replayDimensionRef.current = replayDimensions
        const { width, height } = frameRef.current.parentElement.getBoundingClientRect()
    
        const scale = Math.min(width / replayDimensions.width, height / replayDimensions.height, 1)
        const translateY = -(height * 0.8); // Calculate the translation distance
    
        player.replayer.wrapper.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        player.replayer.wrapper.style.transformOrigin = 'top left';
        frameRef.current.style.position = 'relative';
        frameRef.current.style.overflow = 'hidden';
        frameRef.current.style.width = `${replayDimensions.width}px`;
        frameRef.current.style.height = `${replayDimensions.height}px`;
    
        setScale(scale)
    }
    
    
    const renderPlayerState = (): JSX.Element | null => {
        if (currentPlayerState === SessionPlayerState.BUFFER) {
            return <div className="rrweb-overlay">Buffering...</div>
        }
        if (currentPlayerState === SessionPlayerState.PAUSE) {
            return (
                <div className="rrweb-overlay">
                    <IconPlay className="rrweb-overlay-play-icon" />
                </div>
            )
        }
        if (currentPlayerState === SessionPlayerState.SKIP) {
            return <div className="rrweb-overlay">Skipping inactivity</div>
        }
        return null
    }

    return (
        <div className="rrweb-player" ref={ref} onClick={togglePlayPause}>
            <div className="replayer-wrapper">
                {/* Browser content goes here */}
            </div>
            <div className="rrweb-overlay-container">
                {renderPlayerState()}
            </div>
        </div>
    )
})
