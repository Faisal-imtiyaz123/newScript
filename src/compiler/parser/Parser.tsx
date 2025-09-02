import { NodeType, type ASTNode, type BlockNode, type ConstDeclNode, type ExprStmtNode, type ForNode, type FunctionDeclNode, type IdentifierNode, type IfNode, type PrintNode, type ProgramNode, type TypeAnnotation, type VarDeclNode, type WhileNode } from "../ast";
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
  parseProgram():ProgramNode{
    const body:ASTNode[]=[];
    while(!this.isAtEnd())body.push(this.declaration());
    return {type:NodeType.PROGRAM,body};
  }
  // helpers
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
  private inferType(t: any): TypeAnnotation {
     switch (typeof t) {
       case "number": return {type: "NumberType"};
       case "string": return {type: "StringType"};
       case "boolean": return {type: "BooleanType"};
       default: return {type: "AnyType"};
    }
  }
  private declaration():ASTNode{
    if(this.matchTokens(TokenType.VAR))return this.varDecl("var");
    if(this.matchTokens(TokenType.LET))return this.varDecl("let");
    if(this.matchTokens(TokenType.CONST))return this.constDecl();
    if(this.matchTokens(TokenType.FUNCTION))return this.funcDecl(true);
    return this.statement();
  }
  private varDecl(kind:"let"|"var"):VarDeclNode{
    const identifier = this.matchWithError(TokenType.IDENTIFIER,"Expected a variable name");
    let varType:TypeAnnotation|undefined;
    if(this.matchTokens(TokenType.COLON)) varType = this.parseTypeAnnotation()
    let initializer:ASTNode|undefined;
    if(this.matchTokens(TokenType.EQUAL))initializer = this.expression()
    if(initializer!==undefined && varType===undefined)varType = this.inferType(initializer);
    this.matchWithError(TokenType.SEMICOLON, "Expected ';' after variable declaration");
    return { type:NodeType.VAR_DECL_NODE, kind, name: { type: NodeType.IDENTIFIER, name: identifier.lexeme }, varType, initializer };
  }
  private constDecl():ConstDeclNode{
    const identifier = this.matchWithError(TokenType.IDENTIFIER,"Expected constant name")
    let constType:TypeAnnotation|undefined;
    if(this.matchTokens(TokenType.COLON)) constType = this.parseTypeAnnotation()
    this.matchWithError(TokenType.EQUAL,"Expected equal sign after constant name")
    const initializer = this.expression()
    if(constType==undefined)constType=this.inferType(initializer)
    this.matchWithError(TokenType.SEMICOLON,"Expected Semicolon after const Decl")
    return {type:NodeType.CONST_DECL_NODE,name:{type:NodeType.IDENTIFIER,name:identifier.lexeme},varType:constType,initializer}
  }
  private funcDecl(named:boolean):FunctionDeclNode{
    let funcName:IdentifierNode|undefined;
    if(named && this.match(TokenType.IDENTIFIER)){
        funcName = {type:NodeType.IDENTIFIER,name:this.advance().lexeme}
    }
    this.matchWithError(TokenType.LEFT_PAREN,"Expected Left paren after function");
    const params:{id:IdentifierNode,paramType?:TypeAnnotation}[] = [];
    if(!this.match(TokenType.RIGHT_PAREN)){
        do{
            const paramToken = this.matchWithError(TokenType.IDENTIFIER,"Expected parameter name")
            let paramType:TypeAnnotation|undefined;
            if(this.matchTokens(TokenType.COLON))paramType= this.parseTypeAnnotation()
            params.push({id:{type:NodeType.IDENTIFIER,name:paramToken.lexeme},paramType})
        }while(this.matchTokens(TokenType.COMMA))
    }
    this.matchWithError(TokenType.RIGHT_PAREN,"Expected Right Paren")
    let returnType:TypeAnnotation|undefined
    if(this.matchTokens(TokenType.COMMA))returnType = this.parseTypeAnnotation()
    const body = this.block();
    return {type:NodeType.FUNCTION_DECL_NODE,name:funcName,params,returnType,body}
  }
  private statement():ASTNode{
     if (this.match(TokenType.PRINT)) return this.printStmt();
    if (this.match(TokenType.IF)) return this.ifStmt();
    if (this.match(TokenType.WHILE)) return this.whileStmt();
    if (this.match(TokenType.FOR)) return this.forStmt();
    if (this.match(TokenType.BREAK)) { this.matchWithError(TokenType.SEMICOLON, "Expected ';' after break"); return { type: NodeType.BREAK_NODE}; }
    if (this.match(TokenType.CONTINUE)) { this.matchWithError(TokenType.SEMICOLON, "Expected ';' after continue"); return { type: NodeType.CONTINUE_NODE }; }
    if (this.match(TokenType.RETURN)) {
      let returnVal: ASTNode | undefined;
      if (!this.match(TokenType.SEMICOLON)) returnVal = this.expression();
      this.matchWithError(TokenType.SEMICOLON, "Expected ';' after return");
      return { type: NodeType.RETURN_NODE, returnVal};
    }
    if (this.match(TokenType.LEFT_BRACE)) return this.block();
    if (this.match(TokenType.FUNCTION)) return this.funDecl(false);
    return this.exprStmt();
  }
  private printStmt():PrintNode{
    const expr = this.expression();
    this.matchWithError(TokenType.SEMICOLON,"Expected Semicolon after Print")
    return {type:NodeType.PRINT_NODE,expression:expr}
  }
  private ifStmt():IfNode{
    this.matchWithError(TokenType.LEFT_PAREN,"Expected ( after If")
    const cond = this.expression()
    this.matchWithError(TokenType.RIGHT_PAREN,"Expected ) after condition")
    const ifBranch = this.statement();
    let elseBranch:BlockNode|undefined;
    if(this.matchTokens(TokenType.ELSE))elseBranch = this.block()
    return {type:NodeType.IF_NODE,condition:cond,ifBranch,elseBranch}
  }
  private whileStmt(): WhileNode {
    this.matchWithError(TokenType.LEFT_PAREN, "Expected '(' after while");
    const cond = this.expression();
    this.matchWithError(TokenType.RIGHT_PAREN, "Expected ')' after condition");
    const body = this.block();
    return { type: NodeType.WHILE_NODE, condition: cond, body };
  }
  private  forStmt():ForNode{
    this.matchWithError(TokenType.LEFT_PAREN,"Expected ( after If")
    let init:ASTNode|undefined;
    if(this.matchTokens(TokenType.SEMICOLON)){
        init = undefined
    }else if(this.matchTokens(TokenType.VAR)){
        init = this.varDecl("var")
    }else if(this.matchTokens(TokenType.LET)){
        init = this.varDecl("let")
    }else if(this.matchTokens(TokenType.CONST)){
        init = this.constDecl()
    }else{
        init = this.exprStmt();
    }
    let condition:ASTNode|undefined;
    if(!this.match(TokenType.SEMICOLON))condition = this.expression()
    this.matchWithError(TokenType.SEMICOLON,"Expected Semicolon ater condition")
    let update:ASTNode|undefined
    if(!this.match(TokenType.SEMICOLON))update = this.expression()
    this.matchWithError(TokenType.SEMICOLON,"Expected Semicolon after update condition")
    const body = this.statement()
    return {type:NodeType.FOR_NODE,init,condition,update,body}
  }
  private block(): BlockNode {
    const body: ASTNode[] = [];
    this.matchWithError(TokenType.LEFT_BRACE, "Expected '{' to start block");
    while (!this.match(TokenType.RIGHT_BRACE) && !this.isAtEnd()) body.push(this.declaration());
    this.matchWithError(TokenType.RIGHT_BRACE, "Expected '}' after block");
    return { type: NodeType.BLOCK, body };
  }
  private exprStmt():ExprStmtNode{
    const expr = this.expression()
    this.matchWithError(TokenType.SEMICOLON,"Expected Semicolon after expression")
    return {type:NodeType.EXPR_STATEMENT,expression:expr}
  }
  private expression():ASTNode{ return this.assignment()}
  private assignment():ASTNode{
    const left = this.ternary()
    if(this.matchTokens(TokenType.EQUAL,TokenType.PLUS_EQUAL,TokenType.MINUS_EQUAL,TokenType.STAR_EQUAL,TokenType.SLASH_EQUAL,TokenType.PERCENT_EQUAL)){
        const op = this.previous().lexeme
        const value = this.assignment()
        if(left.type===NodeType.IDENTIFIER || left.type===NodeType.MEMBER || left.type===NodeType.INDEX){
            return {type:NodeType.ASSIGNMENT_NODE,op,target:left as any ,value}
        }
    }
    return left
  }
}