export enum TokenType {
  // Single-char tokens
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  LEFT_BRACKET = "LEFT_BRACKET",
  RIGHT_BRACKET = "RIGHT_BRACKET",
  COMMA = "COMMA",
  DOT = "DOT",
  SEMICOLON = "SEMICOLON",
  COLON = "COLON",
  QUESTION = "QUESTION",
  PLUS = "PLUS",
  MINUS = "MINUS",
  STAR = "STAR",
  SLASH = "SLASH",
  PERCENT = "PERCENT",
  BANG = "BANG",
  EQUAL = "EQUAL",
  GREATER = "GREATER",
  LESS = "LESS",
  PIPE = "PIPE",
  AMP = "AMP",

  // Two-char tokens
  BANG_EQUAL = "BANG_EQUAL",
  EQUAL_EQUAL = "EQUAL_EQUAL",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS_EQUAL = "LESS_EQUAL",
  AND_AND = "AND_AND",
  OR_OR = "OR_OR",
  PLUS_EQUAL = "PLUS_EQUAL",
  MINUS_EQUAL = "MINUS_EQUAL",
  STAR_EQUAL = "STAR_EQUAL",
  SLASH_EQUAL = "SLASH_EQUAL",
  PERCENT_EQUAL = "PERCENT_EQUAL",
  PLUS_PLUS = "PLUS_PLUS",
  MINUS_MINUS = "MINUS_MINUS",

  // Literals
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",

  // Keywords
  VAR = "VAR",
  LET = "LET",
  CONST = "CONST",
  FUNCTION = "FUNCTION",
  RETURN = "RETURN",
  BREAK = "BREAK",
  CONTINUE = "CONTINUE",
  IF = "IF",
  ELSE = "ELSE",
  WHILE = "WHILE",
  FOR = "FOR",
  TRUE = "TRUE",
  FALSE = "FALSE",
  NULL = "NULL",
  PRINT = "PRINT",
  STRING_TYPE = "STRING_TYPE",
  NUMBER_TYPE = "NUMBER_TYPE",
  BOOLEAN_TYPE = "BOOLEAN_TYPE",
  ANY_TYPE = "ANY_TYPE",
  //import export
  IMPORT = "IMPORT",
  EXPORT="EXPORT",
  FROM="FROM",
  AS="AS",
  DEFAULT="DEFAULT",
  //WhiteSpace
  WHITESPACE = "WHITESPACE",
  // End of file
  EOF = "EOF",
}

export type Literal = string | number | boolean | null | {value:string;unterminated:boolean};
export type Token = {
  type: TokenType;
  lexeme: string;
  literal?: Literal;
  line: number;
  col: number;
};

export const keywords: Record<string, TokenType> = {
  import:TokenType.IMPORT,
  from:TokenType.FROM,
  default:TokenType.DEFAULT,
  as:TokenType.AS,
  export:TokenType.EXPORT,
  var: TokenType.VAR,
  let: TokenType.LET,
  loyal: TokenType.CONST,
  const:TokenType.CONST,
  print:TokenType.PRINT,
  declare: TokenType.FUNCTION,
  emit: TokenType.RETURN,
  break: TokenType.BREAK,
  continue: TokenType.CONTINUE,
  if: TokenType.IF,
  else: TokenType.ELSE,
  while: TokenType.WHILE,
  for: TokenType.FOR,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
  say: TokenType.PRINT,
  string: TokenType.STRING_TYPE,
  number: TokenType.NUMBER_TYPE,
  boolean: TokenType.BOOLEAN_TYPE,
  any: TokenType.ANY_TYPE, 
  equals:TokenType.EQUAL,
  isgre:TokenType.GREATER,
  isless:TokenType.LESS,
  plus:TokenType.PLUS,
  minus:TokenType.MINUS,
  into:TokenType.STAR,
  by:TokenType.SLASH,
};
