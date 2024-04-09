const botinvite = require("../shared/botinvite");
const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "invite",
  description: "gives you bot invite",
  category: "INFORMATION",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = botinvite(message.client);
    try {
      const checkDmsEmbed = new EmbedBuilder()
        .setTitle("Check your DM's!")
        .setDescription(
          "I have sent you a DM with my information! :envelope_with_arrow:",
        )
        .setColor(EMBED_COLORS.DEFAULT);

      await message.author.send(response);
      return message.safeReply({ embeds: [checkDmsEmbed] });
    } catch (ex) {
      return message.safeReply(
        "I cannot send you my information! Is your DM open?",
      );
    }
  },
};
