import { scanner, driver, genDFA, Lex } from "./scanner"
// import "./scanner/test"
import { genBNF, genGrammar, SyntaxNode, Yacc } from "./parser"
// import "./parser/test"

let a2z = "(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)"
let A2Z = "(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z)"
let digit = "(0|1|2|3|4|5|6|7|8|9)"
let num = `(${digit}${digit}*)`
let r = `(\\()`
let l = `(\\))`
let id = new RegExp(`(_|${a2z}|${A2Z})(_|${a2z}|${A2Z}|${digit})*`)
let int = new RegExp(`${num}`)
let float = new RegExp(`${num}.${num}`)
let assign = new RegExp(`:=`)
let op1 = /\+|-/
let op2 = /\*|\//
let end = /;/

// console.log(genDFA(variableName))
// let source = "a:=b+c*d-16.23;"
// let lex = Lex(
//     source,
//     [
//         { type: "int", reg: int },
//         { type: "float", reg: float },
//         { type: "id", reg: id },
//         { type: "assign", reg: assign },
//         { type: "op1", reg: op1 },
//         { type: "op2", reg: op2 },
//         { type: "end", reg: end },
//     ],
// )
let source = "(()"
let lex = Lex(
    source,
    [
        { type: "r", reg: new RegExp(r) },
        { type: "l", reg: new RegExp(l) },
    ],
)
let token
do {
    token = lex.next().value
    console.log(token)
} while (token != null)

// let g = [
//     genBNF("<section>", ["<assign>", "end"]),
//     genBNF("<assign>", ["id", "assign", "<exp>"]),
//     genBNF("<exp>", ["<term>"]),
//     genBNF("<exp>", ["<exp>", "op1", "<term>"]),
//     genBNF("<term>", ["<factor>"]),
//     genBNF("<term>", ["<term>", "op2", "<factor>"]),
//     genBNF("<factor>", ["id"]),
//     genBNF("<factor>", ["(", "<exp>", ")"]),
// ]

// let yacc = Yacc(g)

// let token
// do {
//     token = lex.next().value
//     yacc(token)
// } while (token != null)

// let syntaxTree = yacc()
// console.log(syntaxTree)

// let grammarFunc = {
//     "<section>": (sub: Array<SyntaxNode>) => {
//         let re = sub.map((node) => {
//             if (grammarFunc[node.token.type] != undefined) {
//                 return grammarFunc[node.token.type](node.sub)
//             } else {
//                 return node.token
//             }
//         })
//         return re
//     },
//     "<assign>": (sub: Array<SyntaxNode>) => {
//         let re = sub.map((node) => {
//             if (grammarFunc[node.token.type] != undefined) {
//                 return grammarFunc[node.token.type](node.sub)
//             } else {
//                 return node.token
//             }
//         })
//         return re
//     },
//     "<exp>": (sub: Array<SyntaxNode>) => {
//         let re = sub.map((node) => {
//             if (grammarFunc[node.token.type] != undefined) {
//                 return grammarFunc[node.token.type](node.sub)
//             } else {
//                 return node.token
//             }
//         })
//         return re
//     },
//     "<term>": (sub: Array<SyntaxNode>) => {
//         let re = sub.map((node) => {
//             if (grammarFunc[node.token.type] != undefined) {
//                 return grammarFunc[node.token.type](node.sub)
//             } else {
//                 return node.token
//             }
//         })
//         return re
//     },
//     "<factor>": (sub: Array<SyntaxNode>) => {
//         let re = sub.map((node) => {
//             if (grammarFunc[node.token.type] != undefined) {
//                 return grammarFunc[node.token.type](node.sub)
//             } else {
//                 return node.token
//             }
//         })
//         return re
//     },
// }
// console.log(
//     grammarFunc[syntaxTree.token.type](syntaxTree.sub)
// )