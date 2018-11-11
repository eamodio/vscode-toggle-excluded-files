'use strict';

interface IPropOfValue {
    (): any;
    value: string | undefined;
}

export namespace Functions {
    export function isPromise(o: any): o is Promise<any> {
        return (typeof o === 'object' || typeof o === 'function') && typeof o.then === 'function';
    }

    export function propOf<T, K extends Extract<keyof T, string>>(o: T, key: K) {
        const propOfCore = <T, K extends Extract<keyof T, string>>(o: T, key: K) => {
            const value: string =
                (propOfCore as IPropOfValue).value === undefined ? key : `${(propOfCore as IPropOfValue).value}.${key}`;
            (propOfCore as IPropOfValue).value = value;
            const fn = <Y extends Extract<keyof T[K], string>>(k: Y) => propOfCore(o[key], k);
            return Object.assign(fn, { value: value });
        };
        return propOfCore(o, key);
    }
}
