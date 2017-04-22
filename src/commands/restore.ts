'use strict';
import { Command, Commands } from './common';
import { FilesExcludeController } from '../excludeController';

export class RestoreCommand extends Command {

    constructor(private filesExclude: FilesExcludeController) {
        super(Commands.Restore);
    }

    execute() {
        return this.filesExclude.restoreConfiguration();
   }
}