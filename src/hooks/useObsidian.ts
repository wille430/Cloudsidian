import {useMemo} from "react";
import {RemoteFolder} from "../services/RemoteFolder";
import {FileExplorer} from "../services/FileExplorer";
import {FileEditor} from "../services/FileEditor";
import {ObsidianParser} from "../services/ObsidianParser";

export const useObsidian = (remoteFolder: RemoteFolder) => {
    const fileExplorer = useMemo(() => {
        return new FileExplorer(remoteFolder)
    }, [remoteFolder])

    const fileEditor = useMemo(() => {
        return new FileEditor(remoteFolder, new ObsidianParser(remoteFolder))
    }, [remoteFolder])

    return {fileExplorer, fileEditor}
}