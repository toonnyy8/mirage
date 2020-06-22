import { rules, grammar, codeGenerator } from "./mirgae"
// import { ruleDFAs, cfsm } from "./mirgae"
import { ruleDFAs, cfsm } from "./language"
import { Lex_ } from "./scanner"
import { Yacc } from "./parser"
import wabt_ from "./wabt"

let compiler = (source: string) => {
    let lex = Lex_(source, rules, ruleDFAs)
    let yacc = Yacc(grammar, cfsm)


    let token: { type: string, value: string }
    do {
        token = <typeof token>lex.next().value
        if (token && token.type == "gap") {
            console.warn(token)
        }
        if (token && token.type != "gap") {
            console.log(token)
            console.log(yacc(token))
        }
    } while (token != null)

    let syntaxTree = yacc()
    console.log(syntaxTree)
    console.log(source)
    let code = codeGenerator(syntaxTree.sub).code
    return code
}
// console.log(
//     compiler(`
// let f=(a,b)=>{
//     return ()=>{return 9;};
// },a=1;

// f(1,2)();
// log(1%2);
// $
// `)
// );

(async () => {
    const wabt = wabt_()
    console.log(wabt)
    const inputWat = "main.wat"
    let wat = `;;wasm
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
    wat = compiler(`
    let fib=(n) =>{
        if((n==0)||(n==1)){
            return n;
        }
        return self(n - 1)+self(n - 2);
    };
    log(fib(10));
    $
    `)
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