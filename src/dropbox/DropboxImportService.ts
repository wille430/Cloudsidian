import {Dropbox, files} from "dropbox";
import {FileEntry} from "../models/FileEntry";

export interface IImportService {
    fetchFolderWithUrl(url: string): Promise<FileEntry[]>

    fetchFolderWithPath(path: string): Promise<FileEntry[]>

    fetchFile(path: string): Promise<FileEntry>

    saveFile(file: FileEntry): Promise<void>;
}

export class DropboxImportService implements IImportService {
    private readonly dropbox: Dropbox

    constructor(dropboxAccessToken: string) {
        console.assert(dropboxAccessToken, "dropboxAccessToken can't be null")
        this.dropbox = new Dropbox({
            accessToken: dropboxAccessToken
        })
    }

    public async saveFile(file: FileEntry): Promise<void> {
        if (file.isDir) throw new Error(`${file.name} is a folder`)
        if (file.content == null)
            throw new Error(`${file.name} has no content to save`)
        if (file.remotePath == null)
            throw new Error(`Unable to find remote path for file ${file.name}. This file might not exist on the remote. Please create it first.`)

        const remoteFile = await this.fetchFile(file.remotePath)
        if (file.content === remoteFile.content) return

        const res = await this.dropbox.filesUpload({
            path: file.remotePath,
            autorename: false,
            contents: file.content,
            mode: "overwrite" as any
        })

        if (res.status !== 200) {
            throw new Error(`Dropbox API returned with status code ${res.status}`)
        }
    }

    private async getDirectoryContents(link: string): Promise<files.ListFolderResult> {
        const res = await this.dropbox.filesListFolder({
            path: "",
            shared_link: {
                url: link,
            }
        })
        return res.result
    }

    public async fetchFolderWithUrl(url: string): Promise<FileEntry[]> {
        const {entries, has_more} = await this.getDirectoryContents(url)
        if (has_more) {
            console.warn("Not all folder contents were returned from", url)
        }

        return entries.map(o => ({
            name: o.name,
            isDir: o[".tag"] === "folder",
            remotePath: o["path_lower"],
            content: null
        }))
    }

    public async fetchFile(path: string): Promise<FileEntry> {
        const res = await this.dropbox.filesDownload({
            path: path
        })

        if (res.status !== 200) {
            throw new Error(`Could not fetch file on path ${path}`)
        }

        const blob = (res.result as any).fileBlob as Blob
        return {
            name: res.result.name,
            isDir: false,
            remotePath: res.result.path_lower,
            content: await blob.text()
        }
    }

    public async fetchFolderWithPath(path: string): Promise<FileEntry[]> {
        const res = await this.dropbox.filesListFolder({
            path: path,
        })
        const {entries} = res.result

        return entries.map(o => ({
            name: o.name,
            isDir: o[".tag"] === "folder",
            remotePath: o["path_lower"],
            content: null
        }))

    }
}