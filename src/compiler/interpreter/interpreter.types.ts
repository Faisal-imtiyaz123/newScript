import type { BlockNode } from "../ast/ast"
import type { Environment } from "../environment/Environment"

export type FnValue={
    params:{name:string,type:string}[]
    body:BlockNode
    closure:Environment
    name?:string
    returnType?:string
}