import "core-js/stable"
import "regenerator-runtime/runtime"

class Ptr {
    constructor() {
        this._value = null
    }
    set value(data) {
        if (data instanceof Ptr) {
            this._value = data.value
        } else {
            this._value = data
        }
    }
    get value() {
        return this._value
    }
}

export let ptr = () => new Ptr()

export let _ = (...args) => {
    return args[0](...args.slice(1))
}

export let assign = (x, y) => {
    x.value = y
    return x
}