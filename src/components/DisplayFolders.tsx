import React from "react";
import {FileEntry} from "../models/FileEntry";

interface DisplayFolderProps {
    folders?: FileEntry[] | null
    onClick: (o: FileEntry) => any
}

export const DisplayFolders = ({folders, onClick}: DisplayFolderProps) => {
    return <>
        {folders?.map(o => {
            return (
                <div key={o.name}>
                    <button onClick={() => onClick(o)}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
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
                        <div className="list-group ml-2">
                            <DisplayFolders onClick={onClick} folders={o.children}/>
                        </div>
                    )}
                </div>
            )
        })}
    </>
}