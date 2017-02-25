'use strict';
import { commands, Disposable } from 'vscode';
import ExcludeController from './excludeController';

export type Commands = 'toggleexcludedfiles.show' | 'toggleexcludedfiles.hide' | 'toggleexcludedfiles.toggle';
export const Commands = {
    Show: 'toggleexcludedfiles.show' as Commands,
    Hide: 'toggleexcludedfiles.hide' as Commands,
    Toggle: 'toggleexcludedfiles.toggle' as Commands
};

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

export class HideCommand extends Command {

    constructor(private exclude: ExcludeController) {
        super(Commands.Hide);
    }

    execute() {
        return this.exclude.restoreConfiguration();
   }
}

export class ShowCommand extends Command {

    constructor(private exclude: ExcludeController) {
        super(Commands.Show);
    }

    execute() {
        return this.exclude.applyConfiguration();
    }
}

export class ToggleCommand extends Command {

    constructor(private exclude: ExcludeController) {
        super(Commands.Toggle);
    }

    execute() {
        return this.exclude.toggleConfiguration();
    }
}