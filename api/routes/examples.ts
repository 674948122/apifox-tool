import { Request, Response } from 'express';
import { getAllExamples, getExampleById } from '../../shared/examples';
import { Example } from '../../shared/types';

/**
 * 获取所有示例
 * GET /api/examples
 */
export async function getExamples(req: Request, res: Response): Promise<void> {
  try {
    const examples = getAllExamples();
    
    // 可以根据查询参数过滤示例
    const { category, search } = req.query;
    
    let filteredExamples = examples;
    
    // 根据搜索关键词过滤
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filteredExamples = filteredExamples.filter(example => 
        example.title.toLowerCase().includes(searchLower) ||
        example.description.toLowerCase().includes(searchLower) ||
        example.javaCode.toLowerCase().includes(searchLower)
      );
    }
    
    // 根据分类过滤（简单实现）
    if (category && typeof category === 'string') {
      const categoryLower = category.toLowerCase();
      filteredExamples = filteredExamples.filter(example => {
        if (categoryLower === 'simple') {
          return example.id.includes('simple') || example.id.includes('address');
        }
        if (categoryLower === 'complex') {
          return example.id.includes('complex') || example.id.includes('order');
        }
        if (categoryLower === 'collections') {
          return example.id.includes('collections') || example.id.includes('product');
        }
        if (categoryLower === 'dates') {
          return example.id.includes('dates') || example.id.includes('employee');
        }
        return true;
      });
    }
    
    res.json({
      success: true,
      data: {
        examples: filteredExamples,
        total: filteredExamples.length,
        categories: [
          { id: 'simple', name: '简单示例', count: examples.filter(e => e.id.includes('simple') || e.id.includes('address')).length },
          { id: 'complex', name: '复杂示例', count: examples.filter(e => e.id.includes('complex') || e.id.includes('order')).length },
          { id: 'collections', name: '集合类型', count: examples.filter(e => e.id.includes('collections') || e.id.includes('product')).length },
          { id: 'dates', name: '日期时间', count: examples.filter(e => e.id.includes('dates') || e.id.includes('employee')).length }
        ]
      }
    });
    
  } catch (error) {
    console.error('Get examples API error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

/**
 * 根据ID获取单个示例
 * GET /api/examples/:id
 */
export async function getExampleById_API(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Example ID is required'
      });
      return;
    }
    
    const example = getExampleById(id);
    
    if (!example) {
      res.status(404).json({
        success: false,
        error: `Example with ID '${id}' not found`
      });
      return;
    }
    
    res.json({
      success: true,
      data: example
    });
    
  } catch (error) {
    console.error('Get example by ID API error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

/**
 * 创建自定义示例
 * POST /api/examples
 */
export async function createExample(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, javaCode } = req.body;
    
    // 验证输入
    if (!title || typeof title !== 'string') {
      res.status(400).json({
        success: false,
        error: 'title is required and must be a string'
      });
      return;
    }
    
    if (!description || typeof description !== 'string') {
      res.status(400).json({
        success: false,
        error: 'description is required and must be a string'
      });
      return;
    }
    
    if (!javaCode || typeof javaCode !== 'string') {
      res.status(400).json({
        success: false,
        error: 'javaCode is required and must be a string'
      });
      return;
    }
    
    // 生成ID
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建示例对象
    const example: Example = {
      id,
      title: title.trim(),
      description: description.trim(),
      javaCode: javaCode.trim(),
      expectedOutput: {
        type: 'object',
        description: 'Custom example',
        properties: {},
        required: []
      }
    };
    
    // 注意：这里只是返回创建的示例，实际项目中可能需要持久化存储
    res.status(201).json({
      success: true,
      data: example,
      message: 'Example created successfully'
    });
    
  } catch (error) {
    console.error('Create example API error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

/**
 * 获取示例统计信息
 * GET /api/examples/stats
 */
export async function getExampleStats(req: Request, res: Response): Promise<void> {
  try {
    const examples = getAllExamples();
    
    const stats = {
      total: examples.length,
      categories: {
        simple: examples.filter(e => e.id.includes('simple') || e.id.includes('address')).length,
        complex: examples.filter(e => e.id.includes('complex') || e.id.includes('order')).length,
        collections: examples.filter(e => e.id.includes('collections') || e.id.includes('product')).length,
        dates: examples.filter(e => e.id.includes('dates') || e.id.includes('employee')).length
      },
      avgCodeLength: Math.round(examples.reduce((sum, e) => sum + e.javaCode.length, 0) / examples.length),
      mostPopular: examples.slice(0, 3).map(e => ({ id: e.id, title: e.title })),
      recentlyAdded: examples.slice(-3).map(e => ({ id: e.id, title: e.title }))
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Get example stats API error:', error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}