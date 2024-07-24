const { EmbedBuilder } = require("discord.js");
const { getSettings: registerGuild } = require("@schemas/Guild");

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').Guild} guild
 */

module.exports = async (client, guild) => {
  if (!guild.available) return;
  if (!guild.members.cache.has(guild.ownerId))
    await guild.fetchOwner({ cache: true }).catch(() => {});
  client.logger.log(
    `Guild Joined: "${guild.name}" Members: ${guild.memberCount}`,
  );
  await registerGuild(guild);

  if (!client.joinLeaveWebhook) return;

  const joinLeaveEmbed = new EmbedBuilder()
    .setTitle("Server Joined!")
    .setThumbnail(guild.iconURL())
    .setColor(client.config.EMBED_COLORS.SUCCESS)
    .addFields(
      {
        name: "Server Name",
        value: guild.name,
        inline: false,
      },
      {
        name: "Server ID",
        value: guild.id,
        inline: false,
      },
      {
        name: "Owner",
        value: `${client.users.cache.get(guild.ownerId)} [\`${
          guild.ownerId
        }\`] [<@${guild.ownerId}>]`,
        inline: false,
      },
      {
        name: "Members",
        value: `\`\`\`yaml\n${guild.memberCount}\`\`\``,
        inline: false,
      },
    )
    .setFooter({ text: `Guild #${client.guilds.cache.size}` });

  client.joinLeaveWebhook.send({
    username: "Join",
    avatarURL: client.user.displayAvatarURL(),
    embeds: [joinLeaveEmbed],
  });
};
