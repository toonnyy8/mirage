import R = require('ramda')

const inputA = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }]

const f = (a: number) => R.propEq('x')(a)

const g1 = R.filter(f(5))

const g2 = R.pipe(f,
    <(
        fn: (obj: Record<"x", number>) => boolean
    ) =>
        (a: Array<Record<"x", number>>) => { x: number }[]
    >R.filter
)(5)(inputA)