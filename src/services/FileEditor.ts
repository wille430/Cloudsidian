import {FolderEntry} from "./FileExplorer";
import {IMarkdownParser} from "./ObsidianParser";
import {RemoteFolder} from "./RemoteFolder";

export class FileEditor {
    private readonly remoteFolder: RemoteFolder
    private readonly parser: IMarkdownParser
    private currentFile: FolderEntry | null = null

    constructor(remoteFolder: RemoteFolder, parser: IMarkdownParser) {
        this.remoteFolder = remoteFolder
        this.parser = parser
    }

    public async setCurrentFile(filePath: string | null): Promise<void> {
        if (filePath == null) {
            this.currentFile = null
            return
        }
        const file = await this.remoteFolder.getFile(filePath)

        if (file != null && file.content == null) {
            await this.remoteFolder.getStringContents(file)
        }

        this.currentFile = file
    }

    public async getCurrentFile(): Promise<FolderEntry | null> {
        return this.currentFile
    }

    public async getHtml(): Promise<string | null> {
        if (this.currentFile == null) return null

        console.assert(this.currentFile.content)
        return this.parser.parse(this.currentFile.content!)
    }

    public setContent(content: string): void {
        console.assert(this.currentFile)
        this.currentFile!.content = content
    }
}