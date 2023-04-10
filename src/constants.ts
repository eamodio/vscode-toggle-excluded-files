import type { FilesExcludeConfiguration } from './excludeController';
import type { configuration } from './system/configuration';

export const extensionPrefix = 'toggleexcludedfiles';

type StripPrefix<Key extends string, Prefix extends string> = Key extends `${Prefix}${infer Rest}` ? Rest : never;

export type PaletteCommands = {
	'toggleexcludedfiles.restore': [];
	'toggleexcludedfiles.show': [];
	'toggleexcludedfiles.toggle': [];
};

export type Commands = PaletteCommands;
export type UnqualifiedPaletteCommands = StripPrefix<keyof PaletteCommands, 'toggleexcludedfiles.'>;

export type ContextKeys = `${typeof extensionPrefix}:loaded` | `${typeof extensionPrefix}:toggled`;

export type CoreCommands = 'vscode.open' | 'setContext';

export type CoreConfiguration = 'files.exclude';

export type SecretKeys = never;

export type DeprecatedGlobalStorage = object;

export type GlobalStorage = object;

export type DeprecatedWorkspaceStorage = object;

export type WorkspaceStorage = {
	appliedState: StoredFilesExcludes;
	savedState: StoredFilesExcludes;
};

type ConfigInspect<T> = ReturnType<typeof configuration.inspectAny<CoreConfiguration, T>>;
export type StoredFilesExcludes = ConfigInspect<FilesExcludeConfiguration>;
