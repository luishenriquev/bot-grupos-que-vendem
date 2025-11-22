import axios from "axios";

const CLIENTES = [
  {
    numero: "554791629619@c.us",
    dominio: "http://plugin-grupos.local",
    api_key: "SUA_API_KEY_AQUI"
  },
  {
    numero: "5511965571056@c.us",
    dominio: "https://rafaindica.gruposquevendem.com",
    api_key: "SUA_API_KEY_AQUI"
  }
];

// ESTADO TEMPORÁRIO
const ESTADO_CONVERSA = {};  
// { etapa, acao, grupos, passo, nome, link, dados }

function identificarCliente(numero) {
  const cleanNumero = numero.replace(/\s+/g, '').toLowerCase();
  return CLIENTES.find(
    c => c.numero.replace(/\s+/g,'').toLowerCase() === cleanNumero
  );
}

// LISTAR GRUPOS
async function listarGrupos(cliente) {
  try {
    const res = await axios.post(`${cliente.dominio}/wp-json/gkv/v1/list`, {
      api_key: cliente.api_key
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
      status
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
      link
    });
    return res.data;
  } catch (err) {
    console.error("Erro ao criar grupo:", err.message);
    return { success: false, error: err.message };
  }
}

// FORMATAR NÚMERO COM VÍRGULA
function f(num) {
  return num.toFixed(2).replace(".", ",");
}

// FUNÇÃO PRINCIPAL DO BOT
export function configurarBot(client) {
  client.onMessage(async (msg) => {

    const numero = msg.from;
    const texto = msg.body.trim().toLowerCase();
    const cliente = identificarCliente(numero);

    if (!cliente) {
      client.sendText(numero, "❌ Você não está autorizado.");
      return;
    }

    // =========================== FLUXOS EM ANDAMENTO ===========================
    if (ESTADO_CONVERSA[numero]) {
      const estado = ESTADO_CONVERSA[numero];

      // ==================== Fluxo de seleção de grupo ====================
      if (estado.etapa === "grupo") {
        const indice = parseInt(texto, 10) - 1;
        const ids = Object.keys(estado.grupos);

        if (isNaN(indice) || indice < 0 || indice >= ids.length) {
          client.sendText(numero, `❌ Opção inválida. Digite de 1 a ${ids.length}`);
          return;
        }

        const id = ids[indice];
        const nome = estado.grupos[id];

        const resp = await atualizarGrupo(cliente, id, estado.acao);
        let retorno = "";

        if (estado.acao === "pausar") retorno = `⛔ Grupo *${nome}* pausado com sucesso!`;
        if (estado.acao === "ativar") retorno = `🟢 Grupo *${nome}* reativado!`;
        if (estado.acao === "excluir") retorno = `🗑️ Grupo *${nome}* excluído!`;

        client.sendText(numero, resp.success ? retorno : `❌ Erro: ${resp.error}`);
        delete ESTADO_CONVERSA[numero];
        return;
      }

      // ==================== Fluxo criar grupo ====================
      if (estado.etapa === "novo_grupo") {
        if (estado.passo === "nome") {
          estado.nome = msg.body.trim();
          estado.passo = "link";
          client.sendText(numero, "🔗 Envie o LINK do grupo:");
          return;
        }

        if (estado.passo === "link") {
          estado.link = msg.body.trim();
          const res = await criarGrupo(cliente, estado.nome, estado.link);

          if (res.success) {
            client.sendText(numero, `✅ Grupo criado: ${estado.nome}`);
          } else {
            client.sendText(numero, `❌ Erro: ${res.error}`);
          }

          delete ESTADO_CONVERSA[numero];
          return;
        }
      }

      // ==================== Fluxo 6 – Métricas ====================
      if (estado.etapa === "metricas") {

        // PASSO 1 – MEMBROS
        if (estado.passo === "membros") {
          estado.dados.membros = Number(texto.replace(",", "."));
          estado.passo = "trafego";
          client.sendText(numero, "💰 Quanto você investiu em tráfego hoje? (R$)");
          return;
        }

        // PASSO 2 – TRÁFEGO
        if (estado.passo === "trafego") {
          estado.dados.trafego = Number(texto.replace(",", "."));
          estado.passo = "cliques";
          client.sendText(numero, "🖱️ Quantos cliques você gerou hoje?");
          return;
        }

        // PASSO 3 – CLIQUES
        if (estado.passo === "cliques") {
          estado.dados.cliques = Number(texto.replace(",", "."));
          estado.passo = "comissao";
          client.sendText(numero, "💸 Qual foi o lucro de comissão hoje? (R$)");
          return;
        }

        // PASSO 4 – COMISSÃO (FINALIZA)
        if (estado.passo === "comissao") {
          estado.dados.comissao = Number(texto.replace(",", "."));

          const d = estado.dados;

          // CÁLCULOS
          const cpc = d.trafego / d.cliques;
          const epcDia = d.comissao / d.membros;
          const epcMes = epcDia * 30;

          let desempenho = "";
          if (epcMes < 0.80) desempenho = "🔴 *Desempenho MUITO BAIXO*";
          else if (epcMes >= 0.80 && epcMes <= 1.50)
            desempenho = "🟡 *Desempenho INTERMEDIÁRIO*";
          else desempenho = "🟢 *ALTA PERFORMANCE!*";

          // RESPOSTA FINAL
          const relatorio = `
📊 *ANÁLISE DE MÉTRICAS - RESULTADO FINAL*

👥 Total de membros: ${d.membros}
💰 Investimento em tráfego: R$ ${f(d.trafego)}
🖱️ Cliques: ${d.cliques}
💸 Comissão: R$ ${f(d.comissao)}

-------------------------------

🎯 *CPC*: R$ ${f(cpc)}
🎯 *EPC Diário*: R$ ${f(epcDia)}
📆 *EPC Mensal (estimado)*: R$ ${f(epcMes)}

${desempenho}

-------------------------------

📌 A média considerada ideal é:
• Abaixo de R$ 0,80 → muito baixa  
• Entre R$ 0,80 e R$ 1,50 → intermediária  
• Acima de R$ 1,50 → alta performance
`;

          client.sendText(numero, relatorio);
          delete ESTADO_CONVERSA[numero];
          return;
        }
      }
    }

    // =========================== MENU PRINCIPAL ===========================
    const menu = `
👋 *O que deseja fazer hoje?*

1️⃣ Criar grupo  
2️⃣ Ativar grupo  
3️⃣ Pausar grupo  
4️⃣ Excluir grupo  
5️⃣ Ver status dos grupos  
6️⃣ Análise de Métricas de Performance
`;

    if (["1","2","3","4","5","6"].includes(texto)) {

      // ====== 1 – CRIAR GRUPO
      if (texto === "1") {
        ESTADO_CONVERSA[numero] = { etapa: "novo_grupo", passo: "nome" };
        client.sendText(numero, "📋 Qual o nome do grupo?");
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
        Object.keys(gruposAPI).forEach(id => {
          const g = gruposAPI[id];
          txt += `• ${g.name} → ${g.active ? "🟢 ATIVO" : "⛔ PAUSADO"}\n`;
        });

        client.sendText(numero, txt);
        return;
      }

      // ====== 6 – MÉTRICAS
      if (texto === "6") {
        ESTADO_CONVERSA[numero] = {
          etapa: "metricas",
          passo: "membros",
          dados: {}
        };

        client.sendText(numero, "👥 Quantos membros TOTAL você tem hoje nos grupos?");
        return;
      }

      // ====== 2,3,4 – ATIVAR / PAUSAR / EXCLUIR
      const acao = {
        "2": "ativar",
        "3": "pausar",
        "4": "excluir"
      }[texto];

      const gruposAPI = await listarGrupos(cliente);

      if (!gruposAPI || Object.keys(gruposAPI).length === 0) {
        client.sendText(numero, "⚠️ Nenhum grupo cadastrado.");
        return;
      }

      const grupos = {};
      Object.keys(gruposAPI).forEach(id => (grupos[id] = gruposAPI[id].name));

      let lista = "📋 Escolha o grupo:\n\n";
      Object.keys(grupos).forEach((id, i) => {
        lista += `${i + 1}️⃣ ${grupos[id]}\n`;
      });

      client.sendText(numero, lista);
      ESTADO_CONVERSA[numero] = { etapa: "grupo", acao, grupos };
      return;
    }

    // MENSAGEM PADRÃO
    client.sendText(numero, menu);
  });
}
