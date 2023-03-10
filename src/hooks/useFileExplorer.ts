import {useEffect, useState} from "react";
import {RemoteFolder} from "../services/RemoteFolder";
import {useFileParam} from "./useFileParam";
import {useEditorContext} from "../context/EditorContext";
import {FileEntry} from "../models/FileEntry";
import {RootFolder} from "../models/RootFolder";

export const useFileExplorer = (remoteFolder: RemoteFolder) => {
    const [folders, setFolders] = useState<FileEntry[] | null>(null)
    const [rootFolder, setRootFolder] = useState<RootFolder | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showSideBar, setShowSideBar] = useState(false)

    const {setFileParam} = useFileParam()
    const {currentFile} = useEditorContext()

    const importFolder = (folder: RootFolder) => {
        setRootFolder(folder)
        remoteFolder.setRootFolder(folder)
        setFolders(null)
        setFileParam(null)
        updateFolderView().then()
    }

    const updateFolderView = async (): Promise<void> => {
        setIsLoading(true)

        const rootFolder = remoteFolder.getRootFolder()
        setRootFolder(rootFolder)
        if (rootFolder == null) {
            setFolders(null)
            setIsLoading(false)
        } else {
            const newFolders = await remoteFolder
                .getFiles()
                .finally(() => setIsLoading(false))
            // Creating a new reference is necessary for making react update correctly.
            // More specifically, when importing a new folder, React wouldn't rerender when folder contents
            // are loaded in. However, after reloading the window it worked as intended.
            // Probably need refactoring in the future due to performance concerns?
            setFolders([...newFolders ?? []])
        }

    }

    const removeRemoteFolder = async () => {
        if (window.confirm("Are you sure you want to unlink this folder?")) {
            setIsLoading(true)

            remoteFolder.setRootFolder(null)

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

    const toggleFolder = (folder: FileEntry) => {
        if (folder.showChildren) {
            return closeFolder(folder)
        } else {
            return openFolder(folder)
        }
    }

    const openFolder = async (folder: FileEntry, updateState = true) => {
        folder.showChildren = true

        // will only fetch folder content once
        if (folder.children == null) {
            await updateFolderView()
            await remoteFolder
                .getFiles(folder.remotePath)
                .catch(e => console.log(e))
        }
        updateState && await updateFolderView()
    }

    const closeFolder = async (folder: FileEntry, updateState = true) => {
        folder.showChildren = false
        updateState && await updateFolderView()
    }

    /**
     * Open a file and returns whether a new file was opened
     * @param file - {@link FileEntry}
     */
    const selectFile = async (file: FileEntry): Promise<boolean> => {
        if (file.isDir) {
            return toggleFolder(file)
                .then(() => true)
                .catch(() => false)
        }
        if (currentFile != null && currentFile.remotePath === file.remotePath) return false

        if (currentFile?.modified && !window.confirm("Are you sure you want to discard your changes?")) {
            return false
        }

        const link = remoteFolder.getRemoteFilePath(file)
        setFileParam(link ?? null)

        return true
    }

    const expandAll = async () => {
        await Promise.all(folders?.map(reduceFolders((folder) => openFolder(folder, false))) ?? [])
        await updateFolderView()
    }

    const minimizeAll = async () => {
        await Promise.all(folders?.map(reduceFolders((folder) => closeFolder(folder, false))) ?? [])
        await updateFolderView()
    }

    const reduceFolders = (f: (folder: FileEntry) => any) => {
        const g = async (folder: FileEntry): Promise<void> => {
            if (!folder.isDir) return

            await f(folder)

            for (const child of folder.children ?? []) {
                await g(child)
            }
        }

        return g
    }

    useEffect(() => {
        updateFolderView().then()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        folders,
        rootFolder,
        isLoading,
        showSideBar,
        removeRemoteFolder,
        reload,
        selectFile,
        importFolder,
        openFolder: toggleFolder,
        setShowSideBar,
        expandAll,
        minimizeAll
    }
}