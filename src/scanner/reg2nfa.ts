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

let _createNFAElement = (state: Symbol, action: string, next: Array<Symbol>) => {
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
        _createNFAElement(
            start,
            action,
            [next],
        ),
        _createNFAElement(
            next,
            null,
            [],
        ),
    ]
}

let catenation = (nfa1: NFA, nfa2: NFA) => {
    return [
        ...nfa1.slice(0, -1),
        _createNFAElement(
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

    return [
        _createNFAElement(
            start,
            "",
            [nfa1[0].state, nfa2[0].state],
        ),
        ...nfa1.slice(0, -1),
        _createNFAElement(
            nfa1.slice(-1)[0].state,
            "",
            [...nfa1.slice(-1)[0].next, end],
        ),
        ...nfa2.slice(0, -1),
        _createNFAElement(
            nfa2.slice(-1)[0].state,
            "",
            [...nfa2.slice(-1)[0].next, end],
        ),
        _createNFAElement(
            end,
            null,
            [],
        ),
    ]
}

let kleene = (nfa: NFA) => {
    let start = genState()
    let end = genState()

    return [
        _createNFAElement(
            start,
            "",
            [nfa[0].state, end],
        ),
        ...nfa.slice(0, -1),
        _createNFAElement(
            nfa.slice(-1)[0].state,
            "",
            [...nfa.slice(-1)[0].next, nfa[0].state, end],
        ),
        _createNFAElement(
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
                    escapeMode = true
                    break
                }
                case "(": {
                    left += 1
                    break
                }
                case ")": {
                    left -= 1
                    if (left == 0) {
                        subnfas = [...subnfas, rp(subreg)]
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

export let regParser = (reg: RegExp) => {
    return rp(reg.toString().split("").slice(1, -1))
}

// console.log(regParser(/as(b*|f)g/))