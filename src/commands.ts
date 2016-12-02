'use strict';
import { Objects } from './system';
import { commands, Disposable, workspace } from 'vscode';
import { Commands } from './constants';
import { Logger } from './logger';

async function applyExcludeConfiguration(fn: (state: boolean) => boolean) {
    try {
        const cfg = workspace.getConfiguration('');
        const excluded = cfg.inspect('files.exclude');
        if (excluded.globalValue) {
            const apply = Object.create(null);
            for (const [key, state] of Objects.entries(excluded.globalValue)) {
                apply[key] = fn(state);
            }
            await cfg.update('files.exclude', apply, true);
        }
        if (excluded.workspaceValue) {
            const apply = Object.create(null);
            for (const [key, state] of Objects.entries(excluded.workspaceValue)) {
                apply[key] = fn(state);
            }
            await cfg.update('files.exclude', apply, false);
        }
    }
    catch (ex) {
        Logger.error(ex);
    }
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

export class HideCommand extends Command {

    constructor() {
        super(Commands.Hide);
    }

    execute() {
        return applyExcludeConfiguration(state => true);
   }
}

export class ShowCommand extends Command {

    constructor() {
        super(Commands.Show);
    }

    execute() {
        return applyExcludeConfiguration(state => false);
    }
}

export class ToggleCommand extends Command {

    constructor() {
        super(Commands.Toggle);
    }

    execute() {
        return applyExcludeConfiguration(state => !state);
    }
}