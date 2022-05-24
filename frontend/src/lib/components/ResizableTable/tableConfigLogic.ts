import { kea } from 'kea'
import type { tableConfigLogicType } from './tableConfigLogicType'
import { router } from 'kea-router'
import { ColumnChoice } from '~/types'

export interface TableConfigLogicProps {
    startingColumns?: ColumnChoice
}

export const tableConfigLogic = kea<tableConfigLogicType>({
    path: ['lib', 'components', 'ResizableTable', 'tableConfigLogic'],
    props: { startingColumns: 'DEFAULT' } as TableConfigLogicProps,
    actions: {
        showModal: true,
        hideModal: true,
        setSelectedColumns: (columnConfig: ColumnChoice) => ({ columnConfig }),
    },
    reducers: ({ props }) => ({
        selectedColumns: [
            (props.startingColumns || 'DEFAULT') as ColumnChoice,
            {
                setSelectedColumns: (_, { columnConfig }) => columnConfig,
            },
        ],
        modalVisible: [
            false,
            {
                showModal: () => true,
                save: () => false,
                hideModal: () => false,
                setSelectedColumns: () => false,
            },
        ],
    }),
    selectors: {
        tableWidth: [
            (selectors) => [selectors.selectedColumns],
            (selectedColumns: ColumnChoice): number => {
                return selectedColumns === 'DEFAULT' ? 7 : selectedColumns.length + 1
            },
        ],
    },
    urlToAction: ({ actions, values }) => ({
        '*': (_, searchParams) => {
            const columnsFromURL: string[] = searchParams.tableColumns
            // URL columns must be present, an array, and have content
            if (!columnsFromURL || !Array.isArray(columnsFromURL) || columnsFromURL.length === 0) {
                return
            }

            const currentColumns: ColumnChoice = values.selectedColumns

            const arrayEqualsInAnyOrder =
                columnsFromURL.length === currentColumns.length &&
                columnsFromURL.every((value) => currentColumns.includes(value))

            // URL columns should be applied if the current columns are not set, or are not the same as the URL columns
            if (currentColumns === 'DEFAULT' || !arrayEqualsInAnyOrder) {
                actions.setSelectedColumns(columnsFromURL)
            }
        },
    }),
    actionToUrl: ({ values }) => ({
        setSelectedColumns: () => {
            return [
                router.values.location.pathname,
                {
                    ...router.values.searchParams,
                    tableColumns: values.selectedColumns,
                },
                router.values.hashParams,
                { replace: true },
            ]
        },
    }),
})
