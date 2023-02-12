import {DropboxAuthService} from "../services/DropboxAuthService";
import {useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router";

export const useDropboxAuth = () => {
    const dropboxAuthSvc = useMemo(() => new DropboxAuthService(), [])
    const navigate = useNavigate()
    const location = useLocation()

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [authUrl, setAuthUrl] = useState<string | null>()

    useEffect(() => {
        dropboxAuthSvc.getAuthorizationUrl().then(setAuthUrl)
    }, [dropboxAuthSvc])

    useEffect(() => {
        setIsLoggedIn(dropboxAuthSvc.isAuthenticated())
    }, [dropboxAuthSvc, location])

    const signOut = async () => {
        await dropboxAuthSvc.signOut()
        navigate("/")
    }

    return {isLoggedIn, authUrl, signOut}
}