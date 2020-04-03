const Command = require("../handler/Command");
const BotEmbed = require("../classes/BotEmbed");
class ListCommand extends Command {
  constructor() {
    super({
      name: "list",
      description:
        "Lists user's weekly, monthly, or yearly top artists or songs.",
      usage: "list <type> <period>",
      examples: [
        "list artist weekly",
        "list song weekly",
        "list artist alltime",
        "l a w",
        "l s w",
        "l a a"
      ],
      aliases: ["l"],
      beta: true
    });
  }

  async run(client, message, args) {
    const server_prefix = client.getCachedPrefix(message);
    const { get_username, get_top_artists } = client.helpers;
    const user = await get_username(client, message);
    if (!user) return;
    let config = {
      period: {}
    };
    switch (args[0]) {
      case "a":
      case "artist":
      case "artists":
        config.type = "artist";
        break;

      case "s":
      case "song":
      case "songs":
        config.type = "song";
        break;

      case undefined:
        config.type = `artist`;
        break;

      default:
        config.type = false;
        break;
    }
    switch (args[1]) {
      case `a`:
      case `alltime`:
      case `o`:
      case `overall`:
        config.period.text = `all-time`;
        config.period.value = `overall`;
        break;
      case `w`:
      case `weekly`:
        config.period.text = `weekly`;
        config.period.value = `7day`;
        break;
      case `monthly`:
      case `m`:
        config.period.text = `monthly`;
        config.period.value = `1month`;
        break;
      case `yearly`:
      case `y`:
        config.period.text = `yearly`;
        config.period.value = `12month`;
        break;
      case undefined:
        config.period.text = `weekly`;
        config.period.value = `7day`;
        break;
      default:
        config.period.value = false;
    }

    if (args[2]) {
      let length = parseInt(args[2]);
      if (isNaN(length)) {
        message.reply(
          "invalid size argument; see `" + server_prefix + "help list`."
        );
        return;
      }
      if (length > 30 || length < 0) {
        message.reply("list size cannot be less than 0 or greater than 30.");
        return;
      }
      config.limit = length;
    } else {
      config.limit = 10;
    }

    if (!config.type || !config.period.value) {
      message.reply(
        "invalid arguments passed; see `" + server_prefix + "help list`."
      );
      return;
    }
    if (config.type === "artist") {
      const { topartists } = await get_top_artists({
        client,
        message,
        user,
        config
      });
      if (!topartists) {
        message.reply(
          "something went wrong while trying to get info from Last.fm."
        );
        return;
      }
      const embed_list = topartists.artist
        .map(artist => {
          return `${artist["@attr"].rank}. **${artist.name}** — **${artist.playcount}** plays`;
        })
        .join("\n");

      const embed = new BotEmbed(message)
        .setTitle(
          `${message.author.username}'s ${config.period.text}-top ${config.type}s`
        )
        .setDescription(embed_list);

      await message.channel.send(embed);
    }
  }
}

module.exports = ListCommand;
