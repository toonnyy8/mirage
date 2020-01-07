import "core-js/stable"
import "regenerator-runtime/runtime"

class Memory {
    constructor(type) {
        this._type = type
        this._data = null
    }
    set data(value) {
        if (this._type !== null && this._type !== undefined) {
            if (mem instanceof this._type) {
                this._data = value
            } else {
                let error = new Error("type error");
                console.log(error)
            }
        } else {
            this._data = value
        }
    }
    get data() {
        return this._data
    }
}

export let memory = (type) => new Memory(type)

export let _ = (...args) => {
    return args[0](...args.slice(1))
}

export let assign = (x, y) => {
    x.data = y
    return x
}

export let load = (x) => {
    return x.data
}