import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {Homepage} from "./pages/main";
import {RouterProvider} from "react-router";
import {createBrowserRouter} from "react-router-dom"
import {DropboxConfig} from "./services/DropboxConfig";
import {DropboxSignIn} from "./pages/api/dropboxSignIn";

// noinspection SpellCheckingInspection
const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage/>
    },
    {
        path: DropboxConfig.REDIRECT_PATH,
        element: <DropboxSignIn/>,
    }
])

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
);
