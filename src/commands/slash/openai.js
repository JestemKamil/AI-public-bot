const { SlashCommandBuilder } = require('@discordjs/builders')
const { OpenAIApi, Configuration } = require('openai')
const { apiopenai } = require('../../data.json')
const configuration = new Configuration({ apiKey: apiopenai })
const openai = new OpenAIApi(configuration)
const Database = require('better-sqlite3')
const db = new Database('./main.db')

const createTableQuery = `CREATE TABLE IF NOT EXISTS openaiUsage (
	guildId TEXT PRIMARY KEY,
	date TEXT NOT NULL,
	count INTEGER NOT NULL DEFAULT 0
  );`

db.exec(createTableQuery)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('openai')
		.setDescription('Zadaj pytanie do modelu OpenAI')
		.addStringOption(option => option.setName('treść').setDescription('Treść pytania').setRequired(true)),
	async execute(interaction) {
		const question = interaction.options.getString('treść');
		let usageCount = db.prepare(`SELECT count FROM openaiUsage WHERE guildId = ?`).get(interaction.guildId).count;

		// Sprawdzenie długości wiadomości
		if (question.length > 2000) {
			return await interaction.reply('Wiadomość przekroczyła maksymalną ilość znaków (2000). Proszę skrócić wiadomość.')
		}

		await interaction.reply({
			content: `<:1108820964948590724:1136620320397197322> **Odpowiedź na pytanie:** ${question}\n\n<:1108820964948590724:1136620320397197322> **Autor wiadomości:** ${interaction.user}`,
			fetchReply: false,
		})

		try {
			const completion = await openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: [{"role": "system", "content": "Jesteś asystentem AI - twoim zadaniem jest odpowiadanie na pytania i pomoc."}, {role: "user", content: question}],
				});
	

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
			usageCount++
			// Zwiększenie licznika użycia komendy w bazie danych
			db.prepare(`INSERT OR REPLACE INTO openaiUsage (guildId, date, count) VALUES (?, DATE('now'), ?)`).run(
				interaction.guildId,
				usageCount
			)
		} catch (error) {
			console.error(error)
			await interaction.followUp(
				'Wystąpił błąd podczas komunikacji z **API OpenAI.**\n\n' + '**Error**: ' + error.message
			)
		}
	},
}
