import {FileEntry, RemoteFolder, RootFolder} from "./RemoteFolder";

export class FileExplorer {
    private readonly remoteFolder: RemoteFolder
    constructor(remoteFolder: RemoteFolder) {
        this.remoteFolder = remoteFolder
    }

    public async listDirectory(folder: FileEntry | null = null): Promise<FileEntry[]> {
        if (folder == null) {
            return await this.remoteFolder.getFiles() ?? []
        } else {
            return await this.remoteFolder.getFiles(folder.remotePath) ?? []
        }
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