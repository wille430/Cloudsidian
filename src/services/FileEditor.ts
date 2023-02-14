import {FileExplorer, FolderEntry} from "./FileExplorer";
import {marked} from "marked";
import {IMarkdownParser} from "./ObsidianParser";

export class FileEditor {

    private readonly fileExplorer: FileExplorer
    private readonly parser: IMarkdownParser
    private currentFile: FolderEntry | null = null

    constructor(fileExplorer: FileExplorer, parser: IMarkdownParser) {
        this.fileExplorer = fileExplorer
        this.parser = parser
    }

    public async openFile(filePath: string): Promise<string | null> {
        const file = await this.fileExplorer.getFile(filePath)
        if (file == null || file.isDir) {
            return null
        }

        const content = await this.fileExplorer.getFileContents(file)

        if (content) {
            // file.content = content // not sure if this is necessary
            this.currentFile = file
            file.content = content
            return marked.parse(await this.parser.parse(content))
        }

        return null
    }
}