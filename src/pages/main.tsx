import {withDropboxAuth} from "../hocs/withDropboxAuth";
import {useObsidian} from "../hooks/useObsidian";
import {DropboxChooser} from "../components/DropboxChooser";
import {useDropboxContext} from "../context/DropboxContext";
import ReactHtmlParser from "react-html-parser"
import React, {useEffect, useRef} from "react";
import {useEditor} from "../hooks/useEditor";
import clsx from "clsx";

const HomepageBase = () => {

    const {accessToken, signOut} = useDropboxContext()
    const {
        importFolder,
        folders,
        rootFolder,
        removeRemoteFolder,
        reload,
        editorHtml,
        remoteFolder,
        editorMarkdown,
        setEditorMarkdown,
        isLoading,
        isSavingCurrent,
        isModified,
        currentFile,
        selectFile,
        saveCurrentFile
    } = useObsidian(accessToken!)

    const editorTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

    const {handleChange, handleKeyDown, clearHistory} = useEditor(editorTextAreaRef)

    useEffect(() => {
        clearHistory()
    }, [currentFile, clearHistory])

    return (
        <main className="d-flex vh-100 overflow-hidden">
            <aside className="max-w-sm overflow-scroll card">
                <div className="sticky-top card-header bg-light">
                    <div className="btn-group btn-group-sm">
                        <button className="btn btn-primary" onClick={signOut}>Sign Out</button>
                        <button className="btn btn-outline-secondary" onClick={reload}>
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                        <button className="btn btn-outline-danger"
                                onClick={removeRemoteFolder}>
                            <i className="fa-solid fa-trash"/>
                        </button>
                    </div>

                    <div className="d-flex justify-content-between">
                        <h4 className="card-title">{rootFolder?.name}</h4>

                        <DropboxChooser success={(res) => {
                            remoteFolder.setRootFolder({
                                name: res[0].name,
                                remoteUrl: res[0].link
                            })
                            importFolder()
                        }} multiselect={false} folderselect={true}/>
                    </div>

                </div>

                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="list-group">
                        {folders?.map(o => (
                            <button key={o.name}
                                    onClick={() => {
                                        selectFile(o).then()
                                    }}
                                    className="list-group-item list-group-item-action"
                            >
                                {o.name}
                            </button>
                        ))}
                    </div>
                )}
            </aside>
            <section className="flex-grow-1 bg-dark text-light overflow-scroll">
                <header className="row px-2 py-1">
                    <div className="col-1"/>

                    <div className="col-1 flex-grow-1 text-center">
                        <span>{currentFile?.name}</span>
                    </div>

                    <div className="col-auto d-flex flex-row-reverse">
                        {isModified ? (
                            <button className="btn btn-sm btn-dark" type="button" onClick={saveCurrentFile}
                                    disabled={isSavingCurrent}>
                            <span
                                className={clsx("spinner-border spinner-border-sm", !isSavingCurrent && "visually-hidden")}
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
                <div className="editor-container min-vh-100 row mx-auto gap-4">
                    <div className="p-2 py-4 col">
                        <textarea className="editor" spellCheck={false} value={editorMarkdown ?? ""}
                                  onInput={e => setEditorMarkdown(e.currentTarget.value)}
                                  onChange={handleChange}
                                  onKeyDown={handleKeyDown}
                                  ref={editorTextAreaRef}/>
                    </div>
                    <div className="p-2 py-4 col editor-preview">
                        {ReactHtmlParser(editorHtml as any)}
                    </div>
                </div>
            </section>
        </main>
    )
}

export const Homepage = withDropboxAuth(HomepageBase)