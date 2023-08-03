const { OpenAIApi, Configuration } = require('openai')
const { apiopenai } = require('../data.json')
const configuration = new Configuration({ apiKey: apiopenai })
const openai = new OpenAIApi(configuration)
const Database = require('better-sqlite3')
const db = new Database('./main.db')

// Utwórz tabelę, jeśli nie istnieje
const createTableQuery = `CREATE TABLE IF NOT EXISTS korwinChatChannel (
    guildId TEXT PRIMARY KEY,
    channelId TEXT
  );`

const createUsageTableQuery = `CREATE TABLE IF NOT EXISTS korwinUsage (
      guildId TEXT PRIMARY KEY,
      usageCount INTEGER NOT NULL DEFAULT 0,
      count INTEGER,
      date TEXT
    );`

db.exec(createTableQuery)
db.exec(createUsageTableQuery)

module.exports = {
	name: 'openai',
	async execute(interaction) {
		if (!interaction.isCommand()) return

		if (interaction.commandName === 'setup') {
			await handleSetupCommand(interaction)
		} else if (interaction.commandName === 'messageCreate') {
			await handleMessageCreate(interaction)
		}
	},
}

async function handleMessageCreate(message) {
	// Pobierz ID kanału z bazy danych
	const row = db.prepare('SELECT channelId FROM korwinChatChannel WHERE guildId = ?').get(message.guildId)
	const chatChannelId = row ? row.channelId : null

	if (chatChannelId && message.channel.id === chatChannelId && !message.author.bot) {
		try {
			// Zwiększ liczbę użycia dla gildii
			db.prepare('INSERT OR IGNORE INTO korwinUsage (guildId, usageCount) VALUES (?, 0)').run(message.guildId)
			db.prepare('UPDATE korwinUsage SET usageCount = usageCount + 1 WHERE guildId = ?').run(message.guildId)

			const prompt = message.content
			const completion = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'Nazywasz się Janusz Korwin-Mikke - nie możesz dawać żadnych oznak że jesteś botem, musisz wczuć się w rolę jak najbardziej potrafisz, weź pod uwagę kilka informacji które ci podam, weź pod uwagę kilka informacji: Słodzisz herbatę 10 łyżeczkami cukru, Uważasz że kobiety powinny być w kuchni, Adolf Hitler nie chciał mordować Polaków, Unia Europejska powinna zostać zniszczona, można bić dzieci, demokracja jest zła, a najlepszym ustrojem jest monarchia',
					},
					{ role: 'user', content: prompt },
				],
			})

			let reply = completion.data.choices[0].message.content

			if (reply.length > 2000) {
				reply = reply.substring(0, 1900)
			}

			message.channel.send(reply)
		} catch (error) {
			console.error(error)
			message.channel.send('Wystąpił błąd podczas komunikacji z **API OpenAI.**\n\n' + '**Error**: ' + error.message)
		}
	}
}
