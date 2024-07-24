module.exports = {
  OWNER_IDS: ["852985778584944691"], // Bot owner ID's
  SUPPORT_SERVER: "https://discord.gg/tqwquUfqGq", // Your bot support server
  PREFIX_COMMANDS: {
    ENABLED: true, // Enable/Disable prefix commands
    DEFAULT_PREFIX: ".", // Default prefix for the bot
  },
  INTERACTIONS: {
    SLASH: true, // Should the interactions be enabled
    CONTEXT: true, // Should contexts be enabled
    GLOBAL: true, // Should the interactions be registered globally
    TEST_GUILD_ID: "864137754959151127", // Guild ID where the interactions should be registered. [** Test you commands here first **]
  },
  EMBED_COLORS: {
    BOT_EMBED: "#000000",
    DEFAULT: "#000000",
    TRANSPARENT: "#36393F",
    SUCCESS: "#57F287",
    ERROR: "#ED4245",
    WARNING: "#F1C40F",
  },
  // EMBED_COLORS: {
  //   BOT_EMBED: "#006D6F",
  //   DEFAULT: "#006D6F",
  //   TRANSPARENT: "#36393F",
  //   SUCCESS: "#006D6F",
  //   ERROR: "#8B0000",
  //   WARNING: "#FF8C00",
  // },
  CACHE_SIZE: {
    GUILDS: 1000,
    USERS: 100000000,
    MEMBERS: 100000000,
  },
  MESSAGES: {
    API_ERROR:
      "Unexpected server backend error occurred. Please try again later or contact @korauo",
  },
  PRESENCE: {
    ENABLED: true, // Whether or not the bot should update its status
    STATUS: "online", // The bot's status [online, idle, dnd, invisible]
    TYPE: "LISTENING", // Status type for the bot [PLAYING | LISTENING | WATCHING | COMPETING]
    MESSAGE: "the Holy Quran / {prefix}help", // Your bot status message
  },
  IMAGES: {
    LOGO: "https://i.imgur.com/l0ushX2.png",
    WHITE: "https://i.imgur.com/KlelIQM.png",
    THS: "https://i.imgur.com/XemANY6.png",
    TQS: "https://i.imgur.com/ueS7ORL.png",
  },
};