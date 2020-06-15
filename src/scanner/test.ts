import { genDFA, driver, scanner, Lex } from "./index"

let source = "asbbbbvgga"
let rules = [
    { type: "a", reg: /a/ },
    { type: "sb", reg: /s|b*/ },
    { type: "v", reg: /(v*v)/ },
    { type: "v", reg: /(v|g*)/ }
]
let dfa = genDFA(rules[0].reg)
console.log(dfa)
console.log(driver(dfa)(source))
console.log(scanner(rules)(source))


let lex = Lex(source, rules)
let token = lex.next().value
while (token != undefined) {
    console.log(token)
    token = lex.next().value
}