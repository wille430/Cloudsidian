import {createContext, useContext} from "react";
import {useDropboxAuth} from "../hooks/useDropboxAuth";

export type DropboxContextValue = ReturnType<typeof useDropboxAuth>

// @ts-ignore
export const DropboxContext = createContext<DropboxContextValue>()

export const useDropboxContext = () => useContext(DropboxContext)

export const DropboxProvider = ({children}: any) => {
    const value = useDropboxAuth()

    return (
        <DropboxContext.Provider value={value}>
            {children}
        </DropboxContext.Provider>
    )
}