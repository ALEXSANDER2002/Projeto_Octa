document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var navMenu = document.querySelector("nav ul");

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("show");
    });
});

window.onload = function () {
    console.log("JavaScript carregado!");

    const menuToggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu");

    if (!menuToggle || !menu) {
        console.error("Erro: Elementos do menu não encontrados.");
        return;
    }

    console.log("Botão e menu encontrados! Adicionando eventos...");

    // Função para abrir e fechar o menu
    function toggleMenu() {
        menu.classList.toggle("show");
        console.log("Menu " + (menu.classList.contains("show") ? "aberto!" : "fechado!"));
    }

    // Evento de clique no botão do menu
    menuToggle.addEventListener("click", toggleMenu);

    // Fechar o menu ao clicar em qualquer item dentro dele
    document.querySelectorAll("#menu li a").forEach(item => {
        item.addEventListener("click", function () {
            menu.classList.remove("show");
            console.log("Menu fechado após clique em um item!");
        });
    });

    // Fechar o menu ao clicar fora dele
    document.addEventListener("click", function (event) {
        if (!menu.contains(event.target) && event.target !== menuToggle) {
            menu.classList.remove("show");
            console.log("Menu fechado ao clicar fora!");
        }
    });
};

