import {useDropboxAuth} from "../hooks/useDropboxAuth";
import {flow} from "lodash";
import {withDropboxAuth} from "./withDropboxAuth";
import {ObsidianProvider} from "../context/ObsidianContext";
import {ComponentType, useMemo} from "react";
import {RemoteFolder} from "../services/RemoteFolder";
import {DropboxImportService} from "../dropbox/DropboxImportService";

const withDropboxRemoteBase = <P extends object>(Component: ComponentType<P>) => (props: P) => {
    const {accessToken} = useDropboxAuth()

    const remoteFolder = useMemo(() => {
        if (accessToken == null) return null
        return new RemoteFolder(new DropboxImportService(accessToken))
    }, [accessToken])

    if (remoteFolder == null) return null

    return (
        <ObsidianProvider remoteFolder={remoteFolder}>
            <Component {...props}/>
        </ObsidianProvider>
    )
}

export const withDropboxRemote = flow(withDropboxRemoteBase, withDropboxAuth)