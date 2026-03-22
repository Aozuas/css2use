import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

export interface InspectorState {
  html: string;
  css: string;
  treeHtml: string;
  status: 'LIVE' | 'FROZEN';
}

export interface InspectorActions {
  onHtmlChange: (val: string) => void;
  onCssChange: (val: string) => void;
  onCopy: () => void;
  onCodePen: () => void;
  onClose: () => void;
}

export function InspectorUI({
  state,
  actions
}: {
  state: InspectorState;
  actions: InspectorActions;
}) {
  const [pos, setPos] = useState({ left: window.innerWidth - 440, top: 20 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ left: 0, top: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { left: pos.left, top: pos.top };
    if (e.target instanceof HTMLElement) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({
      left: initialPos.current.left + dx,
      top: initialPos.current.top + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
      style={{ left: pos.left, top: pos.top }}
      className="fixed z-[2147483647] flex flex-col w-[420px] h-[480px] min-w-[320px] min-h-[300px] resize overflow-hidden rounded-xl shadow-2xl border border-slate-700 bg-slate-900 text-slate-200 font-sans text-base text-left tracking-normal leading-normal"
    >
      {/* Header (Draggable) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="bg-slate-800 p-3 px-4 flex justify-between items-center border-b border-slate-700 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="font-semibold text-sm text-white flex items-center gap-2 pointer-events-none">
          <img src={chrome.runtime.getURL('icon.png')} alt="Logo" className="w-5 h-5 rounded-sm object-contain" /> CSS2USE
        </div>
        <button
          onClick={actions.onClose}
          className="text-slate-400 hover:text-red-400 transition-colors px-1 cursor-pointer"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="html" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="bg-slate-800 rounded-none w-full justify-between h-auto p-0 border-b border-slate-700 shrink-0">
          <TabsTrigger value="html" className="flex-1 rounded-none py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-[#00E5FF]">HTML</TabsTrigger>
          <TabsTrigger value="css" className="flex-1 rounded-none py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-[#00E5FF]">CSS</TabsTrigger>
          <TabsTrigger value="tree" className="flex-1 rounded-none py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-[#00E5FF]">Árvore DOM</TabsTrigger>
        </TabsList>

        <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>{state.status === 'LIVE' ? 'Procurando elementos...' : '❄️ Código liberado para edição!'}</span>
            <Badge variant={state.status === 'LIVE' ? 'secondary' : 'destructive'} className="font-bold text-[10px]">
              {state.status}
            </Badge>
          </div>

          <div className="flex-1 flex flex-col w-full bg-[#11111b] border border-slate-700 rounded-md overflow-hidden relative">
            <TabsContent value="html" className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col">
              <Textarea
                className="flex-1 w-full resize-none rounded-none bg-transparent border-none text-[#a6e3a1] font-mono text-xs p-3 leading-relaxed"
                spellCheck={false}
                value={state.html}
                onChange={(e) => actions.onHtmlChange(e.target.value)}
                disabled={state.status === 'LIVE'}
              />
            </TabsContent>
            <TabsContent value="css" className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col">
              <Textarea
                className="flex-1 w-full resize-none rounded-none bg-transparent border-none text-[#89b4fa] font-mono text-xs p-3 leading-relaxed"
                spellCheck={false}
                value={state.css}
                onChange={(e) => actions.onCssChange(e.target.value)}
                disabled={state.status === 'LIVE'}
              />
            </TabsContent>
            <TabsContent value="tree" className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col overflow-auto p-3 bg-[#11111b]">
              <div 
                className="font-mono text-[11px] text-slate-300"
                dangerouslySetInnerHTML={{ __html: state.treeHtml }} 
              />
            </TabsContent>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-3 transition-opacity duration-200 ${state.status === 'LIVE' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Button onClick={actions.onCopy} variant="secondary" className="flex-1 font-semibold">
              📋 Copiar Tudo
            </Button>
            <Button onClick={actions.onCodePen} className="flex-1 font-semibold bg-[#00E5FF] text-black hover:bg-[#00b3cc]">
              🚀 CodePen
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
