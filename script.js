/* ============================================================
   ARQUIVO: script.js
   1) CONFIGURAÇÕES EDITÁVEIS (topo do arquivo): troque aqui o
      WhatsApp, endereço, link do Maps, horários, serviços e preços.
   2) Interatividade: seleção de serviço, mensagem do WhatsApp,
      menu mobile e preenchimento automático dos textos.
   3) Pré-agendamento integrado ao Supabase via window.APP_CONFIG.
   ============================================================ */

/* ---------- 1) CONFIGURAÇÕES EDITÁVEIS ---------- */

const CONFIG = {
  // Nome que aparece na mensagem do WhatsApp e no rodapé
  nome: "Barbearia Navalha & Estilo",

  // WhatsApp: só números, com código do país + DDD + número.
  // Exemplo: Brasil (55) + DDD (11) + 999990000 -> "5511999990000"
  // ATENÇÃO: este número é fictício. Troque pelo número real da barbearia.
  whatsapp: "5511999990000",

  // Endereço fictício (troque pelo real)
  endereco: "Rua das Palmeiras, 123, Centro",
  cidade: "Sua Cidade - UF, CEP 00000-000",

  // Link do Google Maps. Deixe "" para gerar a busca automática pelo endereço acima.
  // Para usar o link oficial: no Google Maps, clique em "Compartilhar" > "Copiar link".
  mapsUrl: "",

  // Horário de atendimento (uma linha por item)
  horarios: [
    { dias: "Segunda a sexta", horas: "09h às 20h" },
    { dias: "Sábado", horas: "08h às 18h" },
    { dias: "Domingo e feriados", horas: "Fechado" }
  ]
};

// Serviços e preços (preço em reais, apenas o número)
const SERVICOS = [
  { id: "degrade", nome: "Corte Degradê", descricao: "Degradê na máquina e na navalha, finalizado com pomada.", duracao: "40 min", preco: 45 },
  { id: "barba", nome: "Barba & Toalha Quente", descricao: "Barba modelada na navalha com toalha quente e hidratação.", duracao: "30 min", preco: 35 },
  { id: "combo", nome: "Combo Completo", descricao: "Corte, barba com toalha quente e sobrancelha no mesmo horário.", duracao: "1h10", preco: 75 },
  { id: "sobrancelha", nome: "Sobrancelha", descricao: "Design na navalha, de forma natural e discreta.", duracao: "15 min", preco: 15 }
];

/* ---------- 2) INTERATIVIDADE ---------- */

let servicoEscolhido = null; // guarda o serviço selecionado (ou null)

// Formata número em reais: 45 -> "R$ 45,00"
function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Monta a mensagem do WhatsApp conforme o serviço escolhido (edite o texto aqui)
function montarMensagem() {
  if (servicoEscolhido) {
    return "Olá, " + CONFIG.nome + "! Quero agendar: " + servicoEscolhido.nome +
      " (" + formatarPreco(servicoEscolhido.preco) + "). Quais horários estão disponíveis?";
  }
  return "Olá, " + CONFIG.nome + "! Quero agendar um horário. Quais horários estão disponíveis?";
}

// Gera o link do WhatsApp com a mensagem já preenchida
function linkWhatsApp() {
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(montarMensagem());
}

// Link do Google Maps (usa mapsUrl se preenchido; senão busca pelo endereço)
function linkMaps() {
  if (CONFIG.mapsUrl) return CONFIG.mapsUrl;
  const busca = CONFIG.nome + ", " + CONFIG.endereco + ", " + CONFIG.cidade;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(busca);
}

// Atualiza todos os botões/links de WhatsApp e Maps da página
function atualizarLinks() {
  const wa = linkWhatsApp();
  document.querySelectorAll("a.js-wa").forEach(function (a) { a.href = wa; });
  const maps = linkMaps();
  document.querySelectorAll("a.js-maps").forEach(function (a) { a.href = maps; });
}

// Preenche nome, endereço e cidade nos elementos com data-bind
function preencherTextos() {
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    const chave = el.getAttribute("data-bind");
    if (CONFIG[chave]) el.textContent = CONFIG[chave];
  });
  const anoEl = document.getElementById("ano");
  if (anoEl) anoEl.textContent = new Date().getFullYear();
}

// Monta a lista de horários
function montarHorarios() {
  const lista = document.getElementById("listaHorarios");
  if (!lista) return;
  CONFIG.horarios.forEach(function (h) {
    const linha = document.createElement("div");
    linha.className = "linha-horario";
    const dt = document.createElement("dt");
    dt.textContent = h.dias;
    const dd = document.createElement("dd");
    dd.className = "text-cinza";
    dd.textContent = h.horas;
    linha.append(dt, dd);
    lista.appendChild(linha);
  });
}

// Monta a lista de serviços
function montarServicos() {
  const lista = document.getElementById("listaServicos");
  if (!lista) return;
  SERVICOS.forEach(function (s) {
    const item = document.createElement("li");
    item.className = "servico";
    item.dataset.id = s.id;
    item.dataset.selecionado = "false";

    const info = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.className = "font-display text-xl font-semibold";
    titulo.textContent = s.nome;
    const desc = document.createElement("p");
    desc.className = "mt-1 text-cinza max-w-md";
    desc.textContent = s.descricao;
    const dur = document.createElement("p");
    dur.className = "mt-2 text-sm text-cinza";
    dur.textContent = "Duração aproximada: " + s.duracao;
    info.append(titulo, desc, dur);

    const acao = document.createElement("div");
    acao.className = "flex items-center justify-between sm:justify-end gap-5";
    const preco = document.createElement("span");
    preco.className = "preco";
    preco.textContent = formatarPreco(s.preco);
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn-escolher";
    botao.textContent = "Escolher";
    botao.setAttribute("aria-pressed", "false");
    botao.addEventListener("click", function () { alternarServico(s); });
    acao.append(preco, botao);

    item.append(info, acao);
    lista.appendChild(item);
  });
}

// Seleciona (ou desmarca, se clicar de novo) um serviço
function alternarServico(servico) {
  servicoEscolhido = (servicoEscolhido && servicoEscolhido.id === servico.id) ? null : servico;
  atualizarSelecao();
}

// Atualiza o visual da lista, o resumo e os links de WhatsApp
function atualizarSelecao() {
  document.querySelectorAll("#listaServicos .servico").forEach(function (item) {
    const ativo = !!servicoEscolhido && item.dataset.id === servicoEscolhido.id;
    item.dataset.selecionado = ativo ? "true" : "false";
    const botao = item.querySelector("button");
    botao.textContent = ativo ? "Escolhido" : "Escolher";
    botao.setAttribute("aria-pressed", ativo ? "true" : "false");
  });

  const resumo = document.getElementById("resumoServico");
  const limpar = document.getElementById("limparServico");
  if (resumo && limpar) {
    if (servicoEscolhido) {
      resumo.textContent = "Serviço escolhido: " + servicoEscolhido.nome + " (" + formatarPreco(servicoEscolhido.preco) + ")";
      limpar.classList.remove("hidden");
    } else {
      resumo.textContent = "Nenhum serviço escolhido ainda.";
      limpar.classList.add("hidden");
    }
  }

  // Reflete o serviço escolhido no formulário de pré-agendamento
  const seletor = document.getElementById("leadServico");
  if (seletor && servicoEscolhido) seletor.value = servicoEscolhido.nome;
  atualizarLinks();
}

// Menu mobile: abre e fecha
function iniciarMenuMobile() {
  const botao = document.getElementById("menuBtn");
  const menu = document.getElementById("menuMobile");
  if (!botao || !menu) return;

  function fechar() {
    menu.classList.add("hidden");
    menu.classList.remove("flex");
    botao.setAttribute("aria-expanded", "false");
  }

  botao.addEventListener("click", function () {
    const abrir = menu.classList.contains("hidden");
    menu.classList.toggle("hidden", !abrir);
    menu.classList.toggle("flex", abrir);
    botao.setAttribute("aria-expanded", abrir ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", fechar); });
}

/* ---------- 3) PRÉ-AGENDAMENTO (Supabase) ----------
   As credenciais NÃO ficam neste arquivo. Elas vêm de config.js, que define
   window.APP_CONFIG = { SUPABASE_URL, SUPABASE_ANON_KEY }.
   Tabela esperada: Leads (colunas: nome, whatsapp, servico). */

const TABELA_LEADS = "Leads";
const SERVICO_INDEFINIDO = "Ainda não sei";
let clienteSupabase = null;

// Cria o cliente do Supabase uma única vez. Retorna null se faltar config ou SDK.
function obterSupabase() {
  if (clienteSupabase) return clienteSupabase;

  const cfg = window.APP_CONFIG || {};
  const url = (cfg.SUPABASE_URL || "").trim();
  const chave = (cfg.SUPABASE_ANON_KEY || "").trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error("SUPABASE_URL inválida ou ausente em window.APP_CONFIG:", cfg);
    return null;
  }

  if (!chave) {
    console.error("SUPABASE_ANON_KEY ausente em window.APP_CONFIG:", cfg);
    return null;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("SDK do Supabase (@supabase/supabase-js@2) não carregou.");
    return null;
  }

  clienteSupabase = window.supabase.createClient(url, chave);
  return clienteSupabase;
}

// Preenche o <select> com os serviços da constante SERVICOS
function montarOpcoesServico() {
  const seletor = document.getElementById("leadServico");
  if (!seletor) return;
  const opcoes = [{ valor: "", texto: "Selecione um serviço" }]
    .concat(SERVICOS.map(function (s) { return { valor: s.nome, texto: s.nome }; }))
    .concat([{ valor: SERVICO_INDEFINIDO, texto: SERVICO_INDEFINIDO }]);
  opcoes.forEach(function (o) {
    const opt = document.createElement("option");
    opt.value = o.valor;
    opt.textContent = o.texto;
    seletor.appendChild(opt);
  });
}

// Mostra mensagem de sucesso ou erro abaixo do formulário
function mostrarStatusLead(texto, tipo) {
  const el = document.getElementById("leadStatus");
  if (!el) return;
  el.textContent = texto;
  el.dataset.tipo = tipo || "";
}

// Marca ou desmarca um campo como inválido
function marcarCampo(campo, invalido) {
  if (!campo) return;
  campo.setAttribute("aria-invalid", invalido ? "true" : "false");
}

// Valida, envia o lead ao Supabase e informa o resultado
async function enviarLead(evento) {
  evento.preventDefault();
  const form = evento.target;
  const botao = document.getElementById("leadEnviar");
  const campoNome = document.getElementById("leadNome");
  const campoZap = document.getElementById("leadWhatsapp");
  const campoServico = document.getElementById("leadServico");
  const campoIsca = document.getElementById("leadSite");

  // Robôs preenchem o campo isca: finge sucesso e não envia nada
  if (campoIsca && campoIsca.value) {
    form.reset();
    mostrarStatusLead("Recebemos seu pedido! Em breve entramos em contato.", "ok");
    return;
  }

  const nome = campoNome ? campoNome.value.trim() : "";
  const whatsapp = campoZap ? campoZap.value.replace(/\D/g, "") : "";
  const servico = campoServico ? campoServico.value : "";

  const nomeOk = nome.length >= 2;
  const zapOk = /^\d{10,13}$/.test(whatsapp);
  const servicoOk = servico !== "";
  marcarCampo(campoNome, !nomeOk);
  marcarCampo(campoZap, !zapOk);
  marcarCampo(campoServico, !servicoOk);

  if (!nomeOk || !zapOk || !servicoOk) {
    mostrarStatusLead("Confira os campos destacados: nome, WhatsApp com DDD e serviço.", "erro");
    return;
  }

  const cliente = obterSupabase();
  if (!cliente) {
    mostrarStatusLead("O formulário está indisponível no momento. Use o botão de WhatsApp para agendar.", "erro");
    return;
  }

  if (botao) botao.disabled = true;
  mostrarStatusLead("Enviando...", "");

  try {
    // Sem .select() de propósito: a política da tabela só permite inserir, não ler.
    const { error } = await cliente
      .from(TABELA_LEADS)
      .insert([{ nome: nome, whatsapp: whatsapp, servico: servico }]);

    if (error) throw error;

    form.reset();
    servicoEscolhido = null;
    atualizarSelecao();
    mostrarStatusLead("Recebemos seu pedido! Em breve entramos em contato pelo WhatsApp.", "ok");
  } catch (erro) {
    console.error("Erro ao enviar lead para o Supabase:", erro);
    mostrarStatusLead("Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp.", "erro");
  } finally {
    if (botao) botao.disabled = false;
  }
}

function iniciarFormulario() {
  const form = document.getElementById("formLead");
  if (!form) return;
  form.addEventListener("submit", enviarLead);
}

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
  preencherTextos();
  montarServicos();
  montarHorarios();
  iniciarMenuMobile();

  const limparBtn = document.getElementById("limparServico");
  if (limparBtn) {
    limparBtn.addEventListener("click", function () {
      servicoEscolhido = null;
      atualizarSelecao();
    });
  }

  montarOpcoesServico();
  iniciarFormulario();
  atualizarSelecao();
});