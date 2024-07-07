import type { ConfigurationChangeEvent, ExtensionContext } from 'vscode'
import { CommandProvider } from './commands'
import { fromOutputLevel } from './config'
import { FilesExcludeController } from './excludeController'
import { StatusBarController } from './statusBarController'
import { configuration } from './system/configuration'
import { Logger } from './system/logger'
import { Storage } from './system/storage'

export class Container {
	static #instance: Container | undefined
	static #proxy = new Proxy<Container>({} as Container, {
		get: function (target, prop) {
			// In case anyone has cached this instance
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			if (Container.#instance != null) return (Container.#instance as any)[prop]

			// Allow access to config before we are initialized
			if (prop === 'config') return configuration.getAll()

			// debugger;
			throw new Error('Container is not initialized')
		},
	})

	static create(context: ExtensionContext) {
		if (Container.#instance != null) throw new Error('Container is already initialized')

		Container.#instance = new Container(context)
		return Container.#instance
	}

	static get instance(): Container {
		return Container.#instance ?? Container.#proxy
	}

	private constructor(context: ExtensionContext) {
		this._context = context

		const disposables = [
			(this._storage = new Storage(context)),
			(this._filesExcludeController = new FilesExcludeController(this, this._storage)),
			(this._statusBar = new StatusBarController(this)),
			new CommandProvider(this),
			configuration.onDidChangeAny(this.onAnyConfigurationChanged, this),
		]

		context.subscriptions.push({
			dispose: function () {
				disposables.reverse().forEach(d => void d.dispose())
			},
		})
	}

	private _context: ExtensionContext
	get context() {
		return this._context
	}

	private _filesExcludeController: FilesExcludeController
	get filesExclude() {
		return this._filesExcludeController
	}

	private _statusBar: StatusBarController
	get statusBar() {
		return this._statusBar
	}

	private _storage: Storage
	get storage() {
		return this._storage
	}

	private onAnyConfigurationChanged(e: ConfigurationChangeEvent) {
		if (configuration.changed(e, 'outputLevel')) {
			Logger.logLevel = fromOutputLevel(configuration.get('outputLevel'))
		}
	}
}

export function isContainer(container: any): container is Container {
	return container instanceof Container
}
