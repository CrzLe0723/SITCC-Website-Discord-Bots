const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");

require("dotenv").config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  throw new Error(
    "Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID in .env"
  );
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

// BuddyBot's slash commands
const commands = [
  new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Say hello to BuddyBot!"),
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

async function startBot() {
  console.log("Registering BuddyBot commands...");

  await rest.put(
    Routes.applicationGuildCommands(clientId, guildId),
    { body: commands }
  );

  await client.login(token);
}

client.once(Events.ClientReady, readyClient => {
  console.log(`${readyClient.user.username} is online.`);
});

client.on(Events.GuildMemberAdd, async member => {
  const channel = member.guild.channels.cache.find(
    channel =>
      channel.name === "general" &&
      channel.isTextBased()
  );

  if (channel) {
    await channel.send(
      `👋 Welcome to the server, ${member}! 🎉\n` +
      "Thank you for joining the SITCC! Have fun!"
    );
  }
});

client.on(Events.GuildMemberRemove, async member => {
  const channel = member.guild.channels.cache.find(
    channel =>
      channel.name === "general" &&
      channel.isTextBased()
  );

  if (channel) {
    await channel.send(
      `👋 ${member.user.username} has left the server.`
    );
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "hello") {
    await interaction.reply(
      `Hey ${interaction.user}! WelcomeBot is glad to see you!`
    );
  }
});

startBot().catch(error => {
  console.error("BuddyBot failed to start:", error);
});
