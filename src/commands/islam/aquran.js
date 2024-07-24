const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS, IMAGES } = require("@root/config");
const fetch = require("node-fetch");

module.exports = {
  name: "aquran",
  description:
    "Get the arabic text of specific Ayahs or an Ayah range from a Surah.",
  category: "ISLAM",
  command: {
    enabled: true,
    usage: "<Surah> <Ayah> or <Ayah Range>",
    aliases: ["asurah"],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "surah",
        description: "The Surah number",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        name: "reference",
        description: "Ayah number or Ayah range (e.g., 3 or 3-5).",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    if (args.length < 1 || !args[0].includes(":")) {
      const invalidFormatEmbed = new EmbedBuilder()
        .setTitle("Invalid Format")
        .setDescription(
          "Please specify the Surah and Ayah (or Ayah range) correctly, e.g., `1:3` or `1:3-5`.",
        )
        .setColor("#ff0000");
      return message.reply(
        "Please specify the Surah and Ayah (or Ayah range) correctly, e.g., `1:3` or `1:3-5`.",
      );
    }
    // split
    const [surahNumber, reference] = args[0].split(":");

    try {
      const response = await fetchSurahMeanings(surahNumber, reference);
      await message.reply(response);
    } catch (error) {
      await message.reply(
        "**Invalid response**, must include a valid surah number and an ayah or ayah range. \n example: .quran 1:1 \n example 2: .quran 1:1-7",
      );
    }
  },

  async interactionRun(interaction) {
    const surahNumber = interaction.options.getInteger("surah");
    const reference = interaction.options.getString("reference");

    try {
      const response = await fetchSurahMeanings(surahNumber, reference);
      await interaction.followUp(response);
    } catch (error) {
      await interaction.followUp({
        content:
          "**Invalid response**, must include a valid surah number and an ayah or ayah range. \n example: /aquran 1:1 \n example 2: /aquran 1:1-7",
        ephemeral: true,
      });
    }
  },
};

async function fetchSurahMeanings(surahNumber, reference) {
  // API URL construction
  const apiUrl = reference.includes("-")
    ? `http://api.alquran.cloud/v1/surah/${surahNumber}`
    : `http://api.alquran.cloud/v1/ayah/${surahNumber}:${reference}`;

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("API request failed");
  const data = await response.json();

  let ayahsText = "";
  if (reference.includes("-")) {
    const [start, end] = reference.split("-").map(Number);
    const ayahs = data.data.ayahs.filter(
      (ayah) => ayah.numberInSurah >= start && ayah.numberInSurah <= end,
    );
    ayahsText = ayahs
      .map((ayah) => `${ayah.numberInSurah}. ${ayah.text}`)
      .join("");
  } else {
    ayahsText = data.data.text;
  }

  // Checking if the combined text exceeds Discord's embed description limit
  if (ayahsText.length > 4096) {
    ayahsText = `${ayahsText.slice(0, 4093)}...`; // Truncate and add ellipsis
  }

  const titleText = `Surah ${
    data.data.englishName ? data.data.englishName : data.data.surah.englishName
  } (${
    data.data.englishNameTranslation
      ? data.data.englishNameTranslation
      : data.data.surah.englishNameTranslation
  }), Ayah(s) ${reference}`;
  const translationName = data.data.edition
    ? data.data.edition.englishName
    : "Asad";

  const embed = new EmbedBuilder()
    .setTitle(titleText)
    .setDescription(ayahsText)
    .setColor("#1A5A3B")
    .setThumbnail(IMAGES.TQS)
    .setFooter({ text: `Format: ${translationName}` });

  return { embeds: [embed] };
}
