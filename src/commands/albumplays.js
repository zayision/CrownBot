const Command = require("../handler/Command");
const { stringify } = require("querystring");
const fetch = require("node-fetch");
const BotEmbed = require("../classes/BotEmbed");
const abbreviate = require("number-abbreviate");
class AlbumPlaysCommand extends Command {
  constructor() {
    super({
      name: "albumplays",
      description: "Displays user's play count of an album.",
      usage: ["albumplays", "albumplays <album name> || <artist name>"],
      aliases: ["alp", "alpl"],
      examples: [
        "albumplays Disintegration || The Cure",
        "albumplays Empath || Devin Townsend"
      ]
    });
  }

  async run(client, message, args) {
    const server_prefix = client.getCachedPrefix(message);

    // "getters"
    const {
      get_username,
      get_nowplaying,
      get_albuminfo,
      get_artistinfo
    } = client.helpers;

    // search functions
    const { search_album } = client.helpers;

    // "setters"
    const { update_albumlog } = client.helpers;

    // parsers
    const { parse_trackinfo, parse_difference } = client.helpers;

    let albumName;
    let artistName;
    let footer_text;
    const user = await get_username(client, message);
    if (!user) return;
    if (args.length === 0) {
      const now_playing = await get_nowplaying(client, message, user);
      if (!now_playing) return;
      artistName = now_playing.artist[`#text`];
      albumName = now_playing.album["#text"];
    } else {
      let str = args.join(` `);
      let str_array = str.split("||");
      if (str_array.length !== 2) {
        let album_name = str_array.join().trim();
        let album = await search_album({
          client,
          message,
          album_name
        });

        if (!album) return;
        albumName = album.name;
        artistName = album.artist;
        footer_text =
          "Wrong album? Try providing artist name; see " +
          server_prefix +
          "help alp";
      } else {
        albumName = str_array[0].trim();
        artistName = str_array[1].trim();
      }
    }

    let artist_plays = await get_artistinfo({
      client,
      message,
      artistName,
      user
    });
    artist_plays = artist_plays.artist.stats.userplaycount;

    let { album } = await get_albuminfo({
      client,
      message,
      artistName,
      albumName,
      user
    });

    if (!album) return;
    let { name, artist, userplaycount, playcount } = parse_trackinfo(album); // the helper command works with album too cuz the response is similar
    var last_played = 0;
    var count_diff_str = "No change";
    var time_diff_str = false;
    var album_art = false;
    try {
      if (album.image) {
        var last_item = album.image.pop();
        album_art = last_item["#text"];
      }
    } catch (e) {
      album_art = false;
      console.error("Failed to get album art.");
      console.log(e);
    }

    var last_log = await client.models.albumlog.findOne({
      name,
      artistName: artist,
      userID: message.author.id
    });

    if (last_log) {
      last_played = last_log.userplaycount;
      time_diff_str = await parse_difference(last_log.timestamp);
    }

    const count_diff = userplaycount - last_played;

    if (count_diff < 0) {
      count_diff_str = `:small_red_triangle_down: ${count_diff}`;
    } else if (count_diff > 0) {
      count_diff_str = `+${count_diff}`;
    }
    let aggr_str = `**${count_diff_str}** since last checked ${time_diff_str} ago.`;
    if (!time_diff_str) {
      aggr_str = "";
    }
    await update_albumlog({
      client,
      message,
      album
    });
    const artist_percentage = ((userplaycount / artist_plays) * 100).toFixed(2);
    const percentage = ((userplaycount / playcount) * 100).toFixed(2);
    let percentage_text = ` — **${artist_percentage}%** of **${abbreviate(
      artist_plays,
      1
    )}** artist plays `;
    if (isNaN(artist_percentage)) {
      percentage_text = "";
    }
    const embed = new BotEmbed(message)
      .setTitle(`Album plays`)
      .setDescription(
        `**${name}** by **${artist}** — ${userplaycount} play(s) ${percentage_text}\n\n (**${percentage}%** of ${abbreviate(
          playcount,
          1
        )} album plays) \n\n ${aggr_str}`
      );
    if (album_art) {
      embed.setThumbnail(album_art);
    }
    if (footer_text) {
      embed.setFooter(footer_text);
    }
    await message.channel.send(embed);
  }
}

module.exports = AlbumPlaysCommand;
