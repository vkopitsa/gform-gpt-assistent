import { customAlphabet } from 'nanoid'


// Use:
//   const myDebouncedFunction = debounce(e => {
//     console.log(e)
//   }, 3000)
//  
//   myDebouncedFunction('Hello world')
export const debounce = <T extends (...args: any[]) => ReturnType<T>>(
    callback: T,
    timeout: number = 300
  ): ((...args: Parameters<T>) => void) => {
    let timer: ReturnType<typeof setTimeout>
  
    return (...args: Parameters<T>) => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        callback(...args)
      }, timeout)
    }
  };

export const nanoid = customAlphabet('1234567890abcdef', 10);

export function timeout(ms?: number): Promise<() => {}> {
    return new Promise(resolve => setTimeout(resolve, ms));
};