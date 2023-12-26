import { kea } from 'kea'
import { router } from 'kea-router'

const paymentCancelLogic = kea({
    path: ['scenes', 'billing', 'paymentCancelLogic'],

    actions: {
        replace: (path) => ({ path }),
    },

    listeners: ({ actions }) => ({
        replace: ({ path }) => {
            router.actions.replace(path)
        },
    }),
})

export default paymentCancelLogic
