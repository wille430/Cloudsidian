import {createContext, HTMLAttributes, useContext} from "react";
import {useObsidian} from "../hooks/useObsidian";
import {RemoteFolder} from "../services/RemoteFolder";

// @ts-ignore
export const ObsidianContext = createContext<ReturnType<typeof useObsidian>>()

export const useObsidianContext = () => useContext(ObsidianContext)

export const ObsidianProvider = (props: HTMLAttributes<HTMLDivElement> & { remoteFolder: RemoteFolder }) => {
    const {remoteFolder, ...rest} = props
    const obsidian = useObsidian(remoteFolder)

    return (
        <ObsidianContext.Provider value={obsidian} {...rest}/>
    )
}