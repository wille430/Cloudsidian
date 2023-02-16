import React, {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {useFileParam} from "./useFileParam";
import {IMarkdownParser} from "../services/ObsidianParser";
import {RemoteFolder} from "../services/RemoteFolder";
import {CurrentFile} from "../models/CurrentFile";

export const useEditor = (markdownParser: IMarkdownParser, remoteFolder: RemoteFolder) => {

    const changesArray = useRef<string[]>([])
    const historySize = 50

    const {fileParam, setFileParam} = useFileParam()

    const [isSaving, setIsSaving] = useState(false)
    const [isModified, setIsModified] = useState(false)
    const [currentFile, setCurrentFile] = useState<CurrentFile | null>()
    const [errorMessage] = useState<string | null>()
    const isLoading = useMemo(() =>
            currentFile == null && errorMessage == null && fileParam,
        [currentFile, errorMessage, fileParam])

    const [editorHtml, setEditorHtml] = useState<string | null>()

    const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

    const loadHtml = () => {
        return markdownParser.parse(currentFile?.content ?? "").then(setEditorHtml)
    }

    const onEditorChange = async (text: string) => {
        setCurrentFile(prev => ({
            ...prev!,
            content: text
        }))
        await loadHtml()
        setIsModified(text !== currentFile?.originalContent)
    }

    const saveCurrentChanges = async () => {
        if (isSaving || currentFile == null) return
        setIsSaving(true)

        await remoteFolder
            .saveFile(currentFile)
            .finally(() => {
                setIsSaving(false)
            })

        setIsModified(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.currentTarget == null) return

        const textArea = e.currentTarget
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
        if (textAreaRef.current) {
            // @ts-ignore
            textAreaRef.current.style.height = 0
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
        }
    }, [textAreaRef])

    const setCurrentFileFromParam = async () => {
        if (fileParam == null) {
            setCurrentFile(null)
            return
        }

        const file = await remoteFolder.getFile(fileParam)

        if (file == null) {
            setCurrentFile(null)
            setFileParam(null)
            return
        }

        if (file.content == null) {
            await remoteFolder.getStringContents(file)
        }

        setCurrentFile({
            ...file,
            modified: false,
            originalContent: file?.content ?? null
        })
    }

    useEffect(() => {
        setCurrentFile(null)
        setCurrentFileFromParam().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileParam])

    useEffect(() => {
        loadHtml().then()
    }, [currentFile?.content])

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
        isLoading,
        editorHtml,
        editorMarkdown: currentFile?.content,
        currentFile,
        textAreaRef
    }
}