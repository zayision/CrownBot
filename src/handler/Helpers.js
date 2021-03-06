const { stringify } = require("querystring");
const fetch = require("node-fetch");
const BotEmbed = require("../classes/BotEmbed");
const moment = require("moment");
module.exports = {
  // anything get goes here
  get_username: async (client, message, silent = false) => {
    const { users } = client.models;
    const user = await users
      .findOne({
        userID: message.author.id
      })
      .lean();
    if (!user) {
      if (!silent) {
        await client.notify({
          message,
          desc:
            "please set your Last.fm username with the ``&login`` command first.",
          reply: true
        });
      }
      return false;
    } else {
      return user;
    }
  },

  get_nowplaying: async (client, message, user, silent = false) => {
    const params = stringify({
      method: "user.getrecenttracks",
      user: user.username,
      api_key: client.apikey,
      format: "json",
      limit: 1
    });
    const data = await fetch(`${client.url}${params}`).then(r => r.json());
    if (data.error) {
      if (!silent) {
        await client.notify({
          message,
          desc: "something went wrong while trying to get info from Last.fm.",
          reply: true
        });
      }
      return false;
    }
    const last_track = data.recenttracks.track[0];
    if (last_track[`@attr`] && last_track[`@attr`].nowplaying) {
      return last_track;
    } else {
      if (!silent) {
        await client.notify({
          message,
          desc: "you aren't playing anything.",
          reply: true
        });
      }
      return false;
    }
  },

  get_artistinfo: async ({
    client,
    message,
    artistName,
    user,
    silent,
    context
  }) => {
    let params = "";
    if (user) {
      params = stringify({
        method: "artist.getinfo",
        username: user.username,
        artist: artistName,
        api_key: client.apikey,
        format: "json",
        autocorrect: 1
      });
    } else {
      params = stringify({
        method: "artist.getinfo",
        artist: artistName,
        api_key: client.apikey,
        format: "json",
        autocorrect: 1
      });
    }

    const data = await fetch(`${client.url}${params}`).then(r => r.json());
    if (data.error) {
      if (!silent) {
        if (data.error === 6) {
          await client.notify({
            message,
            desc: "the artist could not be found.",
            reply: true
          });
        } else {
          await client.notify({
            message,
            desc: "something went wrong while trying to get info from Last.fm.",
            reply: true
          });
        }
      }
      return false;
    } else {
      if (context) {
        data.context = context;
      }
      return data;
    }
  },

  get_trackinfo: async ({
    client,
    message,
    artistName,
    songName,
    user,
    context
  }) => {
    const params = stringify({
      method: "track.getInfo",
      artist: artistName,
      track: songName,
      user: user ? user.username : null,
      api_key: client.apikey,
      format: "json",
      autocorrect: 1
    });
    const data = await fetch(`${client.url}${params}`).then(r => r.json());
    if (data.error) {
      if (data.error === 6) {
        await client.notify({
          message,
          desc: `couldn't find the song.`,
          reply: true
        });
      } else {
        await client.notify({
          message,
          desc: `something went wrong while trying to get song info from Last.fm.`,
          reply: true
        });
      }

      return false;
    } else {
      if (context) {
        data.context = context;
      }
      return data;
    }
  },

  get_guild_user: async ({ args, message }) => {
    if (args.length === 0) {
      return false;
    }
    const username = args.join().trim();
    let user = message.guild.members.find(member => {
      return member.user.username
        .toLowerCase()
        .startsWith(username.toLowerCase());
    });
    user = user ? user.user : false;
    return user;
  },

  get_albuminfo: async ({
    client,
    message,
    artistName,
    albumName,
    user,
    context,
    silent
  }) => {
    const params = stringify({
      method: "album.getInfo",
      artist: artistName,
      album: albumName,
      user: user ? user.username : null,
      api_key: client.apikey,
      format: "json",
      autocorrect: 1
    });
    let data;
    try {
      data = await fetch(`${client.url}${params}`).then(r => r.json());
    } catch (err) {
      data = { error: true };
    }

    if (data.error) {
      if (!silent) {
        if (data.error === 6) {
          await client.notify({
            message,
            desc: `couldn't find the album.`,
            reply: true
          });
        } else {
          await client.notify({
            message,
            desc: `something went wrong while trying to get song info from Last.fm.`,
            reply: true
          });
        }
      }

      return false;
    } else {
      if (context) {
        data.context = context;
      }
      return data;
    }
  },

  // anything related to searching goes here
  search_track: async ({ client, message, track_name }) => {
    const params = stringify({
      method: "track.search",
      limit: 1,
      track: track_name,
      api_key: client.apikey,
      format: "json"
    });
    const data = await fetch(`${client.url}${params}`).then(r => r.json());

    if (data.error) {
      if (data.error === 6) {
        await client.notify({
          message,
          desc: `couldn't find the track; try providing the artist name—see \`&help spl\`.`,
          reply: true
        });
      } else {
        await client.notify({
          message,
          desc: `something went wrong while trying to get song info from Last.fm.`,
          reply: true
        });
      }
      return false;
    }
    let track = data.results.trackmatches.track[0];
    if (!track) {
      await client.notify({
        message,
        desc: `couldn't find the track; try providing artist name—see \`&help spl\`.`,
        reply: true
      });
      return false;
    }
    return track;
  },

  search_album: async ({ client, message, album_name }) => {
    const params = stringify({
      method: "album.search",
      limit: 1,
      album: album_name,
      api_key: client.apikey,
      format: "json"
    });
    const data = await fetch(`${client.url}${params}`).then(r => r.json());

    if (data.error) {
      if (data.error === 6) {
        await client.notify({
          message,
          desc: `couldn't find the album; try providing the artist name—see \`&help alp\`.`,
          reply: true
        });
      } else {
        await client.notify({
          message,
          desc: `something went wrong while trying to get album info from Last.fm.`,
          reply: true
        });
      }
      return false;
    }
    let album = data.results.albummatches.album[0];
    if (!album) {
      await client.notify({
        message,
        desc: `couldn't find the album; try providing artist name—see \`&help alp\`.`,
        reply: true
      });
      return false;
    }
    return album;
  },
  // anything updating goes here
  update_usercrown: async ({
    client,
    message,
    artistName,
    userplaycount,
    user
  }) => {
    const { guild } = message;
    const { username, id } = user;
    await client.models.crowns.findOneAndUpdate(
      {
        artistName,
        guildID: guild.id
      },
      {
        userID: id,
        guildID: guild.id,
        artistPlays: userplaycount,
        lastfm_username: username
      },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
  },

  update_userplays: async ({
    client,
    message,
    artistName,
    userplaycount,
    user
  }) => {
    const { author, guild } = message;
    const { username } = user;
    await client.models.userplays.findOneAndUpdate(
      {
        artistName,
        userID: author.id
      },
      {
        userID: author.id,
        guildID: guild.id,
        discord_username: author.tag,
        lastfm_username: username,
        artistName,
        artistPlays: userplaycount
      },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
  },

  update_prefix: async ({ client, message, prefix }) => {
    const { guild, author } = message;
    const re = /^\S{1,4}$/g;
    if (!prefix.match(re)) {
      await message.reply("invalid prefix.");
      return;
    }
    await client.models.prefixes.findOneAndUpdate(
      {
        guildID: guild.id
      },
      {
        guildID: guild.id,
        prefix,
        guildName: guild.name
      },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
    client.prefixes = false;
    await client.notify({
      message,
      desc: "the prefix is now set to ``" + prefix + "``.",
      reply: true
    });
  },

  update_artistlog: async ({ client, message, artist }) => {
    const { name } = artist;
    const userplaycount = artist.stats.userplaycount;
    const userID = message.author.id;
    const timestamp = moment.utc().valueOf();
    await client.models.artistlog.findOneAndUpdate(
      {
        name,
        userID
      },
      {
        name,
        userplaycount,
        userID,
        timestamp
      },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
  },

  update_tracklog: async ({ client, message, track }) => {
    const { name, userplaycount } = track;
    const artistName = track.artist.name;
    const userID = message.author.id;
    const timestamp = moment.utc().valueOf();
    await client.models.tracklog.findOneAndUpdate(
      {
        name,
        artistName,
        userID
      },
      {
        name,
        artistName,
        userplaycount,
        userID,
        timestamp
      },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
  },

  update_albumlog: async ({ client, message, album }) => {
    const { name, userplaycount } = album;
    const artistName = album.artist;
    const userID = message.author.id;
    const timestamp = moment.utc().valueOf();
    await client.models.albumlog.findOneAndUpdate(
      {
        name,
        artistName,
        userID
      },
      {
        name,
        artistName,
        userplaycount,
        userID,
        timestamp
      },
      {
        upsert: true,
        useFindAndModify: false
      }
    );
  },
  // anything checking goes here

  check_permissions: async message => {
    if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) {
      await client.notify({
        message,
        desc:
          "the ``MANAGE_MESSAGES`` permission is required for this command to work.",
        reply: true
      });
      return false;
    }
    return true;
  },

  // anything parsing goes here
  parse_artistinfo: artist => {
    if (!artist) return false;
    const { name, url, mbid } = artist;
    const { listeners, playcount, userplaycount } = artist.stats;
    return {
      name,
      url,
      mbid,
      userplaycount,
      listeners,
      playcount
    };
  },
  parse_trackinfo: track => {
    const { name, url, userplaycount, listeners, playcount, artist } = track;
    const userloved = track.userloved ? !!parseInt(track.userloved) : undefined;
    return {
      name,
      artist,
      url,
      userplaycount,
      listeners,
      playcount,
      userloved
    };
  },

  parse_difference: timestamp => {
    var then = moment.utc(timestamp);
    var now = moment();

    days = now.diff(then, "days");
    hours = now.subtract(days, "days").diff(then, "hours");
    minutes = now.subtract(hours, "hours").diff(then, "minutes");

    const string = `${days > 0 ? days + " day(s)" : ""} ${
      hours > 0 ? hours + " hour(s)" : ""
    } ${days < 1 && hours < 1 && minutes > 0 ? minutes + " minute(s)" : ""} ${
      days < 1 && hours < 1 && minutes < 1 ? "less than a minute" : ""
    }
    `.trim();
    return string;
  },

  // other
  notify: async (message, args, reply = false) => {
    let title, description, desc;
    if (!args) args = message;
    if (typeof args === "object") {
      ({ message, title, description, desc, reply } = args);
      if (desc) description = desc;
    } else {
      description = args;
    }
    const embed = new BotEmbed(message);

    embed.setDescription(`\n${description}\n`);
    if (title) embed.setTitle(title);
    let sent_message;
    if (reply) {
      embed.setDescription(`\n<@${message.author.id}>, ${description}\n`);
    } else {
      embed.setDescription(`\n${description}\n`);
    }
    sent_message = await message.channel.send(embed);
    return sent_message;
  }
};
