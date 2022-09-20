type BufferOptions = {
    limit: number
    timeoutSeconds: number
    onFlush: (objects: any[], points: number) => void | Promise<void>
}

export function createBuffer(opts: Partial<BufferOptions>) {
    console.warn('⚠️⚠️⚠️ This plugin is using the deprecated buffer implementation. If it is an official analytickit plugin, please update it to the latest version. If this is a custom plugin please use exportEvents instead. https://analytickit.com/docs/apps/build/reference#exportevents ⚠️⚠️⚠️')
    const buffer = {
        _buffer: [] as any[],
        _timeout: null as NodeJS.Timeout | null,
        _points: 0,
        _options: {
            limit: 10,
            timeoutSeconds: 60,
            ...opts,
        } as BufferOptions,
        add: (object: any, points = 1) => {
            // flush existing if adding would make us go over the limit
            if (buffer._points && buffer._points + points > buffer._options.limit) {
                void buffer.flush()
            }

            // add the object to the buffer
            buffer._points += points
            buffer._buffer.push(object)

            if (buffer._points > buffer._options.limit) {
                // flush (again?) if we are now over the limit
                void buffer.flush()
            } else if (!buffer._timeout) {
                // if not, make sure there's a flush timeout
                buffer._timeout = setTimeout(() => void buffer.flush(), buffer._options.timeoutSeconds * 1000)
            }
        },
        flush: async (): Promise<void> => {
            if (buffer._timeout) {
                clearTimeout(buffer._timeout)
                buffer._timeout = null
            }
            if (buffer._buffer.length > 0 || buffer._points !== 0) {
                const oldBuffer = buffer._buffer
                const oldPoints = buffer._points
                buffer._buffer = []
                buffer._points = 0
                await buffer._options.onFlush?.(oldBuffer, oldPoints)
            }
        },
    }

    return buffer
}
