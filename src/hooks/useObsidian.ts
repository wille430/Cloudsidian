import {DropboxImportService} from "../dropbox/DropboxImportService";
import {useEffect, useMemo, useState} from "react";
import {FileExplorer} from "../services/FileExplorer";
import {FileEntry, RootFolder} from "../services/RemoteFolder";
import {CurrentFile, FileEditor} from "../services/FileEditor";
import {ObsidianParser} from "../services/ObsidianParser";
import {useSearchParams} from "react-router-dom";
import {RemoteFolder} from "../services/RemoteFolder";

export const useObsidian = (accessToken: string) => {
    const [folders, setFolders] = useState<FileEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [isSavingCurrent, setIsSavingCurrent] = useState(false)
    const [isModified, setIsModified] = useState(false)
    const [currentFile, setCurrentFile] = useState<CurrentFile | null>(null)

    const [editorHtml, setEditorHtml] = useState<string | null>(null)
    const [editorMarkdown, setEditorMarkdown] = useState<string | null>(null)

    const remoteFolder = useMemo(() => {
        return new RemoteFolder(new DropboxImportService(accessToken))
    }, [accessToken])
    const fileExplorer = useMemo(() => {
        return new FileExplorer(remoteFolder)
    }, [remoteFolder])
    const fileEditor = useMemo(() => new FileEditor(remoteFolder, new ObsidianParser(remoteFolder)), [remoteFolder])

    const [searchParams, setSearchParams] = useSearchParams()

    const importFolder = () => {
        setIsLoading(true)

        const rootFolder = fileExplorer.getRootFolder()
        setRootFolder(rootFolder)
        if (rootFolder == null) {
            setIsLoading(false)
            return
        }

        fileExplorer
            .listDirectory()
            .then(setFolders)
            .finally(() => setIsLoading(false))
    }

    const removeRemoteFolder = async () => {
        if (window.confirm("Are you sure you want to unlink this folder?")) {
            setIsLoading(true)
            await fileExplorer.removeRemoteFolder()

            setRootFolder(null)
            setFolders(null)
            setIsLoading(false)
        }
    }

    const reload = async () => {
        setIsLoading(true)

        await fileExplorer.refetch()
        initEditor()

        setIsLoading(false)
    }

    /**
     * Open a file and returns whether a new file was opened
     * @param file - {@link FileEntry}
     */
    const selectFile = async (file: FileEntry): Promise<boolean> => {
        const currentFile = await fileEditor.getCurrentFile()
        if (file.isDir || (currentFile != null && currentFile.remotePath === file.remotePath)) return false

        if (isModified && !window.confirm("Are you sure you want to discard your changes?")) {
            return false
        }

        const link = await remoteFolder.getRemoteFilePath(file)
        setFileParam(link ?? null)

        return true
    }

    const setFileParam = (link: string | null) => {
        setSearchParams((prev) => {
            if (link == null) {
                prev.delete("file")
            } else {
                prev.set("file", link)
            }
            return prev
        })
    }

    const onEditorChange = (text: string) => {
        setEditorMarkdown(text)
        fileEditor.setContent(text)
        fileEditor.getHtml().then(setEditorHtml)
        fileEditor.getCurrentFile().then(file => {
            setIsModified(text !== file?.originalContent)
        })
    }

    const initEditor = () => {
        fileEditor.getHtml().then(setEditorHtml)
        fileEditor.getCurrentFile().then(file => {
            setCurrentFile(file)
            setEditorMarkdown(file?.content ?? null)
        })
    }

    const saveCurrentFile = async () => {
        if (isSavingCurrent) return
        setIsSavingCurrent(true)
        await fileEditor
            .save()
            .finally(() => {
                setIsSavingCurrent(false)
            })
        setIsModified(false)
    }

    useEffect(() => {
        importFolder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const filepath = searchParams.get("file")
        fileEditor
            .setCurrentFile(filepath)
            .then(initEditor)
            .catch(() => {
                setFileParam(null)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    return {
        folders,
        rootFolder,
        isLoading,
        editorHtml,
        editorMarkdown,
        fileExplorer,
        remoteFolder,
        isModified,
        isSavingCurrent,
        currentFile,
        removeRemoteFolder,
        reload,
        selectFile,
        setEditorMarkdown: onEditorChange,
        importFolder,
        saveCurrentFile
    }
}