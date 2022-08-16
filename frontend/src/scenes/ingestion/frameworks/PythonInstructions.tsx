import React from 'react'
import { CodeSnippet, Language } from './CodeSnippet'
import { useValues } from 'kea'
import { teamLogic } from 'scenes/teamLogic'

function PythonInstallSnippet(): JSX.Element {
    return <CodeSnippet language={Language.Bash}>{'pip install analytickit'}</CodeSnippet>
}

function PythonSetupSnippet(): JSX.Element {
    const { currentTeam } = useValues(teamLogic)

    return (
        <CodeSnippet language={Language.Python}>
            {`import analytickit

analytickit.project_api_key = '${currentTeam?.api_token}'
analytickit.host = '${window.location.origin}'`}
        </CodeSnippet>
    )
}

function PythonCaptureSnippet(): JSX.Element {
    return <CodeSnippet language={Language.Python}>{"analytickit.capture('test-id', 'test-event')"}</CodeSnippet>
}

export function PythonInstructions(): JSX.Element {
    return (
        <>
            <h3>Install</h3>
            <PythonInstallSnippet />
            <h3>Configure</h3>
            <PythonSetupSnippet />
            <h3>Send an Event</h3>
            <PythonCaptureSnippet />
        </>
    )
}
