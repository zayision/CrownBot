const Command = require("../handler/Command");
class BetaCommand extends Command {
  constructor() {
    super({
      name: "beta",
      description: "Toggles beta features in a server.",
      usage: ["beta"]
    });
  }

  async run(client, message) {
    const server_prefix = client.getCachedPrefix(message);
    const { enable_beta, disable_beta, check_isbeta } = client.helpers;
    if (!message.member.hasPermission("MANAGE_GUILD")) {
      await client.notify({
        message,
        desc:
          "you do not have the permission (``MANAGE_GUILD``) to execute this command.",
        reply: true
      });
      return;
    }
    const is_beta = check_isbeta(client, message);

    if (!is_beta) {
      await enable_beta(client, message);
      await client.notify({
        message,
        desc: `thanks! ^^; Beta features have been enabled in this server—run ``${server_prefix}beta`` again to disable; see \`\`${server_prefix}commands beta\`\` for the list of available beta commands.`,
        reply: true
      });
    } else {
      await disable_beta(client, message);
      await client.notify({
        message,
        desc: `beta features have been disabled in this server; run ``${server_prefix}beta`` again to enable.`,
        reply: true
      });
    }
  }
}

module.exports = BetaCommand;
