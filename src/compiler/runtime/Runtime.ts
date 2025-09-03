import { Environment } from "../environment/Environment";

export class BreakSignal {}
export class ContinueSignal{}
export class ReturnSignal{
    constructor(public value:any){}
}
export function createGlobalEnv():Environment{
    const env = new Environment()
    env.declare("print",(v:any)=>{
        console.log(v);
        return v;
    },false)
    return env
}