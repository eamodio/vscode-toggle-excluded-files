'use strict';
const _isEqual = require('lodash.isequal');

export namespace Objects {
    export function areEquivalent(first: any, second: any): boolean {
        return _isEqual(first, second);
    }

    export function* entries(o: any): IterableIterator<[string, any]> {
        for (let key in o) {
            yield [key, o[key]];
        }
    }
}