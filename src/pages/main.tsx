import {withDropboxAuth} from "../hocs/withDropboxAuth";
import {useObsidian} from "../hooks/useObsidian";
import {DropboxChooser} from "../components/DropboxChooser";
import {useDropboxContext} from "../context/DropboxContext";
import {Link} from "react-router-dom";

const HomepageBase = () => {

    const {accessToken, signOut} = useDropboxContext()
    const {importFolder, folders, rootFolder, fileExplorer} = useObsidian(accessToken!)

    return (
        <main className="d-flex vh-100 overflow-hidden">
            <aside className="max-w-sm overflow-scroll card">
                <div className="sticky-top card-header bg-light">
                    <button className="btn btn-sm" onClick={signOut}>Sign Out</button>
                    <button className="btn btn-sm" onClick={() => fileExplorer.refetch()}>Reload</button>

                    <div className="d-flex justify-content-between">
                        <h4 className="card-title">{rootFolder?.name}</h4>

                        <DropboxChooser success={(res) => {
                            fileExplorer.setRootFolder({
                                name: res[0].name,
                                remoteUrl: res[0].link,
                                isDir: true
                            })
                            importFolder()
                        }} multiselect={false} folderselect={true}/>
                    </div>

                </div>

                <div className="list-group">
                    {folders?.map(o => (
                        <Link to="#" className="list-group-item list-group-item-action">
                            {o.name}
                        </Link>
                    ))}
                </div>
            </aside>
            <section className="flex-grow-1 bg-dark text-light">
                <div className="container-md min-vh-100 p-2 py-4">
                    <h3>hej</h3>
                </div>
            </section>
        </main>
    )
}

export const Homepage = withDropboxAuth(HomepageBase)