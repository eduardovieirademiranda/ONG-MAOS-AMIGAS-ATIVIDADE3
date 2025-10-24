document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1) Título principal
  // =========================
  const titulo = document.getElementById("Juntos");
  if (titulo) titulo.textContent = "Juntos Podemos Transformar Vidas";

  // =========================
  // 2) Mini-SPA (abas internas)
  // =========================
  const app = document.getElementById("app");
  const tabLinks = app ? app.querySelectorAll(".tabs a[data-page]") : [];
  const sections = app ? document.querySelectorAll("#app > section[id]") : [];

  function mostrarAba(id) {
    sections.forEach(sec => (sec.style.display = sec.id === id ? "block" : "none"));
    tabLinks.forEach(a => a.removeAttribute("aria-current"));
    const atual = app?.querySelector(`.tabs a[data-page="${id}"]`);
    if (atual) atual.setAttribute("aria-current", "page");
    localStorage.setItem("maosamigas.aba", id);
  }

  if (tabLinks.length && sections.length) {
    tabLinks.forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const alvo = a.getAttribute("data-page");
        if (alvo) mostrarAba(alvo);
      });
    });
    const ultima = localStorage.getItem("maosamigas.aba") || "home";
    mostrarAba(ultima);
  }

 // =========================
// 3) QR Code (mostrar/ocultar + persistência)
// =========================
const toggleBtn = document.getElementById("qr-toggle");
const qrArea = document.getElementById("qr-area");

if (toggleBtn && qrArea) {
  // Lê estado salvo
  const salvo = localStorage.getItem("qrVisivel") === "true";
  setVisivel(salvo);

  function setVisivel(vis) {
    if (vis) qrArea.removeAttribute("hidden");
    else qrArea.setAttribute("hidden", "");
    toggleBtn.setAttribute("aria-expanded", vis);
    toggleBtn.textContent = vis ? "Ocultar QR do PIX" : "Mostrar QR do PIX";
    localStorage.setItem("qrVisivel", vis);
  }

  toggleBtn.addEventListener("click", () => {
    const estaVisivel = !qrArea.hasAttribute("hidden");
    setVisivel(!estaVisivel);
  });
}


  // =========================
  // 4) Templates: lista de destaques
  // =========================
  const destaques = [
    { titulo: "Projeto Esperança", resumo: "Atendimento a crianças com atividades educativas e esportivas." },
    { titulo: "Futuro Verde",     resumo: "Mutirões de plantio e educação ambiental na comunidade." },
    { titulo: "Inclusão Digital", resumo: "Oficinas de tecnologia para jovens e adultos." }
  ];

  const ulDestaques = document.getElementById("lista-destaques");
  if (ulDestaques) {
    ulDestaques.innerHTML = destaques.map(p => `
      <li class="card">
        <h3 class="subtitulo">${p.titulo}</h3>
        <p>${p.resumo}</p>
      </li>
    `).join("");
  }

  // =========================
  // 5) Validação do formulário (cadastro.html)
  // =========================
  const form = document.getElementById("form-cadastro") || document.querySelector("main form, form");
  if (form) {
    const onlyDigits = s => (s || "").replace(/\D/g, "");
    const $ = id => document.getElementById(id);

    // cria <small class="erro"> se não existir logo após o input
    function ensureErroNode(input) {
      const next = input.nextElementSibling;
      if (next && next.classList?.contains("erro")) return next;
      const small = document.createElement("small");
      small.className = "erro";
      small.setAttribute("aria-live", "polite");
      input.insertAdjacentElement("afterend", small);
      return small;
    }

    const campos = [];
    const pushCampo = (id, valida, msg) => {
      const el = $(id);
      if (el) campos.push({ el, valida, msg });
    };

    // Básicos
    pushCampo("nome", v => v.trim().split(/\s+/).length >= 2, "Informe nome e sobrenome.");
    pushCampo("email", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido.");
    pushCampo("cpf", v => onlyDigits(v).length === 11, "CPF deve ter 11 dígitos.");
    pushCampo("telefone", v => onlyDigits(v).length >= 10, "Telefone com DDD (mín. 10 dígitos).");

    // Endereço (IDs no seu HTML: cep, logradouro, numero, bairro, cidade, estado)
    pushCampo("cep", v => onlyDigits(v).length === 8, "CEP deve ter 8 dígitos.");
    pushCampo("logradouro", v => v.trim().length >= 3, "Logradouro obrigatório.");
    pushCampo("numero", v => v.trim().length > 0, "Número obrigatório.");
    pushCampo("bairro", v => v.trim().length >= 2, "Bairro obrigatório.");
    pushCampo("cidade", v => v.trim().length >= 2, "Cidade obrigatória.");

    // UF pode ser "estado" (seu HTML) ou "uf" (outra variação)
    const ufId = $("estado") ? "estado" : ($("uf") ? "uf" : null);
    if (ufId) pushCampo(ufId, v => /^[A-Z]{2}$/.test((v || "").toString().toUpperCase()), "Selecione a UF.");

    function mostrarErro(input, mensagem) {
      const small = ensureErroNode(input);
      small.textContent = mensagem || "";
      input.setAttribute("aria-invalid", mensagem ? "true" : "false");
    }

    function validarCampo(c) {
      const ok = c.valida(c.el.value);
      mostrarErro(c.el, ok ? "" : c.msg);
      return ok;
    }

    campos.forEach(c => c.el.addEventListener("input", () => validarCampo(c)));

    // ViaCEP (auto-preencher)
    const cepEl = $("cep"),
          logEl = $("logradouro"),
          baiEl = $("bairro"),
          cidEl = $("cidade"),
          ufEl  = $("estado") || $("uf");

    if (cepEl && logEl && baiEl && cidEl && ufEl) {
      cepEl.addEventListener("input", async () => {
        const cepNum = onlyDigits(cepEl.value);
        if (cepNum.length !== 8) return;
        try {
          const resp = await fetch(`https://viacep.com.br/ws/${cepNum}/json/`);
          const data = await resp.json();
          if (data.erro) throw new Error("CEP não encontrado");
          logEl.value = data.logradouro || "";
          baiEl.value = data.bairro || "";
          cidEl.value = data.localidade || "";
          ufEl.value  = (data.uf || "").toUpperCase();
          [logEl, baiEl, cidEl, ufEl].forEach(el => {
            const c = campos.find(x => x.el === el);
            if (c) validarCampo(c);
          });
        } catch {
          mostrarErro(cepEl, "CEP inválido ou indisponível.");
        }
      });
    }

    form.addEventListener("submit", (e) => {
      const ok = campos.every(validarCampo);
      if (!ok) {
        e.preventDefault();
        alert("Corrija os campos destacados antes de enviar.");
        return;
      }
      // Persistência básica
      const nomeEl = $("nome"), emailEl = $("email"), cepEl2 = $("cep");
      if (nomeEl)  localStorage.setItem("maosamigas.form.nome", nomeEl.value.trim());
      if (emailEl) localStorage.setItem("maosamigas.form.email", emailEl.value.trim());
      if (cepEl2)  localStorage.setItem("maosamigas.form.cep", onlyDigits(cepEl2.value));
    });
  }

  console.log("✅ App inicializado.");
});
