import {useNavigate} from "react-router";
import {useEffect} from "react";

interface RedirectToProps {
    url: string
}

export const RedirectTo = ({url}: RedirectToProps) => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(url)
    }, [navigate, url])

    return null;
}