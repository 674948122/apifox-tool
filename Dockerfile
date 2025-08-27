# 多阶段构建 Dockerfile
# 阶段1: 构建前端
FROM node:18 AS frontend-builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括devDependencies用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建后端
RUN npx tsc -p tsconfig.backend.json

# 阶段2: 生产环境
FROM node:18 AS production

WORKDIR /app

# 安装 dumb-init 用于信号处理
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -r nodejs --gid=1001 && useradd -r -g nodejs --uid=1001 --create-home --shell /bin/bash nextjs

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制后端源代码和配置文件
COPY tsconfig.json ./
COPY vercel.json ./

# 从构建阶段复制编译后的代码
COPY --from=frontend-builder /app/dist/api ./api
COPY --from=frontend-builder /app/dist/shared ./shared
# 复制本地构建的前端文件
COPY dist/index.html ./frontend-dist/
COPY dist/favicon.svg ./frontend-dist/
COPY dist/assets ./frontend-dist/assets

# 更改文件所有者
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "api/server.js"]