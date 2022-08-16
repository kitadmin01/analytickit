import{kea, path, actions, listeners}from 'kea'
import type {inAppPromptEventCaptureLogicType}from './inAppPromptEventCaptureLogicType'
import analytickit from 'analytickit-js'
import {PromptType}from './inAppPromptLogic'

const inAppPromptEventCaptureLogic = kea<inAppPromptEventCaptureLogicType>([
path(['lib', 'logic', 'inAppPrompt', 'eventCapture']),
    actions({
        reportPromptShown: (type: PromptType, sequence: string, step: number, totalSteps: number) => ({
            type,
            sequence,
            step,
            totalSteps,
        }),
        reportPromptForward: (sequence: string, step: number, totalSteps: number) => ({ sequence, step, totalSteps }),
        reportPromptBackward: (sequence: string, step: number, totalSteps: number) => ({ sequence, step, totalSteps }),
        reportPromptSequenceDismissed: (sequence: string, step: number, totalSteps: number) => ({
            sequence,
            step,
            totalSteps,
        }),
        reportPromptSequenceCompleted: (sequence: string, step: number, totalSteps: number) => ({
            sequence,
            step,
            totalSteps,
        }),
        reportTutorialSkipped: true,
    }),
    listeners({
        reportPromptShown: ({ type, sequence, step, totalSteps }) => {
            analytickit.capture('prompt shown', {
                type,
                sequence,
                step,
                totalSteps,
            })
        },
        reportPromptForward: ({ sequence, step, totalSteps }) => {
            analytickit.capture('prompt forward', {
                sequence,
                step,
                totalSteps,
            })
        },
        reportPromptBackward: ({ sequence, step, totalSteps }) => {
            analytickit.capture('prompt backward', {
                sequence,
                step,
                totalSteps,
            })
        },
        reportPromptSequenceDismissed: ({ sequence, step, totalSteps }) => {
            analytickit.capture('prompt sequence dismissed', {
                sequence,
                step,
                totalSteps,
            })
        },
        reportPromptSequenceCompleted: ({ sequence, step, totalSteps }) => {
            analytickit.capture('prompt sequence completed', {
                sequence,
                step,
                totalSteps,
            })
        },
        reportTutorialSkipped: () => {
            analytickit.capture('tutorial skipped')
        },
    }),
])

export { inAppPromptEventCaptureLogic }
