'use strict';

export const extensionId = 'toggleexcludedfiles';
export const extensionOutputChannelName = 'ToggleExcludedFiles';
export const extensionQualifiedId = `eamodio.toggle-excluded-files`;

export enum BuiltInCommands {
    Open = 'vscode.open',
    SetContext = 'setContext'
}

export enum WorkspaceState {
    AppliedState = 'toggleexcludedfiles:appliedState',
    SavedState = 'toggleexcludedfiles:savedState'
}
