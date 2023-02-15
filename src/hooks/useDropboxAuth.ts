import {DropboxAuthService} from "../dropbox/DropboxAuthService";
import {useEffect, useMemo, useState} from "react";
import {DropboxConfig} from "../dropbox/DropboxConfig";

export const useDropboxAuth = () => {
    const dropboxAuthSvc = useMemo(() => new DropboxAuthService(), [])

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [accessToken, setAccessToken] = useState<string | null>()
    const [authUrl, setAuthUrl] = useState<string | null>()

    const signOut = async () => {
        await dropboxAuthSvc.signOut()
        updateAuthState()
    }

    const updateAuthState = () => {
        setIsLoggedIn(dropboxAuthSvc.isAuthenticated())
        setAccessToken(dropboxAuthSvc.getAccessToken())
        setIsReady(true)
    }

    /**
     * @return boolean - Returns true if the oauth token was successfully fetched
     */
    const getOauthTokenFromCode = async (): Promise<boolean> => {
        const code = new URL(window.location.toString()).searchParams.get(DropboxConfig.CODE_KEY)
        if (code == null) return false

        try {
            await dropboxAuthSvc.getOauth2Token(code)
            return true
        } catch (e) {
            console.log(e)
            return false
        } finally {
            updateAuthState()
        }
    }

    useEffect(() => {
        dropboxAuthSvc.getAuthorizationUrl().then(setAuthUrl)
    }, [dropboxAuthSvc])

    useEffect(() => {
        updateAuthState()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {isLoggedIn, isReady, authUrl, signOut, accessToken, getOauthTokenFromCode}
}