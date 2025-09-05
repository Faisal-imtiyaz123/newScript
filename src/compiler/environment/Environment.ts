import { keywords } from "../lexer/tokens";
import type { Binding } from "./env.types";

export class Environment{
    private values = new Map<string,Binding>();
    private exports: Record<string, any> = {}; 
    constructor(public readonly parent?:Environment){}
    private checkType(value:any,type:string){
        switch(type){
            case "number": return typeof value==="number";
            case "string": return typeof value==="string";
            case "boolean": return typeof value==="boolean";
            case "any":return true;
            default : return true;
        }
    }
    declare(name:string,value:any,isConstant:boolean,type?:string){
        if(this.values.has(name)){
            throw new Error(`Variable ${name} already declared in this scope`)
        }
        if(keywords[name]){
            throw new Error(`Varaiable ${name} cannot be a keyword`)
        }
        this.values.set(name,{value,isConstant,type})
    }
    assign(name:string,value:any):void{
        if(!this.getSlot(name))throw new Error(`Variable ${name} is not declared in this scope`)
        const slot = this.getSlot(name)
        if(slot?.isConstant)throw new Error(`Cannot assign to ${name} because it is a constant`)
        if(slot?.type && slot?.type!=="any"){
            if(!this.checkType(value,slot.type))throw new Error(`Type mismatch:expected ${slot.type} but got ${typeof value}`)
        }
        slot!.value = value
    }
    getValue(name:string):any{
        // from current scope
        if(this.values.has(name))return this.values.get(name)!.value
        // from parent scope
        if(this.parent)return this.parent.getValue(name)
        // not found
        throw new Error(`Undefined variable '${name}'`)
    }
    getSlot(name:string):any{
        if(this.values.has(name))return this.values.get(name)
        if(this.parent)return this.parent.getSlot(name)
        throw new Error(`Undefined variable ${name}`)
    }
    // Check variable in the current scope
    checkInCurrentScope(name:string){
        return this.values.get(name)
    }
    setExport(name: string, value: any) {
        this.exports[name] = value;
    }
    getExports() {
      return this.exports 
    }

}