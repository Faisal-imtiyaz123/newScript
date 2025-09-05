import { keywords, TokenType, type Literal, type Token } from "./tokens";

export class Lexer{
private src: string;
private start = 0;
private current = 0;
private line = 1;
private col = 1;

constructor(src: string) {
    this.src = src;
}
 tokenize(){
    const tokens:Token[] = [];
    while(!this.isAtEnd()){
        this.start = this.current;
        const token = this.scan();
        if(token) tokens.push(token);
    }
    tokens.push(this.makeToken(
        TokenType.EOF,
        "",
    ));
    return tokens;
}
private advance(){
    const ch = this.src[this.current];
    this.current++;
    if(ch=='\n'){
        this.line++;
        this.col=1;
    }else{
        this.col++;
    }
    return ch;
}
private isAtEnd(){
    return this.current >= this.src.length;
}
private peek(){
    if(this.isAtEnd()) return '\0';
    return this.src[this.current];
}
private peekNext(){
    if(this.current + 1 >= this.src.length) return '\0';
    return this.src[this.current + 1]; 
}
private match(expected: string){
    if(this.isAtEnd()) return false;
    if(this.peek()!=expected)return false;
    this.advance();
    return true;
}
private makeToken(type:TokenType,lexeme:string,literal?:Literal){
    const token:Token = {
        type,
        lexeme,
        literal,
        line: this.line,
        col: this.col
    };
    return token;
}
private skipWhiteSpace(){
    while(!this.isAtEnd()){
        const ch = this.peek();
        if(ch === ' ' || ch === '\t' || ch === '\r' || ch=='\n'){
            this.advance();
        }else{
            break;
        }
    }
}
private skipComments(){
    const ch = this.peek();
    if(ch=='/' && this.peekNext()=='/'){
        while(this.peek()!='\n' && !this.isAtEnd()){
            this.advance();
        }
    }
    if(ch=='/' && this.peekNext()=='*'){
        this.advance();
        this.advance();
        while(!this.isAtEnd()){
            if(this.peek()=='*' && this.peekNext()=='/'){
                this.advance();
                this.advance();
                break;
            }
            this.advance();
        }
    }
   }
private string() {
  let str = "";
  let unterminated = false;
  while (!this.isAtEnd() && this.peek() !== '"') {
    const ch = this.advance();
    if (ch === "\\") {
      const next = this.peek();
      switch (next) {
        case '"': str += this.advance(); break;
        case 'n': str += '\n'; this.advance(); break;
        case 't': str += '\t'; this.advance(); break;
        default: str += ch; break;
      }
    } else {
      str += ch;
    }
  }
  if (this.isAtEnd() || this.peek() !== '"') {
    // Unterminated string: just mark it, don't throw
    unterminated = true;
  } else {
    this.advance(); // consume closing quote
  }
  // Attach unterminated flag to literal so highlighter can style differently
  return this.makeToken(TokenType.STRING, str, { value: str, unterminated });
}

private number(){
    while(/\d/.test(this.peek())){
        this.advance();
    }
    if(this.peek()==='.' && /\d/.test(this.peekNext())){
        this.advance(); // consume the dot
        while(/\d/.test(this.peek())){
            this.advance();
        }
    }
    const numStr = this.src.slice(this.start, this.current);
    return this.makeToken(TokenType.NUMBER, numStr, Number(numStr));
}
private identifier(){
    while(/[A-Za-z0-9_]/.test(this.peek()))this.advance();
    const idStr = this.src.slice(this.start, this.current);
    const kw = keywords[idStr];
    if(kw){
        if(kw==TokenType.TRUE) return this.makeToken(TokenType.TRUE,idStr, true);
        if(kw==TokenType.FALSE) return this.makeToken(TokenType.FALSE,idStr, false);
        if(kw==TokenType.NULL) return this.makeToken(TokenType.NULL,idStr, null);
        return this.makeToken(kw, idStr);
    }
    return this.makeToken(TokenType.IDENTIFIER, idStr);
}
private whitespace() {
  while (!this.isAtEnd()) {
    const ch = this.peek();
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      this.advance();
    } else {
      break;
    }
  }
  const text = this.src.slice(this.start, this.current);
  return this.makeToken(TokenType.WHITESPACE, text);
}
private scan(){
    this.skipComments();
    if(this.isAtEnd()) return null;
    this.start = this.current;
    const ch = this.advance();
    switch (ch) {
      case "(": return this.makeToken(TokenType.LEFT_PAREN, ch);
      case ")": return this.makeToken(TokenType.RIGHT_PAREN, ch);
      case "{": return this.makeToken(TokenType.LEFT_BRACE, ch);
      case "}": return this.makeToken(TokenType.RIGHT_BRACE, ch);
      case "[": return this.makeToken(TokenType.LEFT_BRACKET, ch);
      case "]": return this.makeToken(TokenType.RIGHT_BRACKET, ch);
      case ",": return this.makeToken(TokenType.COMMA, ch);
      case ".": return this.makeToken(TokenType.DOT, ch);
      case ";": return this.makeToken(TokenType.SEMICOLON, ch);
      case ":": return this.makeToken(TokenType.COLON, ch);
      case "?": return this.makeToken(TokenType.QUESTION, ch);

      // Arithmetic operators with optional = suffix
      case "+": 
      if(this.match("+")) return this.makeToken(TokenType.PLUS_PLUS, this.src.slice(this.start, this.current));
      if(this.match("=")) return this.makeToken(TokenType.PLUS_EQUAL, this.src.slice(this.start, this.current));
      return this.makeToken(TokenType.PLUS, this.src.slice(this.start, this.current));
      case "-": 
      if(this.match("-")) return this.makeToken(TokenType.MINUS_MINUS, this.src.slice(this.start, this.current));
      if(this.match("=")) return this.makeToken(TokenType.MINUS_EQUAL, this.src.slice(this.start, this.current));
      return this.makeToken(TokenType.MINUS, this.src.slice(this.start, this.current));
      case "*": return this.makeToken(this.match("=") ? TokenType.STAR_EQUAL : TokenType.STAR, this.src.slice(this.start, this.current));
      case "/": return this.makeToken(this.match("=") ? TokenType.SLASH_EQUAL : TokenType.SLASH, this.src.slice(this.start, this.current));
      case "%": return this.makeToken(this.match("=") ? TokenType.PERCENT_EQUAL : TokenType.PERCENT, this.src.slice(this.start, this.current));

      // Comparison / equality
      case "!": return this.makeToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG, this.src.slice(this.start, this.current));
      case "=": return this.makeToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL, this.src.slice(this.start, this.current));
      case ">": return this.makeToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER, this.src.slice(this.start, this.current));
      case "<": return this.makeToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS, this.src.slice(this.start, this.current));

      // Logical operators
     case "&":
     if (this.match("&")) return this.makeToken(TokenType.AND_AND, "&&");
     return this.makeToken(TokenType.AMP, "&");

     case "|":
     if (this.match("|")) return this.makeToken(TokenType.OR_OR, "||");
     return this.makeToken(TokenType.PIPE, "|");

      // Strings
      case '"': return this.string();
      //white space
      case ' ':
      case '\t':
      case '\r':
      case '\n':
         return this.whitespace();
    }
    if (/\d/.test(ch)) return this.number();

    if (/[A-Za-z_]/.test(ch)) return this.identifier();

    throw new Error(`Unexpected character '${ch}' at ${this.line}:${this.col}`);
}
}