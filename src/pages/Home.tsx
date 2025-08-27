import React, { useState, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Copy, Download, Settings, Play, FileText, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ParseOptions, ParseResponse, ApifoxSchema } from '../../shared/types';

const Home: React.FC = () => {
  const [javaCode, setJavaCode] = useState<string>('');
  const [result, setResult] = useState<ApifoxSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ParseOptions>({
    includePrivateFields: true,
    generateExamples: true,
    commentStyle: 'javadoc',
    requiredFieldStrategy: 'annotation'
  });

  const handleParse = useCallback(async () => {
    if (!javaCode.trim()) {
      setError('请输入Java代码');
      return;
    }

    setLoading(true);
    setError(null);
    setWarnings([]);
    setResult(null);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          javaCode,
          options
        })
      });

      const data: ParseResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
        if (data.warnings) {
          setWarnings(data.warnings);
        }
      } else {
        setError(data.error || '解析失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [javaCode, options]);

  const handleCopy = useCallback(async () => {
    if (!result) {
      toast.error('没有可复制的内容');
      return;
    }

    const textToCopy = JSON.stringify(result, null, 2);

    // 检查是否支持现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('JSON Schema已复制到剪贴板');
        return;
      } catch (err) {
        console.error('Clipboard API 复制失败:', err);
        // 如果 Clipboard API 失败，继续使用降级方案
      }
    }

    // 降级方案：使用传统的复制方法
    try {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      
      // 选择文本
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);
      
      // 执行复制命令
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success('JSON Schema已复制到剪贴板');
      } else {
        throw new Error('execCommand 返回 false');
      }
    } catch (fallbackErr) {
      console.error('降级复制方案也失败:', fallbackErr);
      toast.error('复制失败，请手动选择并复制内容');
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result) {
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'apifox-schema.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  const loadExample = useCallback(() => {
    const exampleCode = `/**
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
}`;
    setJavaCode(exampleCode);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Java转Apifox工具
              </h1>
            </div>

          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：代码输入区 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Java实体类代码
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  配置
                </button>
                <button
                  onClick={loadExample}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  示例
                </button>
              </div>
            </div>

            {/* 配置选项 */}
            {showOptions && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <h3 className="text-sm font-medium text-gray-900">解析配置</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includePrivateFields}
                      onChange={(e) => setOptions(prev => ({ ...prev, includePrivateFields: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">包含私有字段</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.generateExamples}
                      onChange={(e) => setOptions(prev => ({ ...prev, generateExamples: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">生成示例值</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    必填字段策略
                  </label>
                  <select
                    value={options.requiredFieldStrategy}
                    onChange={(e) => setOptions(prev => ({ ...prev, requiredFieldStrategy: e.target.value as any }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="annotation">基于注解</option>
                    <option value="all">全部必填</option>
                    <option value="none">全部可选</option>
                  </select>
                </div>
              </div>
            )}

            {/* 代码编辑器 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Editor
                height="500px"
                defaultLanguage="java"
                value={javaCode}
                onChange={(value) => setJavaCode(value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true
                }}
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={handleParse}
                disabled={loading || !javaCode.trim()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? '解析中...' : '解析生成'}
              </button>
              <button
                onClick={() => setJavaCode('')}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                清空
              </button>
            </div>
          </div>

          {/* 右侧：结果展示区 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Apifox JSON Schema
              </h2>
              {result && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载
                  </button>
                </div>
              )}
            </div>

            {/* 警告信息 */}
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <HelpCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      警告信息
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        {warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* 结果展示 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {result ? (
                <Editor
                  height="500px"
                  defaultLanguage="json"
                  value={JSON.stringify(result, null, 2)}
                  theme="vs-light"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>在左侧输入Java代码并点击"解析生成"</p>
                    <p className="text-sm mt-2">支持类定义、字段注解、注释解析</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;