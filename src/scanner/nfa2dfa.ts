import { NFA } from "./reg2nfa"

export interface DFAElement {
    state: number,
    type: string
    actions: { [action: string]: number }
}

export type DFA = Array<DFAElement>

let resolveSubSet = (nfa: NFA, mapTable: {}, startSet: Array<Symbol>):
    [Array<number>, { [action: string]: Array<Symbol> }] => {

    let unresolvedSet: Array<Symbol> = [...startSet]
    let resolvedSet: Array<number> = []
    let links: { [action: string]: Array<Symbol> } = {}

    do {
        let state = mapTable[<symbol>unresolvedSet.pop()]
        if (nfa[state].action == "") {
            unresolvedSet.push(...nfa[state].next)
        } else if (nfa[state].action != null) {
            links[nfa[state].action] = links[nfa[state].action] || []
            links[nfa[state].action] = [...links[nfa[state].action], ...nfa[state].next]
        }
        resolvedSet.push(state)
    } while (unresolvedSet.length != 0)

    resolvedSet.sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : 0
    })
    return [resolvedSet, links]
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

    let resolvedSets = []
    let dfa: DFA = []

    let f2 = (startSet: Array<Symbol>, mapTable: {}) => {
        let [resolvedSet, links] = resolveSubSet(nfa, mapTable, startSet)
        let state = resolvedSets.findIndex((v) => {
            return setEq(resolvedSet, v)
        })
        let resolvedLinks: { [action: string]: number } = {}
        if (state == -1) {
            state = resolvedSets.push(resolvedSet) - 1
            Object.keys(links).forEach(key => {
                resolvedLinks[key] = f2(links[key], mapTable)
                f2(links[key], mapTable)
            })

            dfa[state] = (Object.freeze({
                state: state,
                type: resolvedSet[0] == 0 ? "entrance" : resolvedSet.slice(-1)[0] == nfa.length - 1 ? "exit" : "",
                actions: resolvedLinks
            }))
        }

        return state
    }

    f2([nfa[0].state], mapTable)

    return dfa
}

export { f3 }