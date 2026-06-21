import{d as y,h as S,t as c}from"./index-D1sIpxRd.js";const $="https://flzpblpegoqjxaacjvhf.supabase.co",z=`${$}/functions/v1/instancia`;let r=null,o=null;async function q(){document.getElementById("tbacts").innerHTML='<button class="btn bp bsm" id="ins-refresh">Atualizar</button>',document.getElementById("ins-refresh").addEventListener("click",()=>d(!0));const t=document.getElementById("content");t.innerHTML='<div class="empty">Consultando a UazAPI...</div>',await d(!0)}async function d(t=!1){const e=document.getElementById("content");t&&!o&&(e.innerHTML='<div class="empty">Consultando a UazAPI...</div>');try{const[n,a,i]=await Promise.all([fetch(`${z}?action=status`).then(s=>s.json()).catch(s=>({error:String(s)})),y.from("chatbot_conversations").select("phone, last_message_at, updated_at, lead_data").not("phone","like","__%").not("last_message_at","is",null).order("last_message_at",{ascending:!1}).limit(1).maybeSingle(),y.from("chatbot_conversations").select("phone",{count:"exact",head:!0}).gte("updated_at",new Date(new Date().setHours(0,0,0,0)).toISOString()).not("phone","like","__%")]);o={api:n,ultimaMsg:(a==null?void 0:a.data)||null,hoje:(i==null?void 0:i.count)||0},A(),D()}catch(n){e.innerHTML=`<div class="empty">Erro: ${n.message}</div>`}}function u(t){if(!t)return{};const e=t.data||t;return(e==null?void 0:e.instance)||e||{}}function w(t){const e=u(t),n=[e.status,e.state,e.connection,e.connected,e.connectionState].filter(i=>i!=null);if(!n.length)return"unknown";const a=String(n[0]).toLowerCase();return["connected","open","ready","online","true"].includes(a)||n[0]===!0?"connected":["disconnected","closed","offline","false","close","logged_out"].includes(a)||n[0]===!1?"disconnected":["connecting","qr","qrcode","waiting","pairing","scanning"].includes(a)?"connecting":a}function I(t){const e=u(t);return e.phone||e.number||e.wid||e.jid||e.connectedPhone||e.owner||null}function R(t){const e=u(t);let n=e.qrcode||e.qr||e.qrCode||e.qr_code||e.base64||null;return n?(n=String(n),n.startsWith("data:image")||n.startsWith("http")?n:`data:image/png;base64,${n}`):null}function A(){var f,x,b,h;const t=w(o.api),e=I(o.api),n=R(o.api);(f=o.api)==null||f.ok;const a=((x=o.api)==null?void 0:x.error)||((b=o.api)!=null&&b.httpStatus&&o.api.httpStatus>=400?`HTTP ${o.api.httpStatus}`:null),i={connected:{bg:"rgba(193,255,42,.10)",border:"var(--ok)",cor:"var(--ok)",icon:"✓",label:"CONECTADA"},disconnected:{bg:"rgba(255,92,92,.10)",border:"var(--danger)",cor:"var(--danger)",icon:"✕",label:"DESCONECTADA"},connecting:{bg:"rgba(245,166,35,.10)",border:"var(--warn)",cor:"var(--warn)",icon:"⟳",label:"AGUARDANDO QR"},unknown:{bg:"rgba(255,255,255,.04)",border:"var(--line)",cor:"var(--text-3)",icon:"?",label:"DESCONHECIDO"}}[t]||{bg:"rgba(255,255,255,.04)",border:"var(--line)",cor:"var(--text-3)",icon:"?",label:t.toUpperCase()},s=o.ultimaMsg?`<b style="color:var(--text-2)">${p(((h=o.ultimaMsg.lead_data)==null?void 0:h.nome)||o.ultimaMsg.phone)}</b><br>
       <span style="font-size:11px;color:var(--text-3)">${S(o.ultimaMsg.last_message_at)}</span>`:'<span style="color:var(--text-3)">Nenhuma mensagem registrada</span>',_=n?`
    <div style="background:#fff;padding:14px;border-radius:12px;display:inline-block">
      <img src="${n}" alt="QR code WhatsApp" style="width:280px;height:280px;display:block">
    </div>
    <div style="font-size:12px;color:var(--text-3);margin-top:10px;text-align:center;max-width:300px">
      Abra o WhatsApp do número da Sofia → ⋮ → Dispositivos conectados → Conectar um aparelho → Escaneie o QR acima.
    </div>`:"",k=t==="connected"?`<button class="btn bd" id="ins-disconnect">Desconectar</button>
       <button class="btn bg" id="ins-restart">Reiniciar</button>`:`<button class="btn bp" id="ins-connect">Gerar QR / Reconectar</button>
       <button class="btn bg" id="ins-restart">Reiniciar</button>`,E=document.getElementById("content");E.innerHTML=`
    <!-- Status principal -->
    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>Instância WhatsApp</h3></div>
      <div style="padding:24px;display:grid;grid-template-columns:1.2fr 1fr;gap:24px">
        <div>
          <div style="display:inline-flex;align-items:center;gap:10px;background:${i.bg};border:1px solid ${i.border};color:${i.cor};padding:8px 16px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:.08em">
            <span style="font-size:14px">${i.icon}</span>
            ${i.label}
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;margin-top:22px">
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Número conectado</div>
              <div style="font-size:18px;font-weight:600;font-family:ui-monospace,monospace">${e?C(e):"—"}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Última mensagem recebida</div>
              <div style="font-size:13px;line-height:1.5">${s}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Conversas atualizadas hoje</div>
              <div style="font-size:24px;font-weight:700;color:var(--accent)">${o.hoje}</div>
            </div>
          </div>

          <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">${k}</div>

          ${a?`<div style="margin-top:18px;padding:12px 14px;border-left:3px solid var(--danger);background:rgba(255,92,92,.08);color:var(--danger);font-size:12px;border-radius:0 6px 6px 0">UazAPI erro: ${p(a)}</div>`:""}
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;background:var(--bg-card);border:1px solid var(--line);border-radius:12px">
          ${n?_:`
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
          <div style="font-family:ui-monospace,monospace;color:var(--text-2)">sofia</div>
        </div>
        <div>
          <div style="color:var(--text-3);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Webhook</div>
          <div style="font-family:ui-monospace,monospace;color:var(--text-2);word-break:break-all;font-size:11px">${$}/functions/v1/webhook</div>
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
      <pre style="background:var(--bg-card);border:1px solid var(--line);border-radius:8px;padding:14px;font-size:11px;color:var(--text-2);overflow:auto;max-height:300px;font-family:ui-monospace,monospace">${p(JSON.stringify(o.api,null,2))}</pre>
    </details>`;const g=document.getElementById("ins-connect"),v=document.getElementById("ins-disconnect"),m=document.getElementById("ins-restart");g&&g.addEventListener("click",()=>l("connect","Gerando QR…","QR gerado")),v&&v.addEventListener("click",()=>l("disconnect","Desconectando…","Desconectada")),m&&m.addEventListener("click",()=>l("restart","Reiniciando…","Reiniciada"))}async function l(t,e,n){c(e);try{const a=await fetch(`${z}?action=${t}`,{method:"POST"}).then(i=>i.json());a.error||a.ok===!1?c("Falhou: "+(a.error||`HTTP ${a.httpStatus}`),"er"):c(n),setTimeout(()=>d(!1),1e3)}catch(a){c("Erro: "+a.message,"er")}}function D(){const e=w(o.api)!=="connected";e&&!r?r=setInterval(()=>d(!1),5e3):!e&&r&&(clearInterval(r),r=null)}window.addEventListener("hashchange",()=>{r&&(clearInterval(r),r=null)});function p(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function C(t){const e=String(t).replace(/\D/g,"").replace(/^55/,"");return e.length===11?`+55 (${e.slice(0,2)}) ${e.slice(2,7)}-${e.slice(7)}`:e.length===10?`+55 (${e.slice(0,2)}) ${e.slice(2,6)}-${e.slice(6)}`:t}export{q as render};
