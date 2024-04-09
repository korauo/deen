require("dotenv").config();
require("module-alias/register");
const keep_alive = require("./keep_alive.js"); // keep the bot online 24/7

// register extenders
require("@helpers/extenders/Message");
require("@helpers/extenders/Guild");
require("@helpers/extenders/GuildChannel");

const { initializeMongoose } = require("@src/database/mongoose");
const { BotClient } = require("@src/structures");
const { validateConfiguration } = require("@helpers/Validator");

validateConfiguration();

// initialize client
const client = new BotClient();
client.loadCommands("src/commands");
client.loadContexts("src/contexts");
client.loadEvents("src/events");

const { AutoPoster } = require("topgg-autoposter");

const poster = AutoPoster(process.env.TOPGG_TOKEN, client);

// find unhandled promise rejections
process.on("unhandledRejection", (err) =>
  client.logger.error("Unhandled exception", err),
);

(async () => {
  await initializeMongoose();

  // start the client
  await client.login(process.env.BOT_TOKEN);
})();
