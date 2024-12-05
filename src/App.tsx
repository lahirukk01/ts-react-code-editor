import { useState } from 'react';

const App: React.FC = ()=> {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello {count}</h1>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
};

export default App;
