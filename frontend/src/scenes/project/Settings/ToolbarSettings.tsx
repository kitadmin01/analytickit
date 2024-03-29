import React from 'react'
import { useValues, useActions } from 'kea'
import { userLogic } from 'scenes/userLogic'
import { Col, Row, Switch } from 'antd'

export function ToolbarSettings(): JSX.Element {
    const { user, userLoading } = useValues(userLogic)
    const { updateUser } = useActions(userLogic)

    return (
        <div>
            <Row style={{ flexFlow: 'row' }}>
                <Col>
                    <Switch
                        id="analytickit-toolbar-switch"
                        onChange={() => {
                            updateUser({
                                toolbar_mode: user?.toolbar_mode === 'disabled' ? 'toolbar' : 'disabled',
                            })
                        }}
                        defaultChecked={user?.toolbar_mode !== 'disabled'}
                        disabled={userLoading}
                        loading={userLoading}
                    />
                </Col>
                <Col>
                    <label
                        style={{
                            marginLeft: '10px',
                        }}
                        htmlFor="analytickit-toolbar-switch"
                    >
                        Enable analytickit Toolbar, which gives access to heatmaps, stats and allows you to create actions,
                        right there on your website!
                    </label>
                </Col>
            </Row>
        </div>
    )
}
