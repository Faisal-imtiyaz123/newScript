import type { TypeAnnotation } from "../ast";
import { TokenType, type Token } from "../lexer/tokens";

/**
 * Grammar (modern core):
 *
 * program      -> declaration* EOF
 * declaration  -> varDecl | constDecl | funDecl | statement
 * varDecl      -> ("var" | "let") IDENT ("=" expression)? ";"
 * constDecl    -> "const" IDENT "=" expression ";"
 * funDecl      -> "function" IDENT? "(" params? ")" block
 * params       -> IDENT ("," IDENT)* 
 *
 * statement   -> printStmt | ifStmt | whileStmt | forStmt | breakStmt | continueStmt | returnStmt
 *              | block | exprStmt 
 * printStmt   -> "print" expression ";" 
 * ifStmt      -> "if" "(" expression ")" block ("else" block)? 
 * whileStmt   -> "while" "(" expression ")" block 
 * forStmt     -> "for" "(" (declaration | exprStmt | ";")
 *                         expression? ";" expression? ")" block
 * breakStmt   -> "break" ";" 
 * continueStmt-> "continue" ";" 
 * returnStmt  -> "return" expression? ";" 
 * block       -> "{" declaration* "}" 
 * exprStmt    -> expression ";" 
 *
 * expression  -> assignment 
 * assignment  -> (callOrMember) ( "=" | "+="|"-="|"*="|"/="|"%=" ) assignment | ternary 
 * ternary     -> logic_or ("?" expression ":" expression)? 
 * logic_or    -> logic_and ( "||" logic_and )* 
 * logic_and   -> equality ( "&&" equality )* 
 * equality    -> comparison ( ("==" | "!=") comparison )* 
 * comparison  -> term ( (">" | ">=" | "<" | "<=") term )* 
 * term        -> factor ( ("+" | "-") factor )* 
 * factor      -> unary ( ("*" | "/" | "%") unary )* 
 * unary       -> ("!" | "-","++" | "--") unary | postfix ;
 * postfix    --> callOrMember ("++"|"--")*
 * callOrMember-> primary ( "(" args? ")" | "." IDENT | "[" expression "]" )* 
 * args        -> expression ("," expression)* ;
 * primary     -> NUMBER | STRING | TRUE | FALSE | NULL | IDENT | "(" expression ")"
 *              | array | object | functionExpr 
 * array       -> "[" elements? "]" 
 * elements    -> expression ("," expression)* 
 * object      -> "{" (IDENT ":" expression) ("," IDENT ":" expression)* "}" | "{}" 
 * functionExpr-> "function" "(" params? ")" block 
 */
export class Parser{
  private tokens:Token[]
  private current=0
  constructor(tokens:Token[]){
    this.tokens = tokens
  }
  private peek(): Token { return this.tokens[this.current]; }
  private previous(): Token { return this.tokens[this.current - 1]; }
  private isAtEnd(): boolean { return this.peek().type === TokenType.EOF; }
  private advance(): Token { if (!this.isAtEnd()) this.current++; return this.previous(); }
  private match(type: TokenType): boolean { return !this.isAtEnd() && this.peek().type === type; }
  private matchTokens(...types: TokenType[]): boolean { for (const t of types) { if (this.match(t)) { this.advance(); return true; } } return false; }
  private matchWithError(type: TokenType, msg: string): Token { if (this.match(type)) return this.advance(); throw new Error(`${msg} at '${this.peek().lexeme}'`); }
  private parseTypeAnnotation(): TypeAnnotation {
  if (this.matchTokens(TokenType.NUMBER_TYPE)) return { type: "NumberType" };
  if (this.matchTokens(TokenType.STRING_TYPE)) return { type: "StringType" };
  if (this.matchTokens(TokenType.BOOLEAN_TYPE)) return { type: "BooleanType" };
  if (this.matchTokens(TokenType.ANY_TYPE)) return { type: "AnyType" };
  throw new Error("Expected type annotation");
  }


}