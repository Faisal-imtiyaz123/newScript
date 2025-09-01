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


}