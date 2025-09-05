// highlighter.ts
import { Lexer } from "../compiler/lexer/Lexer";
import { TokenType } from "../compiler/lexer/tokens";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function tokenClass(type: TokenType | "STRING_ERROR"): string {
  // Brackets / braces / parentheses
  const bracketMap: Partial<Record<TokenType, string>> = {
    [TokenType.LEFT_PAREN]: "tok-bracket",
    [TokenType.RIGHT_PAREN]: "tok-bracket",
    [TokenType.LEFT_BRACE]: "tok-bracket",
    [TokenType.RIGHT_BRACE]: "tok-bracket",
    [TokenType.LEFT_BRACKET]: "tok-bracket",
    [TokenType.RIGHT_BRACKET]: "tok-bracket",
  };
  if (type in bracketMap) return bracketMap[type as TokenType]!;
  switch (type) {
    case "STRING_ERROR": return "tok-string-error";
    case TokenType.STRING: return "tok-string";
    case TokenType.NUMBER: return "tok-number";
    case TokenType.IDENTIFIER: return "tok-identifier";

    // Keywords
    case TokenType.VAR:
    case TokenType.LET:
    case TokenType.CONST:
    case TokenType.FUNCTION:
    case TokenType.IMPORT:
    case TokenType.EXPORT:
    case TokenType.FROM:
    case TokenType.AS:
    case TokenType.DEFAULT:
      return "tok-keyword";

    // Control flow
    case TokenType.IF:
    case TokenType.ELSE:
    case TokenType.WHILE:
    case TokenType.FOR:
    case TokenType.RETURN:
    case TokenType.BREAK:
    case TokenType.CONTINUE:
      return "tok-control";

    // Boolean / null
    case TokenType.TRUE:
    case TokenType.FALSE:
    case TokenType.NULL:
      return "tok-boolean";

    // Print / emit
    case TokenType.PRINT:
      return "tok-function";

    // Types
    case TokenType.STRING_TYPE:
    case TokenType.NUMBER_TYPE:
    case TokenType.BOOLEAN_TYPE:
    case TokenType.ANY_TYPE:
      return "tok-type";

    // Operators
    case TokenType.PLUS:
    case TokenType.MINUS:
    case TokenType.STAR:
    case TokenType.SLASH:
    case TokenType.EQUAL:
    case TokenType.BANG:
    case TokenType.GREATER:
    case TokenType.LESS:
    case TokenType.PIPE:
    case TokenType.AMP:
    case TokenType.PLUS_EQUAL:
    case TokenType.MINUS_EQUAL:
    case TokenType.STAR_EQUAL:
    case TokenType.SLASH_EQUAL:
    case TokenType.PERCENT_EQUAL:
    case TokenType.PLUS_PLUS:
    case TokenType.MINUS_MINUS:
    case TokenType.BANG_EQUAL:
    case TokenType.EQUAL_EQUAL:
    case TokenType.GREATER_EQUAL:
    case TokenType.LESS_EQUAL:
    case TokenType.AND_AND:
    case TokenType.OR_OR:
      return "tok-operator";
    case TokenType.WHITESPACE: return "tok-whitespace";
    default:
      return "tok-default";
  }
}



export function highlightCode(src: string): string {
  const lexer = new Lexer(src);
  const tokens = lexer.tokenize();
  let out = "";
  for (const token of tokens) {
    const cls = tokenClass(token.type);
    if (token.type === TokenType.WHITESPACE) {
      // Preserve spaces/tabs/newlines as-is
      out += token.lexeme
        .replace(/ /g, "&nbsp;")
        .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replace(/\n/g, "<br/>");
    }else if(token.type === TokenType.STRING && token.literal && typeof(token.literal)=="object" && "unterminated" in token.literal){
        if(token.literal.unterminated == false) out += `<span class="${cls}">"${escapeHtml(token.lexeme)}"</span>`;
        else out += `<span class="tok-string-error">"${escapeHtml(token.lexeme)}"</span>`;
    }
     else {
      out += `<span class="${cls}">${escapeHtml(token.lexeme)}</span>`;
    }
  }

  return out;
}