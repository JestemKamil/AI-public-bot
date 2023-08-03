const { SlashCommandBuilder } = require('@discordjs/builders')
const { EmbedBuilder } = require('@discordjs/builders') // Import EmbedBuilder instead of MessageEmbed

module.exports = {
	data: new SlashCommandBuilder().setName('help').setDescription('Wyświetl informacje o bocie'),
	async execute(interaction) {
		const embed = new EmbedBuilder() // Use EmbedBuilder instead of MessageEmbed
			.setTitle('Informacje o bocie')
			.setColor(0xec4444) // Use a valid color number instead of a string
			.setDescription(
				'Jest to bot oparty na technologii sztucznej inteligencji.\nBot został stworzony przez `theproshizer`.\nAby AI wygenerowało obrazek poprawnie musisz napisać polecenie po angielsku.\n\nLista dostępnych komend w bocie: '
			)
			.addFields(
				{ name: '/openai', value: 'Zadaj pytanie do modelu OpenAI' },
				{ name: '/dall-e', value: 'Generuj obraz z opisu za pomocą modelu DALL-E' },
				{ name: '/setup', value: 'Można ustawić czat z korwinem lub go usunąć (jest to AI tylko tak jakby korwin)' },
				{ name: '/status', value: 'Pod tą komendą możemy zobaczyć aktualne limity jakie są na serwerze' },
				{ name: 'Ostatnia modyfikacja:', value: '<t:1690980720:R>', inline: true },
				{ name: 'Najnowsza komenda:', value: '/dall-e', inline: true }
			)
			.setFooter({
				text: 'Csowicze',
				iconURL:
					'https://cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559',
			})

		await interaction.reply({ embeds: [embed] })
	},
}
