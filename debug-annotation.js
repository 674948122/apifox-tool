// 调试注解解析问题
import { JavaLexer } from './shared/parser/lexer.js';
import { JavaParser } from './shared/parser/parser.js';

// 简单的测试用例：单个复杂注解
const simpleTest = `public class Test {
    @EnumDescMapping(enumClass = MocDurationTypeEnum.class, codeField = "mocDurationType")
    private String name;
}`;

console.log('=== 调试注解解析 ===\n');

// 词法分析
console.log('1. 词法分析:');
const lexer = new JavaLexer(simpleTest);
const tokens = lexer.tokenize();

console.log('Token数量:', tokens.length);
tokens.forEach((token, index) => {
    if (token.type !== 'WHITESPACE' && token.type !== 'NEWLINE') {
        console.log(`  ${index}: ${token.type} = "${token.value}"`);
    }
});

// 语法分析
console.log('\n2. 语法分析:');
const parser = new JavaParser(tokens);
try {
    const result = parser.parse();
    if (result.ast) {
        console.log('AST生成成功');
        console.log('AST:', JSON.stringify(result.ast, null, 2));
    } else {
        console.log('AST生成失败');
    }
    
    if (result.errors.length > 0) {
        console.log('\n解析错误:');
        result.errors.forEach(error => console.log('  -', error.message));
    }
    
    if (result.warnings.length > 0) {
        console.log('\n解析警告:');
        result.warnings.forEach(warning => console.log('  -', warning));
    }
} catch (error) {
    console.log('语法分析失败:', error.message);
    console.log('错误详情:', error);
}

console.log('\n=== 调试完成 ===');