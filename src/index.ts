import { regParser } from "./scanner/reg2nfa"
import { f3 } from "./scanner/nfa2dfa"


let dfa = f3(regParser(/as(b*|f)g/))
// let dfa = f3(regParser(/b*(bc)/))
console.log(dfa)
