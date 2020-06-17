export const arrAddElem = <T>(arr: Array<T>, elem: T) => {
    if (arr.find((value) => value == elem) == null) {
        return [...arr, elem]
    }
    return [...arr]
}

export const arrAddArr = <T>(arr1: Array<T>, arr2: Array<T>) => {
    if (arr2.length == 0) return [...arr2]
    return arr2.reduce((prev, curr) => {
        return arrAddElem(prev, curr)
    }, arr1)
}