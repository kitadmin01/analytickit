importanalytickitfrom'analytickit-js'
import {ExportedData}from '~/exporter/types'

declare global {
interface Window {
JS_analytickit_API_KEY?: str
JS_analytickit_HOST?: str
JS_analytickit_SELF_CAPTURE?: boolean
JS_CAPTURE_INTERNAL_METRICS?: boolean
analytickit?: analytickit
ESBUILD_LOAD_SCRIPT:(name) => void
        ESBUILD_LOAD_CHUNKS: (name) => void
        ESBUILD_LOADED_CHUNKS: Set<string>
        analytickit_EXPORTED_DATA: ExportedData
    }
}
