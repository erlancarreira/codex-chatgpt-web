import {
  adoptTrustedBrowserLoginStorageState,
  browserLoginStateExists,
  type BrowserLoginResult,
  type BrowserLoginStorageState,
} from "./browser-login";
import { saveConfig, type AppConfig } from "./config";
import { exportLauncherBrowserStorageState } from "./launcher-browser-host";

export interface NativeRuntimeDependencies {
  browserLoginStateExists(config: AppConfig): boolean;
  exportLauncherBrowserStorageState(path: string): Promise<BrowserLoginStorageState>;
  adoptTrustedBrowserLoginStorageState(
    config: AppConfig,
    storageState: BrowserLoginStorageState,
  ): BrowserLoginResult;
  saveConfig(config: AppConfig): void;
}

const defaultDependencies: NativeRuntimeDependencies = {
  browserLoginStateExists,
  exportLauncherBrowserStorageState,
  adoptTrustedBrowserLoginStorageState,
  saveConfig,
};

export async function prepareNativeRuntime(
  config: AppConfig,
  dependencies: NativeRuntimeDependencies = defaultDependencies,
): Promise<AppConfig> {
  if (config.browserInteractionMode !== "automatic") {
    throw new Error("Native Codex runtime currently requires automatic browser interaction.");
  }

  if (config.browserHost === "managed-chrome") {
    if (!dependencies.browserLoginStateExists(config)) {
      throw new Error(
        "Native Codex runtime requires a stored ChatGPT browser session. Run codex-chatgpt-web login once.",
      );
    }
    return config;
  }

  const descriptorPath = config.browserHostDescriptorPath;
  if (!descriptorPath) {
    throw new Error("Launcher browser descriptor is missing; cannot migrate its ChatGPT session.");
  }

  const storageState = await dependencies.exportLauncherBrowserStorageState(descriptorPath);

  const migrated = structuredClone(config);
  migrated.browserHost = "managed-chrome";
  delete migrated.browserHostDescriptorPath;

  const login = dependencies.adoptTrustedBrowserLoginStorageState(migrated, storageState);
  migrated.solAvailable = login.solAvailable;
  migrated.extraHighAvailable = login.extraHighAvailable;
  migrated.proAvailable = login.proAvailable;
  dependencies.saveConfig(migrated);
  return migrated;
}
