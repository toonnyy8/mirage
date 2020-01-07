import "core-js/stable";
import "regenerator-runtime/runtime";

import { memory, _, assign, load } from "../src/"

let x = memory()
let y = memory()
let z = memory()

_(assign, x, " [10]")

_(assign, y, x)

_(assign, z, _(load, x))

// _(assign, y, 100)


_(console.log, y)

_(console.log, z)

