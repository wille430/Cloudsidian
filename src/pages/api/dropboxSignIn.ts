import {useEffect, useRef} from "react";
import {useNavigate} from "react-router";
import {useDropboxContext} from "../../context/DropboxContext";

export const DropboxSignIn = () => {
    const navigate = useNavigate()

    const {getOauthTokenFromCode} = useDropboxContext()
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (!isFirstRender.current) return
        isFirstRender.current = false

        getOauthTokenFromCode().then(success => {
            if (success) {
                navigate("/")
            } else {
                navigate("/login")
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}