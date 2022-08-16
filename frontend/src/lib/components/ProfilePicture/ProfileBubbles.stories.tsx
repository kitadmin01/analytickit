import React from 'react'

import { ProfileBubbles as ProfileBubblesComponent, ProfileBubblesProps } from './ProfileBubbles'
import { ComponentMeta } from '@storybook/react'
import { alphabet, range } from 'lib/utils'

const DUMMIES: ProfileBubblesProps['people'] = [
    { email: 'michael@analytickit.com', name: 'Michael' },
    { email: 'lottie@analytickit.com', name: 'Lottie' },
    { email: 'paul@analytickit.com', name: 'Paul' },
    { email: 'joe@analytickit.com', name: 'Joe' },
]

export default {
    title: 'Lemon UI/Profile Bubbles',
    component: ProfileBubblesComponent,
    argTypes: {
        people: {
            defaultValue: DUMMIES,
        },
    },
} as ComponentMeta<typeof ProfileBubblesComponent>

export function OneBubble(props: any): JSX.Element {
    return <ProfileBubblesComponent {...props} people={DUMMIES.slice(0, 1)} />
}

export function MultipleBubblesWithTooltip(props: any): JSX.Element {
    return <ProfileBubblesComponent {...props} tooltip="Cool people." />
}

export function MultipleBubblesWithNoImages(props: any): JSX.Element {
    return (
        <ProfileBubblesComponent
            {...props}
            people={range(20).map((x) => ({
                name: alphabet[x],
                email: 'not-real-at-all@analytickit.com',
            }))}
        />
    )
}

export function MultipleBubblesAtLimit(props: any): JSX.Element {
    return <ProfileBubblesComponent {...props} limit={4} />
}

export function MultipleBubblesOverflowingByOne(props: any): JSX.Element {
    return <ProfileBubblesComponent {...props} limit={3} />
}

export function MultipleBubblesOverflowingByTwo(props: any): JSX.Element {
    return <ProfileBubblesComponent {...props} limit={2} />
}
