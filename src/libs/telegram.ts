import { forwardProxy, upload } from "../api";
import log from "./logger";
import { BotTokenRequiredError } from "./errors";

export class Telegram {
  pollingInterval: number;
  isProcessing: boolean;
  isStopped: boolean;
  botToken: string;
  updateId: number;
  authorizedUser: string;
  i18n: any;
  callback: (messages: ITelegramResponse | null, error?: Error) => void;

  constructor(opts: {
    botToken: string;
    pollingInterval?: number;
    updateId?: number;
    authorizedUser?: string;
    i18n?: any;
    callback: (messages: ITelegramResponse | null, error?: Error) => void;
  }) {
    this.isProcessing = false;
    this.isStopped = false;

    if (!opts.i18n) {
      throw new Error("i18n is required");
    }

    if (!opts.botToken) {
      throw new BotTokenRequiredError();
    }

    this.i18n = opts.i18n;
    this.pollingInterval = opts.pollingInterval || 0;
    this.botToken = opts.botToken;
    this.updateId = opts.updateId || 0;
    this.authorizedUser = opts.authorizedUser || "";
    this.callback = opts.callback;

    log.debug(this.i18n.log.InstanceInitialized, {
      pollingInterval: this.pollingInterval,
      botToken: this.botToken,
      updateId: this.updateId,
      authorizedUser: this.authorizedUser,
    });
  }

  start() {
    log.info(this.i18n.log.startPolling, this.pollingInterval);
    this._process();
  }

  stop() {
    log.info(this.i18n.log.stopPolling);
    this.isStopped = true;
  }

  async terminate() {
    log.debug(this.i18n.log.InstanceTerminated);
    this.stop();
    while (this.isProcessing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private async _process() {
    if (this.isStopped) return;

    this.isProcessing = true;

    try {
      const messages = await this.getInboxMessages();
      this.callback(messages, undefined); // Explicitly pass undefined for error
    } catch (error) {
      log.error(this.i18n.errors.ProcessingMessagesError, error);
    } finally {
      this.isProcessing = false;
      if (!this.isStopped && this.pollingInterval > 0) {
        setTimeout(() => this._process(), this.pollingInterval);
      }
    }
  }

  async handleFile(message): Promise<IMessageAttachment[]> {
    if (!message || !message.document) {
      return [];
    }

    const { file_name, mime_type, file_id } = message.document;
    log.debug("handleFile", {
      fileName: file_name,
      mimeType: mime_type,
      fileId: file_id,
    });

    const contentType = mime_type;

    try {
      const proxyGetFileResponse = await forwardProxy(
        `https://api.telegram.org/bot${this.botToken}/getFile?file_id=${file_id}`,
        "GET",
        {},
        [],
        7000,
        "application/json"
      );

      const getFileResponse: ITelegramFileResponse = JSON.parse(
        proxyGetFileResponse.body
      ).result;
      log.debug("getFileResponse", getFileResponse);
      const file_path = getFileResponse.file_path;

      const proxyDownloadFileResponse = await forwardProxy(
        `https://api.telegram.org/file/bot${this.botToken}/${file_path}`,
        "GET",
        {},
        [],
        7000,
        "application/json",
        "base64"
      );

      const decodedData = Buffer.from(proxyDownloadFileResponse.body, "base64");
      const blob = new Blob([decodedData], { type: contentType });
      const file = new File([blob], file_name, { type: contentType });

      const uploadResult = await upload("/assets/", [file]);
      log.debug("uploadResult", uploadResult);

      const assets: IMessageAttachment[] = Object.entries(uploadResult.succMap).map(
        ([key, value]) => ({
          fileName: key,
          path: value,
        })
      );

      return assets;
    } catch (error) {
      log.error(this.i18n.errors.ProcessingMessagesError, error);
      return [];
    }
  }

  async getInboxMessages(): Promise<ITelegramResponse | null> {
    let updateId: number;
    let messages: IMessagesList[] = [];

    const payload: IPayload = this.updateId
      ? { offset: this.updateId + 1 }
      : {};

    try {
      const proxyResponse = await forwardProxy(
        `https://api.telegram.org/bot${this.botToken}/getUpdates`,
        "POST",
        payload,
        [],
        7000,
        "application/json"
      );

      if (proxyResponse && proxyResponse.body && proxyResponse.status === 200) {
        let telegramResponse;
        try {
          telegramResponse = JSON.parse(proxyResponse.body);
        } catch (error) {
          log.error(this.i18n.errors.jsonParseError, error);
          return null;
        }
        log.debug(this.i18n.log.telegramResponse, telegramResponse);

        if (telegramResponse.ok) {
          const messagePromises = telegramResponse.result.map(
            async (element: IUpdate) => {
              updateId = element.update_id;
              this.updateId = updateId;
              const message = element.message;
              if (message && message.date && message.from.username) {
                if (
                  this.authorizedUser &&
                  this.authorizedUser !== message.from.username
                ) {
                  log.warn(this.i18n.log.unauthorizedUserMessage, element);
                  return null; // Return null for unauthorized messages
                }

                const attachments = [];
                attachments.push(...(await this.handleFile(message)));

                if (!message.text && attachments.length === 0) return;

                const result = {
                  id: message.message_id,
                  date: message.date,
                  chatId: message.chat.id,
                  text: message.text,
                  attachments,
                };

                log.debug("getInboxMessages", result);

                return result;
              }
              return null;
            }
          );

          const processedMessages = await Promise.all(messagePromises);
          messages = processedMessages.filter(Boolean);
        } else {
          return null;
        }
      } else {
        log.error(this.i18n.errors.InvalidProxyResponseError, proxyResponse);
        return null;
      }
    } catch (error) {
      log.error(this.i18n.errors.GetMessagesError, error);
      throw error;
    }

    return {
      messages,
      updateId,
    };
  }
}
