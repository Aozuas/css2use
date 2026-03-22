// @ts-nocheck
export function initInspector(
  onStateChange: (state: any) => void
) {
  if (window.meuCssProAtivo) return () => {};
  window.meuCssProAtivo = true;

  let elementoFocado = null;
  let elementoCongelado = null;
  let isCongelado = false;

  const cursorStyle = document.createElement('style');
  cursorStyle.id = 'meu-css-pro-cursor-style';
  cursorStyle.textContent = `* { cursor: crosshair !important; }`;
  document.head.appendChild(cursorStyle);

  const liveCssStyle = document.createElement('style');
  liveCssStyle.id = 'meu-css-pro-live-style';
  document.head.appendChild(liveCssStyle);

  const gerarSeletor = (el) => {
    if (!el || !el.tagName) return '';
    const tag = el.tagName.toLowerCase(); 
    const classes = Array.from(el.classList).join('.');
    return classes !== '' ? `${tag}.${classes}` : tag;
  };

  const propriedadesBase = [
    'display', 'position', 'content', 'width', 'height', 'margin', 'padding',
    'background-color', 'color', 'font-family', 'font-size', 'font-weight',
    'border-radius', 'box-shadow', 'opacity', 'gap', 'top', 'left', 'flex', 'align-items', 'justify-content'
  ];

  const extrairRegraBaseElemento = (el, seletorBase) => {
    if(!el) return '';
    const estilos = window.getComputedStyle(el);
    let regras = '';
    propriedadesBase.forEach(prop => {
        const valor = estilos.getPropertyValue(prop);
        if (valor && valor !== 'rgba(0, 0, 0, 0)' && valor !== '0px' && valor !== 'none') regras += `  ${prop}: ${valor};\n`;
    });
    return regras ? `${seletorBase} {\n${regras}}\n` : '';
  };

  const mediaQueryAfetaElemento = (mediaQueryText, el) => {
    return mediaQueryText.includes('min-width') || mediaQueryText.includes('max-width');
  };

  const extrairFamiliaResponsivaCss = (pai) => {
    if (!pai) return '';
    let cssCompleto = '';
    const seletorPai = gerarSeletor(pai);
    
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

    cssCompleto += `\n/* --- CSS RESPONSIVO (Media Queries) --- */\n\n`;
    
    const folhasEstilo = Array.from(document.styleSheets);
    folhasEstilo.forEach(folha => {
        try {
            const regrasFolha = Array.from(folha.cssRules || folha.rules);
            regrasFolha.forEach(regra => {
                if (regra.type === CSSRule.MEDIA_RULE && mediaQueryAfetaElemento(regra.media.mediaText, pai)) {
                    let cssDentroMedia = '';
                    const regrasInternas = Array.from(regra.cssRules || regra.rules);
                    const processadosInternos = new Set();

                    regrasInternas.forEach(regraInterna => {
                        if (regraInterna.type === CSSRule.STYLE_RULE) {
                            const seletorInterno = regraInterna.selectorText;
                            if (seletorInterno && (seletorInterno.includes(seletorPai) || seletorInterno.includes(gerarSeletor(pai)))) {
                                if (!processadosInternos.has(seletorInterno)) {
                                    processadosInternos.add(seletorInterno);
                                    cssDentroMedia += `  ${regraInterna.cssText}\n`;
                                }
                            }
                        }
                    });
                    if (cssDentroMedia) {
                        cssCompleto += `@media ${regra.media.mediaText} {\n${cssDentroMedia}}\n\n`;
                    }
                }
            });
        } catch (err) {}
    });
    return cssCompleto;
  };

  const gerarArvoreDOM = (elemento) => {
    if(!elemento) return '';
    let caminho = []; let atual = elemento;
    while (atual && atual.tagName !== 'HTML') { caminho.unshift(atual); atual = atual.parentElement; }
    let htmlArvore = ''; let espacamento = 0;
    caminho.forEach((el) => {
        const isTarget = el === elemento;
        const tag = `<span class="text-[#f38ba8]">${el.tagName.toLowerCase()}</span>`;
        const id = el.id ? `<span class="text-[#f9e2af]">#${el.id}</span>` : '';
        const classes = Array.from(el.classList).length > 0 ? `<span class="text-[#89b4fa]">.${Array.from(el.classList).join('.')}</span>` : '';
        htmlArvore += `<div class="py-1 min-w-max text-slate-300 ${isTarget ? 'text-[#00E5FF] font-bold bg-[#00E5FF1a] rounded px-1.5 -ml-1 border-l-2 border-[#00E5FF]' : ''}" style="margin-left: ${espacamento}px;">${isTarget ? '👉' : '↳'} ${tag}${id}${classes}</div>`;
        espacamento += 12;
    });
    return htmlArvore;
  };

  const formatarHTML = (htmlCru) => {
    if(!htmlCru) return '';
    let nivelIndentacao = 0; const espacos = '  ';
    const htmlLimpo = htmlCru.replace(/\n/g, '').replace(/>\s*</g, '><');
    return htmlLimpo.replace(/<[^>]+>/g, (tag) => {
        const ehTagFechamento = tag.match(/^<\//);
        const ehTagAutoFechamento = tag.match(/\/>$/) || tag.match(/^<(img|br|hr|input|meta|link)/i);
        if (ehTagFechamento) Math.max(0, nivelIndentacao--);
        const tagFormatada = '\n' + espacos.repeat(nivelIndentacao) + tag;
        if (!ehTagAutoFechamento && !ehTagFechamento) nivelIndentacao++;
        return tagFormatada;
    }).trim();
  };

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed'; overlay.style.zIndex = '2147483646';
  overlay.style.pointerEvents = 'none'; overlay.style.border = '2px dashed #00E5FF';
  overlay.style.backgroundColor = 'rgba(0, 229, 255, 0.1)';
  overlay.style.transition = 'all 0.1s ease-out'; overlay.style.display = 'none';
  document.body.appendChild(overlay);

  const notificar = () => {
    if (elementoFocado) {
      onStateChange({
        html: formatarHTML(elementoFocado.outerHTML),
        css: extrairFamiliaResponsivaCss(elementoFocado),
        treeHtml: gerarArvoreDOM(elementoFocado),
        status: isCongelado ? 'FROZEN' : 'LIVE'
      });
    }
  };

  const aoPassarMouse = function(e) {
    if (isCongelado || e.composedPath().find(el => el.id === 'css2use-root')) return;
    elementoFocado = e.target;
    
    const medidas = elementoFocado.getBoundingClientRect();
    overlay.style.top = medidas.top + 'px'; overlay.style.left = medidas.left + 'px';
    overlay.style.width = medidas.width + 'px'; overlay.style.height = medidas.height + 'px';
    overlay.style.display = 'block'; 

    notificar();
  };

  const aoClicar = function(e) {
    if (e.composedPath().find(el => el.id === 'css2use-root')) return;
    e.preventDefault(); e.stopPropagation();

    if (!isCongelado && elementoFocado) {
        isCongelado = true;
        elementoCongelado = elementoFocado;
        overlay.style.border = '2px solid #f38ba8';
        overlay.style.backgroundColor = 'rgba(243, 139, 168, 0.1)';
        notificar();
    } else if (isCongelado) {
        isCongelado = false;
        elementoCongelado = null;
        overlay.style.border = '2px dashed #00E5FF';
        overlay.style.backgroundColor = 'rgba(0, 229, 255, 0.1)';
        notificar();
        aoPassarMouse(e);
    }
  };

  const desligarInspetor = () => {
    document.removeEventListener('mouseover', aoPassarMouse);
    document.removeEventListener('click', aoClicar, true);
    document.removeEventListener('keydown', aoPressionarTecla);
    overlay.remove();
    const styleCrosshair = document.getElementById('meu-css-pro-cursor-style');
    if (styleCrosshair) styleCrosshair.remove();
    const liveStyle = document.getElementById('meu-css-pro-live-style');
    if (liveStyle) liveStyle.remove();
    window.meuCssProAtivo = false;
  };

  const aoPressionarTecla = function(e) { if (e.key === "Escape") desligarInspetor(); };
  
  document.addEventListener('mouseover', aoPassarMouse);
  document.addEventListener('click', aoClicar, true);
  document.addEventListener('keydown', aoPressionarTecla);

  return {
    atualizarHtml: (novoHtml) => {
      if (isCongelado && elementoCongelado) {
        try {
          const range = document.createRange();
          range.selectNode(elementoCongelado);
          const documentFragment = range.createContextualFragment(novoHtml);
          if (documentFragment.children.length === 1) {
              const novoElemento = documentFragment.firstElementChild;
              elementoCongelado.replaceWith(novoElemento);
              elementoCongelado = novoElemento;
              const medidas = elementoCongelado.getBoundingClientRect();
              overlay.style.top = medidas.top + 'px'; overlay.style.left = medidas.left + 'px';
              overlay.style.width = medidas.width + 'px'; overlay.style.height = medidas.height + 'px';
              notificar();
          }
        } catch(e) {}
      }
    },
    atualizarCss: (novoCss) => {
      if (isCongelado) {
        liveCssStyle.textContent = novoCss;
      }
    },
    desligar: desligarInspetor
  }
}