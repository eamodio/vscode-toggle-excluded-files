'use strict';
import { isEqual as _isEqual } from 'lodash-es';
import { Arrays } from './array';

export namespace Objects {
	export function areEquivalent(value: any, other: any) {
		if (Array.isArray(value) && Array.isArray(other)) {
			return Arrays.areEquivalent(value, other);
		}
		return isEqual(value, other);
	}

	export function isEqual(value: any, other: any) {
		return _isEqual(value, other);
	}

	export function entries<T>(o: { [key: string]: T }): IterableIterator<[string, T]>;
	export function entries<T>(o: { [key: number]: T }): IterableIterator<[string, T]>;
	export function* entries<T>(o: any): IterableIterator<[string, T]> {
		for (const key in o) {
			yield [key, o[key]];
		}
	}

	export function values<T>(o: { [key: string]: T }): IterableIterator<T>;
	export function values<T>(o: { [key: number]: T }): IterableIterator<T>;
	export function* values<T>(o: any): IterableIterator<T> {
		for (const key in o) {
			yield o[key];
		}
	}
}
