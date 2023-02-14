import {flow} from "lodash";
import {FileExplorer} from "./FileExplorer";

export interface IMarkdownParser {
    parse(md: string): Promise<string>
}

export class ObsidianParser implements IMarkdownParser {
    public static readonly ObsidianLink = new RegExp(/\[\[(.*)]]/g)
    private readonly fileExplorer: FileExplorer

    constructor(fileExplorer: FileExplorer) {
        this.fileExplorer = fileExplorer
    }

    public parse = flow(
        this.parseFileLinks
    )

    private async parseFileLinks(md: string) {
        const it = md.matchAll(ObsidianParser.ObsidianLink)

        let next = it.next()
        while (!next.done) {
            const match = next.value.at(0)
            const filename = next.value.at(1)

            // TODO: support images in the future
            const fileExt = ".md"

            if (filename && match) {
                const link = await this.fileExplorer.getFileLink(filename + fileExt)
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