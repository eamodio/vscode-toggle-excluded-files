'use strict';

export namespace Functions {
	const comma = ',';
	const emptyStr = '';
	const equals = '=';
	const openBrace = '{';
	const openParen = '(';
	const closeParen = ')';

	const fnBodyRegex = /\(([\s\S]*)\)/;
	const fnBodyStripCommentsRegex = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm;
	const fnBodyStripParamDefaultValueRegex = /\s?=.*$/;

	export function getParameters(fn: Function): string[] {
		if (typeof fn !== 'function') throw new Error('Not supported');

		if (fn.length === 0) return [];

		let fnBody: string = Function.prototype.toString.call(fn);
		fnBody = fnBody.replace(fnBodyStripCommentsRegex, emptyStr) || fnBody;
		fnBody = fnBody.slice(0, fnBody.indexOf(openBrace));

		let open = fnBody.indexOf(openParen);
		let close = fnBody.indexOf(closeParen);

		open = open >= 0 ? open + 1 : 0;
		close = close > 0 ? close : fnBody.indexOf(equals);

		fnBody = fnBody.slice(open, close);
		fnBody = `(${fnBody})`;

		const match = fnBodyRegex.exec(fnBody);
		return match != null
			? match[1].split(comma).map(param => param.trim().replace(fnBodyStripParamDefaultValueRegex, emptyStr))
			: [];
	}

	export function is<T extends object>(o: T | null | undefined): o is T;
	export function is<T extends object>(o: object, prop: keyof T, value?: any): o is T;
	export function is<T extends object>(o: object, matcher: (o: object) => boolean): o is T;
	export function is<T extends object>(
		o: object,
		propOrMatcher?: keyof T | ((o: any) => boolean),
		value?: any
	): o is T {
		if (propOrMatcher == null) return o != null;
		if (typeof propOrMatcher === 'function') return propOrMatcher(o);

		return value === undefined ? (o as any)[propOrMatcher] !== undefined : (o as any)[propOrMatcher] === value;
	}
}
