const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const Database = require('better-sqlite3')
const db = new Database('./main.db')

// Create the table if it doesn't exist
const createChatChannelTableQuery = `CREATE TABLE IF NOT EXISTS korwinChatChannel (
    guildId TEXT PRIMARY KEY,
    channelId TEXT
);`
db.exec(createChatChannelTableQuery)

const createOpenaiUsageTableQuery = `CREATE TABLE IF NOT EXISTS openaiUsage (
	guildId TEXT PRIMARY KEY,
	date TEXT NOT NULL,
	count INTEGER NOT NULL DEFAULT 0
);`
db.exec(createOpenaiUsageTableQuery)

const createCommandLimitsTableQuery = `CREATE TABLE IF NOT EXISTS commandLimits (
  guildId TEXT PRIMARY KEY,
  korwinLimit INTEGER NOT NULL DEFAULT 5,
  openaiLimit INTEGER NOT NULL DEFAULT 25,
  dallELimit INTEGER NOT NULL DEFAULT 25
);`
db.exec(createCommandLimitsTableQuery)

const createDallEUsageTableQuery = `CREATE TABLE IF NOT EXISTS dAllEUsage (
	guildId TEXT PRIMARY KEY,
	date TEXT NOT NULL,
	count INTEGER NOT NULL DEFAULT 0
);`
db.exec(createDallEUsageTableQuery)

const createKorwinUsageTableQuery = `CREATE TABLE IF NOT EXISTS korwinUsage (
  guildId TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (guildId, date)
);`
db.exec(createKorwinUsageTableQuery)
