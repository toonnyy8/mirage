import { scanner, driver, genDFA, Lex } from "./scanner"
// import "./scanner/test"
import { genBNF, genGrammar, Yacc } from "./parser"
import "./parser/test"

let a2z = "a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z"
let A2Z = "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z"
let num = "0|1|2|3|4|5|6|7|8|9"
let id = new RegExp(`(_|${a2z}|${A2Z})(_|${a2z}|${A2Z}|${num})*`)
let assign = new RegExp(`:=`)
let op1 = /\+|-/
let op2 = /\*|\//
let end = /;/

// console.log(genDFA(variableName))
let source = "a:=b+c*d;"
let lex = Lex(
    source,
    [
        { type: "id", reg: id },
        { type: "assign", reg: assign },
        { type: "op1", reg: op1 },
        { type: "op2", reg: op2 },
        { type: "end", reg: end },
    ],
)


let g = [
    genBNF("<assign>", ["id", "assign", "<exp>", "end"]),
    genBNF("<exp>", ["<term>"]),
    genBNF("<exp>", ["<exp>", "op1", "<term>"]),
    genBNF("<term>", ["<factor>"]),
    genBNF("<term>", ["<term>", "op2", "<factor>"]),
    genBNF("<factor>", ["id"]),
    genBNF("<factor>", ["(", "<exp>", ")"]),
]

let yacc = Yacc(g)

let token
do {
    token = lex.next().value
    // console.log(token)
    console.log(yacc(token))
} while (token != null)

console.log(yacc())