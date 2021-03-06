export interface NFAElement {
    state: Symbol,
    action: string,
    next: Array<Symbol>
}

export type NFA = Array<NFAElement>

let u = 0

function* uuid(u) {
    while (true) {
        yield Symbol(u)
        u += 1
    }
}

let u_ = uuid(0)

let genState = () => {
    return <Symbol>u_.next().value
}

let createNFAElement = (state: Symbol, action: string, next: Array<Symbol>) => {
    return Object.freeze({
        state: state,
        action: action,
        next: next,
    })
}

let vocabulary = (action: string) => {
    let start = genState()
    let next = genState()

    return <NFA>[
        createNFAElement(
            start,
            action,
            [next],
        ),
        createNFAElement(
            next,
            null,
            [],
        ),
    ]
}

let catenation = (nfa1: NFA, nfa2: NFA) => {
    return <NFA>[
        ...nfa1.slice(0, -1),
        createNFAElement(
            nfa1.slice(-1)[0].state,
            "",
            [
                ...nfa1.slice(-1)[0].next,
                nfa2[0].state
            ],
        ),
        ...nfa2,
    ]
}

let alternation = (nfa1: NFA, nfa2: NFA) => {
    let start = genState()
    let end = genState()

    return <NFA>[
        createNFAElement(
            start,
            "",
            [nfa1[0].state, nfa2[0].state],
        ),
        ...nfa1.slice(0, -1),
        createNFAElement(
            nfa1.slice(-1)[0].state,
            "",
            [...nfa1.slice(-1)[0].next, end],
        ),
        ...nfa2.slice(0, -1),
        createNFAElement(
            nfa2.slice(-1)[0].state,
            "",
            [...nfa2.slice(-1)[0].next, end],
        ),
        createNFAElement(
            end,
            null,
            [],
        ),
    ]
}

let kleene = (nfa: NFA) => {
    let start = genState()
    let end = genState()

    return <NFA>[
        createNFAElement(
            start,
            "",
            [nfa[0].state, end],
        ),
        ...nfa.slice(0, -1),
        createNFAElement(
            nfa.slice(-1)[0].state,
            "",
            [...nfa.slice(-1)[0].next, nfa[0].state, end],
        ),
        createNFAElement(
            end,
            null,
            [],
        ),
    ]
}

let rp = (reg: string[]) => {
    let subnfas: Array<NFA> = []
    let subreg: Array<string> = []
    let left = 0
    let escapeMode: boolean = false

    for (let n = 0; n < reg.length; n++) {
        if (!escapeMode) {
            switch (reg[n]) {
                case "\\": {
                    if (left == 0) {
                        escapeMode = true
                    } else {
                        subreg = [...subreg, "\\"]
                        n += 1
                        subreg = [...subreg, reg[n]]
                    }
                    break
                }
                case "(": {
                    left += 1
                    if (left > 1) {
                        subreg = [...subreg, "("]
                    }
                    break
                }
                case ")": {
                    left -= 1
                    if (left == 0) {
                        subnfas = [...subnfas, rp(subreg)]
                        subreg = []
                    } else {
                        subreg = [...subreg, ")"]
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
                                rp(subreg)
                            )
                        ]
                        subreg = []
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
        } else {
            if (left == 0) {
                subnfas = [...subnfas, vocabulary(reg[n])]
            } else {
                subreg = [...subreg, reg[n]]
            }
            escapeMode = false
        }
    }

    return subnfas.slice(1).reduce((prev, curr) => {
        return catenation(prev, curr)
    }, subnfas[0])
}

export let regParser = (reg: string) => {
    return rp(reg.split(""))
}

// console.log(regParser(/as(b*|f)g/))