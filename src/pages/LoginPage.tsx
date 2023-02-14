import {useDropboxContext} from "../context/DropboxContext";
import {withDropboxAuth} from "../hocs/withDropboxAuth";

export const LoginPageBase = () => {
    const {authUrl} = useDropboxContext()

    return (
        <main>
            <section className="container center min-vh-100">
                <div className="card max-w-md mb-6">
                    <div className="card-header">
                        <h4 className="card-title">Sign in</h4>
                    </div>

                    <div className="card-body">
                        <a className="btn btn-lg btn-dropbox w-100" href={authUrl ?? "#"}>Continue in with Dropbox</a>
                    </div>
                </div>
            </section>
        </main>
    )
}

export const LoginPage = withDropboxAuth(LoginPageBase, false)