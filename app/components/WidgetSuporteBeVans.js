"use client";

import { useState, useRef, useEffect } from "react";

export default function WidgetSuporteBeVans() {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [temaEscuro, setTemaEscuro] = useState(true);
  const [historico, setHistorico] = useState([
    {
      role: "assistant",
      content: "Olá! Sou o assistente virtual do BeVans. Como posso te ajudar hoje?",
    },
  ]);
  const [carregando, setCarregando] = useState(false);
  const fimChatRef = useRef(null);

  // Sincroniza automaticamente com o ThemeToggle do site (data-theme="dark" | "light")
  useEffect(() => {
    const atualizarTema = () => {
      const temaAtual = document.documentElement.dataset.theme;
      setTemaEscuro(temaAtual !== "light");
    };

    atualizarTema();

    const observer = new MutationObserver(atualizarTema);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fimChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historico, aberto]);

  async function enviarPergunta(e) {
    e.preventDefault();
    if (!mensagem.trim() || carregando) return;

    const perguntaAtual = mensagem;
    setMensagem("");
    setCarregando(true);

    const novoHistorico = [
      ...historico,
      { role: "user", content: perguntaAtual },
    ];
    setHistorico(novoHistorico);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const respostaApi = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta: perguntaAtual,
          historico: historico.slice(1),
        }),
      });

      const dados = await respostaApi.json();

      setHistorico([
        ...novoHistorico,
        { role: "assistant", content: dados.resposta },
      ]);
    } catch {
      setHistorico([
        ...novoHistorico,
        {
          role: "assistant",
          content:
            "Não consegui conectar ao suporte agora. Verifique se o servidor da API está ativo.",
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  const cores = temaEscuro
    ? {
        fundoJanela: "#0D1B2E",
        fundoAreaChat: "#091423",
        fundoInputArea: "#0D1B2E",
        fundoInput: "#132640",
        textoPrincipal: "#F8FAFC",
        textoSecundario: "#94A3B8",
        borda: "rgba(148, 163, 184, 0.18)",
        balaoBot: "#152842",
        textoBot: "#F1F5F9",
        destaqueAzul: "#007BFF",
        destaqueAzulHover: "#0A84FF",
      }
    : {
        fundoJanela: "#FFFFFF",
        fundoAreaChat: "#F5F7FA",
        fundoInputArea: "#FFFFFF",
        fundoInput: "#F1F5F9",
        textoPrincipal: "#0F172A",
        textoSecundario: "#64748B",
        borda: "#E2E8F0",
        balaoBot: "#FFFFFF",
        textoBot: "#1E293B",
        destaqueAzul: "#007BFF",
        destaqueAzulHover: "#0066D6",
      };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 18,
        right: 20,
        zIndex: 9999,
        fontFamily: "var(--font-geist), system-ui, -apple-system, sans-serif",
      }}
    >
      {aberto && (
        <div
          style={{
            width: 370,
            maxWidth: "calc(100vw - 32px)",
            height: "min(500px, calc(100vh - 110px))",
            backgroundColor: cores.fundoJanela,
            borderRadius: 16,
            boxShadow: "0 20px 45px rgba(0, 0, 0, 0.45)",
            border: `1px solid ${cores.borda}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          {/* Cabeçalho no estilo da barra superior do BeVans */}
          <div
            style={{
              backgroundColor: cores.fundoJanela,
              borderBottom: `1px solid ${cores.borda}`,
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: "rgba(0, 123, 255, 0.15)",
                  border: "1px solid rgba(0, 123, 255, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#3898FF",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: cores.textoPrincipal }}>
                  Suporte BeVans
                </div>
                <div style={{ fontSize: 11.5, color: cores.textoSecundario, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22C55E", display: "inline-block" }} />
                  Assistente online
                </div>
              </div>
            </div>

            <button
              onClick={() => setAberto(false)}
              style={{
                background: "transparent",
                border: `1px solid ${cores.borda}`,
                color: cores.textoSecundario,
                width: 28,
                height: 28,
                borderRadius: 8,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Fechar suporte"
            >
              ×
            </button>
          </div>

          {/* Área de Mensagens */}
          <div
            style={{
              flex: 1,
              padding: 14,
              backgroundColor: cores.fundoAreaChat,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {historico.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? cores.destaqueAzul : cores.balaoBot,
                  color: msg.role === "user" ? "#FFFFFF" : cores.textoBot,
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  maxWidth: "84%",
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  border: msg.role === "assistant" ? `1px solid ${cores.borda}` : "none",
                }}
              >
                {msg.content}
              </div>
            ))}

            {carregando && (
              <div style={{ alignSelf: "flex-start", color: cores.textoSecundario, fontSize: 12.5, paddingLeft: 4 }}>
                Digitando...
              </div>
            )}
            <div ref={fimChatRef} />
          </div>

          {/* Campo de Envio */}
          <form
            onSubmit={enviarPergunta}
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              backgroundColor: cores.fundoInputArea,
              borderTop: `1px solid ${cores.borda}`,
            }}
          >
            <input
              type="text"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Pergunte sobre rotas, turmas..."
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${cores.borda}`,
                backgroundColor: cores.fundoInput,
                color: cores.textoPrincipal,
                fontSize: 13.5,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={carregando}
              style={{
                backgroundColor: cores.destaqueAzul,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 10,
                padding: "0 14px",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: carregando ? "not-allowed" : "pointer",
                opacity: carregando ? 0.65 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Enviar mensagem"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Botão Flutuante alinhado ao botão "Entrar no BeVans" */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setAberto(!aberto)}
          style={{
            backgroundColor: cores.destaqueAzul,
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0, 123, 255, 0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{aberto ? "Fechar" : "Ajuda BeVans"}</span>
        </button>
      </div>
    </div>
  );
}