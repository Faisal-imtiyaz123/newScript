import { Environment } from "../environment/Environment";

export class BreakSignal {}
export class ContinueSignal{}
export class ReturnSignal{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(public value:any){}
}
export function createGlobalEnv():Environment{
    const env = new Environment()
    // env.declare("print",(v:any)=>{
    //     console.log(v);
    //     return v;
    // },false)
    return env
}