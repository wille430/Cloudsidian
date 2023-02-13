import {DropboxImportService} from "../dropbox/DropboxImportService";
import {useEffect, useMemo, useState} from "react";
import {FileExplorer, FolderEntry, RootFolder} from "../services/FileExplorer";
import {Database} from "../services/Database";
import {AppConfig} from "../config/AppConfig";

export const useObsidian = (dropboxAccessToken: string) => {
    const [folders, setFolders] = useState<FolderEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fileExplorer = useMemo(() => {
        return new FileExplorer(new DropboxImportService(dropboxAccessToken), new Database(AppConfig.DATABASE_NAME))
    }, [dropboxAccessToken])
    const obsidianService = useMemo(() => new DropboxImportService(dropboxAccessToken), [dropboxAccessToken])

    const importFolder = () => {
        setIsLoading(true)
        fileExplorer.getEntries().then(res => {
            setFolders(res)
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

    useEffect(() => {
        importFolder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        Obsidian: obsidianService,
        importFolder,
        folders,
        rootFolder,
        removeRemoteFolder,
        reload,
        isLoading,
        fileExplorer
    }
}