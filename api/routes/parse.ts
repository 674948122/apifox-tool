import { Request, Response } from 'express';
import { JavaCodeParser } from '../../shared/parser';
import { ApifoxConverter } from '../../shared/converter/apifox-converter';
import { ParseOptions, ParseResponse } from '../../shared/types';

/**
 * Java代码解析API
 * POST /api/parse
 */
export async function parseJavaCode(req: Request, res: Response): Promise<void> {
  try {
    const { javaCode, options = {} } = req.body;
    
    // 验证输入
    if (!javaCode || typeof javaCode !== 'string') {
      res.status(400).json({
        success: false,
        error: 'javaCode is required and must be a string'
      } as ParseResponse);
      return;
    }
    
    if (javaCode.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'javaCode cannot be empty'
      } as ParseResponse);
      return;
    }
    
    // 验证代码长度
    if (javaCode.length > 50000) {
      res.status(400).json({
        success: false,
        error: 'javaCode is too long (max 50000 characters)'
      } as ParseResponse);
      return;
    }
    
    // 解析配置选项
    const parseOptions: ParseOptions = {
      includePrivateFields: options.includePrivateFields ?? true,
      generateExamples: options.generateExamples ?? true,
      commentStyle: options.commentStyle || 'javadoc',
      requiredFieldStrategy: options.requiredFieldStrategy || 'annotation'
    };
    
    // 解析Java代码
    const { javaClass, errors, warnings } = JavaCodeParser.parse(javaCode, parseOptions);
    
    // 添加调试信息
    console.log('Parse result:', {
      className: javaClass?.className,
      fieldsCount: javaClass?.fields.length,
      fields: javaClass?.fields.map(f => ({ name: f.name, type: f.type, comment: f.comment })),
      errors: errors,
      warnings: warnings
    });
    
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: `Parsing failed: ${errors.map(e => e.message).join('; ')}`,
        warnings
      } as ParseResponse);
      return;
    }
    
    if (!javaClass) {
      res.status(400).json({
        success: false,
        error: 'No valid Java class found in the code',
        warnings
      } as ParseResponse);
      return;
    }
    
    // 转换为Apifox格式
    const converter = new ApifoxConverter(parseOptions);
    const apifoxSchema = converter.convert(javaClass);
    
    // 返回成功结果
    res.json({
      success: true,
      data: apifoxSchema,
      warnings: warnings.length > 0 ? warnings : undefined
    } as ParseResponse);
    
  } catch (error) {
    console.error('Parse API error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    } as ParseResponse);
  }
}

/**
 * 验证Java代码格式
 * POST /api/validate
 */
export async function validateJavaCode(req: Request, res: Response): Promise<void> {
  try {
    const { javaCode } = req.body;
    
    if (!javaCode || typeof javaCode !== 'string') {
      res.status(400).json({
        success: false,
        error: 'javaCode is required and must be a string'
      });
      return;
    }
    
    // 简单的Java代码验证
    const { javaClass, errors, warnings } = JavaCodeParser.parse(javaCode, {
      includePrivateFields: true,
      generateExamples: false
    });
    
    res.json({
      success: errors.length === 0,
      valid: errors.length === 0 && javaClass !== null,
      errors: errors.map(e => ({
        message: e.message,
        line: e.line,
        column: e.column,
        type: e.type
      })),
      warnings,
      className: javaClass?.className,
      fieldCount: javaClass?.fields.length || 0
    });
    
  } catch (error) {
    console.error('Validate API error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}