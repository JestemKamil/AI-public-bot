const { OpenAIApi, Configuration } = require('openai')
const { apiopenai } = require('../data.json')
const configuration = new Configuration({ apiKey: apiopenai })
const openai = new OpenAIApi(configuration)
const Database = require('better-sqlite3')
const db = new Database('./main.db')

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		// Pobranie ID kanału z bazy danych
		const row = db.prepare('SELECT channelId FROM korwinChatChannel WHERE guildId = ?').get(message.guildId)
		const chatChannelId = row ? row.channelId : null

		// Sprawdzenie, czy wiadomość została wysłana na właściwym kanale i czy nie została wysłana przez bota
		if (message.channel.id === chatChannelId && !message.author.bot) {
			try {
				const prompt = `Użytkownik: ${message.content}\nJanusz Korwin-Mikke:`
				const completion = await openai.createCompletion({
					model: 'text-davinci-003',
					prompt: prompt,
					max_tokens: 2000,
					temperature: 0.5,
				})

				let reply = completion.data.choices[0].text

				// Sprawdzenie długości odpowiedzi
				if (reply.length > 2000) {
					reply = reply.substring(0, 1900) // Przycięcie odpowiedzi do maksymalnej długości
					reply +=
						'\n\n:warning: **Odpowiedź została przycięta, ponieważ przekroczyła maksymalną ilość znaków (2000).**'
				}

				message.channel.send(reply)
			} catch (error) {
				console.error(error)
				message.channel.send('Wystąpił błąd podczas komunikacji z **API OpenAI.**\n\n' + '**Error**: ' + error.message)
			}
		}
	},
}
