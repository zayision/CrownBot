const Command = require("../handler/Command");
class BetaCommand extends Command {
  constructor() {
    super({
      name: "beta",
      description: "Toggles beta features in a server.",
      usage: ["beta"]
    });
  }

  async run(client, message, args) {}
}

module.exports = BetaCommand;
