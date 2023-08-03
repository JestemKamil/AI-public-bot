const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios')
const { EmbedBuilder } = require('@discordjs/builders') // Keep using your custom EmbedBuilder
const { apiopenai } = require('../../data.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dall-e')
		.setDescription('Generuj obraz z opisu za pomocą modelu DALL-E')
		.addStringOption(option => option.setName('opis').setDescription('Opis obrazka').setRequired(true)),
	async execute(interaction) {
		const prompt = interaction.options.getString('opis')

		await interaction.deferReply()

		try {
			const generatedImageURL = await generateImageWithDALL_E(prompt)

			const embed = new EmbedBuilder() // Use your custom EmbedBuilder
				.setTitle('Oto wygenerowany obraz za pomocą AI')
				.setImage(generatedImageURL)
				.setColor(0xec4444)
				.addFields(
					{ name: 'Opis obrazka:', value: prompt, inline: true },
					{ name: 'Autor wiadomości:', value: interaction.user.username, inline: true }
				)
				.setFooter({
					text: 'Csowicze',
					iconURL:
						'https://cdn.discordapp.com/avatars/1108765755476029442/76205059c498d5d389f4fb1043f92638.png?width=559&height=559',
				})

			await interaction.editReply({ embeds: [embed] })
		} catch (error) {
			console.error(error)
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
