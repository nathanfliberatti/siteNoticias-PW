let breakingImg = document.querySelector("#breakingImg");
let breakingNews_title = document.querySelector("#breakingNews .title");
let breakingNews_desc = document.querySelector("#breakingNews .description");

let topNews = document.querySelector(".topNews");

let politicsNews = document.querySelector("#politicsNews .newsBox");
let economyNews = document.querySelector("#economyNews .newsBox");
let sportsNews = document.querySelector("#sportsNews .newsBox");
let internationalNews = document.querySelector("#internationalNews .newsBox");
let techNews = document.querySelector("#techNews .newsBox");

const apiKey = "pub_f98d6b9928a344c2ae99cdccb48920d5";

const fetchData = async (category, size) => {
    const url = category
        ? `https://newsdata.io/api/1/news?country=br&size=${size}&category=${category}&apikey=${apiKey}`
        : `https://newsdata.io/api/1/news?country=br&size=10&apikey=${apiKey}`;
    const data = await fetch(url);
    const response = await data.json();

    console.log(response); //TIRAR DEPOIS DE TESTAR
    return response.results;
}
fetchData();

// Adicionando últimas notícias
const add_breaking_news = (data) => {
    breakingImg.innerHTML = `<img src="${data[0].image_url}" alt="Imagem">`;
    breakingNews_title.innerHTML = `<a href="${data[0].link}" target="_blank"><h2>${data[0].title}</h2></a>`;
    breakingNews_desc.innerHTML = `${data[0].description}`;
}
fetchData().then(add_breaking_news);


// Adicionando notícias populares
const add_topNews = (data) => {
    let html = '';
    let title = '';
    const uniqueLinks = new Set(); //Estava pegando notícias repetidas, isso evita

    data.forEach((element) => {
        if (!element.link || uniqueLinks.has(element.link) ||
            !element.image_url || !element.title) {
            return; // Pula esta iteração se o link for nulo ou já foi adicionado, ou se não tiver imagem ou título
        }
        uniqueLinks.add(element.link);

        if (element.title.length < 100) {
            title = element.title;
        }
        else {
            // corta título se for muito longo
            title = element.title.slice(0, 100) + '...';
        }

        html += `<div class="news">
                    <div class="img">
                        <img src="${element.image_url}" alt="Imagem">
                    </div>
                    <div class="text">
                        <div class="title">
                            <a href="${element.link}" target="_blank"><p>${title}</p></a>
                        </div>
                    </div>
                </div>`
    });
    topNews.innerHTML = html;
}
fetchData('', 10).then(add_topNews);


// Adicionando notícias de política
const add_politicsNews = (data) => {
    let html = '';
    let title = '';
    const uniqueLinks = new Set();

    data.forEach((element) => {
        if (!element.link || uniqueLinks.has(element.link) ||
            !element.image_url || !element.title) {
        }
        uniqueLinks.add(element.link);

        if (element.title.length < 100) {
            title = element.title;
        } else {
            title = element.title.slice(0, 100) + '...';
        }

        html += `<div class="newsCard">
                    <div class="img">
                        <img src="${element.image_url}" alt="Imagem">
                    </div>
                    <div class="text">
                        <div class="title">
                            <a href="${element.link}" target="_blank"><p>${title}</p></a>
                        </div>
                    </div>
                </div>`
    });
    politicsNews.innerHTML = html;
}
fetchData('politics', 5).then(add_politicsNews);

// Adicionando notícias de economia
const add_economyNews = (data) => {
    let html = '';
    let title = '';
    const uniqueLinks = new Set();

    data.forEach((element) => {
        if (!element.link || uniqueLinks.has(element.link) ||
            !element.image_url || !element.title) {
        }
        uniqueLinks.add(element.link);

        if (element.title.length < 100) {
            title = element.title;
        } else {
            title = element.title.slice(0, 100) + '...';
        }

        html += `<div class="newsCard">
                    <div class="img">
                        <img src="${element.image_url}" alt="Imagem">
                    </div>
                    <div class="text">
                        <div class="title">
                            <a href="${element.link}" target="_blank"><p>${title}</p></a>
                        </div>
                    </div>
                </div>`
    });
    economyNews.innerHTML = html;
}
fetchData('business', 5).then(add_economyNews);

// Adicionando notícias de esportes
const add_sportsNews = (data) => {
    let html = '';
    let title = '';
    const uniqueLinks = new Set();

    data.forEach((element) => {
        if (!element.link || uniqueLinks.has(element.link) ||
            !element.image_url || !element.title) {
        }
        uniqueLinks.add(element.link);

        if (element.title.length < 100) {
            title = element.title;
        } else {
            title = element.title.slice(0, 100) + '...';
        }

        html += `<div class="newsCard">
                    <div class="img">
                        <img src="${element.image_url}" alt="Imagem">
                    </div>
                    <div class="text">
                        <div class="title">
                            <a href="${element.link}" target="_blank"><p>${title}</p></a>
                        </div>
                    </div>
                </div>`
    });
    sportsNews.innerHTML = html;
}
fetchData('sports', 5).then(add_sportsNews);

// Adicionando notícias internacionais
const add_internationalNews = (data) => {
    let html = '';
    let title = '';
    const uniqueLinks = new Set();

    data.forEach((element) => {
        if (!element.link || uniqueLinks.has(element.link) ||
            !element.image_url || !element.title) {
        }
        uniqueLinks.add(element.link);

        if (element.title.length < 100) {
            title = element.title;
        } else {
            title = element.title.slice(0, 100) + '...';
        }

        html += `<div class="newsCard">
                    <div class="img">
                        <img src="${element.image_url}" alt="Imagem">
                    </div>
                    <div class="text">
                        <div class="title">
                            <a href="${element.link}" target="_blank"><p>${title}</p></a>
                        </div>
                    </div>
                </div>`
    });
    internationalNews.innerHTML = html;
}
fetchData('world', 5).then(add_internationalNews);

// Adicionando notícias de tecnologia
const add_techNews = (data) => {
    let html = '';
    let title = '';
    const uniqueLinks = new Set();

    data.forEach((element) => {
        if (!element.link || uniqueLinks.has(element.link) ||
            !element.image_url || !element.title) {
        }
        uniqueLinks.add(element.link);

        if (element.title.length < 100) {
            title = element.title;
        } else {
            title = element.title.slice(0, 100) + '...';
        }

        html += `<div class="newsCard">
                    <div class="img">
                        <img src="${element.image_url}" alt="Imagem">
                    </div>
                    <div class="text">
                        <div class="title">
                            <a href="${element.link}" target="_blank"><p>${title}</p></a>
                        </div>
                    </div>
                </div>`
    });
    techNews.innerHTML = html;
}
fetchData('technology', 5).then(add_techNews);