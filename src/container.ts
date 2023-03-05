import type { ExtensionContext } from 'vscode';
import { Commands } from './commands';
import { FilesExcludeController } from './excludeController';
import { StatusBarController } from './statusBarController';
import { configuration } from './system/configuration';

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

		context.subscriptions.splice(0, 0, (this._filesExcludeController = new FilesExcludeController(this)));
		context.subscriptions.splice(0, 0, (this._statusBar = new StatusBarController(this)));
		context.subscriptions.splice(0, 0, (this._commands = new Commands(this)));
	}

	private _commands: Commands;
	get commands() {
		return this._commands;
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
}

export function isContainer(container: any): container is Container {
	return container instanceof Container;
}
