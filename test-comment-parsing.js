// 测试Java注释解析功能
import { JavaCodeParser } from './shared/parser/index.js';
import { ApifoxConverter } from './shared/converter/apifox-converter.js';

// 测试用例：包含各种注释的Java类
const testJavaCode = `/**
 * 用户信息实体类
 * 这是一个测试类
 */
public class User {
    /**
     * 用户ID
     * 主键字段
     */
    @NotNull
    private Long id;
    
    /**
     * 用户姓名
     * 长度限制：2-50个字符
     */
    @NotBlank
    @Size(min = 2, max = 50)
    private String name;
    
    private String email; // 邮箱地址
    
    private Integer age; // 用户年龄，可选字段
}`;

console.log('=== 测试Java注释解析功能 ===');
console.log('输入的Java代码:');
console.log(testJavaCode);
console.log('\n=== 解析结果 ===');

try {
    // 1. 解析Java代码
    const parseResult = JavaCodeParser.parse(testJavaCode, {
        includePrivateFields: true,
        generateExamples: true
    });
    
    console.log('\n1. Java解析结果:');
    console.log('类名:', parseResult.javaClass?.className);
    console.log('类注释:', parseResult.javaClass?.classComment);
    console.log('\n字段信息:');
    
    parseResult.javaClass?.fields.forEach((field, index) => {
        console.log(`字段${index + 1}:`);
        console.log('  名称:', field.name);
        console.log('  类型:', field.type);
        console.log('  注释:', field.comment || '无注释');
        console.log('  是否必填:', field.isRequired);
        console.log('  注解:', field.annotations.map(a => a.name).join(', ') || '无注解');
        console.log('');
    });
    
    if (parseResult.errors.length > 0) {
        console.log('\n解析错误:');
        parseResult.errors.forEach(error => console.log('  -', error.message));
    }
    
    if (parseResult.warnings.length > 0) {
        console.log('\n解析警告:');
        parseResult.warnings.forEach(warning => console.log('  -', warning));
    }
    
    // 2. 转换为Apifox格式
    if (parseResult.javaClass) {
        console.log('\n2. Apifox转换结果:');
        const converter = new ApifoxConverter({
            includePrivateFields: true,
            generateExamples: true
        });
        
        const apifoxSchema = converter.convert(parseResult.javaClass);
        console.log(JSON.stringify(apifoxSchema, null, 2));
        
        // 3. 检查注释是否正确转换
        console.log('\n3. 注释转换检查:');
        console.log('类描述:', apifoxSchema.description);
        
        if (apifoxSchema.properties) {
            Object.entries(apifoxSchema.properties).forEach(([fieldName, property]) => {
                console.log(`${fieldName}字段描述:`, property.description || '无描述');
            });
        }
    }
    
} catch (error) {
    console.error('测试失败:', error.message);
    console.error(error.stack);
}