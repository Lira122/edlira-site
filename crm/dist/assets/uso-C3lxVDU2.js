import{t as h,k as ct}from"./index-Dta-29re.js";const ut="https://flzpblpegoqjxaacjvhf.supabase.co";let A=null,x=null,T=null;const tt="uso_limit_5h_tokens",et="uso_budget_mes_usd",N="uso_alerted_5h",P="uso_alerted_mes",at=[.5,.7,.8,.9,.95,1],gt=5e5;function ot(){const t=Number(localStorage.getItem(tt)||"0");return t>0?t:gt}function mt(t){localStorage.setItem(tt,String(Math.max(0,Number(t)||0))),localStorage.setItem(N,JSON.stringify([]))}function it(){const t=Number(localStorage.getItem(et)||"0");return t>0?t:50}function vt(t){localStorage.setItem(et,String(Math.max(0,Number(t)||0))),localStorage.setItem(P,JSON.stringify({mes:E(),t:[]}))}function E(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}function xt(){try{return JSON.parse(localStorage.getItem(N)||"[]")}catch{return[]}}function ht(t){localStorage.setItem(N,JSON.stringify(t))}function ft(){try{const t=JSON.parse(localStorage.getItem(P)||"{}");return t.mes!==E()?[]:t.t||[]}catch{return[]}}function bt(t){localStorage.setItem(P,JSON.stringify({mes:E(),t}))}function H(t="aviso"){try{const e=new(window.AudioContext||window.webkitAudioContext),a=t==="urgente"?880:523,s=.18,n=.18,i=t==="urgente"?3:2;for(let g=0;g<i;g++){const l=e.createOscillator(),d=e.createGain();l.type="sine",l.frequency.value=a,l.connect(d),d.connect(e.destination);const p=e.currentTime+g*(n+.08);d.gain.setValueAtTime(0,p),d.gain.linearRampToValueAtTime(s,p+.02),d.gain.linearRampToValueAtTime(0,p+n),l.start(p),l.stop(p+n)}setTimeout(()=>e.close().catch(()=>{}),i*400)}catch(e){console.warn("[beep] falhou:",e)}}function st(t,e){"Notification"in window&&(Notification.permission==="granted"?new Notification(t,{body:e,icon:"/assets/favicon-192.png"}):Notification.permission!=="denied"&&Notification.requestPermission().then(a=>{a==="granted"&&new Notification(t,{body:e,icon:"/assets/favicon-192.png"})}))}function yt(t){const e=ot();if(e<=0)return null;const a=t/e;let s=xt();s=s.filter(i=>a>=i);const n=at.filter(i=>a>=i&&!s.includes(i));if(n.length){const i=Math.max(...n),g=i>=.8?"urgente":"aviso",l=Math.round(i*100),d=g==="urgente"?`🚨 Janela 5h em ${l}% do limite do Claude`:`⚠️ Janela 5h em ${l}% do limite`,p=`${t.toLocaleString("pt-BR")} de ${e.toLocaleString("pt-BR")} tokens consumidos nas últimas 5 horas.`;H(g),st(d,p),h(`${d} — ${p}`,"warn"),s=[...s,...n]}return ht(s),{pct:a,limit:e,tokens:t}}function wt(t){const e=it();if(e<=0)return null;const a=t/e,s=ft(),n=at.filter(v=>a>=v&&!s.includes(v));if(!n.length)return{pct:a,budget:e};const i=Math.max(...n),g=i>=.8?"urgente":"aviso",l=Math.round(i*100),d=g==="urgente"?`🚨 Custo mensal em ${l}% do teto`:`⚠️ Custo mensal em ${l}% do teto`,p=`Você gastou $${t.toFixed(2)} de $${e.toFixed(2)} este mês.`;return H(g),st(d,p),h(`${d} — ${p}`,"warn"),bt([...s,...n]),{pct:a,budget:e}}const m=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);function c(t){const e=Number(t||0);return e>=1e6?(e/1e6).toFixed(2)+"M":e>=1e3?(e/1e3).toFixed(1)+"k":String(Math.round(e))}function b(t){const e=Number(t||0);return e<.01?"$"+e.toFixed(4):"$"+e.toFixed(2)}function nt(t,e=5.6){return"R$ "+(Number(t||0)*e).toFixed(2)}function $t(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);if(e<60)return`${e}s atrás`;const a=Math.floor(e/60);if(a<60)return`${a}min atrás`;const s=Math.floor(a/60);return s<24?`${s}h atrás`:new Date(t).toLocaleString("pt-BR")}function rt(t){return t?new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):""}async function dt(){var s;const{data:t}=await ct.auth.getSession(),e=(s=t==null?void 0:t.session)==null?void 0:s.access_token,a=await fetch(`${ut}/functions/v1/usage-stats`,{method:"POST",headers:{"Content-Type":"application/json",...e?{Authorization:`Bearer ${e}`}:{}},body:"{}"});if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}function kt(t){var O,R,B,D,J,U,K,V,G,Y,Q,W,X;const e=t.bot||{},a=t.anthropic||{},n=[{label:"Tokens HOJE",v:c((O=e.hoje)==null?void 0:O.total_tokens),sub:`${((R=e.hoje)==null?void 0:R.chamadas)||0} chamadas`,cor:"var(--accent)"},{label:"7 DIAS",v:c((B=e.sete_dias)==null?void 0:B.total_tokens),sub:`${((D=e.sete_dias)==null?void 0:D.chamadas)||0} chamadas`,cor:"var(--info)"},{label:"NO MÊS",v:c((J=e.mes)==null?void 0:J.total_tokens),sub:`${((U=e.mes)==null?void 0:U.chamadas)||0} chamadas`,cor:"#A78BFA"},{label:"CUSTO MÊS",v:b((K=e.mes)==null?void 0:K.custo_usd),sub:nt((V=e.mes)==null?void 0:V.custo_usd),cor:"var(--ok)"}].map(o=>`
    <div class="sc" style="border-left:3px solid ${o.cor}">
      <div class="sl">${m(o.label)}</div>
      <div class="sv">${m(o.v)}</div>
      <div class="ss">${m(o.sub)}</div>
    </div>`).join(""),i=Object.entries(e.por_provider||{}).sort((o,r)=>r[1].total_tokens-o[1].total_tokens),g=i.reduce((o,[,r])=>o+r.total_tokens,0)||1,l=i.length?i.map(([o,r])=>{const w=Math.round(r.total_tokens/g*100),k=o==="groq"?"#F55036":o==="openrouter"?"#4A9EFF":o==="anthropic"?"#C5F82A":"#A0A0A0";return`
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px">
          <span style="font-weight:500;color:${k}">${m(o)}</span>
          <span style="color:var(--text-3);font-size:12px">${c(r.total_tokens)} tokens · ${b(r.custo_usd)} · ${r.chamadas} chamadas</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${w}%;background:${k};transition:width .3s"></div>
        </div>
      </div>`}).join(""):'<div class="empty" style="padding:30px">Nenhum uso registrado ainda. Quando o bot fizer chamadas de IA, vai aparecer aqui em tempo real.</div>',d=Object.entries(e.por_modelo||{}).sort((o,r)=>r[1].total_tokens-o[1].total_tokens).slice(0,8),p=d.length?`
    <table style="width:100%;font-size:12px">
      <thead>
        <tr style="color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;font-size:10px">
          <th style="text-align:left;padding:6px 8px">Modelo</th>
          <th style="text-align:right;padding:6px 8px">Tokens</th>
          <th style="text-align:right;padding:6px 8px">Custo</th>
          <th style="text-align:right;padding:6px 8px">Chamadas</th>
        </tr>
      </thead>
      <tbody>
        ${d.map(([o,r])=>`
          <tr style="border-top:1px solid var(--line)">
            <td style="padding:8px;font-family:ui-monospace,monospace;font-size:11px">${m(o)}</td>
            <td style="padding:8px;text-align:right">${c(r.total_tokens)}</td>
            <td style="padding:8px;text-align:right;color:var(--ok)">${b(r.custo_usd)}</td>
            <td style="padding:8px;text-align:right;color:var(--text-3)">${r.chamadas}</td>
          </tr>`).join("")}
      </tbody>
    </table>`:"",v=Object.entries(e.por_dia||{}).sort(),$=Math.max(1,...v.map(([,o])=>o.total_tokens)),u=v.length?`
    <div style="display:flex;align-items:flex-end;gap:6px;height:80px;padding:8px 0;border-bottom:1px solid var(--line);margin-bottom:8px">
      ${v.map(([o,r])=>{const w=Math.max(2,Math.round(r.total_tokens/$*70));return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0">
          <div style="font-size:9px;color:var(--text-3)">${c(r.total_tokens)}</div>
          <div style="width:100%;height:${w}px;background:linear-gradient(to top,var(--accent),rgba(197,248,42,.3));border-radius:2px"></div>
          <div style="font-size:10px;color:var(--text-3)">${o.slice(5)}</div>
        </div>`}).join("")}
    </div>`:'<div class="empty" style="padding:30px">Sem dados nos últimos 7 dias.</div>',f=e.ultimas_chamadas||[],I=f.length?`
    <table style="width:100%;font-size:12px">
      <thead>
        <tr style="color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;font-size:10px">
          <th style="text-align:left;padding:6px 8px">Hora</th>
          <th style="text-align:left;padding:6px 8px">Provider</th>
          <th style="text-align:left;padding:6px 8px">Origem</th>
          <th style="text-align:right;padding:6px 8px">Tokens</th>
          <th style="text-align:right;padding:6px 8px">Custo</th>
          <th style="text-align:right;padding:6px 8px">Latência</th>
        </tr>
      </thead>
      <tbody>
        ${f.map(o=>`
          <tr style="border-top:1px solid var(--line)">
            <td style="padding:8px;color:var(--text-3)">${m(rt(o.quando))}</td>
            <td style="padding:8px">${m(o.provider)} ${o.sucesso?"":'<span style="color:var(--danger)">✗</span>'}</td>
            <td style="padding:8px;color:var(--text-2)">${m(o.origem||"—")}</td>
            <td style="padding:8px;text-align:right">${c(o.tokens)}</td>
            <td style="padding:8px;text-align:right;color:var(--ok)">${b(o.custo)}</td>
            <td style="padding:8px;text-align:right;color:var(--text-3)">${o.latencia||"—"}ms</td>
          </tr>`).join("")}
      </tbody>
    </table>`:'<div class="empty" style="padding:30px">Sem chamadas recentes.</div>';let y="";if(!a.configurado)y=`
      <div class="tw" style="margin-top:22px;padding:24px;background:rgba(197,248,42,.04);border:1px dashed rgba(197,248,42,.2)">
        <div style="font-size:14px;font-weight:500;margin-bottom:6px;color:var(--accent)">📡 Conta Anthropic não conectada</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6">
          Pra ver uso da SUA conta Anthropic (Claude Code etc) em tempo real, gera uma Admin API Key em
          <a href="https://console.anthropic.com/settings/admin-keys" target="_blank" style="color:var(--accent)">console.anthropic.com/settings/admin-keys</a>
          e adiciona como secret <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">ANTHROPIC_ADMIN_KEY</code> nas
          <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/functions/secrets" target="_blank" style="color:var(--accent)">Edge Functions Secrets</a>.
        </div>
      </div>`;else if(a.erro)y=`
      <div class="tw" style="margin-top:22px;padding:24px;border-left:3px solid var(--danger)">
        <div style="font-size:14px;font-weight:500;margin-bottom:6px;color:var(--danger)">Erro lendo Anthropic Admin API</div>
        <div style="font-size:12px;color:var(--text-3);font-family:ui-monospace,monospace">${m(a.erro)}</div>
      </div>`;else{const o=a.hoje||{},r=a.mes||{},w=Object.entries(r.por_modelo||{}).sort((k,j)=>j[1].total_tokens-k[1].total_tokens);y=`
      <div style="margin-top:30px;margin-bottom:14px;font-size:13px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">Conta Anthropic (Claude direto)</div>
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <div class="sc"><div class="sl">Hoje</div><div class="sv">${c(o.total_tokens)}</div><div class="ss">${o.chamadas||0} chamadas</div></div>
        <div class="sc"><div class="sl">Este Mês</div><div class="sv">${c(r.total_tokens)}</div><div class="ss">${r.chamadas||0} chamadas</div></div>
        <div class="sc"><div class="sl">Modelos ativos</div><div class="sv">${w.length}</div><div class="ss">no mês</div></div>
      </div>
      ${w.length?`
        <div class="tw" style="padding:14px 18px">
          <table style="width:100%;font-size:12px">
            <thead><tr style="color:var(--text-3);font-size:10px;text-transform:uppercase">
              <th style="text-align:left;padding:6px 8px">Modelo</th>
              <th style="text-align:right;padding:6px 8px">Tokens (mês)</th>
              <th style="text-align:right;padding:6px 8px">Chamadas</th>
            </tr></thead>
            <tbody>
              ${w.map(([k,j])=>`
                <tr style="border-top:1px solid var(--line)">
                  <td style="padding:8px;font-family:ui-monospace,monospace;font-size:11px">${m(k)}</td>
                  <td style="padding:8px;text-align:right">${c(j.total_tokens)}</td>
                  <td style="padding:8px;text-align:right;color:var(--text-3)">${j.chamadas}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`:""}`}const F=Number(((G=a.janela_5h)==null?void 0:G.total_tokens)||0),z=ot(),_=z>0?Math.min(100,Math.round(F/z*100)):0,L=_>=80?"var(--danger)":_>=50?"var(--warn)":"var(--ok)",lt=a.configurado&&!a.erro?`
    <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid ${L};background:${_>=80?"rgba(255,92,92,.05)":"transparent"}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:4px">🚦 Janela 5h do Claude (rate limit rolante)</div>
          <div style="font-size:13px;color:var(--text-2)">A Anthropic limita uso numa janela de 5 horas. Quando atravessar 80%, você ouve um alerta.</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px">
          <span style="color:var(--text-3)">Limite (tokens):</span>
          <input type="number" id="uso-limit-5h" value="${z}" min="0" step="50000" style="background:var(--bg-input);border:1px solid var(--line);color:var(--text);padding:5px 10px;border-radius:6px;width:120px;font-size:13px;font-family:inherit">
          <button class="btn bg bsm" id="uso-limit-5h-save">Salvar</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px;margin-bottom:8px">
        <span style="color:${L};font-weight:600;font-size:20px">${c(F)} / ${c(z)} <span style="font-size:13px;color:var(--text-3);font-weight:400">tokens (${_}%)</span></span>
        <span style="color:var(--text-3);font-size:11px">Atualiza em tempo real conforme tokens saem da janela</span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,.04);border-radius:5px;overflow:hidden">
        <div style="height:100%;width:${_}%;background:${L};transition:width .4s,background .4s"></div>
      </div>
      <div style="display:flex;gap:14px;margin-top:10px;font-size:11px;color:var(--text-3)">
        <span>Chamadas na janela: <strong style="color:var(--text-2)">${((Y=a.janela_5h)==null?void 0:Y.chamadas)||0}</strong></span>
        <span>Input: <strong style="color:var(--text-2)">${c((Q=a.janela_5h)==null?void 0:Q.input_tokens)}</strong></span>
        <span>Output: <strong style="color:var(--text-2)">${c((W=a.janela_5h)==null?void 0:W.output_tokens)}</strong></span>
      </div>
    </div>`:a.configurado?"":`
    <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid var(--text-3);background:rgba(197,248,42,.04)">
      <div style="font-size:13px;font-weight:600;margin-bottom:6px;color:var(--accent)">🚦 Janela 5h do Claude — não conectada</div>
      <div style="font-size:13px;color:var(--text-2);line-height:1.6">
        Pra monitorar a janela rolante de 5h do seu rate limit Claude/Anthropic, você precisa gerar uma <strong>Admin API Key</strong> em
        <a href="https://console.anthropic.com/settings/admin-keys" target="_blank" style="color:var(--accent)">console.anthropic.com/settings/admin-keys</a>
        e adicionar como secret <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace;font-size:11px">ANTHROPIC_ADMIN_KEY</code> nas
        <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/functions/secrets" target="_blank" style="color:var(--accent)">Edge Functions Secrets</a>.
      </div>
    </div>`,S=it(),q=Number(((X=e.mes)==null?void 0:X.custo_usd)||0),M=S>0?Math.min(100,Math.round(q/S*100)):0,C=M>=80?"var(--danger)":M>=50?"var(--warn)":"var(--ok)",pt=`
    <div class="tw" style="padding:14px 16px;margin-bottom:18px;border-left:3px solid ${C}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:10px">
        <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Custo mensal (bot Groq/OpenRouter)</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px">
          <span style="color:var(--text-3)">Teto US$</span>
          <input type="number" id="uso-budget" value="${S}" min="0" step="5" style="background:var(--bg-input);border:1px solid var(--line);color:var(--text);padding:4px 8px;border-radius:6px;width:70px;font-size:12px;font-family:inherit">
          <button class="btn bg bsm" id="uso-budget-save">Salvar</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="color:${C};font-weight:500">${b(q)} / ${b(S)} (${M}%)</span>
      </div>
      <div style="height:5px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${M}%;background:${C};transition:width .3s,background .3s"></div>
      </div>
    </div>`;return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <div style="font-size:13px;color:var(--text-3);display:flex;align-items:center;gap:8px">
        <span class="uso-dot" style="width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px rgba(52,211,153,.15);animation:uso-pulse 2s infinite"></span>
        Atualiza sozinho a cada 30s · última leitura ${m($t(t.gerado_em))}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn bg bsm" id="uso-test-beep" title="Tocar o som de alerta pra você ouvir como é">🔔 Testar alerta</button>
        <button class="btn bp" id="uso-pip" title="Abrir janela flutuante que segue você fora do CRM">📺 Abrir flutuante (PiP)</button>
      </div>
    </div>

    ${lt}
    ${pt}

    <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">${n}</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px">
      <div class="tw" style="padding:18px">
        <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;font-weight:600">Por provider (mês)</div>
        ${l}
      </div>
      <div class="tw" style="padding:18px">
        <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;font-weight:600">Últimos 7 dias</div>
        ${u}
      </div>
    </div>

    <div class="tw" style="padding:18px;margin-bottom:22px">
      <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:600">Top modelos (mês)</div>
      ${p||'<div class="empty" style="padding:14px">Sem dados ainda.</div>'}
    </div>

    <div class="tw" style="padding:18px">
      <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:600">Últimas chamadas</div>
      ${I}
    </div>

    ${y}

    <style>
      @keyframes uso-pulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(52,211,153,.15); }
        50%      { box-shadow: 0 0 0 8px rgba(52,211,153,.05); }
      }
    </style>
  `}async function _t(){if(!("documentPictureInPicture"in window)){Z();return}try{if(x&&!x.closed){x.focus();return}x=await window.documentPictureInPicture.requestWindow({width:380,height:540});const t=x.document.createElement("link");t.rel="stylesheet";const e=[...document.styleSheets].find(i=>i.href&&i.href.includes("assets"));e!=null&&e.href&&(t.href=e.href,x.document.head.appendChild(t));const a=x.document.createElement("style");a.textContent=`
      :root { --bg:#0A0A0A; --bg-alt:#111; --bg-card:#161616; --line:rgba(255,255,255,.07); --text:#fff; --text-2:#A0A0A0; --text-3:#555; --accent:#C5F82A; --ok:#34D399; --info:#4A9EFF; --danger:#FF5C5C; }
      *,*::before,*::after { box-sizing:border-box;margin:0;padding:0 }
      body { font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);padding:16px;font-size:13px;line-height:1.5 }
      .pip-head { display:flex;align-items:center;gap:8px;margin-bottom:14px }
      .pip-dot { width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px rgba(52,211,153,.15);animation:pip-pulse 2s infinite }
      .pip-h { font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;font-weight:600 }
      .pip-card { background:var(--bg-card);border:1px solid var(--line);border-radius:8px;padding:12px;margin-bottom:8px }
      .pip-label { font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px }
      .pip-value { font-size:22px;font-weight:700;letter-spacing:-.02em }
      .pip-sub { font-size:11px;color:var(--text-3);margin-top:2px }
      .pip-row { display:grid;grid-template-columns:1fr 1fr;gap:6px }
      .pip-last { font-size:11px;color:var(--text-2);padding:10px 0;border-top:1px solid var(--line);margin-top:8px }
      .pip-last-row { display:flex;justify-content:space-between;padding:4px 0 }
      .pip-prov-bar { height:4px;border-radius:2px;background:rgba(255,255,255,.04);overflow:hidden;margin:2px 0 8px }
      .pip-prov-fill { height:100%;border-radius:2px;transition:width .3s }
      @keyframes pip-pulse { 0%,100%{box-shadow:0 0 0 4px rgba(52,211,153,.15)} 50%{box-shadow:0 0 0 8px rgba(52,211,153,.05)} }
    `,x.document.head.appendChild(a);const s=x.document.createElement("div");s.id="pip-root",x.document.body.appendChild(s),x.document.title="Uso IA · ao vivo";const n=async()=>{try{const i=await dt();s.innerHTML=At(i)}catch(i){s.innerHTML=`<div style="color:var(--danger);padding:20px;text-align:center;font-size:12px">${m(i.message)}</div>`}};await n(),T=setInterval(n,15e3),x.addEventListener("pagehide",()=>{T&&(clearInterval(T),T=null),x=null}),h("Janela flutuante aberta — fica em cima de qualquer app")}catch(t){console.error("[PiP]",t),h("Não consegui abrir PiP: "+t.message,"err"),Z()}}function Z(){const t=window.open("","usoIA","popup,width=380,height=540,resizable=yes");if(!t){h("Popup bloqueado pelo browser","err");return}t.document.write('<!doctype html><html><head><title>Uso IA</title><meta charset="utf-8"></head><body>Carregando…</body></html>'),h("PiP não suportado neste browser. Abri popup tradicional.","warn"),x=t}function At(t){var g,l,d,p,v,$;const e=t.bot||{},a=Object.entries(e.por_provider||{}).sort((u,f)=>f[1].total_tokens-u[1].total_tokens),s=a.reduce((u,[,f])=>u+f.total_tokens,0)||1,n=(e.ultimas_chamadas||[])[0],i=a.slice(0,3).map(([u,f])=>{const I=Math.round(f.total_tokens/s*100),y=u==="groq"?"#F55036":u==="openrouter"?"#4A9EFF":u==="anthropic"?"#C5F82A":"#A0A0A0";return`
      <div style="font-size:11px;display:flex;justify-content:space-between;color:${y}">
        <span>${m(u)}</span><span style="color:var(--text-3)">${c(f.total_tokens)}</span>
      </div>
      <div class="pip-prov-bar"><div class="pip-prov-fill" style="width:${I}%;background:${y}"></div></div>
    `}).join("");return`
    <div class="pip-head">
      <span class="pip-dot"></span>
      <span class="pip-h">Uso IA · ao vivo</span>
    </div>

    <div class="pip-row">
      <div class="pip-card">
        <div class="pip-label">Hoje</div>
        <div class="pip-value" style="color:var(--accent)">${c((g=e.hoje)==null?void 0:g.total_tokens)}</div>
        <div class="pip-sub">${((l=e.hoje)==null?void 0:l.chamadas)||0} chamadas · ${b((d=e.hoje)==null?void 0:d.custo_usd)}</div>
      </div>
      <div class="pip-card">
        <div class="pip-label">Mês</div>
        <div class="pip-value">${c((p=e.mes)==null?void 0:p.total_tokens)}</div>
        <div class="pip-sub">${b((v=e.mes)==null?void 0:v.custo_usd)} · ${nt(($=e.mes)==null?void 0:$.custo_usd)}</div>
      </div>
    </div>

    <div class="pip-card">
      <div class="pip-label" style="margin-bottom:8px">Providers (mês)</div>
      ${i||'<div style="font-size:11px;color:var(--text-3)">Sem dados ainda</div>'}
    </div>

    <div class="pip-card">
      <div class="pip-label">Última chamada</div>
      ${n?`
        <div class="pip-last-row">
          <span>${m(n.provider)}</span>
          <span style="color:var(--text-3)">${m(rt(n.quando))}</span>
        </div>
        <div class="pip-last-row" style="border:0;padding:0">
          <span style="color:var(--text-2);font-size:11px">${m(n.origem||"—")}</span>
          <span style="color:var(--accent);font-size:11px">${c(n.tokens)} tok</span>
        </div>
      `:'<div style="font-size:11px;color:var(--text-3)">Nenhuma chamada ainda</div>'}
    </div>

    <div style="font-size:10px;color:var(--text-3);text-align:center;margin-top:8px">atualiza a cada 15s</div>
  `}async function St(){const t=document.getElementById("content");t.dataset.usoInit||(t.innerHTML='<div class="empty">Carregando uso em tempo real…</div>',t.dataset.usoInit="1");async function e(){var a,s,n,i,g,l,d,p;try{const v=await dt();t.innerHTML=kt(v);const $=Number(((s=(a=v.anthropic)==null?void 0:a.janela_5h)==null?void 0:s.total_tokens)||0);yt($),wt(Number(((i=(n=v.bot)==null?void 0:n.mes)==null?void 0:i.custo_usd)||0)),(g=t.querySelector("#uso-pip"))==null||g.addEventListener("click",_t),(l=t.querySelector("#uso-test-beep"))==null||l.addEventListener("click",()=>{H("urgente"),h("Som de alerta — é assim que você vai escutar ao atingir 80%")}),(d=t.querySelector("#uso-limit-5h-save"))==null||d.addEventListener("click",()=>{const u=Number(document.getElementById("uso-limit-5h").value);if(u<0)return h("Limite inválido","err");mt(u),h(`Limite da janela 5h salvo: ${c(u)} tokens. Alertas reiniciados.`),e()}),(p=t.querySelector("#uso-budget-save"))==null||p.addEventListener("click",()=>{const u=Number(document.getElementById("uso-budget").value);if(u<0)return h("Teto inválido","err");vt(u),h(`Teto mensal salvo: ${b(u)}. Alertas reiniciados.`),e()})}catch(v){t.innerHTML=`<div class="empty">Erro ao carregar: ${m(v.message)}</div>`}}"Notification"in window&&Notification.permission==="default"&&setTimeout(()=>Notification.requestPermission().catch(()=>{}),2e3),await e(),A&&clearInterval(A),A=setInterval(()=>{if(document.body.dataset.view!=="uso"){clearInterval(A),A=null;return}e()},3e4)}export{St as render};
