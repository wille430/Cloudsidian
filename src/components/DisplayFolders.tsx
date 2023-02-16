import React from "react";
import {FileEntry} from "../models/FileEntry";
import {useEditorContext} from "../context/EditorContext";
import clsx from "clsx";

interface DisplayFolderProps {
    folders?: FileEntry[] | null
    onClick: (o: FileEntry) => any
}

export const DisplayFolders = ({folders, onClick}: DisplayFolderProps) => {

    const {
        currentFile
    } = useEditorContext()
    const isSelected = (o: FileEntry) => {
        return o.remotePath == currentFile?.remotePath
    }

    return <>
        {folders?.map(o => {
            return (
                <div key={o.name} className="position-relative">
                    <button onClick={() => onClick(o)}
                            className={clsx("directory d-flex justify-content-between align-items-center", isSelected(o) && "bg-dark bg-opacity-10")}
                    >
                        <div>
                            {o.isDir && (
                                o.showChildren ? (
                                    <i className="fa-regular fa-folder mr-2"></i>
                                ) : (
                                    <i className="fa-solid fa-folder mr-2"></i>
                                )
                            )}
                            <span>
                                {o.name}
                            </span>
                        </div>

                        {o.children == null && o.showChildren && (
                            <div className="spinner-border spinner-border-sm"/>
                        )}
                    </button>
                    {o.showChildren === true && (
                        <div className="list-group ml-2 subdirs">
                            <DisplayFolders onClick={onClick} folders={o.children}/>
                        </div>
                    )}
                </div>
            )
        })}
    </>
}