import {useEffect} from "react";
import {DropboxChooserResponse} from "../dropbox/interfaces/DropboxChooserResponse";

interface DropboxChooserOptions {
    success: (files: DropboxChooserResponse[]) => any
    cancel?: () => any
    linkType?: "preview" | "direct"
    multiselect?: boolean
    extensions?: (".pdf" | ".dox" | ".docx" | ".md")[]
    folderselect?: boolean,
    sizeLimit?: number
}

export const DropboxChooser = (options: DropboxChooserOptions) => {

    useEffect(() => {
        // @ts-ignore
        const button = (Dropbox as any).createChooseButton(options);
        // @ts-ignore
        const ele = document.getElementById("dropbox-chooser")
        if (!ele?.hasChildNodes()) {
            ele?.appendChild(button)
        }
    }, [options])

    return <div id="dropbox-chooser"></div>
}