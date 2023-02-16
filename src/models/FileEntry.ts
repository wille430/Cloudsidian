export interface FileEntry {
    name: string
    isDir: boolean
    remotePath?: string
    content: string | null
    children?: FileEntry[]
    showChildren?: boolean
}