// Thanks to jcalz's answer on stackoverflow 
// https://stackoverflow.com/questions/53173203/typescript-recursive-function-composition?answertab=votes#tab-top

type Lookup<T, K extends keyof any, Else = never> = K extends keyof T ? T[K] : Else

type Tail<T extends any[]> =
    ((...t: T) => void) extends ((x: any, ...u: infer U) => void) ? U : never

type Func = (arg: any) => any;

type ArgType<F, Else = never> = F extends (arg: infer A) => any ? A : Else

type AsChain<F extends [Func, ...Func[]], G extends Func[] = Tail<F>> =
    { [K in keyof F]: (arg: ArgType<F[K]>) => ArgType<Lookup<G, K, any>, any> }

type LastIndexOf<T extends any[]> =
    ((...x: T) => void) extends ((y: any, ...z: infer U) => void)
    ? U['length'] : never

export function pipe<F extends [(arg: any) => any, ...Array<(arg: any) => any>]>(
    ...funcs: F & AsChain<F>
): (arg: ArgType<F[0]>) => ReturnType<F[LastIndexOf<F>]> {
    return (arg) => {
        return funcs.reduce<any>((prev, curr) => {
            return curr(prev)
        }, arg)
    }
}
