import React, {ChangeEvent, MutableRefObject, useCallback, useEffect, useRef, useState} from "react"
import {useObsidianContext} from "../context/ObsidianContext";
import {useFileParam} from "./useFileParam";
import {CurrentFile} from "../services/FileEditor";

export const useEditor = (ref: MutableRefObject<HTMLTextAreaElement | null>) => {

    const changesArray = useRef<string[]>([])
    const historySize = 50

    const [isSaving, setIsSaving] = useState(false)
    const [isModified, setIsModified] = useState(false)
    const [currentFile, setCurrentFile] = useState<CurrentFile | null>()
    const [errorMessage, setErrorMessage] = useState<string | null>()

    const [editorHtml, setEditorHtml] = useState<string | null>()
    const [editorMarkdown, setEditorMarkdown] = useState<string | null>()

    const {fileParam, setFileParam} = useFileParam()

    const {fileEditor} = useObsidianContext()

    const initEditor = () => {
        setCurrentFile(fileEditor.getCurrentFile())
        fileEditor.getHtml().then(setEditorHtml)
        setEditorMarkdown(fileEditor.getCurrentFile()?.content ?? null)
    }

    const onEditorChange = (text: string) => {
        setEditorMarkdown(text)
        fileEditor.setContent(text)
        fileEditor.getHtml().then(setEditorHtml)
        setIsModified(text !== fileEditor.getCurrentFile()?.originalContent)
    }

    const saveCurrentChanges = async () => {
        if (isSaving) return
        setIsSaving(true)
        await fileEditor
            .save()
            .finally(() => {
                setIsSaving(false)
            })
        setIsModified(false)
    }

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

    const clearHistory = useCallback(() => {
        changesArray.current = []
    }, [])

    const setHeight = useCallback(() => {
        if (ref.current) {
            // @ts-ignore
            ref.current.style.height = 0
            ref.current.style.height = ref.current.scrollHeight + 'px';
        }
    }, [ref])

    useEffect(() => {
        fileEditor
            .setCurrentFile(fileParam)
            .then(initEditor)
            .catch((e) => {
                console.error(e)
                setErrorMessage(e)
                setFileParam(null)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileParam])

    useEffect(() => {
        initEditor()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        setHeight()
        clearHistory()
    }, [clearHistory, currentFile, setHeight])

    return {
        handleKeyDown,
        handleChange,
        onEditorChange,
        saveCurrentChanges,
        isModified,
        isSaving,
        isLoading: currentFile == null && errorMessage == null && fileParam,
        editorHtml,
        editorMarkdown,
        currentFile
    }
}