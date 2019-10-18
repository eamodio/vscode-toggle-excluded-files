'use strict';
import { ExtensionContext, workspace } from 'vscode';
import { Configuration, configuration } from './configuration';
import { Container } from './container';
import { Logger } from './logger';

export function activate(context: ExtensionContext) {
    Logger.configure(context, configuration.get('outputLevel'));

    if (workspace.workspaceFolders == null) {
        Logger.log('No workspace -- disabling');
    }

    Configuration.configure(context);
    Container.initialize(context, configuration.get());
}

export function deactivate() {
    // nothing to do
}
