import clsx from "clsx";
import {DisplayFolders} from "./DisplayFolders";
import {useFileExplorerContext} from "../context/FileExplorerContext";
import {useEffect} from "react";
import {useDropboxContext} from "../context/DropboxContext";
import {useEditorContext} from "../context/EditorContext";
import {DropboxChooser} from "./DropboxChooser";

export const FileExplorer = () => {

    const {signOut} = useDropboxContext()
    const {
        selectFile,
        reload,
        removeRemoteFolder,
        importFolder,
        setShowSideBar,
        rootFolder,
        isLoading,
        folders,
        showSideBar
    } = useFileExplorerContext()

    const {currentFile} = useEditorContext()


    useEffect(() => {
        setShowSideBar(false)
    }, [currentFile])

    return (
        <>
            <aside className="file-explorer" data-hidden={!showSideBar}>
                <div className="sticky-top card-header bg-light">
                    <div
                        className={clsx("btn-group btn-group-sm d-flex mb-4", rootFolder == null && "visually-hidden")}>

                        <button className="btn btn-primary" onClick={signOut}>Sign Out</button>
                        <button className="btn btn-outline-secondary" onClick={reload} disabled={isLoading}
                                aria-label="Reload folder">
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                        <button className="btn btn-outline-danger"
                                onClick={removeRemoteFolder}
                                aria-label="Close folder">
                            <i className="fa-solid fa-trash"/>
                        </button>

                    </div>

                    <div className="d-flex justify-content-between">
                        <h4 className="card-title flex-grow-1">{rootFolder?.name}</h4>

                        <div>
                            <DropboxChooser success={(res) => {
                                importFolder({
                                    name: res[0].name,
                                    remoteUrl: res[0].link
                                })
                            }} multiselect={false} folderselect={true}/>
                        </div>
                    </div>

                </div>

                {isLoading ? (
                    <div className="h-100 center">
                        <div className="spinner-border"/>
                    </div>
                ) : (
                    <div className="list-group">
                        <DisplayFolders onClick={selectFile} folders={folders}/>
                    </div>
                )}


            </aside>
            <button
                className={clsx("floating-action-button btn-primary btn-lg d-lg-none", !showSideBar && "visually-hidden")}
                onClick={() => setShowSideBar(false)}
                aria-label="Close file explorer"
            >
                <i className="fa-solid fa-close"></i>
            </button>
        </>
    )
}
