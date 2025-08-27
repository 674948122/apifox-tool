// Java解析相关类型
export interface JavaClass {
  className: string;
  packageName?: string;
  classComment?: string;
  fields: JavaField[];
  methods?: JavaMethod[];
}

export interface JavaField {
  name: string;
  type: string;
  comment?: string;
  isPrivate: boolean;
  isRequired: boolean;
  annotations: JavaAnnotation[];
  defaultValue?: any;
}

export interface JavaMethod {
  name: string;
  returnType: string;
  parameters: JavaParameter[];
  comment?: string;
  annotations: JavaAnnotation[];
}

export interface JavaParameter {
  name: string;
  type: string;
}

export interface JavaAnnotation {
  name: string;
  parameters?: Record<string, any>;
}

// Apifox规范类型
export interface ApifoxSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';
  properties?: Record<string, ApifoxProperty>;
  items?: ApifoxSchema;
  required?: string[];
  description?: string;
  example?: any;
}

export interface ApifoxProperty {
  type: string;
  description?: string;
  example?: any;
  format?: string;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: ApifoxSchema;
  properties?: Record<string, ApifoxProperty>;
  additionalProperties?: ApifoxProperty | boolean;
}

// 解析配置选项
export interface ParseOptions {
  includePrivateFields?: boolean;
  generateExamples?: boolean;
  commentStyle?: 'javadoc' | 'inline';
  requiredFieldStrategy?: 'annotation' | 'all' | 'none';
}

// API响应类型
export interface ParseResponse {
  success: boolean;
  data?: ApifoxSchema;
  error?: string;
  warnings?: string[];
}

export interface Example {
  id: string;
  title: string;
  description: string;
  javaCode: string;
  expectedOutput: ApifoxSchema;
}

// 词法分析相关类型
export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export enum TokenType {
  // 关键字
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED',
  CLASS = 'CLASS',
  INTERFACE = 'INTERFACE',
  ENUM = 'ENUM',
  EXTENDS = 'EXTENDS',
  IMPLEMENTS = 'IMPLEMENTS',
  STATIC = 'STATIC',
  FINAL = 'FINAL',
  
  // 基本类型
  INT = 'INT',
  LONG = 'LONG',
  FLOAT = 'FLOAT',
  DOUBLE = 'DOUBLE',
  BOOLEAN = 'BOOLEAN',
  CHAR = 'CHAR',
  BYTE = 'BYTE',
  SHORT = 'SHORT',
  
  // 布尔字面量
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  
  // 标识符和字面量
  IDENTIFIER = 'IDENTIFIER',
  STRING_LITERAL = 'STRING_LITERAL',
  NUMBER_LITERAL = 'NUMBER_LITERAL',
  
  // 符号
  SEMICOLON = 'SEMICOLON',
  COMMA = 'COMMA',
  DOT = 'DOT',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  EQUALS = 'EQUALS',
  AT = 'AT',
  
  // 注释
  SINGLE_LINE_COMMENT = 'SINGLE_LINE_COMMENT',
  MULTI_LINE_COMMENT = 'MULTI_LINE_COMMENT',
  JAVADOC_COMMENT = 'JAVADOC_COMMENT',
  
  // 特殊
  WHITESPACE = 'WHITESPACE',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF'
}

// AST节点类型
export interface ASTNode {
  type: string;
  children?: ASTNode[];
  value?: string;
  line?: number;
  column?: number;
}

export interface ClassNode extends ASTNode {
  type: 'ClassDeclaration';
  name: string;
  modifiers: string[];
  fields: FieldNode[];
  methods: MethodNode[];
  comment?: string;
}

export interface FieldNode extends ASTNode {
  type: 'FieldDeclaration';
  name: string;
  fieldType: string;
  modifiers: string[];
  annotations: AnnotationNode[];
  comment?: string;
  defaultValue?: string;
}

export interface MethodNode extends ASTNode {
  type: 'MethodDeclaration';
  name: string;
  returnType: string;
  parameters: ParameterNode[];
  modifiers: string[];
  annotations: AnnotationNode[];
  comment?: string;
}

export interface ParameterNode extends ASTNode {
  type: 'Parameter';
  name: string;
  parameterType: string;
}

export interface AnnotationNode extends ASTNode {
  type: 'Annotation';
  name: string;
  parameters?: Record<string, any>;
}

// 错误类型
export interface ParseError {
  message: string;
  line: number;
  column: number;
  type: 'syntax' | 'semantic' | 'warning';
}