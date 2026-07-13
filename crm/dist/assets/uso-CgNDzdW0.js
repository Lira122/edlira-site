import{t as f,k as vt}from"./index-BK0w4YyH.js";const xt="https://flzpblpegoqjxaacjvhf.supabase.co";let S=null,x=null,L=null;const st="uso_limit_5h_tokens",it="uso_budget_mes_usd",H="uso_alerted_5h",F="uso_alerted_mes",q=[.5,.7,.8,.9,.95,1],ht=5e5;function nt(){const t=Number(localStorage.getItem(st)||"0");return t>0?t:ht}function ft(t){localStorage.setItem(st,String(Math.max(0,Number(t)||0))),localStorage.setItem(H,JSON.stringify([]))}function rt(){const t=Number(localStorage.getItem(it)||"0");return t>0?t:50}function bt(t){localStorage.setItem(it,String(Math.max(0,Number(t)||0))),localStorage.setItem(F,JSON.stringify({mes:O(),t:[]}))}function O(){const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}function dt(){try{return JSON.parse(localStorage.getItem(H)||"[]")}catch{return[]}}function lt(t){localStorage.setItem(H,JSON.stringify(t))}function yt(){try{const t=JSON.parse(localStorage.getItem(F)||"{}");return t.mes!==O()?[]:t.t||[]}catch{return[]}}function wt(t){localStorage.setItem(F,JSON.stringify({mes:O(),t}))}function I(t="aviso"){try{const e=new(window.AudioContext||window.webkitAudioContext),a=t==="urgente"?880:523,i=.18,s=.18,n=t==="urgente"?3:2;for(let p=0;p<n;p++){const l=e.createOscillator(),d=e.createGain();l.type="sine",l.frequency.value=a,l.connect(d),d.connect(e.destination);const c=e.currentTime+p*(s+.08);d.gain.setValueAtTime(0,c),d.gain.linearRampToValueAtTime(i,c+.02),d.gain.linearRampToValueAtTime(0,c+s),l.start(c),l.stop(c+s)}setTimeout(()=>e.close().catch(()=>{}),n*400)}catch(e){console.warn("[beep] falhou:",e)}}function R(t,e){"Notification"in window&&(Notification.permission==="granted"?new Notification(t,{body:e,icon:"/assets/favicon-192.png"}):Notification.permission!=="denied"&&Notification.requestPermission().then(a=>{a==="granted"&&new Notification(t,{body:e,icon:"/assets/favicon-192.png"})}))}function $t(t){const e=nt();if(e<=0)return null;const a=t/e;let i=dt();i=i.filter(n=>a>=n);const s=q.filter(n=>a>=n&&!i.includes(n));if(s.length){const n=Math.max(...s),p=n>=.8?"urgente":"aviso",l=Math.round(n*100),d=p==="urgente"?`🚨 Janela 5h em ${l}% do limite do Claude`:`⚠️ Janela 5h em ${l}% do limite`,c=`${t.toLocaleString("pt-BR")} de ${e.toLocaleString("pt-BR")} tokens consumidos nas últimas 5 horas.`;I(p),R(d,c),f(`${d} — ${c}`,"warn"),i=[...i,...s]}return lt(i),{pct:a,limit:e,tokens:t}}function kt(t){const e=rt();if(e<=0)return null;const a=t/e,i=yt(),s=q.filter(v=>a>=v&&!i.includes(v));if(!s.length)return{pct:a,budget:e};const n=Math.max(...s),p=n>=.8?"urgente":"aviso",l=Math.round(n*100),d=p==="urgente"?`🚨 Custo mensal em ${l}% do teto`:`⚠️ Custo mensal em ${l}% do teto`,c=`Você gastou $${t.toFixed(2)} de $${e.toFixed(2)} este mês.`;return I(p),R(d,c),f(`${d} — ${c}`,"warn"),wt([...i,...s]),{pct:a,budget:e}}const g=t=>String(t??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);function u(t){const e=Number(t||0);return e>=1e6?(e/1e6).toFixed(2)+"M":e>=1e3?(e/1e3).toFixed(1)+"k":String(Math.round(e))}function w(t){const e=Number(t||0);return e<.01?"$"+e.toFixed(4):"$"+e.toFixed(2)}function pt(t,e=5.6){return"R$ "+(Number(t||0)*e).toFixed(2)}function _t(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);if(e<60)return`${e}s atrás`;const a=Math.floor(e/60);if(a<60)return`${a}min atrás`;const i=Math.floor(a/60);return i<24?`${i}h atrás`:new Date(t).toLocaleString("pt-BR")}function ct(t){return t?new Date(t).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):""}function zt(t){if(!t)return"—";const e=new Date(t).getTime()-Date.now();if(e<=0)return"agora";const a=Math.floor(e/6e4);if(a<60)return`${a}min`;const i=Math.floor(a/60),s=a%60;return s?`${i}h ${s}min`:`${i}h`}function At(t){const e=t/100;let a=dt();a=a.filter(s=>e>=s);const i=q.filter(s=>e>=s&&!a.includes(s));if(i.length){const s=Math.max(...i),n=s>=.8?"urgente":"aviso",p=Math.round(s*100),l=n==="urgente"?`🚨 Janela 5h do Claude em ${p}%`:`⚠️ Janela 5h em ${p}%`,d=`${t}% da sessão atual já foi consumido.`;I(n),R(l,d),f(`${l} — ${d}`,"warn"),a=[...a,...i]}lt(a)}async function ut(){var i;const{data:t}=await vt.auth.getSession(),e=(i=t==null?void 0:t.session)==null?void 0:i.access_token,a=await fetch(`${xt}/functions/v1/usage-stats`,{method:"POST",headers:{"Content-Type":"application/json",...e?{Authorization:`Bearer ${e}`}:{}},body:"{}"});if(!a.ok)throw new Error(`HTTP ${a.status}`);return a.json()}function St(t){var J,U,K,V,G,Y,Q,W,X,Z,tt,et,at;const e=t.bot||{},a=t.anthropic||{},s=[{label:"Tokens HOJE",v:u((J=e.hoje)==null?void 0:J.total_tokens),sub:`${((U=e.hoje)==null?void 0:U.chamadas)||0} chamadas`,cor:"var(--accent)"},{label:"7 DIAS",v:u((K=e.sete_dias)==null?void 0:K.total_tokens),sub:`${((V=e.sete_dias)==null?void 0:V.chamadas)||0} chamadas`,cor:"var(--info)"},{label:"NO MÊS",v:u((G=e.mes)==null?void 0:G.total_tokens),sub:`${((Y=e.mes)==null?void 0:Y.chamadas)||0} chamadas`,cor:"#A78BFA"},{label:"CUSTO MÊS",v:w((Q=e.mes)==null?void 0:Q.custo_usd),sub:pt((W=e.mes)==null?void 0:W.custo_usd),cor:"var(--ok)"}].map(o=>`
    <div class="sc" style="border-left:3px solid ${o.cor}">
      <div class="sl">${g(o.label)}</div>
      <div class="sv">${g(o.v)}</div>
      <div class="ss">${g(o.sub)}</div>
    </div>`).join(""),n=Object.entries(e.por_provider||{}).sort((o,r)=>r[1].total_tokens-o[1].total_tokens),p=n.reduce((o,[,r])=>o+r.total_tokens,0)||1,l=n.length?n.map(([o,r])=>{const y=Math.round(r.total_tokens/p*100),$=o==="groq"?"#F55036":o==="openrouter"?"#4A9EFF":o==="anthropic"?"#C5F82A":"#A0A0A0";return`
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px">
          <span style="font-weight:500;color:${$}">${g(o)}</span>
          <span style="color:var(--text-3);font-size:12px">${u(r.total_tokens)} tokens · ${w(r.custo_usd)} · ${r.chamadas} chamadas</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${y}%;background:${$};transition:width .3s"></div>
        </div>
      </div>`}).join(""):'<div class="empty" style="padding:30px">Nenhum uso registrado ainda. Quando o bot fizer chamadas de IA, vai aparecer aqui em tempo real.</div>',d=Object.entries(e.por_modelo||{}).sort((o,r)=>r[1].total_tokens-o[1].total_tokens).slice(0,8),c=d.length?`
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
            <td style="padding:8px;font-family:ui-monospace,monospace;font-size:11px">${g(o)}</td>
            <td style="padding:8px;text-align:right">${u(r.total_tokens)}</td>
            <td style="padding:8px;text-align:right;color:var(--ok)">${w(r.custo_usd)}</td>
            <td style="padding:8px;text-align:right;color:var(--text-3)">${r.chamadas}</td>
          </tr>`).join("")}
      </tbody>
    </table>`:"",v=Object.entries(e.por_dia||{}).sort(),_=Math.max(1,...v.map(([,o])=>o.total_tokens)),m=v.length?`
    <div style="display:flex;align-items:flex-end;gap:6px;height:80px;padding:8px 0;border-bottom:1px solid var(--line);margin-bottom:8px">
      ${v.map(([o,r])=>{const y=Math.max(2,Math.round(r.total_tokens/_*70));return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0">
          <div style="font-size:9px;color:var(--text-3)">${u(r.total_tokens)}</div>
          <div style="width:100%;height:${y}px;background:linear-gradient(to top,var(--accent),rgba(197,248,42,.3));border-radius:2px"></div>
          <div style="font-size:10px;color:var(--text-3)">${o.slice(5)}</div>
        </div>`}).join("")}
    </div>`:'<div class="empty" style="padding:30px">Sem dados nos últimos 7 dias.</div>',b=e.ultimas_chamadas||[],N=b.length?`
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
        ${b.map(o=>`
          <tr style="border-top:1px solid var(--line)">
            <td style="padding:8px;color:var(--text-3)">${g(ct(o.quando))}</td>
            <td style="padding:8px">${g(o.provider)} ${o.sucesso?"":'<span style="color:var(--danger)">✗</span>'}</td>
            <td style="padding:8px;color:var(--text-2)">${g(o.origem||"—")}</td>
            <td style="padding:8px;text-align:right">${u(o.tokens)}</td>
            <td style="padding:8px;text-align:right;color:var(--ok)">${w(o.custo)}</td>
            <td style="padding:8px;text-align:right;color:var(--text-3)">${o.latencia||"—"}ms</td>
          </tr>`).join("")}
      </tbody>
    </table>`:'<div class="empty" style="padding:30px">Sem chamadas recentes.</div>';let k="";if(!a.configurado)k=`
      <div class="tw" style="margin-top:22px;padding:24px;background:rgba(197,248,42,.04);border:1px dashed rgba(197,248,42,.2)">
        <div style="font-size:14px;font-weight:500;margin-bottom:6px;color:var(--accent)">📡 Conta Anthropic não conectada</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6">
          Pra ver uso da SUA conta Anthropic (Claude Code etc) em tempo real, gera uma Admin API Key em
          <a href="https://console.anthropic.com/settings/admin-keys" target="_blank" style="color:var(--accent)">console.anthropic.com/settings/admin-keys</a>
          e adiciona como secret <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">ANTHROPIC_ADMIN_KEY</code> nas
          <a href="https://supabase.com/dashboard/project/flzpblpegoqjxaacjvhf/functions/secrets" target="_blank" style="color:var(--accent)">Edge Functions Secrets</a>.
        </div>
      </div>`;else if(a.erro)k=`
      <div class="tw" style="margin-top:22px;padding:24px;border-left:3px solid var(--danger)">
        <div style="font-size:14px;font-weight:500;margin-bottom:6px;color:var(--danger)">Erro lendo Anthropic Admin API</div>
        <div style="font-size:12px;color:var(--text-3);font-family:ui-monospace,monospace">${g(a.erro)}</div>
      </div>`;else{const o=a.hoje||{},r=a.mes||{},y=Object.entries(r.por_modelo||{}).sort(($,z)=>z[1].total_tokens-$[1].total_tokens);k=`
      <div style="margin-top:30px;margin-bottom:14px;font-size:13px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em">Conta Anthropic (Claude direto)</div>
      <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
        <div class="sc"><div class="sl">Hoje</div><div class="sv">${u(o.total_tokens)}</div><div class="ss">${o.chamadas||0} chamadas</div></div>
        <div class="sc"><div class="sl">Este Mês</div><div class="sv">${u(r.total_tokens)}</div><div class="ss">${r.chamadas||0} chamadas</div></div>
        <div class="sc"><div class="sl">Modelos ativos</div><div class="sv">${y.length}</div><div class="ss">no mês</div></div>
      </div>
      ${y.length?`
        <div class="tw" style="padding:14px 18px">
          <table style="width:100%;font-size:12px">
            <thead><tr style="color:var(--text-3);font-size:10px;text-transform:uppercase">
              <th style="text-align:left;padding:6px 8px">Modelo</th>
              <th style="text-align:right;padding:6px 8px">Tokens (mês)</th>
              <th style="text-align:right;padding:6px 8px">Chamadas</th>
            </tr></thead>
            <tbody>
              ${y.map(([$,z])=>`
                <tr style="border-top:1px solid var(--line)">
                  <td style="padding:8px;font-family:ui-monospace,monospace;font-size:11px">${g($)}</td>
                  <td style="padding:8px;text-align:right">${u(z.total_tokens)}</td>
                  <td style="padding:8px;text-align:right;color:var(--text-3)">${z.chamadas}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`:""}`}const h=t.claude_consumer||{};let M="";if(h.conectado&&!h.stale&&h.sessao_pct!=null){const o=Math.round(h.sessao_pct),r=o>=80?"var(--danger)":o>=50?"var(--warn)":"var(--ok)",y=h.sessao_reseta_em?zt(h.sessao_reseta_em):"—",$=h.semana_pct!=null?`<span style="color:var(--text-3);font-size:11px">· Semana: <strong style="color:var(--text-2)">${Math.round(h.semana_pct)}%</strong></span>`:"",z=h.opus_pct!=null?`<span style="color:var(--text-3);font-size:11px">· Opus: <strong style="color:var(--text-2)">${Math.round(h.opus_pct)}%</strong></span>`:"";M=`
      <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid ${r};background:${o>=80?"rgba(255,92,92,.05)":"transparent"}">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:4px">🚦 Janela 5h do Claude · ${g(h.plano||"plano")}</div>
            <div style="font-size:13px;color:var(--text-2)">Dados reais do claude.ai (via extensão) · atualiza a cada 5min</div>
          </div>
          <div style="font-size:12px;color:var(--text-3)">Reinicia em <strong style="color:${r}">${g(y)}</strong></div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px;margin-bottom:8px">
          <span style="color:${r};font-weight:600;font-size:24px">${o}% <span style="font-size:13px;color:var(--text-3);font-weight:400">da sessão atual</span></span>
          <span>${$} ${z}</span>
        </div>
        <div style="height:10px;background:rgba(255,255,255,.04);border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${o}%;background:${r};transition:width .4s,background .4s"></div>
        </div>
      </div>`,At(o)}else h.conectado&&h.stale?M=`
      <div class="tw" style="padding:14px 18px;margin-bottom:14px;border-left:3px solid var(--warn)">
        <div style="font-size:13px;color:var(--warn);font-weight:500">⚠️ Extensão conectou mas tá sem atualizar há mais de 30 minutos</div>
        <div style="font-size:12px;color:var(--text-3);margin-top:4px">Abre o claude.ai pra reativar a sessão da extensão, ou clica no ícone dela e em "Sincronizar agora".</div>
      </div>`:M=`
      <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid var(--text-3);background:rgba(197,248,42,.04)">
        <div style="font-size:13px;font-weight:600;margin-bottom:6px;color:var(--accent)">🚦 Janela 5h do Claude — extensão não conectada</div>
        <div style="font-size:13px;color:var(--text-2);line-height:1.6">
          Pra ver os 23% da sessão e quanto falta pro reset (como no painel do claude.ai), instale a extensão <strong>Eleva · Claude Usage Monitor</strong> no Chrome.
          <br><span style="color:var(--text-3);font-size:12px">A extensão fica na pasta <code style="background:rgba(255,255,255,.05);padding:1px 5px;border-radius:3px;font-family:ui-monospace,monospace">/extensao-claude-usage</code> do projeto.</span>
        </div>
      </div>`;const D=Number(((X=a.janela_5h)==null?void 0:X.total_tokens)||0),T=nt(),A=T>0?Math.min(100,Math.round(D/T*100)):0,E=A>=80?"var(--danger)":A>=50?"var(--warn)":"var(--ok)",gt=a.configurado&&!a.erro?`
    <div class="tw" style="padding:18px;margin-bottom:14px;border-left:4px solid ${E};background:${A>=80?"rgba(255,92,92,.05)":"transparent"}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;font-weight:600;margin-bottom:4px">🚦 Janela 5h do Claude (rate limit rolante)</div>
          <div style="font-size:13px;color:var(--text-2)">A Anthropic limita uso numa janela de 5 horas. Quando atravessar 80%, você ouve um alerta.</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:12px">
          <span style="color:var(--text-3)">Limite (tokens):</span>
          <input type="number" id="uso-limit-5h" value="${T}" min="0" step="50000" style="background:var(--bg-input);border:1px solid var(--line);color:var(--text);padding:5px 10px;border-radius:6px;width:120px;font-size:13px;font-family:inherit">
          <button class="btn bg bsm" id="uso-limit-5h-save">Salvar</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:13px;margin-bottom:8px">
        <span style="color:${E};font-weight:600;font-size:20px">${u(D)} / ${u(T)} <span style="font-size:13px;color:var(--text-3);font-weight:400">tokens (${A}%)</span></span>
        <span style="color:var(--text-3);font-size:11px">Atualiza em tempo real conforme tokens saem da janela</span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,.04);border-radius:5px;overflow:hidden">
        <div style="height:100%;width:${A}%;background:${E};transition:width .4s,background .4s"></div>
      </div>
      <div style="display:flex;gap:14px;margin-top:10px;font-size:11px;color:var(--text-3)">
        <span>Chamadas na janela: <strong style="color:var(--text-2)">${((Z=a.janela_5h)==null?void 0:Z.chamadas)||0}</strong></span>
        <span>Input: <strong style="color:var(--text-2)">${u((tt=a.janela_5h)==null?void 0:tt.input_tokens)}</strong></span>
        <span>Output: <strong style="color:var(--text-2)">${u((et=a.janela_5h)==null?void 0:et.output_tokens)}</strong></span>
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
    </div>`,j=rt(),B=Number(((at=e.mes)==null?void 0:at.custo_usd)||0),C=j>0?Math.min(100,Math.round(B/j*100)):0,P=C>=80?"var(--danger)":C>=50?"var(--warn)":"var(--ok)",mt=`
    <div class="tw" style="padding:14px 16px;margin-bottom:18px;border-left:3px solid ${P}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:10px">
        <div style="font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;font-weight:600">Custo mensal (bot Groq/OpenRouter)</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px">
          <span style="color:var(--text-3)">Teto US$</span>
          <input type="number" id="uso-budget" value="${j}" min="0" step="5" style="background:var(--bg-input);border:1px solid var(--line);color:var(--text);padding:4px 8px;border-radius:6px;width:70px;font-size:12px;font-family:inherit">
          <button class="btn bg bsm" id="uso-budget-save">Salvar</button>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
        <span style="color:${P};font-weight:500">${w(B)} / ${w(j)} (${C}%)</span>
      </div>
      <div style="height:5px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${C}%;background:${P};transition:width .3s,background .3s"></div>
      </div>
    </div>`;return`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px">
      <div style="font-size:13px;color:var(--text-3);display:flex;align-items:center;gap:8px">
        <span class="uso-dot" style="width:8px;height:8px;border-radius:50%;background:var(--ok);box-shadow:0 0 0 4px rgba(52,211,153,.15);animation:uso-pulse 2s infinite"></span>
        Atualiza sozinho a cada 30s · última leitura ${g(_t(t.gerado_em))}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn bg bsm" id="uso-test-beep" title="Tocar o som de alerta pra você ouvir como é">🔔 Testar alerta</button>
        <button class="btn bp" id="uso-pip" title="Abrir janela flutuante que segue você fora do CRM">📺 Abrir flutuante (PiP)</button>
      </div>
    </div>

    ${M}
    ${gt}
    ${mt}

    <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">${s}</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px">
      <div class="tw" style="padding:18px">
        <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;font-weight:600">Por provider (mês)</div>
        ${l}
      </div>
      <div class="tw" style="padding:18px">
        <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px;font-weight:600">Últimos 7 dias</div>
        ${m}
      </div>
    </div>

    <div class="tw" style="padding:18px;margin-bottom:22px">
      <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:600">Top modelos (mês)</div>
      ${c||'<div class="empty" style="padding:14px">Sem dados ainda.</div>'}
    </div>

    <div class="tw" style="padding:18px">
      <div style="font-size:12px;color:var(--text-3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;font-weight:600">Últimas chamadas</div>
      ${N}
    </div>

    ${k}

    <style>
      @keyframes uso-pulse {
        0%, 100% { box-shadow: 0 0 0 4px rgba(52,211,153,.15); }
        50%      { box-shadow: 0 0 0 8px rgba(52,211,153,.05); }
      }
    </style>
  `}async function Mt(){if(!("documentPictureInPicture"in window)){ot();return}try{if(x&&!x.closed){x.focus();return}x=await window.documentPictureInPicture.requestWindow({width:380,height:540});const t=x.document.createElement("link");t.rel="stylesheet";const e=[...document.styleSheets].find(n=>n.href&&n.href.includes("assets"));e!=null&&e.href&&(t.href=e.href,x.document.head.appendChild(t));const a=x.document.createElement("style");a.textContent=`
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
    `,x.document.head.appendChild(a);const i=x.document.createElement("div");i.id="pip-root",x.document.body.appendChild(i),x.document.title="Uso IA · ao vivo";const s=async()=>{try{const n=await ut();i.innerHTML=Tt(n)}catch(n){i.innerHTML=`<div style="color:var(--danger);padding:20px;text-align:center;font-size:12px">${g(n.message)}</div>`}};await s(),L=setInterval(s,15e3),x.addEventListener("pagehide",()=>{L&&(clearInterval(L),L=null),x=null}),f("Janela flutuante aberta — fica em cima de qualquer app")}catch(t){console.error("[PiP]",t),f("Não consegui abrir PiP: "+t.message,"err"),ot()}}function ot(){const t=window.open("","usoIA","popup,width=380,height=540,resizable=yes");if(!t){f("Popup bloqueado pelo browser","err");return}t.document.write('<!doctype html><html><head><title>Uso IA</title><meta charset="utf-8"></head><body>Carregando…</body></html>'),f("PiP não suportado neste browser. Abri popup tradicional.","warn"),x=t}function Tt(t){var p,l,d,c,v,_;const e=t.bot||{},a=Object.entries(e.por_provider||{}).sort((m,b)=>b[1].total_tokens-m[1].total_tokens),i=a.reduce((m,[,b])=>m+b.total_tokens,0)||1,s=(e.ultimas_chamadas||[])[0],n=a.slice(0,3).map(([m,b])=>{const N=Math.round(b.total_tokens/i*100),k=m==="groq"?"#F55036":m==="openrouter"?"#4A9EFF":m==="anthropic"?"#C5F82A":"#A0A0A0";return`
      <div style="font-size:11px;display:flex;justify-content:space-between;color:${k}">
        <span>${g(m)}</span><span style="color:var(--text-3)">${u(b.total_tokens)}</span>
      </div>
      <div class="pip-prov-bar"><div class="pip-prov-fill" style="width:${N}%;background:${k}"></div></div>
    `}).join("");return`
    <div class="pip-head">
      <span class="pip-dot"></span>
      <span class="pip-h">Uso IA · ao vivo</span>
    </div>

    <div class="pip-row">
      <div class="pip-card">
        <div class="pip-label">Hoje</div>
        <div class="pip-value" style="color:var(--accent)">${u((p=e.hoje)==null?void 0:p.total_tokens)}</div>
        <div class="pip-sub">${((l=e.hoje)==null?void 0:l.chamadas)||0} chamadas · ${w((d=e.hoje)==null?void 0:d.custo_usd)}</div>
      </div>
      <div class="pip-card">
        <div class="pip-label">Mês</div>
        <div class="pip-value">${u((c=e.mes)==null?void 0:c.total_tokens)}</div>
        <div class="pip-sub">${w((v=e.mes)==null?void 0:v.custo_usd)} · ${pt((_=e.mes)==null?void 0:_.custo_usd)}</div>
      </div>
    </div>

    <div class="pip-card">
      <div class="pip-label" style="margin-bottom:8px">Providers (mês)</div>
      ${n||'<div style="font-size:11px;color:var(--text-3)">Sem dados ainda</div>'}
    </div>

    <div class="pip-card">
      <div class="pip-label">Última chamada</div>
      ${s?`
        <div class="pip-last-row">
          <span>${g(s.provider)}</span>
          <span style="color:var(--text-3)">${g(ct(s.quando))}</span>
        </div>
        <div class="pip-last-row" style="border:0;padding:0">
          <span style="color:var(--text-2);font-size:11px">${g(s.origem||"—")}</span>
          <span style="color:var(--accent);font-size:11px">${u(s.tokens)} tok</span>
        </div>
      `:'<div style="font-size:11px;color:var(--text-3)">Nenhuma chamada ainda</div>'}
    </div>

    <div style="font-size:10px;color:var(--text-3);text-align:center;margin-top:8px">atualiza a cada 15s</div>
  `}async function Ct(){const t=document.getElementById("content");t.dataset.usoInit||(t.innerHTML='<div class="empty">Carregando uso em tempo real…</div>',t.dataset.usoInit="1");async function e(){var a,i,s,n,p,l,d,c;try{const v=await ut();t.innerHTML=St(v);const _=Number(((i=(a=v.anthropic)==null?void 0:a.janela_5h)==null?void 0:i.total_tokens)||0);$t(_),kt(Number(((n=(s=v.bot)==null?void 0:s.mes)==null?void 0:n.custo_usd)||0)),(p=t.querySelector("#uso-pip"))==null||p.addEventListener("click",Mt),(l=t.querySelector("#uso-test-beep"))==null||l.addEventListener("click",()=>{I("urgente"),f("Som de alerta — é assim que você vai escutar ao atingir 80%")}),(d=t.querySelector("#uso-limit-5h-save"))==null||d.addEventListener("click",()=>{const m=Number(document.getElementById("uso-limit-5h").value);if(m<0)return f("Limite inválido","err");ft(m),f(`Limite da janela 5h salvo: ${u(m)} tokens. Alertas reiniciados.`),e()}),(c=t.querySelector("#uso-budget-save"))==null||c.addEventListener("click",()=>{const m=Number(document.getElementById("uso-budget").value);if(m<0)return f("Teto inválido","err");bt(m),f(`Teto mensal salvo: ${w(m)}. Alertas reiniciados.`),e()})}catch(v){t.innerHTML=`<div class="empty">Erro ao carregar: ${g(v.message)}</div>`}}"Notification"in window&&Notification.permission==="default"&&setTimeout(()=>Notification.requestPermission().catch(()=>{}),2e3),await e(),S&&clearInterval(S),S=setInterval(()=>{if(document.body.dataset.view!=="uso"){clearInterval(S),S=null;return}e()},3e4)}export{Ct as render};
