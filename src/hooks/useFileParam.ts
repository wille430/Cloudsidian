import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";

export const useFileParam = () => {
    const FILE_PARAM = "file"
    const [searchParams, setSearchParams] = useSearchParams()
    const [fileParam, _setFileParam] = useState<string | null>(null)

    useEffect(() => {
        _setFileParam(searchParams.get(FILE_PARAM))
    }, [searchParams])

    const setFileParam = (link: string | null) => {
        _setFileParam(link)
        setSearchParams((prev) => {
            if (link == null) {
                prev.delete(FILE_PARAM)
            } else {
                prev.set(FILE_PARAM, link)
            }
            return prev
        })
    }

    return {fileParam, setFileParam}
}