import { regParser } from "./reg2nfa"
import { f3 } from "./nfa2dfa"

export const scanner = (reg: RegExp) => {
    return f3(regParser(reg))
} 