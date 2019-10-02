class Queue<T> {
  protected store: T[] = [];

  get size() {
    return this.store.length;
  }

  clear() {
    this.store = [];
  }

  enqueue(data: T) {
    this.store.push(data);
  }

  dequeue() {
    return this.store.shift() || null;
  }
}

export default Queue;
