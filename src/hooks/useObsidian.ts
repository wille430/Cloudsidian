import {DropboxImportService} from "../dropbox/DropboxImportService";
import {useEffect, useMemo, useState} from "react";
import {FileExplorer, FolderEntry, RootFolder} from "../services/FileExplorer";
import {Database} from "../services/Database";
import {AppConfig} from "../config/AppConfig";
import {FileEditor} from "../services/FileEditor";
import {ObsidianParser} from "../services/ObsidianParser";
import {useSearchParams} from "react-router-dom";

export const useObsidian = (dropboxAccessToken: string) => {
    const [folders, setFolders] = useState<FolderEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [editorHtml, setEditorHtml] = useState<string | null>(null)

    const fileExplorer = useMemo(() => {
        return new FileExplorer(new DropboxImportService(dropboxAccessToken), new Database(AppConfig.DATABASE_NAME))
    }, [dropboxAccessToken])
    const fileEditor = new FileEditor(fileExplorer, new ObsidianParser(fileExplorer))
    const obsidianService = useMemo(() => new DropboxImportService(dropboxAccessToken), [dropboxAccessToken])

    const [searchParams, setSearchParams] = useSearchParams()

    const importFolder = () => {
        setIsLoading(true)
        fileExplorer.updateFolder().then(async () => {
            setFolders(await fileExplorer.getEntries())
        }).finally(() => setIsLoading(false))
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

        setIsLoading(false)
    }

    const selectFile = async (file: FolderEntry) => {
        if (file.isDir) return

        const link = await fileExplorer.getFilePath(file)
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

    useEffect(() => {
        importFolder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const filepath = searchParams.get("file")
        if (filepath == null) {
            setEditorHtml(null)
            return
        }
        fileEditor.openFile(filepath).then(html => {
            if (html == null) setFileParam(null)
            setEditorHtml(html)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    return {
        Obsidian: obsidianService,
        importFolder,
        folders,
        rootFolder,
        removeRemoteFolder,
        reload,
        isLoading,
        selectFile,
        editorHtml,
        fileExplorer
    }
}