import '~/styles'
import './Exporter.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { loadanalytickitJS } from '~/loadanalytickitJS'
import { initKea } from '~/initKea'
import { Exporter } from '~/exporter/Exporter'
import { ExportedData } from '~/exporter/types'

// Disable tracking for all exports and embeds.
// This is explicitly set as to not track our customers' customers data.
// Without it, embeds of self-hosted iframes will log metrics to app.analytickit.com.
window.JS_analytickit_API_KEY = null

loadanalytickitJS()
initKea()

const exportedData: ExportedData = window.analytickit_EXPORTED_DATA

ReactDOM.render(<Exporter {...exportedData} />, document.getElementById('root'))
