# Docker 部署指南

本项目已配置完整的Docker部署方案，支持一键部署。

## 🚀 快速开始

### 方式一：使用 Docker Compose（推荐）

```bash
# 构建并启动服务
npm run docker:compose:up

# 查看日志
npm run docker:compose:logs

# 停止服务
npm run docker:compose:down
```

### 方式二：使用 Docker 命令

```bash
# 构建镜像
npm run docker:build

# 运行容器
npm run docker:run

# 停止容器
npm run docker:stop
```

## 📁 文件说明

### Dockerfile
- 使用多阶段构建优化镜像大小
- 前端构建阶段：编译React + TypeScript + Vite项目
- 生产环境阶段：运行Express后端服务
- 包含健康检查和安全配置

### docker-compose.yml
- 完整的服务编排配置
- 包含可选的Nginx反向代理
- 支持健康检查和自动重启

### .dockerignore
- 排除不必要的文件，减少镜像大小
- 包含开发工具、日志、缓存等文件

## 🔧 配置说明

### 端口配置
- 应用端口：5173
- Nginx端口：80, 443（可选）

### 环境变量
- `NODE_ENV=production`
- `PORT=3000`

### 健康检查
- 端点：`/api/health`
- 间隔：30秒
- 超时：10秒
- 重试：3次

## 🌐 部署到生产环境

### 1. 云服务器部署

```bash
# 克隆项目
git clone https://github.com/674948122/apifox-tool.git
cd apifox-tool

# 构建并启动
docker-compose up -d

# 检查状态
docker-compose ps
```

### 2. 使用Nginx反向代理

```bash
# 启动包含Nginx的完整服务
docker-compose --profile with-nginx up -d
```

### 3. SSL证书配置

1. 将SSL证书文件放置在 `./ssl/` 目录
2. 取消注释 `docker-compose.yml` 中的SSL卷挂载
3. 配置 `nginx.conf` 文件

## 🛠 可用的npm脚本

```json
{
  "docker:build": "构建Docker镜像",
  "docker:run": "运行Docker容器",
  "docker:stop": "停止并删除容器",
  "docker:compose:up": "启动Docker Compose服务",
  "docker:compose:down": "停止Docker Compose服务",
  "docker:compose:logs": "查看服务日志",
  "docker:clean": "清理Docker系统和镜像"
}
```

## 🔍 故障排除

### 构建失败
1. 检查Docker是否正常运行
2. 确保网络连接正常
3. 尝试使用国内镜像源

### 容器无法启动
1. 检查端口是否被占用
2. 查看容器日志：`docker logs apifox-tool`
3. 检查健康检查状态

### 网络问题
1. 确保防火墙允许5173端口
2. 检查Docker网络配置
3. 验证容器间通信

## 📊 监控和日志

```bash
# 查看容器状态
docker ps

# 查看应用日志
docker logs -f apifox-tool

# 查看资源使用情况
docker stats apifox-tool

# 进入容器调试
docker exec -it apifox-tool /bin/bash
```

## 🎯 性能优化

1. **镜像优化**：使用多阶段构建，减少最终镜像大小
2. **缓存优化**：合理安排Dockerfile层级，提高构建速度
3. **资源限制**：在生产环境中设置内存和CPU限制
4. **日志管理**：配置日志轮转，避免磁盘空间不足

---

🎉 **恭喜！您的Java实体类转Apifox JSON Schema工具现已支持Docker一键部署！**

访问 `http://localhost:5173` 开始使用应用。