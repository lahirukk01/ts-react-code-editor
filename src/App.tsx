import { useEffect, useRef, useState } from 'react';
import * as esbuild from 'esbuild-wasm';
import { Message } from 'esbuild-wasm';

import { unpkgPathPlugin } from './plugins/unpkg-path-plugin.ts';
import { fetchPlugin } from './plugins/fetch-plugin.ts';

const getIframeHtml = () => {
  return `
    <html lang="">
      <head><title>Sandbox</title></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              const root = document.getElementById('root');
              root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
              console.error(err);
            }
          });
        </script>
      </body>
    </html>
  `;
};

const App: React.FC = ()=> {
  const [serviceReady, setServiceReady] = useState(false);
  const [warnings, setWarnings] = useState<Message[]>([]);

  const codeInputRef = useRef<HTMLTextAreaElement | null>(null);
  const initializedRef = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const startService = async () => {
    initializedRef.current = true;
    await esbuild.initialize({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.24.0/esbuild.wasm',
    });
    setServiceReady(true);
  };

  useEffect(() => {
    if (initializedRef.current) return;
    startService().then(() => {});
  }, []);

  // const html = useMemo(() => getIframeHtml(), []);

  const handleCodeExecute = async () => {
    if (!serviceReady || !iframeRef.current) return;
    iframeRef.current.srcdoc = getIframeHtml();
    const code = codeInputRef.current?.value ?? '';

    const output = await esbuild.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
      plugins: [unpkgPathPlugin(), fetchPlugin(code)],
      target: ['es2022'],
    });

    iframeRef.current?.contentWindow?.postMessage(output.outputFiles[0].text, '*');
    setWarnings(output.warnings);
  };

  if (!serviceReady) return <div>Loading...</div>;

  return (
    <div>
      <h1>Code Editor</h1>
      <div>
        <textarea ref={codeInputRef} name="code-input" cols={90} rows={10}></textarea>
        <button onClick={handleCodeExecute}>Execute Code</button>
      </div>
      <div>
        <div>
          <h2>Output</h2>
          <iframe
            ref={iframeRef} width="100%"
            title="output"
            srcDoc=""
            sandbox="allow-scripts"
          />
        </div>
        <div>
          <h2>Warnings</h2>
          <ul>
            {warnings.map((warning) => (
              <li key={warning.text}>{warning.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
