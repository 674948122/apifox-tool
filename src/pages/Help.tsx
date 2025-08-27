import React from 'react';
import { FileText, Code, Settings, Download, AlertCircle, CheckCircle } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Java转Apifox工具 - 帮助文档
              </h1>
            </div>
            <nav className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                主页
              </a>
              <a href="/examples" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                示例
              </a>
              <span className="text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                帮助
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 工具介绍 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              工具介绍
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Java转Apifox工具是一个专门为开发团队设计的代码转换工具，旨在解决使用JetBrains Apifox插件时生成的接口文档注释不全的问题。
                通过输入Java实体类代码，工具能够自动解析并输出符合Apifox规范的带有完整注释信息的JSON Schema格式文档。
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-blue-900">智能解析</h3>
                  <p className="text-sm text-blue-700">支持Java类定义、字段类型、注解和注释的智能解析</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold text-green-900">标准输出</h3>
                  <p className="text-sm text-green-700">生成完全符合Apifox规范的JSON Schema格式</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-purple-900">易于使用</h3>
                  <p className="text-sm text-purple-700">简洁的界面设计，支持一键复制和下载</p>
                </div>
              </div>
            </div>
          </section>

          {/* 使用指南 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Code className="h-6 w-6 mr-2 text-blue-600" />
              使用指南
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">第一步：输入Java代码</h3>
                <p className="text-gray-700">在左侧的代码编辑器中输入或粘贴您的Java实体类代码。支持完整的类定义，包括字段、注解和注释。</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">第二步：配置解析选项</h3>
                <p className="text-gray-700">点击"配置"按钮可以设置解析选项，如是否包含私有字段、是否生成示例值等。</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">第三步：解析生成</h3>
                <p className="text-gray-700">点击"解析生成"按钮，工具将自动解析Java代码并在右侧显示生成的Apifox JSON Schema。</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">第四步：复制或下载</h3>
                <p className="text-gray-700">使用"复制"按钮将结果复制到剪贴板，或使用"下载"按钮保存为JSON文件。</p>
              </div>
            </div>
          </section>

          {/* 支持的Java特性 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-blue-600" />
              支持的Java特性
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">基本类型支持</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    基本数据类型（int, long, float, double, boolean等）
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    包装类型（Integer, Long, String等）
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    日期时间类型（Date, LocalDate, LocalDateTime等）
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    高精度数字（BigDecimal, BigInteger）
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">复杂类型支持</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    集合类型（List, Set, Map等）
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    数组类型（String[], int[]等）
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    嵌套对象和自定义类型
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    枚举类型（Enum）
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 注解支持 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">支持的注解</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">验证注解</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@NotNull</code>
                    <p className="text-sm text-gray-600 mt-1">字段不能为空，标记为required</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@NotEmpty</code>
                    <p className="text-sm text-gray-600 mt-1">字符串/集合不能为空</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@Size(min, max)</code>
                    <p className="text-sm text-gray-600 mt-1">设置长度限制</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@Min / @Max</code>
                    <p className="text-sm text-gray-600 mt-1">设置数值范围</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@Email</code>
                    <p className="text-sm text-gray-600 mt-1">邮箱格式验证</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">JSON序列化注解</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@JsonProperty</code>
                    <p className="text-sm text-gray-600 mt-1">指定JSON字段名</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@JsonIgnore</code>
                    <p className="text-sm text-gray-600 mt-1">忽略字段</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@JsonFormat</code>
                    <p className="text-sm text-gray-600 mt-1">日期格式化</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <code className="text-sm font-mono text-blue-600">@ApiModelProperty</code>
                    <p className="text-sm text-gray-600 mt-1">Swagger文档注解</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 注释格式 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">注释格式支持</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Javadoc注释</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`/**
 * 用户信息实体类
 * @author 开发者
 * @since 1.0
 */
public class User {
    /**
     * 用户姓名
     * 长度限制：2-50个字符
     */
    private String name;
}`}</pre>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">行内注释</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`public class User {
    private String name; // 用户姓名，必填
    private Integer age; // 用户年龄，可选
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* 配置选项说明 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">配置选项说明</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">包含私有字段</h3>
                <p className="text-gray-700">控制是否在生成的Schema中包含private修饰的字段。默认开启。</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">生成示例值</h3>
                <p className="text-gray-700">是否为每个字段生成示例值。示例值会根据字段名和类型智能生成。默认开启。</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">必填字段策略</h3>
                <ul className="text-gray-700 space-y-1 mt-2">
                  <li><strong>基于注解：</strong>根据@NotNull等注解判断（推荐）</li>
                  <li><strong>全部必填：</strong>所有字段都标记为required</li>
                  <li><strong>全部可选：</strong>所有字段都标记为可选</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 常见问题 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-blue-600" />
              常见问题
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Q: 支持哪些Java版本？</h3>
                <p className="text-gray-700 mt-1">A: 支持Java 8及以上版本的语法特性，包括泛型、注解等。</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Q: 可以解析多个类吗？</h3>
                <p className="text-gray-700 mt-1">A: 目前支持解析单个主类，如果代码中包含多个类，会解析第一个找到的类。</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900">Q: 生成的JSON可以直接导入Apifox吗？</h3>
                <p className="text-gray-700 mt-1">A: 是的，生成的JSON Schema完全符合Apifox的导入规范，可以直接使用。</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900">Q: 如何处理循环引用？</h3>
                <p className="text-gray-700 mt-1">A: 工具会自动检测循环引用并使用$ref引用来避免无限递归。</p>
              </div>
            </div>
          </section>

          {/* 联系我们 */}
          <section className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">需要帮助？</h2>
            <p className="text-gray-700 mb-4">
              如果您在使用过程中遇到问题或有改进建议，欢迎通过以下方式联系我们：
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                GitHub Issues
              </a>
              <a 
                href="mailto:support@example.com"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                邮件反馈
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Help;