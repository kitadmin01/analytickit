import { Button } from 'antd'
import { useValues } from 'kea'
import { formatPropertyLabel } from 'lib/utils'
import React from 'react'
import { cohortsModel } from '~/models/cohortsModel'
import { AnyPropertyFilter } from '~/types'
import { keyMapping } from 'lib/components/PropertyKeyInfo'
import clsx from 'clsx'
import { propertyDefinitionsModel } from '~/models/propertyDefinitionsModel'
import { CloseButton } from 'lib/components/CloseButton'

export interface PropertyFilterButtonProps {
    item: AnyPropertyFilter
    greyBadges?: boolean
    onClick?: () => void
    onClose?: () => void
    setRef?: (ref: HTMLElement) => void
}

export function PropertyFilterButton({ item, ...props }: PropertyFilterButtonProps): JSX.Element {
    const { cohorts } = useValues(cohortsModel)
    const { formatForDisplay } = useValues(propertyDefinitionsModel)

    return (
        <FilterButton {...props}>
            {formatPropertyLabel(item, cohorts, keyMapping, (s) => formatForDisplay(item.key, s))}
        </FilterButton>
    )
}

interface FilterRowProps {
    greyBadges?: boolean
    onClick?: () => void
    onClose?: () => void
    setRef?: (ref: HTMLElement) => void
    children: string | JSX.Element
}

export function FilterButton({ greyBadges, onClick, onClose, setRef, children }: FilterRowProps): JSX.Element {
    return (
        <Button
            type="primary"
            shape="round"
            style={{ overflow: 'hidden' }}
            onClick={onClick}
            ref={setRef}
            className={clsx('property-filter', greyBadges && 'property-filter-grey')}
        >
            <span
                className="ph-no-capture property-filter-button-label"
                style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
                {children}
                {onClose && (
                    <CloseButton
                        className={clsx('ml-1', !greyBadges && 'white-button')}
                        onClick={(e: MouseEvent) => {
                            e.stopPropagation()
                            onClose()
                        }}
                        style={{ cursor: 'pointer', float: 'none', marginLeft: 5 }}
                    />
                )}
            </span>
        </Button>
    )
}

export default PropertyFilterButton
