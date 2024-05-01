# SiYuan Inbox Telegram Plugin

[中文版](./README_zh_CN.md)

This plugin integrates Telegram with SiYuan, allowing users to manage their Telegram messages directly within SiYuan using Telegram bot. It supports creating daily notes, managing messages, and more.

## Features

- **Telegram Integration**: Manage your Telegram messages directly from SiYuan.
- **Daily Notes Creation**: Automatically create daily notes with messages.
- **Message Management**: Organize and categorize your messages within SiYuan.
- **Customizable Settings**: Adjust the plugin's behavior to fit your workflow.

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) for more information.

1. **Clone the Repository**: Clone this repository to your local machine.

   ```bash
   git clone https://github.com/yourusername/siyuan-inbox-telegram-plugin.git
   ```

2. **Install Dependencies**: Ensure you have Node.js and pnpm installed. Then, run the following command in the project directory:

   ```bash
   pnpm i
   ```

3. **Create Symbolic Links**: Run the following command to create symbolic links for local development:

   ```bash
   pnpm run make-link
   ```

4. **Run the Plugin**: Start the development server:

   ```bash
   pnpm run dev
   ```

5. **Enable the Plugin in SiYuan**: Open SiYuan, go to the plugins section, and enable the "SiYuan Inbox Telegram Plugin".

## Installation

1. **Build the Plugin**: Run the following command to build the plugin:

   ```bash
   pnpm run build
   ```

2. **Install the Plugin**: Copy the `dist` folder to your SiYuan plugins directory.

## Usage

- **Accessing the Plugin**: Once installed, you can access the plugin from the SiYuan sidebar.
- **Managing Messages**: Use the plugin's UI to manage your Telegram messages within SiYuan.
- **Creating Daily Notes**: The plugin can automatically create daily notes with your messages.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.