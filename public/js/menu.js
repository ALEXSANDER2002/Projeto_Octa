document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript carregado!");

    const sectionLinks = document.querySelectorAll('.offcanvas-body a, .menu-desktop a');
    const menuOffcanvas = document.getElementById("menuOffcanvas");
    let pendingSectionId = null; // Armazena a seção que precisa ser rolada

    sectionLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const target = this.getAttribute('href');

            if (target.startsWith('/#') || target.startsWith('#')) {
                event.preventDefault();

                const sectionId = target.replace('/#', '').replace('#', '');

                if (window.location.pathname !== '/') {
                    // Redireciona para a página inicial com a âncora completa
                    window.location.href = `${window.location.origin}/#${sectionId}`;
                } else {
                    pendingSectionId = sectionId;

                    // Fecha o menu mobile, se estiver aberto
                    const offcanvasInstance = bootstrap.Offcanvas.getInstance(menuOffcanvas);
                    if (offcanvasInstance) {
                        offcanvasInstance.hide();
                        console.log("Menu mobile fechado!");
                    } else {
                        scrollToSection(sectionId);
                    }
                }
            }
        });
    });

    // Escuta o fechamento do menu e então rola para a seção
    menuOffcanvas.addEventListener('hidden.bs.offcanvas', function () {
        if (pendingSectionId) {
            scrollToSection(pendingSectionId);
            pendingSectionId = null;
        }
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

    // Menu Mobile Melhorado
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLinks = document.querySelectorAll('.offcanvas-body nav ul li a');
    
    // Efeito de vibração (se suportado)
    function vibrate(duration = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    // Efeito de clique no botão do menu
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            vibrate(30);
            
            // Animação do ícone
            const icon = this.querySelector('i');
            icon.style.transform = 'rotate(180deg) scale(0.8)';
            
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg) scale(1)';
            }, 300);
        });
    }

    // Efeitos nos links do menu
    menuLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            vibrate(20);
            
            // Efeito de ripple
            createRippleEffect(this, e);
            
            // Fechar menu após clique (com delay para ver a animação)
            setTimeout(() => {
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(menuOffcanvas);
                if (bsOffcanvas) {
                    bsOffcanvas.hide();
                }
            }, 200);
        });

        // Efeito hover melhorado
        link.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.3) rotate(10deg)';
            }
        });

        link.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });

    // Função para criar efeito ripple
    function createRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(0, 255, 204, 0.6) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Adicionar CSS para animação ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .menu-item-active {
            background: rgba(0, 255, 204, 0.2) !important;
            border-color: #00ffcc !important;
            transform: translateX(15px) !important;
        }
    `;
    document.head.appendChild(style);

    // Destacar item ativo baseado na URL atual
    function highlightActiveMenuItem() {
        const currentPath = window.location.pathname;
        
        menuLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            
            if (linkPath === currentPath || 
                (currentPath === '/' && link.href.includes('#')) ||
                (currentPath.includes(linkPath) && linkPath !== '/')) {
                link.classList.add('menu-item-active');
            } else {
                link.classList.remove('menu-item-active');
            }
        });
    }

    // Chamar na inicialização
    highlightActiveMenuItem();

    // Efeitos quando o menu abre/fecha
    if (menuOffcanvas) {
        menuOffcanvas.addEventListener('show.bs.offcanvas', function() {
            // Adicionar classe para animações
            document.body.style.overflow = 'hidden';
            
            // Reset e preparar itens do menu para animação
            const items = this.querySelectorAll('.offcanvas-body nav ul li');
            items.forEach((item, index) => {
                // Reset da animação
                item.style.animation = 'none';
                item.style.opacity = '0';
                item.style.transform = 'translateX(-30px)';
                
                // Força o reflow
                item.offsetHeight;
                
                // Aplica a animação com delay
                setTimeout(() => {
                    item.style.animation = `slideInLeft 0.5s ease forwards`;
                    item.style.animationDelay = `${0.1 + (index * 0.1)}s`;
                }, 50);
            });
        });

        menuOffcanvas.addEventListener('hide.bs.offcanvas', function() {
            document.body.style.overflow = '';
        });

        menuOffcanvas.addEventListener('hidden.bs.offcanvas', function() {
            // Reset completo das animações
            const items = this.querySelectorAll('.offcanvas-body nav ul li');
            items.forEach(item => {
                item.style.animation = '';
                item.style.animationDelay = '';
                item.style.opacity = '';
                item.style.transform = '';
            });
        });
    }

    // Smooth scroll para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efeito parallax no botão do menu (opcional)
    let ticking = false;
    
    function updateMenuButton() {
        if (menuToggle) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            menuToggle.style.transform = `translateY(${rate}px)`;
        }
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateMenuButton);
            ticking = true;
        }
    }

    // Ativar parallax apenas em telas maiores
    if (window.innerWidth > 768) {
        window.addEventListener('scroll', requestTick);
    }
});
