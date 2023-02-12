import {useDropboxAuth} from "../hooks/useDropboxAuth";
import {withDropboxAuth} from "../hocs/withDropboxAuth";

const HomepageBase = () => {
    const {signOut} = useDropboxAuth()

    return <div>
        <h1>Logged in!</h1>
        <button onClick={signOut}>Log out</button>
    </div>
}

export const Homepage = withDropboxAuth(HomepageBase)