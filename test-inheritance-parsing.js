// 测试继承和复杂类型解析功能
import { JavaCodeParser } from './shared/parser/index.js';
import { ApifoxConverter } from './shared/converter/apifox-converter.js';

// 测试用例：包含继承、未知类型和复杂场景的Java类
const testJavaCode = `/**
 * 用户实体类
 * 继承自BaseEntity
 */
public class User extends BaseEntity {
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
     * 用户地址
     */
    private Address address;
    
    /**
     * 用户角色列表
     */
    private List<Role> roles;
    
    /**
     * 用户配置信息
     */
    private Map<String, UserConfig> configs;
    
    /**
     * 部门信息
     */
    private Department department;
    
    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;
}`;

// 测试用例2：更复杂的继承场景
const complexInheritanceCode = `/**
 * 管理员用户类
 * 继承自User并实现AdminInterface
 */
public class AdminUser extends User implements AdminInterface, Serializable {
    /**
     * 管理员级别
     */
    @Min(1)
    @Max(10)
    private Integer adminLevel;
    
    /**
     * 权限列表
     */
    private List<Permission> permissions;
    
    /**
     * 管理的组织
     */
    private Organization organization;
    
    /**
     * 审批记录
     */
    private List<ApprovalRecord> approvalRecords;
}`;

console.log('=== 测试继承和复杂类型解析功能 ===\n');

// 测试1：基本继承场景
console.log('1. 测试基本继承场景：');
const parseResult1 = JavaCodeParser.parse(testJavaCode, {
    includePrivateFields: true,
    generateExamples: true
});

if (parseResult1.javaClass) {
    console.log('✅ 解析成功');
    console.log('类名:', parseResult1.javaClass.className);
    console.log('字段数量:', parseResult1.javaClass.fields.length);
    
    console.log('\n字段详情:');
    parseResult1.javaClass.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type}`);
        console.log(`    注释: ${field.comment || '无'}`);
        console.log(`    是否必填: ${field.isRequired}`);
        console.log(`    注解: ${field.annotations.map(a => a.name).join(', ') || '无注解'}`);
        console.log('');
    });
    
    // 转换为Apifox格式
    const converter = new ApifoxConverter({
        includePrivateFields: true,
        generateExamples: true
    });
    
    const apifoxSchema = converter.convert(parseResult1.javaClass);
    console.log('\n生成的Apifox Schema:');
    console.log(JSON.stringify(apifoxSchema, null, 2));
    
} else {
    console.log('❌ 解析失败');
}

if (parseResult1.warnings.length > 0) {
    console.log('\n⚠️  解析警告:');
    parseResult1.warnings.forEach(warning => console.log('  -', warning));
}

if (parseResult1.errors.length > 0) {
    console.log('\n❌ 解析错误:');
    parseResult1.errors.forEach(error => console.log('  -', error.message));
}

console.log('\n' + '='.repeat(60) + '\n');

// 测试2：复杂继承场景
console.log('2. 测试复杂继承场景：');
const parseResult2 = JavaCodeParser.parse(complexInheritanceCode, {
    includePrivateFields: true,
    generateExamples: true
});

if (parseResult2.javaClass) {
    console.log('✅ 解析成功');
    console.log('类名:', parseResult2.javaClass.className);
    console.log('字段数量:', parseResult2.javaClass.fields.length);
    
    console.log('\n字段详情:');
    parseResult2.javaClass.fields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type}`);
        console.log(`    注释: ${field.comment || '无'}`);
        console.log(`    是否必填: ${field.isRequired}`);
        console.log('');
    });
    
    // 转换为Apifox格式
    const converter = new ApifoxConverter({
        includePrivateFields: true,
        generateExamples: true
    });
    
    const apifoxSchema = converter.convert(parseResult2.javaClass);
    console.log('\n生成的Apifox Schema:');
    console.log(JSON.stringify(apifoxSchema, null, 2));
    
} else {
    console.log('❌ 解析失败');
}

if (parseResult2.warnings.length > 0) {
    console.log('\n⚠️  解析警告:');
    parseResult2.warnings.forEach(warning => console.log('  -', warning));
}

if (parseResult2.errors.length > 0) {
    console.log('\n❌ 解析错误:');
    parseResult2.errors.forEach(error => console.log('  -', error.message));
}

console.log('\n=== 测试完成 ===');