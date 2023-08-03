const { SlashCommandBuilder } = require('@discordjs/builders')
const { OpenAIApi, Configuration } = require('openai')
const { apiopenai } = require('../../data.json')
const configuration = new Configuration({ apiKey: apiopenai })
const openai = new OpenAIApi(configuration)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('openai')
		.setDescription('Zadaj pytanie do modelu OpenAI')
		.addStringOption(option => option.setName('treść').setDescription('Treść pytania').setRequired(true))
		.addIntegerOption(option => option.setName('temperatura').setDescription('Temperatura odpowiedzi (1-100)')),
	async execute(interaction) {
		const question = interaction.options.getString('treść')
		const temperatureInput = interaction.options.getInteger('temperatura')

		// Walidacja temperatury
		let temperature = 0
		if (temperatureInput) {
			if (temperatureInput < 1 || temperatureInput > 100) {
				return await interaction.reply(`Temperatura musi być w zakresie od 1 do 100.`)
			}
			temperature = temperatureInput / 100
		}

		// Sprawdzenie długości wiadomości
		if (question.length > 2000) {
			return await interaction.reply('Wiadomość przekroczyła maksymalną ilość znaków (2000). Proszę skrócić wiadomość.')
		}

		await interaction.reply({
			content: `<:1108820964948590724:1136620320397197322> **Odpowiedź na pytanie:** ${question}\n\n<:1108820964948590724:1136620320397197322> **Autor wiadomości:** ${interaction.user}`,
			fetchReply: false,
		})

		try {
			const completion = await openai.createCompletion({
				model: 'text-davinci-003',
				prompt: question,
				max_tokens: 2000,
				temperature: temperature,
			})

			let reply = completion.data.choices[0].text

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
			console.error(error)
			await interaction.followUp(
				'Wystąpił błąd podczas komunikacji z **API OpenAI.**\n\n' + '**Error**: ' + error.message
			)
		}
	},
}
