class Command {
  constructor(options) {
    this.name = options.name;
    this.description = options.description;
    this.usage = options.usage || [];
    this.aliases = options.aliases || [];
    this.hidden = options.hidden;
    this.ownerOnly = options.ownerOnly;
    this.examples = options.examples;
    this.beta = options.beta;
    this.allow_banned = options.allow_banned;
  }

  async execute(client, message, args) {
    if (this.ownerOnly && message.author.id !== client.ownerID) {
      return;
    }
    const is_banned = await this.check_ban(client, message);
    if (is_banned) return;
    if (this.beta) {
      const is_beta = await client.helpers.check_isbeta(client, message);
      if (!is_beta) return;
    }
    try {
      await this.run(client, message, args);
      await this.log(message);
    } catch (e) {
      console.error(e);
      await this.log(message, e.stack);
    }
  }

  async check_ban(client, message) {
    const { notify } = client.helpers;
    const ban_log = await client.models.bans
      .findOne({
        userID: message.author.id,
        guildID: { $in: [message.guild.id, "any"] }
      })
      .lean();
    const is_owner = message.author.id == client.ownerID;

    if (ban_log && !is_owner && !this.allow_banned) {
      if (ban_log.guildID === "any") {
        await notify({
          message,
          title: "Globally banned",
          description:
            "you are globally banned from accessing the bot; try `&about` to find the support server.",
          reply: true
        });
      } else {
        await notify({
          message,
          title: "User banned",
          description: "you are banned from accessing the bot in this guild.",
          reply: true
        });
      }
      return true;
    }
    return false;
  }

  async log(message, stack) {
    const data = {
      command_name: this.name,
      message_id: message.id,
      message_content: message.content,
      username: message.author.tag,
      user_ID: message.author.id,
      guild_name: message.guild.name,
      guild_ID: message.guild.id,
      channel_name: message.channel.name,
      channel_ID: message.channel.id,
      timestamp: `${new Date().toUTCString()}`,
      stack: `${stack || `none`}`
    };
    message.client.addLog(data);
  }
}

module.exports = Command;
