import {DropboxAuthService} from "../dropbox/DropboxAuthService";
import {useEffect, useMemo, useState} from "react";

export const useDropboxAuth = () => {
    const dropboxAuthSvc = useMemo(() => new DropboxAuthService(), [])

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [authUrl, setAuthUrl] = useState<string | null>()
    const [accessToken, setAccessToken] = useState<string | null>()

    useEffect(() => {
        dropboxAuthSvc.getAuthorizationUrl().then(setAuthUrl)
    }, [dropboxAuthSvc])

    useEffect(() => {
        setIsLoggedIn(dropboxAuthSvc.isAuthenticated())
        setAccessToken(dropboxAuthSvc.getAccessToken())

        setIsReady(true)
    }, [dropboxAuthSvc]) // location

    const signOut = async () => {
        await dropboxAuthSvc.signOut()
    }

    return {isLoggedIn, isReady, authUrl, signOut, accessToken}
}