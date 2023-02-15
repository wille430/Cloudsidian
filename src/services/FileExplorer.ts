import {FileEntry, RemoteFolder, RootFolder} from "./RemoteFolder";

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

    public setRemoteFolder(folder: RootFolder | null) {
        return this.remoteFolder.setRootFolder(folder)
    }

    public async getRemoteFilePath(file: FileEntry) {
        return this.remoteFolder.getRemoteFilePath(file)
    }
}