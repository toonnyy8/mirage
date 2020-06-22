import { rules, grammar, codeGenerator } from "./mirgae"
// import { ruleDFAs, cfsm } from "./mirgae"
import { ruleDFAs, cfsm } from "./language"
import { Lex_ } from "./scanner"
import { Yacc } from "./parser"

export let compiler = (source: string) => {
    let lex = Lex_(source, rules, ruleDFAs)
    let yacc = Yacc(grammar, cfsm)


    let token: { type: string, value: string }
    do {
        token = <typeof token>lex.next().value
        if (token && token.type == "gap") {
            console.warn(token)
        }
        if (token && token.type != "gap") {
            console.log(token)
            console.log(yacc(token))
        }
    } while (token != null)

    let syntaxTree = yacc()
    console.log(syntaxTree)
    console.log(source)
    let code = codeGenerator(syntaxTree.sub).code
    return code
}