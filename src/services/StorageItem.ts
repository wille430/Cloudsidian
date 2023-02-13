export class StorageItem<T> {
    private readonly storage: globalThis.Storage
    private readonly key: string

    constructor(storage: globalThis.Storage, key: string) {
        this.storage = storage
        this.key = key
    }

    public set(obj: T | null) {
        return this.storage.setItem(this.key, JSON.stringify(obj))
    }

    public get(): T | null {
        const item = this.storage.getItem(this.key)
        if (item == null) return null

        try {
            return JSON.parse(item)
        } catch (e) {
            return item as T
        }
    }
}