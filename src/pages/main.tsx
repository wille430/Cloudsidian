import {useFileExplorer} from "../hooks/useFileExplorer";
import {DropboxChooser} from "../components/DropboxChooser";
import {useDropboxContext} from "../context/DropboxContext";
import ReactHtmlParser from "react-html-parser"
import React, {useRef} from "react";
import {useEditor} from "../hooks/useEditor";
import clsx from "clsx";
import {withDropboxRemote} from "../hocs/withDropboxRemote";

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

    return (
        <main className="d-flex vh-100 overflow-hidden">
            <aside className="max-w-sm overflow-scroll card">
                <div className="sticky-top card-header bg-light">
                    <div
                        className={clsx("btn-group btn-group-sm d-flex mb-4", rootFolder == null && "visually-hidden")}
                    >
                        <button className="btn btn-primary" onClick={signOut}>Sign Out</button>
                        <button className="btn btn-outline-secondary" onClick={reload} disabled={isLoading}>
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
            <section className="flex-grow-1 bg-dark text-light overflow-scroll min-vh-100 d-flex flex-column">
                <header className="row px-2 py-1 bg-black bg-opacity-10">
                    <div className="col-1"/>

                    <div className="col-1 flex-grow-1 center">
                        <span className="mb-1 fs-details">{currentFile?.name}</span>
                    </div>

                    <div className={clsx("col-auto d-flex flex-row-reverse", currentFile == null && "opacity-0")}>
                        {isModified ? (
                            <button className="btn btn-sm btn-dark" type="button" onClick={saveCurrentChanges}
                                    disabled={isSaving || currentFile == null}>
                            <span
                                className={clsx("spinner-border spinner-border-sm", !isSaving && "visually-hidden")}
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
                <div className="editor-container row mx-auto gap-4 flex-grow-1">
                    {isEditorLoading ? (
                        <div className="center">
                            <div className="spinner-border"/>
                        </div>
                    ) : (
                        <>
                            <div className="p-2 py-4 col">
                        <textarea className="editor" spellCheck={false} value={editorMarkdown ?? ""}
                                  onInput={e => onEditorChange(e.currentTarget.value)}
                                  onChange={handleChange}
                                  onKeyDown={handleKeyDown}
                                  ref={editorTextAreaRef}/>
                            </div>
                            <div className="p-2 py-4 col editor-preview">
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