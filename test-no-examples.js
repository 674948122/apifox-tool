// 测试不生成示例值的功能
import { JavaCodeParser } from './shared/parser/index.js';
import { ApifoxConverter } from './shared/converter/apifox-converter.js';

// 测试用例：简单的Java类
const testJavaCode = `/**
 * 用户信息实体类
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
    
    /**
     * 爱好列表
     */
    private List<String> hobbies;
}`;

console.log('=== 测试不生成示例值功能 ===\n');

// 解析Java代码
const parseResult = JavaCodeParser.parse(testJavaCode, {
    includePrivateFields: true,
    generateExamples: false // 明确设置为false
});

if (parseResult.javaClass) {
    console.log('✅ Java代码解析成功');
    console.log('- 类名:', parseResult.javaClass.className);
    console.log('- 字段数量:', parseResult.javaClass.fields.length);
    
    // 转换为Apifox Schema
    const converter = new ApifoxConverter({
        generateExamples: false // 明确设置为false
    });
    const apifoxSchema = converter.convert(parseResult.javaClass);
    
    console.log('\n✅ Apifox Schema生成成功');
    console.log('\n生成的JSON Schema:');
    console.log(JSON.stringify(apifoxSchema, null, 2));
    
    // 检查是否包含example字段
    console.log('\n=== 示例值检查 ===');
    
    // 检查根级别的example
    if (apifoxSchema.example) {
        console.log('❌ 根级别包含example字段');
    } else {
        console.log('✅ 根级别不包含example字段');
    }
    
    // 检查每个属性的example
    let hasPropertyExample = false;
    if (apifoxSchema.properties) {
        for (const [key, property] of Object.entries(apifoxSchema.properties)) {
            if (property.example !== undefined) {
                console.log(`❌ 属性 ${key} 包含example字段:`, property.example);
                hasPropertyExample = true;
            }
        }
    }
    
    if (!hasPropertyExample) {
        console.log('✅ 所有属性都不包含example字段');
    }
    
    // 检查数组类型的items是否包含example
    let hasItemsExample = false;
    if (apifoxSchema.properties) {
        for (const [key, property] of Object.entries(apifoxSchema.properties)) {
            if (property.type === 'array' && property.items && property.items.example !== undefined) {
                console.log(`❌ 数组属性 ${key} 的items包含example字段:`, property.items.example);
                hasItemsExample = true;
            }
        }
    }
    
    if (!hasItemsExample) {
        console.log('✅ 数组类型的items不包含example字段');
    }
    
    console.log('\n=== 测试结果 ===');
    const noExamples = !apifoxSchema.example && !hasPropertyExample && !hasItemsExample;
    if (noExamples) {
        console.log('🎉 测试通过：生成的JSON Schema不包含任何示例值');
    } else {
        console.log('❌ 测试失败：生成的JSON Schema仍包含示例值');
    }
    
} else {
    console.log('❌ Java代码解析失败');
}

if (parseResult.errors.length > 0) {
    console.log('\n解析错误:');
    parseResult.errors.forEach(error => console.log('  -', error.message));
}

if (parseResult.warnings.length > 0) {
    console.log('\n解析警告:');
    parseResult.warnings.forEach(warning => console.log('  -', warning));
}