import { genBNF, genGrammar, genClosureElem, closurer, genCFSM } from "./bnf2cfsm"
import { typeToken, Yacc } from "./driver"

let g = genGrammar(
    genBNF("S", ["E", "$"]),
    genBNF("E", ["E", "+", "T"]),
    genBNF("E", ["T"]),
    genBNF("T", ["T", "*", "P"]),
    genBNF("T", ["P"]),
    genBNF("P", ["id"]),
    genBNF("P", ["(", "E", ")"]),
)
let genClosure = closurer(g)

console.log(
    genClosure([genClosureElem(0, 0, "")], [])
)
console.log(
    genCFSM(g, 0)
)

let yacc = Yacc(g)
"(id+id)$"
let tokens: Array<typeToken> = [
    { type: "(", value: "(" },
    { type: "id", value: "id" },
    { type: "+", value: "+" },
    { type: "id", value: "id" },
    { type: ")", value: ")" },
    { type: "$", value: "$" },
]
tokens.reduce((last, token) => yacc(token), {})
console.log(
    yacc()
)