import wppconnect from "@wppconnect-team/wppconnect";

export async function iniciarBot() {
  const client = await wppconnect.create({
    session: "bot-grupos",
    puppeteerOptions: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },

    autoClose: 0, // nunca fecha automaticamente

    catchQR: (qrCode) => {
      console.log("\n📌 ESCANEIE O QR CODE ABAIXO:\n");
      console.log(qrCode);
    },
  });

  console.log("Bot iniciado!");
  return client;
}
