'use strict';
import { ExtensionContext } from 'vscode';
import { Commands } from './commands';
import { Config, configuration } from './configuration';
import { FilesExcludeController } from './excludeController';
import { StatusBarController } from './statusBarController';

export class Container {
    static initialize(context: ExtensionContext, config: Config) {
        this._context = context;
        this._config = config;

        context.subscriptions.push((this._filesExcludeController = new FilesExcludeController()));
        context.subscriptions.push((this._statusBar = new StatusBarController()));
        context.subscriptions.push((this._commands = new Commands()));
    }

    private static _commands: Commands;
    static get commands() {
        return this._commands;
    }

    private static _config: Config | undefined;
    static get config() {
        if (this._config === undefined) {
            this._config = configuration.get<Config>();
        }
        return this._config;
    }

    private static _context: ExtensionContext;
    static get context() {
        return this._context;
    }

    private static _filesExcludeController: FilesExcludeController;
    static get filesExclude() {
        return this._filesExcludeController;
    }

    private static _statusBar: StatusBarController;
    static get statusBar() {
        return this._statusBar;
    }

    static resetConfig() {
        this._config = undefined;
    }
}
