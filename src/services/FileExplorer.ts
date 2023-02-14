import {IImportService} from "../dropbox/DropboxImportService";
import {Database} from "./Database";
import {StorageItem} from "./StorageItem";

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
    private readonly importService: IImportService
    private readonly database: Database
    private _rootFolder: RootFolder | null = null
    private readonly entities: StorageItem<FolderEntry[]>
    private readonly rootFolder: StorageItem<RootFolder>

    private _entries: FolderEntry[] | null = null
    private static ENTRIES_STORE_KEY = "file-explorer-entries"
    private static URL_STORE_KEY = "remote-folder-url"

    constructor(importService: IImportService, database: Database) {
        this.importService = importService
        this.database = database
        this.entities = new StorageItem<FolderEntry[]>(sessionStorage, FileExplorer.ENTRIES_STORE_KEY)
        this.rootFolder = new StorageItem<RootFolder>(localStorage, FileExplorer.URL_STORE_KEY)
    }

    public async getEntries(take: number | null = null): Promise<FolderEntry[]> {
        if (!this._entries) {
            this._entries = await this.getRemoteEntries()
        }

        if (take) {
            return this._entries.splice(0, take)
        }

        return this._entries
    }

    private setEntries(entities: FolderEntry[] | null) {
        this._entries = entities
        this.entities.set(entities)
    }

    public setRootFolder(folder: RootFolder | null) {
        this._rootFolder = folder
        this.rootFolder.set(folder)
    }

    public getRootFolder() {
        if (this._rootFolder == null) {
            this._rootFolder = this.rootFolder.get()
        }

        return this._rootFolder
    }

    public async updateFolder(): Promise<void> {
        this.entities.set(await this.getRemoteEntries())
    }

    private async getRemoteEntries(): Promise<FolderEntry[]> {
        const cached = this.entities.get()
        if (cached) {
            return cached
        }

        const rootFolder = this.getRootFolder()
        if (rootFolder == null) {
            throw new Error("Remote folder url is not set. Cannot fetch files.")
        }

        const entries = await this.importService.fetchFolder(rootFolder.remoteUrl)
        this.entities.set(entries)
        return entries
    }

    public async refetch() {
        this.entities.set(null)
        return this.getRemoteEntries()
    }

    public removeRemoteFolder() {
        this.setRootFolder(null)
        this.setEntries(null)
    }

    public async getFileContents(folderEntry: FolderEntry): Promise<string | null> {
        if (folderEntry.isDir || folderEntry.remotePath == null) return null
        if (folderEntry.content != null) return folderEntry.content

        const newFile = await this.importService.fetchFile(folderEntry.remotePath)
        await this.replaceOrInsertEntries(newFile)
        folderEntry.content = newFile.content

        return newFile.content
    }

    private async replaceOrInsertEntries(entity: FolderEntry) {
        const entries = await this.getEntries()
        const index = entries.findIndex(o => o.remotePath === entity.remotePath || o.name === entity.name)

        if (index !== -1) {
            entries[index] = entity
        }

        await this.setEntries(entries)
    }

    public async getFileLink(fileName: string): Promise<string | null> {
        const entries = await this.getEntries()
        const entry = entries.find(o => !o.isDir && o.name === fileName)
        if (entry == null) return null
        return `/?file=${this.getFilePath(entry)}`
    }

    public getFilePath(file: FolderEntry) {
        return file.remotePath
    }

    public async getFile(path: string): Promise<FolderEntry | null> {
        const entries = await this.getEntries()
        console.log("searching for", path)
        return entries.find(o => !o.isDir && o.remotePath === path) ?? null
    }
}