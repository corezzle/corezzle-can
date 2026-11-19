// Corezzle CAN — paketleme (Electron Forge). İmza/notarization yalnız ortam değişkenleri verilirse:
//   APPLE_DEVELOPER_IDENTITY, APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    name: 'Corezzle CAN',
    executableName: 'corezzle-can',
    appBundleId: 'com.corezzle.can',
    asar: true,
    ...(process.env.APPLE_DEVELOPER_IDENTITY
      ? { osxSign: { identity: process.env.APPLE_DEVELOPER_IDENTITY, hardenedRuntime: true, gatekeeperAssess: false } }
      : {}),
    ...(process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD && process.env.APPLE_TEAM_ID
      ? { osxNotarize: { appleId: process.env.APPLE_ID, appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD, teamId: process.env.APPLE_TEAM_ID } }
      : {}),
  },
  rebuildConfig: {},
  makers: [
    { name: '@electron-forge/maker-dmg', platforms: ['darwin'], config: { name: 'Corezzle-CAN' } },
    { name: '@electron-forge/maker-zip', platforms: ['darwin', 'win32', 'linux'] },
    { name: '@electron-forge/maker-squirrel', platforms: ['win32'], config: { name: 'corezzle_can', setupExe: 'Corezzle-CAN-Setup.exe' } },
  ],
  plugins: [
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
