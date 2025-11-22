import { iniciarBot } from './bot.js';
import { configurarBot } from './bot-gkv.js';

async function main() {
  const client = await iniciarBot();  // inicia WhatsApp
  configurarBot(client);              // ativa os comandos
}

main();
