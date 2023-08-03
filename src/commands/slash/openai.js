const { SlashCommandBuilder } = require('@discordjs/builders')
const { OpenAIApi, Configuration } = require('openai')
const { apiopenai } = require('../../data.json')
const configuration = new Configuration({ apiKey: apiopenai })
const openai = new OpenAIApi(configuration)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('openai')
		.setDescription('Zadaj pytanie do GPT')
		.addStringOption(option => option.setName('treść').setDescription('Treść pytania').setRequired(true).setMaxLength(2000)),
	async execute(interaction) {
		const question = interaction.options.getString('treść')


		await interaction.reply({
			content: `<:1108820964948590724:1136620320397197322> **Odpowiedź na pytanie:** ${question}\n\n<:1108820964948590724:1136620320397197322> **Autor wiadomości:** ${interaction.user}`,
			fetchReply: false,
		})

		try {
			const completion = await openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: [{"role": "system", "content": "Jesteś chatbotem AI."}, {role: "user", content: question}],
			  });

			let reply = completion.data.choices[0].message.content;

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
