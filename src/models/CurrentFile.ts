import {FileEntry} from "./FileEntry";

export interface CurrentFile extends FileEntry {
    modified: boolean
    originalContent: string | null
}