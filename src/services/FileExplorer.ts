import {RemoteFolder} from "./RemoteFolder";

export interface RootFolder {
    name: string
    remoteUrl: string
}

export interface FolderEntry {
    name: string
    isDir: boolean
    remotePath?: string
    content: string | null
}

export class FileExplorer {
    private readonly remoteFolder: RemoteFolder

    constructor(remoteFolder: RemoteFolder) {
        this.remoteFolder = remoteFolder
    }

    public async listDirectory(): Promise<FolderEntry[] | null> {
        return this.remoteFolder.getFiles()
    }

    public getRootFolder() {
        return this.remoteFolder.getRootFolder()
    }

    public async refetch() {
        return this.remoteFolder.sync()
    }

    public removeRemoteFolder() {
        this.remoteFolder.setRootFolder(null)
    }
}