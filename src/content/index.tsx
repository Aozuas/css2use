import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
// @ts-expect-error O Vite compila inlines nativamente como strings
import styleText from '@/index.css?inline';
import { InspectorUI, InspectorState } from './InspectorUI';
import { initInspector } from './logic';

function App() {
  const [state, setState] = useState<InspectorState | null>(null);
  const [logicApi, setLogicApi] = useState<any>(null);

  useEffect(() => {
    const api = initInspector((newState) => {
      setState(novo => ({ ...novo, ...newState }));
    });
    setLogicApi(api);
    return () => {
      if (api && typeof (api as any).desligar === 'function') (api as any).desligar();
    };
  }, []);

  if (!state) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`/* CSS RESPONSIVO EXTRAÍDO COM CSS2USE */\n${state.css}\n\n${state.html}`);
  };

  const handleCodepen = () => {
    const form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define'; form.method = 'POST'; form.target = '_blank';
    const input = document.createElement('input'); input.type = 'hidden'; input.name = 'data';
    input.value = JSON.stringify({ title: "Extraído Responsivo com CSS2USE", html: state.html, css: state.css });
    form.appendChild(input); document.body.appendChild(form);
    form.submit(); form.remove(); 
  };

  const handleClose = () => {
    if (logicApi && typeof (logicApi as any).desligar === 'function') (logicApi as any).desligar();
    document.getElementById('css2use-root')?.remove();
  };

  return (
    <InspectorUI 
      state={state} 
      actions={{
        onHtmlChange: (val) => {
          setState(prev => prev ? {...prev, html: val} : prev);
          logicApi?.atualizarHtml(val);
        },
        onCssChange: (val) => {
          setState(prev => prev ? {...prev, css: val} : prev);
          logicApi?.atualizarCss(val);
        },
        onCopy: handleCopy,
        onCodePen: handleCodepen,
        onClose: handleClose
      }}
    />
  );
}

// Iniciar a injeção ao receber mensagem do background
let root: any = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'TOGGLE_INSPECTOR') {
    let rootDiv = document.getElementById('css2use-root');
    
    // Se já existe, destruímos (Toggle OFF)
    if (rootDiv) {
      if (root) root.unmount();
      rootDiv.remove();
      return;
    }

    // Toggle ON
    rootDiv = document.createElement('div');
    rootDiv.id = 'css2use-root';
    document.body.appendChild(rootDiv);

    const shadowRoot = rootDiv.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = styleText;
    shadowRoot.appendChild(style);

    const reactContainer = document.createElement('div');
    shadowRoot.appendChild(reactContainer);

    root = createRoot(reactContainer);
    root.render(<App />);
  }
});
