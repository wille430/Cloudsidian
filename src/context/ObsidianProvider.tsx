import {HTMLAttributes} from "react";
import {RemoteFolder} from "../services/RemoteFolder";
import {EditorProvider} from "./EditorContext";
import {FileExplorerProvider} from "./FileExplorerContext";
import {IMarkdownParser} from "../services/ObsidianParser";

interface ObsidianProviderProps extends HTMLAttributes<HTMLDivElement> {
    remoteFolder: RemoteFolder,
    markdownParser: IMarkdownParser
}

export const ObsidianProvider = (props: ObsidianProviderProps) => {
    const {remoteFolder, markdownParser, ...rest} = props

    return (
        <EditorProvider markdownParser={markdownParser} remoteFolder={remoteFolder}>
            <FileExplorerProvider remoteFolder={remoteFolder}  {...rest}>
            </FileExplorerProvider>
        </EditorProvider>
    )
}
