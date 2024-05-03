export class BotTokenRequiredError extends Error {
  constructor() {
    super("botToken is required");
    this.name = "BotTokenRequiredError";
  }
}

export class FailedToGetMessageError extends Error {
  constructor() {
    super("Failed to get inbox messages");
    this.name = "FailedToGetMessageError";
  }
}
