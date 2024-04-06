const guildInfo = require("../shared/guild");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "serverinfo",
  description: "shows information about the server",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  cooldown: 5,
  command: {
    enabled: true,
    aliases: ["guildinfo", "si"],
  },

  async messageRun(message, args) {
    const response = await guildInfo(message.guild);
    await message.safeReply(response);
  },
};
