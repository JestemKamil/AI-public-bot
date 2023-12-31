const { OpenAIApi, Configuration } = require('openai')
const { apiopenai } = require('../data.json')
const configuration = new Configuration({ apiKey: apiopenai })
const openai = new OpenAIApi(configuration)
const Database = require('better-sqlite3')
const db = new Database('./main.db')

//TODO naprawic sendtypin

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		// Pobranie ID kanału z bazy danych
		const row = db.prepare('SELECT channelId FROM korwinChatChannel WHERE guildId = ?').get(message.guildId)
		const chatChannelId = row ? row.channelId : null

		// Sprawdzenie, czy wiadomość została wysłana na właściwym kanale i czy nie została wysłana przez bota
		if (message.channel.id === chatChannelId && !message.author.bot) {
			// Pobranie aktualnej daty w formacie YYYY-MM-DD
			const currentDate = new Date().toISOString().split('T')[0]

			// Pobranie limitu użycia chatu Korwina dla tego serwera z bazy danych
			const limitRow = db.prepare('SELECT korwinLimit FROM commandLimits WHERE guildId = ?').get(message.guildId)
			const maxKorwinUsage = limitRow ? limitRow.korwinLimit : 2 // Ustawienie domyślnego limitu na 25, jeśli nie został ustawiony przez administratora

			// Pobranie liczby użycia komendy z bazy danych
			const usageRow = db
				.prepare('SELECT count FROM korwinUsage WHERE guildId = ? AND date = ?')
				.get(message.guildId, currentDate)
			const usageCount = usageRow ? usageRow.count : 0

			// Sprawdzenie, czy limit użycia komendy został przekroczony
			if (usageCount >= maxKorwinUsage) {
				return message.channel.send(
					'Skończyły się dzisiejsze użycia bota w stylu Janusza Korwina-Mikke na tym serwerze.'
				)
			}

			// Wysłanie informacji o pisaniu wiadomości przez bota usuwa się automatycznie
			message.channel.sendTyping()

			try {
				const prompt = message.content
				const completion = await openai.createChatCompletion({
					model: 'gpt-3.5-turbo',
					messages: [
						{
							role: 'system',
							content: 'Nazywasz się Janusz Korwin-Mikke - zachowuj się dokładnie tak jak on.',
						},
						{ role: 'user', content: prompt },
					],
				})

				let reply = completion.data.choices[0].message.content

				// Sprawdzenie długości odpowiedzi
				if (reply.length > 2000) {
					reply = reply.substring(0, 1900) // Przycięcie odpowiedzi do maksymalnej długości
					reply +=
						'\n\n:warning: **Odpowiedź została przycięta, ponieważ przekroczyła maksymalną ilość znaków (2000).**'
				}

				message.channel.send(reply)

				// Zwiększenie licznika użycia komendy w bazie danych
				db.prepare('INSERT OR REPLACE INTO korwinUsage (guildId, date, count) VALUES (?, ?, ?)').run(
					message.guildId,
					currentDate,
					usageCount + 1
				)
			} catch (error) {
				console.error(error)
				message.channel.send('Wystąpił błąd podczas komunikacji z **API OpenAI.**\n\n' + '**Error**: https://http.cat/' + error.response.status)
			}
		}
	},
}
