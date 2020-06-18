import { pipe, arrAddElem, arrAddArr } from "../tool"

interface BNF {
    symbol: string
    expression: Array<string>
}
export const genBNF = (symbol: string, expression: Array<string>) => {
    return {
        symbol: symbol,
        expression: expression
    }
}

export type Grammar = Array<BNF>
export const genGrammar = (...grammar: BNF[]) => {
    return grammar
}

interface ClosureElem {
    rule: number,
    at: number,
    LA: string,
}
const genClosureElem = (
    rule: number,
    at: number = 0,
    LA: string = null,
) => {
    return { rule, at, LA }
}

const eq = (closureElem1: ClosureElem, closureElem2: ClosureElem) => {
    return (
        (closureElem1.rule == closureElem2.rule) &&
        (closureElem1.at == closureElem2.at) &&
        (closureElem1.LA == closureElem2.LA)
    )
}

// 分析 grammar 中每個非終端符號，並將其展開
const analyLA = (grammar: Grammar) => {
    let nonTermLA =
        grammar
            .reduce((nonTermLA, bnf) => {
                if (bnf.symbol != bnf.expression[0]) {
                    nonTermLA[bnf.symbol] = arrAddElem(
                        nonTermLA[bnf.symbol] || [],
                        bnf.expression[0]
                    )
                }
                return nonTermLA
            }, <{ [startSymbol: string]: Array<string> }>{})

    let tag = true
    while (tag) {
        tag = false
        nonTermLA = Object.keys(nonTermLA)
            .reduce((last, key) => {
                last[key] = last[key]
                    .map(term => last[term] ? (() => { tag = true; return last[term] })() : [term])
                    .filter(term => term != undefined)
                    .reduce((prev, curr) => arrAddArr(prev, curr), [])
                return { ...last }
            }, { ...nonTermLA })
    }
    return nonTermLA
}

type Closure = Array<ClosureElem>
const Has = (closure: Closure, closureElem: ClosureElem) => {
    return closure.find((closureElem_) => eq(closureElem_, closureElem)) != undefined
}

const Eq = (closure1: Closure, closure2: Closure) => {
    if (closure1.length != closure2.length) return false
    else return closure1.find((closureElem, idx) => !eq(closureElem, closure2[idx])) == undefined
}

const Sort = (closure: Closure) => {
    return [...closure].sort((closureElem1, closureElem2) => {
        if (closureElem1.rule > closureElem2.rule) return 1
        else if (closureElem1.rule < closureElem2.rule) return -1
        else if (closureElem1.at > closureElem2.at) return 1
        else if (closureElem1.at < closureElem2.at) return -1
        else if (closureElem1.LA > closureElem2.LA) return 1
        else if (closureElem1.LA < closureElem2.LA) return -1
        else return 0
    })
}

// closurer 接收 grammar 後產生該語法的 closure 生成器
const closurer = (grammar: Grammar) => {
    // 根據 Grammar 分析出 LA 為 nonterm 時真正的 LA
    let nontermLA = analyLA(grammar)

    // closure 生成器接收 未分析的ClosureElem集合 與 已分析的ClosureElem集合 之後會生成一整個 closure
    let genClosure = (unsolved: Closure, solved: Closure): Array<ClosureElem> => {

        if (unsolved.length != 0) {
            // 若還有 未分析的ClosureElem，就進入解析步驟
            let solving = unsolved.slice(0, 1)[0]

            if (Has(solved, solving)) {
                // 若正在分析的 ClosureElem 存在於 已分析的ClosureElem集合，就直接捨棄
                return genClosure(unsolved.slice(1), solved)
            } else {
                // 若正在分析的 ClosureElem 不存在於 已分析的ClosureElem集合，就進行解析
                let symbol = grammar[solving.rule].expression[solving.at]
                let LAs = [grammar[solving.rule].expression[solving.at + 1]]
                if (LAs[0] == undefined) {
                    LAs = [solving.LA]
                } else if (nontermLA[LAs[0]] != undefined) {
                    // 如果 LA 是 nonterm，就將其替換成分析得到的 LA
                    LAs = nontermLA[LAs[0]]
                }

                // 從正在解析的 ClosureElem 獲得多個新的未解析的 ClosureElem
                let newUnsolveds =
                    LAs
                        .map(LA => {
                            return grammar
                                // 取得延伸解析的 rule
                                .reduce((prev, bnf, rule) => (bnf.symbol == symbol ? [...prev, rule] : prev), [])
                                // 建立未解析的 ClosureElem
                                .map(rule => genClosureElem(rule, 0, LA))
                        })
                        // 將多個未解析的 ClosureElem 集合攤平
                        .reduce((prev, _newUnsolveds) => [...prev, ..._newUnsolveds], [])
                return genClosure([...unsolved.slice(1), ...newUnsolveds], [...solved, solving])
            }
        } else {
            // 若已經沒有 未分析的ClosureElem，就回傳 已分析的ClosureElem集合
            return Sort(solved)
        }
    }

    return genClosure
}
let g = genGrammar(
    genBNF("S", ["E", "$"]),
    genBNF("E", ["E", "+", "T"]),
    genBNF("E", ["T"]),
    genBNF("T", ["T", "*", "P"]),
    genBNF("T", ["P"]),
    genBNF("P", ["id"]),
    genBNF("P", ["(", "E", ")"]),
)
let genClosure = closurer(g)

console.log(
    genClosure([genClosureElem(0, 0, "")], [])
)

type typeClosureStack = Array<Closure>
const ClosureStack = {
    has: (cfsm: typeClosureStack, closure: Closure) => {
        return cfsm.find(_closure => Eq(_closure, closure)) != undefined
    },
    ep: (cfsm1: typeClosureStack, cfsm2: typeClosureStack) => {
        if (cfsm1.length != cfsm2.length) return false
        else return cfsm1.find((closure, idx) => !Eq(closure, cfsm2[idx])) == undefined
    },
    at: (cfsm: typeClosureStack, closure: Closure) => {
        return cfsm.findIndex(_closure => Eq(_closure, closure))
    },
}

interface typeCFSMElem {
    shift: { [action: string]: number }
    reduce: { [action: string]: number }
    accept: boolean
}

export type typeCFSM = Array<typeCFSMElem>

// closurer 接收 grammar 後產生該語法的 closure 生成器
export const genCFSM = (grammar: Grammar, startRule: number) => {
    let genClosure = closurer(grammar)

    // closure 生成器接收 未分析的ClosureElem集合 與 已分析的ClosureElem集合 之後會生成一整個 closure
    let _genCFSM = (unsolved: typeClosureStack, solved: typeClosureStack, cfsm: typeCFSM): typeCFSM => {
        // console.log(unsolved)
        if (unsolved.length != 0) {
            // 若還有 未分析的ClosureElem，就進入解析步驟
            let solving = unsolved.slice(0, 1)[0]
            // 分類
            let cfsmElem: typeCFSMElem
            let unsolveClosures: {
                [key: string]: Closure;
            }
            ({ cfsmElem, unsolveClosures } = solving
                .reduce((prev, { rule, at, LA }) => {
                    if (grammar[rule].expression[at]) {
                        prev.unsolveClosures[grammar[rule].expression[at]] =
                            prev.unsolveClosures[grammar[rule].expression[at]] || []
                        prev.unsolveClosures[grammar[rule].expression[at]] =
                            [...prev.unsolveClosures[grammar[rule].expression[at]], { rule, at, LA }]
                    } else {
                        if (LA) {
                            prev.cfsmElem
                                .reduce[LA] = rule
                        }
                        else {
                            prev.cfsmElem.accept = true
                        }
                    }
                    return prev
                }, <{ cfsmElem: typeCFSMElem, unsolveClosures: { [key: string]: Closure } }>{
                    cfsmElem: { shift: {}, reduce: {}, accept: false },
                    unsolveClosures: {}
                })
            );

            ({ cfsmElem, unsolveClosures } =
                Object.keys(unsolveClosures)
                    // at+1
                    .reduce((prev, key) => {
                        prev.unsolveClosures[key] =
                            prev.unsolveClosures[key]
                                .map(({ rule, at, LA }: ClosureElem) => {
                                    if (grammar[rule].expression[at] == undefined) {
                                        // 先建立 reduce
                                        // if (LA == undefined) {
                                        prev.cfsmElem.accept = true
                                        // } else {
                                        prev.cfsmElem
                                            .reduce[LA] = rule
                                        // }
                                        return
                                    } else {
                                        // 若可以 shift 就將 closureElem 做 shift
                                        return genClosureElem(rule, at + 1, LA)
                                    }
                                })
                                .filter(closureElem => closureElem != undefined)
                        return prev
                    }, <{
                        cfsmElem: typeCFSMElem,
                        unsolveClosures: {
                            [key: string]: Closure,
                        },
                    }>{
                        cfsmElem: { ...cfsmElem },
                        unsolveClosures: { ...unsolveClosures },
                    })
            )


            let newUnsolved: typeClosureStack
            ({ cfsmElem, newUnsolved } = Object.keys(unsolveClosures)
                // genClosure
                .map(key => ({ key: key, value: genClosure(unsolveClosures[key], []) }))
                .reduce((prev, curr) => {
                    let state = ClosureStack.at(prev.closureStack, curr.value)

                    if (state != -1) {
                        prev.cfsmElem.shift[curr.key] = state
                        return {
                            cfsmElem: { ...prev.cfsmElem },
                            newUnsolved: prev.newUnsolved,
                            closureStack: [...prev.closureStack],
                        }
                    }
                    else {
                        prev.cfsmElem.shift[curr.key] = prev.closureStack.length
                        return {
                            cfsmElem: { ...prev.cfsmElem },
                            newUnsolved: [...prev.newUnsolved, curr.value],
                            closureStack: [...prev.closureStack, curr.value],
                        }
                    }
                },
                    {
                        cfsmElem: { ...cfsmElem },
                        newUnsolved: [],
                        closureStack: [...solved, ...unsolved]
                    }
                )
            );

            return _genCFSM([...unsolved.slice(1), ...newUnsolved], [...solved, solving], [...cfsm, cfsmElem])
        } else {
            return cfsm
        }
    }

    return _genCFSM(
        [genClosure(
            [genClosureElem(startRule, 0)],
            [],
        )],
        [],
        [],
    )
}
console.log(
    genCFSM(g, 0)
)