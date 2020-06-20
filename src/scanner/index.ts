import { regParser } from "./reg2nfa"
import { f3, DFA } from "./nfa2dfa"
import { pipe } from "../tool"


// export const scanner = pipe(
//     regParser,
//     f3
// ) 

export const genDFA = pipe(
    regParser,
    f3
)

export const driver = (dfa: DFA) => {
    return (source: string) => {
        let i = 0
        let s = 0
        let lastExit = null
        while (true) {
            s = dfa[s].actions[source[i]]
            if (s == undefined) {
                if (lastExit == null) {
                    // console.log("ERROR")
                    return -1
                }
                return lastExit + 1
            } else if (dfa[s].type == "exit") {
                lastExit = i
            }
            i++
        }
    }

}
export const scanner = (rules: Array<{ type: string, reg: string }>) => {
    let ruleDrivers = rules.map(rule => {
        return pipe(
            genDFA,
            driver
        )(rule.reg)
    })
    return (source: string) => {
        return pipe(
            () => ruleDrivers.map((ruleDriver, idx) => {
                return { rulePriority: idx, tokenEnd: ruleDriver(source) }
            }).sort((a, b) => {
                if (a.tokenEnd > b.tokenEnd) {
                    return -1;
                } else if (a.tokenEnd < b.tokenEnd) {
                    return 1;
                } else if (a.rulePriority < b.rulePriority) {
                    return -1;
                } else if (a.rulePriority > b.rulePriority) {
                    return 1;
                } else {
                    return 0;
                }
            }),
            (sandidateTokens) => {
                // if (sandidateTokens[0].tokenEnd == -1) {
                //     console.error("ERROR")
                // }
                return {
                    type: rules[sandidateTokens[0].rulePriority].type,
                    tokenEnd: sandidateTokens[0].tokenEnd
                }
            })(null)
    }
}

export function* Lex(source: string, rules: Array<{ type: string, reg: string }>) {
    let scannerFn = scanner(rules)
    while (true) {
        let token = scannerFn(source)
        if (token.tokenEnd == -1) {
            return
        }
        yield ({ type: token.type, value: source.slice(0, token.tokenEnd) })
        source = source.slice(token.tokenEnd)
    }
}