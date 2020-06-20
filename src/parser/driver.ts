import { genBNF, typeGrammar, genGrammar, genCFSM } from "./bnf2cfsm"

export interface typeToken { type: string, value: string }

export interface typeSyntaxNode {
    token: typeToken,
    sub: Array<typeSyntaxNode>
}

export const Yacc = (grammar: typeGrammar, startRule = 0) => {
    let cfsm = genCFSM(grammar, startRule)
    console.log(cfsm)
    let step = [0]

    let syntaxNodeBuffer: Array<typeSyntaxNode> = []
    return (token?: { type: string, value: string }) => {
        if (step.length == 0) {
            return syntaxNodeBuffer[0]
        }
        while (1) {
            let state = step.slice(-1)[0]
            if (cfsm[state].accept) {
                let syntaxNode: typeSyntaxNode = {
                    token: { type: grammar[startRule].symbol, value: null },
                    sub: syntaxNodeBuffer.slice(-grammar[startRule].expression.length),
                }
                syntaxNodeBuffer = [
                    ...syntaxNodeBuffer.slice(0, -grammar[startRule].expression.length),
                    syntaxNode,
                ]
                step = []

                return syntaxNodeBuffer[0]
            }
            else if (cfsm[state].reduce[token.type] != undefined) {
                let rule = cfsm[state].reduce[token.type]
                step = step.slice(0, -grammar[rule].expression.length)
                let syntaxNode: typeSyntaxNode = {
                    token: { type: grammar[rule].symbol, value: null },
                    sub: syntaxNodeBuffer.slice(-grammar[rule].expression.length),
                }
                syntaxNodeBuffer = [
                    ...syntaxNodeBuffer.slice(0, -grammar[rule].expression.length),
                    syntaxNode,
                ]
                state = step.slice(-1)[0]
                step = [...step, cfsm[state].shift[syntaxNode.token.type]]
            }
            else if (cfsm[state].shift[token.type] != undefined) {
                let syntaxNode: typeSyntaxNode = {
                    token: token,
                    sub: null,
                }
                syntaxNodeBuffer = [
                    ...syntaxNodeBuffer,
                    syntaxNode,
                ]
                step = [...step, cfsm[state].shift[token.type]]
                return
            }
            else {
                console.error("ERROR")
                console.error(state)
                console.error(token)
                return
            }
        }
    }
}


