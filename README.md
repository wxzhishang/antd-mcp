# Ant Design MCP Server

一个基于 Model Context Protocol (MCP) 的 Ant Design 组件服务器，为 AI 助手提供丰富的 Ant Design 组件文档、示例和最佳实践。

## 🚀 功能特性

- **组件文档查询**：获取 Ant Design 所有组件的详细文档
- **示例代码获取**：提供每个组件的完整示例代码
- **API 文档查询**：查询组件的 API 属性和方法
- **最佳实践指导**：获取组件使用的最佳实践建议
- **更新日志查询**：查看组件的版本更新历史
- **多版本支持**：支持切换不同版本的 Ant Design

## 📦 安装

### 从源码构建

```bash
# 克隆仓库
git clone <repository-url>
cd antd-MCP

# 安装依赖
npm install

# 构建项目
npm run build

```

## 🛠️ 使用方法

### 启动 MCP 服务器

构建完项目后可以选择在本地的客户端配置MCP。

具体配置方法可以参考客户端说明。

以cursor为例，可以在Cursor Settings中的Tools中配置：

```json
{
  "mcpServers": {
    "antd-components-local": {
      "command": "node",
      "args": [
        "<你拉取仓库的地址>/antd-MCP/dist/cli.js"
      ]
    }
  }
}
```

### 提取 Ant Design 数据

如果需要从本地的 Ant Design 仓库提取最新数据：

```bash
# 先克隆antd仓库到本地
git clone https://github.com/ant-design/ant-design

# 执行脚本
npm run extract

# 可能会出现更新日志无法正常获取的现象，可以执行以下脚本后重新执行extract脚本
npm run generate-component-changelog
```

### 爬取最佳实践

此功能还待完善，写得脚本太烂了，目前爬取的数据较混乱，如果有大佬有好的思路欢迎PR

```bash
# 爬取全部组件的最佳实践（需要提前提取Ant Design数据）
npm run crawl-practices

# 爬取指定组件的最佳实践
npm run crawl-practices Button ...
```

### 在 MCP 客户端中使用

将此服务器添加到您的 MCP 客户端配置中，然后可以使用以下功能：

- 📋 `list-components` - 列出所有可用的 Ant Design 组件
- 📖 `get-component-docs` - 获取指定组件的文档
- 💡 `get-component-examples` - 获取组件示例代码
- 🔍 `get-component-api` - 查询组件的 API 文档
- ⭐ `get-best-practices` - 获取组件使用的最佳实践
- 📝 `get-component-changelog` - 查看组件更新历史
- 🔄 `change-component-version` - 切换 Ant Design 版本

## 📁 项目结构

```
antd-MCP/
├── src/                    # 源代码
│   ├── tools/             # MCP 工具实现
│   ├── scripts/           # 脚本工具
│   ├── utils/             # 工具函数
│   └── index.ts           # 主入口文件
├── docs/                  # Ant Design 组件文档
│   └── components/        # 各组件文档和示例
├── cli.ts                 # 命令行入口
└── package.json           # 项目配置
```

## 🔧 开发

### 开发环境启动

可以利用MCP提供的线上调试器调试

### 构建项目

```bash
npm run build
```

### 调试和检查

```bash
npm run inspector
```

### 生成组件更新日志

```bash
npm run generate-component-changelog
```

## 📋 系统要求

- Node.js >= 16.0.0
- npm 或 yarn

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 开启 Pull Request

### 分支命名规范

- `feat/` - 新功能
- `fix/` - 问题修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关