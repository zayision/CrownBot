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

    if (is_beta) {
    }
  }
}

module.exports = BetaCommand;
