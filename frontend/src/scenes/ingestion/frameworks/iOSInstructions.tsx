import React from 'react'
import { CodeSnippet, Language } from './CodeSnippet'
import { useValues } from 'kea'
import { teamLogic } from 'scenes/teamLogic'

function IOSInstallSnippet(): JSX.Element {
    return (
        <CodeSnippet language={Language.Ruby}>
            {'pod "analytickit", "~> 1.0" # Cocoapods \n# OR \ngithub "analytickit/analytickit-ios" # Carthage'}
        </CodeSnippet>
    )
}

function IOS_OBJ_C_SetupSnippet(): JSX.Element {
    const { currentTeam } = useValues(teamLogic)

    return (
        <CodeSnippet language={Language.ObjectiveC}>
            {`#import <analytickit/PHGanalytickit.h>\n#import <analytickit/PHGanalytickitConfiguration.h>\n\nPHGanalytickitConfiguration *configuration = [PHGanalytickitConfiguration configurationWithApiKey:@"${currentTeam?.api_token}" host:@"${window.location.origin}"];\n\nconfiguration.captureApplicationLifecycleEvents = YES; // Record certain application events automatically!\nconfiguration.recordScreenViews = YES; // Record screen views automatically!\n\n[PHGanalytickit setupWithConfiguration:configuration];`}
        </CodeSnippet>
    )
}

function IOS_SWIFT_SetupSnippet(): JSX.Element {
    const { currentTeam } = useValues(teamLogic)

    return (
        <CodeSnippet language={Language.Swift}>
            {`import analytickit\n\nlet configuration = PHGanalytickitConfiguration(apiKey: "${currentTeam?.api_token}", host: "${window.location.origin}")\n\nconfiguration.captureApplicationLifecycleEvents = true; // Record certain application events automatically!\nconfiguration.recordScreenViews = true; // Record screen views automatically!\n\nPHGanalytickit.setup(with: configuration)\nlet analytickit = PHGanalytickit.shared()`}
        </CodeSnippet>
    )
}

function IOS_OBJ_C_CaptureSnippet(): JSX.Element {
    return (
        <CodeSnippet language={Language.ObjectiveC}>
            {'[[PHGanalytickit sharedanalytickit] capture:@"Test Event"];'}
        </CodeSnippet>
    )
}

function IOS_SWIFT_CaptureSnippet(): JSX.Element {
    return <CodeSnippet language={Language.Swift}>{'analytickit.capture("Test Event")'}</CodeSnippet>
}

export function IOSInstructions(): JSX.Element {
    return (
        <>
            <h3>Install</h3>
            <IOSInstallSnippet />
            <h3>Configure Swift</h3>
            <IOS_SWIFT_SetupSnippet />
            <h3>Or configure Objective-C</h3>
            <IOS_OBJ_C_SetupSnippet />
            <h3>Send an event with swift</h3>
            <IOS_SWIFT_CaptureSnippet />
            <h3>Send an event with Objective-C</h3>
            <IOS_OBJ_C_CaptureSnippet />
        </>
    )
}
