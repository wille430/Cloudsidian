import ReactHtmlParser from "react-html-parser"
import {useState} from "react";
import clsx from "clsx";
import {withDropboxRemote} from "../hocs/withDropboxRemote";
import {useEditorContext} from "../context/EditorContext";
import {EditorTextArea} from "../components/EditorTextArea";
import {FileExplorer} from "../components/FileExplorer";
import {useFileExplorerContext} from "../context/FileExplorerContext";

const HomepageBase = () => {

    const {
        saveCurrentChanges,
        isSaving,
        isModified,
        editorHtml,
        currentFile,
        isLoading: isEditorLoading
    } = useEditorContext()

    const {setShowSideBar} = useFileExplorerContext()
    const [showPreview, setShowPreview] = useState(false)

    return (
        <main className="d-flex vh-100 overflow-hidden">
            <FileExplorer/>

            <section className="flex-grow-1 bg-dark text-light overflow-auto min-vh-100 d-flex flex-column">
                <header className="row px-2 py-1 bg-black bg-opacity-10 m-0">
                    <div className="col-1 flex-grow-1"/>

                    <div className="col-auto center">
                        <span className="mb-1 fs-details">{currentFile?.name ?? "< no file selected >"}</span>
                    </div>

                    <div
                        className={clsx("col-1 flex-grow-1 d-flex flex-row-reverse", currentFile == null && "opacity-0")}>
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

                <div className="d-flex justify-content-between px-2">
                    <button className="toggle-sidebar-button" onClick={() => setShowSideBar(prev => !prev)}
                            aria-label="Toggle file explorer">
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    <button className={clsx("toggle-preview-button", currentFile == null && "visually-hidden")}
                            onClick={() => setShowPreview(prev => !prev)}
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
                            <EditorTextArea/>
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