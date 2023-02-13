import {ComponentType} from "react"
import {RedirectTo} from "../components/RedirectTo";
import {useDropboxContext} from "../context/DropboxContext";

export const withDropboxAuth = <P extends object>(Component: ComponentType<P>) => (props: P) => {
    const {isLoggedIn, isReady, accessToken} = useDropboxContext()

    if (!isReady) return null
    if (!isLoggedIn || !accessToken) return <RedirectTo url="/login"/>

    return <Component {...props}/>
}