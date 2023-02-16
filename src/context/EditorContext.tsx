import {createContext, HTMLAttributes, useContext} from "react";
import {useEditor} from "../hooks/useEditor";
import {IMarkdownParser} from "../services/ObsidianParser";
import {RemoteFolder} from "../services/RemoteFolder";

// @ts-ignore
export const EditorContext = createContext<ReturnType<typeof useEditor>>()

export const useEditorContext = () => useContext(EditorContext)

interface EditorProviderProps extends HTMLAttributes<HTMLDivElement> {
    markdownParser: IMarkdownParser
    remoteFolder: RemoteFolder
}

export const EditorProvider = (props: EditorProviderProps) => {
    const {markdownParser, remoteFolder, ...rest} = props
    const editor = useEditor(markdownParser, remoteFolder)

    return (
        <EditorContext.Provider value={editor} {...rest}/>
    )
}