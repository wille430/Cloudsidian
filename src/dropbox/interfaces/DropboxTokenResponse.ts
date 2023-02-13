export interface DropboxTokenResponse {
    access_token: string,
    expires_in: number,
    token_type: string
    scope?: string
    account_id: string
    uid: string,
    expires: Date
}