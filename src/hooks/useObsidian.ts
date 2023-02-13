import {DropboxImportService} from "../dropbox/DropboxImportService";
import {useEffect, useMemo, useState} from "react";
import {FileExplorer, FolderEntry, RootFolder} from "../services/FileExplorer";
import {Database} from "../services/Database";
import {AppConfig} from "../config/AppConfig";

export const useObsidian = (dropboxAccessToken: string) => {
    const [folders, setFolders] = useState<FolderEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)

    const fileExplorer = useMemo(() => {
        return new FileExplorer(new DropboxImportService(dropboxAccessToken), new Database(AppConfig.DATABASE_NAME))
    }, [dropboxAccessToken])
    const obsidianService = useMemo(() => new DropboxImportService(dropboxAccessToken), [dropboxAccessToken])

    const importFolder = () => {
        fileExplorer.getEntries().then(setFolders)
        setRootFolder(fileExplorer.getRootFolder())
    }

    useEffect(() => {
        importFolder()
    }, [importFolder])

    return {Obsidian: obsidianService, importFolder, folders, rootFolder, fileExplorer}
}