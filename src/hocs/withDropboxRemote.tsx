import {useDropboxAuth} from "../hooks/useDropboxAuth";
import flow from "lodash/flow";
import {withDropboxAuth} from "./withDropboxAuth";
import {ObsidianProvider} from "../context/ObsidianProvider";
import {ComponentType, useMemo} from "react";
import {RemoteFolder} from "../services/RemoteFolder";
import {DropboxImportService} from "../dropbox/DropboxImportService";
import {ObsidianParser} from "../services/ObsidianParser";

const withDropboxRemoteBase = <P extends object>(Component: ComponentType<P>) => (props: P) => {
    const {accessToken} = useDropboxAuth()

    const remoteFolder = useMemo(() => {
        if (accessToken == null) return null
        return new RemoteFolder(new DropboxImportService(accessToken))
    }, [accessToken])

    const markdownParser = useMemo(() => {
        if (remoteFolder == null) return null
        return new ObsidianParser(remoteFolder)
    }, [remoteFolder])

    if (remoteFolder == null || markdownParser == null) return null

    return (
        <ObsidianProvider remoteFolder={remoteFolder} markdownParser={markdownParser}>
            <Component {...props}/>
        </ObsidianProvider>
    )
}

export const withDropboxRemote = flow(withDropboxRemoteBase, withDropboxAuth)