import { Button, Form, Input, Modal, Select } from 'antd'
import { useActions } from 'kea'
import { useState } from 'react'
import { cryptoAnalyticsLogic } from './cryptoAnalyticsLogic'
import { CryptoAnalyticsFilters } from './types'

export function NewCryptoAnalytics(): JSX.Element {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const { createCryptoAnalytic } = useActions(cryptoAnalyticsLogic)
    const [form] = Form.useForm()

    const handleSubmit = async (values: any) => {
        await createCryptoAnalytic(values)
        setIsModalVisible(false)
        form.resetFields()
    }

    return (
        <>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
                New Crypto Analytics
            </Button>
            <Modal
                title="Create New Crypto Analytics"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleSubmit}>
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input a name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name={['filters', 'token_type']} label="Token Type">
                        <Select>
                            <Select.Option value="Active">Active</Select.Option>
                            <Select.Option value="Inactive">Inactive</Select.Option>
                            <Select.Option value="ERC20">ERC20</Select.Option>
                            <Select.Option value="ERC721">ERC721</Select.Option>
                        </Select>
                    </Form.Item>
                    {/* Add other filter fields as needed */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Create
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
