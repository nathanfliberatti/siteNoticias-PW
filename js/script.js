/* ===== LANDING PAGE ===== */

/* ===== API DE NOTÍCIAS ===== */

//Seletores principais =====
const breakingImg = document.querySelector("#breakingImg");
const breakingNews_title = document.querySelector("#breakingNews .title");
const breakingNews_desc = document.querySelector("#breakingNews .description");

const apiKey = "pub_abd5f10acace4a05a2a685db4053f650";

// Imagem default caso a notícia não tenha. Mesmo adicionando filtro 
// de notícias apenas com imagens, o filtro não funciona, acredito que seja 
// por conta de o plano da API ser gratuito
const defaultImage = "https://ito-group.com/wp-content/uploads/2025/04/no-image.jpg";

// Configuração das seções
// Mesmo direcionando cada categoria para o seu endpoint especificado na 
// documentação da API, elas acabam se misturando um pouco
const sections = {
  top: { element: document.querySelector(".topNews"), category: "", minCount: 10, cardClass: "news" },
  politics: { element: document.querySelector("#politicsNews .newsBox"), category: "politics", minCount: 5, cardClass: "newsCard" },
  economy: { element: document.querySelector("#economyNews .newsBox"), category: "business", minCount: 5, cardClass: "newsCard" },
  sports: { element: document.querySelector("#sportsNews .newsBox"), category: "sports", minCount: 5, cardClass: "newsCard" },
  international: { element: document.querySelector("#internationalNews .newsBox"), category: "world", minCount: 5, cardClass: "newsCard" },
  tech: { element: document.querySelector("#techNews .newsBox"), category: "technology", minCount: 5, cardClass: "newsCard" },
};

// Função que busca múltiplas páginas até preencher as notícias
const fetchValidNews = async (category = "", minCount = 5) => {
  let url = category
    ? `https://newsdata.io/api/1/news?country=br&language=pt&size=10&category=${category}&apikey=${apiKey}`
    : `https://newsdata.io/api/1/news?country=br&language=pt&size=10&apikey=${apiKey}`;

  let validNews = [];
  let nextPage = null;

  while (validNews.length < minCount && url) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.results) break;

      // Filtra apenas notícias com título e link válidos
      const filtered = data.results.filter(
        (el) => el.link && el.title
      );

      // O operador "..." espalha os itens do array, adicionando cada notícia individualmente
      validNews.push(...filtered);

      // Paginação
      nextPage = data.nextPage;
      url = nextPage
        ? `https://newsdata.io/api/1/news?country=br&language=pt&size=10${category ? `&category=${category}` : ""}&apikey=${apiKey}&page=${nextPage}`
        : null;

    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
      break;
    }
  }

  return validNews.slice(0, minCount);
};

// Cria o HTML genérico para os cards
const createNewsHTML = (data, cardClass) => {
  const uniqueLinks = new Set(); //Estava pegando notícias repetidas, isso evita, 
  // mas ainda assim está repetindo
  return data
    .filter((e) => e.link && e.title && !uniqueLinks.has(e.link) && uniqueLinks.add(e.link))
    .map((e) => {
      const img = e.image_url || defaultImage;
      const title = e.title.length < 100 ? e.title : e.title.slice(0, 100) + "...";
      return `
        <div class="${cardClass}">
          <div class="img"><img src="${img}" alt="Imagem"></div>
          <div class="text">
            <div class="title">
              <a href="${e.link}" target="_blank"><p>${title}</p></a>
            </div>
          </div>
        </div>`;
    })
    .join("");
};

// Função para carregar cada seção dinamicamente
const loadSection = async ({ element, category, minCount, cardClass }) => {
  const data = await fetchValidNews(category, minCount);
  element.innerHTML = createNewsHTML(data, cardClass);
};

// Últimas notícias
const addBreakingNews = async () => {
  const data = await fetchValidNews("", 1);
  if (!data[0]) return;

  // Desestruturação de objetos:
  // Extrai diretamente as propriedades 'image_url', 'link', 'title' e 'description'
  // do primeiro objeto do array 'data', criando variáveis individuais.
  // A desestruturação é especialmente útil quando trabalhamos com objetos complexos ou recebidos 
  // de APIs, permitindo manipular os dados de forma direta e concisa.
  const { image_url, link, title, description } = data[0];
  const img = image_url || defaultImage;

  breakingImg.innerHTML = `<img src="${img}" alt="Imagem">`;
  breakingNews_title.innerHTML = `<a href="${link}" target="_blank"><h2>${title}</h2></a>`;
  breakingNews_desc.innerHTML = description || "Sem descrição disponível.";
};

// Execução principal
(async () => {
  try {
    await addBreakingNews();
    for (const section of Object.values(sections)) {
      await loadSection(section);
    }
  } catch (error) {
    console.error("Erro ao carregar a API de Notícias: ", error);
  }
})();

// Menu hambúrguer
let toggleMenu = document.querySelector(".bar");
let menu = document.querySelector("nav ul");

const toggle = (e) => {
  toggleMenu.classList.toggle('active');
  menu.classList.toggle('activeMenu');
}

toggleMenu.addEventListener('click', toggle);

// Política de Cookies
document.addEventListener("DOMContentLoaded", () => {
  const cookieModal = document.getElementById("cookieModal");
  const acceptBtn = document.getElementById("acceptCookies");

  //Verifica se o usuário já aceitou
  const accepted = localStorage.getItem("cookiesAccepted");

  if (!accepted) {
    cookieModal.style.display = "flex";
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", "true");
    cookieModal.style.display = "none";
  });
});

// Abrir modal de Política de Privacidade
document.getElementById("openPrivacyPolicy").addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("privacyPolicyBanner").style.display = "flex";
});

// Fechar modal de Política de Privacidade
document.getElementById("closePrivacyPolicy").addEventListener("click", function () {
    document.getElementById("privacyPolicyBanner").style.display = "none";
});
// Fechar modal de Política de Privacidade ao clicar fora do conteúdo
document.getElementById("privacyPolicyBanner").addEventListener("click", function (e) {
    if (e.target === this) {
        this.style.display = "none";
    }
});
