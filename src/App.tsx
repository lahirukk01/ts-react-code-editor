import { useEffect, useRef, useState } from 'react';
import * as esbuild from 'esbuild-wasm';
import { Message } from 'esbuild-wasm';

import { unpkgPathPlugin } from './plugins/unpkg-path-plugin.ts';
import { fetchPlugin } from './plugins/fetch-plugin.ts';

const App: React.FC = ()=> {
  const [serviceReady, setServiceReady] = useState(false);
  const [codeOutput, setCodeOutput] = useState('');
  const [warnings, setWarnings] = useState<Message[]>([]);

  const codeInputRef = useRef<HTMLTextAreaElement | null>(null);
  const initializedRef = useRef(false);

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
    startService();
  }, []);

  const handleCodeExecute = async () => {
    if (!serviceReady) return;

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
    // console.log(output.outputFiles[0].text);
    setCodeOutput(output.outputFiles[0].text);
    setWarnings(output.warnings);
    const result = eval(output.outputFiles[0].text);
    console.log('ExR', result);
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
          <pre
            style={{ 'overflowX': 'scroll', 'width': '100%' }}
          >{codeOutput}</pre>
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
