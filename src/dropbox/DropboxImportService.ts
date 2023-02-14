import {Dropbox, files} from "dropbox";
import {FileEntry} from "../services/RemoteFolder";

export interface IImportService {
    fetchFolder(url: string): Promise<FileEntry[]>

    fetchFile(path: string): Promise<FileEntry>
}

export class DropboxImportService implements IImportService {
    private readonly dropbox: Dropbox

    constructor(dropboxAccessToken: string) {
        console.assert(dropboxAccessToken, "dropboxAccessToken can't be null")
        this.dropbox = new Dropbox({
            accessToken: dropboxAccessToken
        })
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

    public async fetchFolder(url: string): Promise<FileEntry[]> {
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

        console.log(res.result)

        const blob = (res.result as any).fileBlob as Blob
        return {
            name: res.result.name,
            isDir: false,
            remotePath: res.result.path_lower,
            content: await blob.text()
        }
    }
}