import { scanner, driver, genDFA, Lex } from "./scanner"
// import "./scanner/test"
import { genBNF, genGrammar, typeSyntaxNode, Yacc } from "./parser"
// import "./parser/test"

let a2z = "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)"
let A2Z = "(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)"
let digit = "(0|1|2|3|4|5|6|7|8|9)"
let num = `(${digit}${digit}*)`
let id = `((_|${a2z}|${A2Z})(_|${a2z}|${A2Z}|${digit})*)`
let int = `${num}`
let float = `(${num}.${num})|(${num}.)|(${num})`
let assign = `(=)`
let op1 = `(+|-)`
let op2 = `(\\*|/|%)`
let op3 = `(>|<|==|!=|>=|<=)`
let op4 = `(&&|\\|\\|)`
let op5 = `(!)`
let EOL = `;`
let EOF = `$`
let space = `(( |\n|\t)*)`
let all = `(${a2z}|${A2Z}|${digit}|+|-|\\*|/|(\\\\)|(\\|)|!|@|#|$|%|^|&|(\\()|(\\))|_|=|{|}|[|]|;|:|"|'|~|\`| |\t|?|,|.|>|<)`
let comment = `(//${all}*)`
let gap = `(${space}|${comment})`

// let source = `
// a := b+c /10;//asd
// //asd

// b :=  c 
// //asd
// ; ;
// c+-10;
// if(12-12){
//     x:=178.55;
// }else if(9){
//     if(1){
//         1;
//     }else if(2){

//     }else{

//     }
// }else if(2){

// }else if(3){

// }
// $
// `
let rules = [
    { type: "gap", reg: gap },
    { type: "return", reg: `return` },
    { type: "let", reg: `let` },
    { type: "if", reg: `if` },
    { type: "log", reg: `log` },
    { type: "else", reg: `else` },
    { type: "for", reg: `for` },
    { type: "while", reg: `while` },
    { type: "EOL", reg: EOL },
    { type: "EOF", reg: EOF },
    { type: ",", reg: `,` },
    { type: "(", reg: `\\(` },
    { type: ")", reg: `\\)` },
    { type: "{", reg: `{` },
    { type: "}", reg: `}` },
    { type: "=>", reg: `=>` },
    { type: "assign", reg: assign },
    { type: "float", reg: float },
    { type: "op5", reg: op5 },
    { type: "op4", reg: op4 },
    { type: "op3", reg: op3 },
    { type: "op2", reg: op2 },
    { type: "op1", reg: op1 },
    { type: "id", reg: id },
]
let g = [
    // 主結構解析
    genBNF("<Program>", ["<Sections>", "EOF",]),

    genBNF("<Sections>", ["<Sections>", "<Section>",]),
    genBNF("<Sections>", ["<Section>",]),

    genBNF("<Section>", ["<Declares>", "EOL",]),
    genBNF("<Section>", ["<Assign>", "EOL",]),
    genBNF("<Section>", ["<Exp>", "EOL",]),
    genBNF("<Section>", ["EOL"]),
    genBNF("<Section>", ["<If>",]),
    genBNF("<Section>", ["<While>",]),
    genBNF("<Section>", ["<Func>",]),
    genBNF("<Section>", ["<Return>", "EOL",]),
    genBNF("<Section>", ["<Log>", "EOL",]),

    genBNF("<Log>", ["log", "(", "<Assign>", ")",]),
    genBNF("<Log>", ["log", "(", "<Exp>", ")",]),
    // if
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "<Sections>", "}",]),
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "<Sections>", "}", "else", "{", "}",]),
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "<Sections>", "}", "else", "<If>",]),
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "<Sections>", "}", "else", "{", "<Sections>", "}",]),
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "}",]),
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "}", "else", "{", "}",]),
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "}", "else", "<If>",]),
    genBNF("<If>", ["if", "(", "<Exp>", ")", "{", "}", "else", "{", "<Sections>", "}",]),
    // while
    genBNF("<While>", ["while", "(", "<Exp>", ")", "{", "<Sections>", "}",]),
    genBNF("<While>", ["while", "(", "<Exp>", ")", "{", "}",]),
    // 函式
    genBNF("<Func>", ["(", ")", "=>", "{", "}",]),
    genBNF("<Func>", ["(", ")", "=>", "{", "<Sections>", "}",]),
    genBNF("<Func>", ["(", "<Params>", ")", "=>", "{", "}",]),
    genBNF("<Func>", ["(", "<Params>", ")", "=>", "{", "<Sections>", "}",]),
    // 回傳
    genBNF("<Return>", ["return", "<Func>",]),
    genBNF("<Return>", ["return", "<Assign>",]),
    genBNF("<Return>", ["return", "<Exp>",]),
    // 參數集
    genBNF("<Params>", ["id",]),
    genBNF("<Params>", ["id", ",", "<Params>",]),
    // genBNF("<Params>", ["<Assign>",]),
    // genBNF("<Params>", ["<Assign>", ",", "<Params>",]),
    // 呼叫函式
    genBNF("<Call>", ["<Id>", "(", ")",]),
    genBNF("<Call>", ["<Id>", "(", "<Args>", ")",]),
    genBNF("<Call>", ["<Call>", "(", ")",]),
    genBNF("<Call>", ["<Call>", "(", "<Args>", ")",]),
    // 引數集
    genBNF("<Args>", ["<Exp>",]),
    genBNF("<Args>", ["<Exp>", ",", "<Args>",]),
    // 宣告
    genBNF("<Declares>", ["let", "<Declare>",]),
    // 參數集
    genBNF("<Declare>", ["id",]),
    genBNF("<Declare>", ["id", ",", "<Declare>",]),
    genBNF("<Declare>", ["<Assign>",]),
    genBNF("<Declare>", ["<Assign>", ",", "<Declare>",]),
    // 賦值
    genBNF("<Assign>", ["id", "assign", "<Assign>",]),
    genBNF("<Assign>", ["id", "assign", "<Exp>",]),
    genBNF("<Assign>", ["id", "assign", "<Func>",]),

    genBNF("<Exp>", ["<Term>",]),
    genBNF("<Exp>", ["<Exp>", "op1", "<Term>",]),

    genBNF("<Term>", ["<Compare>"]),
    genBNF("<Term>", ["<Term>", "op2", "<Compare>",]),

    genBNF("<Compare>", ["<Logic>"]),
    genBNF("<Compare>", ["<Compare>", "op3", "<Logic>",]),

    genBNF("<Logic>", ["<Factor>"]),
    genBNF("<Logic>", ["<Logic>", "op4", "<Factor>",]),

    genBNF("<Factor>", ["op1", "<Factor>",]),
    genBNF("<Factor>", ["op5", "<Factor>",]),
    genBNF("<Factor>", ["<Id>",]),
    genBNF("<Factor>", ["<Call>",]),
    genBNF("<Factor>", ["float",]),
    genBNF("<Factor>", ["(", "<Exp>", ")",]),

    genBNF("<Id>", ["id",]),

]

interface typeVariable {
    name: string,
    type: "undetermined" | "float" | typeFuncTypes,
}
let genVariable = (name: string, type: "undetermined" | "float" | typeFuncTypes,): typeVariable => {
    return {
        name,
        type,
    }
}
interface typeFuncTypes {
    params: Array<typeVariable>,
    result: typeVariable,
}
let genFuncType = (params: Array<typeVariable>, result: typeVariable = null,): typeFuncTypes => {
    return {
        params,
        result,
    }
}
let eqType = (typeA: "undetermined" | "float" | typeFuncTypes, typeB: "undetermined" | "float" | typeFuncTypes): boolean => {
    if (typeA === "undetermined" || typeB === "undetermined") {
        return true;
    } else if (typeA === typeB) {
        return true
    } else if (typeA === "float" || typeB === "float") {
        return false
    } else {
        if ((<typeFuncTypes>typeA).params.length !=
            (<typeFuncTypes>typeB).params.length) {
            return false
        } else if (
            !eqType(
                (<typeFuncTypes>typeA).result.type,
                (<typeFuncTypes>typeB).result.type)) {
            return false
        } else {
            return (<typeFuncTypes>typeA)
                .params
                .find((param, idx) => !eqType(param.type, (<typeFuncTypes>typeB).params[idx].type)) == undefined
        }
    }
}
interface typeFunc {
    scope: number,
    funcType: typeFuncTypes,
    code: string,
}
let genFunc = (scope: number, funcType: typeFuncTypes, code: string = "",): typeFunc => {
    return {
        scope,
        funcType,
        code,
    }
}
let funcs: Array<typeFunc>
interface typeScope {
    atScopes: Array<number>,
    vars: Array<typeVariable>
    atFunc: number
}
let genScope = (atScopes: Array<number>, vars: Array<typeVariable>, atFunc: number = null): typeScope => ({ atScopes, vars, atFunc })
let scopes: Array<typeScope>
let grammarFunc = {
    "<Program>": (sub: Array<typeSyntaxNode>) => {
        let atScope = 0
        funcs = []
        scopes = [genScope([atScope], [])]

        let out: string = ""
        out += grammarFunc[sub[0].token.type](sub[0].sub, atScope).code
        out = `(module
    (import "env" "log" (func $log (param f32)))
    ${funcs
                .reduce((typeCode, func, idx) => {
                    return `${typeCode} (type $type_${idx} (func${
                        func
                            .funcType
                            .params
                            .reduce((paramCode, param) => {
                                return `${paramCode} (param ${param.type == "float" ? "f32" : "i32"})`
                            }, "")
                        } (result ${func.funcType.result.type == "float" ? "f32" : "i32"})))\n`
                }, "")}
    (table $tb ${funcs.length + 1} anyfunc)
    ${funcs.reduce((funcCode, func) => `${funcCode}${func.code}`, "")}
    (elem (i32.const 1) ${funcs.reduce((funcName, func, idx) => `${funcName} $func_${idx}`, "")})
    (func $mod (param $a f32) (param $b f32) (result f32)
        get_local $a
        get_local $a
        get_local $b
        f32.div
        f32.floor
        get_local $b
        f32.mul
        f32.sub
    )
    (func $main
        ${scopes.reduce((paramCode, scope) => {
                    if (scope.atScopes.slice(-1)[0] == 0) {
                        return scope
                            .vars
                            .reduce((paramCode, variable) => {
                                return `${paramCode} (local $var_${variable.name}${scope.atScopes[0]} ${variable.type == "float" ? "f32" : "i32"})`
                            }, paramCode)

                    } else {
                        return paramCode
                    }
                }, "")}
        ${out})
)`
        return { code: out, type: null }
    },
    "<Sections>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        out = sub.reduce((out, node) => {
            out += grammarFunc[node.token.type](node.sub, atScope).code
            return out
        }, out)
        return { code: out, type: null }
    },
    "<Section>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        switch (sub.length) {
            case 1: {
                switch (sub[0].token.type) {
                    case "<If>": {
                        out += grammarFunc[sub[0].token.type](sub[0].sub, atScope)
                        break
                    }
                    case "<While>": {
                        out += grammarFunc[sub[0].token.type](sub[0].sub, atScope)
                        break
                    }
                }
                break
            }
            case 2: {
                out += grammarFunc[sub[0].token.type](sub[0].sub, atScope).code
                switch (sub[0].token.type) {
                    case "<Assign>": {
                        out += `drop\n`
                        break
                    }
                    case "<Exp>": {
                        out += `drop\n`
                        break
                    }
                    case "<Func>": {
                        out += `drop\n`
                        break
                    }
                    default: {
                    }
                }

                break
            }
        }

        return { code: out, type: null }
    },
    "<Log>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let { code, type } = grammarFunc[sub[2].token.type](sub[2].sub)
        if (type != "float") {
            console.error(`The argument type of log is error`)
        }
        out += code
        out += `call $log\n`
        return { code: out, type: null }
    },
    "<If>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scopes.length
        scopes = [...scopes, genScope([atScope, ...scopes[scope].atScopes,], [], scopes[scope].atFunc,)]
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        let code
        ({ code, type } = grammarFunc[sub[2].token.type](sub[2].sub))
        out += code
        if (type != "float") {
            out += `drop\n`
            out += `i32.const 1\n`
        } else {
            out += `f32.const 0\n`
            out += `f32.ne\n`
        }
        out += `if\n`
        if (sub[5].token.type == "<Sections>") {
            out += grammarFunc[sub[5].token.type](sub[5].sub, atScope).code
            if (sub[7]) {
                out += `else\n`
                if (sub[8].token.type == "<If>") {
                    out += grammarFunc[sub[8].token.type](sub[8].sub, scope).code
                } else if (sub[9].token.type == "<Sections>") {
                    let atScope = scopes.length
                    scopes = [...scopes, genScope([atScope, ...scopes[scope].atScopes,], [], scopes[scope].atFunc,)]
                    out += grammarFunc[sub[9].token.type](sub[9].sub, atScope).code
                }
            }
        } else {
            if (sub[6]) {
                out += `else\n`
                if (sub[7].token.type == "<If>") {
                    out += grammarFunc[sub[7].token.type](sub[7].sub, scope).code
                } else if (sub[8].token.type == "<Sections>") {
                    let atScope = scopes.length
                    scopes = [...scopes, genScope([atScope, ...scopes[scope].atScopes,], [], scopes[scope].atFunc,)]
                    out += grammarFunc[sub[8].token.type](sub[8].sub, atScope).code
                }
            }
        }
        out += `end\n`

        return { code: out, type: null }
    },
    "<While>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scopes.length
        scopes = [...scopes, genScope([atScope, ...scopes[scope].atScopes,], [], scopes[scope].atFunc,)]
        let out: string = ""
        out += `loop\n`
        out += grammarFunc[sub[2].token.type](sub[2].sub).code
        out += `f32.const 0\n`
        out += `f32.ne\n`
        out += `if\n`
        if (sub[5].token.type == "<Sections>") {
            out += grammarFunc[sub[5].token.type](sub[5].sub, atScope).code
        }
        out += `br 1\n`
        out += `end\n`
        out += `end\n`

        return { code: out, type: null }
    },
    "<Func>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scopes.length
        let atFunc = funcs.length
        scopes = [...scopes, genScope([atScope], [], atFunc)]
        funcs = [...funcs, genFunc(atScope, genFuncType([]), "")]
        let head: string = ""
        let params: string = ""
        let result: string = ""
        let variables: string = ""
        let main: string = ""

        head += `func $func_${atFunc}`
        if (sub[1].token.type == "<Params>") {
            grammarFunc[sub[1].token.type](sub[1].sub, atFunc)
            if (sub[5].token.type == "<Sections>") {
                main += grammarFunc[sub[5].token.type](sub[5].sub, atScope).code
            }
        } else {
            if (sub[4].token.type == "<Sections>") {
                main += grammarFunc[sub[4].token.type](sub[4].sub, atScope).code
            }
        }
        params += funcs[atFunc]
            .funcType
            .params
            .reduce((paramCode, param) => {
                return `${paramCode} (param $var_${param.name} f32)`
            }, "")

        variables += scopes
            .filter((scope) => {
                return atScope == scope.atScopes[scope.atScopes.length - 1]
            })
            .reduce((variableCode, scope) => {
                return scope
                    .vars
                    .reduce((variableCode, variable) => {
                        return `${variableCode} (local $var_${variable.name}${scope.atScopes[0]} f32)`
                    }, variableCode)
            }, "")
        if (funcs[atFunc].funcType.result == null ||
            funcs[atFunc].funcType.result.type == "float") {
            funcs[atFunc].funcType.result = { name: "", type: "float" }
            result = "f32"
        } else {
            result = "i32"
        }
        result = funcs[atFunc].funcType.result.type == "float" ? "f32" : "i32"
        funcs[atFunc].code = `(${head}\n${params}\n(result ${result})\n${variables}\n${main}${
            result == "f32" ?
                `f32.const nan\nreturn` :
                `i32.const -1\nreturn`
            })\n`
        return { code: `i32.const ${atFunc}\n`, type: funcs[atFunc].funcType }
    },
    "<Params>": (sub: Array<typeSyntaxNode>, atFunc: number) => {
        let out: string = ""

        switch (sub[0].token.type) {
            case "id": {
                funcs[atFunc].funcType.params = [...funcs[atFunc].funcType.params, { name: sub[0].token.value, type: "float" }]
                break
            }
            // case "<Assign>": {
            //     if (sub[0].sub[2].token.type == "<Func>") {
            //         varTable[funcScope.slice(-1)[0]][sub[0].sub[0].token.value] = { type: "func", isParams: true }
            //     } else {
            //         varTable[funcScope.slice(-1)[0]][sub[0].sub[0].token.value] = { type: "float", isParams: true }
            //     }
            //     out += grammarFunc[sub[0].token.type](sub[0].sub)
            //     break
            // }
        }
        if (sub.length == 3) {
            // out += grammarFunc[sub[2].token.type](sub[2].sub, atFunc).code
            grammarFunc[sub[2].token.type](sub[2].sub, atFunc)
        }
        return { code: out, type: null }
    },
    "<Return>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        if (scopes[atScope].atScopes.slice(-1)[0] == 0) {
            console.error("'return' 陳述式只可在函式主體內使用。")
        } else {
            let code
            ({ code, type } = grammarFunc[sub[1].token.type](sub[1].sub, atScope))
            if (funcs[scopes[atScope].atFunc].funcType.result == null ||
                eqType(funcs[scopes[atScope].atFunc].funcType.result.type, type)) {
                funcs[scopes[atScope].atFunc].funcType.result = { name: "", type: type }
            } else {
                console.error(`return type error`)
            }

            out += code
            out += "return\n"
        }
        return { code: out, type }
    },
    "<Call>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let out: string = ""
        let atScope = scope
        let type: "undetermined" | "float" | typeFuncTypes
        let code
        ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
        if (type == "float") {
            console.error(`is not a func`)
        } else {
            if (sub[2].token.type == "<Args>") {
                let argsData = grammarFunc["<Args>"](sub[2].sub, atScope)
                if (!eqType(<typeFuncTypes>type,
                    argsData.type)) {
                    console.error("引數錯誤")
                }
                out += argsData.code
            } else {
                if ((<typeFuncTypes>type).params.length != 0) {
                    console.error("引數錯誤")
                }
            }
            out += code
            out += `call_indirect (type $type_${funcs
                .findIndex(func => eqType(func.funcType, type))})\n`

            return { code: out, type: (<typeFuncTypes>type).result.type }
        }
        return { code: out, type: null }
    },
    "<Args>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let types = genFuncType([], genVariable("", "undetermined"));
        {
            let type
            let code
            ({ code, type } = grammarFunc["<Exp>"](sub[0].sub, atScope))
            types.params = [...types.params, genVariable("", type)]
            out += code
        }
        if (sub.length == 3) {
            let argsData = grammarFunc["<Args>"](sub[2].sub, atScope)
            types.params = [...types.params, ...argsData.type.params]
            out += argsData.code
        }

        return { code: out, type: types }
    },
    "<Declares>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        out += grammarFunc[sub[1].token.type](sub[1].sub, atScope).code
        return { code: out, type: null }
    },
    "<Declare>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        switch (sub[0].token.type) {
            case "id": {
                let varAtParam = scopes[atScope].atFunc != null ?
                    funcs[scopes[atScope].atFunc]
                        .funcType
                        .params
                        .find(param => param.name == sub[0].token.value) :
                    undefined
                if (scopes[atScope].atScopes.length == 1 && varAtParam != undefined) {
                    console.error(`${sub[0].token.value} repeat declaration`)
                } else if (scopes[atScope].vars.find((variable) => variable.name == sub[0].token.value) != undefined) {
                    console.error(`${sub[0].token.value} repeat declaration`)
                } else {
                    scopes[atScope].vars = [...scopes[atScope].vars, genVariable(sub[0].token.value, "float")]
                }
                break
            }
            case "<Assign>": {
                let varAtParam = scopes[atScope].atFunc != null ?
                    funcs[scopes[atScope].atFunc]
                        .funcType
                        .params
                        .find(param => param.name == sub[0].sub[0].token.value) :
                    undefined
                if (scopes[atScope].atScopes.length == 1 && varAtParam != undefined) {
                    console.error(`${sub[0].sub[0].token.value} repeat declaration`)
                } else if (scopes[atScope].vars.find((variable) => variable.name == sub[0].sub[0].token.value) != undefined) {
                    console.error(`${sub[0].sub[0].token.value} repeat declaration`)
                } else {
                    let varNum = scopes[atScope].vars.length
                    scopes[atScope].vars = [...scopes[atScope].vars, genVariable(sub[0].sub[0].token.value, "undetermined")]
                    let code
                    ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                    scopes[atScope].vars[varNum].type = type
                    out += code
                    out += "drop\n"
                }
                break
            }
        }
        if (sub.length == 3) {
            out += grammarFunc[sub[2].token.type](sub[2].sub, atScope).code
        }
        return { code: out, type: null }
    },
    "<Assign>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        let varAtParam = scopes[atScope].atFunc != null ?
            funcs[scopes[atScope].atFunc]
                .funcType
                .params
                .find(param => param.name == sub[0].token.value) :
            undefined
        let varAtScope = scopes[atScope]
            .atScopes
            .find((at) => {
                return scopes[at].vars.find(variable => variable.name == sub[0].token.value) != undefined
            })

        let code
        ({ code, type } = grammarFunc[sub[2].token.type](sub[2].sub, atScope))
        out += code
        if (varAtScope != undefined) {
            if (!eqType(
                scopes[varAtScope]
                    .vars
                    .find(variable => variable.name == sub[0].token.value)
                    .type,
                type
            )) {
                console.error(`${sub[0].token.value} 的 type 錯誤`)
            }

            out += `set_local $var_${sub[0].token.value}${varAtScope}\n`
            out += `get_local $var_${sub[0].token.value}${varAtScope}\n`
        } else if (varAtParam != undefined) {
            if (!eqType(
                funcs[scopes[atScope].atFunc]
                    .funcType
                    .params
                    .find(param => param.name == sub[0].token.value)
                    .type,
                type
            )) {
                console.error(`${sub[0].token.value} 的 type 錯誤`)
            }
            out += `set_local $var_${sub[0].token.value}\n`
            out += `get_local $var_${sub[0].token.value}\n`
        } else {
            console.error(`${sub[0].token.value} is undefined`)
        }
        // out += grammarFunc[sub[2].token.type](sub[2].sub, atScope)


        return { code: out, type }
    },
    "<Exp>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        switch (sub.length) {
            case 1: {
                let code
                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code
                break
            }
            case 3: {
                let code
                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code
                if (type != "float") {
                    out += "drop\n"
                    out += "f32.const nan\n"
                }
                ({ code, type } = grammarFunc[sub[2].token.type](sub[2].sub, atScope))
                out += code
                if (type != "float") {
                    out += "drop\n"
                    out += "f32.const nan\n"
                }
                switch (sub[1].token.value) {
                    case "+": {
                        out += `f32.add\n`
                        break
                    }
                    case "-": {
                        out += `f32.sub\n`
                        break
                    }
                }
                type = "float"
                break
            }
        }
        return { code: out, type }
    },
    "<Term>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        switch (sub.length) {
            case 1: {
                let code
                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code
                break
            }
            case 3: {
                let code
                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code
                if (type != "float") {
                    out += "drop\n"
                    out += "f32.const nan\n"
                }
                ({ code, type } = grammarFunc[sub[2].token.type](sub[2].sub, atScope))
                out += code
                if (type != "float") {
                    out += "drop\n"
                    out += "f32.const nan\n"
                }
                switch (sub[1].token.value) {
                    case "*": {
                        out += `f32.mul\n`
                        break
                    }
                    case "/": {
                        out += `f32.div\n`
                        break
                    }
                    case "%": {
                        let mod = (a, b) => a - Math.floor(a / b) * b
                        out += `call $mod\n`
                        break
                    }
                }
                type = "float"
                break
            }
        }
        return { code: out, type }
    },
    "<Compare>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        switch (sub.length) {
            case 1: {
                let code
                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code
                break
            }
            case 3: {
                let code
                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code;
                if (type != "float") {
                    out += 'drop\n'
                    out += 'f32.const nan\n'
                }
                ({ code, type } = grammarFunc[sub[2].token.type](sub[2].sub, atScope))
                out += code;
                if (type != "float") {
                    out += 'drop\n'
                    out += 'f32.const nan\n'
                }
                switch (sub[1].token.value) {
                    case ">": {
                        out += `f32.gt\n`
                        break
                    }
                    case "<": {
                        out += `f32.lt\n`
                        break
                    }
                    case "==": {
                        out += `f32.eq\n`
                        break
                    }
                    case "!=": {
                        out += `f32.ne\n`
                        break
                    }
                    case ">=": {
                        out += `f32.ge\n`
                        break
                    }
                    case "<=": {
                        out += `f32.le\n`
                        break
                    }
                }
                out += `f32.convert_u/i32\n`
                type = "float"
                break
            }
        }
        return { code: out, type }
    },
    "<Logic>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        switch (sub.length) {
            case 1: {
                let code
                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code
                break
            }
            case 3: {
                let code

                ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                out += code
                if (type != "float") {
                    out += `f32.convert_u/i32\n`
                }
                out += `f32.const 0\n`
                out += `f32.ne\n`;

                ({ code, type } = grammarFunc[sub[2].token.type](sub[2].sub, atScope))
                out += code
                if (type != "float") {
                    out += `f32.convert_u/i32\n`
                }
                out += `f32.const 0\n`
                out += `f32.ne\n`

                switch (sub[1].token.value) {
                    case "&&": {
                        out += `i32.and\n`
                        break
                    }
                    case "||": {
                        out += `i32.and\n`
                        break
                    }
                }
                out += `f32.convert_u/i32\n`
                type = "float"
                break
            }
        }
        return { code: out, type }
    },
    "<Factor>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        switch (sub.length) {
            case 1: {
                switch (sub[0].token.type) {
                    case "<Id>": {
                        let code
                        ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                        out += code
                        break
                    }
                    case "float": {
                        out += `f32.const ${sub[0].token.value}\n`
                        type = "float"
                        break
                    }
                    case "<Call>": {
                        let code
                        ({ code, type } = grammarFunc[sub[0].token.type](sub[0].sub, atScope))
                        out += code
                    }
                }
                break
            }
            case 2: {
                let code
                ({ code, type } = grammarFunc[sub[1].token.type](sub[1].sub))
                out += code
                switch (sub[0].token.value) {
                    case "+": {
                        if (type != "float") {
                            out += 'drop\n'
                            out += 'f32.const nan\n'
                        }
                        type = "float"
                        break
                    }
                    case "-": {
                        if (type != "float") {
                            out += 'drop\n'
                            out += 'f32.const nan\n'
                        }
                        out += `f32.neg\n`
                        type = "float"
                        break
                    }
                    case "!": {
                        if (type != "float") {
                            out += 'f32.convert_s/i32\n'
                        }
                        out += `f32.const 0\n`
                        out += `f32.eq\n`
                        out += `f32.convert_u/i32\n`
                        type = "float"
                        break
                    }
                }
                break
            }
            case 3: {
                let code
                ({ code, type } = grammarFunc[sub[1].token.type](sub[1].sub))
                out += code
                break
            }
        }
        return { code: out, type }
    },
    "<Id>": (sub: Array<typeSyntaxNode>, scope: number) => {
        let atScope = scope
        let out: string = ""
        let type: "undetermined" | "float" | typeFuncTypes
        let varAtScope = scopes[atScope]
            .atScopes
            .find((at) => {
                return scopes[at].vars.find(variable => variable.name == sub[0].token.value) != undefined
            })
        let varAtParam = scopes[atScope].atFunc != null ?
            funcs[scopes[atScope].atFunc]
                .funcType
                .params
                .find(param => param.name == sub[0].token.value) :
            undefined
        if (varAtScope != undefined) {
            out += `get_local $var_${sub[0].token.value}${varAtScope}\n`
            type = scopes[varAtScope].vars.find(variable => variable.name == sub[0].token.value).type
        } else if (varAtParam != undefined) {
            out += `get_local $var_${sub[0].token.value}\n`
            type = funcs[scopes[atScope].atFunc]
                .funcType
                .params
                .find(param => param.name == sub[0].token.value).type
        } else {
            console.error(`${sub[0].token.value} is undefined`)
        }
        return { code: out, type }
    }
}


let source = `
let f=(a,b)=>{
    return ()=>{return 9;};
},a=1;

f(1,2)();
log(1%2);
$
`
let lex = Lex(
    source,
    rules,
)

let yacc = Yacc(g)

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

console.log(
    source
)
console.log(
    grammarFunc[syntaxTree.token.type](syntaxTree.sub).code
)
console.log(
    funcs
)
console.log(
    scopes
)