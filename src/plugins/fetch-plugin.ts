import localforage from 'localforage';
import * as esbuild from 'esbuild-wasm';

const fileCache = localforage.createInstance({
  name: 'filecache',
});

const fetchFileDetails = async (path: string) => {
  const response = await fetch(path);
  const contents = await response.text();

  const responseUrl = response.url;
  const resolveDir = new URL('./', responseUrl).pathname;

  return { contents, resolveDir };
};

const buildAndReturn = async ({
  contents, resolveDir, fileUri
}: { contents: string, resolveDir: string, fileUri: string }) => {
  const result: esbuild.OnLoadResult = {
    loader: 'jsx',
    contents,
    resolveDir,
  };

  await fileCache.setItem(fileUri, result);

  return result;
};

export const fetchPlugin = (code: string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /^index\.js$/ }, async (args: any) => {
        console.log('onLoad-index.js', args);
        return {
          loader: 'jsx',
          contents: code,
        };
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad-cache', args);
        const cachedFile = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );
          return cachedFile || null;
      });

      build.onLoad({ filter: /\.css$/ }, async (args: any) => {
        console.log('onLoad-css', args);

        let { contents, resolveDir } = await fetchFileDetails(args.path);

        const escaped = contents
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");

        contents = `
            const style = document.createElement('style');
            style.innerText = '${escaped}';
            document.head.appendChild(style);
          `;

        return buildAndReturn({ contents, resolveDir, fileUri: args.path });
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad-js', args);

        const { contents, resolveDir } = await fetchFileDetails(args.path);

        return buildAndReturn({ contents, resolveDir, fileUri: args.path });
      });
    },
  };
};
