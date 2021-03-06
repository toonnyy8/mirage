import wabt_ from "./wabt"
(async () => {
    const wabt = wabt_()
    console.log(wabt)
    const inputWat = "main.wat"
    const wat = `;;wasm
(module
    (import "env" "log" (func $log (param i32)))
    (func $main
        (local $i i32) 
        (set_local $i (i32.const 1))                        ;; i = 1
        loop $LOOP
            (i32.le_s (get_local $i) (i32.const 10))        ;; i <= 10
            if
                get_local $i
                call $log
                (set_local $i                               ;; i = i + 1
                    (i32.add (get_local $i) (i32.const 1)))
                br $LOOP
            end
        end
    )
    (start $main)
)`

    interface Module {
        [key: string]: any,
        "test": () => number
    }

    const wasmModule = wabt.parseWat(inputWat, wat)
    wasmModule.resolveNames()
    // wasmModule.validate()
    const { buffer } = wasmModule.toBinary({})

    WebAssembly
        .compile(buffer)
        .then((module) => {
            WebAssembly
                .instantiate(module, {
                    env: {
                        log(input) {
                            console.log(input);
                        }
                    }
                })
                .then(results => {
                    let exports = <Module>results.exports;
                    console.log(exports)
                })
                .catch(console.error);
        })
})()