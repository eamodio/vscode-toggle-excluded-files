import type { ConfigurationChangeEvent, ExtensionContext } from 'vscode';
import { CommandProvider } from './commands';
import { fromOutputLevel } from './config';
import { FilesExcludeController } from './excludeController';
import { StatusBarController } from './statusBarController';
import { Storage } from './storage';
import { configuration } from './system/configuration';
import { Logger } from './system/logger';

export class Container {
	static #instance: Container | undefined;
	static #proxy = new Proxy<Container>({} as Container, {
		get: function (target, prop) {
			// In case anyone has cached this instance
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			if (Container.#instance != null) return (Container.#instance as any)[prop];

			// Allow access to config before we are initialized
			if (prop === 'config') return configuration.getAll();

			// debugger;
			throw new Error('Container is not initialized');
		},
	});

	static create(context: ExtensionContext) {
		if (Container.#instance != null) throw new Error('Container is already initialized');

		Container.#instance = new Container(context);
		return Container.#instance;
	}

	static get instance(): Container {
		return Container.#instance ?? Container.#proxy;
	}

	private constructor(context: ExtensionContext) {
		this._context = context;

		context.subscriptions.unshift((this._storage = new Storage(context)));
		context.subscriptions.unshift((this._filesExcludeController = new FilesExcludeController(this, this._storage)));
		context.subscriptions.unshift((this._statusBar = new StatusBarController(this)));

		context.subscriptions.unshift(new CommandProvider(this));
		context.subscriptions.unshift(configuration.onDidChangeAny(this.onAnyConfigurationChanged, this));
	}

	private _context: ExtensionContext;
	get context() {
		return this._context;
	}

	private _filesExcludeController: FilesExcludeController;
	get filesExclude() {
		return this._filesExcludeController;
	}

	private _statusBar: StatusBarController;
	get statusBar() {
		return this._statusBar;
	}

	private _storage: Storage;
	get storage() {
		return this._storage;
	}

	private onAnyConfigurationChanged(e: ConfigurationChangeEvent) {
		if (configuration.changed(e, 'outputLevel')) {
			Logger.logLevel = fromOutputLevel(configuration.get('outputLevel'));
		}
	}
}

export function isContainer(container: any): container is Container {
	return container instanceof Container;
}
