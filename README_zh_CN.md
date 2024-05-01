# SiYuan Inbox Telegram 插件

[English](./README.md)

该插件将 Telegram 与 SiYuan 集成，允许用户使用 Telegram 机器人直接在 SiYuan 中管理他们的 Telegram 消息。它支持创建每日笔记、管理消息等功能。

## 特性

- **Telegram 集成**：直接从 SiYuan 管理您的 Telegram 消息。
- **每日笔记创建**：自动用消息创建每日笔记。
- **消息管理**：在 SiYuan 内组织和分类您的消息。
- **可定制设置**：调整插件的行为以适应您的工作流程。

## 贡献

欢迎贡献！请阅读[贡献指南](CONTRIBUTING.md)了解更多信息。

1. **克隆仓库**：将此仓库克隆到您的本地机器。

   ```bash
   git clone https://github.com/yourusername/siyuan-inbox-telegram-plugin.git
   ```

2. **安装依赖**：确保您安装了 Node.js 和 pnpm。然后，在项目目录中运行以下命令：

   ```bash
   pnpm i
   ```

3. **创建符号链接**：运行以下命令为本地开发创建符号链接：

   ```bash
   pnpm run make-link
   ```

4. **运行插件**：启动开发服务器：

   ```bash
   pnpm run dev
   ```

5. **在 SiYuan 中启用插件**：打开 SiYuan，前往插件部分，并启用“SiYuan Inbox Telegram 插件”。

## 安装

1. **构建插件**：运行以下命令构建插件：

   ```bash
   pnpm run build
   ```

2. **安装插件**：将 `dist` 文件夹复制到您的 SiYuan 插件目录。

## 使用

- **访问插件**：安装后，您可以从 SiYuan 侧边栏访问插件。
- **管理消息**：使用插件的 UI 在 SiYuan 内管理您的 Telegram 消息。
- **创建每日笔记**：插件可以自动用您的消息创建每日笔记。

## 许可证

本项目根据 MIT 许可证授权。详情见 [LICENSE](LICENSE) 文件。