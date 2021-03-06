const Command = require("../handler/Command");
const BotEmbed = require("../classes/BotEmbed");

class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Lists the available commands.",
      usage: ["help", "help <command>"],
      aliases: ["h"],
      examples: ["help about", "help wp"]
    });
  }

  async run(client, message, args) {
    const server_prefix = client.getCachedPrefix(message);

    if (args[0]) {
      const command = client.commands
        .filter(e => !e.hidden)
        .find(x => x.name === args[0] || x.aliases.includes(args[0]));
      if (command) {
        var usage = Array.isArray(command.usage)
          ? command.usage
          : [command.usage];
        usage = usage.map(e => `\`\`${server_prefix}${e}\`\``);

        var aliases = command.aliases;
        aliases = aliases.map(e => `\`\`${server_prefix}${e}\`\``);
        var examples = !command.examples
          ? false
          : command.examples
              .map(example => {
                return `\`\`${server_prefix}${example}\`\``;
              })
              .join("\n");

        var examples = !command.examples
          ? false
          : command.examples
              .map(example => {
                return `\`\`${server_prefix}${example}\`\``;
              })
              .join("\n");

        const embed = new BotEmbed(message)
          .setTitle(command.name)
          .setDescription(command.description)
          .addField("Usage", usage)
          .addField("Aliases", aliases);

        if (examples) {
          embed.addField("Examples", examples);
        }
        message.channel.send(embed);
      }
    } else {
      const embed = new BotEmbed(message)
        .setTitle("Commands")
        .setDescription(
          "This is a list of the commands this bot offers. The prefix is ``" +
            server_prefix +
            "``."
        );

      client.commands
        .filter(e => !e.hidden)
        .forEach(command => {
          var usage = Array.isArray(command.usage)
            ? command.usage[0]
            : command.usage;

          var aliases = command.aliases;
          var all_commands = [usage, ...aliases]
            .map(e => "``" + server_prefix + e + "``")
            .join(" or ");
          embed.addField(`${all_commands}`, command.description, true);
        });
      message.channel.send(embed);
    }
  }
}

module.exports = HelpCommand;
