export const asyncPipe = (...fns: Function[]) => {
    return (x: any) => fns.reduce(async (y, fn) => fn(await y), x)
}
