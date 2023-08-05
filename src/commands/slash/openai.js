const { SlashCommandBuilder } = require('@discordjs/builders')
const { OpenAIApi, Configuration } = require('openai')
const { apiopenai } = require('../../data.json')
const configuration = new Configuration({ apiKey: apiopenai })
const openai = new OpenAIApi(configuration)
const Database = require('better-sqlite3')
const db = new Database('./main.db')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('openai')
		.setDescription('Zadaj pytanie do modelu OpenAI')
		.addStringOption(option => option.setName('treść').setDescription('Treść pytania').setRequired(true)),
	async execute(interaction) {
		const question = interaction.options.getString('treść')

		// Pobranie aktualnej daty w formacie YYYY-MM-DD
		const currentDate = new Date().toISOString().split('T')[0]

		// Pobranie limitu użycia komendy /openai dla tego serwera z bazy danych
		const limitRow = db.prepare('SELECT openaiLimit FROM commandLimits WHERE guildId = ?').get(interaction.guildId)
		const maxOpenaiUsage = limitRow ? limitRow.openaiLimit : 2 // Ustawienie domyślnego limitu na 25, jeśli nie został ustawiony przez administratora

		// Pobranie liczby użycia komendy z bazy danych
		const usageRow = db
			.prepare('SELECT count FROM openaiUsage WHERE guildId = ? AND date = ?')
			.get(interaction.guildId, currentDate)
		const usageCount = usageRow ? usageRow.count : 0

		// Sprawdzenie, czy limit użycia komendy został przekroczony
		if (usageCount >= maxOpenaiUsage) {
			return interaction.reply({
				content: 'Skończyły się dzisiejsze użycia komendy /openai na tym serwerze.',
				fetchReply: false,
			})
		}

		// Sprawdzenie długości wiadomości
		if (question.length > 2000) {
			return await interaction.reply('Wiadomość przekroczyła maksymalną ilość znaków (2000). Proszę skrócić wiadomość.')
		}



		// Wysłanie odpowiedzi na pytanie
		await interaction.reply({
			content: `<:strzala:1137159505357058129> **Odpowiedź na pytanie:** ${question}\n\n<:strzala:1137159505357058129> **Autor wiadomości:** ${interaction.user}`,
			fetchReply: false,
		})

		// Wysłanie informacji o pisaniu wiadomości przez bota usuwa się automatycznie
		interaction.channel.sendTyping()

		// Zwiększenie licznika użycia komendy w bazie danych
		db.prepare(`INSERT OR REPLACE INTO openaiUsage (guildId, date, count) VALUES (?, DATE('now'), ?)`).run(
			interaction.guildId,
			usageCount + 1
		)

		try {
			const completion = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content: 'Jesteś asystentem AI - twoim zadaniem jest odpowiadanie na pytania i pomoc.',
					},
					{ role: 'user', content: question },
				],
			})

			let reply = completion.data.choices[0].message.content

			// Sprawdzenie długości odpowiedzi
			if (reply.length > 2000) {
				reply = reply.substring(0, 1900) // Przycięcie odpowiedzi do maksymalnej długości
				reply += '\n\n:warning: **Odpowiedź została przycięta, ponieważ przekroczyła maksymalną ilość znaków (2000).**'
			}

			await interaction.followUp(reply)

			if (completion.data.choices[0].finish_reason === 'incomplete') {
				await interaction.followUp(
					'<:warning:1234567890> **Odpowiedź przekroczyła maksymalną ilość tokenów (2000) i została przerwana.**'
				)
			}
		} catch (error) {
			await interaction.followUp(
				'Wystąpił błąd podczas komunikacji z **API OpenAI.**\n\n' + '**Error**: https://http.cat/' + error.response.status
			)
		}
	},
}
