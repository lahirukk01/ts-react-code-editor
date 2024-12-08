import './code-editor.css';

import { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import monaco from 'monaco-editor';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import MonacoJSXHighlighter, {JSXTypes, makeBabelParse} from 'monaco-jsx-highlighter';

interface CodeEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorOnMount = async (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    const parseJSX = makeBabelParse(parse, true); // param0:Babel's parse, param1: default config for JSX syntax (false), TSX (true).
    // Instantiate the highlighter
    const monacoJSXHighlighter = new MonacoJSXHighlighter(
      monaco, // references Range and other APIs
      parseJSX, // obtains an AST, internally passes to parse options: {...options, sourceType: "module",plugins: ["jsx"],errorRecovery: true}
      traverse, // helps collecting the JSX expressions within the AST
      editor // highlights the content of that editor via decorations
    );

    monacoJSXHighlighter.highlightOnDidChangeModelContent();
    monacoJSXHighlighter.addJSXCommentCommand();

    JSXTypes.JSXText.options.inlineClassName = "JSXElement.JSXText.tastyPizza";
  };

  const handleFormatCode = async () => {
    if (!editorRef.current) return;

    const unformattedCode = editorRef.current.getValue() || "";

    const formattedCode = prettier.format(unformattedCode, {
      parser: 'babel',
      plugins: [parser],
      useTabs: false,
      semi: true,
      singleQuote: true,
    }).replace(/\n$/, '');

    editorRef.current.setValue(formattedCode);
  };

  return (
    <div className="editor-wrapper">
      <button
        className={"button button-format is-primary is-small"}
        onClick={handleFormatCode}>Format Code</button>
      <Editor
        value={initialValue}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorOnMount}
        theme="vs-dark"
        height="500px"
        language="javascript"
        defaultLanguage="javascript"
        defaultValue=""
        options={{
          wordWrap: 'on',
          minimap: { enabled: false },
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
        }}
      />
    </div>
  );
};

export default CodeEditor;
