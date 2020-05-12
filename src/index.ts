import { NFA, NFAElement, regParser } from "./scanner/reg2nfa"

let nfa = regParser(/as(b*|f)g/)

let mapTable = nfa.reduce((prev, curr, idx) => {
    return { ...prev, [<symbol>curr.state]: idx }
}, {})

// console.log(mapTable[<symbol>nfa[3].state])
