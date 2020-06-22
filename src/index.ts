import { compiler } from "./compiler"
import wabt_ from "./wabt"

let startCompile = async () => {
    document.getElementById("log").innerText = ""

    const wabt = wabt_()
    console.log(wabt)
    const inputWat = "main.wat"
    let wat
    try {
        wat = compiler((<HTMLTextAreaElement>document.getElementById("sourceCode")).value)
    }
    catch (e) {
        console.error(e)
    }
    // wat = compiler(`
    // let fib=(n) =>{
    //     if((n==0)||(n==1)){
    //         return n;
    //     }
    //     return self(n - 1)+self(n - 2);
    // };
    // log(fib(10));
    // $
    // `)
    console.log(wat)

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
                            document.getElementById("log").innerText += `${input}\n`
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
}
let logError = console.error
console.error = (...messages) => {
    logError(...messages)
    messages.forEach(message => document.getElementById("log").innerHTML += `<span style="color:#ff5555">error : ${message}<br/></span>`)

}
document.getElementById("startCompile").onclick = startCompile
console.log(document.getElementById("sourceCode").textContent)