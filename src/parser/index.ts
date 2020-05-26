import { pipe } from "../tool"
interface BNFelem {
    symbol: string
    expression: Array<string>
}
interface BNFAunit {
    bnfrule: number,
    at: number,
    LA: string,
}
interface SymbolTable {
    [symbol: string]: "terminal" | "nonterminal"
}

interface BNFAelem {
    state: number,
    actions: { [action: string]: number }
}

type BNFA = Array<BNFAelem>
type BNFAstate = Array<BNFAunit>
type BNFAstateStack = Array<BNFAstate>

let genBNF = (symbol: string, expression: Array<string>) => {
    return <BNFelem>{
        symbol: symbol,
        expression: [...expression]
    }
}

let genBNFAunit = (bnfrule: number, at: number, lookahead: string = undefined) => {
    return <BNFAunit>{
        bnfrule: bnfrule,
        at: at,
        LA: lookahead
    }
}


let unfold = (bnfaUnit: Array<BNFAunit>, bnfs: Array<BNFelem>) => {
    let has = (bnfaUnit: BNFAunit, bnfaState: BNFAstate) => {
        return bnfaState.find(
            state => state.at == bnfaUnit.at &&
                state.bnfrule == bnfaUnit.bnfrule &&
                state.LA == bnfaUnit.LA
        ) !== undefined
    }

    let unfold_ = (bnfaUnit: BNFAunit, bnfs: Array<BNFelem>, stack: BNFAstate) => {
        if (bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at] !== undefined)
            return [
                ...stack,
                ...bnfs.reduce((last, bnf, bnfrule) => {
                    let _bnfaUnit = genBNFAunit(
                        bnfrule,
                        0,
                        bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at + 1] ?
                            bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at + 1] : bnfaUnit.LA
                    )
                    if (bnf.symbol == bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at] && !has(_bnfaUnit, stack)) {
                        return [...last, _bnfaUnit]
                    } else {
                        return last
                    }
                }, <BNFAstate>[])
            ]

        return stack
    }

    let temp: BNFAstate, stack: BNFAstate = [], _stack: BNFAstate = [...bnfaUnit]
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
    unfold([genBNFAunit(1, 2, "$"), genBNFAunit(1, 2, "+")], [
        genBNF("S", ["E", "$"]),
        genBNF("E", ["E", "+", "T"]),
        genBNF("E", ["T"]),
        genBNF("T", ["T", "*", "P"]),
        genBNF("T", ["P"]),
        genBNF("P", ["id"]),
        genBNF("P", ["(", "E", ")"]),
    ])
)


let p = (bnfs: Array<BNFelem>, enter: number = 0) => {
    let eq = (A: BNFAstate, B: BNFAstate) => {
        if (A.length == B.length) {
            return A.find((bnfaUnit, idx) =>
                bnfaUnit.bnfrule != B[idx].bnfrule ||
                bnfaUnit.at != B[idx].at ||
                bnfaUnit.LA != B[idx].LA) == undefined
        }
        return false
    }
    let bnfaSS: BNFAstateStack = [unfold([genBNFAunit(enter, 0)], bnfs)]
    let bnfaElem: BNFAelem = {
        state: bnfaSS.length - 1,
        actions: {}
    }

    let a = bnfaSS[bnfaElem.state].reduce((last, bnfaUnit) => {
        last[bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at]] = last[bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at]] || []
        last[bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at]] = [...last[bnfs[bnfaUnit.bnfrule].expression[bnfaUnit.at]], genBNFAunit(bnfaUnit.bnfrule, bnfaUnit.at + 1, bnfaUnit.LA)]
        return last
    }, <{ [action: string]: BNFAstate }>{})

    console.log(
        Object.keys(a)
            .map((key) => unfold(a[key], bnfs))
            .reduce((last, bnfaS) => {
                if (last.find((bnfaS_) => eq(bnfaS_, bnfaS)) == undefined)
                    return [...last, bnfaS]
                return last
            }, bnfaSS)
    )
}
p([
    genBNF("S", ["E", "$"]),
    genBNF("E", ["E", "+", "T"]),
    genBNF("E", ["T"]),
    genBNF("T", ["T", "*", "P"]),
    genBNF("T", ["P"]),
    genBNF("P", ["id"]),
    genBNF("P", ["(", "E", ")"]),
])

let parser = (symbolTable: SymbolTable, bnfs: Array<BNFelem>) => {

}