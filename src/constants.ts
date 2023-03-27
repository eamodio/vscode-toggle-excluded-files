export const extensionPrefix = 'toggleexcludedfiles';
type StripPrefix<T extends string, S extends '.' | ':'> = T extends `${typeof extensionPrefix}${S}${infer U}`
	? U
	: never;

export type Commands =
	| `${typeof extensionPrefix}.restore`
	| `${typeof extensionPrefix}.show`
	| `${typeof extensionPrefix}.toggle`;
export type CommandsUnqualified = StripPrefix<Commands, '.'>;

export type ContextKeys = `${typeof extensionPrefix}:loaded` | `${typeof extensionPrefix}:toggled`;

export type CoreCommands = 'vscode.open' | 'setContext';

export type CoreConfiguration = 'files.exclude';
