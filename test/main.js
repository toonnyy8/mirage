import "core-js/stable";
import "regenerator-runtime/runtime";

import { ptr, _, assign } from "../src/"

let x = ptr()
let y = ptr()

_(assign, x, [10])

_(assign, y, x)

_(assign, y, 100)


_(console.log, x)

_(console.log, y)