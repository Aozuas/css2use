// @ts-nocheck
if (!window.meuCssProAtivo) {
    window.meuCssProAtivo = true;
    let elementoFocado = null;
    let elementoCongelado = null;
    let isCongelado = false;

    // --- 1. CONFIGURAÇÕES GLOBAIS (CURSOR E ESTILO AO VIVO) ---
    const cursorStyle = document.createElement('style');
    cursorStyle.id = 'meu-css-pro-cursor-style';
    cursorStyle.textContent = `* { cursor: crosshair !important; }`;
    document.head.appendChild(cursorStyle);

    const liveCssStyle = document.createElement('style');
    liveCssStyle.id = 'meu-css-pro-live-style';
    document.head.appendChild(liveCssStyle);

    // --- 2. MOTOR DE EXTRAÇÃO RESPONSIVO (O CORAÇÃO DO CSS2USE!) ---
    
    // Função para gerar seletores limpos
    const gerarSeletor = (el) => {
        const tag = el.tagName.toLowerCase(); const classes = Array.from(el.classList).join('.');
        return classes !== '' ? `${tag}.${classes}` : tag;
    };

    // Lista de propriedades de design essenciais
    const propriedadesBase = [
        'display', 'position', 'content', 'width', 'height', 'margin', 'padding',
        'background-color', 'color', 'font-family', 'font-size', 'font-weight',
        'border-radius', 'box-shadow', 'opacity', 'gap', 'top', 'left', 'flex', 'align-items', 'justify-content'
    ];

    // Extrai as regras computadas de UM elemento (sem pseudoelementos por enquanto, para simplificar)
    const extrairRegraBaseElemento = (el, seletorBase) => {
        const estilos = window.getComputedStyle(el);
        let regras = '';
        propriedadesBase.forEach(prop => {
            const valor = estilos.getPropertyValue(prop);
            if (valor && valor !== 'rgba(0, 0, 0, 0)' && valor !== '0px' && valor !== 'none') regras += `  ${prop}: ${valor};\n`;
        });
        return regras ? `${seletorBase} {\n${regras}}\n` : '';
    };

    // Função auxiliar para verificar se uma media query afeta o elemento
    const mediaQueryAfetaElemento = (mediaQueryText, el) => {
        // Esta é uma simplificação. Um motor premium precisaria verificar seletores específicos.
        // Aqui, aceitamos qualquer media query que contenha larguras de tela.
        return mediaQueryText.includes('min-width') || mediaQueryText.includes('max-width');
    };

    // Função que varre a família inteira, incluindo responsividade
    const extrairFamiliaResponsivaCss = (pai) => {
        let cssCompleto = '';
        const seletorPai = gerarSeletor(pai);
        
        // 1. CSS BASE (Pai e Filhos)
        cssCompleto += `/* --- CSS BASE (Desktop) --- */\n\n`;
        cssCompleto += extrairRegraBaseElemento(pai, seletorPai);
        const descendentes = pai.querySelectorAll('*');
        const processadosBase = new Set();
        descendentes.forEach(filho => {
            const seletorFilho = `${seletorPai} ${gerarSeletor(filho)}`;
            if (!processadosBase.has(seletorFilho)) {
                processadosBase.add(seletorFilho);
                cssCompleto += extrairRegraBaseElemento(filho, seletorFilho);
            }
        });

        // 2. CSS RESPONSIVO (Media Queries)
        cssCompleto += `\n/* --- CSS RESPONSIVO (Media Queries) --- */\n\n`;
        
        // Localiza as folhas de estilo do site
        const folhasEstilo = Array.from(document.styleSheets);
        folhasEstilo.forEach(folha => {
            try {
                // Itera sobre as regras da folha
                const regrasFolha = Array.from(folha.cssRules || folha.rules);
                regrasFolha.forEach(regra => {
                    
                    // Se for uma regra de Media Query
                    if (regra.type === CSSRule.MEDIA_RULE && mediaQueryAfetaElemento(regra.media.mediaText, pai)) {
                        
                        let cssDentroMedia = '';
                        const regrasInternas = Array.from(regra.cssRules || regra.rules);
                        const processadosInternos = new Set();

                        regrasInternas.forEach(regraInterna => {
                            // Se a regra interna for um seletor de estilo
                            if (regraInterna.type === CSSRule.STYLE_RULE) {
                                
                                // Verifica se o seletor interno afeta o Pai ou seus Filhos
                                const seletorInterno = regraInterna.selectorText;
                                if (seletorInterno.includes(seletorPai) || seletorInterno.includes(gerarSeletor(pai))) {
                                    
                                    if (!processadosInternos.has(seletorInterno)) {
                                        processadosInternos.add(seletorInterno);
                                        // Extrai o estilo interno formatado
                                        // (Simplificado: pegamos o texto da regra inteira)
                                        cssDentroMedia += `  ${regraInterna.cssText}\n`;
                                    }
                                }
                            }
                        });

                        // Se encontramos regras pertinentes dentro dessa Media Query, nós a adicionamos
                        if (cssDentroMedia) {
                            cssCompleto += `@media ${regra.media.mediaText} {\n${cssDentroMedia}}\n\n`;
                        }
                    }
                });
            } catch (err) {
                // Algumas folhas de estilo podem estar bloqueadas por segurança
            }
        });

        return cssCompleto;
    };

    // --- 3. SHADOW DOM E DESIGN REFINADO ---
    const hostElement = document.createElement('div');
    hostElement.id = 'meu-css-pro-host';
    hostElement.style.position = 'fixed';
    hostElement.style.top = '20px'; hostElement.style.right = '20px';
    hostElement.style.zIndex = '2147483647';
    document.body.appendChild(hostElement);

    const shadowRoot = hostElement.attachShadow({ mode: 'open' });

    const styleUI = document.createElement('style');
    styleUI.textContent = `
        :host { --bg: #1e1e2e; --bg-alt: #2a2a3c; --accent: #00E5FF; --accent-hover: #00b3cc; --text: #cdd6f4; --border: #45475a; }
        .painel { background: var(--bg); color: var(--text); width: 420px; border-radius: 10px; box-shadow: 0 15px 35px rgba(0,0,0,0.6); font-family: 'Segoe UI', system-ui, sans-serif; border: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
        .header { background: var(--bg-alt); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); cursor: grab; user-select: none; }
        .header:active { cursor: grabbing; }
        .titulo { font-weight: 600; font-size: 14px; color: #fff; display: flex; align-items: center; gap: 8px; pointer-events: none; }
        .drag-handle { color: #6c7086; font-size: 16px; margin-right: 4px; }
        .close-btn { cursor: pointer; font-size: 18px; color: #a6adc8; transition: 0.2s; padding: 0 4px; }
        .close-btn:hover { color: #f38ba8; }
        
        .tabs { display: flex; background: var(--bg-alt); border-bottom: 1px solid var(--border); }
        .tab-btn { flex: 1; padding: 10px 5px; background: transparent; border: none; color: #a6adc8; cursor: pointer; font-size: 12px; font-weight: 600; border-bottom: 2px solid transparent; transition: 0.2s; }
        .tab-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .tab-btn.active { color: var(--accent); border-bottom: 2px solid var(--accent); }
        
        .content { padding: 16px; }
        .tab-content { display: none; height: 200px; background: #11111b; border-radius: 6px; border: 1px solid var(--border); margin-bottom: 15px; overflow: hidden; }
        .tab-content.active { display: block; }
        
        .editor-codigo { width: 100%; height: 100%; box-sizing: border-box; background: transparent; color: #a6e3a1; font-family: 'Fira Code', monospace; font-size: 12px; border: none; padding: 12px; resize: none; outline: none; line-height: 1.5; scrollbar-width: thin; scrollbar-color: var(--border) transparent; white-space: pre; }
        #editor-css { color: #89b4fa; }
        .editor-codigo:disabled { color: #6c7086; cursor: not-allowed; }
        .editor-codigo:focus { box-shadow: inset 0 0 0 1px var(--accent); }
        
        #tab-tree { padding: 12px; overflow-y: auto; font-family: 'Fira Code', monospace; font-size: 11px; }
        .tree-node { padding: 3px 0; color: #a6adc8; white-space: nowrap; }
        .tree-node.target { color: var(--accent); font-weight: bold; background: rgba(0, 229, 255, 0.1); border-radius: 4px; padding: 3px 6px; margin-left: -6px; border-left: 2px solid var(--accent); }
        .tree-tag { color: #f38ba8; } .tree-class { color: #89b4fa; } .tree-id { color: #f9e2af; }
        
        .status { font-size: 12px; color: #bac2de; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        .status-badge { background: #313244; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
        .status-badge.frozen { background: #f38ba8; color: #11111b; }
        
        .btn-group { display: flex; gap: 10px; opacity: 0.5; pointer-events: none; transition: 0.2s; }
        .btn-group.active { opacity: 1; pointer-events: auto; }
        button.acao { flex: 1; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.2s; display: flex; justify-content: center; align-items: center; gap: 6px; }
        .btn-copiar { background: var(--border); color: #fff; }
        .btn-copiar:hover { background: #585b70; }
        .btn-codepen { background: var(--accent); color: #000; }
        .btn-codepen:hover { background: var(--accent-hover); }
    `;

    const painelHTML = document.createElement('div');
    painelHTML.innerHTML = `
        <div class="painel">
            <div class="header" id="drag-header">
                <div class="titulo"><span class="drag-handle">⋮⋮</span>CSS2USE</div>
                <div class="close-btn" id="btn-fechar">×</div>
            </div>
            <div class="tabs">
                <button class="tab-btn active" data-target="wrap-html">HTML</button>
                <button class="tab-btn" data-target="wrap-css">CSS</button>
                <button class="tab-btn" data-target="tab-tree">Árvore DOM</button>
            </div>
            <div class="content">
                <div class="status">
                    <span id="status-texto">Procurando elementos...</span>
                    <span class="status-badge" id="status-badge">LIVE</span>
                </div>
                <div class="tab-content active" id="wrap-html">
                    <textarea class="editor-codigo" id="editor-html" disabled spellcheck="false" placeholder="HTML do elemento..."></textarea>
                </div>
                <div class="tab-content" id="wrap-css">
                    <textarea class="editor-codigo" id="editor-css" disabled spellcheck="false" placeholder="CSS Responsivo..."></textarea>
                </div>
                <div class="tab-content" id="tab-tree">Estrutura não carregada</div>
                <div class="btn-group" id="botoes-acao">
                    <button class="acao btn-copiar" id="btn-copiar">📋 Copiar Tudo</button>
                    <button class="acao btn-codepen" id="btn-codepen">🚀 CodePen</button>
                </div>
            </div>
        </div>
    `;

    shadowRoot.appendChild(styleUI);
    shadowRoot.appendChild(painelHTML);

    // --- LÓGICA DE ARRASTAR ---
    const header = shadowRoot.getElementById('drag-header');
    let isDragging = false; let startX, startY, initialLeft, initialTop;
    header.addEventListener('mousedown', (e) => {
        if (e.target.id === 'btn-fechar') return;
        isDragging = true; startX = e.clientX; startY = e.clientY;
        const rect = hostElement.getBoundingClientRect();
        initialLeft = rect.left; initialTop = rect.top;
        hostElement.style.right = 'auto'; hostElement.style.bottom = 'auto';
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        hostElement.style.left = `${initialLeft + (e.clientX - startX)}px`;
        hostElement.style.top = `${initialTop + (e.clientY - startY)}px`;
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    // --- SISTEMA DE ABAS ---
    const tabBtns = shadowRoot.querySelectorAll('.tab-btn');
    const tabContents = shadowRoot.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            shadowRoot.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // --- OVERLAY E REFERÊNCIAS ---
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed'; overlay.style.zIndex = '2147483646';
    overlay.style.pointerEvents = 'none'; overlay.style.border = '2px dashed #00E5FF';
    overlay.style.backgroundColor = 'rgba(0, 229, 255, 0.1)';
    overlay.style.transition = 'all 0.1s ease-out'; overlay.style.display = 'none';
    document.body.appendChild(overlay);

    const uiHtmlEditor = shadowRoot.getElementById('editor-html');
    const uiCssEditor = shadowRoot.getElementById('editor-css');
    const uiTree = shadowRoot.getElementById('tab-tree');
    const uiStatus = shadowRoot.getElementById('status-texto');
    const uiBadge = shadowRoot.getElementById('status-badge');
    const uiBotoes = shadowRoot.getElementById('botoes-acao');

    const desligarInspetor = () => {
        document.removeEventListener('mouseover', aoPassarMouse);
        document.removeEventListener('click', aoClicar, true);
        document.removeEventListener('keydown', aoPressionarTecla);
        overlay.remove(); hostElement.remove();
        const styleCrosshair = document.getElementById('meu-css-pro-cursor-style');
        if (styleCrosshair) styleCrosshair.remove();
        const liveStyle = document.getElementById('meu-css-pro-live-style');
        if (liveStyle) liveStyle.remove();
        window.meuCssProAtivo = false;
    };

    const gerarArvoreDOM = (elemento) => {
        let caminho = []; let atual = elemento;
        while (atual && atual.tagName !== 'HTML') { caminho.unshift(atual); atual = atual.parentElement; }
        let htmlArvore = ''; let espacamento = 0;
        caminho.forEach((el) => {
            const isTarget = el === elemento;
            const tag = `<span class="tree-tag">${el.tagName.toLowerCase()}</span>`;
            const id = el.id ? `<span class="tree-id">#${el.id}</span>` : '';
            const classes = Array.from(el.classList).length > 0 ? `<span class="tree-class">.${Array.from(el.classList).join('.')}</span>` : '';
            htmlArvore += `<div class="tree-node ${isTarget ? 'target' : ''}" style="margin-left: ${espacamento}px;">${isTarget ? '👉' : '↳'} ${tag}${id}${classes}</div>`;
            espacamento += 12;
        });
        return htmlArvore;
    };

    const formatarHTML = (htmlCru) => {
        let nivelIndentacao = 0; const espacos = '  ';
        const htmlLimpo = htmlCru.replace(/\n/g, '').replace(/>\s*</g, '><');
        return htmlLimpo.replace(/<[^>]+>/g, (tag) => {
            const ehTagFechamento = tag.match(/^<\//);
            const ehTagAutoFechamento = tag.match(/\/>$/) || tag.match(/^<(img|br|hr|input|meta|link)/i);
            if (ehTagFechamento) Math.max(0, nivelIndentacao--);
            const tagFormatada = '\n' + espacos.repeat(nivelIndentacao) + tag;
            if (!ehTagAutoFechamento && !ehTagAutoFechamento) nivelIndentacao++;
            return tagFormatada;
        }).trim();
    };

    // --- EDIÇÃO DE CÓDIGO (HTML) ---
    uiHtmlEditor.addEventListener('input', (e) => {
        if (!isCongelado || !elementoCongelado) return;
        try {
            const range = document.createRange();
            range.selectNode(elementoCongelado);
            const documentFragment = range.createContextualFragment(e.target.value);
            if (documentFragment.children.length === 1) {
                const novoElemento = documentFragment.firstElementChild;
                elementoCongelado.replaceWith(novoElemento);
                elementoCongelado = novoElemento;
                const medidas = elementoCongelado.getBoundingClientRect();
                overlay.style.top = medidas.top + 'px'; overlay.style.left = medidas.left + 'px';
                overlay.style.width = medidas.width + 'px'; overlay.style.height = medidas.height + 'px';
            }
        } catch (err) {}
    });

    // --- EDIÇÃO DE CSS (liveStyle ainda ativo para regras base) ---
    uiCssEditor.addEventListener('input', (e) => {
        if (!isCongelado) return;
        liveCssStyle.textContent = e.target.value;
    });

    // --- LÓGICA DO INSPETOR RESPONSIVO ---
    const aoPassarMouse = function(e) {
        if (isCongelado || e.composedPath().includes(hostElement)) return;
        elementoFocado = e.target;
        
        const medidas = elementoFocado.getBoundingClientRect();
        overlay.style.top = medidas.top + 'px'; overlay.style.left = medidas.left + 'px';
        overlay.style.width = medidas.width + 'px'; overlay.style.height = medidas.height + 'px';
        overlay.style.display = 'block'; 

        // Preenche o HTML
        uiHtmlEditor.value = formatarHTML(elementoFocado.outerHTML);
        
        // MÁGICA: Preenche o CSS com regras base E Media Queries pertences à família!
        uiCssEditor.value = extrairFamiliaResponsivaCss(elementoFocado);
        
        uiTree.innerHTML = gerarArvoreDOM(elementoFocado);
    };

    const aoClicar = function(e) {
        if (e.composedPath().includes(hostElement)) return;
        e.preventDefault(); e.stopPropagation();

        if (!isCongelado && elementoFocado) {
            isCongelado = true;
            elementoCongelado = elementoFocado;
            overlay.style.border = '2px solid #f38ba8';
            overlay.style.backgroundColor = 'rgba(243, 139, 168, 0.1)';
            uiStatus.innerHTML = '❄️ <span style="color:var(--accent);">Código liberado para edição!</span>';
            uiBadge.textContent = 'FROZEN'; uiBadge.classList.add('frozen');
            uiBotoes.classList.add('active');
            uiHtmlEditor.disabled = false;
            uiCssEditor.disabled = false;
        } else if (isCongelado) {
            isCongelado = false;
            elementoCongelado = null;
            overlay.style.border = '2px dashed #00E5FF';
            overlay.style.backgroundColor = 'rgba(0, 229, 255, 0.1)';
            uiStatus.textContent = 'Procurando elementos...';
            uiBadge.textContent = 'LIVE'; uiBadge.classList.remove('frozen');
            uiBotoes.classList.remove('active');
            uiHtmlEditor.disabled = true;
            uiCssEditor.disabled = true;
            liveCssStyle.textContent = '';
            aoPassarMouse(e);
        }
    };

    const aoPressionarTecla = function(e) { if (e.key === "Escape") desligarInspetor(); };
    document.addEventListener('mouseover', aoPassarMouse);
    document.addEventListener('click', aoClicar, true);
    document.addEventListener('keydown', aoPressionarTecla);

    // --- EXPORTAÇÃO (LÊ DOS EDITORES) ---
    shadowRoot.getElementById('btn-fechar').addEventListener('click', desligarInspetor);

    const processarExportacao = () => {
        return { html: uiHtmlEditor.value, css: uiCssEditor.value };
    };

    shadowRoot.getElementById('btn-copiar').addEventListener('click', () => {
        const dados = processarExportacao();
        navigator.clipboard.writeText(`/* CSS RESPONSIVO EXTRAÍDO COM CSS2USE */\n${dados.css}\n\n${dados.html}`).then(() => {
            const btn = shadowRoot.getElementById('btn-copiar');
            btn.textContent = "✅ Copiado!"; setTimeout(() => btn.textContent = "📋 Copiar Tudo", 2000);
        });
    });

    shadowRoot.getElementById('btn-codepen').addEventListener('click', () => {
        const dados = processarExportacao();
        const form = document.createElement('form');
        form.action = 'https://codepen.io/pen/define'; form.method = 'POST'; form.target = '_blank';
        const input = document.createElement('input'); input.type = 'hidden'; input.name = 'data';
        input.value = JSON.stringify({ title: "Extraído Responsivo com CSS2USE", html: dados.html, css: dados.css });
        form.appendChild(input); document.body.appendChild(form);
        form.submit(); form.remove(); desligarInspetor();
    });
}