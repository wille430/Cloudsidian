import {FileExplorer, FolderEntry} from "./FileExplorer";
import {marked} from "marked";

export class FileEditor {

    private readonly fileExplorer: FileExplorer
    private currentFile: FolderEntry | null = null

    constructor(fileExplorer: FileExplorer) {
        this.fileExplorer = fileExplorer
    }

    public async openFile(file: FolderEntry): Promise<string | null> {
        if (file.isDir) {
            return null
        }

        const content = await this.fileExplorer.getFileContents(file)

        if (content) {
            // file.content = content // not sure if this is necessary
            this.currentFile = file
            file.content = content
            return marked.parse(content)
        }

        return null
    }
}