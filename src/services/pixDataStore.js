/**
 * Armazenamento temporário de dados de PIX e clientes
 * Adaptado para ambiente serverless (Vercel)
 */
class PixDataStore {
    constructor() {
        // Armazenamento em memória (temporário)
        this.pixData = new Map();
        
        // Para ambiente serverless, não usar setInterval
        if (process.env.NODE_ENV !== 'production') {
            // Limpeza automática apenas em desenvolvimento
            this.cleanupInterval = setInterval(() => {
                this.cleanup();
            }, 60 * 60 * 1000); // 1 hora
        }
    }

    /**
     * Armazena dados do PIX e cliente
     * @param {string} pixId - ID do PIX
     * @param {Object} data - Dados para armazenar
     */
    store(pixId, data) {
        // Fazer limpeza antes de armazenar (para serverless)
        if (process.env.NODE_ENV === 'production') {
            this.cleanup();
        }
        
        this.pixData.set(pixId, {
            ...data,
            createdAt: new Date().toISOString()
        });
        
        console.log(`💾 Dados armazenados para PIX ${pixId}:`, data.customer.name);
    }

    /**
     * Recupera dados do PIX
     * @param {string} pixId - ID do PIX
     * @returns {Object|null} - Dados armazenados ou null
     */
    get(pixId) {
        // Fazer limpeza antes de recuperar (para serverless)
        if (process.env.NODE_ENV === 'production') {
            this.cleanup();
        }
        
        const data = this.pixData.get(pixId);
        if (data) {
            console.log(`📋 Dados recuperados para PIX ${pixId}:`, data.customer.name);
        } else {
            console.log(`❌ Dados não encontrados para PIX ${pixId}`);
        }
        return data;
    }

    /**
     * Remove dados do PIX (limpeza)
     * @param {string} pixId - ID do PIX
     */
    remove(pixId) {
        const removed = this.pixData.delete(pixId);
        if (removed) {
            console.log(`🗑️ Dados removidos para PIX ${pixId}`);
        }
        return removed;
    }

    /**
     * Lista todos os PIX armazenados
     * @returns {Array} - Lista de PIX IDs
     */
    listAll() {
        return Array.from(this.pixData.keys());
    }

    /**
     * Limpa dados antigos (mais de 2 horas)
     */
    cleanup() {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        let cleaned = 0;

        for (const [pixId, data] of this.pixData.entries()) {
            if (new Date(data.createdAt) < twoHoursAgo) {
                this.pixData.delete(pixId);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Limpeza automática: ${cleaned} registros removidos`);
        }

        return cleaned;
    }

    /**
     * Limpa o interval quando necessário (para desenvolvimento)
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

// Instância singleton
const pixDataStore = new PixDataStore();

module.exports = pixDataStore; 