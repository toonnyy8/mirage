import { regParser } from "./reg2nfa"
import { f3 } from "./nfa2dfa"
import { pipe } from "../tool"

export const scanner = pipe(
    regParser,
    f3
) 