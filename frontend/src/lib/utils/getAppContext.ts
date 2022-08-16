import{AppContext, PathType}from '~/types'

declare global {
export interface Window {
analytickit_APP_CONTEXT?: AppContext
}
}

export function getAppContext(): AppContext | undefined {
    return window.analytickit_APP_CONTEXT || undefined
}

export function getDefaultEventName(): string {
    return getAppContext()?.default_event_name || PathType.PageView
}
