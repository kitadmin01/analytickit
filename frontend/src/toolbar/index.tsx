import 'react-toastify/dist/ReactToastify.css'
import '~/styles'
import './styles.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import Simmer from '@analytickit/simmerjs'
import { initKea } from '~/initKea'
import { ToolbarApp } from '~/toolbar/ToolbarApp'
import { EditorProps } from '~/types'
import { AnalyticKit } from 'analytickit-js'
    ; (window as any)['simmer'] = new Simmer(window, { depth: 8 })
    ; (window as any)['ph_load_editor'] = function (editorParams: EditorProps, analytickit: AnalyticKit) {
        initKea()
        const container = document.createElement('div')
        document.body.appendChild(container)

        if (!analytickit) {
            console.warn(
                '⚠️⚠️⚠️ Loaded toolbar via old version of analytickit-js that does not support feature flags. Please upgrade! ⚠️⚠️⚠️'
            )
        }

        ReactDOM.render(
            <ToolbarApp
                {...editorParams}
                actionId={parseInt(String(editorParams.actionId))}
                jsURL={editorParams.jsURL || editorParams.apiURL}
                analytickit={analytickit}
            />,
            container
        )
    }
