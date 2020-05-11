import "core-js/stable";
import "regenerator-runtime/runtime";

interface NFAElement {
    state: Symbol,
    action: string,
    next: Array<Symbol>
}

type NFA = Array<NFAElement>

let u = 0

let createNFAElement = () => {
    return Object.freeze({
        state: Symbol(u++),
        action: null,
        next: []
    })
}

let vocabulary = (action: string) => {
    let start = createNFAElement()
    let next = createNFAElement()
    console.log(action)
    return <NFA>[
        {
            state: start.state,
            action: action,
            next: [next.state]
        },
        next
    ]
}

let catenation = (nfa1: NFA, nfa2: NFA) => {
    return [
        ...nfa1.slice(0, -1),
        {
            state: nfa1.slice(-1)[0].state,
            action: "",
            next: [
                ...nfa1.slice(-1)[0].next,
                nfa2[0].state
            ]
        },
        ...nfa2
    ]
}

let alternation = (nfa1: NFA, nfa2: NFA) => {
    let startElement = createNFAElement()
    let endElement = createNFAElement()

    return [
        {
            state: startElement.state,
            action: "",
            next: [nfa1[0].state, nfa2[0].state]
        },
        ...nfa1.slice(0, -1),
        {
            state: nfa1.slice(-1)[0].state,
            action: "",
            next: [...nfa1.slice(-1)[0].next, endElement.state]
        },
        ...nfa2.slice(0, -1),
        {
            state: nfa2.slice(-1)[0].state,
            action: "",
            next: [...nfa2.slice(-1)[0].next, endElement.state]
        },
        endElement
    ]
}

let kleene = (nfa: NFA) => {
    let startElement = createNFAElement()
    let endElement = createNFAElement()

    return [
        {
            state: startElement.state,
            action: "",
            next: [nfa[0].state, endElement.state]
        },
        ...nfa.slice(0, -1),
        {
            state: nfa.slice(-1)[0].state,
            action: "",
            next: [...nfa.slice(-1)[0].next, nfa[0].state, endElement.state]
        },
        endElement
    ]
}

let regParser = (reg: string[]) => {
    let subnfas: Array<NFA> = []
    let subreg: Array<string> = []
    let left = 0
    for (let n = 0; n < reg.length; n++) {
        switch (reg[n]) {
            case "(": {
                left += 1
                break
            }
            case ")": {
                left -= 1
                if (left == 0) {
                    subnfas = [...subnfas, regParser(subreg)]
                }
                break
            }
            case "*": {
                if (left == 0) {
                    subnfas = [...subnfas.slice(0, -1), kleene(subnfas.slice(-1)[0])]
                } else {
                    subreg = [...subreg, "*"]
                }
                break
            }
            case "|": {
                if (left == 0) {
                    subreg = reg.slice(n + 1)
                    n += subreg.length

                    subnfas = [
                        alternation(
                            subnfas.slice(1).reduce((prev, curr) => {
                                return catenation(prev, curr)
                            }, subnfas[0]),
                            regParser(subreg)
                        )
                    ]
                } else {
                    subreg = [...subreg, "|"]
                }

                break
            }
            default: {
                if (left == 0) {
                    subnfas = [...subnfas, vocabulary(reg[n])]
                } else {
                    subreg = [...subreg, reg[n]]
                }
                break
            }
        }
    }

    return subnfas.slice(1).reduce((prev, curr) => {
        return catenation(prev, curr)
    }, subnfas[0])
}


console.log(regParser("as(b*|f)g".split("")))