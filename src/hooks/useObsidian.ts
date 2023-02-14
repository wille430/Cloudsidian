import {DropboxImportService} from "../dropbox/DropboxImportService";
import {useEffect, useMemo, useState} from "react";
import {FileExplorer, FolderEntry, RootFolder} from "../services/FileExplorer";
import {FileEditor} from "../services/FileEditor";
import {ObsidianParser} from "../services/ObsidianParser";
import {useSearchParams} from "react-router-dom";
import {RemoteFolder} from "../services/RemoteFolder";

export const useObsidian = (accessToken: string) => {
    const [folders, setFolders] = useState<FolderEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)
    const [isLoading, setIsLoading] = useState(false)

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
        fileExplorer
            .listDirectory()
            .then(setFolders)
            .finally(() => setIsLoading(false))

        setRootFolder(fileExplorer.getRootFolder())
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

    const openFile = async (file: FolderEntry) => {
        if (file.isDir) return
        const link = await remoteFolder.getRemoteFilePath(file)
        setFileParam(link ?? null)
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
    }

    const initEditor = () => {
        fileEditor.getHtml().then(setEditorHtml)
        fileEditor.getCurrentFile().then(file => {
            setEditorMarkdown(file?.content ?? null)
        })
    }

    useEffect(() => {
        importFolder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const filepath = searchParams.get("file")
        fileEditor.setCurrentFile(filepath).then(initEditor)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    return {
        importFolder,
        folders,
        rootFolder,
        removeRemoteFolder,
        reload,
        isLoading,
        selectFile: openFile,
        editorHtml,
        editorMarkdown,
        setEditorMarkdown: onEditorChange,
        fileExplorer,
        remoteFolder
    }
}