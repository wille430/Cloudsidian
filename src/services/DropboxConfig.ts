export class DropboxConfig {
    public static CLIENT_ID = "47hs9187iqriqj3"
    public static REDIRECT_PATH = "/auth/dropbox-signin"
    public static REDIRECT_URI = `http://localhost:3000${DropboxConfig.REDIRECT_PATH}`
    public static CODE_KEY = "code"
}