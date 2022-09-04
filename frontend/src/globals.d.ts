import analytickit from 'analytickit-js'
import { ExportedData } from '~/exporter/types'

declare global {
    interface Window {
    JS_ANALYTICKIT_API_KEY?: str
    JS_ANALYTICKIT_HOST?: str
    JS_ANALYTICKIT_SELF_CAPTURE: boolean
    JS_CAPTURE_INTERNAL_METRICS?: boolean
    analytickit?: analytickit
    ESBUILD_LOAD_SCRIPT:(name) => void
    ESBUILD_LOAD_CHUNKS: (name) => void
    ESBUILD_LOADED_CHUNKS: Set<string>
    ANALYTICKIT_EXPORTED_DATA: ExportedData
        }
}
