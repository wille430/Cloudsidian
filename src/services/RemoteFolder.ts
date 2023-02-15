import {IImportService} from "../dropbox/DropboxImportService";
import {StorageItem} from "./StorageItem";
import {takeWhile} from "lodash";

export interface RootFolder {
    name: string
    remoteUrl: string
    children?: FileEntry[]
}

export interface FileEntry {
    name: string
    isDir: boolean
    remotePath?: string
    content: string | null
    children?: FileEntry[]
    showChildren?: boolean
    isLoading?: boolean
}

interface IRemoteFolder {
    /**
     * Get a list of files/folders by path
     */
    getFiles(path: string | null): Promise<FileEntry[] | null>

    getStringContents(file: FileEntry): Promise<string | null>

    getLocalFileLink(path: string | null): Promise<string | null>

    getRemoteFilePath(file: FileEntry): string | null

    getFile(path: string | null): Promise<FileEntry | null>

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
        const pathSegments = this.getPathSegments(path)
        const folderContents = await this.getFolderContents()
        return this.getFileHelper(pathSegments, folderContents)
    }

    private async getFileHelper(segments: string[], folderContents: FileEntry[]): Promise<FileEntry | null> {
        if (segments.length === 0) throw new Error("Could not find file")

        const fileName = segments.shift()
        const file = folderContents.find(o => o.name.toUpperCase() === fileName?.toUpperCase())
        if (segments.length === 0 || file == null) return file ?? null

        if (!file.isDir) throw new Error(`${file.name} is not a directory`)
        return this.getFileHelper(segments, file.children ?? [])
    }

    public async setFile(path: string, file: FileEntry): Promise<void> {
        const folderContents = await this.getFolderContents()
        const segments = this.getPathSegments(path)
        await this.setFileHelper(segments, folderContents, file)
        this.setFolderContents([...folderContents])
    }

    private async setFileHelper(segments: string[], folderContents: FileEntry[], newFile: FileEntry): Promise<void> {
        if (segments.length === 0) throw new Error("Could not find file")

        const fileIndex = folderContents.findIndex(o => o.name.toUpperCase() === newFile.name.toUpperCase())
        if (segments.length === 0 || fileIndex !== -1) {
            folderContents[fileIndex] = newFile
            return
        }
        const fileName = segments.shift()
        const next = folderContents.find(o => o.name.toUpperCase() === fileName!.toUpperCase())

        return this.setFileHelper(segments, next?.children ?? [], newFile)
    }

    public async getFiles(path: string | null = null): Promise<FileEntry[] | null> {
        if (path == null) {
            return this.getFolderContents()
        }

        const folder = await this.getFile(path)
        if (!folder?.isDir) throw new Error(`${path} is not a directory`)

        if (folder.children == null) {
            folder.children = await this.getRemoteFolderContents(path) ?? []

            if (folder.remotePath != null) {
                await this.setFile(folder.remotePath, folder)
            }
        }
        return folder.children
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

    private async getRemoteFolderContents(path: string | null = null): Promise<FileEntry[]> {
        if (path) {
            return this.importService.fetchFolderWithPath(path)
        }

        const rootFolder = this.getRootFolder()
        if (rootFolder == null) {
            throw new Error("Remote folder url is not set. Cannot fetch files.")
        }

        return this.importService.fetchFolderWithUrl(rootFolder.remoteUrl)
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
            if (file.remotePath != null) {
                await this.setFile(file.remotePath, file)
            }
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }

    private getPathSegments(path: string) {
        const rootFolder = this.getRootFolder()
        return takeWhile(path.split("/").slice(1).reverse(), (o) => {
            if (rootFolder?.name == null) return true
            return o.toUpperCase() !== rootFolder.name.toUpperCase()
        }).reverse()
    }
}