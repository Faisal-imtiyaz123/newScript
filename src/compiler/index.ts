import { Interpreter } from "./interpreter/Interpreter";
import { Lexer } from "./lexer/Lexer";
import { Parser } from "./parser/Parser";


export function runSource(code: string, onOutput?: (s: string) => void) {
  const lexer = new Lexer(code);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parseProgram();
  console.log(ast)
  const outputs: string[] = [];
  const interpreter = new Interpreter((s) => { outputs.push(s); onOutput?.(s); });
  interpreter.run(ast);
  return { ast, outputs };
}
