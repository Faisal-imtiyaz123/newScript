import { NodeType, type ArrayNode, type AssignmentNode, type ASTNode, type BinaryOpNode, type BlockNode, type BooleanNode, type CallNode, type ConstDeclNode, type ExprStmtNode, type ForNode, type FunctionDeclNode, type GroupingNode, type IdentifierNode, type IfNode, type IndexNode, type MemberNode, type NumberNode, type ObjectNode, type PostfixNode, type PrintNode, type ProgramNode, type ReturnNode, type StringNode, type TernaryNode, type UnaryOpNode, type VarDeclNode, type WhileNode } from "../ast/ast";
import { Environment } from "../environment/Environment";
import { BreakSignal, ContinueSignal, createGlobalEnv, ReturnSignal } from "../runtime/Runtime";
import type { FnValue } from "./interpreter.types";

export class Interpreter{
    private globalEnv:Environment
    private localEnv:Environment
    private out:(s:string)=>void
    constructor(out?:(s:string)=>void){
        this.globalEnv = createGlobalEnv()
        this.localEnv = this.globalEnv
        this.out = out??((s)=>console.log(s))
    }
    public run(program:ProgramNode){
        this.eval(program)
    }
    private typeToString(t: any): string {
    switch (t.type) {
    case "NumberType": return "number";
    case "StringType": return "string";
    case "BooleanType": return "boolean";
    case "AnyType": return "any";
    default: return "any";
  }
}
  private withEnv<T>(fn: () => T, parent?: Environment): T {
    const prev = this.localEnv;                       // Remember current env
    this.localEnv = parent ?? new Environment(this.localEnv); // Use given parent or create child scope
    try { 
      return fn();                               // Run the code in new env
    }
    finally { 
      this.localEnv = prev;                           // Restore old env after running
    }
  }
  private truthy(v:any){return !!v}
  private makeCallable(fn:FnValue){
    const callable = (...args:any[])=>this.callUserFn(fn,args)
    Object.defineProperty(callable,"__callable",{value:true})
    Object.defineProperty(callable,"__fn",{value:fn})
    if(fn.name)Object.defineProperty(callable,"name",{value:fn.name})
    return callable
  }
  private callUserFn(fn:FnValue,args:any[]){
    if(args.length!=fn.params.length){
        throw new Error(`Function ${fn.name ?? "<anon>"} expected ${fn.params.length} args, got ${args.length}`);
    }
    const callEnv = new Environment(fn.closure)
    fn.params.forEach((param,i)=>{
        if(param.type!=="any" && typeof args[i]!==param.type) throw new Error(`Type error: parameter ${param.name} expects ${param.type}, got ${typeof args[i]}`);
        callEnv.declare(param.name,args[i],false,param.type)
    })
    try{
        this.withEnv(()=>{
            this.eval(fn.body)
            return null
        },callEnv)
    }catch(sig){
        if (sig instanceof ReturnSignal) {
        // Handle return
        if(sig.value !== undefined && fn.returnType !== "any" && typeof sig.value !== fn.returnType) {
          throw new Error(`Type error: function ${fn.name ?? "<anon>"} declared to return ${fn.returnType}, got ${typeof sig.value}`);
        }
        return sig.value;
      }
      throw sig; // Other signals bubble up
    }
  }
  private eval(node:ASTNode):any{
    switch(node.type){
        case NodeType.PROGRAM:
            for(const decl of (node as ProgramNode).body)this.eval(decl);
            return;
        case NodeType.BLOCK:
            return this.withEnv(()=>{
                for(const decl of (node as BlockNode).body)this.eval(decl)
            })
        case NodeType.VAR_DECL_NODE:{
            const n = node as VarDeclNode
            const value = n.initializer?this.eval(n.initializer):null
            const type = n.varType?this.typeToString(n.varType):undefined
            if(type!=="any" && value!==null && typeof value!==type){
                throw new Error(`Type error: variable ${n.name.name} is declared as ${type} but got ${typeof value}`)
            }
            this.localEnv.declare(n.name.name,value,false,type)
            return;
        }
        case NodeType.CONST_DECL_NODE:{
            const n = node as ConstDeclNode
            const value = n.initializer
            const type = n.varType?this.typeToString(n.varType):undefined
            if(type!=="any" && typeof value!==type) throw new Error(`Type error: variable ${n.name.name} is declared as ${type} but got ${typeof value}`)
            this.localEnv.declare(n.name.name,value,true,type)
            return
        }
        case NodeType.EXPR_STATEMENT:
            return this.eval((node as ExprStmtNode).expression);
        case NodeType.PRINT_NODE:{
            const val = this.eval((node as PrintNode).expression)
            this.out(String(val))
            return
        }
        case NodeType.IF_NODE:{
            const n = node as IfNode;
            if(this.truthy(this.eval(n.condition)))return this.eval(n.ifBranch)
            if(n.elseBranch)return this.eval(n.elseBranch)
            return
        }
        case NodeType.WHILE_NODE:{
            const n = node as WhileNode
            loop:while(this.truthy(this.eval(n.condition))){
                try{
                    this.eval(n.body)
                }catch(sig){
                    if(sig instanceof BreakSignal) break loop;
                    if(sig instanceof ContinueSignal) continue loop;
                    throw sig
                }
            }
            return;
        }
        case NodeType.FOR_NODE:{
            const n = node as ForNode
            return this.withEnv(()=>{
                if(n.init) this.eval(n.init)
                while(n.condition?this.truthy(this.eval(n.condition)):true){
                     try{
                        this.eval(n.body)
                     }catch(sig){
                        if(sig instanceof BreakSignal)break;
                        if(sig instanceof ContinueSignal){
                            if(n.update)this.eval(n.update)
                            continue
                        }
                        throw sig
                     }
                     if(n.update)this.eval(n.update)
                }
            })
        }
        case NodeType.BREAK_NODE:throw new BreakSignal();
        case NodeType.CONTINUE_NODE: throw new ContinueSignal();
        case NodeType.RETURN_NODE:{
            const n = node as ReturnNode
            const val = n.returnVal?this.eval(n.returnVal):null
            throw new ReturnSignal(val)
        }
        case NodeType.FUNCTION_DECL_NODE:{
            const n = node as FunctionDeclNode;
            const fn:FnValue = {
                params:n.params.map(p=>({name:p.id.name,type:p.paramType?this.typeToString(p.paramType):"any"})),
                body:n.body,
                closure:this.localEnv,
                returnType:n.returnType?this.typeToString(n.returnType):"any",
                name:n.name?.name,
            }
            const value = this.makeCallable(fn);
            if(n.name)this.localEnv.declare(n.name.name,value,false,"function")
            return value
        }
        case NodeType.CALL_NODE:{
            const n = node as CallNode
            const callee = this.eval(n.callee)
            const args = n.args.map(a => this.eval(a))
            if(typeof callee ==="function")return callee(...args)
            if(callee && callee.__callable===true){
                const fn:FnValue = callee.__fn
                return this.callUserFn(fn,args)
            }
            throw new Error("Attempted to call non-function")
        }
        case NodeType.ASSIGNMENT_NODE:{
            const n = node as AssignmentNode
            const right = this.eval(n.value)
            const assignOp = (cur: any, op: string, val: any) => {
             switch (op) {
              case "=": return val;
              case "+=": return cur + val;
              case "-=": return cur - val;
              case "*=": return cur * val;
              case "/=": return cur / val;
              case "%=": return cur % val;
              default: throw new Error(`Unsupported assignment operator ${op}`);
          }
        };
        if (n.target.type === NodeType.IDENTIFIER) {
          const name = (n.target as IdentifierNode).name;
          const cur = getOrThrow(() => this.localEnv.get(name));
          const value = assignOp(cur, n.op, right);
          this.localEnv.assign(name, value);
          return value;
        } 
        // Object property assignment: obj.key = value
        else if (n.target.type === NodeType.MEMBER) {
          const m = n.target as MemberNode;
          const obj = this.eval(m.object);
          const key = m.property.name;
          const cur = obj?.[key];
          const value = assignOp(cur, n.op, right);
          obj[key] = value;
          return value;
        } 
        // Array / index assignment: arr[i] = value
        else if (n.target.type === NodeType.INDEX) {
          const idx = n.target as IndexNode;
          const obj = this.eval(idx.object);
          const k = this.eval(idx.index);
          const cur = obj?.[k];
          const value = assignOp(cur, n.op, right);
          obj[k] = value;
          return value;
        }
        throw new Error("Invalid assignment target");
        }
        case NodeType.BINARY_NODE: {
        const n = node as BinaryOpNode;
        if (n.operator === "&&") { 
          const l = this.eval(n.left); 
          return this.truthy(l) ? this.eval(n.right) : l; 
        }
        if (n.operator === "||") { 
          const l = this.eval(n.left); 
          return this.truthy(l) ? l : this.eval(n.right); 
        }

        const l = this.eval(n.left);
        const r = this.eval(n.right);
        switch (n.operator) {
          case "+": return l + r;
          case "-": return l - r;
          case "*": return l * r;
          case "/": return l / r;
          case "%": return l % r;
          case "==": return l === r;
          case "!=": return l !== r;
          case ">": return l > r;
          case "<": return l < r;
          case ">=": return l >= r;
          case "<=": return l <= r;
          default: throw new Error(`Unknown operator ${n.operator}`);
        }
      }

      // === Unary operation ===
      case NodeType.UNARY_NODE: {
        const n = node as UnaryOpNode;
        const v = this.eval(n.right);
        switch (n.operator) {
          case "-": return -v;
          case "!": return !this.truthy(v);
          case "++":{
            if(n.right.type !== NodeType.IDENTIFIER) {
              throw new Error("Invalid operand for ++ operator");
            }
            const name = (n.right as IdentifierNode).name;
            const cur = getOrThrow(() => this.localEnv.get(name));
            this.localEnv.assign(name, cur + 1);
            return cur + 1;
          }
          case "--": {
            if(n.right.type !== NodeType.IDENTIFIER) {
              throw new Error("Invalid operand for -- operator");
            }
            const name = (n.right as IdentifierNode).name;
            const cur = getOrThrow(() => this.localEnv.get(name));
            this.localEnv.assign(name, cur - 1);
            return cur - 1;
          }
          default: throw new Error(`Unknown unary ${n.operator}`);
        }
      }
      case NodeType.POST_FIX_NODE: {
        const n = node as PostfixNode;
        if (n.operator === "++" || n.operator === "--") {
          if (n.operand.type !== NodeType.IDENTIFIER) {
            throw new Error(`Invalid operand for ${n.operator} operator`);
          }
          const name = (n.operand as IdentifierNode).name;
          const cur = getOrThrow(() => this.localEnv.get(name));
          this.localEnv.assign(name, n.operator === "++" ? cur + 1 : cur - 1);
        }else {
          throw new Error(`Unknown postfix operator ${n.operator}`);
        }
        break;
      }
        case NodeType.TERNARY:{
            const n = node as TernaryNode
            return this.truthy(n.condition)?this.eval(n.trueBracnh):this.eval(n.falseBranch)
        }
        case NodeType.NUMBER:return (node as NumberNode).value
        case NodeType.STRING:return (node as StringNode).value
        case NodeType.BOOLEAN:return (node as BooleanNode).value
        case NodeType.NULL:return null
        case NodeType.IDENTIFIER:{
            const name = (node as IdentifierNode).name
            return this.localEnv.get(name)
        }
        case NodeType.GROUPING:return this.eval((node as GroupingNode).expression)
        case NodeType.ARRAY:{
            const  n = node as ArrayNode
            return n.elements.map(e=>this.eval(e))
        }
        case NodeType.OBJECT:{
            const n = node as ObjectNode
            const obj:any = {}
            for(const p of n.properties)obj[p.key] = this.eval(p.value)
            return obj
        }
        case NodeType.MEMBER:{
            const n = node as MemberNode
            const obj = this.eval(n.object)
            return obj?.[n.property.name]
        }
        case NodeType.INDEX:{
            const n = node as IndexNode
            const obj = this.eval(n.object)
            const k = this.eval(n.index)
            return obj?.[k]
        }
        default:{
            const never:never = node as never
            throw new Error(`Unhandled node ${(never as any)?.type}`)
        }
    }
  }
}
function getOrThrow<T>(fn: () => T,errorMsg?:string): T {
  try { return fn(); } catch { throw new Error(errorMsg ?? "Variable not found"); }
}