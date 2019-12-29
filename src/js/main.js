import "@babel/polyfill"

let _ = (...args) => {
    return args[0](...args.slice(1))
}

let assign = (x, y) => {
    x.value = y
    return x
}

let x = { value: 0 }

_(console.log, x)

_(assign, x, 10)

_(console.log, x)
