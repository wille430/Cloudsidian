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

    const handleClick = () => {
        // @ts-ignore
        (Dropbox as any).choose(options)
    }

    return (
        <button className="btn btn-xs btn-dropbox" onClick={handleClick}>
            <i className="fa-brands fa-dropbox mr-2"/>
            <span>Import folder</span>
        </button>
    )

}