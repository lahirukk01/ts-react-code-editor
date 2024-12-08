import { useEffect, useRef } from 'react';

interface PreviewProps {
  code: string;
}


const html = `
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

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // console.log("code", code);
  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.srcdoc = html;

    setTimeout(() => {
      iframeRef.current!.contentWindow?.postMessage(code, '*');
    }, 10);
  }, [code]);

  return <iframe
    ref={iframeRef}
    width="100%"
    title="preview"
    sandbox="allow-scripts"
    srcDoc={html}
  />;
};

export default Preview;
