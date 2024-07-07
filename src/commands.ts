import { Disposable } from 'vscode'
import type { PaletteCommands } from './constants'
import type { Container } from './container'
import { registerCommand } from './system/command'
import type { Command } from './system/decorators/command'
import { createCommandDecorator } from './system/decorators/command'

const registrableCommands: Command<keyof PaletteCommands>[] = []
const command = createCommandDecorator(registrableCommands)

export class CommandProvider implements Disposable {
	private readonly _disposable: Disposable

	constructor(private readonly container: Container) {
		this._disposable = Disposable.from(
			...registrableCommands.map(({ name, method }) => registerCommand(name, method, this)),
		)
	}

	dispose() {
		this._disposable.dispose()
	}

	@command('restore')
	restore() {
		return this.container.filesExclude.restoreConfiguration()
	}

	@command('show')
	show() {
		return this.container.filesExclude.applyConfiguration()
	}

	@command('toggle')
	toggle() {
		return this.container.filesExclude.toggleConfiguration()
	}
}
