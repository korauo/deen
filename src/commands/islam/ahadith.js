const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
} = require("discord.js");
const fetch = require("node-fetch");
const { EMBED_COLORS, IMAGES } = require("@root/config");
require("dotenv").config();
/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ahadith",
  description: "Fetches a specific hadith based on book, and hadith number.",
  category: "ISLAM",
  command: {
    enabled: true,
    usage: "<book> <hadithNumber>",
    minArgsCount: 2,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "book",
        description: "The book name (e.g., sahih-bukhari)",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
          { name: "Sahih Al-Bukhari", value: "sahih-bukhari" },
          { name: "Sahih Muslim", value: "sahih-muslim" },
          { name: "Jami' Al-Tirmidhi", value: "al-tirmidhi" },
          { name: "Sunan Abu Dawood", value: "abu-dawood" },
          { name: "Sunan Ibn-e-Majah", value: "ibn-e-majah" },
          { name: "Sunan An-Nasa'i", value: "sunan-nasai" },
          { name: "Miskaat Al-Masabih", value: "mishkat" },
          { name: "Musnad Ahmad", value: "musnad-ahmad" },
          { name: "Al-Silsila Sahiha", value: "al-silsila-sahiha" },
        ],
      },
      {
        name: "reference",
        description: "Hadith number",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    const book = args[0];
    const hadithNumber = args[1];
    try {
      const hadith = await fetchHadith(book, hadithNumber);
      response = await paginateHadithMessage(message, hadith);
      message.safeReply(response);
    } catch (error) {
      message.reply(error.message);
    }
  },

  async interactionRun(interaction) {
    const book = interaction.options.getString("book");
    const hadithNumber = interaction.options.getString("reference");
    try {
      const hadith = await fetchHadith(book, hadithNumber);
      await paginateHadithSlash(interaction, hadith);
    } catch (error) {
      interaction.followUp({ content: error.message, ephemeral: true });
    }
  },
};

async function fetchHadith(book, hadithNumber) {
  const apiUrl = `https://www.hadithapi.com/public/api/hadiths?apiKey=${process.env.HADITH_API}&book=${book}&hadithNumber=${hadithNumber}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!response.ok || data.status !== 200 || data.hadiths.data.length === 0) {
    throw new Error("Failed to fetch the hadith or hadith not found.");
  }

  return data.hadiths.data[0];
}
// MESSAGE COMMAND
async function paginateHadithMessage(context, hadith) {
  const embeds = generateEmbedsMessage(hadith.hadithArabic);

  // no pagination
  if (embeds.length <= 1) {
    return {
      embeds: [
        embeds[0].setTitle(
          `${hadith.book.bookName}, Chapter: ${hadith.chapter.chapterEnglish} & Hadith No: ${hadith.hadithNumber}`,
        ),
      ],
    };
  }

  try {
    let currentPage = 0;
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("<:previous:939046942485401652>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("<:next:939046942430859274>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(embeds.length === 1),
    );

    const initialMessage = await context.reply({
      embeds: [
        embeds[currentPage].setTitle(
          `${hadith.book.bookName}, Chapter: ${hadith.chapter.chapterEnglish} & Hadith No: ${hadith.hadithNumber}`,
        ),
      ],
      components: [buttons],
      fetchReply: true,
    });
    const filter = (i) =>
      ["previous", "next"].includes(i.customId) &&
      i.user.id === (context.user?.id || context.author?.id);

    const collector = context.channel.createMessageComponentCollector({
      filter,
      idle: 60000,
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "next") {
        currentPage = Math.min(embeds.length - 1, currentPage + 1);
      } else if (i.customId === "previous") {
        currentPage = Math.max(0, currentPage - 1);
      }

      buttons.components[0].setDisabled(currentPage === 0);
      buttons.components[1].setDisabled(currentPage === embeds.length - 1);

      await i.update({ embeds: [embeds[currentPage]], components: [buttons] });
    });
  } catch (error) {
    return `${error.message}, PAGINATION ERROR - MESSAGE COMMAND`;
  }
}

function generateEmbedsMessage(text) {
  const maxLength = 1500;
  const embeds = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = Math.min(text.length, startIndex + maxLength);
    if (endIndex < text.length) {
      const lastSpaceIndex = text.lastIndexOf(" ", endIndex);
      endIndex = lastSpaceIndex > startIndex ? lastSpaceIndex : endIndex;
    }
    const chunk = text.substring(startIndex, endIndex).trim();
    embeds.push(
      new EmbedBuilder().setDescription(chunk).setColor(EMBED_COLORS.DEFAULT),
    );
    startIndex = endIndex;
  }

  for (let i = 0; i < embeds.length; i++) {
    embeds[i]
      .setFooter({ text: `Page ${i + 1} of ${embeds.length}` })
      .setThumbnail(IMAGES.THS);
  }

  return embeds;
}

// INTERACTION COMMAND

async function paginateHadithSlash(context, hadith) {
  const embeds = generateEmbedsSlash(hadith.hadithArabic);

  // no
  if (embeds.length <= 1) {
    return context.followUp({
      embeds: [
        embeds[0].setTitle(
          `${hadith.book.bookName}, Chapter: ${hadith.chapter.chapterEnglish} & Hadith No: ${hadith.hadithNumber}`,
        ),
      ],
    });
  }
  if (embeds.length > 1) {
    let currentPage = 0;
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setEmoji("<:previous:939046942485401652>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("<:next:939046942430859274>")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(embeds.length === 1),
    );

    const initialMessage = await context.followUp({
      embeds: [
        embeds[currentPage].setTitle(
          `${hadith.book.bookName}, Chapter: ${hadith.chapter.chapterEnglish} & Hadith No: ${hadith.hadithNumber}`,
        ),
      ],
      components: [buttons],
      fetchReply: true,
    });
    const filter = (i) =>
      ["previous", "next"].includes(i.customId) &&
      i.user.id === (context.user?.id || context.author?.id);

    const collector = context.channel.createMessageComponentCollector({
      filter,
      idle: 60000,
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "next") {
        currentPage = Math.min(embeds.length - 1, currentPage + 1);
      } else if (i.customId === "previous") {
        currentPage = Math.max(0, currentPage - 1);
      }

      buttons.components[0].setDisabled(currentPage === 0);
      buttons.components[1].setDisabled(currentPage === embeds.length - 1);

      await i.update({ embeds: [embeds[currentPage]], components: [buttons] });
    });
  }
}

function generateEmbedsSlash(text) {
  const maxLength = 1500;
  const embeds = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = Math.min(text.length, startIndex + maxLength);
    if (endIndex < text.length) {
      const lastSpaceIndex = text.lastIndexOf(" ", endIndex);
      endIndex = lastSpaceIndex > startIndex ? lastSpaceIndex : endIndex;
    }
    const chunk = text.substring(startIndex, endIndex).trim();
    embeds.push(new EmbedBuilder().setDescription(chunk));
    startIndex = endIndex;
  }

  for (let i = 0; i < embeds.length; i++) {
    embeds[i]
      .setFooter({ text: `Page ${i + 1} of ${embeds.length}` })
      .setThumbnail(IMAGES.THS)
      .setColor(EMBED_COLORS.DEFAULT);
  }

  return embeds;
}
