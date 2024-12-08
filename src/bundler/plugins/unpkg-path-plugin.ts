import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: esbuild.OnResolveArgs) => {
        // console.log('onResolve', args);

        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' };
        }

        let modifiedPath;

        if (args.path.includes('./')) {
          const dirUrl = `https://unpkg.com${args.resolveDir}/`;
          modifiedPath = new URL(args.path, dirUrl).href;
          // console.log('modifiedPath ./', modifiedPath);
          return { path: modifiedPath, namespace: 'a' };
        }

        if (args.path.indexOf('/') === -1) {
          modifiedPath = `https://unpkg.com/${args.path}`;
          // console.log('modifiedPath no /', modifiedPath);
          return { path: modifiedPath, namespace: 'a' };
        }

        // if (!args.path.includes('./') && args.path.indexOf('/') > 0) {
        //   modifiedPath = `https://unpkg.com/${args.path.split("/").shift()}`;
        //   console.log('modifiedPath internal', modifiedPath);
        //   return { path: modifiedPath, namespace: 'a' };
        // }

        modifiedPath = new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href;
        // console.log('modifiedPath', modifiedPath);
        return { path: modifiedPath, namespace: 'a' };
      });

    },
  };
};