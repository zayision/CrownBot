const Command = require("../handler/Command");
// const { stringify } = require("querystring");
// const fetch = require("node-fetch");
const BotEmbed = require("../classes/BotEmbed");
class TasteCommand extends Command {
  constructor() {
    super({
      name: "taste",
      description: "Compares same-artist plays between two users.",
      usage: ["taste <username>", "taste @user"],
      aliases: ["t"],
      beta: true
    });
  }

  async run(client, message, args) {
    const { get_username, get_top_artists, get_guild_user } = client.helpers;
    const { notify } = client.helpers;

    let user = message.mentions.members.first();
    user = user ? user.user : false;

    if (!user && args.length !== 0) {
      user = await get_guild_user({
        args,
        message
      });
    }

    if (!user) {
      await notify({
        message,
        title: "Invalid request",
        description:
          "`@` (mention) the user you want to compare your music taste with. ^^;",
        reply: true
      });
      return;
    }

    const user_one = await get_username(client, message);
    if (!user_one) return;
    const user_two = await get_username(client, message, true, user.id);
    if (!user_two) return;
    if (user_one.userID == user_two.userID) {
      await client.notify({
        message,
        desc: "you cannot *taste* yourself. :flushed:",
        reply: true
      });
      return;
    }
    const responses = [];

    for (const user of [user_one, user_two]) {
      const { topartists } = await get_top_artists({
        client,
        message,
        user,
        config: {
          type: "artist",
          period: {
            text: "all-time",
            value: "overall"
          },
          limit: 200
        }
      });
      responses.push(topartists.artist);
    }
    if (responses.some(res => !res)) {
      await client.notify({
        message,
        desc: "failed to get info from Last.fm; try again after a while.",
        reply: true
      });
      return;
    }
    let plays = [];
    const similar_artists = responses[0].filter(artist => {
      return responses[1].find(ar => ar.name == artist.name);
    });
    similar_artists.forEach(artist => {
      const usertwo_artist = responses[1].find(ar => ar.name == artist.name);
      plays.push({
        name: artist.name,
        userone_plays: artist.playcount,
        usertwo_plays: usertwo_artist.playcount
      });
    });
    plays = plays.sort((a, b) => {
      let cur_diff = Math.abs(b.userone_plays - b.usertwo_plays);
      let then_diff = Math.abs(a.userone_plays - a.usertwo_plays);
      return then_diff - cur_diff;
    });
    if (plays.length > 25) plays.length = 25;

    const embed = new BotEmbed(message).setTitle(
      `\`\`${user_one.username}\`\`'s and \`\`${user_two.username}\`\`'s taste comparision `
    );
    plays.forEach(stat => {
      const { name, userone_plays, usertwo_plays } = stat;
      embed.addField(
        name,
        `${userone_plays} plays — ${usertwo_plays} plays`,
        true
      );
    });

    await message.channel.send(embed);
  }
}

module.exports = TasteCommand;
