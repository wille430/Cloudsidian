import {useFileExplorer} from "../hooks/useFileExplorer";
import {DropboxChooser} from "../components/DropboxChooser";
import {useDropboxContext} from "../context/DropboxContext";
import ReactHtmlParser from "react-html-parser"
import React, {useEffect, useRef, useState} from "react";
import {useEditor} from "../hooks/useEditor";
import clsx from "clsx";
import {withDropboxRemote} from "../hocs/withDropboxRemote";
import {DisplayFolders} from "../components/DisplayFolders";

const HomepageBase = () => {

    const {signOut} = useDropboxContext()
    const {
        importFolder,
        folders,
        rootFolder,
        removeRemoteFolder,
        reload,
        isLoading,
        selectFile
    } = useFileExplorer()

    const editorTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

    const {
        handleChange,
        handleKeyDown,
        onEditorChange,
        saveCurrentChanges,
        isSaving,
        isModified,
        editorMarkdown,
        editorHtml,
        currentFile,
        isLoading: isEditorLoading
    } = useEditor(editorTextAreaRef)

    const [showPreview, setShowPreview] = useState(false)
    const [showSideBar, setShowSideBar] = useState(false)

    useEffect(() => {
        setShowSideBar(false)
    }, [currentFile])

    return (
        <main className="d-flex vh-100 overflow-hidden">
            <button
                className={clsx("floating-action-button btn-primary btn-lg d-lg-none", !showSideBar && "visually-hidden")}
                onClick={() => setShowSideBar(false)}
                aria-label="Close file explorer"
            >
                <i className="fa-solid fa-close"></i>
            </button>

            <aside className="file-explorer" data-hidden={!showSideBar}>
                <div className="sticky-top card-header bg-light">
                    <div
                        className={clsx("btn-group btn-group-sm d-flex mb-4", rootFolder == null && "visually-hidden")}
                    >
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
                        <h4 className="card-title">{rootFolder?.name}</h4>

                        <DropboxChooser success={(res) => {
                            importFolder({
                                name: res[0].name,
                                remoteUrl: res[0].link
                            })
                        }} multiselect={false} folderselect={true}/>
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
            <section className="flex-grow-1 bg-dark text-light overflow-scroll min-vh-100 d-flex flex-column">
                <header className="row px-2 py-1 bg-black bg-opacity-10">
                    <div className="col-1"/>

                    <div className="col-1 flex-grow-1 center">
                        <span className="mb-1 fs-details">{currentFile?.name}</span>
                    </div>

                    <div className={clsx("col-auto d-flex flex-row-reverse", currentFile == null && "opacity-0")}>
                        {isModified ? (
                            <button className="btn btn-sm btn-dark" type="button" onClick={saveCurrentChanges}
                                    disabled={isSaving || currentFile == null}
                                    aria-label="Save current changes">
                            <span
                                className={clsx("spinner-border spinner-border-sm mr-2", !isSaving && "visually-hidden")}
                                role="status"
                            />
                                <span>Save</span>
                            </button>
                        ) : (
                            <button className="btn btn-sm btn-dark" type="button"
                                    disabled={true}>
                                <span>Up to date</span>
                            </button>
                        )}
                    </div>
                </header>
                <div className="d-flex justify-content-between">
                    <button className="toggle-sidebar-button" onClick={() => setShowSideBar(prev => !prev)}
                            aria-label="Toggle file explorer">
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <button className="toggle-preview-button" onClick={() => setShowPreview(prev => !prev)}
                            aria-label="Toggle preview/edit mode">
                        {showPreview ? (
                            <i className="fa-solid fa-pen-to-square"></i>
                        ) : (
                            <i className="fa-solid fa-newspaper"></i>
                        )}
                    </button>
                </div>
                <div className="editor-container" data-preview={showPreview}>
                    {isEditorLoading ? (
                        <div className="center">
                            <div className="spinner-border"/>
                        </div>
                    ) : (
                        <>
                        <textarea className="editor col-lg" spellCheck={false}
                                  value={editorMarkdown ?? ""}
                                  onInput={e => onEditorChange(e.currentTarget.value)}
                                  onChange={handleChange}
                                  onKeyDown={handleKeyDown}
                                  ref={editorTextAreaRef}
                                  aria-label="Edit file"/>
                            <div className="col-lg editor-preview">
                                {ReactHtmlParser(editorHtml as any)}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}

export const Homepage = withDropboxRemote(HomepageBase)