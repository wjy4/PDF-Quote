# 基于官方 Node 镜像
FROM node:20-slim

# 安装依赖工具 & 中文字体 & Chromium 依赖
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    wget \
    ca-certificates \
    fonts-freefont-ttf \
    --no-install-recommends && \
    apt-get install -y \
    chromium \
    chromium-driver \
    chromium-common \
    libxss1 libgtk-3-0 libasound2 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libgbm1 libxrandr2 libu2f-udev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 设置 Puppeteer Chromium 路径
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 创建工作目录
WORKDIR /app

# 拷贝文件
COPY package*.json ./
RUN npm install

COPY . .

# 启动服务
CMD ["node", "index.js"]
