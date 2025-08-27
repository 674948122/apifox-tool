// 测试复杂自定义注解解析功能
import { JavaCodeParser } from './shared/parser/index.js';
import { ApifoxConverter } from './shared/converter/apifox-converter.js';

// 用户提供的测试用例：包含复杂自定义注解的Java类
const testJavaCode = `public class MocApplyFormListVo {

    /**
     * id
     */
    private Long id;

    /**
     * 变更编号
     */
    private String mocCode;

    /**
     * 流程实例id
     */
    private Long procInsId;

    /**
     * 状态
     */
    private Integer mocStatus;

    /**
     * 变更名称
     */
    private String mocName;

    //变更持续时间类型 紧急/永久/临时
    private Integer mocDurationType;

    @EnumDescMapping(enumClass = MocDurationTypeEnum.class, codeField = "mocDurationType")
    private String mocDurationTypeName;

    /**
     * 状态名称
     */
    @EnumDescMapping(enumClass = MocApprovalStatusEnum.class, codeField = "mocStatus")
    private String mocStatusName;

    /**
     * 级别
     */
    private Integer mocLevel;

    /**
     * 级别名称
     */
    @EnumDescMapping(enumClass = MocAlterLevelEnum.class, codeField = "mocLevel")
    private String mocLevelName;

    /**
     * 变更类型
     */
    private Integer alterType;

    /**
     * 变更类型名称
     */
    @EnumDescMapping(enumClass = MocAlterTypeEnum.class, codeField = "alterType")
    private String alterTypeName;

    /**
     * 申请人id
     */
    private Long mocAppUserId;

    /**
     * 申请人名称
     */
    @FieldMapping(mapToClass = SysUser.class, mapToField = "nickName", keyField = "mocAppUserId", inQueryField = "userId")
    private String mocAppUserName;

    /**
     * 变更申请部门
     */
    private Long alterApplicantUnit;

    /**
     * 变更申请部门名称
     */
    @FieldMapping(mapToClass = SysDept.class, mapToField = "deptName", keyField = "alterApplicantUnit", inQueryField = "deptId")
    private String alterApplicantUnitName;

    /**
     * 保存时间
     */
    private Date createTime;

    /**
     * 发起时间
     */
    private Date startTime;

    /**
     * 当前阶段
     */
    private String currentNode;

    /**
     * 当前阶段节点名称
     */
    private String curOverViewNodeName;

    /**
     * 当前处理人
     */
    private String currentHandler;
}`;

console.log('=== 测试复杂自定义注解解析 ===\n');

try {
    // 解析Java代码
    const parseResult = JavaCodeParser.parse(testJavaCode, {
        includePrivateFields: true,
        generateExamples: true,
        requiredFieldStrategy: 'annotation'
    });
    
    console.log('解析结果:');
    console.log('- 成功:', parseResult.javaClass ? '是' : '否');
    console.log('- 错误数量:', parseResult.errors.length);
    console.log('- 警告数量:', parseResult.warnings.length);
    
    if (parseResult.javaClass) {
        console.log('\n类信息:');
        console.log('- 类名:', parseResult.javaClass.className);
        console.log('- 类注释:', parseResult.javaClass.classComment || '无');
        console.log('- 字段数量:', parseResult.javaClass.fields.length);
        
        console.log('\n字段详情:');
        parseResult.javaClass.fields.forEach((field, index) => {
            console.log(`${index + 1}. ${field.name}:`);
            console.log('   类型:', field.type);
            console.log('   注释:', field.comment || '无');
            console.log('   是否必填:', field.isRequired);
            console.log('   注解数量:', field.annotations.length);
            
            if (field.annotations.length > 0) {
                field.annotations.forEach(annotation => {
                    console.log(`   - @${annotation.name}:`, JSON.stringify(annotation.parameters, null, 2));
                });
            }
            console.log('');
        });
        
        // 转换为Apifox格式
        console.log('\n=== Apifox转换测试 ===');
        const converter = new ApifoxConverter({
            includePrivateFields: true,
            generateExamples: true
        });
        
        const apifoxSchema = converter.convert(parseResult.javaClass);
        console.log('\nApifox Schema:');
        console.log(JSON.stringify(apifoxSchema, null, 2));
        
    }
    
    if (parseResult.errors.length > 0) {
        console.log('\n解析错误:');
        parseResult.errors.forEach(error => console.log('  -', error.message));
    }
    
    if (parseResult.warnings.length > 0) {
        console.log('\n解析警告:');
        parseResult.warnings.forEach(warning => console.log('  -', warning));
    }
    
} catch (error) {
    console.error('测试失败:', error.message);
    console.error(error.stack);
}

console.log('\n=== 测试完成 ===');