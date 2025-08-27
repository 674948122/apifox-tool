import { Example } from '../types';

/**
 * 示例Java实体类数据
 */
export const examples: Example[] = [
  {
    id: 'simple-user',
    title: '简单用户实体',
    description: '包含基本字段和验证注解的用户实体类',
    javaCode: `/**
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
}`,
    expectedOutput: {
      type: 'object',
      description: '用户信息实体',
      properties: {
        id: {
          type: 'integer',
          description: '用户ID',
          example: 1001
        },
        name: {
          type: 'string',
          description: '用户姓名',
          example: '张三',
          minLength: 2,
          maxLength: 50
        },
        email: {
          type: 'string',
          format: 'email',
          description: '邮箱地址',
          example: 'user@example.com'
        },
        age: {
          type: 'integer',
          description: '用户年龄',
          example: 25,
          minimum: 0,
          maximum: 150
        },
        enabled: {
          type: 'boolean',
          description: '是否启用',
          example: true
        }
      },
      required: ['id', 'name']
    }
  },
  {
    id: 'complex-order',
    title: '复杂订单实体',
    description: '包含嵌套对象、数组和枚举的订单实体类',
    javaCode: `/**
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
    
    /**
     * 订单总金额
     */
    @DecimalMin("0.01")
    private BigDecimal totalAmount;
}

public class OrderItem {
    /**
     * 商品名称
     */
    private String productName;
    
    /**
     * 购买数量
     */
    @Min(1)
    private Integer quantity;
    
    /**
     * 商品价格
     */
    private BigDecimal price;
}

public enum OrderStatus {
    PENDING("待支付"),
    PAID("已支付"),
    SHIPPED("已发货"),
    COMPLETED("已完成");
}`,
    expectedOutput: {
      type: 'object',
      description: '订单信息',
      properties: {
        orderId: {
          type: 'string',
          description: '订单ID',
          example: 'ORD20240101001'
        },
        user: {
          type: 'object',
          description: '用户信息',
          properties: {},
          example: {}
        },
        items: {
          type: 'array',
          description: '订单商品列表',
          items: {
            type: 'object',
            description: 'OrderItem项'
          },
          example: []
        },
        status: {
          type: 'string',
          description: '订单状态',
          enum: ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED'],
          example: 'PENDING'
        },
        createTime: {
          type: 'string',
          format: 'date-time',
          description: '创建时间',
          example: '2024-01-01 10:00:00'
        },
        totalAmount: {
          type: 'string',
          format: 'decimal',
          description: '订单总金额',
          minimum: 0.01,
          example: '99.99'
        }
      },
      required: ['orderId', 'user', 'items']
    }
  },
  {
    id: 'product-with-collections',
    title: '商品实体（包含集合）',
    description: '包含List、Set、Map等集合类型的商品实体',
    javaCode: `/**
 * 商品信息实体
 */
public class Product {
    /**
     * 商品ID
     */
    @NotNull
    private Long productId;
    
    /**
     * 商品名称
     */
    @NotBlank
    @Size(max = 100)
    private String productName;
    
    /**
     * 商品标签列表
     */
    private List<String> tags;
    
    /**
     * 商品分类集合
     */
    private Set<String> categories;
    
    /**
     * 商品属性映射
     */
    private Map<String, String> attributes;
    
    /**
     * 商品图片列表
     */
    private List<ProductImage> images;
    
    /**
     * 商品价格
     */
    @DecimalMin("0.01")
    private BigDecimal price;
    
    /**
     * 库存数量
     */
    @Min(0)
    private Integer stock;
}

public class ProductImage {
    /**
     * 图片URL
     */
    private String url;
    
    /**
     * 图片描述
     */
    private String description;
}`,
    expectedOutput: {
      type: 'object',
      description: '商品信息实体',
      properties: {
        productId: {
          type: 'integer',
          description: '商品ID',
          example: 1001
        },
        productName: {
          type: 'string',
          description: '商品名称',
          maxLength: 100,
          example: 'iPhone 15'
        },
        tags: {
          type: 'array',
          description: '商品标签列表',
          items: {
            type: 'string',
            description: 'String项'
          },
          example: ['电子产品', '手机']
        },
        categories: {
          type: 'array',
          description: '商品分类集合',
          items: {
            type: 'string',
            description: 'String项'
          },
          example: ['数码', '通讯']
        },
        attributes: {
          type: 'object',
          description: '商品属性映射',
          additionalProperties: {
            type: 'string',
            description: 'String值'
          },
          example: {
            'color': '黑色',
            'storage': '128GB'
          }
        },
        images: {
          type: 'array',
          description: '商品图片列表',
          items: {
            type: 'object',
            description: 'ProductImage项'
          },
          example: []
        },
        price: {
          type: 'string',
          format: 'decimal',
          description: '商品价格',
          minimum: 0.01,
          example: '7999.00'
        },
        stock: {
          type: 'integer',
          description: '库存数量',
          minimum: 0,
          example: 100
        }
      },
      required: ['productId', 'productName']
    }
  },
  {
    id: 'address-entity',
    title: '地址实体',
    description: '简单的地址实体类，适合初学者',
    javaCode: `/**
 * 地址信息
 */
public class Address {
    /**
     * 省份
     */
    @NotBlank
    private String province;
    
    /**
     * 城市
     */
    @NotBlank
    private String city;
    
    /**
     * 区县
     */
    private String district;
    
    /**
     * 详细地址
     */
    @Size(max = 200)
    private String detail;
    
    /**
     * 邮政编码
     */
    @Pattern(regexp = "\\d{6}")
    private String zipCode;
    
    /**
     * 是否为默认地址
     */
    private Boolean isDefault;
}`,
    expectedOutput: {
      type: 'object',
      description: '地址信息',
      properties: {
        province: {
          type: 'string',
          description: '省份',
          example: '北京市'
        },
        city: {
          type: 'string',
          description: '城市',
          example: '北京市'
        },
        district: {
          type: 'string',
          description: '区县',
          example: '朝阳区'
        },
        detail: {
          type: 'string',
          description: '详细地址',
          maxLength: 200,
          example: '某某街道某某号'
        },
        zipCode: {
          type: 'string',
          description: '邮政编码',
          pattern: '\\d{6}',
          example: '100000'
        },
        isDefault: {
          type: 'boolean',
          description: '是否为默认地址',
          example: true
        }
      },
      required: ['province', 'city']
    }
  },
  {
    id: 'employee-with-dates',
    title: '员工实体（包含日期类型）',
    description: '包含各种日期时间类型的员工实体',
    javaCode: `/**
 * 员工信息
 */
public class Employee {
    /**
     * 员工编号
     */
    @NotNull
    private String employeeId;
    
    /**
     * 员工姓名
     */
    @NotBlank
    private String name;
    
    /**
     * 出生日期
     */
    private LocalDate birthDate;
    
    /**
     * 入职时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime hireDate;
    
    /**
     * 工作时间（小时）
     */
    private LocalTime workTime;
    
    /**
     * 部门
     */
    private String department;
    
    /**
     * 职位
     */
    private String position;
    
    /**
     * 薪资
     */
    @DecimalMin("0")
    private BigDecimal salary;
    
    /**
     * 是否在职
     */
    private Boolean active = true;
}`,
    expectedOutput: {
      type: 'object',
      description: '员工信息',
      properties: {
        employeeId: {
          type: 'string',
          description: '员工编号',
          example: 'EMP001'
        },
        name: {
          type: 'string',
          description: '员工姓名',
          example: '张三'
        },
        birthDate: {
          type: 'string',
          format: 'date',
          description: '出生日期',
          example: '1990-01-01'
        },
        hireDate: {
          type: 'string',
          format: 'date-time',
          description: '入职时间',
          example: '2024-01-01 09:00:00'
        },
        workTime: {
          type: 'string',
          format: 'time',
          description: '工作时间（小时）',
          example: '09:00:00'
        },
        department: {
          type: 'string',
          description: '部门',
          example: '技术部'
        },
        position: {
          type: 'string',
          description: '职位',
          example: '软件工程师'
        },
        salary: {
          type: 'string',
          format: 'decimal',
          description: '薪资',
          minimum: 0,
          example: '10000.00'
        },
        active: {
          type: 'boolean',
          description: '是否在职',
          example: true
        }
      },
      required: ['employeeId', 'name']
    }
  }
];

/**
 * 根据ID获取示例
 */
export function getExampleById(id: string): Example | undefined {
  return examples.find(example => example.id === id);
}

/**
 * 获取所有示例
 */
export function getAllExamples(): Example[] {
  return examples;
}