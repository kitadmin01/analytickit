import '~/styles'
import './Exporter.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import { loadAnalyticKitJS } from '~/loadAnalyticKitJS'
import { initKea } from '~/initKea'
import { Exporter } from '~/exporter/Exporter'
import { ExportedData } from '~/exporter/types'

// Disable tracking for all exports and embeds.
// This is explicitly set as to not track our customers' customers data.
// Without it, embeds of self-hosted iframes will log metrics to dpa.analytickit.com.
window.JS_ANALYTICKIT_API_KEY = null

loadAnalyticKitJS()
initKea()

const exportedData: ExportedData = window.ANALYTICKIT_EXPORTED_DATA

ReactDOM.render(<Exporter {...exportedData} />, document.getElementById('root'))
