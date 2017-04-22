'use strict';
import { commands, Disposable } from 'vscode';
import { BuiltInCommands } from '../constants';

export type Commands = 'toggleexcludedfiles.restore' | 'toggleexcludedfiles.show' | 'toggleexcludedfiles.toggle';
export const Commands = {
    Restore: 'toggleexcludedfiles.restore' as Commands,
    Show: 'toggleexcludedfiles.show' as Commands,
    Toggle: 'toggleexcludedfiles.toggle' as Commands
};

export type CommandContext = 'toggleexcludedfiles:key';
export const CommandContext = {
    Key: 'toggleexcludedfiles:key' as CommandContext
};

export function setCommandContext(key: CommandContext | string, value: any) {
    return commands.executeCommand(BuiltInCommands.SetContext, key, value);
}

export abstract class Command extends Disposable {

    private _disposable: Disposable;

    constructor(command: Commands) {
        super(() => this.dispose());
        this._disposable = commands.registerCommand(command, this.execute, this);
    }

    dispose() {
        this._disposable && this._disposable.dispose();
    }

    abstract execute(...args: any[]): any;
}