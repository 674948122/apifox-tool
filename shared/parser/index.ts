import { JavaLexer } from './lexer';
import { JavaParser } from './parser';
import { JavaClass, JavaField, JavaAnnotation, ParseOptions, ParseError, ClassNode, FieldNode, AnnotationNode } from '../types';

/**
 * Java代码解析引擎主入口
 */
export class JavaCodeParser {
  /**
   * 解析Java代码为JavaClass对象
   */
  static parse(javaCode: string, options: ParseOptions = {}): {
    javaClass: JavaClass | null;
    errors: ParseError[];
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    try {
      // 1. 词法分析
      const lexer = new JavaLexer(javaCode);
      const tokens = lexer.tokenize();
      
      if (tokens.length === 0) {
        return {
          javaClass: null,
          errors: [{
            message: 'No valid tokens found in the input code',
            line: 1,
            column: 1,
            type: 'syntax'
          }],
          warnings
        };
      }

      // 2. 语法分析
      const parser = new JavaParser(tokens);
      const { ast, errors, warnings: parseWarnings } = parser.parse();
      
      // 合并解析器的警告
      warnings.push(...parseWarnings);
      
      if (!ast || errors.length > 0) {
        return {
          javaClass: null,
          errors,
          warnings
        };
      }

      // 3. 提取类信息
      const javaClass = this.extractClassInfo(ast, options, warnings);
      
      return {
        javaClass,
        errors: [],
        warnings
      };
    } catch (error) {
      return {
        javaClass: null,
        errors: [{
          message: error instanceof Error ? error.message : 'Unknown parsing error',
          line: 1,
          column: 1,
          type: 'syntax'
        }],
        warnings
      };
    }
  }

  /**
   * 从AST提取类信息
   */
  private static extractClassInfo(
    ast: any, 
    options: ParseOptions, 
    warnings: string[]
  ): JavaClass | null {
    // 查找第一个类声明
    const classNode = this.findClassNode(ast);
    if (!classNode) {
      warnings.push('No class declaration found in the code');
      return null;
    }

    const fields = this.extractFields(classNode.fields || [], options, warnings);
    
    return {
      className: classNode.name,
      packageName: undefined, // 暂不解析package
      classComment: this.extractComment(classNode.comment),
      fields,
      methods: [] // 暂不需要方法信息
    };
  }

  /**
   * 查找类节点
   */
  private static findClassNode(node: any): ClassNode | null {
    if (node.type === 'ClassDeclaration') {
      return node as ClassNode;
    }
    
    if (node.children) {
      for (const child of node.children) {
        const classNode = this.findClassNode(child);
        if (classNode) {
          return classNode;
        }
      }
    }
    
    return null;
  }

  /**
   * 提取字段信息
   */
  private static extractFields(
    fieldNodes: FieldNode[], 
    options: ParseOptions, 
    warnings: string[]
  ): JavaField[] {
    const fields: JavaField[] = [];
    
    for (const fieldNode of fieldNodes) {
      const isPrivate = fieldNode.modifiers.includes('private');
      
      // 根据配置决定是否包含私有字段
      if (!options.includePrivateFields && isPrivate) {
        continue;
      }
      
      const annotations = this.extractAnnotations(fieldNode.annotations || []);
      const comment = this.extractComment(fieldNode.comment);
      const isRequired = this.determineRequired(fieldNode, annotations, comment, options);
      
      fields.push({
        name: fieldNode.name,
        type: fieldNode.fieldType,
        comment,
        isPrivate,
        isRequired,
        annotations,
        defaultValue: fieldNode.defaultValue
      });
    }
    
    return fields;
  }

  /**
   * 提取注解信息
   */
  private static extractAnnotations(annotationNodes: AnnotationNode[]): JavaAnnotation[] {
    return annotationNodes.map(node => ({
      name: node.name,
      parameters: node.parameters
    }));
  }

  /**
   * 提取注释内容
   */
  private static extractComment(comment?: string): string | undefined {
    if (!comment) return undefined;
    
    // 处理Javadoc注释
    if (comment.startsWith('/**')) {
      return comment
        .replace(/^\/\*\*/, '')
        .replace(/\*\/$/, '')
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => line && !line.startsWith('@'))
        .join(' ')
        .trim();
    }
    
    // 处理单行注释
    if (comment.startsWith('//')) {
      return comment.replace(/^\/\/\s?/, '').trim();
    }
    
    // 处理多行注释
    if (comment.startsWith('/*')) {
      return comment
        .replace(/^\/\*/, '')
        .replace(/\*\/$/, '')
        .trim();
    }
    
    return comment.trim();
  }

  /**
   * 判断字段是否必填
   */
  private static determineRequired(
    fieldNode: FieldNode,
    annotations: JavaAnnotation[],
    comment?: string,
    options: ParseOptions = {}
  ): boolean {
    const strategy = options.requiredFieldStrategy || 'annotation';
    
    // 1. 注解优先
    const requiredAnnotations = ['NotNull', 'NotEmpty', 'NotBlank'];
    const hasRequiredAnnotation = annotations.some(ann => 
      requiredAnnotations.includes(ann.name)
    );
    
    if (hasRequiredAnnotation) {
      return true;
    }
    
    // 2. 注释关键词
    if (comment) {
      const requiredKeywords = ['必填', '必须', 'required', 'Required', 'REQUIRED'];
      const hasRequiredKeyword = requiredKeywords.some(keyword => 
        comment.includes(keyword)
      );
      
      if (hasRequiredKeyword) {
        return true;
      }
      
      // 检查可选关键词
      const optionalKeywords = ['可选', '选填', 'optional', 'Optional', 'OPTIONAL'];
      const hasOptionalKeyword = optionalKeywords.some(keyword => 
        comment.includes(keyword)
      );
      
      if (hasOptionalKeyword) {
        return false;
      }
    }
    
    // 3. 类型判断（基本数据类型默认required）
    const primitiveTypes = ['int', 'long', 'float', 'double', 'boolean', 'char', 'byte', 'short'];
    const isPrimitive = primitiveTypes.includes(fieldNode.fieldType);
    
    if (isPrimitive) {
      return true;
    }
    
    // 4. 根据策略决定
    switch (strategy) {
      case 'all':
        return true;
      case 'none':
        return false;
      case 'annotation':
      default:
        return false;
    }
  }
}

// 导出相关类型和工具
export { JavaLexer } from './lexer';
export { JavaParser } from './parser';
export * from '../types';