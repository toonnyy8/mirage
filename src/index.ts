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
let all = `(${a2z}|${A2Z}|${digit}|+|-|\\*|/|(\\\\)|(\\|)|!|@|#|$|%|^|&|(\\()|(\\))|_|=|{|}|[|]|;|:|"|'|~|\`| |\t|?|,|.)`
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
let source = `
let a = (b,c)=>{
    a=1;
    return a;
};
$
`
let lex = Lex(
    source,
    [
        { type: "gap", reg: gap },
        { type: "return", reg: `return` },
        { type: "let", reg: `let` },
        { type: "if", reg: `if` },
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
    ],
)

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
    genBNF("<Func>", ["(", "<Args>", ")", "=>", "{", "}",]),
    genBNF("<Func>", ["(", "<Args>", ")", "=>", "{", "<Sections>", "}",]),
    // 回傳
    genBNF("<Return>", ["return", "<Func>",]),
    genBNF("<Return>", ["return", "<Assign>",]),
    genBNF("<Return>", ["return", "<Exp>",]),
    // 參數集
    genBNF("<Args>", ["id",]),
    genBNF("<Args>", ["id", ",", "<Args>",]),
    genBNF("<Args>", ["<Assign>",]),
    genBNF("<Args>", ["<Assign>", ",", "<Args>",]),
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
    genBNF("<Factor>", ["id",]),
    genBNF("<Factor>", ["float",]),
    genBNF("<Factor>", ["(", "<Exp>", ")",]),

]

let yacc = Yacc(g)

let token: { type: string, value: string }
do {
    token = <typeof token>lex.next().value
    if (token && token.type != "gap") {
        console.log(token)
        console.log(yacc(token))
    }
} while (token != null)

let syntaxTree = yacc()
console.log(syntaxTree)

let varTable: Array<{ [name: string]: { type: "float" | "func", isArgs: boolean } }> = [{}]
let funcScope: Array<number> = []
let funcCode: Array<string> = []
interface typeVariable {
    name: string,
    type: "float" | typeFuncTypes,
}
let genVariable = (name: string, type: "float" | typeFuncTypes,): typeVariable => {
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
interface typeFunc {
    scope: Array<number>,
    funcType: typeFuncTypes,
    vars: Array<typeVariable>,
    code: string,
}
let genFunc = (scope: Array<number>, funcType: typeFuncTypes, vars: Array<typeVariable> = [], code: string = "",): typeFunc => {
    return {
        scope,
        funcType,
        vars,
        code,
    }
}
let funcs: Array<typeFunc>
let grammarFunc = {
    "<Program>": (sub: Array<typeSyntaxNode>) => {
        funcs = [genFunc([0], genFuncType([]))]
        varTable = [{}]
        funcScope = [0]
        let out: string = ""
        out += grammarFunc[sub[0].token.type](sub[0].sub)
        funcCode[0] = out
        return out
    },
    "<Sections>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        out = sub.reduce((out, node) => {
            out += grammarFunc[node.token.type](node.sub)
            return out
        }, out)
        return out
    },
    "<Section>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        switch (sub.length) {
            case 1: {
                switch (sub[0].token.type) {
                    case "<If>": {
                        out += grammarFunc[sub[0].token.type](sub[0].sub)
                        break
                    }
                    case "<While>": {
                        out += grammarFunc[sub[0].token.type](sub[0].sub)
                        break
                    }
                }
                break
            }
            case 2: {
                switch (sub[0].token.type) {
                    default: {
                        out += grammarFunc[sub[0].token.type](sub[0].sub)
                        if (sub[0].token.type == "<Exp>") {
                            out += `drop\n`
                        }
                        break
                    }
                }

                break
            }
        }

        return out
    },
    "<If>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        out += grammarFunc[sub[2].token.type](sub[2].sub)
        out += `f32.const 0\n`
        out += `f32.ne\n`
        out += `if\n`
        if (sub[5].token.type == "<Sections>") {
            out += grammarFunc[sub[5].token.type](sub[5].sub)
            if (sub[7]) {
                out += `else\n`
                if (sub[8].token.type == "<If>") {
                    out += grammarFunc[sub[8].token.type](sub[8].sub)
                } else if (sub[9].token.type == "<Sections>") {
                    out += grammarFunc[sub[9].token.type](sub[9].sub)
                }
            }
        } else {
            if (sub[6]) {
                out += `else\n`
                if (sub[7].token.type == "<If>") {
                    out += grammarFunc[sub[7].token.type](sub[7].sub)
                } else if (sub[8].token.type == "<Sections>") {
                    out += grammarFunc[sub[8].token.type](sub[8].sub)
                }
            }
        }
        out += `end\n`

        return out
    },
    "<While>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        out += `loop\n`
        out += grammarFunc[sub[2].token.type](sub[2].sub)
        out += `f32.const 0\n`
        out += `f32.ne\n`
        out += `if\n`
        if (sub[5].token.type == "<Sections>") {
            out += grammarFunc[sub[5].token.type](sub[5].sub)
        }
        out += `br 1\n`
        out += `end\n`
        out += `end\n`

        return out
    },
    "<Func>": (sub: Array<typeSyntaxNode>) => {
        let head: string = ""
        let args: string = ""
        let variables: string = ""
        let main: string = ""
        let func: typeFunc
        varTable = [...varTable, {}]
        funcScope = [...funcScope, varTable.length - 1]

        head += `func $f${varTable.length - 1}`
        if (sub[1].token.type == "<Args>") {
            grammarFunc[sub[1].token.type](sub[1].sub)
            if (sub[5].token.type == "<Sections>") {
                main += grammarFunc[sub[5].token.type](sub[5].sub)
            }
        } else {
            if (sub[4].token.type == "<Sections>") {
                main += grammarFunc[sub[4].token.type](sub[4].sub)
            }
        }
        let vt = varTable[funcScope.slice(-1)[0]]
        args += Object.keys(vt)
            .reduce((args, name) => {
                if (vt[name].isArgs == true) {
                    switch (vt[name].type) {
                        case "float": {
                            args += ` (param $${name} f32)`
                            break
                        }
                        case "func": {
                            break
                        }
                    }
                }
                return args
            }, args)
        variables += Object.keys(vt)
            .reduce((variables, name) => {
                if (vt[name].isArgs == false) {
                    switch (vt[name].type) {
                        case "float": {
                            variables += ` (local $${name} f32)`
                            break
                        }
                        case "func": {
                            break
                        }
                    }
                }
                return variables
            }, variables)
        funcCode[funcScope.slice(-1)[0]] = `(${head}\n${args}\n${variables}\n${main})\n`
        funcScope = funcScope.slice(0, -1)
        return ""
    },
    "<Args>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""

        switch (sub[0].token.type) {
            case "id": {
                varTable[funcScope.slice(-1)[0]][sub[0].token.value] = { type: "float", isArgs: true }
                break
            }
            case "<Assign>": {
                if (sub[0].sub[2].token.type == "<Func>") {
                    varTable[funcScope.slice(-1)[0]][sub[0].sub[0].token.value] = { type: "func", isArgs: true }
                } else {
                    varTable[funcScope.slice(-1)[0]][sub[0].sub[0].token.value] = { type: "float", isArgs: true }
                }
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                break
            }
        }
        if (sub.length == 3) {
            out += grammarFunc[sub[2].token.type](sub[2].sub)
        }
        return out
    },
    "<Return>": (sub: Array<typeSyntaxNode>) => {

    },
    "<Declares>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        out += grammarFunc[sub[1].token.type](sub[1].sub)
        return out
    },
    "<Declare>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""

        switch (sub[0].token.type) {
            case "id": {
                if (varTable[funcScope.slice(-1)[0]][sub[0].token.value]) console.error(`${sub[0].token.value} repeat declaration`)
                varTable[funcScope.slice(-1)[0]][sub[0].token.value] = { type: "float", isArgs: false }
                break
            }
            case "<Assign>": {
                if (varTable[funcScope.slice(-1)[0]][sub[0].sub[0].token.value]) console.error(`${sub[0].sub[0].token.value} repeat declaration`)
                if (sub[0].sub[2].token.type == "<Func>") {
                    varTable[funcScope.slice(-1)[0]][sub[0].sub[0].token.value] = { type: "func", isArgs: false }
                } else {
                    varTable[funcScope.slice(-1)[0]][sub[0].sub[0].token.value] = { type: "float", isArgs: false }
                }
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                break
            }
        }
        if (sub.length == 3) {
            out += grammarFunc[sub[2].token.type](sub[2].sub)
        }
        return out
    },
    "<Assign>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        if (varTable[funcScope.slice(-1)[0]][sub[0].token.value] == undefined) console.error(`${sub[0].token.value} is undefined`)
        out += grammarFunc[sub[2].token.type](sub[2].sub)
        out += `set_local $${sub[0].token.value}\n`

        return out
    },
    "<Exp>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        switch (sub.length) {
            case 1: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                break
            }
            case 3: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                out += grammarFunc[sub[2].token.type](sub[2].sub)
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
                break
            }
        }
        return out
    },
    "<Term>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        switch (sub.length) {
            case 1: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                break
            }
            case 3: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                out += grammarFunc[sub[2].token.type](sub[2].sub)
                switch (sub[1].token.value) {
                    case "*": {
                        out += `f32.mul\n`
                        break
                    }
                    case "/": {
                        out += `f32.div\n`
                        break
                    }
                }
                break
            }
        }
        return out
    },
    "<Compare>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        switch (sub.length) {
            case 1: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                break
            }
            case 3: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                out += grammarFunc[sub[2].token.type](sub[2].sub)
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
                break
            }
        }
        return out
    },
    "<Logic>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        switch (sub.length) {
            case 1: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                break
            }
            case 3: {
                out += grammarFunc[sub[0].token.type](sub[0].sub)
                out += `f32.const 0\n`
                out += `f32.ne\n`
                out += grammarFunc[sub[2].token.type](sub[2].sub)
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
                break
            }
        }
        return out
    },
    "<Factor>": (sub: Array<typeSyntaxNode>) => {
        let out: string = ""
        switch (sub.length) {
            case 1: {
                switch (sub[0].token.type) {
                    case "id": {
                        if (varTable[funcScope.slice(-1)[0]][sub[0].token.value] == undefined) console.error(`${sub[0].token.value} is undefined`)
                        out += `get_local $${sub[0].token.value}\n`
                        break
                    }
                    case "float": {
                        out += `f32.const ${sub[0].token.value}\n`
                        break
                    }
                }
                break
            }
            case 2: {
                out += grammarFunc[sub[1].token.type](sub[1].sub)
                switch (sub[0].token.value) {
                    case "+": {
                        break
                    }
                    case "-": {
                        out += `f32.neg\n`
                        break
                    }
                    case "!": {
                        out += `f32.const 0\n`
                        out += `f32.eq\n`
                        out += `f32.convert_u/i32\n`
                        break
                    }
                }
                break
            }
            case 3: {
                out += grammarFunc[sub[1].token.type](sub[1].sub)
                break
            }
        }
        return out
    },
}

console.log(
    source
)
console.log(
    grammarFunc[syntaxTree.token.type](syntaxTree.sub)
)
console.log(
    varTable
)
console.log(
    funcScope
)
console.log(
    funcCode
)