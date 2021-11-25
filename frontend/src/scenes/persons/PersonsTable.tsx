import React from 'react'
import { TZLabel } from 'lib/components/TimezoneAware'
import { PropertiesTable } from 'lib/components/PropertiesTable'
import { PersonType } from '~/types'
import './Persons.scss'
import { CopyToClipboardInline } from 'lib/components/CopyToClipboard'
import { midEllipsis } from 'lib/utils'
import { PersonHeader } from './PersonHeader'
import { LemonTable, LemonTableColumn, LemonTableColumns } from 'lib/components/LemonTable/LemonTable'

interface PersonsTableType {
    people: PersonType[]
    loading?: boolean
    hasPrevious?: boolean
    hasNext?: boolean
    loadPrevious?: () => void
    loadNext?: () => void
    compact?: boolean
}

export function PersonsTable({
    people,
    loading = false,
    hasPrevious,
    hasNext,
    loadPrevious,
    loadNext,
    compact,
}: PersonsTableType): JSX.Element {
    const columns: LemonTableColumns<PersonType> = [
        {
            title: 'Person',
            key: 'person',
            render: function Render(_, person: PersonType) {
                return <PersonHeader withIcon person={person} />
            },
        },
        {
            title: 'ID',
            key: 'id',
            render: function Render(_, person: PersonType) {
                return (
                    <div style={{ overflow: 'hidden' }}>
                        {person.distinct_ids.length && (
                            <CopyToClipboardInline
                                explicitValue={person.distinct_ids[0]}
                                tooltipMessage={null}
                                iconStyle={{ color: 'var(--primary)' }}
                                iconPosition="end"
                                description="person ID"
                            >
                                {midEllipsis(person.distinct_ids[0], 32)}
                            </CopyToClipboardInline>
                        )}
                    </div>
                )
            },
        },
        ...(!compact
            ? [
                  {
                      title: 'First seen',
                      dataIndex: 'created_at',
                      render: function Render(created_at: PersonType['created_at']) {
                          return created_at ? <TZLabel time={created_at} /> : <></>
                      },
                  } as LemonTableColumn<PersonType, keyof PersonType | undefined>,
              ]
            : []),
    ]

    return (
        <LemonTable
            columns={columns}
            loading={loading}
            rowKey="id"
            pagination={{
                controlled: true,
                pageSize: 100,
                onForward: hasNext
                    ? () => {
                          loadNext?.()
                          window.scrollTo(0, 0)
                      }
                    : undefined,
                onBackward: hasPrevious
                    ? () => {
                          loadPrevious?.()
                          window.scrollTo(0, 0)
                      }
                    : undefined,
            }}
            expandable={{
                expandedRowRender: function RenderPropertiesTable({ properties }) {
                    return Object.keys(properties).length ? (
                        <PropertiesTable properties={properties} />
                    ) : (
                        'This person has no properties.'
                    )
                },
            }}
            dataSource={people}
            nouns={['person', 'persons']}
            className="persons-table"
        />
    )
}
