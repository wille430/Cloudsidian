import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import {Homepage} from "./pages/main";
import {RouterProvider} from "react-router";
import {createBrowserRouter} from "react-router-dom"
import {DropboxConfig} from "./dropbox/DropboxConfig";
import {DropboxSignIn} from "./pages/api/dropboxSignIn";
import {LoginPage} from "./pages/LoginPage";
import {DropboxProvider} from "./context/DropboxContext";

// noinspection SpellCheckingInspection
const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage/>
    },
    {
        path: "/login",
        element: <LoginPage/>
    },
    {
        path: DropboxConfig.REDIRECT_PATH,
        element: <DropboxSignIn/>
    }
])

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <DropboxProvider>
            <RouterProvider router={router}/>
        </DropboxProvider>
    </React.StrictMode>
);
