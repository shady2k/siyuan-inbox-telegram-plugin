import { forwardProxy } from "../api";

interface ITelegramResponse {
  messages: IMessagesList[];
  updateId: number | undefined;
}

interface IMessagesList {
  chatId: number;
  text: string;
}

interface IUpdate {
  update_id: number;
  message?: {
    date: number;
    text: string;
    from: {
      username: string;
    };
    chat: {
      id: number;
    };
  };
  channel_post?: {
    date: number;
    text: string;
    chat: {
      id: number;
    };
  };
}

interface IPayload {
  offset?: number;
}

export async function getInboxMessages(opts: any): Promise<ITelegramResponse> {
  let updateId: number;
  let telegramResponse;
  let messages: IMessagesList[] = [];

  const payload: IPayload = {
    ...(opts.updateId && {
      offset: opts.updateId + 1,
    }),
  };

  const authorizedUser = opts.authorizedUser || "";

  const proxyResponse = await forwardProxy(
    `https://api.telegram.org/bot${opts.botToken}/getUpdates`,
    "POST",
    payload,
    [],
    7000,
    "application/json"
  );

  if (proxyResponse && proxyResponse.body && proxyResponse.status === 200) {
    telegramResponse = JSON.parse(proxyResponse.body);
    if (telegramResponse && telegramResponse.ok) {
      const resArr = telegramResponse.result;

      resArr.forEach((element: IUpdate) => {
        updateId = element.update_id;
        if (
          element.message &&
          element.message.text &&
          element.message.date &&
          element.message.from.username
        ) {
          if(authorizedUser && authorizedUser.length > 0 && authorizedUser !== element.message.from.username) {
            console.warn(
              "Ignore messages, user not authorized",
              element,
            )
            return
          }

          const text = element.message.text;
          console.log({
            name: "Push in group messages",
            element: element.message.chat.id,
            text,
          });
          messages.push({
            chatId: element.message.chat.id,
            text,
          });
        }
      });
    }
  }

  return {
    messages,
    updateId,
  };
}
