/**
 * Sistema de Toast Notifications
 * Gerencia notificações visuais modernas e responsivas
 */
class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Criar container se não existir
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo: success, error, warning, info
     * @param {number} duration - Duração em ms (0 = permanente)
     * @param {Object} options - Opções adicionais
     */
    show(message, type = 'info', duration = 4000, options = {}) {
        const toastId = this.generateId();
        const toast = this.createToast(toastId, message, type, duration, options);
        
        this.container.appendChild(toast);
        this.toasts.set(toastId, toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remover se duration > 0
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toastId);
            }, duration);
        }

        // Adicionar vibração se suportado
        if (navigator.vibrate && type === 'error') {
            navigator.vibrate([100, 50, 100]);
        } else if (navigator.vibrate && type === 'success') {
            navigator.vibrate(50);
        }

        return toastId;
    }

    createToast(id, message, type, duration, options) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.dataset.toastId = id;

        const icon = this.getIcon(type);
        const showProgress = duration > 0 && !options.hideProgress;

        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="toastManager.hide('${id}')">&times;</button>
            </div>
            ${showProgress ? '<div class="toast-progress"></div>' : ''}
        `;

        // Adicionar eventos
        toast.addEventListener('mouseenter', () => {
            if (showProgress) {
                const progress = toast.querySelector('.toast-progress');
                if (progress) {
                    progress.style.animationPlayState = 'paused';
                }
            }
        });

        toast.addEventListener('mouseleave', () => {
            if (showProgress) {
                const progress = toast.querySelector('.toast-progress');
                if (progress) {
                    progress.style.animationPlayState = 'running';
                }
            }
        });

        return toast;
    }

    hide(toastId) {
        const toast = this.toasts.get(toastId);
        if (!toast) return;

        toast.classList.remove('show');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.toasts.delete(toastId);
        }, 400);
    }

    hideAll() {
        this.toasts.forEach((toast, id) => {
            this.hide(id);
        });
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    generateId() {
        return 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Métodos de conveniência
    success(message, duration = 4000, options = {}) {
        return this.show(message, 'success', duration, options);
    }

    error(message, duration = 6000, options = {}) {
        return this.show(message, 'error', duration, options);
    }

    warning(message, duration = 5000, options = {}) {
        return this.show(message, 'warning', duration, options);
    }

    info(message, duration = 4000, options = {}) {
        return this.show(message, 'info', duration, options);
    }

    // Toast persistente (não remove automaticamente)
    persistent(message, type = 'info', options = {}) {
        return this.show(message, type, 0, options);
    }
}

// Instância global
const toastManager = new ToastManager();

/**
 * Utilitários para Loading States
 */
class LoadingManager {
    static setLoading(element, loading = true) {
        if (loading) {
            element.classList.add('btn-loading');
            element.disabled = true;
            element.dataset.originalText = element.textContent;
        } else {
            element.classList.remove('btn-loading');
            element.disabled = false;
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
        }
    }

    static showSkeleton(container, count = 3) {
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-price"></div>
                <div class="skeleton skeleton-button"></div>
            `;
            container.appendChild(skeleton);
        }
    }

    static hideSkeleton(container, content) {
        container.innerHTML = content;
        
        // Animar entrada dos elementos reais
        const elements = container.querySelectorAll('.card, .product-card');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.4s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}

/**
 * Utilitários para Animações
 */
class AnimationUtils {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    static slideUp(element, duration = 300) {
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.style.transform = `translateY(${20 * (1 - easeOut)}px)`;
            element.style.opacity = easeOut;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    static pulse(element, duration = 1000) {
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    static bounce(element, duration = 600) {
        element.style.animation = `bounce ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }
}

/**
 * Lazy Loading para Imagens
 */
class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            this.observeImages();
        } else {
            // Fallback para navegadores sem suporte
            this.loadAllImages();
        }
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Criar nova imagem para pré-carregar
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            img.src = src;
            img.classList.add('fade-in');
            img.removeAttribute('data-src');
        };

        imageLoader.onerror = () => {
            img.src = '/img/placeholder.svg'; // Imagem de fallback
            img.classList.add('fade-in');
            img.removeAttribute('data-src');
        };

        imageLoader.src = src;
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.loadImage(img);
        });
    }

    // Método para adicionar novas imagens dinamicamente
    observe(img) {
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        } else {
            this.loadImage(img);
        }
    }
}

// Inicializar lazy loading quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
});

// Exportar para uso global
window.toastManager = toastManager;
window.LoadingManager = LoadingManager;
window.AnimationUtils = AnimationUtils; 