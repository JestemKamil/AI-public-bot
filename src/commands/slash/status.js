const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const Database = require('better-sqlite3')
const db = new Database('./main.db')

// Nowa komenda /status
module.exports = {
	data: new SlashCommandBuilder().setName('status').setDescription('Sprawdź najważniejsze informacje o bocie'),
	async execute(interaction) {
		// Pobranie aktualnej daty w formacie YYYY-MM-DD
		const currentDate = new Date().toISOString().split('T')[0]

		// Pobranie limitów użycia komend dla tego serwera z bazy danych
		const limitRow = db
			.prepare('SELECT korwinLimit, openaiLimit, dallELimit FROM commandLimits WHERE guildId = ?')
			.get(interaction.guildId)
		const maxKorwinUsage = limitRow ? limitRow.korwinLimit : 25 // Ustawienie domyślnego limitu na 25, jeśli nie został ustawiony przez administratora
		const maxOpenaiUsage = limitRow ? limitRow.openaiLimit : 25 // Ustawienie domyślnego limitu na 25, jeśli nie został ustawiony przez administratora
		const maxDAllEUsage = limitRow ? limitRow.dallELimit : 25 // Ustawienie domyślnego limitu na 25, jeśli nie został ustawiony przez administratora

		// Pobranie liczby użycia chatu Korwina dla tego serwera z bazy danych
		const korwinChatUsageRow = db
			.prepare('SELECT count FROM korwinUsage WHERE guildId = ? AND date = ?')
			.get(interaction.guildId, currentDate)
		const korwinChatUsageCount = korwinChatUsageRow ? korwinChatUsageRow.count : 0

		const remainingKorwinChatUsage = maxKorwinUsage - korwinChatUsageCount

		// Pobranie liczby użycia komendy /openai dla tego serwera z bazy danych
		const openaiUsageRow = db
			.prepare('SELECT count FROM openaiUsage WHERE guildId = ? AND date = ?')
			.get(interaction.guildId, currentDate)
		const openaiUsageCount = openaiUsageRow ? openaiUsageRow.count : 0

		const remainingOpenaiUsage = maxOpenaiUsage - openaiUsageCount

		// Pobranie liczby użycia komendy /dall-e dla tego serwera z bazy danych
		const dAllEUsageRow = db
			.prepare('SELECT count FROM dAllEUsage WHERE guildId = ? AND date = ?')
			.get(interaction.guildId, currentDate)
		const dAllEUsageCount = dAllEUsageRow ? dAllEUsageRow.count : 0

		const remainingDAllEUsage = maxDAllEUsage - dAllEUsageCount

		// Pobranie ustawienia setup dla komendy "korwin" z bazy danych
		const setupRow = db.prepare('SELECT setupStatus FROM korwinSetup WHERE guildId = ?').get(interaction.guildId)
		const setupStatus = setupRow ? setupRow.setupStatus : 0

		// Formatowanie tekstu dla sekcji Chat Korwina
		let korwinChatText
		if (remainingKorwinChatUsage <= 0) {
			korwinChatText = `~~Chat Korwina: ${korwinChatUsageCount}/${maxKorwinUsage}~~`
		} else {
			korwinChatText = `Chat Korwina: ${korwinChatUsageCount}/${maxKorwinUsage}`
		}

		// Formatowanie tekstu dla sekcji Komenda /openai
		let openaiText
		if (remainingOpenaiUsage <= 0) {
			openaiText = `~~Komenda /openai: ${openaiUsageCount}/${maxOpenaiUsage}~~`
		} else {
			openaiText = `Komenda /openai: ${openaiUsageCount}/${maxOpenaiUsage}`
		}

		// Formatowanie tekstu dla sekcji Komenda /dall-e
		let dallEText
		if (remainingDAllEUsage <= 0) {
			dallEText = `~~Komenda /dall-e: ${dAllEUsageCount}/${maxDAllEUsage}~~`
		} else {
			dallEText = `Komenda /dall-e: ${dAllEUsageCount}/${maxDAllEUsage}`
		}

		// Formatowanie tekstu dla sekcji Setup-korwin
		let setupKorwinText
		if (setupStatus === 1) {
			setupKorwinText = 'Setup-korwin: **Tak**'
		} else {
			setupKorwinText = 'Setup-korwin: **Nie**'
		}

		const resetTime = new Date(currentDate).getTime() + 24 * 60 * 60 * 1000 // Czas resetu na następny dzień o północy

		const embed = new EmbedBuilder()
			.setColor(440041)
			.setTitle('Status pozostałych limitów')
			.setDescription(
				`Dzisiejsze użycia bota na tym serwerze:\n\n${korwinChatText}\n${openaiText}\n${dallEText}\n\nInne informacje:\n\n${setupKorwinText}\nLimity resetują się o północy (00:00).`
			)
			.setThumbnail(
				'https://cdn.discordapp.com/attachments/1044648147986681906/1137153889158828102/img-YrI5LoRaHPuTeiwLAAY3rbTx_preview_rev_1.png'
			)
			.addFields({ name: 'Pozostałe użycia chatu Korwina:', value: remainingKorwinChatUsage.toString(), inline: true })
			.addFields({ name: 'Pozostałe użycia komendy /openai:', value: remainingOpenaiUsage.toString(), inline: true })
			.addFields({ name: 'Pozostałe użycia komendy /dall-e:', value: remainingDAllEUsage.toString(), inline: true })
			.setFooter({
				text: 'Sparky AI',
				iconURL:
					'https://cdn.discordapp.com/attachments/1044648147986681906/1137153889158828102/img-YrI5LoRaHPuTeiwLAAY3rbTx_preview_rev_1.png',
			})

		await interaction.reply({ embeds: [embed] })
	},
}

// Funkcja do obliczania pozostałego czasu do resetu
function getRemainingTime(resetTime) {
	const now = new Date().getTime()
	const remainingTime = resetTime - now

	const hours = Math.floor(remainingTime / (1000 * 60 * 60))
	const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))

	return `${hours} godz. ${minutes} min.`
}
