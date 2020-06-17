import { parser, genBNF } from "./index"
console.log(
    parser([
        genBNF("S", ["E", "$"]),
        genBNF("E", ["E", "+", "T"]),
        genBNF("E", ["T"]),
        genBNF("T", ["T", "*", "P"]),
        genBNF("T", ["P"]),
        genBNF("P", ["id"]),
        genBNF("P", ["(", "E", ")"]),
    ])
)

let g = [
    genBNF("<assign>", ["id", "assign", "<exp>"]),
    genBNF("<exp>", ["<term>"]),
    genBNF("<exp>", ["<exp>", "op1", "<term>"]),
    genBNF("<term>", ["<factor>"]),
    genBNF("<term>", ["<term>", "op2", "<factor>"]),
    genBNF("<factor>", ["id"]),
    genBNF("<factor>", ["(", "<exp>", ")"]),
]
// let yacc = parser(g)
// console.log(yacc)
