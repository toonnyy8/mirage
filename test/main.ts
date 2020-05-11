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
    return <NFAElement>{
        state: Symbol(u++),
        action: null,
        next: []
    }
}

let vocabulary = (action: string) => {
    let start = createNFAElement()
    let next = createNFAElement()
    start.action = action
    start.next.push(next.state)
    return [start, next]
}

let catenation = (nfa1: NFA, nfa2: NFA) => {
    let terminalElement = nfa1[nfa1.length - 1]
    let startElement = nfa2[0]

    terminalElement.action = ""
    terminalElement.next.push(startElement.state)

    return [...nfa1, ...nfa2]
}

let alternation = (nfa1: NFA, nfa2: NFA) => {
    let startElement = createNFAElement()
    startElement.action = ""
    startElement.next.push(nfa1[0].state)
    startElement.next.push(nfa2[0].state)

    let endElement = createNFAElement()

    nfa1[nfa1.length - 1].action = ""
    nfa1[nfa1.length - 1].next.push(endElement.state)

    nfa2[nfa2.length - 1].action = ""
    nfa2[nfa2.length - 1].next.push(endElement.state)

    return [startElement, ...nfa1, ...nfa2, endElement]
}

let kleene = (nfa: NFA) => {
    let startElement = createNFAElement()
    let endElement = createNFAElement()

    startElement.action = ""
    startElement.next.push(nfa[0].state)
    startElement.next.push(endElement.state)

    nfa[nfa.length - 1].action = ""
    nfa[nfa.length - 1].next.push(nfa[0].state)
    nfa[nfa.length - 1].next.push(endElement.state)

    return [startElement, ...nfa, endElement]
}

let regParser = (reg: string[]) => {
    let subnfas: Array<NFA> = []
    let subreg: Array<string> = []
    let left = 0
    for (let n = 0; n < reg.length; n++) {
        switch (reg[n]) {
            case "*": {
                if (left == 0) {
                    subnfas.push(kleene(subnfas.pop()))
                } else {
                    subreg.push("*")
                }
                break
            }
            case "(": {
                left += 1
                break
            }
            case ")": {
                left -= 1
                if (left == 0) {
                    subnfas.push(regParser(subreg))
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
                    subreg.push("|")
                }

                break
            }
            default: {
                if (left == 0) {
                    subnfas.push(vocabulary(reg[n]))
                } else {
                    subreg.push(reg[n])
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