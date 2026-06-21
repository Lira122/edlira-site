import{d as $,h as D,t as u}from"./index-DNz8MnN1.js";const w="https://flzpblpegoqjxaacjvhf.supabase.co",k=`${w}/functions/v1/instancia`;let r=null,n=null;function v(){const t=document.getElementById("content");return t&&t.dataset.view==="instancia"}function c(){r&&(clearInterval(r),r=null)}async function L(){c(),document.getElementById("tbacts").innerHTML='<button class="btn bp bsm" id="ins-refresh">Atualizar</button>',document.getElementById("ins-refresh").addEventListener("click",()=>g(!0));const t=document.getElementById("content");t.dataset.view="instancia",t.innerHTML='<div class="empty">Consultando a UazAPI...</div>',await g(!0)}async function g(t=!1){if(!v()){c();return}const e=document.getElementById("content");t&&!n&&(e.innerHTML='<div class="empty">Consultando a UazAPI...</div>');try{const[i,a,o]=await Promise.all([fetch(`${k}?action=status`).then(s=>s.json()).catch(s=>({error:String(s)})),$.from("chatbot_conversations").select("phone, last_message_at, updated_at, lead_data").not("phone","like","__%").not("last_message_at","is",null).order("last_message_at",{ascending:!1}).limit(1).maybeSingle(),$.from("chatbot_conversations").select("phone",{count:"exact",head:!0}).gte("updated_at",new Date(new Date().setHours(0,0,0,0)).toISOString()).not("phone","like","__%")]);n={api:i,ultimaMsg:(a==null?void 0:a.data)||null,hoje:(o==null?void 0:o.count)||0},N(),M()}catch(i){e.innerHTML=`<div class="empty">Erro: ${i.message}</div>`}}function d(t){var e;return((e=t==null?void 0:t.data)==null?void 0:e.instance)||{}}function _(t){const e=t==null?void 0:t.data;return e?e.connected===!0?"connected":d(t).qrcode?"connecting":e.connected===!1?"disconnected":"unknown":"unknown"}function P(t){return d(t).owner||d(t).phone||null}function R(t){return d(t).profileName||null}function T(t){return d(t).name||"sofia"}function C(t){let e=d(t).qrcode;return e?(e=String(e),e.startsWith("data:image")||e.startsWith("http")?e:`data:image/png;base64,${e}`):null}function N(){var x,b,y,h;if(!v()){c();return}const t=_(n.api),e=P(n.api),i=R(n.api),a=T(n.api),o=C(n.api);(x=n.api)==null||x.ok;const s=((b=n.api)==null?void 0:b.error)||((y=n.api)!=null&&y.httpStatus&&n.api.httpStatus>=400?`HTTP ${n.api.httpStatus}`:null),l={connected:{bg:"rgba(193,255,42,.10)",border:"var(--ok)",cor:"var(--ok)",icon:"✓",label:"CONECTADA"},disconnected:{bg:"rgba(255,92,92,.10)",border:"var(--danger)",cor:"var(--danger)",icon:"✕",label:"DESCONECTADA"},connecting:{bg:"rgba(245,166,35,.10)",border:"var(--warn)",cor:"var(--warn)",icon:"⟳",label:"AGUARDANDO QR"},unknown:{bg:"rgba(255,255,255,.04)",border:"var(--line)",cor:"var(--text-3)",icon:"?",label:"DESCONHECIDO"}}[t]||{bg:"rgba(255,255,255,.04)",border:"var(--line)",cor:"var(--text-3)",icon:"?",label:t.toUpperCase()},E=n.ultimaMsg?`<b style="color:var(--text-2)">${p(((h=n.ultimaMsg.lead_data)==null?void 0:h.nome)||n.ultimaMsg.phone)}</b><br>
       <span style="font-size:11px;color:var(--text-3)">${D(n.ultimaMsg.last_message_at)}</span>`:'<span style="color:var(--text-3)">Nenhuma mensagem registrada</span>',I=o?`
    <div style="background:#fff;padding:14px;border-radius:12px;display:inline-block">
      <img src="${o}" alt="QR code WhatsApp" style="width:280px;height:280px;display:block">
    </div>
    <div style="font-size:12px;color:var(--text-3);margin-top:10px;text-align:center;max-width:300px">
      Abra o WhatsApp do número da Sofia → ⋮ → Dispositivos conectados → Conectar um aparelho → Escaneie o QR acima.
    </div>`:"",S=t==="connected"?'<button class="btn bd" id="ins-disconnect">Desconectar</button>':'<button class="btn bp" id="ins-connect">Gerar QR / Reconectar</button>',A=document.getElementById("content");A.innerHTML=`
    <!-- Status principal -->
    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>Instância WhatsApp</h3></div>
      <div style="padding:24px;display:grid;grid-template-columns:1.2fr 1fr;gap:24px">
        <div>
          <div style="display:inline-flex;align-items:center;gap:10px;background:${l.bg};border:1px solid ${l.border};color:${l.cor};padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.08em">
            <span style="font-size:14px">${l.icon}</span>
            ${l.label}
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;margin-top:22px">
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Número conectado</div>
              <div style="font-size:18px;font-weight:600;font-family:ui-monospace,monospace">${e?q(e):"—"}</div>
              ${i?`<div style="font-size:12px;color:var(--text-3);margin-top:2px">${p(i)}</div>`:""}
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Última mensagem recebida</div>
              <div style="font-size:13px;line-height:1.5">${E}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Conversas atualizadas hoje</div>
              <div style="font-size:24px;font-weight:700;color:var(--accent)">${n.hoje}</div>
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">${S}</div>

          ${s?`<div style="margin-top:18px;padding:12px 14px;border-left:3px solid var(--danger);background:rgba(255,92,92,.08);color:var(--danger);font-size:12px;border-radius:0 6px 6px 0">UazAPI erro: ${p(s)}</div>`:""}
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:var(--bg-card);border:1px solid var(--line);border-radius:12px">
          ${o?I:`
            <div style="text-align:center;color:var(--text-3);font-size:13px;line-height:1.6">
              ${t==="connected"?"🟢 Tudo no ar.<br>Sofia respondendo via WhatsApp.":"Clique em <b>Gerar QR / Reconectar</b><br>pra ver o QR aqui."}
            </div>`}
        </div>
      </div>
    </div>

    <!-- Detalhes técnicos -->
    <div class="tw">
      <div class="th"><h3>Detalhes técnicos</h3></div>
      <div style="padding:18px 22px;display:grid;grid-template-columns:1fr 1fr;gap:18px;font-size:12px">
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Endpoint UazAPI</div>
          <div style="font-family:ui-monospace,monospace;color:var(--text-2)">adriane.uazapi.com</div>
        </div>
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Instância</div>
          <div style="font-family:ui-monospace,monospace;color:var(--text-2)">${p(a)}</div>
        </div>
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Webhook</div>
          <div style="font-family:ui-monospace,monospace;color:var(--text-2);word-break:break-all;font-size:11px">${w}/functions/v1/webhook</div>
        </div>
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Polling automático</div>
          <div style="color:var(--text-2)">${r?"🔴 ativo (a cada 5s enquanto não conecta)":"desligado (conectado)"}</div>
        </div>
      </div>
    </div>

    <!-- Raw response (debug) -->
    <details style="margin-top:18px">
      <summary style="cursor:pointer;font-size:12px;color:var(--text-3);padding:8px">Ver resposta crua da UazAPI</summary>
      <pre style="background:var(--bg-card);border:1px solid var(--line);border-radius:8px;padding:14px;font-size:11px;color:var(--text-2);overflow:auto;max-height:300px;font-family:ui-monospace,monospace">${p(JSON.stringify(n.api,null,2))}</pre>
    </details>`;const m=document.getElementById("ins-connect"),f=document.getElementById("ins-disconnect");m&&m.addEventListener("click",()=>z("connect","Gerando QR…","QR gerado")),f&&f.addEventListener("click",()=>z("disconnect","Desconectando…","Desconectada"))}async function z(t,e,i){u(e);try{const a=await fetch(`${k}?action=${t}`,{method:"POST"}).then(o=>o.json());a.error||a.ok===!1?u("Falhou: "+(a.error||`HTTP ${a.httpStatus}`),"er"):u(i),setTimeout(()=>g(!1),1e3)}catch(a){u("Erro: "+a.message,"er")}}function M(){const e=_(n.api)!=="connected";if(!v()){c();return}e&&!r?r=setInterval(()=>{if(!v()){c();return}g(!1)},5e3):!e&&r&&c()}function p(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function q(t){const e=String(t).replace(/\D/g,"").replace(/^55/,"");return e.length===11?`+55 (${e.slice(0,2)}) ${e.slice(2,7)}-${e.slice(7)}`:e.length===10?`+55 (${e.slice(0,2)}) ${e.slice(2,6)}-${e.slice(6)}`:t}export{L as render};
