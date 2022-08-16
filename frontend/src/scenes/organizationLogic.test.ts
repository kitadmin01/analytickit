import{expectLogic}from'kea-test-utils'
import {initKeaTests}from '~/test/init'
import {MOCK_DEFAULT_ORGANIZATION} from '../lib/api.mock'
import {AppContext}from '../types'
import {organizationLogic}from './organizationLogic'

describe('organizationLogic', () => {
    let logic: ReturnType<typeof organizationLogic.build>

    describe('if analytickit_APP_CONTEXT available', () => {
        beforeEach(() => {
            window.analytickit_APP_CONTEXT = { current_user: { organization: { id: 'WXYZ' } } } as unknown as AppContext
            initKeaTests()
            logic = organizationLogic()
            logic.mount()
        })

        it('loads organization from window', async () => {
            await expectLogic(logic).toNotHaveDispatchedActions(['loadCurrentOrganization'])
            await expectLogic(logic).toDispatchActions(['loadCurrentOrganizationSuccess'])
            await expectLogic(logic).toMatchValues({
                currentOrganization: { id: 'WXYZ' },
            })
        })
    })

    describe('if analytickit_APP_CONTEXT not available', () => {
        beforeEach(async () => {
            window.analytickit_APP_CONTEXT = undefined as unknown as AppContext
            initKeaTests()
            logic = organizationLogic()
            logic.mount()
        })
        it('loads organization from API', async () => {
            await expectLogic(logic).toDispatchActions(['loadCurrentOrganization', 'loadCurrentOrganizationSuccess'])
            await expectLogic(logic).toMatchValues({
                currentOrganization: { ...MOCK_DEFAULT_ORGANIZATION, available_features: [] },
            })
        })
    })
})
