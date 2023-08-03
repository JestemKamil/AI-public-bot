const { SlashCommandBuilder } = require('@discordjs/builders')
const Database = require('better-sqlite3')
const db = new Database('./main.db')

// Tworzenie tabeli, jeśli nie istnieje
db.prepare(
	`CREATE TABLE IF NOT EXISTS korwinChatChannel (
    guildId TEXT PRIMARY KEY,
    channelId TEXT
)`
).run()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Ustaw kanał do rozmowy z botem w stylu Janusza Korwina-Mikke')
		.addSubcommandGroup(subcommandGroup =>
			subcommandGroup
				.setName('korwin')
				.setDescription('Ustawienia kanału do rozmowy z botem w stylu Janusza Korwina-Mikke')
				.addSubcommand(subcommand =>
					subcommand
						.setName('dodaj')
						.setDescription('Dodaj kanał do rozmowy z botem')
						.addStringOption(option =>
							option.setName('id').setDescription('ID kanału do rozmowy z botem').setRequired(true)
						)
				)
				.addSubcommand(subcommand => subcommand.setName('usuń').setDescription('Usuń kanał do rozmowy z botem'))
		),
	async execute(interaction) {
		const updatingMessage = await interaction.reply({
			content: 'Trwa aktualizowanie kanału z chatem...',
			fetchReply: true,
		})

		if (interaction.options.getSubcommandGroup() === 'korwin') {
			if (interaction.options.getSubcommand() === 'dodaj') {
				const channelID = interaction.options.getString('id')

				// Sprawdzenie, czy użytkownik podał poprawne ID kanału
				const channel = interaction.guild.channels.cache.get(channelID)
				if (!channel) {
					return await updatingMessage.edit({ content: 'Podane ID kanału jest niepoprawne.' })
				}

				// Sprawdzenie, czy na kanale jest ustawione 10-sekundowe opóźnienie na pisanie
				if (channel.rateLimitPerUser < 10) {
					return await updatingMessage.edit({
						content:
							'Na wybranym kanale nie jest ustawione 10-sekundowe opóźnienie na pisanie. Aby ustawić setup, najpierw ustaw opóźnienie na 10 sekund lub więcej.',
					})
				}

				// Sprawdzenie, czy istnieje już kanał do rozmowy z botem
				const row = db.prepare('SELECT channelId FROM korwinChatChannel WHERE guildId = ?').get(interaction.guildId)
				if (row) {
					return await updatingMessage.edit({
						content: 'Możesz ustawić tylko jeden kanał do rozmowy z botem w stylu Janusza Korwina-Mikke.',
					})
				}

				// Zapisanie ID kanału do bazy danych
				db.prepare('INSERT OR REPLACE INTO korwinChatChannel (guildId, channelId) VALUES (?, ?)').run(
					interaction.guildId,
					channelID
				)

				setTimeout(() => {
					updatingMessage.edit(
						`Pomyślnie ustawiono kanał o ID: ${channelID} jako kanał do rozmowy z botem w stylu Janusza Korwina-Mikke.`
					)
				}, 5000)
			} else if (interaction.options.getSubcommand() === 'usuń') {
				// Usunięcie ID kanału z bazy danych
				db.prepare('DELETE FROM korwinChatChannel WHERE guildId = ?').run(interaction.guildId)

				setTimeout(() => {
					updatingMessage.edit(`Kanał do rozmowy z botem w stylu Janusza Korwina-Mikke został usunięty.`)
				}, 5000)
			}
		}
	},
}
