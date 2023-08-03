const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const Database = require('better-sqlite3')
const db = new Database('./main.db')

// Nowa komenda /status
module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Sprawdź aktualne użycie komend w stylu Janusza Korwina-Mikke'),
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

		const resetTime = new Date(currentDate).getTime() + 24 * 60 * 60 * 1000 // Czas resetu na następny dzień o północy

		const embed = new EmbedBuilder()
			.setColor(0xec4444)
			.setTitle('Status pozostałych limitów')
			.setDescription(
				`Dzisiejsze użycia bota na tym serwerze:\n${korwinChatText}\n${openaiText}\n${dallEText}\nLimity resetują się o północy (00:00).`
			)
			.addFields({ name: 'Pozostałe użycia chatu Korwina:', value: remainingKorwinChatUsage.toString(), inline: true })
			.addFields({ name: 'Pozostałe użycia komendy /openai:', value: remainingOpenaiUsage.toString(), inline: true })
			.addFields({ name: 'Pozostałe użycia komendy /dall-e:', value: remainingDAllEUsage.toString(), inline: true })

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
