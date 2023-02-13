import {useEffect} from "react";
import {useNavigate} from "react-router";
import {DropboxAuthService} from "../../dropbox/DropboxAuthService";
import {DropboxConfig} from "../../dropbox/DropboxConfig";

export const DropboxSignIn = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const code = new URL(window.location.toString()).searchParams.get(DropboxConfig.CODE_KEY)
        if (code == null) return navigate("?error=true")

        const dropboxService = new DropboxAuthService()

        dropboxService
            .getOauth2Token(code)
            .then(() => {
                navigate("/")
            })
            .catch((e) => {
                console.log(e)
            })
    }, [navigate])

    return null
}