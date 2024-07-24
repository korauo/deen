const { commandHandler } = require("@src/handlers");
const { PREFIX_COMMANDS } = require("@root/config");
const { getSettings } = require("@schemas/Guild");
const { EmbedBuilder } = require("discord.js");
const { EMBED_COLORS, IMAGES } = require("@root/config");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Message} message
 */
module.exports = async (client, message) => {
  if (!message.guild || message.author.bot) return;
  const settings = await getSettings(message.guild);

  // command handler
  let isCommand = false;
  if (PREFIX_COMMANDS.ENABLED) {
    // check for bot mentions
    if (message.content.includes(`${client.user.id}`)) {
      const mentionEmbed = new EmbedBuilder()
        .setTitle(":wave: Assalamu Alaikum!")
        .setDescription(
          "I'm Deen, An Islamic Discord Bot on a mission to make the Quran and Hadith accessible for everyone.",
        )
        .addFields(
          {
            name: "Prefix: ",
            value: `\`${settings.prefix}\``,
            inline: true,
          },
          {
            name: "Commands:",
            value: `Type \`${settings.prefix}help\` to get started!`,
            inline: true,
          },
        )
        .setThumbnail(IMAGES.LOGO)
        .setColor(EMBED_COLORS.DEFAULT);
      message.channel.safeSend({ embeds: [mentionEmbed] });
    }

    if (message.content?.startsWith(settings.prefix)) {
      const invoke = message.content
        .replace(`${settings.prefix}`, "")
        .split(/\s+/)[0];
      const cmd = client.getCommand(invoke);
      if (cmd) {
        isCommand = true;
        commandHandler.handlePrefixCommand(message, cmd, settings);
      }
    }
  }
};
