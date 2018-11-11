'use strict';
import { ExtensionContext, workspace } from 'vscode';
import { Config, Configuration, configuration } from './configuration';
import { Container } from './container';
import { Logger } from './logger';

// this method is called when your extension is activated
export async function activate(context: ExtensionContext) {
    Logger.configure(context);

    if (!workspace.rootPath) {
        Logger.log('No workspace -- disabling');
    }

    Configuration.configure(context);
    Container.initialize(context, configuration.get<Config>());
}

// this method is called when your extension is deactivated
export function deactivate() {}
