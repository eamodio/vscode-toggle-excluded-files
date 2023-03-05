export const commandPrefix = 'toggleexcludedfiles';
export const configPrefix = 'toggleexcludedfiles';

export const enum ContextKeys {
	Loaded = 'toggleexcludedfiles:loaded',
	Toggled = 'toggleexcludedfiles:toggled',
}

export enum CoreCommands {
	Open = 'vscode.open',
	SetContext = 'setContext',
}

export enum WorkspaceState {
	AppliedState = 'toggleexcludedfiles:appliedState',
	SavedState = 'toggleexcludedfiles:savedState',
}
