const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { EMBED_COLORS, SUPPORT_SERVER } = require("@root/config");

module.exports = (client) => {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Invite" })
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(client.user.displayAvatarURL())
    .setDescription(
      "Assalamu Alaikum! Jazakallah Khair for considering to invite me :)\nUse the buttons below to navigate where you want",
    );

  // Buttons
  const components = [];
  components.push(
    new ButtonBuilder()
      .setLabel("Invite Link")
      .setURL(client.getInvite())
      .setStyle(ButtonStyle.Link),
  );
  components.push(
    new ButtonBuilder()
      .setLabel("Vote @ top.gg")
      .setURL("https://top.gg/bot/1222254816550588426/vote")
      .setStyle(ButtonStyle.Link),
  );

  components.push(
    new ButtonBuilder()
      .setLabel("Support Server")
      .setURL(SUPPORT_SERVER)
      .setStyle(ButtonStyle.Link),
  );

  const buttonsRow = new ActionRowBuilder().addComponents(components);
  return { embeds: [embed], components: [buttonsRow] };
};
