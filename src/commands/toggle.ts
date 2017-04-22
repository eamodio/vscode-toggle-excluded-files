'use strict';
import { Command, Commands } from './common';
import { FilesExcludeController } from '../excludeController';

export class ToggleCommand extends Command {

    constructor(private filesExclude: FilesExcludeController) {
        super(Commands.Toggle);
    }

    execute() {
        return this.filesExclude.toggleConfiguration();
    }
}