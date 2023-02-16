export class DropboxConfig {
    public static CLIENT_ID = "8h765h9g88sgqhp"
    public static REDIRECT_PATH = "/auth/dropbox-signin"
    // process.env.URL is set in Netlify build environment
    public static REDIRECT_URI = `${window.location.origin ?? "http://localhost:3000"}${DropboxConfig.REDIRECT_PATH}`
    public static CODE_KEY = "code"
}