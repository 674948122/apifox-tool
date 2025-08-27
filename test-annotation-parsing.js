// 测试注解参数解析功能
import { JavaCodeParser } from './shared/parser/index.js';
import { ApifoxConverter } from './shared/converter/apifox-converter.js';

// 测试用例：包含复杂注解的Java类
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
    @Size(max = 100)
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
    @NotNull
    private Boolean enabled;
    
    /**
     * 用户评分
     */
    @DecimalMin("0.0")
    @DecimalMax("5.0")
    private Double rating;
}`;

console.log('=== 测试注解参数解析功能 ===\n');

try {
    // 解析Java代码
    const parseResult = JavaCodeParser.parse(testJavaCode, {
        includePrivateFields: true,
        generateExamples: true
    });
    
    console.log('解析结果:');
    console.log('- 成功:', parseResult.javaClass ? '是' : '否');
    console.log('- 错误数量:', parseResult.errors.length);
    console.log('- 警告数量:', parseResult.warnings.length);
    
    if (parseResult.errors.length > 0) {
        console.log('\n解析错误:');
        parseResult.errors.forEach(error => {
            console.log(`  - ${error.message} (行 ${error.line}, 列 ${error.column})`);
        });
    }
    
    if (parseResult.warnings.length > 0) {
        console.log('\n解析警告:');
        parseResult.warnings.forEach(warning => {
            console.log(`  - ${warning}`);
        });
    }
    
    if (parseResult.javaClass) {
        console.log('\n类信息:');
        console.log('- 类名:', parseResult.javaClass.className);
        console.log('- 类注释:', parseResult.javaClass.classComment || '无');
        console.log('- 字段数量:', parseResult.javaClass.fields.length);
        
        console.log('\n字段详情:');
        parseResult.javaClass.fields.forEach((field, index) => {
            console.log(`${index + 1}. ${field.name} (${field.type})`);
            console.log('   注释:', field.comment || '无');
            console.log('   是否必填:', field.isRequired);
            console.log('   注解:');
            
            if (field.annotations.length === 0) {
                console.log('     无注解');
            } else {
                field.annotations.forEach(annotation => {
                    console.log(`     @${annotation.name}`);
                    if (annotation.parameters) {
                        Object.entries(annotation.parameters).forEach(([key, value]) => {
                            console.log(`       ${key}: ${JSON.stringify(value)}`);
                        });
                    }
                });
            }
            console.log('');
        });
        
        // 转换为Apifox格式
        console.log('\n=== 转换为Apifox格式 ===\n');
        const converter = new ApifoxConverter({
            includePrivateFields: true,
            generateExamples: true
        });
        
        const apifoxSchema = converter.convert(parseResult.javaClass);
        console.log('Apifox Schema:');
        console.log(JSON.stringify(apifoxSchema, null, 2));
        
        // 验证特定注解是否正确解析
        console.log('\n=== 注解解析验证 ===\n');
        const nameField = parseResult.javaClass.fields.find(f => f.name === 'name');
        if (nameField) {
            const sizeAnnotation = nameField.annotations.find(a => a.name === 'Size');
            if (sizeAnnotation && sizeAnnotation.parameters) {
                console.log('✅ @Size注解解析成功:');
                console.log('   min:', sizeAnnotation.parameters.min);
                console.log('   max:', sizeAnnotation.parameters.max);
            } else {
                console.log('❌ @Size注解解析失败');
            }
        }
        
        const ageField = parseResult.javaClass.fields.find(f => f.name === 'age');
        if (ageField) {
            const minAnnotation = ageField.annotations.find(a => a.name === 'Min');
            const maxAnnotation = ageField.annotations.find(a => a.name === 'Max');
            
            if (minAnnotation && minAnnotation.parameters) {
                console.log('✅ @Min注解解析成功:');
                console.log('   value:', minAnnotation.parameters.value);
            } else {
                console.log('❌ @Min注解解析失败');
            }
            
            if (maxAnnotation && maxAnnotation.parameters) {
                console.log('✅ @Max注解解析成功:');
                console.log('   value:', maxAnnotation.parameters.value);
            } else {
                console.log('❌ @Max注解解析失败');
            }
        }
        
        const ratingField = parseResult.javaClass.fields.find(f => f.name === 'rating');
        if (ratingField) {
            const decimalMinAnnotation = ratingField.annotations.find(a => a.name === 'DecimalMin');
            if (decimalMinAnnotation && decimalMinAnnotation.parameters) {
                console.log('✅ @DecimalMin注解解析成功:');
                console.log('   value:', decimalMinAnnotation.parameters.value);
            } else {
                console.log('❌ @DecimalMin注解解析失败');
            }
        }
        
    }
    
} catch (error) {
    console.error('测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
}

console.log('\n=== 测试完成 ===');