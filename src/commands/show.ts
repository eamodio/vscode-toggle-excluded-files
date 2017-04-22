'use strict';
import { Command, Commands } from './common';
import { FilesExcludeController } from '../excludeController';

export class ShowCommand extends Command {

    constructor(private filesExclude: FilesExcludeController) {
        super(Commands.Show);
    }

    execute() {
        return this.filesExclude.applyConfiguration();
    }
}
