import { genBNF, Grammar, genGrammar, genCFSM } from "./bnf2cfsm"

interface Token { type: string, value: string }

export interface SyntaxNode {
    token: Token,
    sub: Array<SyntaxNode>
}

export const Yacc = (grammar: Grammar, startRule = 0) => {
    let cfsm = genCFSM(grammar, startRule)
    console.log(cfsm)
    let step = [0]

    let syntaxNodeBuffer: Array<SyntaxNode> = []
    return (token?: { type: string, value: string }) => {
        if (step.length == 0) {
            return syntaxNodeBuffer[0]
        }
        while (1) {
            let state = step.slice(-1)[0]
            if (cfsm[state].accept) {
                let syntaxNode: SyntaxNode = {
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
                let syntaxNode: SyntaxNode = {
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
                let syntaxNode: SyntaxNode = {
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
                return
            }
        }
    }
}


// let g = genGrammar(
//     genBNF("S", ["E", "$"]),
//     genBNF("E", ["E", "+", "T"]),
//     genBNF("E", ["T"]),
//     genBNF("T", ["T", "*", "P"]),
//     genBNF("T", ["P"]),
//     genBNF("P", ["id"]),
//     genBNF("P", ["(", "E", ")"]),
// )

// let yacc = Yacc(g)
// "(id+id)$"
// let tokens: Array<Token> = [
//     { type: "(", value: "(" },
//     { type: "id", value: "id" },
//     { type: "+", value: "+" },
//     { type: "id", value: "id" },
//     { type: ")", value: ")" },
//     { type: "$", value: "$" },
// ]
// tokens.reduce((last, token) => yacc(token), {})
// console.log(
//     yacc()
// )
