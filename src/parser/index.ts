import { pipe } from "../tool"
interface BNFelement {
    symbol: string
    expression: Array<string>
}
interface BNFstate {
    bnfrule: number,
    at: number
}
interface SymbolTable {
    [symbol: string]: "terminal" | "nonterminal"
}

let genBNF = (symbol: string, expression: Array<string>) => {
    return <BNFelement>{
        symbol: symbol,
        expression: [...expression]
    }
}

let genBNFstate = (bnfrule: number, at: number) => {
    return <BNFstate>{
        bnfrule: bnfrule,
        at: at
    }
}


let unfold = (bnfState: BNFstate, bnfs: Array<BNFelement>) => {
    let has = (bnfState: BNFstate, bnfStates: Array<BNFstate>) => {
        return bnfStates.find(state => state.at == bnfState.at && state.bnfrule == bnfState.bnfrule) !== undefined
    }

    let unfold_ = (bnfState: BNFstate, bnfs: Array<BNFelement>, stack: Array<BNFstate>) => {
        if (bnfs[bnfState.bnfrule].expression[bnfState.at] !== undefined)
            return [
                ...stack,
                ...bnfs.reduce((last, bnf, bnfrule) => {
                    let _bnfState = genBNFstate(bnfrule, 0)
                    if (bnf.symbol == bnfs[bnfState.bnfrule].expression[bnfState.at] && !has(_bnfState, stack)) {
                        return [...last, _bnfState]
                    } else {
                        return last
                    }
                }, <Array<BNFstate>>[])
            ]

        return stack
    }

    let temp: Array<BNFstate>, stack: Array<BNFstate> = [], _stack: Array<BNFstate> = [bnfState]
    do {
        temp = _stack
            .slice(stack.length)
        stack = _stack
        _stack = temp
            .reduce((last, bst) => unfold_(bst, bnfs, last), _stack)
    } while (_stack.length != stack.length)

    return stack
}

console.log(
    unfold(genBNFstate(4, 0), [
        genBNF("S", ["E", "$"]),
        genBNF("E", ["E", "+", "T"]),
        genBNF("E", ["T"]),
        genBNF("T", ["id"]),
        genBNF("T", ["(", "E", ")"]),
    ])
)

let p = (symbolTable: SymbolTable, bnfState: BNFstate) => {
    // genBNFstate(bnfState.bnf, bnfState.at + 1)
    // if (bnfState.bnf.expression.length == bnfState.at)
    //     return
    // else {
    //     symbolTable[bnfState.bnf.expression[bnfState.at]] == "nonterminal"
    //     return genBNFstate(bnfState.bnf, bnfState.at + 1)
    // }

}

let parser = (symbolTable: SymbolTable, bnfs: Array<BNFelement>) => {

}