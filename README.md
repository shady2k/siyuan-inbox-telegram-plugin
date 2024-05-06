# SiYuan Inbox Telegram Plugin

[中文版](./README_zh_CN.md)

This plugin integrates Telegram with SiYuan, allowing users to manage their Telegram messages directly within SiYuan using a Telegram bot. It supports creating daily notes, managing messages, and more.

## Features

- **Telegram Integration**: Manage your Telegram messages directly from SiYuan.
- **Daily Notes Creation**: Automatically create daily notes with messages.
- **Message Management**: Organize and categorize your messages within SiYuan.
- **Customizable Settings**: Adjust the plugin's behavior to fit your workflow.

## Getting Started

1. **Create a Telegram Bot**: Follow the instructions on [Telegram's BotFather page](https://core.telegram.org/bots#3-how-do-i-create-a-bot) to create a new bot. Use the `/newbot` command to start the process. After choosing a name for your bot, BotFather will provide you with a token.

2. **Configure the Plugin**:
   - Paste the Telegram bot token into the plugin settings under `Bot token`.
   - In the `Notebook` field, select the notebook you want to use. If you don't have any notebooks, please create one first.
   - Add your Telegram username in the `Authorized username from Telegram` field. This is crucial for security, as your bot is publicly findable, and you don't want unauthorized users sending messages to it. If left empty, all messages from all users will be processed.
   - Adjust the polling interval under `Polling interval (seconds)`. This interval determines how often the plugin checks for new messages from the Telegram bot. If you want to disable polling, just set the value to 0.

3. **Start Using the Plugin**:
   - Messages will appear in the `Telegram Inbox Plugin` dock, located in the bottom left corner of SiYuan. You can add these messages to your daily journal.
   - Open a chat with your bot in Telegram and type the `/start` command.
   - Send any message to this chat, and it will be added to your SiYuan in the `Telegram Inbox Plugin` dock within the polling interval you set (default is 60 seconds).

## Usage Notice

- Messages will be pulled from Telegram only if the SiYuan application is running.
- If the SiYuan application is not opened for more than 24 hours, messages from Telegram will be lost, and you will need to resend them.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for more information on how to contribute to this project.

## Installation

1. **Build the Plugin**: Run `pnpm run build` to build the plugin.
2. **Install the Plugin**: Copy the `dist` folder to your SiYuan plugins directory.

## Usage

- **Accessing the Plugin**: Once installed, access the plugin from the SiYuan sidebar.
- **Managing Messages**: Use the plugin's UI to manage your Telegram messages within SiYuan.
- **Creating Daily Notes**: The plugin can automatically create daily notes with your messages.

## Troubleshooting

If you encounter any issues, please check the [FAQ section](FAQ.md) or open an issue on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.