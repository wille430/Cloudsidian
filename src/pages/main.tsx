import {withDropboxAuth} from "../hocs/withDropboxAuth";
import {useObsidian} from "../hooks/useObsidian";
import {DropboxChooser} from "../components/DropboxChooser";
import {useDropboxContext} from "../context/DropboxContext";
import {Link} from "react-router-dom";
import ReactHtmlParser from "react-html-parser"
import React, {useRef} from "react";
import {useEditor} from "../hooks/useEditor";

const HomepageBase = () => {

    const {accessToken, signOut} = useDropboxContext()
    const {
        importFolder,
        folders,
        rootFolder,
        removeRemoteFolder,
        reload,
        selectFile,
        editorHtml,
        remoteFolder,
        editorMarkdown,
        setEditorMarkdown,
        isLoading
    } = useObsidian(accessToken!)

    const editorTextAreaRef = useRef<HTMLTextAreaElement | null>(null)

    const {handleChange, handleKeyDown} = useEditor(editorTextAreaRef)

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
                            <Link key={o.name} to="#" onClick={() => selectFile(o)}
                                  className="list-group-item list-group-item-action">
                                {o.name}
                            </Link>
                        ))}
                    </div>
                )}
            </aside>
            <section className="flex-grow-1 bg-dark text-light overflow-scroll">
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