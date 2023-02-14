import {IImportService} from "../dropbox/DropboxImportService";
import {StorageItem} from "./StorageItem";

export interface RootFolder {
    name: string
    remoteUrl: string
}

export interface FileEntry {
    name: string
    isDir: boolean
    remotePath?: string
    content: string | null
}

interface IRemoteFolder {
    /**
     * Get a list of files/folders by path
     * @param relativePath - The path relative to the root folder
     */
    getFiles(relativePath: string | null): Promise<FileEntry[] | null>

    getStringContents(file: FileEntry): Promise<string | null>

    getLocalFileLink(filename: string): Promise<string | null>

    getRemoteFilePath(file: FileEntry): string | null

    getFile(path: string): Promise<FileEntry | null>

    getRootFolder(): RootFolder | null

    setRootFolder(folder: RootFolder | null): void

    saveFile(file: FileEntry): Promise<boolean>

    /**
     * Writes current changes to remote and fetches remote folder contents.
     * Conflicts will be solved by making a copy of the original file.
     */
    sync(): Promise<void>
}

export class RemoteFolder implements IRemoteFolder {

    private static ENTRIES_STORE_KEY = "file-explorer-entries"
    private static URL_STORE_KEY = "remote-folder-url"

    private readonly importService: IImportService
    private readonly folderContents: StorageItem<FileEntry[]>
    private _folderContents: FileEntry[] | null = null
    private readonly rootFolder: StorageItem<RootFolder>
    private _rootFolder: RootFolder | null = null

    constructor(importService: IImportService) {
        this.importService = importService
        this.folderContents = new StorageItem<FileEntry[]>(sessionStorage, RemoteFolder.ENTRIES_STORE_KEY)
        this.rootFolder = new StorageItem<RootFolder>(localStorage, RemoteFolder.URL_STORE_KEY)
    }

    public async getFile(path: string): Promise<FileEntry | null> {
        const folderContents = await this.getFolderContents()
        return folderContents?.find(o => o.remotePath === path) ?? null
    }

    public async getFiles(relativePath: string | null = null): Promise<FileEntry[] | null> {
        if (relativePath != null) throw new Error("Getting nested files is not implemented yet")
        return this.getFolderContents()
    }

    public async getLocalFileLink(filename: string): Promise<string | null> {
        const file = (await this.getFolderContents()).find(o => o.name === filename)
        if (file == null) return null

        return `/?file=${this.getRemoteFilePath(file)}`
    }

    public getRemoteFilePath(file: FileEntry): string | null {
        return file.remotePath ?? null
    }

    public async getStringContents(file: FileEntry): Promise<string | null> {
        if (file.isDir || file.remotePath == null) return null
        if (file.content != null) return file.content

        const res = await this.importService.fetchFile(file.remotePath)
        file.content = res.content
        return file.content
    }

    public async sync(): Promise<void> {
        this.setFolderContents(await this.getRemoteFolderContents())
    }

    private async getFolderContents(): Promise<FileEntry[]> {
        if (this._folderContents == null) {
            this._folderContents = this.folderContents.get()
        }

        if (this._folderContents == null) {
            this.setFolderContents(await this.getRemoteFolderContents())
        }

        console.assert(this._folderContents)
        return this._folderContents!
    }

    private setFolderContents(content: FileEntry[] | null): void {
        this._folderContents = content
        this.folderContents.set(content)
    }

    private async getRemoteFolderContents() {
        const rootFolder = this.getRootFolder()
        if (rootFolder == null) {
            throw new Error("Remote folder url is not set. Cannot fetch files.")
        }

        return this.importService.fetchFolder(rootFolder.remoteUrl)
    }

    public getRootFolder(): RootFolder | null {
        return this._rootFolder ?? this.rootFolder.get()
    }

    public setRootFolder(folder: RootFolder | null): void {
        this.setFolderContents(null)
        this._rootFolder = folder
        this.rootFolder.set(folder)
    }

    public async saveFile(file: FileEntry): Promise<boolean> {
        try {
            await this.importService.saveFile(file)
            let files = await this.getFolderContents()
            files = files.map(o => {
                if (o.remotePath === file.remotePath) {
                    o.content = file.content
                }
                return o
            })
            await this.setFolderContents(files)
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }
}