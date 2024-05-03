import { Plugin, openTab, showMessage } from "siyuan";
import Inbox from "@/components/inbox.svelte";
import { messagesStore, uiErrorsStore, dumpStore } from "./libs/store";
import { SettingUtils } from "./libs/setting-utils";
import { Telegram } from "./libs/telegram";
import { BotTokenRequiredError } from "./libs/errors";
import { createDailyNote, lsNotebooks, prependBlock } from "./api";
import {
  SETTINGS_STORAGE_NAME,
  STORAGE_NAME,
  DOCK_TYPE,
  PLUGIN_NAME,
} from "./libs/constants";
import log from "./libs/logger";

export default class SiyuanInboxTelegramPlugin extends Plugin {
  // private isMobile: boolean;
  private settingUtils: SettingUtils;
  private telegram: Telegram;

  async onload() {
    log.info(this.i18n.helloPlugin);
    this.data[STORAGE_NAME] = (await this.loadData(STORAGE_NAME)) || {};
    messagesStore.set(this.data[STORAGE_NAME].messages || []);
    uiErrorsStore.set([]);
    log.debug("Plugin storage", this.data[STORAGE_NAME]);

    // const frontEnd = getFrontend();
    // this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";
    // 图标的制作参见帮助文档
    this.addIcons(`<symbol id="iconTelegram" viewBox="0 0 256 256">
<path d="M88,134.87236,224.11223,36.56908l.00168-.00367a7.87244,7.87244,0,0,0-6.22314-.15014L33.33393,108.91975a8,8,0,0,0,1.35629,15.29065Z"></path> </g> <g opacity="0.2"> <path d="M132.90708,174.39059l-31.25023,31.25023A8,8,0,0,1,88,199.984v-65.1116Z"></path> </g> <path d="M231.25586,31.73635a15.9634,15.9634,0,0,0-16.29-2.76758L30.40869,101.47365a15.99988,15.99988,0,0,0,2.7124,30.58106L80,141.43069V199.9844a15.99415,15.99415,0,0,0,27.31348,11.31347L133.25684,185.355l39.376,34.65088a15.86863,15.86863,0,0,0,10.51709,4.00293,16.15674,16.15674,0,0,0,4.96338-.78711,15.86491,15.86491,0,0,0,10.68457-11.65332L236.41162,47.43557A15.96073,15.96073,0,0,0,231.25586,31.73635ZM86.14648,126.34279l-49.88574-9.977L175.94238,61.49026ZM96,199.97658V152.56887l25.21973,22.1936Zm87.20215,8.01758L100.81006,135.4883l118.64453-85.687Z"></path>
</symbol>`);

    this.addDock({
      config: {
        position: "LeftBottom",
        size: { width: 200, height: 0 },
        icon: "iconTelegram",
        title: this.i18n.dock.title,
        hotkey: "⌥⌘W",
      },
      data: {
        text: this.i18n.dock.loading,
      },
      type: DOCK_TYPE,
      init: (dock) => {
        const refreshHook = () => {
          if(!this.telegram) return;
          this.telegram.getInboxMessages().then((res) => {
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
        };

        const moveMessageHook = async () => {
          const selectedNotebook = this.settingUtils.get("selectedNotebook");
          if (selectedNotebook) {
            const dailyPage = await createDailyNote(selectedNotebook);
            openTab({
              app: this.app,
              doc: {
                id: dailyPage.id,
                zoomIn: false,
              },
            });
            this.data[STORAGE_NAME].messages = dumpStore();

            const checkedMessages = this.data[STORAGE_NAME].messages.filter(
              (message) => message.checked
            );
            const uncheckedMessages = this.data[STORAGE_NAME].messages.filter(
              (message) =>
                !message.checked || !message.hasOwnProperty("checked")
            );

            if (checkedMessages.length === 0 && uncheckedMessages.length > 0) {
              uncheckedMessages.forEach((element) => {
                prependBlock(
                  "markdown",
                  `- ${element.text} ​#inbox`,
                  dailyPage.id
                );
              });
              this.data[STORAGE_NAME].messages = [];
              messagesStore.set(this.data[STORAGE_NAME].messages);
            } else {
              checkedMessages.forEach((element) => {
                prependBlock(
                  "markdown",
                  `- ${element.text} ​#inbox`,
                  dailyPage.id
                );
              });
              this.data[STORAGE_NAME].messages = uncheckedMessages;
              messagesStore.set(this.data[STORAGE_NAME].messages);
            }

            this.saveData(STORAGE_NAME, this.data[STORAGE_NAME]);
          } else {
            log.warn(this.i18n.errors.noSelectedNotebook);
            this.showUIMessage(
              this.i18n.errors.noSelectedNotebook,
              3000,
              "info"
            );
          }
        };

        new Inbox({
          target: dock.element,
          props: {
            i18n: this.i18n,
            refreshHook,
            deleteHook,
            moveMessageHook,
          },
        });
      },
    });

    this.settingUtils = new SettingUtils({
      plugin: this,
      name: SETTINGS_STORAGE_NAME,
      callback: () => {
        window.location.reload();
      },
    });

    const notebooksResponse = await lsNotebooks();
    const notebooksOptions = notebooksResponse.notebooks.reduce(
      (acc, notebook) => {
        // Use notebook.id as the key and notebook.name as the value
        acc[notebook.id] = notebook.name;
        return acc;
      },
      {}
    );

    this.settingUtils.addItem({
      key: "selectedNotebook",
      value: "",
      type: "select",
      title: this.i18n.settings.selectedNotebook.title,
      description: this.i18n.settings.selectedNotebook.description,
      options: notebooksOptions,
      action: {
        callback: () => {
          this.settingUtils.takeAndSave("selectedNotebook");
        },
      },
    });

    this.settingUtils.addItem({
      key: "botToken",
      value: "",
      type: "textinput",
      title: this.i18n.settings.botToken.title,
      description: this.i18n.settings.botToken.description,
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
      title: this.i18n.settings.pollingInterval.title,
      description: this.i18n.settings.pollingInterval.description,
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
    //   title: this.i18n.settings.inboxName.title,
    //   description: this.i18n.settings.inboxName.description,
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
      title: this.i18n.settings.authorizedUser.title,
      description: this.i18n.settings.authorizedUser.description,
      action: {
        callback: () => {
          this.settingUtils.takeAndSave("authorizedUser");
        },
      },
    });
  }

  showUIMessage(
    text: string,
    timeout?: number,
    type?: "info" | "error",
    id?: string
  ): void {
    showMessage(`[${PLUGIN_NAME}]<br/>${text}<br/>`, timeout, type, id);
  }

  onLayoutReady() {
    this.settingUtils
      .load()
      .then(() => {
        try {
          this.telegram = new Telegram({
            botToken: this.settingUtils.get("botToken"),
            updateId: this.data[STORAGE_NAME].updateId,
            pollingInterval: this.settingUtils.get("pollingInterval") * 1000,
            authorizedUser: this.settingUtils.get("authorizedUser"),
            i18n: this.i18n,
            callback: (res) => {
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
            },
          });

          this.telegram.start();
        } catch (error) {
          log.error(this.i18n.errors.initTelegram, error);

          if (error instanceof BotTokenRequiredError) {
            console.error(`BotTokenRequiredError: ${error.message}`);
            this.showUIMessage(
              this.i18n.errors.BotTokenRequiredError,
              0,
              "error"
            );
            uiErrorsStore.set([this.i18n.errors.BotTokenRequiredError]);
          }
        }
      })
      .catch((error) => {
        log.error(this.i18n.settings.loadError, error);
      });
    // log.debug(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
  }

  async onunload() {
    await this.telegram.terminate();
    log.debug(this.i18n.byePlugin);
    // log.debug("onunload");
  }

  uninstall() {
    // log.debug("uninstall");
  }
}
