import { scanner, driver, genDFA, Lex } from "./scanner"
// import "./scanner/test"
import { genBNF, genGrammar, SyntaxNode, Yacc } from "./parser"
// import "./parser/test"

let a2z = "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)"
let A2Z = "(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)"
let digit = "(0|1|2|3|4|5|6|7|8|9)"
let num = `(${digit}${digit}*)`
let r = `(\\))`
let l = `(\\()`
let id = new RegExp(`(_|${a2z}|${A2Z})(_|${a2z}|${A2Z}|${digit})*`)
let int = new RegExp(`${num}`)
let float = new RegExp(`(${num}.${num})|(${num}.)|(${num})`)
let assign = new RegExp(`:=`)
let op1 = /\+|-/
let op2 = /\*|\//
let end = /;/

let source = "a:=-c*-2+10.02/(3.45+7);"
let lex = Lex(
    source,
    [
        // { type: "int", reg: int },
        { type: "float", reg: float },
        { type: "id", reg: id },
        { type: "assign", reg: assign },
        { type: "op1", reg: op1 },
        { type: "op2", reg: op2 },
        { type: "end", reg: end },
        { type: "(", reg: new RegExp(l) },
        { type: ")", reg: new RegExp(r) },
    ],
)

let g = [
    genBNF("<section>", ["<assign>", "end"]),
    genBNF("<assign>", ["id", "assign", "<exp>"]),
    genBNF("<exp>", ["<term>"]),
    genBNF("<exp>", ["<exp>", "op1", "<term>"]),
    genBNF("<term>", ["<factor>"]),
    genBNF("<term>", ["<term>", "op2", "<factor>"]),
    genBNF("<factor>", ["id"]),
    genBNF("<factor>", ["int"]),
    genBNF("<factor>", ["float"]),
    genBNF("<factor>", ["op1", "id"]),
    // genBNF("<factor>", ["op1", "int"]),
    genBNF("<factor>", ["op1", "float"]),
    genBNF("<factor>", ["(", "<exp>", ")"]),
]

let yacc = Yacc(g)

let token
do {
    token = lex.next().value
    console.log(yacc(token))
} while (token != null)

let syntaxTree = yacc()
console.log(syntaxTree)

let grammarFunc = {
    "<section>": (sub: Array<SyntaxNode>) => {
        let out: string = ""
        out += grammarFunc[sub[0].token.type](sub[0].sub)
        out += `call $log\n`

        return out
    },
    "<assign>": (sub: Array<SyntaxNode>) => {
        let out: string = ""
        out += grammarFunc[sub[2].token.type](sub[2].sub)
        out += `set_local $${sub[0].token.value}\n`

        return out
    },
    "<exp>": (sub: Array<SyntaxNode>) => {
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
    "<term>": (sub: Array<SyntaxNode>) => {
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
    "<factor>": (sub: Array<SyntaxNode>) => {
        let out: string = ""
        switch (sub.length) {
            case 1: {
                switch (sub[0].token.type) {
                    case "id": {
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
                switch (sub[1].token.type) {
                    case "id": {
                        out += `get_local $${sub[1].token.value}\n`
                        out += `f32.neg\n`
                        break
                    }
                    case "float": {
                        out += `f32.const -${sub[1].token.value}\n`
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