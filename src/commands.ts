'use strict';
import { commands, Disposable } from 'vscode';
import type { Container } from './container';
import type { Command } from './system/decorators/command';
import { createCommandDecorator } from './system/decorators/command';

const registrableCommands: Command[] = [];
const command = createCommandDecorator(registrableCommands);

export class Commands implements Disposable {
	private readonly _disposable: Disposable;

	constructor(private readonly container: Container) {
		this._disposable = Disposable.from(
			...registrableCommands.map(({ name, method }) =>
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				commands.registerCommand(name, (...args: any[]) => method.apply(this, args)),
			),
		);
	}

	dispose() {
		this._disposable?.dispose();
	}

	@command('restore')
	restore() {
		return this.container.filesExclude.restoreConfiguration();
	}

	@command('show')
	show() {
		return this.container.filesExclude.applyConfiguration();
	}

	@command('toggle')
	toggle() {
		return this.container.filesExclude.toggleConfiguration();
	}
}
