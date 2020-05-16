import { NFA } from "./reg2nfa"

export interface DFAElement {
    state: number,
    type: string
    links: { [action: string]: number }
}

export type DFA = Array<DFAElement>

let f = (nfa: NFA, mapTable: {}, startSet: Array<Symbol>): [Array<number>, { [action: string]: Array<Symbol> }] => {

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

let f3 = (nfa: NFA) => {

    let mapTable = nfa.reduce((prev, curr, idx) => {
        return { ...prev, [<symbol>curr.state]: idx }
    }, {})

    let sets = []
    let dfa: DFA = []

    let f2 = (startSet: Array<Symbol>) => {
        let [s, links] = f(nfa, mapTable, startSet)
        let state = sets.findIndex((v) => {
            return setEq(s, v)
        })
        let _links: { [action: string]: number } = {}
        if (state == -1) {
            state = sets.push(s) - 1
            Object.keys(links).forEach(key => {
                _links[key] = f2(links[key])
                f2(links[key])
            })

            dfa[state] = (Object.freeze({
                state: state,
                type: s[0] == 0 ? "entrance" : s[s.length - 1] == nfa.length - 1 ? "exit" : "",
                links: _links
            }))
        }

        return state
    }

    f2([nfa[0].state])

    return dfa
}

export { f3 }