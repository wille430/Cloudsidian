import {FolderEntry} from "./FileExplorer";
import {marked} from "marked";
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

    public async openFile(filePath: string): Promise<string | null> {
        const file = await this.remoteFolder.getFile(filePath)
        if (file == null || file.isDir) {
            return null
        }

        const content = await this.remoteFolder.getStringContents(file)

        if (content) {
            // file.content = content // not sure if this is necessary
            this.currentFile = file
            file.content = content
            return marked.parse(await this.parser.parse(content))
        }

        return null
    }
}