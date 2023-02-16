import {RemoteFolder} from "./RemoteFolder";
import {asyncPipe} from "../utils";

export interface IMarkdownParser {
    parse(md: string): Promise<string>
}

export class ObsidianParser implements IMarkdownParser {
    public static readonly ObsidianLink = new RegExp(/\[\[([^[]*)]]/g)
    private static readonly FILE_EXT: string = ".md"
    private readonly remoteFolder: RemoteFolder

    constructor(remoteFolder: RemoteFolder) {
        this.remoteFolder = remoteFolder
    }

    public async parse(md: string): Promise<string> {
        const {marked} = await import("marked")
        // always bind this
        return asyncPipe(
            this.parseFileLinks.bind(this),
            marked.parse
        )(md)
    }

    private async parseFileLinks(md: string) {
        const it = md.matchAll(ObsidianParser.ObsidianLink)

        let next = it.next()
        while (!next.done) {
            const match = next.value.at(0)
            const filename = next.value.at(1)

            if (filename && match) {
                const link = await this.remoteFolder.getLocalFileLink(filename + ObsidianParser.FILE_EXT)
                if (link == null) {
                    md = md.replaceAll(match, `<a class="mx-1 text-muted" href="#">${filename}</a>`)
                } else {
                    md = md.replaceAll(match, `<a class="mx-1 link-info" href="${link}">${filename}</a>`)
                }
            }

            next = it.next()
        }

        return md
    }
}