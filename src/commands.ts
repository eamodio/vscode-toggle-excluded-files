'use strict';
import { commands, Disposable } from 'vscode';
import { Container } from './container';
import { Command, createCommandDecorator } from './system';

const commandRegistry: Command[] = [];
const command = createCommandDecorator(commandRegistry);

export class Commands implements Disposable {
	private readonly _disposable: Disposable;

	constructor() {
		this._disposable = Disposable.from(
			...commandRegistry.map(({ name, key, method }) =>
				commands.registerCommand(name, (...args: any[]) => method.apply(this, args))
			)
		);
	}

	dispose() {
		this._disposable && this._disposable.dispose();
	}

	@command('restore')
	restore() {
		return Container.filesExclude.restoreConfiguration();
	}

	@command('show')
	show() {
		return Container.filesExclude.applyConfiguration();
	}

	@command('toggle')
	toggle() {
		return Container.filesExclude.toggleConfiguration();
	}
}
