interface ITelegramResponse {
    messages: IMessagesList[];
    updateId: number | undefined;
  }
  
  interface IMessagesList {
    date: number;
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