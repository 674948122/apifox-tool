# Apifox JSON规范文档

## 1. Apifox Schema格式概述

Apifox使用基于JSON Schema的数据模型描述API的请求和响应结构。本工具生成的JSON需要完全符合Apifox的导入规范，确保可以直接在Apifox中使用。

## 2. 基础Schema结构

### 2.1 根对象结构

```json
{
  "type": "object",
  "properties": {
    // 字段定义
  },
  "required": [
    // 必填字段列表
  ],
  "description": "对象描述",
  "example": {
    // 示例数据
  }
}
```

### 2.2 字段属性定义

每个字段包含以下可能的属性：

| 属性名                  | 类型             | 必需 | 描述                                              |
| -------------------- | -------------- | -- | ----------------------------------------------- |
| type                 | string         | 是  | 数据类型：string/number/integer/boolean/object/array |
| description          | string         | 否  | 字段描述信息                                          |
| example              | any            | 否  | 示例值                                             |
| format               | string         | 否  | 格式限定：date/date-time/email/uri等                  |
| enum                 | array          | 否  | 枚举值列表                                           |
| minimum              | number         | 否  | 数值最小值                                           |
| maximum              | number         | 否  | 数值最大值                                           |
| minLength            | integer        | 否  | 字符串最小长度                                         |
| maxLength            | integer        | 否  | 字符串最大长度                                         |
| pattern              | string         | 否  | 正则表达式模式                                         |
| items                | object         | 否  | 数组元素类型定义                                        |
| properties           | object         | 否  | 对象属性定义                                          |
| additionalProperties | object/boolean | 否  | 额外属性定义                                          |

## 3. 数据类型规范

### 3.1 基本数据类型

#### 字符串类型

```json
{
  "type": "string",
  "description": "用户姓名",
  "example": "张三",
  "minLength": 2,
  "maxLength": 50
}
```

#### 整数类型

```json
{
  "type": "integer",
  "description": "用户年龄",
  "example": 25,
  "minimum": 0,
  "maximum": 150
}
```

#### 数字类型

```json
{
  "type": "number",
  "description": "商品价格",
  "example": 99.99,
  "minimum": 0
}
```

#### 布尔类型

```json
{
  "type": "boolean",
  "description": "是否启用",
  "example": true
}
```

### 3.2 格式化类型

#### 日期类型

```json
{
  "type": "string",
  "format": "date",
  "description": "出生日期",
  "example": "1990-01-01"
}
```

#### 日期时间类型

```json
{
  "type": "string",
  "format": "date-time",
  "description": "创建时间",
  "example": "2024-01-01T10:00:00Z"
}
```

#### 邮箱类型

```json
{
  "type": "string",
  "format": "email",
  "description": "邮箱地址",
  "example": "user@example.com"
}
```

#### URI类型

```json
{
  "type": "string",
  "format": "uri",
  "description": "头像URL",
  "example": "https://example.com/avatar.jpg"
}
```

### 3.3 复合数据类型

#### 数组类型

```json
{
  "type": "array",
  "description": "用户爱好列表",
  "items": {
    "type": "string",
    "example": "阅读"
  },
  "example": ["阅读", "运动", "音乐"]
}
```

#### 对象数组

```json
{
  "type": "array",
  "description": "地址列表",
  "items": {
    "type": "object",
    "properties": {
      "province": {
        "type": "string",
        "description": "省份",
        "example": "北京市"
      },
      "city": {
        "type": "string",
        "description": "城市",
        "example": "北京市"
      }
    },
    "required": ["province", "city"]
  }
}
```

#### 嵌套对象

```json
{
  "type": "object",
  "description": "用户地址",
  "properties": {
    "province": {
      "type": "string",
      "description": "省份",
      "example": "北京市"
    },
    "city": {
      "type": "string",
      "description": "城市",
      "example": "北京市"
    },
    "detail": {
      "type": "string",
      "description": "详细地址",
      "example": "朝阳区某某街道"
    }
  },
  "required": ["province", "city"]
}
```

### 3.4 枚举类型

```json
{
  "type": "string",
  "description": "用户性别",
  "enum": ["MALE", "FEMALE"],
  "example": "MALE"
}
```

## 4. 完整示例

### 4.1 简单用户实体

Java代码：

```java
/**
 * 用户信息实体
 */
public class User {
    /**
     * 用户ID
     */
    @NotNull
    private Long id;
    
    /**
     * 用户姓名
     */
    @NotBlank
    @Size(min = 2, max = 50)
    private String name;
    
    /**
     * 邮箱地址
     */
    @Email
    private String email;
    
    /**
     * 用户年龄
     */
    @Min(0)
    @Max(150)
    private Integer age;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
}
```

生成的Apifox JSON：

```json
{
  "type": "object",
  "description": "用户信息实体",
  "properties": {
    "id": {
      "type": "integer",
      "description": "用户ID",
      "example": 1001
    },
    "name": {
      "type": "string",
      "description": "用户姓名",
      "example": "张三",
      "minLength": 2,
      "maxLength": 50
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "邮箱地址",
      "example": "zhangsan@example.com"
    },
    "age": {
      "type": "integer",
      "description": "用户年龄",
      "example": 25,
      "minimum": 0,
      "maximum": 150
    },
    "enabled": {
      "type": "boolean",
      "description": "是否启用",
      "example": true
    }
  },
  "required": ["id", "name"]
}
```

### 4.2 复杂嵌套实体

Java代码：

```java
/**
 * 订单信息
 */
public class Order {
    /**
     * 订单ID
     */
    @NotNull
    private String orderId;
    
    /**
     * 用户信息
     */
    @NotNull
    private User user;
    
    /**
     * 订单商品列表
     */
    @NotEmpty
    private List<OrderItem> items;
    
    /**
     * 订单状态
     */
    private OrderStatus status;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}

public class OrderItem {
    private String productName;
    private Integer quantity;
    private BigDecimal price;
}

public enum OrderStatus {
    PENDING("待支付"),
    PAID("已支付"),
    SHIPPED("已发货"),
    COMPLETED("已完成");
}
```

生成的Apifox JSON：

```json
{
  "type": "object",
  "description": "订单信息",
  "properties": {
    "orderId": {
      "type": "string",
      "description": "订单ID",
      "example": "ORD20240101001"
    },
    "user": {
      "type": "object",
      "description": "用户信息",
      "properties": {
        "id": {
          "type": "integer",
          "description": "用户ID",
          "example": 1001
        },
        "name": {
          "type": "string",
          "description": "用户姓名",
          "example": "张三"
        }
      },
      "required": ["id", "name"]
    },
    "items": {
      "type": "array",
      "description": "订单商品列表",
      "items": {
        "type": "object",
        "properties": {
          "productName": {
            "type": "string",
            "description": "商品名称",
            "example": "iPhone 15"
          },
          "quantity": {
            "type": "integer",
            "description": "购买数量",
            "example": 1
          },
          "price": {
            "type": "string",
            "format": "decimal",
            "description": "商品价格",
            "example": "7999.00"
          }
        }
      }
    },
    "status": {
      "type": "string",
      "description": "订单状态",
      "enum": ["PENDING", "PAID", "SHIPPED", "COMPLETED"],
      "example": "PENDING"
    },
    "createTime": {
      "type": "string",
      "format": "date-time",
      "description": "创建时间",
      "example": "2024-01-01 10:00:00"
    }
  },
  "required": ["orderId", "user", "items"]
}
```

## 5. 特殊处理规则

### 5.1 循环引用处理

当检测到循环引用时，使用引用标记：

```json
{
  "type": "object",
  "description": "部门信息",
  "properties": {
    "name": {
      "type": "string",
      "description": "部门名称"
    },
    "parentDept": {
      "$ref": "#/definitions/Department",
      "description": "上级部门"
    }
  }
}
```

### 5.2 泛型处理

对于Map类型，使用additionalProperties：

```json
{
  "type": "object",
  "description": "扩展属性",
  "additionalProperties": {
    "type": "string"
  },
  "example": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

### 5.3 继承关系处理

使用allOf组合多个schema：

```json
{
  "allOf": [
    {
      "$ref": "#/definitions/BaseEntity"
    },
    {
      "type": "object",
      "properties": {
        "specificField": {
          "type": "string",
          "description": "特有字段"
        }
      }
    }
  ]
}
```

## 6. 验证规则

生成的JSON必须满足以下验证规则：

1. **格式正确性**：符合JSON Schema Draft 7规范
2. **类型一致性**：type字段与实际数据类型匹配
3. **约束有效性**：minimum <= maximum，minLength <= maxLength
4. **引用完整性**：所有$ref引用都能找到对应定义
5. **示例有效性**：example值符合对应的schema约束
6. **必填字段**：required数组中的字段在properties中存在

## 7. 输出格式选项

工具支持以下输出格式：

1. **标准JSON**：格式化的JSON字符串
2. **压缩JSON**：去除空格的紧凑格式
3. **带注释JSON**：包含解析过程注释的格式
4. **分层结构**：将嵌套对象拆分为独立定义

