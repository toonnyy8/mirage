import { scanner } from "./scanner"


let dfa = scanner(/as(b*|f)g/)
// let dfa = scanner(/b*(bc)/)
console.log(dfa)
