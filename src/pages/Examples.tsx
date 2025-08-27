import React, { useState, useEffect } from 'react';
import { FileText, Copy, Eye, Code, Search, Filter } from 'lucide-react';
import { Example } from '../../shared/types';

interface ExampleCategory {
  id: string;
  name: string;
  count: number;
}

const Examples: React.FC = () => {
  const [examples, setExamples] = useState<Example[]>([]);
  const [categories, setCategories] = useState<ExampleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchExamples();
  }, [selectedCategory, searchTerm]);

  const fetchExamples = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/examples?${params}`);
      const data = await response.json();

      if (data.success) {
        setExamples(data.data.examples);
        setCategories([
          { id: 'all', name: '全部', count: data.data.examples.length },
          ...data.data.categories
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // 这里可以添加toast提示
  };

  const handleUseExample = (example: Example) => {
    // 这里可以跳转到主页并填充代码
    const url = new URL('/', window.location.origin);
    url.searchParams.set('code', encodeURIComponent(example.javaCode));
    window.location.href = url.toString();
  };

  const handlePreview = (example: Example) => {
    setSelectedExample(example);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Java转Apifox工具 - 示例库
              </h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                主页
              </a>
              <span className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                示例
              </span>
              <a href="/help" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                帮助
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Java实体类示例</h2>
          <p className="text-gray-600">
            这里提供了各种常见的Java实体类示例，您可以直接使用这些示例来测试工具功能。
          </p>
        </div>

        {/* 搜索和过滤 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索示例..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* 分类过滤 */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 示例列表 */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examples.map((example) => (
              <div key={example.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {example.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {example.description}
                  </p>
                  
                  {/* 代码预览 */}
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <pre className="text-xs text-gray-700 overflow-hidden">
                      <code className="line-clamp-4">
                        {example.javaCode.split('\n').slice(0, 4).join('\n')}
                        {example.javaCode.split('\n').length > 4 && '\n...'}
                      </code>
                    </pre>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUseExample(example)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Code className="h-4 w-4 mr-1" />
                      使用
                    </button>
                    <button
                      onClick={() => handlePreview(example)}
                      className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyCode(example.javaCode)}
                      className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && examples.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到示例</h3>
            <p className="text-gray-500">尝试调整搜索条件或选择不同的分类</p>
          </div>
        )}
      </main>

      {/* 预览模态框 */}
      {showPreview && selectedExample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedExample.title}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <p className="text-gray-600 mb-4">{selectedExample.description}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Java代码 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Java代码</h4>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      <code>{selectedExample.javaCode}</code>
                    </pre>
                  </div>
                </div>
                
                {/* 预期输出 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">预期输出</h4>
                  <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm">
                      <code>{JSON.stringify(selectedExample.expectedOutput, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    handleUseExample(selectedExample);
                    setShowPreview(false);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Code className="h-4 w-4 mr-2" />
                  使用此示例
                </button>
                <button
                  onClick={() => handleCopyCode(selectedExample.javaCode)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制代码
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Examples;