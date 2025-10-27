let breakingImg = document.querySelector("#breakingImg");
let breakingNews_title = document.querySelector("#breakingNews .title");
let breakingNews_desc = document.querySelector("#breakingNews .description");



const apiKey = "pub_f98d6b9928a344c2ae99cdccb48920d5";

const fetchData = async (category) => {
    const url = category
        ? `https://newsdata.io/api/1/news?country=br&size=5&category=${category}&apikey=${apiKey}`
        : `https://newsdata.io/api/1/news?country=br&size=5&apikey=${apiKey}`;
    const data = await fetch(url);
    const response = await data.json();

    console.log(response);
    return response.results;
}
fetchData('');

// Adicionando últimas notícias

const add_breaking_news = (data) => {
    breakingImg.innerHTML = `<img src="${data[0].image_url}" alt="Imagem">`;
    breakingNews_title.innerHTML = `<a href="${data[0].link}" target="_blank"><h2>${data[0].title}</h2></a>`;
    breakingNews_desc.innerHTML = `${data[0].description}`;
}
fetchData().then(add_breaking_news);

// Adicionando notícias de ecnonomia