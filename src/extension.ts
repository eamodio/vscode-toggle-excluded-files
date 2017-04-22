'use strict';
import { ExtensionContext, workspace } from 'vscode';
import { RestoreCommand, ShowCommand, ToggleCommand } from './commands';
import { FilesExcludeController } from './excludeController';
import { Logger } from './logger';
import { StatusBarController } from './statusBarController';

// this method is called when your extension is activated
export async function activate(context: ExtensionContext) {
    Logger.configure(context);

    if (!workspace.rootPath) {
        Logger.log('No workspace -- disabling');
    }

    const excludeController = new FilesExcludeController(context);
    context.subscriptions.push(excludeController);

    context.subscriptions.push(new StatusBarController(context, excludeController));

    context.subscriptions.push(new RestoreCommand(excludeController));
    context.subscriptions.push(new ShowCommand(excludeController));
    context.subscriptions.push(new ToggleCommand(excludeController));
}

// this method is called when your extension is deactivated
export function deactivate() { }