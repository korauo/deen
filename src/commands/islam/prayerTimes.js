const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const fetch = require("node-fetch");
const { EMBED_COLORS } = require("@root/config");

module.exports = {
  name: "prayertimes",
  description:
    "Get prayer times for a specified city and country, with an optional calculation method.",
  category: "ISLAM",
  command: {
    enabled: true,
    usage: "<city> <methodNumber>",
    aliases: ["prayer"],
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "city",
        description: "City name to get prayer times for",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "method",
        description: "Optional calculation method ID",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun(message, args) {
    if (args.length < 0) {
      const invalidFormatEmbed = new EmbedBuilder()
        .setTitle("Invalid Format")
        .setDescription("Please specify the city and country.")
        .setColor(EMBED_COLORS.WARNING);

      return message.safeReply({ embeds: [invalidFormatEmbed] });
    }
    const city = args[0];
    const method = args[1] || "Please specify a calculation method ID.";

    if (!args[1]) {
      const methodEmbed = new EmbedBuilder()
        .setTitle(`${method} \nAvailable Calculation Methods are:`)
        .setDescription(
          "- 1. University of Islamic Sciences, Karachi\n- 2. Islamic Society of North America\n- 3. Muslim World League\n- 4. Umm Al-Qura University, Makkah\n- 5. Egyptian General Authority of Survey\n- 7. Institute of Geophysics, University of Tehran\n- 8. Gulf Region\n- 10. Qatar\n- 11. Majlis Ugama Islam Singapura, Singapore\n- 12. Union Organization islamic de France\n- 13. Diyanet İşleri Başkanlığı, Turkey\n- 14. Spiritual Administration of Muslims of Russia\n- 15. Moonsighting Committee Worldwide (also requires shafaq parameter)\n- 16. Dubai (unofficial)",
        )
        .setColor(EMBED_COLORS.WARNING);
      return message.reply({ embeds: [methodEmbed] });
    }

    try {
      const response = await fetchPrayerTimes(city, method);
      message.reply(response);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription(
              "Failed to fetch prayer times. Please try again later.",
            )
            .setColor(EMBED_COLORS.ERROR),
        ],
      });
    }
  },

  async interactionRun(interaction) {
    const city = interaction.options.getString("city");
    const method = interaction.options.getString("method");

    try {
      const response = await fetchPrayerTimes(city, method);
      await interaction.followUp(response);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("Failed to fetch prayer times. Please try again later.")
        .setColor(EMBED_COLORS.ERROR);

      await interaction.followUp({
        embeds: [errorEmbed],
      });
    }
  },
};

async function fetchPrayerTimes(city, method) {
  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(
      city,
    )}&method=${encodeURIComponent(method)}`,
  );
  if (!response.ok) throw new Error("Failed to fetch prayer times");
  const data = await response.json();
  const timings = data.data.timings;

  const hanafiResponse = await fetch(
    `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(
      city,
    )}&method=${encodeURIComponent(method)}&school=1`,
  );
  const hanafiData = await hanafiResponse.json();
  const hanafiTimings = hanafiData.data.timings;

  const replyEmbed = new EmbedBuilder()
    .setAuthor({
      name: `Prayer times for: ${
        city.charAt(0).toUpperCase() + city.slice(1)
      }.`,
      iconURL: "https://i.imgur.com/vuxAZL8.png",
    })
    .setTitle(
      `${data.data.date.readable} | ${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`,
    )
    .addFields(
      { name: "Imsak (إِمْسَاك)", value: timings.Imsak, inline: true },
      { name: "Fajr (صلاة الفجر)", value: timings.Fajr, inline: true },
      { name: "Sunrise (طلوع الشمس)", value: timings.Sunrise, inline: true },
      { name: "Dhuhr (صلاة الظهر)", value: timings.Dhuhr, inline: true },
      { name: "Asr (صلاة العصر)", value: timings.Asr, inline: true },
      {
        name: "Asr - Hanafī School (صلاة العصر - حنفي)",
        value: hanafiTimings.Asr,
        inline: true,
      },
      { name: "Maghrib (صلاة المغرب)", value: timings.Maghrib, inline: true },
      { name: "Isha (صلاة العشاء)", value: timings.Isha, inline: true },
      { name: "Midnight (منتصف الليل)", value: timings.Midnight, inline: true },
    )
    .setFooter({ text: `Calculation Method: ${data.data.meta.method.name}` })
    .setColor("#1A5A3B");

  return { embeds: [replyEmbed] };
}
