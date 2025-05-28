document.addEventListener("DOMContentLoaded", function () {
    var myCarousel = new bootstrap.Carousel(document.querySelector("#carouselExampleIndicators"), {
        interval: 5000, // Troca de imagem a cada 5 segundos
        ride: "carousel",
        pause: "hover",
        wrap: true
    });

    console.log("Carrossel Bootstrap ativado!");
});
