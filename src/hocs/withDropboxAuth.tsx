import {ComponentType} from "react"
import {useDropboxAuth} from "../hooks/useDropboxAuth";

export const withDropboxAuth = <P extends object>(Component: ComponentType<P>) => (props: P) => {
    const {isLoggedIn, authUrl} = useDropboxAuth()

    if (!isLoggedIn) return (
        <div>
            <a href={authUrl ?? "#"}>Log
                in with dropbox</a>
        </div>
    )

    return <Component {...props}/>
}