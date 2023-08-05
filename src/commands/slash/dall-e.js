const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios')
const { EmbedBuilder } = require('@discordjs/builders') // Keep using your custom EmbedBuilder
const { apiopenai } = require('../../data.json')
const Database = require('better-sqlite3')
const db = new Database('./main.db')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dall-e')
		.setDescription('Generuj obraz z opisu za pomocą modelu DALL-E')
		.addStringOption(option => option.setName('opis').setDescription('Opis obrazka').setRequired(true)),
	async execute(interaction) {
		const prompt = interaction.options.getString('opis')

		// Pobranie aktualnej daty w formacie YYYY-MM-DD
		const currentDate = new Date().toISOString().split('T')[0]

		// Pobranie limitu użycia komendy /dall-e dla tego serwera z bazy danych
		const limitRow = db.prepare('SELECT dallELimit FROM commandLimits WHERE guildId = ?').get(interaction.guildId)
		const maxDAllEUsage = limitRow ? limitRow.dallELimit : 1 // Ustawienie domyślnego limitu na 25, jeśli nie został ustawiony przez administratora

		// Pobranie liczby użycia komendy z bazy danych
		const usageRow = db
			.prepare('SELECT count FROM dAllEUsage WHERE guildId = ? AND date = ?')
			.get(interaction.guildId, currentDate)
		const usageCount = usageRow ? usageRow.count : 0

		// Sprawdzenie, czy limit użycia komendy został przekroczony
		if (usageCount >= maxDAllEUsage) {
			return interaction.reply({
				content: 'Skończyły się dzisiejsze użycia komendy /dall-e na tym serwerze.',
				fetchReply: false,
			})
		}
		// Zwiększenie licznika użycia komendy w bazie danych
		db.prepare('INSERT OR REPLACE INTO dAllEUsage (guildId, date, count) VALUES (?, ?, ?)').run(
			interaction.guildId,
			currentDate,
			usageCount + 1
		)

		await interaction.deferReply()

		try {
			const generatedImageURL = await generateImageWithDALL_E(prompt)

			const embed = new EmbedBuilder() // Use your custom EmbedBuilder
				.setTitle('Oto wygenerowany obraz za pomocą AI')
				.setImage(generatedImageURL)
				.setColor(440041)
				.addFields(
					{ name: 'Opis obrazka:', value: prompt, inline: true },
					{ name: 'Autor wiadomości:', value: interaction.user.username, inline: true }
				)
				.setFooter({
					text: 'Sparky AI',
					iconURL:
						'https://cdn.discordapp.com/attachments/1044648147986681906/1137153889158828102/img-YrI5LoRaHPuTeiwLAAY3rbTx_preview_rev_1.png',
				})

			await interaction.editReply({ embeds: [embed] })
		} catch (error) {
			await interaction.editReply(
				'Wystąpił błąd podczas komunikacji z **API OpenAI lub DALL-E.**\n\n' + '**Error**: ' + error.message
			)
		}
	},
}

async function generateImageWithDALL_E(prompt) {
	const response = await axios.post(
		`https://api.openai.com/v1/images/generations`,
		{
			model: 'image-alpha-001',
			prompt: prompt,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiopenai}`,
			},
		}
	)

	const generatedImageURL = response.data.data[0].url
	return generatedImageURL
}
