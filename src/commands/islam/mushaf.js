const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const fetch = require("node-fetch");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "mushaf",
  description:
    "Displays the mushaf page for a given Ayah with optional Tajweed.",
  category: "ISLAM",
  command: {
    enabled: true,
    usage: "<surah>:<ayah> [tajweed]",
    aliases: ["page"],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "reference",
        description: "The Surah and Ayah in the format <surah>:<ayah>",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "tajweed",
        description: "Specify 'tajweed' to get a color-coded Mushaf page",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },

  async messageRun(message, args) {
    const ref = args[0];
    const tajweed = args[1] || "none";
    const response = await sendMushafPage(ref, tajweed);
    await message.reply(response);
  },

  async interactionRun(interaction) {
    const ref = interaction.options.getString("reference");
    const tajweed = interaction.options.getString("tajweed") || "none";
    const response = await sendMushafPage(ref, tajweed);
    await interaction.followUp(response);
  },
};

async function sendMushafPage(ref, tajweed) {
  let surah;
  let ayah;
  try {
    [surah, ayah] = ref.split(":");
  } catch {
    return { embeds: [invalidFormat] };
  }

  const apiUrl = `https://api.alquran.cloud/ayah/${surah}:${ayah}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw Error("API request failed");
    const data = await response.json();
    const page = data.data.page;
    const formattedPage = data.data.page + 3;
    const paddedPage = String(formattedPage).padStart(4, "0");
    const url =
      tajweed === "none"
        ? `https://www.searchtruth.com/quran/images/images4/${paddedPage}.jpg`
        : `https://www.searchtruth.com/quran/images/images9/${page}.jpg`;

    const arabicPageNumber = convertToArabicNumber(page);
    const embed = new EmbedBuilder()
      .setTitle(`Page ${page} | الصفحة ${arabicPageNumber}`)
      .setColor(EMBED_COLORS.DEFAULT)
      .setAuthor({
        name: "Muṣḥaf / مصحف",
        iconURL: "https://i.imgur.com/GsuYJoc.png",
      })
      .setImage(url);

    return { embeds: [embed] };
  } catch (error) {
    return { embeds: [invalidVerse] };
  }
}

function convertToArabicNumber(number) {
  return number
    .toString()
    .split("")
    .map((digit) => "٠١٢٣٤٥٦٧٨٩"[digit])
    .join("");
}

const invalidFormat = new EmbedBuilder()
  .setTitle("Invalid Format")
  .setDescription(
    "**Please type the command in this format**: `/mushaf <surah>:<ayah>`" +
      "\ne.g. `/mushaf 112:1` \nFor a color-coded mushaf, add 'tajweed' to the end of the command" +
      "\ne.g. `/mushaf 112:1 tajweed`",
  )
  .setColor(EMBED_COLORS.WARNING);

const invalidVerse = new EmbedBuilder()
  .setTitle("Invalid input")
  .setDescription(
    "**Verse could not be found**. Please check if the verse exists, or try again later.",
  )
  .setColor(EMBED_COLORS.ERROR);
