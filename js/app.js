document.addEventListener("DOMContentLoaded", function () {
  const titulo = document.getElementById("Juntos");
  if (titulo) titulo.textContent = "Juntos Podemos Transformar Vidas";

  const tabs = document.querySelectorAll(".menu__tabs a[data-page]");
  const secoes = document.querySelectorAll(".tab-content");

  if (tabs.length > 0 && secoes.length > 0) {
    function mostrarSecao(id) {
      secoes.forEach(sec => {
        sec.style.display = (sec.id === id) ? "block" : "none";
      });

      tabs.forEach(tab => {
        tab.classList.remove("ativo");
        tab.removeAttribute("aria-current");
      });

      const atual = document.querySelector(`.menu__tabs a[data-page="${id}"]`);
      if (atual) {
        atual.classList.add("ativo");
        atual.setAttribute("aria-current", "page");
      }

      localStorage.setItem("maosamigas.pagina", id);
    }

    const paginaSalva = localStorage.getItem("maosamigas.pagina") || "home";
    mostrarSecao(paginaSalva);

    tabs.forEach(tab => {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        mostrarSecao(this.getAttribute("data-page"));
      });
    });
  }

  if (typeof $ !== "undefined") {
    if ($("#cpf").length) $("#cpf").mask("000.000.000-00");
    if ($("#telefone").length) $("#telefone").mask("(00) 00000-0000");
    if ($("#cep").length) $("#cep").mask("00000-000");
  }

  const menuLinks = document.querySelectorAll(".menu__list a");
  const paginaAtual = window.location.pathname.split("/").pop();

  menuLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === paginaAtual) {
      link.classList.add("ativo");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("ativo");
      link.removeAttribute("aria-current");
    }
  });

  const btn = document.getElementById("btn-qr");
  const area = document.getElementById("qr-area");

  if (btn && area) {
    btn.addEventListener("click", function () {
      const vaiAbrir = area.hasAttribute("hidden");
      if (vaiAbrir) {
        area.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
        btn.textContent = "Esconder QR do PIX";
      } else {
        area.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Mostrar QR do PIX";
      }
    });

    const img = area.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        area.innerHTML = '<p style="margin-top:8px;">QR ainda não disponível. Salve o arquivo em <code>imagens/pix-qr.png</code>.</p>';
      });
    }
  }
});
