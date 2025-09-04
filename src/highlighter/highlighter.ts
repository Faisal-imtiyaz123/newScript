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

    default:
      return "tok-default";
  }
}



export function highlightCode(src: string): string {
  const lexer = new Lexer(src);
  let out = "";
  let pos = 0;

  try {
    const tokens = lexer.tokenize();
    for (const t of tokens) {
      if (t.type === (TokenType as any).EOF) continue;
      const idx = src.indexOf(t.lexeme, pos);
      out += escapeHtml(src.slice(pos, idx));
      out += `<span class="${tokenClass(t.type)}">${escapeHtml(t.lexeme)}</span>`;
      pos = idx + t.lexeme.length;
    }
    out += escapeHtml(src.slice(pos));
  } catch (e: any) {
    // Handle unterminated string specifically
    const msg = (e.message as string) || "";
    const match = msg.match(/Unterminated string at line \d+, col \d+/);
    if (match) {
      // everything from lexer.current to end is part of string-error
      const safePart = escapeHtml(src.slice(pos));
      out += `<span class="${tokenClass("STRING_ERROR")}">${safePart}</span>`;
    } else {
      // any other error, just output raw escaped source
      out += escapeHtml(src.slice(pos));
    }
  }

  if (!out.endsWith("\n")) out += "\n";
  return out;
}