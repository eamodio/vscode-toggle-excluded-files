'use strict';

export const ExtensionId = 'toggle-excluded-files';
export const ExtensionKey = 'toggleexcludedfiles';
export const ExtensionOutputChannelName = 'ToggleExcludedFiles';
export const QualifiedExtensionId = `eamodio.${ExtensionId}`;

export type BuiltInCommands = 'vscode.open' | 'setContext';
export const BuiltInCommands = {
    Open: 'vscode.open' as BuiltInCommands,
    SetContext: 'setContext' as BuiltInCommands
};

export type WorkspaceState = 'toggleexcludedfiles:appliedState' | 'toggleexcludedfiles:savedState';
export const WorkspaceState = {
    AppliedState: 'toggleexcludedfiles:appliedState' as WorkspaceState,
    SavedState: 'toggleexcludedfiles:savedState' as WorkspaceState
};