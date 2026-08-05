class HeapQueue {
  constructor(cmp) {
    this.heap = []
    this.cmp = cmp || ((a, b) => a - b)
  }

  push(val) {
    this.heap.push(val)
    this._siftUp(this.heap.length - 1)
  }

  pop() {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length > 0) {
      this.heap[0] = last
      this._siftDown(0)
    }
    return top
  }

  peek() {
    return this.heap[0]
  }

  get length() {
    return this.heap.length
  }

  _siftUp(idx) {
    while (idx > 0) {
      const parent = (idx - 1) >> 1
      if (this.cmp(this.heap[idx], this.heap[parent]) < 0) {
        [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]]
        idx = parent
      } else break
    }
  }

  _siftDown(idx) {
    const len = this.heap.length
    while (true) {
      let smallest = idx
      const left = 2 * idx + 1
      const right = 2 * idx + 2
      if (left < len && this.cmp(this.heap[left], this.heap[smallest]) < 0) smallest = left
      if (right < len && this.cmp(this.heap[right], this.heap[smallest]) < 0) smallest = right
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]]
        idx = smallest
      } else break
    }
  }
}

export { HeapQueue }
export default HeapQueue
