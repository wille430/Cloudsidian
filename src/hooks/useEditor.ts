import React, {ChangeEvent, MutableRefObject, useCallback, useEffect, useRef} from "react"

export const useEditor = (ref: MutableRefObject<HTMLTextAreaElement | null>) => {

    const changesArray = useRef<string[]>([])
    const historySize = 50

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (ref.current == null) return

        const textArea = ref.current
        if (e.key === "Tab") {
            e.preventDefault()
            const val = textArea.value
            const start = textArea.selectionStart
            const end = textArea.selectionEnd

            textArea.value = val.substring(0, start) + '\t' + val.substring(end);

            textArea.selectionStart = textArea.selectionEnd = start + 1;
        }

        if (e.key === "90") {
            e.preventDefault()
            if (changesArray.current.length > 0) {
                textArea.value = changesArray.current.pop()!
            }
        }
    }

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        changesArray.current.push(e.currentTarget.value)
        if (changesArray.current.length > historySize) {
            changesArray.current = changesArray.current.slice(0, historySize)
        }

        setHeight()
    }

    const clearHistory = () => {
        changesArray.current = []
    }

    const setHeight = useCallback(() => {
        if (ref.current) {
            // @ts-ignore
            ref.current.style.height = 0
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }, [ref])

    useEffect(() => {
        setHeight()
    }, [setHeight])

    return {
        handleKeyDown,
        handleChange,
        clearHistory,
        setHeight
    }
}