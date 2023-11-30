export default class JsonSet<T> extends Set {
	add(value: T) {
		const stringified = JSON.stringify(value);
		super.add(stringified);
		return this;
	}

	delete(value: T) {
		const stringified = JSON.stringify(value);
		return super.delete(stringified);
	}

	forEach(callbackfn: (value: string, value2: string, set: Set<T>) => void, thisArg?: unknown) {
		super.forEach((v1, v2, set) => {
			callbackfn(JSON.parse(v1), JSON.parse(v2), set);
		}, thisArg);
	}

	has(value: T): boolean {
		const stringified = JSON.stringify(value);
		return super.has(stringified);
	}

	*[Symbol.iterator]() {
		for (const n of super[Symbol.iterator]()) {
			yield n;
		}
	}
	*entries(): IterableIterator<[T, T]> {
		for (const [v1, v2] of super.entries()) {
			yield [JSON.parse(v1), JSON.parse(v2)];
		}
	}
	*values(): IterableIterator<T> {
		for (const v of super.values()) {
			yield JSON.parse(v);
		}
	}
	*keys(): IterableIterator<T> {
		for (const v of super.keys()) {
			yield JSON.parse(v);
		}
	}
}