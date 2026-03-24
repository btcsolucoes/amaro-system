const axios = require('axios');

async function enviarWhatsApp(mensagem) {
  const url = process.env.WHATSAPP_API_URL;
  const key = process.env.WHATSAPP_API_KEY;
  const instance = process.env.WHATSAPP_INSTANCE;
  const numero = process.env.WHATSAPP_NUMERO;

  if (!url || !key || !instance || !numero) {
    console.log('📱 [WhatsApp - SIMULADO]\n' + mensagem);
    return;
  }

  await axios.post(
    `${url}/message/sendText/${instance}`,
    { number: numero, text: mensagem },
    { headers: { apikey: key } }
  );
}

module.exports = { enviarWhatsApp };
