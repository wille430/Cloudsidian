import {Dropbox, files} from "dropbox";
import {FolderEntry} from "../services/FileExplorer";

export interface IImportService {
    import(url: string): Promise<FolderEntry[]>
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

    public async import(url: string): Promise<FolderEntry[]> {
        const {entries, has_more} = await this.getDirectoryContents(url)
        if (has_more) {
            console.warn("Not all folder contents were returned from", url)
        }

        return entries.map(o => ({
            name: o.name,
            isDir: o[".tag"] === "folder"
        }))
    }
}