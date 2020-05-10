import "core-js/stable";
import "regenerator-runtime/runtime";

interface NFAElement {
    state: Symbol,
    action: string,
    next: Array<Symbol>
}

type NFA = Array<NFAElement>

let createNFAElement = () => {
    return <NFAElement>{
        state: Symbol(),
        action: null,
        next: []
    }
}

let vocabulary = (nfa: NFA, action: string) => {
    let terminalElement = nfa[nfa.length - 1]
    let next = createNFAElement()
    terminalElement.action = action
    terminalElement.next.push(next.state)
    return nfa
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