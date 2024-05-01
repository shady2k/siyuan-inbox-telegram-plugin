import {
  Plugin,
  openTab,
  getFrontend
} from "siyuan";
import "@/index.scss";
import Inbox from "@/components/inbox.svelte";
import { messagesStore, dumpStore } from "./libs/store";
import { SettingUtils } from "./libs/setting-utils";
import { getInboxMessages } from "./libs/telegram";
import { createDailyNote, lsNotebooks, prependBlock } from "./api";
import { SETTINGS_STORAGE_NAME, STORAGE_NAME, DOCK_TYPE, PLUGIN_NAME } from "./libs/constants";
import log from "./libs/logger";

export default class SiyuanInboxTelegramPlugin extends Plugin {
  private isMobile: boolean;
  private settingUtils: SettingUtils;

  async onload() {
    log.info(this.i18n.helloPlugin);
    this.data[STORAGE_NAME] = (await this.loadData(STORAGE_NAME)) || {};
    messagesStore.set(this.data[STORAGE_NAME].messages || []);
    log.debug("Plugin storage", this.data[STORAGE_NAME]);

    const frontEnd = getFrontend();
    this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
    // 图标的制作参见帮助文档
    this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
<path d="M13.667 17.333c0 0.92-0.747 1.667-1.667 1.667s-1.667-0.747-1.667-1.667 0.747-1.667 1.667-1.667 1.667 0.747 1.667 1.667zM20 15.667c-0.92 0-1.667 0.747-1.667 1.667s0.747 1.667 1.667 1.667 1.667-0.747 1.667-1.667-0.747-1.667-1.667-1.667zM29.333 16c0 7.36-5.973 13.333-13.333 13.333s-13.333-5.973-13.333-13.333 5.973-13.333 13.333-13.333 13.333 5.973 13.333 13.333zM14.213 5.493c1.867 3.093 5.253 5.173 9.12 5.173 0.613 0 1.213-0.067 1.787-0.16-1.867-3.093-5.253-5.173-9.12-5.173-0.613 0-1.213 0.067-1.787 0.16zM5.893 12.627c2.28-1.293 4.040-3.4 4.88-5.92-2.28 1.293-4.040 3.4-4.88 5.92zM26.667 16c0-1.040-0.16-2.040-0.44-2.987-0.933 0.2-1.893 0.32-2.893 0.32-4.173 0-7.893-1.92-10.347-4.92-1.4 3.413-4.187 6.093-7.653 7.4 0.013 0.053 0 0.12 0 0.187 0 5.88 4.787 10.667 10.667 10.667s10.667-4.787 10.667-10.667z"></path>
</symbol>
<symbol id="iconSaving" viewBox="0 0 32 32">
<path d="M20 13.333c0-0.733 0.6-1.333 1.333-1.333s1.333 0.6 1.333 1.333c0 0.733-0.6 1.333-1.333 1.333s-1.333-0.6-1.333-1.333zM10.667 12h6.667v-2.667h-6.667v2.667zM29.333 10v9.293l-3.76 1.253-2.24 7.453h-7.333v-2.667h-2.667v2.667h-7.333c0 0-3.333-11.28-3.333-15.333s3.28-7.333 7.333-7.333h6.667c1.213-1.613 3.147-2.667 5.333-2.667 1.107 0 2 0.893 2 2 0 0.28-0.053 0.533-0.16 0.773-0.187 0.453-0.347 0.973-0.427 1.533l3.027 3.027h2.893zM26.667 12.667h-1.333l-4.667-4.667c0-0.867 0.12-1.72 0.347-2.547-1.293 0.333-2.347 1.293-2.787 2.547h-8.227c-2.573 0-4.667 2.093-4.667 4.667 0 2.507 1.627 8.867 2.68 12.667h2.653v-2.667h8v2.667h2.68l2.067-6.867 3.253-1.093v-4.707z"></path>
</symbol>`);

    this.addDock({
      config: {
        position: "LeftBottom",
        size: { width: 200, height: 0 },
        icon: "iconInbox",
        title: "Inbox Telegram",
        hotkey: "⌥⌘W",
      },
      data: {
        text: "Loading...",
      },
      type: DOCK_TYPE,
      init: (dock) => {
        const refreshHook = () => {
          getInboxMessages({
            botToken: this.settingUtils.get("botToken"),
            updateId: this.data[STORAGE_NAME].updateId,
            authorizedUser: this.settingUtils.get("authorizedUser"),
          }).then((res) => {
            if (res?.updateId) {
              this.data[STORAGE_NAME].updateId = res.updateId;
            }

            if (res?.messages) {
              messagesStore.update((currentItems) => [
                ...res.messages,
                ...currentItems,
              ]);

              this.data[STORAGE_NAME].messages = dumpStore();
            }

            this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
          });
        };

        const deleteHook = () => {
          this.data[STORAGE_NAME].messages = dumpStore();
          this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
        }

        const moveMessageHook = async () => {
          const selectedNotebook = this.settingUtils.get("selectedNotebook");
          if (selectedNotebook) {
            const dailyPage = await createDailyNote(selectedNotebook);
            openTab({
              app: this.app,
              doc: {
                id: dailyPage.id,
                zoomIn: false
              }
            });
            this.data[STORAGE_NAME].messages = dumpStore();

            const checkedMessages = this.data[STORAGE_NAME].messages.filter(message => message.checked);
            const uncheckedMessages = this.data[STORAGE_NAME].messages.filter(message => !message.checked || !message.hasOwnProperty('checked'));

            if (checkedMessages.length === 0 && uncheckedMessages.length > 0) {
              uncheckedMessages.forEach(element => {
                prependBlock("markdown", `- ${element.text} ​#inbox`, dailyPage.id);
              });
              this.data[STORAGE_NAME].messages = [];
              messagesStore.set(this.data[STORAGE_NAME].messages);
            } else {
              checkedMessages.forEach(element => {
                prependBlock("markdown", `- ${element.text} ​#inbox`, dailyPage.id);
              });
              this.data[STORAGE_NAME].messages = uncheckedMessages;
              messagesStore.set(this.data[STORAGE_NAME].messages);
            }

            this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
          } else {
            console.warn("No selected notebook");
          }
        };
        
        refreshHook();

        new Inbox({
          target: dock.element,
          props: {
            refreshHook,
            deleteHook,
            moveMessageHook
          },
        });
      }
    });

    this.settingUtils = new SettingUtils({
      plugin: this,
      name: SETTINGS_STORAGE_NAME,
    });
    
    const notebooksResponse = await lsNotebooks();
    const notebooksOptions = notebooksResponse.notebooks.reduce((acc, notebook) => {
      // Use notebook.id as the key and notebook.name as the value
      acc[notebook.id] = notebook.name;
      return acc;
    }, {});

    this.settingUtils.addItem({
      key: "selectedNotebook",
      value: "",
      type: "select",
      title: "Notebook",
      description:
        "This is the notebook you want to use. If you don't have any notebooks, please create one first",
      options: notebooksOptions,
      action: {
        callback: () => {
          this.settingUtils.takeAndSave("botToken");
        },
      },
    });

    this.settingUtils.addItem({
      key: "botToken",
      value: "",
      type: "textinput",
      title: "Bot token",
      description:
        "Telegram Bot token. In order to start you need to create Telegram bot: https://core.telegram.org/bots#3-how-do-i-create-a-bot. Create a bot with BotFather, which is essentially a bot used to create other bots. The command you need is /newbot. After you choose title, BotFaher give you the token",
      action: {
        callback: () => {
          this.settingUtils.takeAndSave("botToken");
        },
      },
    });

    this.settingUtils.addItem({
      key: "pollingInterval",
      value: 60,
      type: "number",
      title: "Polling interval (seconds)",
      description:
        "This interval will be used to get new messages from Telegram bot",
      action: {
        callback: () => {
          this.settingUtils.takeAndSave("pollingInterval");
        },
      },
    });

    // this.settingUtils.addItem({
    //   key: "inboxName",
    //   value: "#inbox",
    //   type: "textinput",
    //   title: "Title in daily journal",
    //   description:
    //     "Messages will be pasted in daily journal into block with text, specified in inboxName property. Replace it in case of necessary. If you don't want to group messages, set inboxName property to null. In this case messages will be inserted directly into page block",
    //   action: {
    //     callback: () => {
    //       this.settingUtils.takeAndSave("inboxName");
    //     },
    //   },
    // });

    this.settingUtils.addItem({
      key: "authorizedUser",
      value: "",
      type: "textinput",
      title: "Authorized username from Telegram",
      description:
        "Be sure to add your username here, because your recently created bot is publicly findable and other peoples may send messages to your bot. If you leave this empty - all messages from all users will be processed!",
      action: {
        callback: () => {
          this.settingUtils.takeAndSave("authorizedUser");
        },
      },
    });

    try {
      this.settingUtils.load();
    } catch (error) {
      log.error(
        "Error loading settings storage, probly empty config json:",
        error
      );
    }
  }

  onLayoutReady() {
    // this.settingUtils.load();
    // log.debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
  }

  async onunload() {
    log.debug(this.i18n.byePlugin);
    // log.debug("onunload");
  }

  uninstall() {
    // log.debug("uninstall");
  }
}
