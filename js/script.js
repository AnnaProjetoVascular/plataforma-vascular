// script.js - Plataforma de Anatomia Vascular

// Dados dos termos anatômicos para autocomplete (carregados do JSON)
let anatomicalTerms = [];

// Estado da aplicação
let currentPage = '';
let searchVisible = false;

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
    loadAnatomicalTerms();
    initializeApp();
});

// Carregar termos anatômicos do arquivo JSON
async function loadAnatomicalTerms() {
    try {
        const response = await fetch('js/anatomical-terms.json');
        const data = await response.json();
        anatomicalTerms = data.terms;
    } catch (error) {
        console.error('Erro ao carregar termos anatômicos:', error);
        // Fallback para termos básicos
        anatomicalTerms = [
            { name: "Aorta", category: "arterial", description: "A maior artéria do corpo", page: "arterial.html" },
            { name: "Coração", category: "coracao", description: "Órgão central do sistema circulatório", page: "coracao.html" }
        ];
    }
}

// Função principal de inicialização
function initializeApp() {
    currentPage = getCurrentPage();
    setupEventListeners();
    setupSearchBar();
    setupModals();
    
    // Inicializar funcionalidades específicas da página
    switch(currentPage) {
        case 'index':
            setupHomePage();
            break;
        case 'selecionar-sistema':
            setupSystemSelection();
            break;
        case 'content':
            setupContentPage();
            break;
    }
}

// Determinar a página atual
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('selecionar-sistema')) return 'selecionar-sistema';
    if (path.includes('coracao') || path.includes('arterial') || 
        path.includes('venoso') || path.includes('linfatico') || 
        path.includes('microvascular') || path.includes('outros')) return 'content';
    return 'index';
}

// Configurar event listeners globais
function setupEventListeners() {
    // Tecla de atalho para busca (Ctrl+K)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            toggleSearch();
        }
        
        // Fechar modal com ESC
        if (e.key === 'Escape') {
            closeModal();
            if (searchVisible) toggleSearch();
        }
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Configurar página inicial
function setupHomePage() {
    const startButton = document.getElementById("startButton");
    if (startButton) {
        startButton.addEventListener("click", () => {
            navigateToPage("pages/selecionar-sistema.html");
        });
    }
}

// Configurar seleção de sistemas
function setupSystemSelection() {
    const systemCards = document.querySelectorAll('.system-card');
    systemCards.forEach(card => {
        card.addEventListener('click', () => {
            const system = card.dataset.system;
            navigateToPage(`${system}.html`);
        });
        
        // Adicionar efeito de hover com teclado
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// Configurar páginas de conteúdo
function setupContentPage() {
    setupCopyButton();
    setupReportButton();
    setupImportButton();
    setupInteractiveElements();
}

// Configurar botão de copiar texto
function setupCopyButton() {
    const copyBtn = document.getElementById('copyTextBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textContent = document.querySelector('.content-text p').textContent;
            copyToClipboard(textContent);
            showNotification('Texto copiado para a área de transferência!');
        });
    }
}

// Configurar botão de relatório
function setupReportButton() {
    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            showModal('Relatório de Inconsistências', generateInconsistencyReport());
        });
    }
}

// Configurar botão de importar
function setupImportButton() {
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            showFileImportDialog();
        });
    }
}

// Configurar elementos interativos
function setupInteractiveElements() {
    // Placeholder para modelos 3D interativos
    const modelPlaceholders = document.querySelectorAll('.model-placeholder');
    modelPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', () => {
            showModal('Modelo 3D Interativo', 
                '<p>Aqui seria exibido um modelo 3D interativo do sistema vascular.</p>' +
                '<p>Funcionalidades incluiriam:</p>' +
                '<ul>' +
                '<li>Rotação em 360°</li>' +
                '<li>Zoom e pan</li>' +
                '<li>Hotspots clicáveis</li>' +
                '<li>Informações detalhadas</li>' +
                '</ul>'
            );
        });
    });
    
    // Placeholder para fluxogramas
    const flowcharts = document.querySelectorAll('.flowchart');
    flowcharts.forEach(flowchart => {
        flowchart.addEventListener('click', () => {
            showModal('Fluxograma Interativo',
                '<p>Aqui seria exibido um fluxograma interativo do fluxo sanguíneo.</p>' +
                '<p>Funcionalidades incluiriam:</p>' +
                '<ul>' +
                '<li>Arrastar e soltar nós</li>' +
                '<li>Conectar elementos</li>' +
                '<li>Animação do fluxo</li>' +
                '<li>Simulação em tempo real</li>' +
                '</ul>'
            );
        });
    });
}

// Configurar barra de busca
function setupSearchBar() {
    // Criar barra de busca se não existir
    if (!document.querySelector('.search-bar')) {
        createSearchBar();
    }
    
    const searchInput = document.querySelector('.search-input');
    const suggestions = document.querySelector('.search-suggestions');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                showSuggestions(query);
            } else {
                hideSuggestions();
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggleSearch();
            }
        });
    }
}

// Criar barra de busca
function createSearchBar() {
    const searchBar = document.createElement('div');
    searchBar.className = 'search-bar';
    searchBar.innerHTML = `
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Buscar termos anatômicos... (Ctrl+K)">
            <div class="search-suggestions"></div>
        </div>
    `;
    document.body.appendChild(searchBar);
}

// Mostrar/ocultar busca
function toggleSearch() {
    const searchBar = document.querySelector('.search-bar');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBar) {
        searchVisible = !searchVisible;
        searchBar.style.display = searchVisible ? 'block' : 'none';
        
        if (searchVisible) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            hideSuggestions();
        }
    }
}

// Mostrar sugestões de busca
function showSuggestions(query) {
    const suggestions = document.querySelector('.search-suggestions');
    const filteredTerms = anatomicalTerms.filter(term => 
        term.name.toLowerCase().includes(query) ||
        term.description.toLowerCase().includes(query) ||
        term.category.toLowerCase().includes(query)
    ).slice(0, 8);
    
    if (filteredTerms.length > 0) {
        suggestions.innerHTML = filteredTerms.map(term => 
            `<div class="suggestion-item" onclick="selectSuggestion('${term.name}', '${term.description}', '${term.page}')">
                <strong>${term.name}</strong>
                <small>${term.description}</small>
            </div>`
        ).join('');
        suggestions.style.display = 'block';
    } else {
        hideSuggestions();
    }
}

// Ocultar sugestões
function hideSuggestions() {
    const suggestions = document.querySelector('.search-suggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

// Selecionar sugestão
function selectSuggestion(name, description, page) {
    showModal('Termo Anatômico', `
        <h3>${name}</h3>
        <p><strong>Descrição:</strong> ${description}</p>
        <div style="margin-top: 20px;">
            <button onclick="navigateToPage('${page}')" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                Ver mais detalhes
            </button>
            <button onclick="closeModal()" style="background: #607D8B; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                Fechar
            </button>
        </div>
    `);
    toggleSearch();
}

// Configurar modais
function setupModals() {
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
}

// Mostrar modal
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalBody) {
        modalBody.innerHTML = `<h2>${title}</h2>${content}`;
        modal.style.display = 'block';
        
        // Focar no modal para acessibilidade
        modal.focus();
    }
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Navegar para página
function navigateToPage(url) {
    window.location.href = url;
}

// Copiar para área de transferência
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Mostrar notificação
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Gerar relatório de inconsistências
function generateInconsistencyReport() {
    return `
        <p>Análise de inconsistências entre o material do professor e o conteúdo padrão:</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4>Status: Nenhum material importado</h4>
            <p>Para gerar um relatório de inconsistências, primeiro importe material do professor usando o botão "Importar material".</p>
        </div>
        <p><strong>O relatório incluirá:</strong></p>
        <ul>
            <li>Diferenças terminológicas</li>
            <li>Discrepâncias anatômicas</li>
            <li>Variações de nomenclatura</li>
            <li>Sugestões de harmonização</li>
        </ul>
    `;
}

// Mostrar diálogo de importação de arquivo
function showFileImportDialog() {
    const content = `
        <p>Importe material do professor para análise e comparação:</p>
        <div style="margin: 20px 0;">
            <input type="file" id="fileInput" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4" 
                   style="margin-bottom: 15px; width: 100%;">
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px;">
                <strong>Formatos aceitos:</strong>
                <ul style="margin: 10px 0;">
                    <li>PDF - Documentos e apresentações</li>
                    <li>Word - Documentos de texto</li>
                    <li>Imagens - JPG, PNG</li>
                    <li>Vídeos - MP4</li>
                </ul>
            </div>
        </div>
        <button onclick="processImportedFile()" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
            Processar Arquivo
        </button>
    `;
    
    showModal('Importar Material do Professor', content);
}

// Processar arquivo importado
function processImportedFile() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        showNotification(`Arquivo "${file.name}" processado com sucesso!`);
        closeModal();
        
        // Simular processamento
        setTimeout(() => {
            showNotification('Análise de inconsistências disponível!');
        }, 2000);
    } else {
        showNotification('Por favor, selecione um arquivo primeiro.');
    }
}

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Expor funções globais necessárias
window.selectSuggestion = selectSuggestion;
window.processImportedFile = processImportedFile;

