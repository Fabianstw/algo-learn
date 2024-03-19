import math from "@shared/utils/math.ts"

/**
 * This Class represents a Stack
 */
export class Stack {
  size: number
  stack: number[]
  currentPosition: number
  resize: boolean
  constructor(size: number, resize: boolean = false) {
    this.size = size
    this.stack = new Array(size).fill(math.NaN) as number[]
    this.currentPosition = -1
    this.resize = resize
  }

  /**
   * This method pushes an element to the stack
   * @param element The element to push
   */
  push(element: number): void {
    if (this.currentPosition < this.size - 1) {
      this.currentPosition++
      this.stack[this.currentPosition] = element
    } else {
      if (this.resize) {
        this.increaseStack()
        this.push(element)
      } else {
        throw new Error("The stack is full (no resizing enabled)")
      }
    }
  }

  /**
   * This method gets the top element from the stack
   * @returns The element that was popped
   */
  getTop(): number {
    if (this.currentPosition >= 0) {
      const returnValue = this.stack[this.currentPosition]
      if (this.resize && this.currentPosition < this.size / 4) {
        this.decreaseStack()
      }
      this.currentPosition--
      return returnValue
    } else {
      throw new Error("The stack is empty")
    }
  }

  /**
   * This method returns the size of the stack
   * @returns current number of elements in the stack
   */
  getCurrentPosition(): number {
    return this.currentPosition + 1
  }

  /**
   * This method returns the size of the stack
   * @returns The size of the stack
   */
  getSize(): number {
    return this.size
  }

  /**
   * This method resizes the stack and copies the elements to the new stack
   */
  increaseStack(): void {
    this.size *= 2
    const newStack = new Array(this.size).fill(math.NaN) as number[]
    for (let i = 0; i <= this.currentPosition; i++) {
      newStack[i] = this.stack[i]
    }
    this.stack = newStack
  }

  /**
   * This methode decreases the size of the stack
   */
  decreaseStack(): void {
    this.size /= 2
    const newStack = new Array(this.size).fill(math.NaN) as number[]
    for (let i = 0; i < this.currentPosition; i++) {
      newStack[i] = this.stack[i]
    }
    this.stack = newStack
  }

  /**
   * This method returns the current stack as a String format [x,y,z,...]
   * @returns The current stack
   */
  toString(): string {
    let returnValue = "["
    for (let i = 0; i <= this.currentPosition; i++) {
      returnValue += this.stack[i]
      if (i < this.currentPosition) {
        returnValue += ","
      }
    }
    returnValue += "]"
    return returnValue
  }

  /**
   * this method returns the complete stack as string
   * @returns the complete stack as string
   */
  getCompleteStack(): string {
    let res = "["
    for (let i = 0; i < this.size; i++) {
      res += this.stack[i]
      if (i < this.size - 1) {
        res += ","
      }
    }
    res += "]"
    return res
  }
}
