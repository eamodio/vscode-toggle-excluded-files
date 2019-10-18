'use strict';
import { xor as _xor } from 'lodash-es';

export namespace Arrays {
	export function areEquivalent<T>(value: T[], other: T[]) {
		return _xor(value, other).length === 0;
	}
}
