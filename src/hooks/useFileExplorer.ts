import {useEffect, useState} from "react";
import {FileEntry, RootFolder} from "../services/RemoteFolder";
import {useFileParam} from "./useFileParam";
import {useObsidianContext} from "../context/ObsidianContext";

export const useFileExplorer = () => {
    const [folders, setFolders] = useState<FileEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {fileEditor, remoteFolder} = useObsidianContext()
    const {setFileParam} = useFileParam()

    const importFolder = (folder: RootFolder) => {
        setRootFolder(folder)
        setFolders(null)
        updateFolderView().then()
    }

    const updateFolderView = async () => {
        setIsLoading(true)

        const rootFolder = remoteFolder.getRootFolder()
        setRootFolder(rootFolder)
        if (rootFolder == null) {
            setFolders(null)
            setIsLoading(false)
            return
        }

        await remoteFolder.getFiles()
            .then(setFolders)
            .finally(() => setIsLoading(false))
    }

    const removeRemoteFolder = async () => {
        if (window.confirm("Are you sure you want to unlink this folder?")) {
            setIsLoading(true)

            await remoteFolder.setRootFolder(null)

            setRootFolder(null)
            setFolders(null)
            setFileParam(null)

            setIsLoading(false)
        }
    }

    const reload = async () => {
        setIsLoading(true)
        try {
            await remoteFolder.sync()
            await updateFolderView()
        } catch (e) {
            console.log(e)
        } finally {
            setIsLoading(false)
        }
    }

    const openFolder = async (folder: FileEntry) => {
        folder.showChildren = !folder.showChildren

        await updateFolderView()
        if (folder.showChildren) {
            await remoteFolder.getFiles(folder.remotePath)
        }

        await updateFolderView()
    }

    /**
     * Open a file and returns whether a new file was opened
     * @param file - {@link FileEntry}
     */
    const selectFile = async (file: FileEntry): Promise<boolean> => {
        const currentFile = await fileEditor.getCurrentFile()
        if (file.isDir) {
            return openFolder(file)
                .then(() => true)
                .catch(() => false)
        }
        if (currentFile != null && currentFile.remotePath === file.remotePath) return false

        if (currentFile?.modified && !window.confirm("Are you sure you want to discard your changes?")) {
            return false
        }

        const link = await remoteFolder.getRemoteFilePath(file)
        setFileParam(link ?? null)

        return true
    }

    useEffect(() => {
        updateFolderView().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        folders,
        rootFolder,
        isLoading,
        removeRemoteFolder,
        reload,
        selectFile,
        importFolder,
        openFolder
    }
}