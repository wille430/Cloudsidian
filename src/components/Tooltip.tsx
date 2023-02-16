import React, {HTMLAttributes, useEffect, useRef} from "react";
import {Tooltip as BsTooltip} from "bootstrap";

export const Tooltip = (props: HTMLAttributes<HTMLDivElement> & { text: string }) => {
    const childRef = useRef<HTMLDivElement | null>(null)
    const {text, children, ...rest} = props

    useEffect(() => {
        if (childRef.current == null) return
        const t = new BsTooltip(childRef.current, {
            title: text,
            placement: "right",
            trigger: "hover"
        })
        return () => t.dispose()
    }, [text, childRef])

    return React.cloneElement(children as JSX.Element, {ref: childRef, ...rest})
}