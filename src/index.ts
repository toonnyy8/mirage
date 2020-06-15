import { scanner, driver, genDFA, Lex } from "./scanner"
import "./scanner/test"
import "./parser"
import { pipe } from "./tool"

let a2z = "a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z"
let A2Z = "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z"
let num = "0|1|2|3|4|5|6|7|8|9"
let variableName = new RegExp(`(_|${a2z}|${A2Z})(_|${a2z}|${A2Z}|${num})*`)

console.log(genDFA(variableName))