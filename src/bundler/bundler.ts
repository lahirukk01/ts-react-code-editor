import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin.ts';
import { fetchPlugin } from './plugins/fetch-plugin.ts';

let serviceReady = false;

const bundleCode = async (rawCode: string) => {
  if (!serviceReady) {
    await esbuild.initialize({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.24.0/esbuild.wasm',
    });
    serviceReady = true;
  }

  const output = await esbuild.build({
    entryPoints: ['index.js'],
    bundle: true,
    write: false,
    define: {
      'process.env.NODE_ENV': '"production"',
      global: 'window',
    },
    plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
    target: ['es2022'],
  });

  return output.outputFiles[0].text;
};

export default bundleCode;
