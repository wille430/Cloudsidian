import {useEffect, useState} from "react";
import {FileEntry, RootFolder} from "../services/RemoteFolder";
import {useFileParam} from "./useFileParam";
import {useObsidianContext} from "../context/ObsidianContext";

export const useFileExplorer = () => {
    const [folders, setFolders] = useState<FileEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {fileEditor, fileExplorer} = useObsidianContext()

    const {setFileParam} = useFileParam()

    const importFolder = (folder: RootFolder) => {
        setRootFolder(folder)
        fileExplorer.setRemoteFolder(folder)
        initFolder()
    }

    const initFolder = () => {
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
            await fileExplorer.setRemoteFolder(null)

            setRootFolder(null)
            setFolders(null)
            setFileParam(null)
            setIsLoading(false)
        }
    }

    const reload = async () => {
        setIsLoading(true)
        await fileExplorer.refetch()
        setIsLoading(false)
    }

    /**
     * Open a file and returns whether a new file was opened
     * @param file - {@link FileEntry}
     */
    const selectFile = async (file: FileEntry): Promise<boolean> => {
        const currentFile = await fileEditor.getCurrentFile()
        if (file.isDir || (currentFile != null && currentFile.remotePath === file.remotePath)) return false

        if (currentFile?.modified && !window.confirm("Are you sure you want to discard your changes?")) {
            return false
        }

        const link = await fileExplorer.getRemoteFilePath(file)
        setFileParam(link ?? null)

        return true
    }

    useEffect(() => {
        initFolder()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        folders,
        rootFolder,
        isLoading,
        fileExplorer,
        removeRemoteFolder,
        reload,
        selectFile,
        importFolder
    }
}