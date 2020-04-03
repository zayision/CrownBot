const Command = require("../handler/Command");
class OptInCommand extends Command {
  constructor() {
    super({
      name: "opt",
      description: "Opts a server in to beta features.",
      usage: ["opt"]
    });
  }

  async run(client, message, args) {}
}

module.exports = OptInCommand;
