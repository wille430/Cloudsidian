import {useEditorContext} from "../context/EditorContext";

export const EditorTextArea = () => {

    const {
        editorMarkdown,
        onEditorChange,
        handleChange,
        handleKeyDown,
        textAreaRef
    } = useEditorContext()

    return (
        <textarea className="editor col-lg" spellCheck={false}
                  value={editorMarkdown ?? ""}
                  onInput={e => onEditorChange(e.currentTarget.value)}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  ref={textAreaRef}
                  aria-label="Edit file"/>
    )
}

