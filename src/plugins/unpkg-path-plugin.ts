import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args);

        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' };
        }

        let modifiedPath = '';

        if (args.path.includes('./')) {
          const dirUrl = `https://unpkg.com${args.resolveDir}/`;
          modifiedPath = new URL(args.path, dirUrl).href;
          return { path: modifiedPath, namespace: 'a' };
        }

        modifiedPath = new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href;
        return { path: modifiedPath, namespace: 'a' };
      });

    },
  };
};