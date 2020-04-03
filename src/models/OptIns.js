module.exports = mongoose => {
  return new mongoose.Schema({
    guild_ID: {
      type: String,
      unique: true
    },
    guild_name: String,
    username: String,
    user_ID: String,
    timestamp: String
  });
};
