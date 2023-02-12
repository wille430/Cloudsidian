import {Dropbox, DropboxAuth} from "dropbox";
import {DropboxConfig} from "./DropboxConfig";

export interface IDropboxAuthService {

    /**
     * Calls the Dropbox API and exchanges the {@link code} with a
     * short-lived access token, and stores it in session storage
     * @param code
     */
    getOauth2Token(code: string): Promise<void>

    getAuthorizationUrl(): Promise<string>

    isAuthenticated(): boolean

    signOut(): Promise<void>
}

export interface DropboxTokenResponse {
    access_token: string,
    expires_in: number,
    token_type: string
    scope?: string
    account_id: string
    uid: string,
    expires: Date
}

export class DropboxAuthService implements IDropboxAuthService {

    private readonly dropbox: Dropbox;
    private readonly dropboxAuth: DropboxAuth;
    private readonly CODE_VERIFIER_KEY = "code_verifier";
    private readonly AUTH_INFO_KEY = "auth_info";
    public static readonly ACCESS_TOKEN: string = "access_token";

    constructor() {
        this.dropbox = new Dropbox();
        this.dropboxAuth = new DropboxAuth()
        this.dropboxAuth.setClientId(DropboxConfig.CLIENT_ID)
    }

    public async getAuthorizationUrl(): Promise<string> {
        const url = await this.dropboxAuth.getAuthenticationUrl(
            DropboxConfig.REDIRECT_URI,
            DropboxConfig.REDIRECT_URI,
            "code",
            undefined,
            undefined,
            undefined,
            true
        ) as string;

        sessionStorage.setItem(this.CODE_VERIFIER_KEY, this.dropboxAuth.getCodeVerifier())

        return url;
    }

    public async getOauth2Token(code: string): Promise<void> {

        if (this.dropboxAuth.getCodeVerifier() == null) {
            this.dropboxAuth.setCodeVerifier(this.getCodeVerifier())
        }

        const res = await this.dropboxAuth.getAccessTokenFromCode(DropboxConfig.REDIRECT_URI, code)
        this.setAuthInfo({
            ...res.result,
            expires: new Date(Date.now() + (res.result as DropboxTokenResponse).expires_in)
        } as any)
    }

    private getAuthInfo(): DropboxTokenResponse | null {
        try {
            const item = sessionStorage.getItem(this.AUTH_INFO_KEY);
            return item != null ? JSON.parse(item) : null;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    private setAuthInfo(obj: DropboxTokenResponse | null): void {
        if (obj == null) {
            sessionStorage.removeItem(this.AUTH_INFO_KEY);
            return;
        }
        sessionStorage.setItem(this.AUTH_INFO_KEY, JSON.stringify(obj));
    }


    private getCodeVerifier() {
        const codeVerifier = sessionStorage.getItem(this.CODE_VERIFIER_KEY)

        if (codeVerifier == null) {
            throw new Error(`Item with key ${this.CODE_VERIFIER_KEY} is missing from session storage. This is probably due to an incomplete sign in flow.`)
        }

        return codeVerifier;
    }

    public isAuthenticated(): boolean {
        const authInfo = this.getAuthInfo();
        return authInfo != null && Date.now() < new Date(authInfo.expires).getTime();
    }

    public async signOut(): Promise<void> {
        this.setAuthInfo(null)
    }
}
