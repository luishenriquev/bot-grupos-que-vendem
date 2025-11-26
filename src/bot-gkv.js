import axios from "axios";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENTES = [
  {
    numero: "554791629619@c.us",
    nome: "Luis",
    dominio: "http://plugin-grupos.local",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "55996428454@c.us",
    nome: "Jaqueline kuhn",
    dominio: "https://comprinhasdjake.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "5511940141195@c.us",
    nome: "Anali Gilio",
    dominio: "http://achadosanali.site",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "559981302102@c.us",
    nome: "Sayane Silva",
    dominio: "https://achadinhosdasay.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "557499375208@c.us",
    nome: "Vitoria da Silva",
    dominio: "https://promosdericca.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "557791957641@c.us",
    nome: "Rafaela Cardoso",
    dominio: "https://rafaindica.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "554999622468@c.us",
    nome: "Terezinha Aparecida Silveira Ramos",
    dominio: "https://grupoviptere.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "556284647145@c.us",
    nome: "Amanda Oliveira",
    dominio: "https://amandapromos.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "555199104162@c.us",
    nome: "Marilaine Garcia",
    dominio: "https://maricasaedecor.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "554699147432@c.us",
    nome: "Debora Gaio",
    dominio: "https://patydosachados.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "554799759682@c.us",
    nome: "Thaii Bachmann",
    dominio: "https://thaiibindica.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "5511963586884@c.us",
    nome: "Kesia de Paula",
    dominio: "https://kesiaachados.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "5511965913361@c.us",
    nome: "Daniela Batista",
    dominio: "https://loucaporofertas.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "554196452867@c.us",
    nome: "Edineia Barreiros",
    dominio: "https://promotianeia.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "5512982083707@c.us",
    nome: "Patricia Vitor",
    dominio: "https://indicacombia.com.br",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "5516981422322@c.us",
    nome: "Brenda Julien",
    dominio: "https://brendajulien.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "558888084051@c.us",
    nome: "Lucia Aquino",
    dominio: "https://promosluhindica.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI",
  },
  {
    numero: "5511965571056@c.us",
    nome: "Fellipe Rodrigues",
    dominio: "https://reginaindica.site",
    api_key: "SUA_API_KEY_AQUI",
  },
];

function numeroValido(valor) {
  return !isNaN(valor) && isFinite(valor);
}

function extrairNumeroInteligente(texto) {
  if (typeof texto !== "string") return null;

  // Remove espaços, "R$" e transforma vírgula em ponto
  let textoLimpo = texto
    .replace(/\s/g, "")
    .replace(/^R\$/i, "")
    .replace(",", ".");

  // Verifica se só tem números e ponto (decimais permitidos)
  if (!/^\d+(\.\d+)?$/.test(textoLimpo)) {
    return null; // inválido
  }

  const valor = Number(textoLimpo);

  // Verifica se é número finito e positivo
  if (!isNaN(valor) && isFinite(valor) && valor >= 0) {
    return valor;
  }

  return null; // inválido
}

function mensagemPadrao(texto) {
  return texto + "\n\n❌ *Para encerrar basta enviar: SAIR*";
}

function validarLinkWhatsApp(link) {
  const regex =
    /(https?:\/\/(chat\.whatsapp\.com|whatsapp\.com|wa\.me)\/[A-Za-z0-9._\-/?=]+)/i;

  return regex.test(link);
}

// ESTADO TEMPORÁRIO
const ESTADO_CONVERSA = {};
// { etapa, acao, grupos, passo, nome, link, dados }

function identificarCliente(numero) {
  const cleanNumero = numero.replace(/\s+/g, "").toLowerCase();
  return CLIENTES.find(
    (c) => c.numero.replace(/\s+/g, "").toLowerCase() === cleanNumero
  );
}

// LISTAR GRUPOS
async function listarGrupos(cliente) {
  try {
    const res = await axios.post(`${cliente.dominio}/wp-json/gkv/v1/list`, {
      api_key: cliente.api_key,
    });
    return res.data.grupos || {};
  } catch (err) {
    console.error("Erro ao listar grupos:", err.message);
    return {};
  }
}

// ATUALIZAR GRUPO (PAUSAR, ATIVAR, EXCLUIR)
async function atualizarGrupo(cliente, idGrupo, status) {
  try {
    const res = await axios.post(`${cliente.dominio}/wp-json/gkv/v1/update`, {
      api_key: cliente.api_key,
      id: idGrupo,
      status,
    });
    return res.data;
  } catch (err) {
    console.error("Erro ao atualizar grupo:", err.message);
    return { success: false, error: err.message };
  }
}

// CRIAR GRUPO
async function criarGrupo(cliente, nome, link) {
  try {
    const res = await axios.post(`${cliente.dominio}/wp-json/gkv/v1/create`, {
      api_key: cliente.api_key,
      name: nome,
      link,
    });
    return res.data;
  } catch (err) {
    console.error("Erro ao criar grupo:", err.message);
    return { success: false, error: err.message };
  }
}

async function pegarCliques(cliente) {
  try {
    const res = await axios.post(`${cliente.dominio}/wp-json/gkv/v1/cliques`, {
      api_key: cliente.api_key,
    });
    return res.data;
  } catch (err) {
    console.log("Erro ao buscar cliques:", err.message);
    return { success: false, error: err.message };
  }
}

// FORMATAR NÚMERO COM VÍRGULA
function f(num) {
  return Number(num).toFixed(2).replace(".", ",");
}

// FUNÇÃO PRINCIPAL DO BOT
export function configurarBot(client) {
  client.onMessage(async (msg) => {
    const numero = msg.from;
    const textoRaw = msg.body ? msg.body.trim() : "";
    const texto = textoRaw.toLowerCase();
    const cliente = identificarCliente(numero);

    if (!cliente) {
      client.sendText(numero, mensagemPadrao("❌ Você não está autorizado."));
      return;
    }

    if (texto.toLowerCase() === "sair") {
      delete ESTADO_CONVERSA[numero];

      client.sendText(
        numero,
        "🔄 Processo finalizado!\n\n" +
          "Se precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖"
      );
      return;
    }

    const menu2 = `
👋🏻 Olá *${cliente.nome}*! Eu sou a GQV IA, sua assistente inteligente do Grupos que Vendem.
Estou aqui para agilizar sua gestão e facilitar seu dia. Como posso te ajudar hoje? 🤗

📌 Opções disponíveis:

1️⃣ Criar grupo
2️⃣ Ativar grupo
3️⃣ Pausar grupo
4️⃣ Excluir grupo
5️⃣ Ver status dos grupos
6️⃣ Análise de Métricas de Performance
7️⃣ Priorizar grupos
8️⃣ Tráfego Pago

🚀 Conte comigo para deixar sua organização mais leve, prática e com resultados cada vez melhores!
`;

    // =========================== FLUXOS EM ANDAMENTO ===========================
    if (ESTADO_CONVERSA[numero]) {
      const estado = ESTADO_CONVERSA[numero];

      // =========================================
      // VALIDAÇÃO DO MENU PRINCIPAL (1 a 8)
      // =========================================
      if (estado.etapa === "menu_principal") {
        const saudacoes = ["oi"];

        if (saudacoes.includes(texto)) {
          client.sendText(numero, mensagemPadrao(menu2));
          return;
        }

        const op = parseInt(texto);

        // Se não for número, ou estiver fora do intervalo 1 a 8:
        if (isNaN(op) || op < 1 || op > 8) {
          await client.sendText(
            numero,
            "❌ Opção inválida.\n\nPor favor, escolha uma opção de *1 a 8* conforme o menu enviado. 😊"
          );

          client.sendText(numero, mensagemPadrao(menu));
          return;
        }
      }

      // ==================== Fluxo de seleção de grupo ====================
      if (estado.etapa === "grupo") {
        const indice = parseInt(texto, 10) - 1;
        const ids = Object.keys(estado.grupos);

        if (isNaN(indice) || indice < 0 || indice >= ids.length) {
          client.sendText(
            numero,
            mensagemPadrao(`❌ Opção inválida. Digite de 1 a ${ids.length}`)
          );
          return;
        }

        const id = ids[indice];
        const nome = estado.grupos[id];

        const resp = await atualizarGrupo(cliente, id, estado.acao);
        let retorno = "";

        if (estado.acao === "pausar")
          retorno = `⛔ O Grupo ${nome} foi pausado com sucesso!\n\nA GQV IA já atualizou o status. Se precisar reativar ou ajustar algo, é só me chamar. 🤖`;
        if (estado.acao === "ativar")
          retorno = `🟢 O Grupo ${nome} foi reativado com sucesso!\n\nA GQV IA já atualizou o status. Se precisar pausar ou ajustar algo, é só me chamar. 🤖`;
        if (estado.acao === "excluir")
          retorno = `🗑️ O Grupo ${nome} foi excluído com sucesso!\n\nA GQV IA já atualizou o status. Se precisar de algo, estou por aqui. 🤖`;

        client.sendText(
          numero,
          resp.success ? retorno : `❌ Erro: ${resp.error}`
        );
        delete ESTADO_CONVERSA[numero];
        return;
      }

      // ==================== Fluxo criação automática do nome (resposta sim/não) ====================
      if (estado.etapa === "novo_grupo_auto") {
        if (texto !== "sim" && texto !== "não") {
          client.sendText(
            numero,
            mensagemPadrao("❌ Responda apenas *sim* ou *não*.")
          );
          return;
        }

        if (texto === "não") {
          client.sendText(
            numero,
            mensagemPadrao("Tudo bem! Se precisar, é só chamar. 😊")
          );
          delete ESTADO_CONVERSA[numero];
          return;
        }

        // SE RESPONDEU "SIM"
        const grupos = estado.grupos;
        const nomes = Object.values(grupos).map((g) => g.name);

        // descobrir maior número
        let maiorNumero = 0;
        nomes.forEach((nome) => {
          const match = nome.match(/\d+/); // pega qualquer número no nome
          if (match) {
            const num = parseInt(match[0], 10);
            if (num > maiorNumero) maiorNumero = num;
          }
        });

        const novoNumero = maiorNumero + 1;
        const novoNome = `${novoNumero}`; // somente número

        // Pula etapa de nome e segue para pedir o link
        ESTADO_CONVERSA[numero] = {
          etapa: "novo_grupo",
          passo: "link",
          nome: novoNome,
        };

        client.sendText(
          numero,
          mensagemPadrao(
            `🔢 O próximo grupo será criado como: *${novoNome}*\n\n🔗 Por favor, envie agora o link do grupo para que eu possa continuar o processo.`
          )
        );

        return;
      }

      // ==================== Fluxo criar grupo (continua normal: passo link) ====================
      if (estado.etapa === "novo_grupo") {
        if (estado.passo === "nome") {
          // (este caminho não será usado pois pulamos o nome quando usamos auto, mas está mantido por segurança)
          estado.nome = msg.body.trim();
          estado.passo = "link";

          client.sendText(numero, mensagemPadrao("🔗 Envie o LINK do grupo:"));
          return;
        }

        // VALIDAR LINK DO GRUPO
        if (estado.passo === "link") {
          if (!validarLinkWhatsApp(texto)) {
            client.sendText(
              numero,
              mensagemPadrao(
                "❌ O link enviado não parece ser um link válido do WhatsApp.\n\nPor favor, envie um link correto no formato:\n\nhttps://chat.whatsapp.com/XXXXXXXXXXXX"
              )
            );
            return;
          }

          if (estado.passo === "link") {
            estado.link = msg.body.trim();
            const res = await criarGrupo(cliente, estado.nome, estado.link);

            if (res.success) {
              client.sendText(
                numero,
                `✅ O Grupo ${estado.nome} foi criado com sucesso e já está ativo! A GQV IA finalizou a criação. 🤖`
              );
            } else {
              client.sendText(numero, `❌ Erro: ${res.error}`);
            }

            delete ESTADO_CONVERSA[numero];
            return;
          }
        }
      }

      // ==================== Fluxo 6 – Métricas ====================
      if (estado.etapa === "metricas") {
        // PASSO 1 – MEMBROS
        if (estado.passo === "membros") {
          const valor = Number(textoRaw.replace(",", "."));
          if (!numeroValido(valor)) {
            client.sendText(
              numero,
              mensagemPadrao(
                "❌ Informe apenas números. Tente novamente.\n\n👥 Quantos membros TOTAL você tem hoje?"
              )
            );
            return;
          }

          estado.dados.membros = valor;
          estado.passo = "trafego";
          client.sendText(
            numero,
            mensagemPadrao("💰 Quanto você investiu em tráfego hoje? (R$)")
          );
          return;
        }

        // PASSO 2 – TRÁFEGO
        if (estado.passo === "trafego") {
          const valor = extrairNumeroInteligente(textoRaw);
          if (valor === null) {
            client.sendText(
              numero,
              mensagemPadrao(
                "❌ Informe apenas números. Tente novamente.\n\n💰 Quanto você investiu em tráfego hoje? (R$)"
              )
            );
            return;
          }
          //   const valor = Number(textoRaw.replace(",", "."));
          //   if (!numeroValido(valor)) {
          //     client.sendText(
          //       numero,
          //       mensagemPadrao(
          //         "❌ Informe apenas números. Tente novamente.\n\n💰 Quanto você investiu em tráfego hoje? (R$)"
          //       )
          //     );
          //     return;
          //   }

          estado.dados.trafego = valor;
          estado.passo = "dia_cliques";
        }

        // PASSO 3 – ESCOLHER DIA DOS CLIQUES
        if (estado.passo === "dia_cliques") {
          const dadosCliques = await pegarCliques(cliente);

          if (dadosCliques.erro || dadosCliques.success === false) {
            estado.passo === "confirmar_cliques";
            texto = "atualizar";
            return;
          }

          const cliquesDiaAnterior = dadosCliques.total_ontem;
          estado.dados.cliques = cliquesDiaAnterior;

          // Pergunta se quer atualizar ou prosseguir
          estado.passo = "confirmar_cliques";
          client.sendText(
            numero,
            mensagemPadrao(
              `🖱️ Verifiquei que ontem tivemos *${cliquesDiaAnterior}* cliques.\n\n` +
                "Podemos prosseguir com esse número ou você deseja atualizar os dados antes de continuar?\n\n" +
                "Responda *prosseguir* ou *atualizar*."
            )
          );
          return;
        }

        if (estado.passo === "confirmar_cliques") {
          if (texto === "prosseguir") {
            // Mantém os cliques do dia anterior e vai para comissão
            estado.passo = "comissao";
            client.sendText(
              numero,
              mensagemPadrao("💸 Qual foi o lucro de comissão hoje? (R$)")
            );
            return;
          }

          if (texto === "atualizar") {
            // Pergunta manualmente o valor
            estado.passo = "cliques_manual";
            client.sendText(
              numero,
              mensagemPadrao("🖱️ Quantos cliques você teve ontem?")
            );
            return;
          }

          // Qualquer outra resposta
          client.sendText(
            numero,
            mensagemPadrao("❌ Responda apenas *prosseguir* ou *atualizar*.")
          );
          return;
        }

        if (estado.passo === "cliques_manual") {
          const valor = Number(textoRaw.replace(",", "."));
          if (!numeroValido(valor)) {
            client.sendText(
              numero,
              mensagemPadrao(
                "❌ Informe apenas números. Quantos cliques você teve ontem?"
              )
            );
            return;
          }

          estado.dados.cliques = valor;
          estado.passo = "comissao";

          client.sendText(
            numero,
            mensagemPadrao("💸 Qual foi o lucro de comissão ontem? (R$)")
          );
          return;
        }

        // PASSO 4 – COMISSÃO (FINALIZA)
        if (estado.passo === "comissao") {
          const valor = extrairNumeroInteligente(textoRaw);
          if (valor === null) {
            client.sendText(
              numero,
              mensagemPadrao(
                "❌ Informe apenas números. Tente novamente.\n\n💸 Qual foi o lucro de comissão hoje? (R$)"
              )
            );
            return;
          }
          //   const valor = Number(textoRaw.replace(",", "."));
          //   if (!numeroValido(valor)) {
          //     client.sendText(
          //       numero,
          //       mensagemPadrao(
          //         "❌ Informe apenas números. Tente novamente.\n\n💸 Qual foi o lucro de comissão hoje? (R$)"
          //       )
          //     );
          //     return;
          //   }

          estado.dados.comissao = valor;
          const d = estado.dados;

          // CÁLCULOS - proteger divisão por zero
          const cpc = d.cliques && d.cliques > 0 ? d.trafego / d.cliques : 0;
          const epcDia =
            d.membros && d.membros > 0 ? d.comissao / d.membros : 0;
          const epcMes = epcDia * 30;

          let desempenhoTipo = ""; // "alta", "intermediaria", "baixa"
          if (epcMes < 0.8) desempenhoTipo = "baixa";
          else if (epcMes <= 1.5) desempenhoTipo = "intermediaria";
          else desempenhoTipo = "alta";

          // Monta relatórios conforme solicitado (com os textos que você passou)
          const commonHeader = `🤖✨ GQV IA – Análise de Métricas Concluída\n`;

          let resultadoTexto = "";
          if (desempenhoTipo === "alta") {
            resultadoTexto += `📊 Resultado: ALTA PERFORMANCE 🟢🔥\n\n`;
            resultadoTexto += `👥 Total de membros: ${d.membros}\n`;
            resultadoTexto += `💰 Investimento em tráfego: R$ ${f(
              d.trafego
            )}\n`;
            resultadoTexto += `🖱 Cliques (automático): ${d.cliques}\n`;
            resultadoTexto += `💸 Comissão gerada: R$ ${f(d.comissao)}\n\n`;
            resultadoTexto += `🖱️ CPC: R$ ${f(cpc)}\n`;
            resultadoTexto += `📊 EPC Diário: R$ ${f(epcDia)}\n`;
            resultadoTexto += `📆 EPC Mensal (estimado): R$ ${f(epcMes)}\n`;
            resultadoTexto += `📈 Projeção Mensal de Faturamento: R$ ${f(
              epcMes * d.membros
            )}\n\n`;
            resultadoTexto += `🚀 A GQV IA identificou um desempenho excelente!\nVocê está no ritmo certo — continue aplicando sua estratégia, porque seus resultados estão escalando de forma consistente!\n\n`;
            resultadoTexto += `Se precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖`;
          } else if (desempenhoTipo === "intermediaria") {
            resultadoTexto += `📊 Resultado: PERFORMANCE INTERMEDIÁRIA 🟡📈\n\n`;
            resultadoTexto += `👥 Total de membros: ${d.membros}\n`;
            resultadoTexto += `💰 Investimento em tráfego: R$ ${f(
              d.trafego
            )}\n`;
            resultadoTexto += `🖱 Cliques (automático): ${d.cliques}\n`;
            resultadoTexto += `💸 Comissão gerada: R$ ${f(d.comissao)}\n\n`;
            resultadoTexto += `🖱️ CPC: R$ ${f(cpc)}\n`;
            resultadoTexto += `📊 EPC Diário: R$ ${f(epcDia)}\n`;
            resultadoTexto += `📆 EPC Mensal (estimado): R$ ${f(epcMes)}\n`;
            resultadoTexto += `📈 Projeção Mensal de Faturamento: R$ ${f(
              epcMes * d.membros
            )}\n\n`;
            resultadoTexto += `✨ A GQV IA identificou evolução contínua.\nVocê está construindo uma boa base — pequenos ajustes agora podem te levar para um nível ainda maior de performance!\n\n`;
            resultadoTexto += `Se precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖`;
          } else {
            resultadoTexto += `📊 Resultado: BAIXA PERFORMANCE 🔴⚠️\n\n`;
            resultadoTexto += `👥 Total de membros: ${d.membros}\n`;
            resultadoTexto += `💰 Investimento em tráfego: R$ ${f(
              d.trafego
            )}\n`;
            resultadoTexto += `🖱 Cliques (automático): ${d.cliques}\n`;
            resultadoTexto += `💸 Comissão gerada: R$ ${f(d.comissao)}\n\n`;
            resultadoTexto += `🖱️ CPC: R$ ${f(cpc)}\n`;
            resultadoTexto += `📊 EPC Diário: R$ ${f(epcDia)}\n`;
            resultadoTexto += `📆 EPC Mensal (estimado): R$ ${f(epcMes)}\n`;
            resultadoTexto += `📈 Projeção Mensal de Faturamento: R$ ${f(
              epcMes * d.membros
            )}\n\n`;
            resultadoTexto += `⚠️ A GQV IA identificou pontos de atenção.\nIsso não é um problema — é uma direção! Ajustes estratégicos podem elevar esses números rapidamente. Continue firme, você está evoluindo!\n\n`;
            resultadoTexto += `Se precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖`;
          }

          client.sendText(numero, `${commonHeader}\n${resultadoTexto}`);
          delete ESTADO_CONVERSA[numero];
          return;
        }
      }

      // ==================== Fluxo 7 – Priorizar Grupos ====================
      if (estado.etapa === "priorizar") {
        // Extrair seleção
        const selecionados = texto
          .split(/[, ]+/)
          .map((n) => parseInt(n.trim(), 10) - 1)
          .filter((n) => !isNaN(n));

        const ids = Object.keys(estado.grupos);

        // Validação
        if (selecionados.length === 0) {
          client.sendText(
            numero,
            "❌ Envie pelo menos um número válido.\nExemplo: 1,3"
          );
          return;
        }

        for (let s of selecionados) {
          if (s < 0 || s >= ids.length) {
            client.sendText(numero, `❌ A opção ${s + 1} não existe.`);
            return;
          }
        }

        // IDs selecionados
        const idsSelecionados = selecionados.map((i) => ids[i]);

        // Ativar selecionados
        for (let id of idsSelecionados) {
          await atualizarGrupo(cliente, id, "ativar");
        }

        // Pausar os demais
        for (let id of ids) {
          if (!idsSelecionados.includes(id)) {
            await atualizarGrupo(cliente, id, "pausar");
          }
        }

        client.sendText(
          numero,
          `✅ Grupos priorizados com sucesso!\n\nSe precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖`
        );

        delete ESTADO_CONVERSA[numero];
        return;
      }

      // ==================== Fluxo 8 – Tráfego Pago ====================
      if (estado.etapa === "trafego_opcao") {
        if (texto === "1") {
          const videoUrl =
            "https://res.cloudinary.com/dqs8fgzlv/video/upload/v1764087428/tutorial_faniyt.mp4";

          await client.sendText(
            numero,
            `🎥 Aqui está o passo a passo para turbinar seu anúncio:\n\n${videoUrl}`
          );

          await client.sendText(
            numero,
            "Se precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖"
          );

          delete ESTADO_CONVERSA[numero];
          return;
        }

        if (texto === "2") {
          // Perguntar qual público
          ESTADO_CONVERSA[numero] = { etapa: "trafego_publico" };

          client.sendText(
            numero,
            mensagemPadrao(
              `
🧭 *Escolha o público validado:*

1️⃣ Casa & Decoração  
2️⃣ Maternidade

Digite sua opção:
      `
            )
          );
          return;
        }

        client.sendText(numero, "❌ Opção inválida. Digite 1 ou 2.");
        return;
      }

      // ===== Escolha do público validado =====
      if (estado.etapa === "trafego_publico") {
        // CASA E DECORAÇÃO
        if (texto === "1") {
          client.sendText(
            numero,
            "🏡 *Público: Casa & Decoração*\nAqui estão as versões:"
          );
          const img1 = path.join(__dirname, "..", "public", "decor1.jpeg");
          const img2 = path.join(__dirname, "..", "public", "decor2.jpeg");

          await client.sendFile(numero, img1, "decor1.jpeg", "Versão 1 🖼️");
          await client.sendFile(numero, img2, "decor2.jpeg", "Versão 2 🖼️");

          await client.sendText(
            numero,
            "Se precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖"
          );

          delete ESTADO_CONVERSA[numero];
          return;
        }

        // MATERNIDADE
        if (texto === "2") {
          client.sendText(
            numero,
            "👶 *Público: Maternidade*\nAqui estão as versões:"
          );

          const img1 = path.join(__dirname, "..", "public", "mat1.jpeg");
          const img2 = path.join(__dirname, "..", "public", "mat2.jpeg");

          await client.sendFile(numero, img1, "mat1.jpeg", "Versão 1 🖼️");
          await client.sendFile(numero, img2, "mat2.jpeg", "Versão 2 🖼️");

          await client.sendText(
            numero,
            "Se precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖"
          );

          delete ESTADO_CONVERSA[numero];
          return;
        }

        client.sendText(numero, "❌ Escolha apenas 1 ou 2.");
        return;
      }
    }

    const menu = `
👋🏻 Olá *${cliente.nome}*! Eu sou a GQV IA, sua assistente inteligente do Grupos que Vendem.
Estou aqui para agilizar sua gestão e facilitar seu dia. Como posso te ajudar hoje? 🤗

📌 Opções disponíveis:

1️⃣ Criar grupo
2️⃣ Ativar grupo
3️⃣ Pausar grupo
4️⃣ Excluir grupo
5️⃣ Ver status dos grupos
6️⃣ Análise de Métricas de Performance
7️⃣ Priorizar grupos
8️⃣ Tráfego Pago

🚀 Conte comigo para deixar sua organização mais leve, prática e com resultados cada vez melhores!
`;

    // =========================== MENU PRINCIPAL (mensagem padrão) ===========================

    if (!ESTADO_CONVERSA[numero] || texto === "oi") {
      ESTADO_CONVERSA[numero] = { etapa: "menu_principal" };
      // =========================== MENU SOMENTE QUANDO O USUÁRIO CHAMA ===========================
      const saudacoes = ["oi"];

      if (saudacoes.includes(texto)) {
        client.sendText(numero, mensagemPadrao(menu));
        return;
      } else {
        client.sendText(
          numero,
          "🤖 Estou aqui! Se precisar de mim, basta dizer: *oi*"
        );
      }
    }

    if (["1", "2", "3", "4", "5", "6", "7", "8"].includes(texto)) {
      // ====== 1 – CRIAR GRUPO (início do fluxo que lista e pergunta se quer criar automático)
      if (texto === "1") {
        const gruposAPI = await listarGrupos(cliente);
        const nomes = Object.values(gruposAPI).map((g) => g.name);

        let msg = "📋 Você já possui os seguintes grupos criados:\n";
        if (nomes.length === 0) {
          msg += "• Nenhum\n\n";
        } else {
          nomes.forEach((n) => (msg += `• ${n}\n`));
          msg += "\n";
        }

        msg += `✨ Deseja que eu crie o próximo grupo automaticamente?\nPor favor, responda sim ou não.`;

        client.sendText(numero, mensagemPadrao(msg));

        ESTADO_CONVERSA[numero] = {
          etapa: "novo_grupo_auto",
          grupos: gruposAPI,
        };

        return;
      }

      // ====== 5 – LISTAR STATUS
      if (texto === "5") {
        const gruposAPI = await listarGrupos(cliente);
        if (!gruposAPI || Object.keys(gruposAPI).length === 0) {
          client.sendText(numero, "⚠️ Nenhum grupo cadastrado.");
          return;
        }

        let txt = "📋 *Status dos Grupos:*\n\n";
        Object.keys(gruposAPI).forEach((id) => {
          const g = gruposAPI[id];
          txt += `• ${g.name} → ${g.active ? "🟢 ATIVO" : "⛔ PAUSADO"}\n`;
        });
        txt +=
          "\nSe precisar de mim para qualquer ajuste ou análise, é só me chamar. 🤖";

        client.sendText(numero, txt);
        return;
      }

      // ====== 6 – MÉTRICAS
      if (texto === "6") {
        ESTADO_CONVERSA[numero] = {
          etapa: "metricas",
          passo: "membros",
          dados: {},
        };

        const mensagem = `
📊 *ANÁLISE DE MÉTRICAS*

ℹ️ A análise será realizada sempre com base no dia anterior.
Isso garante acompanhamento preciso, organizado e actualizado para você. 📊

Vamos começar!

👥 Quantos membros TOTAL você tem hoje nos grupos?
`;

        client.sendText(numero, mensagemPadrao(mensagem));
        return;
      }

      // ====== 7 – PRIORIZAR GRUPOS
      if (texto === "7") {
        const gruposAPI = await listarGrupos(cliente);

        if (!gruposAPI || Object.keys(gruposAPI).length === 0) {
          client.sendText(numero, "⚠️ Nenhum grupo cadastrado.");
          return;
        }

        // Montar lista
        let lista = "📋 *Esses são seus grupos atuais:*\n\n";

        const ids = Object.keys(gruposAPI);

        ids.forEach((id, i) => {
          lista += `${i + 1}️⃣ ${gruposAPI[id].name}\n`;
        });

        lista += `
Digite os números dos grupos que deseja *priorizar*.
Exemplo: 1,3,4
`;

        ESTADO_CONVERSA[numero] = {
          etapa: "priorizar",
          grupos: gruposAPI,
        };

        client.sendText(numero, mensagemPadrao(lista));
        return;
      }

      // ====== 8 – TRÁFEGO PAGO
      if (texto === "8") {
        ESTADO_CONVERSA[numero] = { etapa: "trafego_opcao" };

        const msg = `
📣 *Tráfego Pago*

1️⃣ Passo a passo – Turbinar anúncio  
2️⃣ Público validado

Digite o número desejado:
  `;

        client.sendText(numero, mensagemPadrao(msg));
        return;
      }

      // ====== 2,3,4 – ATIVAR / PAUSAR / EXCLUIR
      const acao = {
        2: "ativar",
        3: "pausar",
        4: "excluir",
      }[texto];

      const gruposAPI = await listarGrupos(cliente);

      if (!gruposAPI || Object.keys(gruposAPI).length === 0) {
        client.sendText(numero, mensagemPadrao("⚠️ Nenhum grupo cadastrado."));
        return;
      }

      const grupos = {};
      Object.keys(gruposAPI).forEach((id) => (grupos[id] = gruposAPI[id].name));

      let lista = "📋 Selecione o grupo que deseja gerenciar:\n\n";
      Object.keys(grupos).forEach((id, i) => {
        lista += `${i + 1}️⃣ ${grupos[id]}\n`;
      });
      lista +=
        "\n✨ Escolha uma das opções acima para continuar. Estou aqui para facilitar sua gestão!";

      client.sendText(numero, mensagemPadrao(lista));
      ESTADO_CONVERSA[numero] = { etapa: "grupo", acao, grupos };
      return;
    }
  });
}
