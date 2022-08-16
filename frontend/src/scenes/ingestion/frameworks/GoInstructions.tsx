import React from 'react'
import { CodeSnippet, Language } from './CodeSnippet'
import { useValues } from 'kea'
import { teamLogic } from 'scenes/teamLogic'

function GoInstallSnippet(): JSX.Element {
    return <CodeSnippet language={Language.Bash}>{'go get "github.com/analytickit/analytickit-go"'}</CodeSnippet>
}

function GoSetupSnippet(): JSX.Element {
    const { currentTeam } = useValues(teamLogic)

    return (
        <CodeSnippet language={Language.Go}>
            {`package main
import (
    "github.com/analytickit/analytickit-go"
)
func main() {
    client, _ := analytickit.NewWithConfig("${currentTeam?.api_token}", analytickit.Config{Endpoint: "${window.location.origin}"})
    defer client.Close()
}`}
        </CodeSnippet>
    )
}

function GoCaptureSnippet(): JSX.Element {
    return (
        <CodeSnippet language={Language.Go}>
            {'client.Enqueue(analytickit.Capture{\n    DistinctId: "test-user",\n    Event: "test-snippet"\n})'}
        </CodeSnippet>
    )
}

export function GoInstructions(): JSX.Element {
    return (
        <>
            <h3>Install</h3>
            <GoInstallSnippet />
            <h3>Configure</h3>
            <GoSetupSnippet />
            <h3>Send an Event</h3>
            <GoCaptureSnippet />
        </>
    )
}
