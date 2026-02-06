import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'node:path';
import fs from 'node:fs';

const config: ForgeConfig = {
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      // Copy better-sqlite3 and its runtime dependencies into the packaged app.
      // The Vite plugin only bundles JS — external native modules must be copied manually.
      const nativeModules = ['better-sqlite3', 'bindings', 'file-uri-to-path'];
      for (const mod of nativeModules) {
        const src = path.join(__dirname, 'node_modules', mod);
        const dest = path.join(buildPath, 'node_modules', mod);
        fs.cpSync(src, dest, { recursive: true });
      }

      // Remove build-time artifacts so @electron/rebuild doesn't try to recompile
      // (the pre-built .node binary is already correct for Electron).
      const bsq3 = path.join(buildPath, 'node_modules', 'better-sqlite3');
      for (const name of ['binding.gyp', 'src', 'deps']) {
        const p = path.join(bsq3, name);
        if (fs.existsSync(p)) fs.rmSync(p, { recursive: true });
      }

      // Strip install script and prebuild-install dep to prevent rebuild triggers
      const pkgPath = path.join(bsq3, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      delete pkg.scripts;
      delete pkg.dependencies['prebuild-install'];
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    },
  },
  packagerConfig: {
    asar: {
      unpack: '**/*.node',
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
