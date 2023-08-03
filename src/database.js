const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const Database = require('better-sqlite3')
const db = new Database('./main.db')

// Create the table if it doesn't exist
const createTableQuery = `CREATE TABLE IF NOT EXISTS korwinChatChannel (
    guildId TEXT PRIMARY KEY,
    channelId TEXT
  );`
db.exec(createTableQuery)

