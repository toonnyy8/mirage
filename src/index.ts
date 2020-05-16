import { scanner } from "./scanner"
import { pipe } from "./tool"


let dfa = scanner(/as(b*|f)g/)
// let dfa = scanner(/b*(bc)/)
console.log(dfa)
