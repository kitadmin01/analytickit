import clsx from 'clsx'
import md5 from 'md5'
import React, { useState } from 'react'
import './ProfilePicture.scss'

export interface ProfilePictureProps {
    name?: string
    email?: string
    size?: 'md' | 'sm' | 'xl'
    showName?: boolean
    style?: React.CSSProperties
    className?: string
}

export function ProfilePicture({ name, email, size, showName, style, className }: ProfilePictureProps): JSX.Element {
    const [didImageError, setDidImageError] = useState(false)
    const pictureClass = clsx('profile-picture', size, className)

    let pictureComponent: JSX.Element
    if (email && !didImageError) {
        const emailHash = md5(email.trim().toLowerCase())
        const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=96&d=404`
        pictureComponent = (
            <img
                className={pictureClass}
                src={gravatarUrl}
                onError={() => setDidImageError(true)}
                title={`This is ${email}'s Gravatar.`}
                alt=""
                style={style}
            />
        )
    } else {
        const initialLetter = name ? name[0]?.toUpperCase() : email ? email[0]?.toUpperCase() : '?'
        pictureComponent = (
            <div className={pictureClass} style={style}>
                {initialLetter}
            </div>
        )
    }
    return !showName ? (
        pictureComponent
    ) : (
        <div className="profile-package">
            {pictureComponent}
            <span className="profile-name">{name || email || 'an unknown user'}</span>
        </div>
    )
}
