import 'bulmaswatch/superhero/bulmaswatch.min.css';

import { useState } from 'react';
import CodeEditor from './components/code-editor.tsx';
import Preview from './components/Preview.tsx';
import bundleCode from './bundler/bundler.ts';

const App: React.FC = ()=> {
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  const handleCodeExecute = async () => {
    const bundledCode = await bundleCode(inputCode);
    setCode(bundledCode);
  };

  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
      <div style={{ minHeight: '300px', maxHeight: '80vh', flex: "0 1 66%", marginBottom: '20px'}}>
        <h1>Code Editor</h1>
        <CodeEditor initialValue="" onChange={setInputCode} />
        <button style={{ marginTop: '20px'}} onClick={handleCodeExecute}>Execute Code</button>
      </div>
      <div style={{ marginTop: '20px', minHeight: '100px', flex: 1 }}>
        <div>
          <h1>Output</h1>
          <Preview code={code} />
        </div>
      </div>
    </div>
  );
};

export default App;
