import {FileEntry, RemoteFolder} from "./RemoteFolder";

export class FileExplorer {
    private readonly remoteFolder: RemoteFolder

    constructor(remoteFolder: RemoteFolder) {
        this.remoteFolder = remoteFolder
    }

    public async listDirectory(): Promise<FileEntry[] | null> {
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