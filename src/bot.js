import wppconnect from "@wppconnect-team/wppconnect";

export async function iniciarBot() {
  const client = await wppconnect.create({
    session: "bot-grupos",

    puppeteerOptions: {
      headless: "new", // importante
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
    },

    autoClose: 0, // nunca fecha automaticamente

    catchQR: (qrCode) => {
      console.log("\n📌 ESCANEIE O QR CODE ABAIXO:\n");
      console.log(qrCode);
    },
  });

  console.log("✅ Bot iniciado com sucesso!");
  return client;
}
