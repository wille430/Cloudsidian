import clsx from "clsx";
import {DisplayFolders} from "./DisplayFolders";
import {useFileExplorerContext} from "../context/FileExplorerContext";
import {useEffect} from "react";
import {useDropboxContext} from "../context/DropboxContext";
import {useEditorContext} from "../context/EditorContext";
import {DropboxChooser} from "./DropboxChooser";
import {Button} from "./Button";

export const FileExplorer = () => {

    const {signOut} = useDropboxContext()
    const {
        selectFile,
        reload,
        removeRemoteFolder,
        importFolder,
        setShowSideBar,
        expandAll,
        rootFolder,
        isLoading,
        folders,
        showSideBar,
        minimizeAll
    } = useFileExplorerContext()

    const {currentFile} = useEditorContext()


    useEffect(() => {
        setShowSideBar(false)
    }, [currentFile])

    useEffect(() => {
        document.querySelectorAll("[data-toggle]").forEach((ele) => {
            (ele as any).tooltip()
        })
    }, [])

    return (
        <>
            <aside className="file-explorer" data-hidden={!showSideBar}>
                <header className="sticky-top bg-light">
                    <div className="card-header">
                        <div
                            className={clsx("btn-group btn-group-sm d-flex mb-4", rootFolder == null && "visually-hidden")}>

                            <Button className="btn btn-primary" onClick={signOut}>Sign Out</Button>
                            <Button className="btn btn-outline-secondary" onClick={reload}
                                    aria-label="Reload folder">
                                <i className="fa-solid fa-rotate-right"></i>
                            </Button>
                            <Button className="btn btn-outline-danger"
                                    onClick={removeRemoteFolder}
                                    aria-label="Close folder">
                                <i className="fa-solid fa-trash"/>
                            </Button>

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

                    <div className="btn-group btn-group-sm" aria-label="File explorer actions">
                        <Button className="btn" aria-label="Expand folders" onClick={expandAll}>
                            <i className="fa-solid fa-arrows-down-to-line"/>
                        </Button>
                        <Button className="btn" aria-label="Minimize folders" onClick={minimizeAll}>
                            <i className="fa-solid fa-arrows-up-to-line"/>
                        </Button>
                    </div>
                </header>


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
