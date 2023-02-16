import {createContext, HTMLAttributes, useContext} from "react";
import {useFileExplorer} from "../hooks/useFileExplorer";
import {RemoteFolder} from "../services/RemoteFolder";

// @ts-ignore
export const FileExplorerContext = createContext<ReturnType<typeof useFileExplorer>>()

export const useFileExplorerContext = () => useContext(FileExplorerContext)

interface FileExplorerProviderProps extends HTMLAttributes<HTMLDivElement> {
    remoteFolder: RemoteFolder
}

export const FileExplorerProvider = (props: FileExplorerProviderProps) => {
    const {remoteFolder, ...rest} = props
    const fileExplorer = useFileExplorer(remoteFolder)

    return (
        <FileExplorerContext.Provider value={fileExplorer} {...rest}/>
    )
}
