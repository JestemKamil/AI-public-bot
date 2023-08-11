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
![Obrazek 1](https://cdn.discordapp.com/attachments/1136690682862501949/1138842066605056172/image.png)
![Obrazek 2](https://cdn.discordapp.com/attachments/1136690682862501949/1138841935881195651/image.png)
![Obrazek 3](https://cdn.discordapp.com/attachments/1136690682862501949/1138841898476376180/image.png)
![Obrazek 4](https://cdn.discordapp.com/attachments/1136690682862501949/1138841862979997766/image.png)
![Obrazek 5](https://cdn.discordapp.com/attachments/1136690682862501949/1138841732528754879/image.png)
![Obrazek 6](https://cdn.discordapp.com/attachments/1136690682862501949/1138841705521631403/image.png)
![Obrazek 7](https://cdn.discordapp.com/attachments/1136690682862501949/1138841581542199437/image.png)
![Obrazek 8](https://cdn.discordapp.com/attachments/1136690682862501949/1138842496412160040/image.png)
![Obrazek 9](https://cdn.discordapp.com/attachments/1136690682862501949/1139645164600700928/image.png)




