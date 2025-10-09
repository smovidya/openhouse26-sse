export class MultiMap<K, V> {
  private map = new Map<K, V[]>();

  add(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.push(value);
    } else {
      this.map.set(key, [value]);
    }
  }

  addAll(key: K, values: V[]): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.push(...values);
    } else {
      this.map.set(key, [...values]);
    }
  }

  get(key: K): V[] {
    return this.map.get(key) ?? [];
  }

  getFirst(key: K): V | undefined {
    const values = this.map.get(key);
    return values?.[0];
  }

  getLast(key: K): V | undefined {
    const values = this.map.get(key);
    return values?.[values.length - 1];
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  hasValue(key: K, value: V): boolean {
    const values = this.map.get(key);
    return values ? values.includes(value) : false;
  }

  remove(key: K, value: V): boolean {
    const values = this.map.get(key);
    if (!values) return false;

    const index = values.indexOf(value);
    if (index === -1) return false;

    values.splice(index, 1);

    if (values.length === 0) {
      this.map.delete(key);
    }

    return true;
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  *values(): IterableIterator<V> {
    for (const valueArray of this.map.values()) {
      yield* valueArray;
    }
  }

  *entries(): IterableIterator<[K, V]> {
    for (const [key, valueArray] of this.map.entries()) {
      for (const value of valueArray) {
        yield [key, value];
      }
    }
  }

  *entriesGrouped(): IterableIterator<[K, V[]]> {
    yield* this.map.entries();
  }

  get size(): number {
    return this.map.size;
  }

  get totalSize(): number {
    let total = 0;
    for (const values of this.map.values()) {
      total += values.length;
    }
    return total;
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  forEach(callback: (value: V, key: K, map: this) => void): void {
    for (const [key, value] of this.entries()) {
      callback(value, key, this);
    }
  }

  forEachGrouped(callback: (values: V[], key: K, map: this) => void): void {
    for (const [key, values] of this.map.entries()) {
      callback(values, key, this);
    }
  }
}
