const { SlashCommandBuilder } = require('@discordjs/builders')
const Database = require('better-sqlite3')
const db = new Database('./main.db')

// Lista ID użytkowników, którzy mogą używać tej komendy
const allowedUsers = ['541526393641500675', '431446811270709248']



module.exports = {
	data: new SlashCommandBuilder()
		.setName('ustaw-limity')
		.setDescription('Ustawia limity użycia komend na danym serwerze')
		.addStringOption(option => option.setName('id-serwera').setDescription('ID serwera').setRequired(true))
		.addIntegerOption(option => option.setName('liczba-limitów').setDescription('Liczba limitów').setRequired(true)),
	async execute(interaction) {
		// Sprawdzenie, czy użytkownik ma uprawnienia do użycia tej komendy
		if (!allowedUsers.includes(interaction.user.id)) {
			return interaction.reply({
				content: 'Nie masz uprawnień do użycia tej komendy.',
				fetchReply: false,
			})
		}

		const guildId = interaction.options.getString('id-serwera')
		const limitCount = interaction.options.getInteger('liczba-limitów')

		// Ustawienie limitu użycia chatu Korwina, komendy /openai i komendy /dall-e dla danego serwera
		db.prepare(
			'INSERT OR REPLACE INTO commandLimits (guildId, korwinLimit, openaiLimit, dallELimit) VALUES (?, ?, ?, ?)'
		).run(guildId, limitCount, limitCount, limitCount)

		await interaction.reply({
			content: `Ustawiono limity użycia komend na serwerze o ID ${guildId} na ${limitCount}.`,
			fetchReply: false,
		})
	},
}
