import {IDBPDatabase, openDB} from "idb";

export class Database {

    private readonly databaseName: string
    private _db: IDBPDatabase | null = null

    constructor(databaseName: string) {
        this.databaseName = databaseName
    }

    public async getDb() {
        if (this._db == null) {
            this._db = await openDB(this.databaseName, 1, {})
        }

        return this._db
    }
}