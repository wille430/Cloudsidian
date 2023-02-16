import {HTMLAttributes, useState} from "react";

export const Button = (props: HTMLAttributes<HTMLButtonElement>) => {
    const {onClick, ...rest} = props

    const [isWaiting, setIsWaiting] = useState(false)

    const handleClick = (e: any) => {
        if (onClick == null) return

        setIsWaiting(true)
        ;(onClick(e) as any).finally(() => {
            setIsWaiting(false)
        })
    }

    return <button onClick={handleClick} disabled={isWaiting} {...rest}/>
}