// Minimal implementation of OrderedMap, only used internally
// Does not include all Map functions
export class OrderedMap<K, V> {
    private map: Map<K, V>;
    private keysOrder: K[];

    constructor() {
        this.map = new Map<K, V>();
        this.keysOrder = [];
    }

    set(key: K, value: V): void {
        if (!this.map.has(key)) {
            this.keysOrder.push(key);
        }
        this.map.set(key, value);
    }

    get(key: K): V | undefined {
        return this.map.get(key);
    }

    forEach(callback: (key: K, value: V) => void): void {
        this.keysOrder.forEach(key => {
            if (this.map.has(key)) {
                callback(key, this.map.get(key)!);
            }
        });
    }

    firstValue(): V | undefined {
        if (this.keysOrder.length === 0) {
            return undefined;
        }
        const firstKey = this.keysOrder[0];
        return this.map.get(firstKey);
    }
}
