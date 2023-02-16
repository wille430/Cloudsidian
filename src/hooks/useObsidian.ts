import {useMemo} from "react";
import {RemoteFolder} from "../services/RemoteFolder";
import {FileEditor} from "../services/FileEditor";
import {ObsidianParser} from "../services/ObsidianParser";

export const useObsidian = (remoteFolder: RemoteFolder) => {
    const fileEditor = useMemo(() => {
        return new FileEditor(remoteFolder, new ObsidianParser(remoteFolder))
    }, [remoteFolder])

    return {fileEditor, remoteFolder}
}
