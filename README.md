# 10分钟快速起一个AI Chat项目demo

这是一个基于React和DeepSeek API的AI聊天应用demo，支持流式输出、历史记忆和本地存储功能。通过这个项目，你可以快速搭建一个功能完整的AI聊天应用。

## 技术栈

- React 19
- TypeScript
- Vite
- Ant Design 5.x
- OpenAI SDK
- DeepSeek API

## 功能特点

- ✨ 流式输出：实时显示AI回复
- 💾 本地存储：自动保存聊天记录
- 🔄 历史记忆：支持上下文对话
- 🎨 响应式UI：美观的聊天界面
- 🚀 快速部署：简单的环境配置

## 快速开始

### 环境准备

确保你的开发环境已安装：

- Node.js (推荐 18.x 以上版本)
- npm 或 yarn

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn
```

### 配置环境变量

1. 在项目根目录创建 `.env` 文件
2. 添加你的 DeepSeek API Key：

```env
VITE_AI_KEY=your_api_key_here
```

### 启动项目

```bash
# 开发模式
npm run dev
# 或
yarn dev
```

访问 `http://localhost:5173` 即可看到项目运行效果。

## 项目结构

```
src/
  ├── App.tsx      # 主应用组件
  ├── main.tsx     # 入口文件
  ├── App.css      # 样式文件
  └── stores/      # 状态管理
```

## 核心功能说明

### 流式输出

使用 OpenAI SDK 的流式API实现实时响应：

```typescript
const stream = await openai.chat.completions.create({
  messages: [...messages, { role: "user", content: input }],
  model: selectedModel,
  stream: true
});
```

### 本地存储

使用 localStorage 保存聊天记录：

```typescript
const [messages, setMessages] = useState<Message[]>(() => {
  const saved = localStorage.getItem('chat-messages');
  return saved ? JSON.parse(saved) : [];
});
```

## 开发建议

1. 在生产环境中，建议将 API Key 存储在后端服务器
2. 可以添加错误重试机制提高可靠性
3. 考虑添加消息长度限制和速率限制

## 许可证

MIT