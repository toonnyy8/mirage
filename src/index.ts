import { NFA, NFAElement, regParser } from "./scanner/reg2nfa"

// let nfa = regParser(/as(b*|f)g/)
let nfa = regParser(/b*bc/)

let mapTable = nfa.reduce((prev, curr, idx) => {
    return { ...prev, [<symbol>curr.state]: idx }
}, {})

interface DFAElement {
    state: symbol,
    links: Array<{ action: string, next: symbol }>
}

type DFA = Array<DFAElement>

let f = (nfa: NFA, startSet: Array<Symbol>): [Array<number>, { [action: string]: Array<Symbol> }] => {

    let s1: Array<Symbol> = [...startSet]
    let s2: Array<number> = []
    let links: { [action: string]: Array<Symbol> } = {}


    do {
        let s = mapTable[<symbol>s1.pop()]
        if (nfa[s].action == "") {
            s1.push(...nfa[s].next)
        } else if (nfa[s].action != null) {
            links[nfa[s].action] = links[nfa[s].action] || []
            links[nfa[s].action] = [...links[nfa[s].action], ...nfa[s].next]
        }
        s2.push(s)
    } while (s1.length != 0)

    s2.sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : 0
    })
    return [s2, links]
}

let setEq = (setA: Array<number>, setB: Array<number>) => {
    if (setA.length === setB.length) {
        return setA.find((v, i) => {
            return v !== setB[i]
        }) == undefined ? true : false
    } else {
        return false
    }
}

let sets = []
let dfa: DFA = []

let f2 = (startSet: Array<Symbol>) => {
    let [s, links] = f(nfa, startSet)
    let state = sets.findIndex((v) => {
        return setEq(s, v)
    })
    let _links = {}
    if (state == -1) {
        state = sets.push(s) - 1
        Object.keys(links).forEach(key => {
            _links[key] = f2(links[key])
            f2(links[key])
        })
        console.log([state, _links])
    }

    return state
}
console.log(nfa)
f2([nfa[0].state])
