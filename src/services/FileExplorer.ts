import {IImportService} from "../dropbox/DropboxImportService";
import {Database} from "./Database";
import {StorageItem} from "./StorageItem";

export interface RootFolder extends FolderEntry {
    remoteUrl: string
}

export interface FolderEntry {
    name: string,
    isDir: boolean
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
        if (!take) take = 100
        return this._entries.splice(0, take)
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

    private async getRemoteEntries(): Promise<FolderEntry[]> {
        const cached = this.entities.get()
        if (cached) {
            return cached
        }

        const rootFolder = this.getRootFolder()
        if (rootFolder == null) {
            throw new Error("Remote folder url is not set. Cannot fetch files.")
        }

        const entries = await this.importService.import(rootFolder.remoteUrl)
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
}