import { JavaClass, JavaField, JavaAnnotation, ApifoxSchema, ApifoxProperty, ParseOptions } from '../types';

/**
 * Apifox格式转换器
 * 将Java类转换为符合Apifox规范的JSON Schema
 */
export class ApifoxConverter {
  private options: ParseOptions;
  private processedTypes: Set<string> = new Set();

  constructor(options: ParseOptions = {}) {
    this.options = {
      includePrivateFields: true,
      generateExamples: false,
      commentStyle: 'javadoc',
      requiredFieldStrategy: 'annotation',
      ...options
    };
  }

  /**
   * 转换Java类为Apifox Schema
   */
  convert(javaClass: JavaClass): ApifoxSchema {
    this.processedTypes.clear();
    
    const schema: ApifoxSchema = {
      type: 'object',
      properties: {},
      required: [],
      description: javaClass.classComment || `${javaClass.className}实体类`
    };

    // 转换字段
    for (const field of javaClass.fields) {
      if (this.shouldIncludeField(field)) {
        const propertyName = this.getPropertyName(field);
        schema.properties![propertyName] = this.convertField(field);
        
        if (field.isRequired) {
          schema.required!.push(propertyName);
        }
      }
    }

    // 不生成示例值

    return schema;
  }

  /**
   * 转换字段为Apifox属性
   */
  private convertField(field: JavaField): ApifoxProperty {
    const mappedType = this.mapJavaTypeToApifoxType(field.type);
    
    // 生成描述：优先级顺序为枚举 > 实体类 > 普通字段
    let description = field.comment || this.generateFieldDescription(field.name, field.type, mappedType);
    
    // 检查是否有@EnumDescMapping注解，如果有则添加"枚举："前缀
    const hasEnumDescMapping = field.annotations.some(annotation => annotation.name === 'EnumDescMapping');
    if (hasEnumDescMapping) {
      description = `枚举：${description}`;
    }
    // 如果是自定义实体类类型，且没有注释，或者注释不是以"实体类："开头，则使用实体类格式
    else if (mappedType === 'object' && this.isCustomEntityType(field.type)) {
      const baseType = field.type.replace(/<.*>/, '').replace(/\[\]$/, '');
      description = `实体类：${baseType}`;
    }
    
    const property: ApifoxProperty = {
      type: mappedType,
      description
    };

    // 处理格式
    const format = this.getFieldFormat(field.type, field.annotations);
    if (format) {
      property.format = format;
    }

    // 处理枚举
    if (this.isEnumType(field.type)) {
      property.enum = this.extractEnumValues(field.type);
    }

    // 处理验证注解
    this.applyValidationAnnotations(property, field.annotations);

    // 处理数组类型
    if (this.isArrayType(field.type)) {
      property.type = 'array';
      property.items = this.getArrayItemSchema(field.type);
    }

    // 处理对象类型
    if (this.isObjectType(field.type)) {
      property.type = 'object';
      // 对于复杂对象，这里简化处理
      property.properties = {};
    }

    // 处理Map类型
    if (this.isMapType(field.type)) {
      property.type = 'object';
      property.additionalProperties = this.getMapValueSchema(field.type);
    }

    // 不生成示例值

    return property;
  }

  /**
   * 映射Java类型到Apifox类型
   */
  private mapJavaTypeToApifoxType(javaType: string): string {
    // 移除泛型参数
    const baseType = javaType.replace(/<.*>/, '').replace(/\[\]$/, '');
    
    const typeMapping: Record<string, string> = {
      // 基本类型
      'int': 'integer',
      'Integer': 'integer',
      'long': 'integer',
      'Long': 'integer',
      'float': 'number',
      'Float': 'number',
      'double': 'number',
      'Double': 'number',
      'boolean': 'boolean',
      'Boolean': 'boolean',
      'char': 'string',
      'Character': 'string',
      'byte': 'integer',
      'Byte': 'integer',
      'short': 'integer',
      'Short': 'integer',
      
      // 常用类型
      'String': 'string',
      'BigDecimal': 'string',
      'BigInteger': 'string',
      'Date': 'string',
      'LocalDate': 'string',
      'LocalDateTime': 'string',
      'LocalTime': 'string',
      'Instant': 'string',
      'ZonedDateTime': 'string',
      'OffsetDateTime': 'string',
      
      // 集合类型
      'List': 'array',
      'ArrayList': 'array',
      'LinkedList': 'array',
      'Set': 'array',
      'HashSet': 'array',
      'LinkedHashSet': 'array',
      'TreeSet': 'array',
      
      // Map类型
      'Map': 'object',
      'HashMap': 'object',
      'LinkedHashMap': 'object',
      'TreeMap': 'object'
    };

    // 对于未知类型，映射为object类型
    return typeMapping[baseType] || 'object';
  }

  /**
   * 获取字段格式
   */
  private getFieldFormat(javaType: string, annotations: JavaAnnotation[]): string | undefined {
    const baseType = javaType.replace(/<.*>/, '');
    
    // 检查注解中的格式信息
    for (const annotation of annotations) {
      if (annotation.name === 'JsonFormat' && annotation.parameters?.pattern) {
        if (annotation.parameters.pattern.includes('yyyy-MM-dd HH:mm:ss')) {
          return 'date-time';
        }
        if (annotation.parameters.pattern.includes('yyyy-MM-dd')) {
          return 'date';
        }
      }
      
      if (annotation.name === 'Email') {
        return 'email';
      }
    }
    
    // 根据类型推断格式
    const formatMapping: Record<string, string> = {
      'Date': 'date-time',
      'LocalDate': 'date',
      'LocalDateTime': 'date-time',
      'LocalTime': 'time',
      'Instant': 'date-time',
      'ZonedDateTime': 'date-time',
      'OffsetDateTime': 'date-time',
      'BigDecimal': 'decimal',
      'BigInteger': 'int64'
    };
    
    return formatMapping[baseType];
  }

  /**
   * 应用验证注解
   */
  private applyValidationAnnotations(property: ApifoxProperty, annotations: JavaAnnotation[]): void {
    for (const annotation of annotations) {
      switch (annotation.name) {
        case 'Size':
          if (annotation.parameters?.min !== undefined) {
            if (property.type === 'string') {
              property.minLength = annotation.parameters.min;
            } else if (property.type === 'array') {
              // 数组最小项数
            }
          }
          if (annotation.parameters?.max !== undefined) {
            if (property.type === 'string') {
              property.maxLength = annotation.parameters.max;
            } else if (property.type === 'array') {
              // 数组最大项数
            }
          }
          break;
          
        case 'Min':
        case 'DecimalMin':
          if (annotation.parameters?.value !== undefined) {
            property.minimum = annotation.parameters.value;
          }
          break;
          
        case 'Max':
        case 'DecimalMax':
          if (annotation.parameters?.value !== undefined) {
            property.maximum = annotation.parameters.value;
          }
          break;
          
        case 'Pattern':
          if (annotation.parameters?.regexp) {
            property.pattern = annotation.parameters.regexp;
          }
          break;
      }
    }
  }

  /**
   * 判断是否应该包含字段
   */
  private shouldIncludeField(field: JavaField): boolean {
    // 检查JsonIgnore注解
    const hasJsonIgnore = field.annotations.some(ann => ann.name === 'JsonIgnore');
    if (hasJsonIgnore) {
      return false;
    }
    
    // 根据配置决定是否包含私有字段
    if (!this.options.includePrivateFields && field.isPrivate) {
      return false;
    }
    
    return true;
  }

  /**
   * 获取属性名称
   */
  private getPropertyName(field: JavaField): string {
    // 检查JsonProperty注解
    const jsonProperty = field.annotations.find(ann => ann.name === 'JsonProperty');
    if (jsonProperty && jsonProperty.parameters?.value) {
      return jsonProperty.parameters.value;
    }
    
    return field.name;
  }

  /**
   * 判断是否为数组类型
   */
  private isArrayType(javaType: string): boolean {
    return javaType.includes('[]') || 
           javaType.startsWith('List<') ||
           javaType.startsWith('ArrayList<') ||
           javaType.startsWith('Set<') ||
           javaType.startsWith('HashSet<');
  }

  /**
   * 判断是否为Map类型
   */
  private isMapType(javaType: string): boolean {
    return javaType.startsWith('Map<') ||
           javaType.startsWith('HashMap<') ||
           javaType.startsWith('LinkedHashMap<');
  }

  /**
   * 判断是否为对象类型
   */
  private isObjectType(javaType: string): boolean {
    const primitiveTypes = ['int', 'Integer', 'long', 'Long', 'float', 'Float', 
                           'double', 'Double', 'boolean', 'Boolean', 'String', 
                           'char', 'Character', 'byte', 'Byte', 'short', 'Short',
                           'Date', 'LocalDate', 'LocalDateTime', 'BigDecimal'];
    
    const baseType = javaType.replace(/<.*>/, '').replace(/\[\]$/, '');
    return !primitiveTypes.includes(baseType) && 
           !this.isArrayType(javaType) && 
           !this.isMapType(javaType);
  }

  /**
   * 判断是否为枚举类型
   */
  private isEnumType(javaType: string): boolean {
    // 简化判断，实际应该从解析结果中获取
    return javaType.endsWith('Status') || 
           javaType.endsWith('Type') ||
           javaType.endsWith('Enum');
  }

  /**
   * 判断是否为自定义实体类型
   */
  private isCustomEntityType(javaType: string): boolean {
    const baseType = javaType.replace(/<.*>/, '').replace(/\[\]$/, '');
    
    // 已知的基础类型和常用类型
    const knownTypes = [
      // 基本类型
      'int', 'Integer', 'long', 'Long', 'float', 'Float', 'double', 'Double',
      'boolean', 'Boolean', 'char', 'Character', 'byte', 'Byte', 'short', 'Short',
      // 常用类型
      'String', 'BigDecimal', 'BigInteger',
      'Date', 'LocalDate', 'LocalDateTime', 'LocalTime', 'Instant', 'ZonedDateTime', 'OffsetDateTime',
      // 集合类型
      'List', 'ArrayList', 'LinkedList', 'Set', 'HashSet', 'LinkedHashSet', 'TreeSet',
      'Map', 'HashMap', 'LinkedHashMap', 'TreeMap'
    ];
    
    return !knownTypes.includes(baseType);
  }

  /**
   * 获取数组项Schema
   */
  private getArrayItemSchema(javaType: string): ApifoxSchema {
    // 提取泛型参数
    const match = javaType.match(/<(.+)>/);
    if (match) {
      const itemType = match[1];
      const mappedType = this.mapJavaTypeToApifoxType(itemType);
      let description = `${itemType}项`;
      
      // 如果是自定义实体类，添加"实体类："前缀
      if (mappedType === 'object') {
        const knownTypes = ['String', 'Date', 'LocalDate', 'LocalDateTime', 'BigDecimal', 'Map', 'HashMap', 'List', 'ArrayList', 'Set', 'HashSet'];
        if (!knownTypes.includes(itemType)) {
          description = `实体类：${itemType}`;
        }
      }
      
      return {
        type: mappedType as any,
        description
      };
    }
    
    // 处理数组类型
    if (javaType.endsWith('[]')) {
      const itemType = javaType.replace('[]', '');
      const mappedType = this.mapJavaTypeToApifoxType(itemType);
      let description = `${itemType}项`;
      
      // 如果是自定义实体类，添加"实体类："前缀
      if (mappedType === 'object') {
        const knownTypes = ['String', 'Date', 'LocalDate', 'LocalDateTime', 'BigDecimal', 'Map', 'HashMap', 'List', 'ArrayList', 'Set', 'HashSet'];
        if (!knownTypes.includes(itemType)) {
          description = `实体类：${itemType}`;
        }
      }
      
      return {
        type: mappedType as any,
        description
      };
    }
    
    return {
      type: 'string',
      description: '数组项'
    };
  }

  /**
   * 获取Map值Schema
   */
  private getMapValueSchema(javaType: string): ApifoxProperty {
    // 提取Map的值类型
    const match = javaType.match(/Map<\s*\w+\s*,\s*(.+)\s*>/);
    if (match) {
      const valueType = match[1];
      const mappedType = this.mapJavaTypeToApifoxType(valueType);
      let description = `${valueType}值`;
      
      // 如果是自定义实体类，添加"实体类："前缀
      if (mappedType === 'object') {
        const knownTypes = ['String', 'Date', 'LocalDate', 'LocalDateTime', 'BigDecimal', 'Map', 'HashMap', 'List', 'ArrayList', 'Set', 'HashSet'];
        if (!knownTypes.includes(valueType)) {
          description = `实体类：${valueType}`;
        }
      }
      
      return {
        type: mappedType,
        description
      };
    }
    
    return {
      type: 'string',
      description: 'Map值'
    };
  }

  /**
   * 提取枚举值
   */
  private extractEnumValues(javaType: string): string[] {
    // 简化处理，返回常见的枚举值
    const commonEnums: Record<string, string[]> = {
      'Gender': ['MALE', 'FEMALE'],
      'Status': ['ACTIVE', 'INACTIVE'],
      'OrderStatus': ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED']
    };
    
    return commonEnums[javaType] || ['VALUE1', 'VALUE2'];
  }

  /**
   * 生成字段描述
   */
  private generateFieldDescription(fieldName: string, javaType?: string, mappedType?: string): string {
    const descriptions: Record<string, string> = {
      'id': 'ID',
      'name': '姓名',
      'username': '用户名',
      'email': '邮箱地址',
      'phone': '手机号码',
      'age': '年龄',
      'gender': '性别',
      'address': '地址',
      'createTime': '创建时间',
      'updateTime': '更新时间',
      'status': '状态',
      'enabled': '是否启用',
      'deleted': '是否删除',
      'remark': '备注',
      'description': '描述'
    };
    
    // 如果有预定义的描述，使用预定义的
    if (descriptions[fieldName]) {
      return descriptions[fieldName];
    }
    
    // 如果是未知的自定义类型（映射为object），使用类名作为描述
    if (javaType && mappedType === 'object') {
      const baseType = javaType.replace(/<.*>/, '').replace(/\[\]$/, '');
      // 检查是否是已知的基础类型
      const knownTypes = ['String', 'Date', 'LocalDate', 'LocalDateTime', 'BigDecimal', 'Map', 'HashMap', 'List', 'ArrayList', 'Set', 'HashSet'];
      if (!knownTypes.includes(baseType)) {
        return `实体类：${baseType}`;
      }
    }
    
    return fieldName;
  }

  /**
   * 生成字段示例值
   */
  private generateFieldExample(field: JavaField): any {
    const fieldName = field.name.toLowerCase();
    const javaType = field.type;
    
    // 根据字段名生成语义化示例
    if (fieldName.includes('id')) {
      return this.mapJavaTypeToApifoxType(javaType) === 'integer' ? 1001 : 'ID001';
    }
    
    if (fieldName.includes('name')) {
      return '张三';
    }
    
    if (fieldName.includes('email')) {
      return 'user@example.com';
    }
    
    if (fieldName.includes('phone')) {
      return '13800138000';
    }
    
    if (fieldName.includes('age')) {
      return 25;
    }
    
    if (fieldName.includes('time')) {
      const format = this.getFieldFormat(javaType, field.annotations);
      if (format === 'date') {
        return '2024-01-01';
      }
      return '2024-01-01 10:00:00';
    }
    
    // 根据类型生成默认示例
    const apifoxType = this.mapJavaTypeToApifoxType(javaType);
    switch (apifoxType) {
      case 'integer':
        return 100;
      case 'number':
        return 99.99;
      case 'boolean':
        return true;
      case 'array':
        return ['示例1', '示例2'];
      case 'object':
        return {};
      default:
        return '示例值';
    }
  }

  /**
   * 生成Schema示例
   */
  private generateExample(schema: ApifoxSchema): any {
    const example: any = {};
    
    if (schema.properties) {
      for (const [key, property] of Object.entries(schema.properties)) {
        example[key] = property.example || this.getDefaultExampleByType(property.type);
      }
    }
    
    return example;
  }

  /**
   * 根据类型获取默认示例
   */
  private getDefaultExampleByType(type: string): any {
    switch (type) {
      case 'integer':
        return 1;
      case 'number':
        return 1.0;
      case 'boolean':
        return true;
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return 'string';
    }
  }
}