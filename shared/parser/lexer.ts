import { Token, TokenType } from '../types';

/**
 * Java代码词法分析器
 * 将Java源代码分解为tokens
 */
export class JavaLexer {
  private code: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  // Java关键字映射
  private readonly keywords: Map<string, TokenType> = new Map([
    ['public', TokenType.PUBLIC],
    ['private', TokenType.PRIVATE],
    ['protected', TokenType.PROTECTED],
    ['class', TokenType.CLASS],
    ['interface', TokenType.INTERFACE],
    ['enum', TokenType.ENUM],
    ['extends', TokenType.EXTENDS],
    ['implements', TokenType.IMPLEMENTS],
    ['static', TokenType.STATIC],
    ['final', TokenType.FINAL],
    ['int', TokenType.INT],
    ['long', TokenType.LONG],
    ['float', TokenType.FLOAT],
    ['double', TokenType.DOUBLE],
    ['boolean', TokenType.BOOLEAN],
    ['char', TokenType.CHAR],
    ['byte', TokenType.BYTE],
    ['short', TokenType.SHORT],
    ['true', TokenType.TRUE],
    ['false', TokenType.FALSE]
  ]);

  constructor(code: string) {
    this.code = code;
  }

  /**
   * 执行词法分析
   */
  tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (this.position < this.code.length) {
      this.scanToken();
    }

    this.addToken(TokenType.EOF, '');
    return this.tokens.filter(token => 
      token.type !== TokenType.WHITESPACE && 
      token.type !== TokenType.NEWLINE
    );
  }

  private scanToken(): void {
    const char = this.advance();

    switch (char) {
      case ' ':
      case '\r':
      case '\t':
        this.addToken(TokenType.WHITESPACE, char);
        break;
      case '\n':
        this.addToken(TokenType.NEWLINE, char);
        this.line++;
        this.column = 1;
        break;
      case ';':
        this.addToken(TokenType.SEMICOLON, char);
        break;
      case ',':
        this.addToken(TokenType.COMMA, char);
        break;
      case '.':
        this.addToken(TokenType.DOT, char);
        break;
      case '{':
        this.addToken(TokenType.LEFT_BRACE, char);
        break;
      case '}':
        this.addToken(TokenType.RIGHT_BRACE, char);
        break;
      case '(':
        this.addToken(TokenType.LEFT_PAREN, char);
        break;
      case ')':
        this.addToken(TokenType.RIGHT_PAREN, char);
        break;
      case '[':
        this.addToken(TokenType.LEFT_BRACKET, char);
        break;
      case ']':
        this.addToken(TokenType.RIGHT_BRACKET, char);
        break;
      case '<':
        this.addToken(TokenType.LESS_THAN, char);
        break;
      case '>':
        this.addToken(TokenType.GREATER_THAN, char);
        break;
      case '=':
        this.addToken(TokenType.EQUALS, char);
        break;
      case '@':
        this.addToken(TokenType.AT, char);
        break;
      case '/':
        if (this.match('/')) {
          this.scanSingleLineComment();
        } else if (this.match('*')) {
          this.scanMultiLineComment();
        } else {
          // 处理除法运算符或其他情况
          this.addToken(TokenType.IDENTIFIER, char);
        }
        break;
      case '"':
        this.scanString();
        break;
      default:
        if (this.isDigit(char)) {
          this.scanNumber();
        } else if (this.isAlpha(char)) {
          this.scanIdentifier();
        } else {
          // 忽略未知字符
        }
        break;
    }
  }

  private scanSingleLineComment(): void {
    const start = this.position - 2; // 包含 '//'
    while (this.peek() !== '\n' && !this.isAtEnd()) {
      this.advance();
    }
    const value = this.code.substring(start, this.position);
    this.addToken(TokenType.SINGLE_LINE_COMMENT, value);
  }

  private scanMultiLineComment(): void {
    const start = this.position - 2; // 包含 '/*'
    let isJavadoc = false;
    
    // 检查是否是Javadoc注释
    if (this.peek() === '*') {
      isJavadoc = true;
    }

    while (this.peek() !== '*' || this.peekNext() !== '/') {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      if (this.isAtEnd()) break;
      this.advance();
    }

    if (!this.isAtEnd()) {
      this.advance(); // '*'
      this.advance(); // '/'
    }

    const value = this.code.substring(start, this.position);
    const tokenType = isJavadoc ? TokenType.JAVADOC_COMMENT : TokenType.MULTI_LINE_COMMENT;
    this.addToken(tokenType, value);
  }

  private scanString(): void {
    const start = this.position - 1;
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
        this.column = 1;
      }
      if (this.peek() === '\\') {
        this.advance(); // 跳过转义字符
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      // 未闭合的字符串
      return;
    }

    this.advance(); // 闭合的 '"'
    const value = this.code.substring(start, this.position);
    this.addToken(TokenType.STRING_LITERAL, value);
  }

  private scanNumber(): void {
    const start = this.position - 1;
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // 查找小数点
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance(); // 消费 '.'
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = this.code.substring(start, this.position);
    this.addToken(TokenType.NUMBER_LITERAL, value);
  }

  private scanIdentifier(): void {
    const start = this.position - 1;
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const value = this.code.substring(start, this.position);
    const tokenType = this.keywords.get(value) || TokenType.IDENTIFIER;
    this.addToken(tokenType, value);
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_' || char === '$';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private advance(): string {
    const char = this.code.charAt(this.position);
    this.position++;
    this.column++;
    return char;
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.code.charAt(this.position) !== expected) return false;
    this.position++;
    this.column++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.code.charAt(this.position);
  }

  private peekNext(): string {
    if (this.position + 1 >= this.code.length) return '\0';
    return this.code.charAt(this.position + 1);
  }

  private isAtEnd(): boolean {
    return this.position >= this.code.length;
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      line: this.line,
      column: this.column - value.length
    });
  }
}