import {Dropbox, DropboxAuth} from "dropbox";
import {DropboxConfig} from "./DropboxConfig";
import {DropboxTokenResponse} from "./interfaces/DropboxTokenResponse";
import {StorageItem} from "../services/StorageItem";

export interface IDropboxAuthService {

    /**
     * Calls the Dropbox API and exchanges the {@link code} with a
     * short-lived access token, and stores it in session storage
     * @param code
     */
    getOauth2Token(code: string): Promise<void>

    getAuthorizationUrl(): Promise<string>

    getAccessToken(): string | null

    isAuthenticated(): boolean

    signOut(): Promise<void>
}

export class DropboxAuthService implements IDropboxAuthService {

    private readonly dropbox: Dropbox;
    private readonly dropboxAuth: DropboxAuth;
    private readonly CODE_VERIFIER_KEY = "code_verifier";
    private readonly AUTH_INFO_KEY = "auth_info";
    public static readonly ACCESS_TOKEN: string = "access_token";
    private readonly codeVerifier = new StorageItem<string>(sessionStorage, this.CODE_VERIFIER_KEY)

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

        this.setCodeVerifier(this.dropboxAuth.getCodeVerifier())

        return url;
    }

    public async getOauth2Token(code: string): Promise<void> {
        this.dropboxAuth.setCodeVerifier(this.getCodeVerifier())
        const res = await this.dropboxAuth.getAccessTokenFromCode(DropboxConfig.REDIRECT_URI, code)
        this.setAuthInfo({
            ...res.result,
            expires: new Date(Date.now() + (res.result as DropboxTokenResponse).expires_in * 1000)
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
        const codeVerifier = this.codeVerifier.get()

        if (codeVerifier == null) {
            throw new Error(`Item with key ${this.CODE_VERIFIER_KEY} is missing from session storage. This is probably due to an incomplete sign in flow.`)
        }

        return codeVerifier;
    }

    private setCodeVerifier(codeVerifier: string | null) {
        this.codeVerifier.set(codeVerifier)
        console.log(this.codeVerifier.get())
        console.assert(this.codeVerifier.get() === codeVerifier)
    }

    public isAuthenticated(): boolean {
        const authInfo = this.getAuthInfo();
        return authInfo != null && Date.now() < new Date(authInfo.expires).getTime();
    }

    public async signOut(): Promise<void> {
        this.setAuthInfo(null)
    }

    public getAccessToken(): string | null {
        return this.getAuthInfo()?.access_token as string | null
    }
}
