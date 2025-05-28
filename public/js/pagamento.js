// Variáveis globais
let pixAtual = null;
let intervalVerificacao = null;

// Elementos do DOM
const modal = document.getElementById('modalPagamento');
const btnFecharModal = document.querySelector('.close');
const etapaDados = document.getElementById('etapa-dados');
const etapaPix = document.getElementById('etapa-pix');
const etapaConfirmacao = document.getElementById('etapa-confirmacao');

// Elementos do formulário
const formDadosCliente = document.getElementById('formDadosCliente');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputTelefone = document.getElementById('telefone');
const inputCpf = document.getElementById('cpf');

// Elementos do PIX
const produtoImagem = document.getElementById('produto-imagem');
const produtoNome = document.getElementById('produto-nome');
const produtoPreco = document.getElementById('produto-preco');
const qrCodeImg = document.getElementById('qr-code');
const pixCode = document.getElementById('pix-code');
const pixValor = document.getElementById('pix-valor');
const pixStatus = document.getElementById('pix-status');
const loadingStatus = document.getElementById('loading-status');

// Botões
const btnCopiar = document.getElementById('btn-copiar');
const btnVerificar = document.getElementById('btn-verificar');
const btnSimular = document.getElementById('btn-simular');
const btnNovoPagamento = document.getElementById('btn-novo-pagamento');
const btnFechar = document.getElementById('btn-fechar');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Botões de comprar
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', abrirModalPagamento);
    });

    // Fechar modal
    btnFecharModal.addEventListener('click', fecharModal);
    btnFechar.addEventListener('click', fecharModal);
    
    // Clique fora do modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            fecharModal();
        }
    });

    // Formulário de dados
    formDadosCliente.addEventListener('submit', processarDadosCliente);

    // Botões do PIX
    btnCopiar.addEventListener('click', copiarCodigoPix);
    btnVerificar.addEventListener('click', verificarStatusPagamento);
    btnSimular.addEventListener('click', simularPagamento);
    btnNovoPagamento.addEventListener('click', voltarParaDados);

    // Máscaras de input
    aplicarMascaras();
});

// Função para aplicar máscaras nos inputs
function aplicarMascaras() {
    // Máscara para telefone
    inputTelefone.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            if (value.length < 14) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
        }
        e.target.value = value;
    });

    // Máscara para CPF
    inputCpf.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        e.target.value = value;
    });
}

// Função para abrir o modal de pagamento
function abrirModalPagamento(event) {
    const btn = event.target;
    const produtoData = {
        nome: btn.dataset.produtoNome,
        preco: parseFloat(btn.dataset.produtoPreco),
        imagem: btn.dataset.produtoImagem
    };

    // Preencher informações do produto
    produtoImagem.src = produtoData.imagem;
    produtoNome.textContent = produtoData.nome;
    produtoPreco.textContent = `R$ ${produtoData.preco.toFixed(2)}`;

    // Mostrar modal e etapa inicial
    mostrarEtapa('dados');
    modal.style.display = 'block';
    
    // Limpar formulário
    formDadosCliente.reset();
}

// Função para fechar o modal
function fecharModal() {
    modal.style.display = 'none';
    limparDados();
    
    // Parar verificação automática se estiver rodando
    if (intervalVerificacao) {
        clearInterval(intervalVerificacao);
        intervalVerificacao = null;
    }
}

// Função para mostrar uma etapa específica
function mostrarEtapa(etapa) {
    // Esconder todas as etapas
    etapaDados.style.display = 'none';
    etapaPix.style.display = 'none';
    etapaConfirmacao.style.display = 'none';

    // Mostrar etapa específica
    switch(etapa) {
        case 'dados':
            etapaDados.style.display = 'block';
            break;
        case 'pix':
            etapaPix.style.display = 'block';
            break;
        case 'confirmacao':
            etapaConfirmacao.style.display = 'block';
            break;
    }
}

// Função para processar dados do cliente e criar PIX
async function processarDadosCliente(event) {
    event.preventDefault();

    const dadosCliente = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        telefone: inputTelefone.value.trim(),
        cpf: inputCpf.value.trim()
    };

    const dadosProduto = {
        nome: produtoNome.textContent,
        preco: parseFloat(produtoPreco.textContent.replace('R$ ', '').replace(',', '.'))
    };

    // Validações básicas
    if (!validarDados(dadosCliente)) {
        return;
    }

    try {
        // Mostrar loading
        const btnSubmit = formDadosCliente.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Gerando PIX...';
        btnSubmit.disabled = true;

        // Fazer requisição para criar PIX
        const response = await fetch('/pagamento/criar-pix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliente: dadosCliente,
                produto: dadosProduto
            })
        });

        const result = await response.json();

        if (result.success) {
            pixAtual = result.data;
            mostrarPixGerado(result.data);
            mostrarEtapa('pix');
            iniciarVerificacaoAutomatica();
        } else {
            alert('Erro ao gerar PIX: ' + (result.error || 'Erro desconhecido'));
        }

    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
        // Restaurar botão
        const btnSubmit = formDadosCliente.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Gerar PIX';
        btnSubmit.disabled = false;
    }
}

// Função para validar dados do cliente
function validarDados(dados) {
    if (!dados.nome || dados.nome.length < 3) {
        alert('Nome deve ter pelo menos 3 caracteres');
        return false;
    }

    if (!dados.email || !dados.email.includes('@')) {
        alert('E-mail inválido');
        return false;
    }

    if (!dados.telefone || dados.telefone.replace(/\D/g, '').length < 10) {
        alert('Telefone inválido');
        return false;
    }

    if (!dados.cpf || dados.cpf.replace(/\D/g, '').length !== 11) {
        alert('CPF inválido');
        return false;
    }

    return true;
}

// Função para mostrar PIX gerado
function mostrarPixGerado(dadosPix) {
    qrCodeImg.src = `data:image/png;base64,${dadosPix.qrCodeBase64}`;
    pixCode.value = dadosPix.qrCode;
    pixValor.textContent = `R$ ${(dadosPix.amount / 100).toFixed(2)}`;
    pixStatus.textContent = 'Aguardando pagamento';
    
    // Mostrar botão de simular temporariamente em todos os ambientes
    btnSimular.style.display = 'inline-block';
    console.log('🧪 Botão de simular habilitado para teste');
}

// Função para copiar código PIX
function copiarCodigoPix() {
    pixCode.select();
    pixCode.setSelectionRange(0, 99999); // Para dispositivos móveis
    
    try {
        document.execCommand('copy');
        
        // Feedback visual
        const textoOriginal = btnCopiar.textContent;
        btnCopiar.textContent = 'Copiado!';
        btnCopiar.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            btnCopiar.textContent = textoOriginal;
            btnCopiar.style.backgroundColor = '';
        }, 2000);
        
    } catch (err) {
        console.error('Erro ao copiar:', err);
        alert('Erro ao copiar código PIX');
    }
}

// Função para verificar status do pagamento
async function verificarStatusPagamento() {
    if (!pixAtual || !pixAtual.pixId) {
        alert('Nenhum PIX ativo para verificar');
        return;
    }

    try {
        loadingStatus.style.display = 'block';
        
        const response = await fetch(`/pagamento/status/${pixAtual.pixId}`);
        const result = await response.json();

        if (result.success) {
            const status = result.data.status;
            pixStatus.textContent = traduzirStatus(status);
            
            if (status === 'PAID' || status === 'paid') {
                // Pagamento confirmado
                mostrarEtapa('confirmacao');
                pararVerificacaoAutomatica();
            }
        } else {
            console.error('Erro ao verificar status:', result.error);
        }

    } catch (error) {
        console.error('Erro ao verificar status:', error);
    } finally {
        loadingStatus.style.display = 'none';
    }
}

// Função para simular pagamento (apenas para testes)
async function simularPagamento() {
    if (!pixAtual || !pixAtual.pixId) {
        alert('Nenhum PIX ativo para simular');
        return;
    }

    try {
        const response = await fetch(`/pagamento/simular/${pixAtual.pixId}`, {
            method: 'POST'
        });
        
        const result = await response.json();

        if (result.success) {
            alert('Pagamento simulado com sucesso!');
            setTimeout(() => {
                verificarStatusPagamento();
            }, 1000);
        } else {
            alert('Erro ao simular pagamento: ' + (result.error || 'Erro desconhecido'));
        }

    } catch (error) {
        console.error('Erro ao simular pagamento:', error);
        alert('Erro ao simular pagamento');
    }
}

// Função para iniciar verificação automática
function iniciarVerificacaoAutomatica() {
    // TEMPORARIAMENTE DESABILITADO DEVIDO AO ERRO 403
    console.log('⚠️ Verificação automática desabilitada temporariamente');
    // Verificar a cada 5 segundos
    // intervalVerificacao = setInterval(verificarStatusPagamento, 5000);
}

// Função para parar verificação automática
function pararVerificacaoAutomatica() {
    if (intervalVerificacao) {
        clearInterval(intervalVerificacao);
        intervalVerificacao = null;
    }
}

// Função para voltar para dados
function voltarParaDados() {
    pararVerificacaoAutomatica();
    pixAtual = null;
    mostrarEtapa('dados');
}

// Função para traduzir status
function traduzirStatus(status) {
    const statusMap = {
        'PENDING': 'Aguardando pagamento',
        'pending': 'Aguardando pagamento',
        'PAID': 'Pago',
        'paid': 'Pago',
        'EXPIRED': 'Expirado',
        'expired': 'Expirado',
        'CANCELLED': 'Cancelado',
        'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || status;
}

// Função para limpar dados
function limparDados() {
    pixAtual = null;
    formDadosCliente.reset();
    
    // Limpar campos do PIX
    qrCodeImg.src = '';
    pixCode.value = '';
    pixValor.textContent = '';
    pixStatus.textContent = '';
} 