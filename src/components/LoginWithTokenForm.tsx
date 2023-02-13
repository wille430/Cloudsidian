import {DropboxAuthService} from "../dropbox/DropboxAuthService";
import {useState} from "react";
import {useNavigate} from "react-router";

export const LoginWithTokenForm = () => {
    const [accessToken, setAccessToken] = useState<string | null>()
    const navigate = useNavigate()
    return <div>
        <form onSubmit={e => {
            e.preventDefault()
            navigate(`/?${DropboxAuthService.ACCESS_TOKEN}=${accessToken}`)
        }}>
            <input value={accessToken ?? ""} onChange={e => setAccessToken(e.target.value)}/>
            <button>Submit</button>
        </form>
    </div>
}