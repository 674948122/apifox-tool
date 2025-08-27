import { Token, TokenType, ASTNode, ClassNode, FieldNode, MethodNode, AnnotationNode, ParameterNode, ParseError } from '../types';

/**
 * Java代码语法分析器
 * 将tokens构建为AST
 */
export class JavaParser {
  private tokens: Token[];
  private current: number = 0;
  private errors: ParseError[] = [];
  private warnings: string[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * 解析tokens为AST
   */
  parse(): { ast: ASTNode | null; errors: ParseError[]; warnings: string[] } {
    this.current = 0;
    this.errors = [];
    this.warnings = [];

    try {
      const ast = this.parseCompilationUnit();
      return { ast, errors: this.errors, warnings: this.warnings };
    } catch (error) {
      this.errors.push({
        message: error instanceof Error ? error.message : 'Unknown parsing error',
        line: this.peek().line,
        column: this.peek().column,
        type: 'syntax'
      });
      return { ast: null, errors: this.errors, warnings: this.warnings };
    }
  }

  private parseCompilationUnit(): ASTNode {
    const classes: ClassNode[] = [];
    
    // 跳过package声明和import语句
    this.skipPackageAndImports();
    
    while (!this.isAtEnd()) {
      const classNode = this.parseClassDeclaration();
      if (classNode) {
        classes.push(classNode);
      }
    }

    return {
      type: 'CompilationUnit',
      children: classes
    };
  }

  private skipPackageAndImports(): void {
    // 简单跳过package和import语句
    while (!this.isAtEnd() && 
           this.peek().value !== 'public' && 
           this.peek().value !== 'private' && 
           this.peek().value !== 'protected' && 
           this.peek().value !== 'class' &&
           this.peek().value !== 'interface' &&
           this.peek().value !== 'enum') {
      this.advance();
    }
  }

  private parseClassDeclaration(): ClassNode | null {
    const comment = this.extractPrecedingComment();
    const annotations = this.parseAnnotations();
    const modifiers = this.parseModifiers();

    if (!this.match(TokenType.CLASS)) {
      if (this.match(TokenType.INTERFACE) || this.match(TokenType.ENUM)) {
        // 暂时跳过接口和枚举的详细解析
        this.skipToNextClass();
        return null;
      }
      this.error('Expected class declaration');
      return null;
    }

    if (!this.check(TokenType.IDENTIFIER)) {
      this.error('Expected class name');
      return null;
    }

    const className = this.advance().value;

    // 跳过extends和implements子句
    this.skipExtendsAndImplements();

    if (!this.match(TokenType.LEFT_BRACE)) {
      this.error('Expected "{" after class name');
      return null;
    }

    const fields: FieldNode[] = [];
    const methods: MethodNode[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const member = this.parseClassMember();
      if (member) {
        if (member.type === 'FieldDeclaration') {
          fields.push(member as FieldNode);
        } else if (member.type === 'MethodDeclaration') {
          methods.push(member as MethodNode);
        }
      }
    }

    if (!this.match(TokenType.RIGHT_BRACE)) {
      this.error('Expected "}" after class body');
    }

    return {
      type: 'ClassDeclaration',
      name: className,
      modifiers,
      fields,
      methods,
      comment,
      children: [...fields, ...methods]
    };
  }

  private parseClassMember(): FieldNode | MethodNode | null {
    // 跳过空白字符和换行符
    while (this.check(TokenType.WHITESPACE) || this.check(TokenType.NEWLINE)) {
      this.advance();
    }
    
    // 如果到达类结束或文件结束，返回null
    if (this.check(TokenType.RIGHT_BRACE) || this.isAtEnd()) {
      return null;
    }
    
    const comment = this.consumePrecedingComment();
    const annotations = this.parseAnnotations();
    const modifiers = this.parseModifiers();

    // 保存当前位置，用于回溯
    const checkpoint = this.current;

    try {
      // 尝试解析类型
      const type = this.parseType();
      if (!type) {
        // 将错误转为警告，继续处理下一个成员
        this.warning(`Failed to parse type at position ${this.current}, skipping member`);
        this.current = checkpoint;
        this.skipToNextMember();
        return null;
      }

      if (!this.check(TokenType.IDENTIFIER)) {
        // 将错误转为警告，继续处理下一个成员
        this.warning(`Expected identifier after type '${type}', got '${this.peek().value}', skipping member`);
        this.current = checkpoint;
        this.skipToNextMember();
        return null;
      }

      const name = this.advance().value;

      // 检查是否是方法（有括号）
      if (this.check(TokenType.LEFT_PAREN)) {
        return this.parseMethodDeclaration(name, type, modifiers, annotations, comment);
      } else {
        return this.parseFieldDeclaration(name, type, modifiers, annotations, comment);
      }
    } catch (error) {
      // 将解析错误转为警告，继续处理
      this.warning(`Parse error in class member: ${error instanceof Error ? error.message : String(error)}`);
      this.current = checkpoint;
      this.skipToNextMember();
      return null;
    }
  }

  private parseFieldDeclaration(
    name: string, 
    fieldType: string, 
    modifiers: string[], 
    annotations: AnnotationNode[], 
    comment?: string
  ): FieldNode {
    let defaultValue: string | undefined;

    // 检查是否有默认值
    if (this.match(TokenType.EQUALS)) {
      defaultValue = this.parseDefaultValue();
    }

    // 检查行内注释（在分号之前）
    let inlineComment: string | undefined;
    if (this.check(TokenType.SINGLE_LINE_COMMENT)) {
      inlineComment = this.advance().value;
    }

    this.consume(TokenType.SEMICOLON, 'Expected ";" after field declaration');

    // 如果没有前置注释但有行内注释，使用行内注释
    const finalComment = comment || inlineComment;

    return {
      type: 'FieldDeclaration',
      name,
      fieldType,
      modifiers,
      annotations,
      comment: finalComment,
      defaultValue
    };
  }

  private parseMethodDeclaration(
    name: string,
    returnType: string,
    modifiers: string[],
    annotations: AnnotationNode[],
    comment?: string
  ): MethodNode {
    this.consume(TokenType.LEFT_PAREN, 'Expected "(" after method name');
    
    const parameters: ParameterNode[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        const param = this.parseParameter();
        if (param) {
          parameters.push(param);
        }
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after parameters');
    
    // 跳过方法体
    this.skipMethodBody();

    return {
      type: 'MethodDeclaration',
      name,
      returnType,
      parameters,
      modifiers,
      annotations,
      comment
    };
  }

  private parseParameter(): ParameterNode | null {
    const parameterType = this.parseType();
    if (!parameterType) return null;

    if (!this.check(TokenType.IDENTIFIER)) {
      this.error('Expected parameter name');
      return null;
    }

    const name = this.advance().value;

    return {
      type: 'Parameter',
      name,
      parameterType
    };
  }

  private parseAnnotations(): AnnotationNode[] {
    const annotations: AnnotationNode[] = [];
    
    while (this.match(TokenType.AT)) {
      if (!this.check(TokenType.IDENTIFIER)) {
        this.error('Expected annotation name');
        continue;
      }

      const name = this.advance().value;
      let parameters: Record<string, any> | undefined;

      // 解析注解参数
      if (this.match(TokenType.LEFT_PAREN)) {
        parameters = this.parseAnnotationParameters();
        this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after annotation parameters');
      }

      annotations.push({
        type: 'Annotation',
        name,
        parameters
      });
    }

    return annotations;
  }

  private parseAnnotationParameters(): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    if (this.check(TokenType.RIGHT_PAREN)) {
      return parameters;
    }
    
    try {
      do {
        // 跳过空白字符
        while (this.check(TokenType.WHITESPACE) || this.check(TokenType.NEWLINE)) {
          this.advance();
        }
        
        // 检查是否到达右括号
        if (this.check(TokenType.RIGHT_PAREN)) {
          break;
        }
        
        // 检查是否是键值对参数（如 min = 2）
        if (this.check(TokenType.IDENTIFIER)) {
          const lookahead = this.current + 1 < this.tokens.length ? this.tokens[this.current + 1] : null;
          if (lookahead && lookahead.type === TokenType.EQUALS) {
            // 键值对参数
            const key = this.advance().value;
            this.consume(TokenType.EQUALS, 'Expected "=" after parameter name');
            const value = this.parseAnnotationValue();
            parameters[key] = value;
          } else {
            // 单个值参数（如 @Min(5) 或 @NotNull）
            const value = this.parseAnnotationValue();
            parameters.value = value;
          }
        } else {
          // 直接值参数（如字符串或数字）
          const value = this.parseAnnotationValue();
          parameters.value = value;
        }
        
        // 跳过空白字符
        while (this.check(TokenType.WHITESPACE) || this.check(TokenType.NEWLINE)) {
          this.advance();
        }
        
      } while (this.match(TokenType.COMMA));
    } catch (error) {
      // 如果解析失败，尝试跳过到右括号
      while (!this.check(TokenType.RIGHT_PAREN) && !this.isAtEnd()) {
        this.advance();
      }
    }
    
    return parameters;
  }

  private parseAnnotationValue(): any {
    if (this.check(TokenType.STRING_LITERAL)) {
      const value = this.advance().value;
      return value.slice(1, -1); // 移除引号
    } else if (this.check(TokenType.NUMBER_LITERAL)) {
      const value = this.advance().value;
      return parseFloat(value);
    } else if (this.check(TokenType.IDENTIFIER)) {
      let value = this.advance().value;
      
      // 处理 .class 语法（如 MocDurationTypeEnum.class）
      if (this.match(TokenType.DOT)) {
        if (this.check(TokenType.CLASS)) {
          this.advance(); // 消费 CLASS token
          value += '.class';
        } else {
          // 回退DOT token，因为这可能不是.class语法
          this.current--;
        }
      }
      
      return value;
    } else if (this.check(TokenType.TRUE) || this.check(TokenType.FALSE)) {
      return this.advance().value === 'true';
    }
    
    this.error('Expected annotation parameter value');
    return null;
  }

  private parseModifiers(): string[] {
    const modifiers: string[] = [];
    
    while (this.check(TokenType.PUBLIC) || 
           this.check(TokenType.PRIVATE) || 
           this.check(TokenType.PROTECTED) ||
           this.check(TokenType.STATIC) ||
           this.check(TokenType.FINAL)) {
      modifiers.push(this.advance().value);
    }

    return modifiers;
  }

  private parseType(): string | null {
    if (!this.check(TokenType.IDENTIFIER) && !this.isPrimitiveType()) {
      return null;
    }

    let type = this.advance().value;

    // 处理泛型
    if (this.match(TokenType.LESS_THAN)) {
      type += '<';
      let depth = 1;
      while (depth > 0 && !this.isAtEnd()) {
        const token = this.advance();
        type += token.value;
        if (token.type === TokenType.LESS_THAN) depth++;
        if (token.type === TokenType.GREATER_THAN) depth--;
      }
    }

    // 处理数组
    while (this.match(TokenType.LEFT_BRACKET)) {
      type += '[';
      this.consume(TokenType.RIGHT_BRACKET, 'Expected "]" after "["');
      type += ']';
    }

    return type;
  }

  private isPrimitiveType(): boolean {
    return this.check(TokenType.INT) ||
           this.check(TokenType.LONG) ||
           this.check(TokenType.FLOAT) ||
           this.check(TokenType.DOUBLE) ||
           this.check(TokenType.BOOLEAN) ||
           this.check(TokenType.CHAR) ||
           this.check(TokenType.BYTE) ||
           this.check(TokenType.SHORT);
  }

  private parseDefaultValue(): string {
    let value = '';
    let depth = 0;
    
    while (!this.isAtEnd()) {
      const token = this.peek();
      
      if (token.type === TokenType.SEMICOLON && depth === 0) {
        break;
      }
      
      if (token.type === TokenType.LEFT_BRACE || 
          token.type === TokenType.LEFT_PAREN ||
          token.type === TokenType.LEFT_BRACKET) {
        depth++;
      } else if (token.type === TokenType.RIGHT_BRACE ||
                 token.type === TokenType.RIGHT_PAREN ||
                 token.type === TokenType.RIGHT_BRACKET) {
        depth--;
      }
      
      value += this.advance().value;
    }
    
    return value.trim();
  }

  private extractPrecedingComment(): string | undefined {
    // 向前查找注释，但不移动当前位置
    let searchIndex = this.current - 1;
    
    // 跳过空白字符和换行符
    while (searchIndex >= 0 && 
           (this.tokens[searchIndex].type === TokenType.WHITESPACE ||
            this.tokens[searchIndex].type === TokenType.NEWLINE)) {
      searchIndex--;
    }

    // 检查是否找到注释
    if (searchIndex >= 0) {
      const token = this.tokens[searchIndex];
      if (token.type === TokenType.JAVADOC_COMMENT ||
          token.type === TokenType.MULTI_LINE_COMMENT ||
          token.type === TokenType.SINGLE_LINE_COMMENT) {
        return token.value;
      }
    }

    return undefined;
  }
  
  private consumePrecedingComment(): string | undefined {
    // 查找并消费前面的注释
    let comment: string | undefined;
    
    // 跳过空白字符和换行符
    while (this.check(TokenType.WHITESPACE) || this.check(TokenType.NEWLINE)) {
      this.advance();
    }
    
    // 检查是否有注释
    if (this.check(TokenType.JAVADOC_COMMENT) ||
        this.check(TokenType.MULTI_LINE_COMMENT) ||
        this.check(TokenType.SINGLE_LINE_COMMENT)) {
      comment = this.advance().value;
      
      // 跳过注释后的空白字符
      while (this.check(TokenType.WHITESPACE) || this.check(TokenType.NEWLINE)) {
        this.advance();
      }
    }
    
    return comment;
  }

  private skipToNextClass(): void {
    let braceCount = 0;
    while (!this.isAtEnd()) {
      const token = this.advance();
      if (token.type === TokenType.LEFT_BRACE) {
        braceCount++;
      } else if (token.type === TokenType.RIGHT_BRACE) {
        braceCount--;
        if (braceCount === 0) {
          break;
        }
      }
    }
  }

  private skipToNextMember(): void {
    while (!this.isAtEnd() && 
           this.peek().type !== TokenType.SEMICOLON &&
           this.peek().type !== TokenType.RIGHT_BRACE) {
      this.advance();
    }
    if (this.check(TokenType.SEMICOLON)) {
      this.advance();
    }
  }

  private skipExtendsAndImplements(): void {
    while (!this.isAtEnd() && 
           !this.check(TokenType.LEFT_BRACE)) {
      this.advance();
    }
  }

  private skipMethodBody(): void {
    if (this.match(TokenType.LEFT_BRACE)) {
      let braceCount = 1;
      while (braceCount > 0 && !this.isAtEnd()) {
        const token = this.advance();
        if (token.type === TokenType.LEFT_BRACE) {
          braceCount++;
        } else if (token.type === TokenType.RIGHT_BRACE) {
          braceCount--;
        }
      }
    } else {
      // 抽象方法或接口方法
      this.consume(TokenType.SEMICOLON, 'Expected ";" after abstract method');
    }
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    this.error(message);
    return this.peek();
  }

  private error(message: string): void {
    const token = this.peek();
    this.errors.push({
      message,
      line: token.line,
      column: token.column,
      type: 'syntax'
    });
  }

  private warning(message: string): void {
    this.warnings.push(message);
  }
}