import React from 'react'
import { CodeSnippet, Language } from './CodeSnippet'
import { useValues } from 'kea'
import { teamLogic } from 'scenes/teamLogic'

function NodeInstallSnippet(): JSX.Element {
    return (
        <CodeSnippet language={Language.Bash}>
            {`npm install analytickit-node
# OR
yarn add analytickit-node`}
        </CodeSnippet>
    )
}

function NodeSetupSnippet(): JSX.Element {
    const { currentTeam } = useValues(teamLogic)

    return (
        <CodeSnippet language={Language.JavaScript}>
            {`import analytickit from 'analytickit-node'

const client = new analytickit(
    '${currentTeam?.api_token}',
    { host: '${window.location.origin}' }
)`}
        </CodeSnippet>
    )
}

function NodeCaptureSnippet(): JSX.Element {
    return (
        <CodeSnippet language={Language.JavaScript}>
            {"client.capture({\n    distinctId: 'test-id',\n    event: 'test-event'\n})"}
        </CodeSnippet>
    )
}

export function NodeInstructions(): JSX.Element {
    return (
        <>
            <h3>Install</h3>
            <NodeInstallSnippet />
            <h3>Configure</h3>
            <NodeSetupSnippet />
            <h3>Send an Event</h3>
            <NodeCaptureSnippet />
        </>
    )
}
