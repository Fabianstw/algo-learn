import math from "@shared/utils/math.ts"

/**
 * This class represents a queue
 */
export class Queue {
  size: number
  queue: number[]
  front: number
  rear: number
  numberOfElements: number
  constructor(size: number) {
    this.size = size
    this.queue = new Array(size).fill(0) as number[]
    this.front = -1
    this.rear = -1
    this.numberOfElements = 0
  }

  /**
   * This method adds an element to the queue
   * @param element The element to add
   */
  queueElement(element: number): void {
    if (this.numberOfElements < this.size) {
      this.rear = (this.rear + 1) % this.size
      this.queue[this.rear] = element
      this.numberOfElements++
    } else {
      throw new Error("The queue is full")
    }
  }

  /**
   * This method returns the front element of the queue
   * @returns The front element of the queue
   */
  dequeueElement(): number {
    if (this.numberOfElements > 0) {
      this.front = (this.front + 1) % this.size
      this.numberOfElements--
      return this.queue[this.front]
    } else {
      throw new Error("The queue is empty")
    }
  }

  /**
   * This method returns the current number of elements in the queue
   * @returns The current number of elements in the queue
   */
  getCurrentNumberOfElements(): number {
    return this.numberOfElements
  }

  /**
   * This method returns the current queue as a string
   * @returns The current queue as a string
   */
  toString(): string {
    if (this.numberOfElements === 0) {
      return ""
    }
    if (this.rear > this.front) {
      return this.queue.slice(this.front + 1, this.rear + 1).toString()
    }
    const partQueue = this.queue.slice(this.front + 1, this.queue.length)
    const secondQueue = this.queue.slice(0, this.rear + 1)
    return partQueue.concat(secondQueue).toString()
  }

  /**
   * This method returns the complete queue
   */
  getQueue(): string {
    // return this.queue everything out this.front and this.rear is undefined
    const partQueue = this.queue.slice(this.front + 1, this.rear + 1)
    const queue = new Array(this.size).fill(math.NaN) as number[]
    if (this.rear > this.front) {
      for (let i = this.front + 1; i <= this.rear; i++) {
        queue[i] = partQueue[i]
      }
    } else {
      for (let i = 0; i <= this.rear; i++) {
        queue[i] = this.queue[i]
      }
      for (let i = this.front + 1; i < this.queue.length; i++) {
        queue[i] = this.queue[i]
      }
    }
    let result: string = ""
    for (let i = 0; i < this.size; i++) {
      result += queue[i]
      if (i < this.size - 1) {
        result += ","
      }
    }
    return result
  }
}
