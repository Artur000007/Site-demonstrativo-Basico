/* ============================================================
   ARQUIVO: script.js
   1) CONFIGURAÇÕES EDITÁVEIS (topo do arquivo): troque aqui o
      WhatsApp, endereço, link do Maps, horários, serviços e preços.
   2) Interatividade: seleção de serviço, mensagem do WhatsApp,
      menu mobile e preenchimento automático dos textos.
   Nenhuma chave de API ou segredo é usado neste projeto.
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
  document.getElementById("ano").textContent = new Date().getFullYear();
}

// Monta a lista de horários
function montarHorarios() {
  const lista = document.getElementById("listaHorarios");
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
  if (servicoEscolhido) {
    resumo.textContent = "Serviço escolhido: " + servicoEscolhido.nome + " (" + formatarPreco(servicoEscolhido.preco) + ")";
    limpar.classList.remove("hidden");
  } else {
    resumo.textContent = "Nenhum serviço escolhido ainda.";
    limpar.classList.add("hidden");
  }
  atualizarLinks();
}

// Menu mobile: abre e fecha
function iniciarMenuMobile() {
  const botao = document.getElementById("menuBtn");
  const menu = document.getElementById("menuMobile");

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

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
  preencherTextos();
  montarServicos();
  montarHorarios();
  iniciarMenuMobile();
  document.getElementById("limparServico").addEventListener("click", function () {
    servicoEscolhido = null;
    atualizarSelecao();
  });
  atualizarSelecao(); // também define os links iniciais de WhatsApp e Maps
});
