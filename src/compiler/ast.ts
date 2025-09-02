
export type ASTNode =
  | ProgramNode      // The top-level program container
  | BlockNode        // A block of statements { ... }
  | VarDeclNode      // let/var variable declaration
  | ConstDeclNode    // const variable declaration
  | ExprStmtNode     // A standalone expression as a statement
  | PrintNode        // print(expression)
  | IfNode           // if (...) { ... } else { ... }
  | WhileNode        // while loop
  | ForNode          // for loop
  | BreakNode        // break statement
  | ContinueNode     // continue statement
  | ReturnNode       // return statement
  | FunctionDeclNode // function definition
  | CallNode         // function call
  | AssignmentNode   // assignment to variable / object / array
  | BinaryOpNode     // binary operation: a + b, a - b, etc.
  | UnaryOpNode      // unary operation: -a, !a, etc.
  | TernaryNode      // conditional expression: cond ? a : b
  | NumberNode       // numeric literal
  | StringNode       // string literal
  | BooleanNode      // boolean literal
  | NullNode         // null literal
  | IdentifierNode   // variable reference
  | GroupingNode     // parentheses: (expression)
  | ArrayNode        // array literal: [a, b, c]
  | ObjectNode       // object literal: { key: value, ... }
  | MemberNode       // property access: obj.prop
  | IndexNode        // index access: obj[expr]
  | PostfixNode      // postfix increment/decrement: expr++, expr--

export enum NodeType{
    PROGRAM="Program",
    BLOCK="Block",
    VAR_DECL_NODE="VarDeclNode",
    CONST_DECL_NODE="ConstDeclNode",
    EXPR_STATEMENT="ExprStatement",
    PRINT_NODE="PrintNode",
    IF_NODE="IfNode",
    WHILE_NODE="WhileNode",
    FOR_NODE="ForNode",
    BREAK_NODE="BreakNode",
    CONTINUE_NODE="ContinueNode",
    RETURN_NODE="ReturnNode",
    FUNCTION_DECL_NODE="FunctionDeclNode",
    CALL_NODE="CallNode",
    ASSIGNMENT_NODE="AssignMentNode",
    BINARY_NODE="BinaryNode",
    UNARY_NODE="UnaryNode",
    POST_FIX_NODE="PostFixNode",
    UPDATE_EXPRESSION_NODE="UpdateExpressionNode",
    TERNARY="TernaryNode",
    NUMBER="NumberNode",
    STRING="StringNode",
    BOOLEAN="BooleanNode",
    NULL="NullNode",
    IDENTIFIER="IdentifierNode",
    GROUPING="GroupingNode",
    ARRAY="ArrayNode",
    OBJECT="ObjectNode",
    MEMBER="MemberNode",
    INDEX="IndexNode"
}
export type TypeAnnotation =
  | { type: "NumberType" }
  | { type: "StringType" }
  | { type: "BooleanType" }
  | { type: "AnyType" };

export interface ProgramNode{
    type:NodeType.PROGRAM,
    body:ASTNode[],
}
export interface BlockNode{
    type:NodeType.BLOCK ,
    body:ASTNode[]
}
export interface VarDeclNode{
    type:NodeType.VAR_DECL_NODE,
    kind:"let" | "var",
    name:IdentifierNode,
    varType?:TypeAnnotation,
    initializer?:ASTNode;
}
export interface ConstDeclNode{
    type:NodeType.CONST_DECL_NODE,
    name:IdentifierNode,
    varType?:TypeAnnotation,
    initializer:ASTNode
}
export interface ExprStmtNode{
    type:NodeType.EXPR_STATEMENT,
    expression:ASTNode
}
export interface PrintNode{
    type:NodeType.PRINT_NODE
    expression:ASTNode
}
export interface IfNode{
    type:NodeType.IF_NODE
    condition:ASTNode,
    ifBranch:ASTNode,
    elseBranch?:BlockNode
}
export interface WhileNode{
    type:NodeType.WHILE_NODE
    condition:ASTNode
    body:BlockNode
}
export interface ForNode{
    type:NodeType.FOR_NODE
    init?:ASTNode
    condition?:ASTNode
    update?:ASTNode
    body:ASTNode
}
export interface BreakNode{
    type:NodeType.BREAK_NODE
}
export interface ContinueNode{
    type:NodeType.CONTINUE_NODE
}
export interface ReturnNode{
    type:NodeType.RETURN_NODE
    returnVal?:ASTNode
}
export interface FunctionDeclNode{
    type:NodeType.FUNCTION_DECL_NODE
    name?:IdentifierNode
    params:{id:IdentifierNode,paramType?:TypeAnnotation}[]
    returnType?:TypeAnnotation
    body:BlockNode
}
export interface CallNode{
    type:NodeType.CALL_NODE
    callee:ASTNode // this being called
    args:ASTNode // args being passed
}
export interface AssignmentNode{
    type:NodeType.ASSIGNMENT_NODE
    op:string,
    target:IdentifierNode | MemberNode | IndexNode // variable property or index
    value:ASTNode
}
export interface BinaryOpNode{
    type:NodeType.BINARY_NODE,
    operator:string,
    left:ASTNode,
    right:ASTNode
}
export interface UnaryOpNode{
    type:NodeType.UNARY_NODE,
    operator:string,
    right:ASTNode
}
export interface PostfixNode{
    type:NodeType.POST_FIX_NODE,
    operator:string,
    operand:ASTNode
}
export interface UpdateExpressionNode{
    type:NodeType.UPDATE_EXPRESSION_NODE
    operator:"++"|"--"
    operand:IdentifierNode
    prefix:boolean // true =++i false=i++
}
export interface TernaryNode{
    type:NodeType.TERNARY
    condition:ASTNode,
    trueBracnh:ASTNode
    falseBranch:ASTNode
}
export interface NumberNode{
    type:NodeType.NUMBER
    value:number
}
export interface StringNode{
    type:NodeType.STRING
    value:string
}
export interface BooleanNode{
    type:NodeType.BOOLEAN
    value:string
}
export interface NullNode{
    type:NodeType.NULL
}
export interface IdentifierNode{
    type:NodeType.IDENTIFIER,
    name:string
}
export interface GroupingNode{
    type:NodeType.GROUPING
    expression:ASTNode
}
export interface ArrayNode{
    type:NodeType.ARRAY
    elements:ASTNode[]
}
export interface ObjectProp{
    key:string
    value:ASTNode
}
// Object literal: `{ key1: value1, key2: value2 }`
export interface ObjectNode {
  type: NodeType.OBJECT;
  properties: ObjectProp[];
}
// Property access by name: `obj.prop`
export interface MemberNode {
  type: NodeType.MEMBER;
  object: ASTNode;                // object being accessed
  property: IdentifierNode;       // property name
}

// Index access by expression: `obj[expr]`
export interface IndexNode {
  type: NodeType.INDEX;
  object: ASTNode;                 // object/array being accessed
  index: ASTNode;                  // index/key expression
}