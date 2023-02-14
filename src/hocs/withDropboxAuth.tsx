import {ComponentType} from "react"
import {RedirectTo} from "../components/RedirectTo";
import {useDropboxContext} from "../context/DropboxContext";

export const withDropboxAuth = <P extends object>(Component: ComponentType<P>, redirectUnauthorized = true) => (props: P) => {
    const {isLoggedIn, isReady} = useDropboxContext()

    if (!isReady) return null
    if (redirectUnauthorized && !isLoggedIn) return <RedirectTo url="/login"/>
    if (!redirectUnauthorized && isLoggedIn) return <RedirectTo url="/"/>

    return <Component {...props}/>
}