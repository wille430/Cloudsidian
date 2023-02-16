import {FileEntry} from "./FileEntry";

export interface RootFolder {
    name: string
    remoteUrl: string
    children?: FileEntry[]
}