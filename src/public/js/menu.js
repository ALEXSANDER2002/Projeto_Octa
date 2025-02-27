document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript carregado!");

    const sectionLinks = document.querySelectorAll('.offcanvas-body a, .menu-desktop a');

    sectionLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const target = this.getAttribute('href');

            if (target.startsWith('/#')) {
                event.preventDefault();

                const sectionId = target.replace('/#', '');

                if (window.location.pathname !== '/') {
                    // Redireciona para a página inicial com a âncora completa
                    window.location.href = `${window.location.origin}/#${sectionId}`;
                } else {
                    // Se já estiver na página inicial, rola direto para a seção
                    scrollToSection(sectionId);
                }

                // Fecha o menu mobile, se estiver aberto
                const menuOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById("menuOffcanvas"));
                if (menuOffcanvas) {
                    menuOffcanvas.hide();
                    console.log("Menu mobile fechado!");
                }
            }
        });
    });

    // Verifica se há âncora na URL ao carregar a página
    if (window.location.hash) {
        const sectionId = window.location.hash.replace('#', '');
        setTimeout(() => {
            scrollToSection(sectionId);
        }, 200); // Pequeno delay para garantir que a página carregue
    }

    // Função para rolar suavemente até a seção
    function scrollToSection(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log("Rolou para a seção:", sectionId);
        } else {
            console.warn("Seção não encontrada:", sectionId);
        }
    }
});
