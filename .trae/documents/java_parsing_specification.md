# Java实体类解析规范文档

## 1. 解析范围

### 1.1 支持的Java语法特性

* **类定义**：public class、普通class

* **字段类型**：基本数据类型、包装类型、String、Date、集合类型、自定义对象

* **访问修饰符**：public、private、protected、默认

* **注解支持**：常见验证注解、JSON序列化注解、自定义注解

* **注释格式**：Javadoc注释（/\*\* \*/）、行内注释（//）

### 1.2 支持的数据类型映射

| Java类型                | Apifox类型 | 说明                             |
| --------------------- | -------- | ------------------------------ |
| String                | string   | 字符串类型                          |
| int, Integer          | integer  | 整数类型                           |
| long, Long            | integer  | 长整数类型                          |
| float, Float          | number   | 浮点数类型                          |
| double, Double        | number   | 双精度浮点数                         |
| boolean, Boolean      | boolean  | 布尔类型                           |
| Date, LocalDate       | string   | 日期类型，format: date              |
| LocalDateTime         | string   | 日期时间类型，format: date-time       |
| BigDecimal            | string   | 高精度数字，format: decimal          |
| List<T>, ArrayList<T> | array    | 数组类型，items为T的类型                |
| Set<T>, HashSet<T>    | array    | 集合类型，items为T的类型                |
| Map\<String, T>       | object   | 对象类型，additionalProperties为T的类型 |
| 自定义类                  | object   | 引用类型，递归解析                      |
| enum                  | string   | 枚举类型，包含enum值列表                 |

## 2. 注解解析规则

### 2.1 验证注解支持

| 注解               | 作用         | Apifox映射                               |
| ---------------- | ---------- | -------------------------------------- |
| @NotNull         | 字段不能为空     | required字段                             |
| @NotEmpty        | 字符串/集合不能为空 | required + minLength/minItems          |
| @NotBlank        | 字符串不能为空白   | required + pattern                     |
| @Size(min, max)  | 长度限制       | minLength/maxLength, minItems/maxItems |
| @Min(value)      | 最小值限制      | minimum                                |
| @Max(value)      | 最大值限制      | maximum                                |
| @Pattern(regexp) | 正则表达式验证    | pattern                                |
| @Email           | 邮箱格式验证     | format: email                          |
| @DecimalMin      | 数字最小值      | minimum                                |
| @DecimalMax      | 数字最大值      | maximum                                |

### 2.2 JSON序列化注解

| 注解                    | 作用        | 解析规则             |
| --------------------- | --------- | ---------------- |
| @JsonProperty("name") | 指定JSON字段名 | 使用注解中的名称作为属性名    |
| @JsonIgnore           | 忽略字段      | 不包含在生成的schema中   |
| @JsonFormat(pattern)  | 日期格式化     | 设置format和example |
| @JsonInclude          | 包含策略      | 影响required字段判断   |

### 2.3 自定义注解

| 注解                | 作用          | 解析规则                              |
| ----------------- | ----------- | --------------------------------- |
| @ApiModelProperty | Swagger文档注解 | 提取value作为description，example作为示例值 |
| @Schema           | OpenAPI注解   | 提取description、example等属性          |

## 3. 注释解析规则

### 3.1 Javadoc注释解析

```java
/**
 * 用户信息实体类
 * @author 开发者
 * @since 1.0
 */
public class User {
    /**
     * 用户姓名
     * 长度限制：2-50个字符
     */
    private String name;
    
    /**
     * 用户年龄
     * 取值范围：0-150
     */
    private Integer age;
}
```

解析规则：

* 提取第一行作为主要描述

* 忽略@author、@since等标签

* 多行描述合并为一个description

### 3.2 行内注释解析

```java
public class User {
    private String name; // 用户姓名，必填
    private Integer age; // 用户年龄，可选
}
```

解析规则：

* 提取//后的内容作为字段描述

* 识别"必填"、"可选"等关键词影响required判断

## 4. 字段属性生成规则

### 4.1 Required字段判断

优先级从高到低：

1. **注解优先**：@NotNull、@NotEmpty、@NotBlank标记为required
2. **注释关键词**：注释中包含"必填"、"必须"、"required"等
3. **类型判断**：基本数据类型（非包装类）默认required
4. **配置选项**：根据用户配置的requiredFieldStrategy

### 4.2 示例值生成规则

| 数据类型    | 示例值生成规则                                            |
| ------- | -------------------------------------------------- |
| String  | 根据字段名生成语义化示例，如name→"张三"，email→"<user@example.com>" |
| Integer | 根据字段名生成，如age→25，count→10                           |
| Boolean | 默认true                                             |
| Date    | 当前日期，格式"2024-01-01"                                |
| Array   | 包含1-2个示例元素的数组                                      |
| Object  | 递归生成子对象示例                                          |

### 4.3 描述信息生成

1. **优先级**：注解description > Javadoc注释 > 行内注释 > 字段名推断
2. **字段名推断**：根据常见字段名生成描述

   * name → "姓名"

   * age → "年龄"

   * email → "邮箱地址"

   * phone → "手机号码"

   * createTime → "创建时间"

## 5. 复杂类型处理

### 5.1 嵌套对象处理

```java
public class User {
    private String name;
    private Address address; // 嵌套对象
}

public class Address {
    private String province;
    private String city;
}
```

处理规则：

* 递归解析嵌套类

* 避免循环引用（通过引用计数）

* 生成完整的嵌套schema结构

### 5.2 泛型集合处理

```java
public class User {
    private List<String> hobbies;
    private Map<String, Object> metadata;
    private List<Address> addresses;
}
```

处理规则：

* List<T> → array类型，items为T的schema

* Map\<String, T> → object类型，additionalProperties为T的schema

* 支持多层嵌套泛型

### 5.3 枚举类型处理

```java
public enum Gender {
    MALE("男"),
    FEMALE("女");
    
    private String description;
}

public class User {
    private Gender gender;
}
```

处理规则：

* 生成string类型

* enum数组包含所有枚举值

* 提取枚举描述作为选项说明

## 6. 错误处理

### 6.1 语法错误处理

* **不完整的类定义**：提示缺少类名或大括号

* **语法错误**：指出具体的语法问题位置

* **不支持的语法**：提示当前不支持的Java特性

### 6.2 类型解析错误

* **未知类型**：标记为string类型，添加警告信息

* **循环引用**：检测并阻止无限递归

* **泛型解析失败**：降级为Object类型处理

### 6.3 注解解析错误

* **未知注解**：忽略处理，记录警告

* **注解参数错误**：使用默认值，记录警告

* **冲突的注解**：按优先级处理，记录冲突信息

