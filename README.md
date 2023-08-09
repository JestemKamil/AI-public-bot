<h1 align="center">Public AI bot</h1>

Nasz bot to bot który został stworzony pod typowo public AI bota, jest on specjalnie pod to skonfigurowany, ale możesz też go oczywiście użyć tylko na swoim serwerze.

## 🚧 Wymagania

1: Token bota discord [klik](https://discord.com/developers/docs/intro)

1.1: Pamiętaj aby włączyć intenty w zakładce bot 3 ostatnie opcje

2: OpenAI Api (za darmo 5 dolarów) [klik](https://platform.openai.com/account/api-keys)

3: Node.js (bez tego nie uruchomisz bota)

## ⚙️ Konfiguracja

Wejdź do pliku `config.js` i uzupelnij pola

```js
module.exports = {
	prefix: '!',
	owner: 'ID-OWNERA-BOTA',
	token: 'TOKEN-BOTA-DISCORD',
}
```

następnie wejdź do pliku `data.json` i uzupełnij pola

```json
{
	"apiopenai": "API-OPENAI https://platform.openai.com/account/api-keys",
	"dallEModelId": "image-dall-e-003"
}
```

## 🧠 Instalacja

Otwórz terminal bota i wpisz oto te polecenie

```sh
npm install
```

## 🏃‍♀️ Uruchamianie

Po prostu wpisz 

```sh
node index.js
```

## 🔧 Szczegółowe informacje znajdziesz na stronie wiki
https://github.com/JestemKamil/AI-public-bot/wiki

## 📸 Screenshoty

![Help](https://cdn.discordapp.com/attachments/1136690681289642015/1138839678888456273/image.png)




