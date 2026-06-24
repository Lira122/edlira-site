import{d as k,t as h,c as g,o as bt,f as O,M as ft,h as Ft,j as It}from"./index-BAUz8lNF.js";let x=null,v=[],M=[],vt=[],at=null,l={metaId:null,meses:60,taxa:14.25,fases:[{inicio:0,aporte:2e3}]};const st=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],dt=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],Bt=360*60*1e3;let E={open:!1,msgs:[],loading:!1};async function w(){var a;const t=document.getElementById("content");if(t.innerHTML='<div class="empty">Carregando…</div>',await qt(),await ot(),jt(),!l.metaId||!v.find(o=>o.id===l.metaId)){const o=v.find(n=>n.principal)||v[0];l.metaId=(o==null?void 0:o.id)||null}(a=l.fases)!=null&&a.length||(l.fases=[{inicio:0,aporte:2e3}]),l.fases[0].aporte=Math.max(l.fases[0].aporte,N()),l.taxa=Number(x.selic_aa)||14.25,t.innerHTML=Ht(),te(t),yt(t);const e=t.querySelector(".lib-sim-chart");e&&kt(e)}async function qt(){const[t,e,a,o,n,i,r,s,c]=await Promise.all([k.from("config_fin").select("*").eq("id","main").maybeSingle(),k.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),k.from("aportes_fin").select("*").order("data",{ascending:!1}),k.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),k.from("despesas").select("*").order("data",{ascending:!1}),k.from("despesas_recorrentes").select("*").order("criado_em",{ascending:!1}),k.from("receitas_recorrentes").select("*").order("criado_em",{ascending:!1}),k.from("caixinhas").select("*").eq("ativa",!0).order("ordem"),k.from("caixinhas_mov").select("*").order("data",{ascending:!1})]);t.error&&h("config_fin: "+t.error.message,"err"),e.error&&h("metas_fin: "+e.error.message,"err"),a.error&&h("aportes_fin: "+a.error.message,"err"),x=t.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},v=e.data||[],M=a.data||[],vt=o.data||[],n&&!n.error&&n.data,i&&!i.error&&i.data,r&&!r.error&&r.data,s&&!s.error&&s.data,c&&!c.error&&c.data}async function ot({manual:t=!1}={}){var e;try{const a=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!a.ok)return t&&h("BCB respondeu "+a.status,"err"),!1;const o=await a.json(),n=Number((e=o==null?void 0:o[0])==null?void 0:e.valor);if(!isFinite(n)||n<=0)return t&&h("Resposta inválida do BCB","err"),!1;const i=Number(x.selic_aa),r=Math.abs(n-i)>.01,s=new Date().toISOString();return x.selic_aa=n,x.atualizado_em=s,await k.from("config_fin").upsert({id:"main",selic_aa:n,atualizado_em:s}),r?h(`Selic atualizada: ${n.toFixed(2)}% a.a.`):t&&h(`Selic confirmada: ${n.toFixed(2)}% a.a.`),Ct(),!0}catch{return t&&h("Sem conexão com o BCB","err"),!1}}function jt(){at&&clearInterval(at),at=setInterval(()=>{ot()},Bt)}function Ct(){const t=document.querySelector(".lib-chip-selic");t&&(t.innerHTML=ht())}function ht(){const t=Number(x.selic_aa).toFixed(2),e=x.atualizado_em?Nt(x.atualizado_em):"não verificada";return`<b>Selic</b> ${t}% a.a. <small>BCB · ${e}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function Nt(t){const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"agora":e<3600?`há ${Math.floor(e/60)}min`:e<86400?`há ${Math.floor(e/3600)}h`:e<86400*30?`há ${Math.floor(e/86400)}d`:new Date(t).toLocaleDateString("pt-BR")}function gt(t,e){if(!(t!=null&&t.length))return 0;const a=[...t].sort((n,i)=>n.inicio-i.inicio);let o=0;for(const n of a)n.inicio<=e&&(o=Number(n.aporte)||0);return o}function rt({pv:t,fases:e,taxaAA:a,meses:o}){const n=Math.pow(1+a/100,.08333333333333333)-1,i=[];let r=t,s=t;for(let c=0;c<=o;c++){if(c>0){const d=gt(e,c-1);r=r*(1+n)+d,s+=d}i.push({mes:c,saldo:r,aportado:s,juros:r-s})}return i}function U({pv:t,fases:e,taxaAA:a,meta:o}){if(t>=o)return 0;const n=Math.pow(1+a/100,1/12)-1;let i=t,r=0;for(;r<1200;){const s=gt(e,r);if(i=i*(1+n)+s,r++,i>=o)return r;if(s===0&&i<=t*1.0001&&r>12)return null}return null}function $t(t,e){return vt.filter(a=>a.ano===t&&a.mes===e).reduce((a,o)=>a+Number(o.valor||0),0)}function nt(){const t=new Date;let e=0,a=0;for(let o=1;o<=6;o++){const n=new Date(t.getFullYear(),t.getMonth()-o,1),i=$t(n.getFullYear(),n.getMonth()+1);i>0&&(e+=i,a++)}return a?e/a:0}function lt(){const t=new Date;return $t(t.getFullYear(),t.getMonth()+1)}function N(){const t=Number((x==null?void 0:x.aporte_pct_faturamento)||20)/100,e=nt()||lt();return Math.max(0,Math.round(e*t))}function P(t){const e=M.filter(a=>a.meta_id===t.id).reduce((a,o)=>a+Number(o.valor||0),0);return Number(t.valor_inicial||0)+e}function it(t){return M.filter(e=>e.meta_id===t.id)}function Lt(t){const e=new Date().toISOString().slice(0,7);return M.filter(a=>(t?a.meta_id===t:!0)&&(a.data||"").startsWith(e)).reduce((a,o)=>a+Number(o.valor||0),0)}function Rt(t){const e=N()||1;let a=0;const o=new Date;for(let n=0;n<36;n++){const r=new Date(o.getFullYear(),o.getMonth()-n,1).toISOString().slice(0,7),s=M.filter(c=>(t?c.meta_id===t:!0)&&(c.data||"").startsWith(r)).reduce((c,d)=>c+Number(d.valor||0),0);if(s>=e&&s>0)a++;else break}return a}function zt(){const t=v.find(i=>i.principal)||v[0],e=v.find(i=>i.id===l.metaId)||t,a=new Date().toISOString().slice(0,10),o=v.map(i=>{const r=P(i);return{nome:i.nome,alvo:Number(i.valor_alvo),saldo_atual:r,progresso_pct:+(r/Number(i.valor_alvo)*100).toFixed(1),principal:i.principal===!0}}),n=M.slice(0,8).map(i=>{var r;return{data:i.data,valor:Number(i.valor),meta:((r=v.find(s=>s.id===i.meta_id))==null?void 0:r.nome)||null}});return{hoje:a,selic_aa:Number(x.selic_aa),selic_atualizada_em:x.atualizado_em,faturamento:{medio_6m:+nt().toFixed(2),mes_atual:+lt().toFixed(2),pct_alvo_aporte:Number(x.aporte_pct_faturamento),aporte_sugerido_mensal:N()},metas:o,aportes:{total_registrado:n.reduce((i,r)=>i+r.valor,0),total_geral:M.reduce((i,r)=>i+Number(r.valor||0),0),ultimos:n},simulador_atual:{meta_em_foco:e==null?void 0:e.nome,taxa_aa:l.taxa,prazo_meses:l.meses,fases:l.fases}}}async function Dt(t){var s,c,d,m;const e=It.OR_KEY;if(!e)throw new Error("Chave da IA não disponível. Faça login de novo.");const a=zt(),o=`Você é um planejador financeiro pessoal direto, brasileiro, sem firula. Você conversa com o usuário sobre as metas dele dentro do CRM "Eleva Digital". Use linguagem informal, brasileira, tipo amigo que entende de finanças. Pode ser sincero quando os números não fecham.

Seu contexto JSON atualizado AGORA:

\`\`\`json
${JSON.stringify(a,null,2)}
\`\`\`

Regras importantes:
- Valores em **R$** com vírgula (R$ 1.234,56)
- Aporte mensal = valor que o usuário separa todo mês pra investir
- Taxa Selic atual: ${a.selic_aa}% a.a. — use ela como referência de juros conservadores
- Quando o usuário pedir simulação concreta, faça os cálculos de juros compostos mentalmente e responda com números reais
- Quando você quiser **sugerir uma mudança de fases pro simulador** dele, inclua um bloco assim no final da resposta:
\`\`\`apply-fases
[{"inicio": 0, "aporte": 2500}, {"inicio": 6, "aporte": 4000}]
\`\`\`
  Aí aparece um botão "Aplicar" pra ele clicar e adotar no simulador na hora. Use isso quando fizer sentido.
- Não invente dados que não estão no contexto. Se faltar informação, pergunte.
- Respostas curtas e práticas — 2-4 parágrafos no máximo, a não ser que ele peça detalhe.`,n=["anthropic/claude-sonnet-4.6","anthropic/claude-haiku-4.5","meta-llama/llama-3.3-70b-instruct"],i=[{role:"system",content:o},...E.msgs.slice(-10).map(f=>({role:f.role,content:f.content})),{role:"user",content:t}];let r="";for(const f of n){const $=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({model:f,messages:i,max_tokens:800,temperature:.6})});if($.ok){const u=await $.json();return((m=(d=(c=(s=u==null?void 0:u.choices)==null?void 0:s[0])==null?void 0:c.message)==null?void 0:d.content)==null?void 0:m.trim())||"(sem resposta)"}if($.status===404){r=`${f} indisponível`;continue}const y=await $.text().catch(()=>"");throw new Error(`OpenRouter ${$.status}: ${y.slice(0,200)}`)}throw new Error(r||"Nenhum modelo disponível")}async function ut(t){if(!(!t.trim()||E.loading)){E.msgs.push({role:"user",content:t.trim()}),E.loading=!0,V();try{const e=await Dt(t.trim());E.msgs.push({role:"assistant",content:e})}catch(e){E.msgs.push({role:"assistant",content:"⚠️ Erro: "+e.message})}finally{E.loading=!1,V()}}}function V(){var o;const t=document.getElementById("lib-chat");if(!t)return;const e=((o=xt().match(/<div id="lib-chat"[\s\S]*<\/div>/))==null?void 0:o[0])||"";t.outerHTML=e,yt(document.getElementById("content"));const a=document.getElementById("lib-chat-body");a&&(a.scrollTop=a.scrollHeight)}function yt(t){var o,n,i;(o=t.querySelector("#lib-fab"))==null||o.addEventListener("click",()=>{E.open=!0,V(),setTimeout(()=>{var r;return(r=document.getElementById("lib-chat-text"))==null?void 0:r.focus()},250)}),(n=t.querySelector("#lib-chat-close"))==null||n.addEventListener("click",()=>{E.open=!1,V()}),(i=t.querySelector("#lib-chat-clear"))==null||i.addEventListener("click",()=>{confirm("Limpar conversa?")&&(E.msgs=[],V())});const e=t.querySelector("#lib-chat-input"),a=t.querySelector("#lib-chat-text");e==null||e.addEventListener("submit",r=>{r.preventDefault();const s=a.value;a.value="",a.style.height="auto",ut(s)}),a==null||a.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),e.requestSubmit())}),a==null||a.addEventListener("input",()=>{a.style.height="auto",a.style.height=Math.min(140,a.scrollHeight)+"px"}),t.querySelectorAll(".lib-chat-sug-btn").forEach(r=>r.addEventListener("click",()=>ut(r.dataset.sug))),t.querySelectorAll(".lib-chat-apply").forEach(r=>{const s=r.querySelector(".btn");s==null||s.addEventListener("click",()=>{try{const c=JSON.parse(r.dataset.apply);l.fases=c.sort((d,m)=>d.inicio-m.inicio),h("Fases aplicadas no simulador 🎯"),w(),setTimeout(()=>{var d;return(d=document.querySelector(".lib-sim"))==null?void 0:d.scrollIntoView({behavior:"smooth",block:"center"})},100)}catch(c){h("Erro ao aplicar: "+c.message,"err")}})})}function Ht(){const t=v.find(o=>o.principal)||v[0],e=v.filter(o=>o!==t),a=v.find(o=>o.id===l.metaId)||t;return`
  <div class="lib">
    ${t?Gt(t):Wt()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(Yt).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${Qt(a)}
    ${Ut(a)}
    ${Kt()}

    ${Ot()}
    ${xt()}
  </div>`}function Ot(){return`
  <button class="lib-fab" id="lib-fab" title="Conversar com a IA financeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span>IA financeira</span>
    <span class="lib-fab-pulse"></span>
  </button>`}function xt(){if(!E.open)return'<div id="lib-chat" class="lib-chat"></div>';const t=E.msgs.length?E.msgs.map(e=>Pt(e)).join(""):`<div class="lib-chat-empty">
        <div class="lib-chat-empty-ico">💭</div>
        <div class="lib-chat-empty-tit">Viaja na maionese aí</div>
        <div class="lib-chat-empty-sub">Eu sei tudo do seu contexto: faturamento, metas, fases, aportes, caixinhas. Pergunta o que quiser.</div>
        <div class="lib-chat-sug">
          <button class="lib-chat-sug-btn" data-sug="Quanto preciso aportar pra bater 100k em 2 anos?">⚡ Quanto pra 100k em 2 anos?</button>
          <button class="lib-chat-sug-btn" data-sug="Vale mais a pena focar tudo na Liberdade ou dividir com o Macbook?">🎯 Focar ou dividir entre metas?</button>
          <button class="lib-chat-sug-btn" data-sug="Que % do meu faturamento eu deveria estar aportando pra ser realista?">💰 Quanto do faturamento aportar?</button>
          <button class="lib-chat-sug-btn" data-sug="Se eu der R$10k de entrada na minha meta e mantiver o aporte atual, quando bato?">🚀 E se eu der entrada agora?</button>
        </div>
      </div>`;return`
  <div id="lib-chat" class="lib-chat open">
    <div class="lib-chat-head">
      <div class="lib-chat-head-left">
        <div class="lib-chat-avatar">🤖</div>
        <div>
          <div class="lib-chat-title">Planejador IA</div>
          <div class="lib-chat-sub">${E.loading?'<span class="lib-chat-typing">pensando…</span>':"sabe tudo do seu contexto"}</div>
        </div>
      </div>
      <div class="lib-chat-head-acts">
        ${E.msgs.length?'<button class="lib-chat-clear" id="lib-chat-clear" title="Limpar conversa">↻</button>':""}
        <button class="lib-chat-close" id="lib-chat-close" title="Fechar">×</button>
      </div>
    </div>
    <div class="lib-chat-body" id="lib-chat-body">${t}</div>
    <form class="lib-chat-input" id="lib-chat-input">
      <textarea id="lib-chat-text" placeholder="Manda a real... ex: e se eu aumentar pra 5k a partir do mês 6?" rows="1" ${E.loading?"disabled":""}></textarea>
      <button type="submit" class="lib-chat-send" ${E.loading?"disabled":""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  </div>`}function Pt(t){const e=Vt(t.content),a=e?t.content.replace(/```apply-fases[\s\S]*?```/g,"").trim():t.content,o=Tt(a),n=t.role==="user"?"user":"ai";let i="";if(e){const r=e.map(s=>`${s.inicio===0?"Início":`mês ${s.inicio}+`}: ${g(s.aporte)}`).join(" · ");i=`
      <div class="lib-chat-apply" data-apply='${Jt(JSON.stringify(e))}'>
        <div class="lib-chat-apply-info">
          <div class="lib-chat-apply-lbl">💡 Sugestão pro simulador</div>
          <div class="lib-chat-apply-desc">${r}</div>
        </div>
        <button class="btn bp bsm">Aplicar</button>
      </div>`}return`<div class="lib-msg ${n}">
    ${n==="ai"?'<div class="lib-msg-avatar">🤖</div>':""}
    <div class="lib-msg-bubble">
      ${o}
      ${i}
    </div>
  </div>`}function Tt(t){return S(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.+<\/li>\n?)+/g,e=>`<ul>${e}</ul>`).replace(/\n/g,"<br>")}function Jt(t){return String(t).replace(/'/g,"&#39;").replace(/"/g,"&quot;")}function Vt(t){const e=t.match(/```apply-fases\s*([\s\S]*?)```/);if(!e)return null;try{const a=JSON.parse(e[1].trim());return!Array.isArray(a)||!a.every(o=>Number.isFinite(+o.inicio)&&Number.isFinite(+o.aporte))?null:a.map(o=>({inicio:+o.inicio,aporte:+o.aporte}))}catch{return null}}function Wt(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function Gt(t){const e=P(t),a=Number(t.valor_alvo),o=Math.min(100,e/a*100),n=N(),i=Lt(t.id),r=Rt(t.id),s=U({pv:e,fases:[{inicio:0,aporte:n}],taxaAA:Number(x.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${t.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${t.icone||"🎯"}</span> META PRINCIPAL · ${S(t.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${ee(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${g(a)}</strong>
        · ${o.toFixed(1)}% do caminho
        ${s!=null?` · faltam <strong>${s}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${o.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${ht()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${g(n)}/mês <small>(${Number(x.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${g(i)} ${i>=n?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${r} ${r===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${Xt(o,t.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${t.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${t.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function Yt(t){const e=P(t),a=Number(t.valor_alvo),o=Math.min(100,e/a*100),n=t.cor||"#C5F82A",i=N(),r=U({pv:e,fases:[{inicio:0,aporte:i}],taxaAA:Number(x.selic_aa),meta:a}),s=e>=a;return`
  <div class="lib-meta-card${s?" done":""}" style="--meta-color:${n}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${Et(n,.14)};color:${n}">${t.icone||"🎯"}</div>
      <div class="lib-meta-name">${S(t.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${t.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${g(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${g(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${o.toFixed(2)}%;background:${n}"></div></div>
    <div class="lib-meta-foot">
      <span>${o.toFixed(0)}%</span>
      ${s?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${r!=null?`${r}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${t.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${t.id}">Simular</button>
    </div>
  </div>`}function Qt(t){if(!t)return"";const e=P(t),a=Number(t.valor_alvo),o=rt({pv:e,fases:l.fases,taxaAA:l.taxa,meses:l.meses}),n=o[o.length-1];n.aportado;const i=n.juros,r=U({pv:e,fases:l.fases,taxaAA:l.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${g(e)}</div>
      <div class="lib-stat-sub">${it(t).length} aporte${it(t).length===1?"":"s"} registrado${it(t).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${g(nt())}</div>
      <div class="lib-stat-sub">Mês atual: ${g(lt())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${l.meses}m</div>
      <div class="lib-stat-val ac">${g(n.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${g(i)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${g(Math.max(0,a-e))}</div>
      <div class="lib-stat-sub">${r!=null?`Bate em ${X(r)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function Ut(t){if(!t)return"";const e=P(t),a=Number(t.valor_alvo),o=rt({pv:e,fases:l.fases,taxaAA:l.taxa,meses:l.meses}),n=N()||1e3,i=l.fases.map((r,s)=>`
    <div class="lib-fase" data-fase-idx="${s}">
      <div class="lib-fase-when">
        ${s===0?'<span class="lib-fase-tag">Início</span>':`<input type="number" class="lib-fase-inicio" min="1" max="${l.meses}" step="1" value="${r.inicio}"> <small>em diante</small>`}
      </div>
      <div class="lib-fase-val">
        <input type="number" class="lib-fase-aporte" min="0" step="100" value="${r.aporte}"> <small>R$/mês</small>
      </div>
      ${s>0?'<button class="lib-fase-del" title="Remover fase">×</button>':""}
    </div>
  `).join("");return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${S(t.nome)}</strong>
          ${v.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${v.map(r=>`<option value="${r.id}"${r.id===t.id?" selected":""}>${r.icone||"🎯"} ${S(r.nome)}</option>`).join("")}
            </select>
          `:""}
        </div>
      </div>
    </div>

    <div class="lib-sim">
      <div class="lib-sim-controls">
        <!-- Fases de aporte -->
        <div class="lib-fases">
          <div class="lib-fases-head">
            <label>Fases de aporte</label>
            <span class="lib-fases-hint">Aporta R$X até o mês N, depois aumenta/diminui</span>
          </div>
          <div class="lib-fases-list" id="lib-fases-list">
            ${i}
          </div>
          <button type="button" class="btn bg bsm" id="lib-fase-add">+ Adicionar fase</button>
          <div class="lib-sim-quick" style="margin-top:8px">
            <small style="color:var(--text-3);font-family:var(--ff-mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;align-self:center;margin-right:4px">Aplicar na fase 1:</small>
            <button class="lib-qk" data-pmt="${n}">${g(n)}</button>
            <button class="lib-qk" data-pmt="2000">R$ 2k</button>
            <button class="lib-qk" data-pmt="5000">R$ 5k</button>
            <button class="lib-qk" data-pmt="10000">R$ 10k</button>
          </div>
        </div>

        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Taxa anual</label>
            <span class="lib-slider-v">${l.taxa.toFixed(2)}% a.a.</span>
          </div>
          <input type="range" id="sim-taxa" min="4" max="25" step="0.25" value="${l.taxa}">
        </div>
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Prazo</label>
            <span class="lib-slider-v">${l.meses} meses (${(l.meses/12).toFixed(1)} anos)</span>
          </div>
          <input type="range" id="sim-meses" min="6" max="240" step="1" value="${l.meses}">
        </div>
      </div>

      <div class="lib-sim-chart">
        ${At(o,a,l.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${g(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function Xt(t,e){const o=2*Math.PI*86,n=o*Math.min(100,t)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${ae(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${se(e,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${n} ${o-n}"
              stroke-dashoffset="${o/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${t.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function At(t,e,a=null){const i={t:38,r:90,b:32,l:56},r=760-i.l-i.r,s=290-i.t-i.b,c=Math.max(e,...t.map(p=>p.saldo))*1.08,d=p=>i.l+p/(t.length-1)*r,m=p=>i.t+s-Math.max(0,p)/c*s;function f(p){const b=t.map((F,Y)=>[d(Y),m(F[p])]);if(b.length<2)return"";let z=`M ${b[0][0].toFixed(1)} ${b[0][1].toFixed(1)}`;const D=.18;for(let F=0;F<b.length-1;F++){const Y=b[F-1]||b[F],Q=b[F],C=b[F+1],ct=b[F+2]||C,_t=Q[0]+(C[0]-Y[0])*D,wt=Q[1]+(C[1]-Y[1])*D,St=C[0]-(ct[0]-Q[0])*D,Mt=C[1]-(ct[1]-Q[1])*D;z+=` C ${_t.toFixed(1)} ${wt.toFixed(1)}, ${St.toFixed(1)} ${Mt.toFixed(1)}, ${C[0].toFixed(1)} ${C[1].toFixed(1)}`}return z}const $=f("saldo"),y=f("aportado"),u=f("juros"),A=d(t.length-1),I=m(0),K=`${$} L ${A.toFixed(1)} ${I.toFixed(1)} L ${i.l} ${I.toFixed(1)} Z`,Z=[0,.5,1].map(p=>{const b=c*p;return`<g>
      <line x1="${i.l}" x2="${760-i.r}" y1="${m(b)}" y2="${m(b)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${p===0?"":"2 4"}"/>
      <text x="${i.l-10}" y="${m(b)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${H(b)}</text>
    </g>`}).join(""),L=[0,Math.floor(t.length/2),t.length-1].map(p=>{const b=t[p];return`<text x="${d(p)}" y="280" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${b.mes}m</text>`}).join("");let R="";a&&a.length>1&&(R=a.slice(1).map(p=>{if(p.inicio<=0||p.inicio>=t.length)return"";const b=d(p.inicio);return`
        <line x1="${b}" x2="${b}" y1="${i.t}" y2="${i.t+s}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${b} ${i.t-14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${H(p.aporte)}/m</text>
        </g>`}).join(""));let B="",W="";if(e<=c){const p=m(e);B=`
      <line x1="${i.l}" x2="${760-i.r}" y1="${p}" y2="${p}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-i.r+4} ${p})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${H(e)}</text>
      </g>`;const b=t.findIndex(z=>z.saldo>=e);if(b>0){const z=d(b),D=m(t[b].saldo);W=`
        <g class="lib-chart-cross" transform="translate(${z} ${D})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${t[b].mes}m · ${X(t[b].mes).toUpperCase()}</text>
          </g>
        </g>`}}const q=t[t.length-1],_=`
    <g transform="translate(${A+8} ${m(q.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${H(q.saldo)}</text>
    </g>
    <g transform="translate(${A+8} ${m(q.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${H(q.aportado)}</text>
    </g>
    <g transform="translate(${A+8} ${m(q.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${H(q.juros)}</text>
    </g>`,G=t.map((p,b)=>d(b).toFixed(1)).join(","),j=t.map(p=>Math.round(p.saldo)).join(","),T=t.map(p=>Math.round(p.aportado)).join(","),et=t.map(p=>Math.round(p.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 290" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="290" data-pad-l="${i.l}" data-pad-r="${i.r}"
       data-pad-t="${i.t}" data-pad-b="${i.b}"
       data-xs="${G}" data-saldo="${j}" data-aportado="${T}" data-juros="${et}"
       data-meses="${t.map(p=>p.mes).join(",")}">
    <defs>
      <linearGradient id="lg-area-saldo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#C5F82A" stop-opacity=".5"/>
        <stop offset="50%"  stop-color="#C5F82A" stop-opacity=".15"/>
        <stop offset="100%" stop-color="#C5F82A" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="lg-stroke-saldo" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#E6FF7A"/>
        <stop offset=".6" stop-color="#C5F82A"/>
        <stop offset="1"   stop-color="#34D399"/>
      </linearGradient>
      <filter id="f-glow-saldo" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    ${Z}
    ${R}
    ${B}

    <path d="${K}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${y}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${u}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${$}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${W}
    ${_}
    ${L}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${i.t}" y2="${i.t+s}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${i.l}" y="${i.t}" width="${r}" height="${s}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function kt(t){const e=t.querySelector(".lib-chart"),a=t.querySelector(".lib-chart-tooltip");if(!e||!a)return;const o=e.querySelector(".lib-chart-hover"),n=e.querySelector(".lib-chart-hit"),i=e.querySelector(".lib-chart-vline"),r=e.querySelector(".lib-chart-dot-s"),s=e.querySelector(".lib-chart-dot-a"),c=e.querySelector(".lib-chart-dot-j"),d=e.dataset.xs.split(",").map(Number),m=e.dataset.saldo.split(",").map(Number),f=e.dataset.aportado.split(",").map(Number),$=e.dataset.juros.split(",").map(Number),y=e.dataset.meses.split(",").map(Number),u=+e.dataset.w,A=+e.dataset.h,I=+e.dataset.padT,K=+e.dataset.padB,Z=Math.max(...m)*1.08,tt=A-I-K,L=R=>I+tt-Math.max(0,R)/Z*tt;n.addEventListener("mousemove",R=>{const B=e.getBoundingClientRect(),W=u/B.width,q=(R.clientX-B.left)*W;let _=0,G=1/0;for(let p=0;p<d.length;p++){const b=Math.abs(d[p]-q);b<G&&(G=b,_=p)}const j=d[_];o.style.opacity=1,i.setAttribute("x1",j),i.setAttribute("x2",j),r.setAttribute("cx",j),r.setAttribute("cy",L(m[_])),s.setAttribute("cx",j),s.setAttribute("cy",L(f[_])),c.setAttribute("cx",j),c.setAttribute("cy",L($[_]));const T=j/u*B.width,et=T>B.width/2?"left":"right";a.style.opacity=1,a.style.left=et==="right"?T+14+"px":T-14-a.offsetWidth+"px",a.style.top=Math.max(8,L(m[_])/A*B.height-a.offsetHeight/2)+"px",a.querySelector(".lib-tt-mes").textContent=`${y[_]}m · ${X(y[_])}`,a.querySelector(".lib-tt-s").textContent=g(m[_]),a.querySelector(".lib-tt-a").textContent=g(f[_]),a.querySelector(".lib-tt-j").textContent=g($[_])}),n.addEventListener("mouseleave",()=>{o.style.opacity=0,a.style.opacity=0})}function Kt(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${M.length?Zt():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function Zt(){const t={};for(const e of M){const a=(e.data||"").slice(0,7);t[a]||(t[a]=[]),t[a].push(e)}return Object.entries(t).sort((e,a)=>a[0].localeCompare(e[0])).map(([e,a])=>{const[o,n]=e.split("-"),i=a.reduce((r,s)=>r+Number(s.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${ft[parseInt(n)-1]} / ${o}</span>
        <span class="lib-mes-tot">${g(i)}</span>
      </div>
      ${a.map(r=>{const s=v.find(c=>c.id===r.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${r.id}" title="Clica pra editar">
          <div class="lib-ap-data">${Ft(r.data)}</div>
          <div class="lib-ap-meta">${s?`<span class="lib-ap-tag" style="background:${Et(s.cor||"#C5F82A",.15)};color:${s.cor||"#C5F82A"}">${s.icone||"🎯"} ${S(s.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${S(r.fonte||"manual")}${r.observacao?" · "+S(r.observacao):""}</div>
          <div class="lib-ap-val">${g(Number(r.valor))}</div>
          <button class="lib-ap-del" data-aid="${r.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function te(t){var e,a,o,n,i,r;t.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(s=>s.addEventListener("click",()=>pt())),(e=t.querySelector("#sim-taxa"))==null||e.addEventListener("input",s=>J({taxa:+s.target.value})),(a=t.querySelector("#sim-meses"))==null||a.addEventListener("input",s=>J({meses:+s.target.value})),(o=t.querySelector("#sim-meta"))==null||o.addEventListener("change",s=>{l.metaId=s.target.value,w()}),(n=t.querySelector("#lib-fases-list"))==null||n.addEventListener("input",s=>{const c=s.target.closest(".lib-fase");if(!c)return;const d=+c.dataset.faseIdx;l.fases[d]&&(s.target.classList.contains("lib-fase-aporte")?(l.fases[d].aporte=Math.max(0,+s.target.value||0),J({})):s.target.classList.contains("lib-fase-inicio")&&(l.fases[d].inicio=Math.max(1,Math.min(l.meses,+s.target.value||1)),J({})))}),(i=t.querySelector("#lib-fase-add"))==null||i.addEventListener("click",()=>{const s=l.fases[l.fases.length-1],c=Math.min(l.meses,((s==null?void 0:s.inicio)||0)+12),d=Math.round(((s==null?void 0:s.aporte)||2e3)*1.5);l.fases.push({inicio:c,aporte:d}),w(),setTimeout(()=>{var m;return(m=document.querySelector(".lib-fase:last-child .lib-fase-aporte"))==null?void 0:m.focus()},50)}),(r=t.querySelector("#lib-fases-list"))==null||r.addEventListener("click",s=>{const c=s.target.closest(".lib-fase-del");if(!c)return;const m=+c.closest(".lib-fase").dataset.faseIdx;m!==0&&(l.fases.splice(m,1),w())}),t.querySelectorAll(".lib-qk").forEach(s=>s.addEventListener("click",()=>{l.fases[0].aporte=+s.dataset.pmt,w()})),t.addEventListener("click",async s=>{const c=s.target.closest("[data-aporte]"),d=s.target.closest("[data-sim]"),m=s.target.closest("[data-meta-edit]"),f=s.target.closest(".lib-ap-del"),$=s.target.closest("#lib-selic-refresh");if($){s.stopPropagation(),$.classList.add("spinning");const u=await ot({manual:!0});if($.classList.remove("spinning"),u){l.taxa=Number(x.selic_aa);const A=document.getElementById("sim-taxa");A&&document.activeElement!==A&&(A.value=l.taxa,J({taxa:l.taxa}))}return}if(c){mt({metaId:c.dataset.aporte||null});return}if(d){l.metaId=d.dataset.sim,w(),setTimeout(()=>{var u;return(u=document.querySelector(".lib-sim"))==null?void 0:u.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(m){const u=v.find(A=>A.id===m.dataset.metaEdit);u&&pt(u);return}if(f){if(s.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:u}=await k.from("aportes_fin").delete().eq("id",f.dataset.aid);if(u)return h("Erro: "+u.message,"err");h("Aporte removido"),w();return}const y=s.target.closest("[data-ap-edit]");if(y){const u=M.find(A=>A.id===y.dataset.apEdit);u&&mt({aporte:u})}})}function J(t){Object.assign(l,t);const e=document.getElementById("content"),a=v.find(y=>y.id===l.metaId)||v.find(y=>y.principal)||v[0];if(!a)return;const o=e.querySelectorAll(".lib-slider-v");o[0]&&(o[0].textContent=l.taxa.toFixed(2)+"% a.a."),o[1]&&(o[1].textContent=`${l.meses} meses (${(l.meses/12).toFixed(1)} anos)`);const n=P(a),i=Number(a.valor_alvo),r=rt({pv:n,fases:l.fases,taxaAA:l.taxa,meses:l.meses}),s=r[r.length-1],c=s.aportado,d=e.querySelector(".lib-sim-chart");if(d){const y=d.querySelector(".lib-chart-legend");d.innerHTML=At(r,i,l.fases)+(y?y.outerHTML:""),kt(d)}const m=e.querySelectorAll("#lib-stats .lib-stat-val"),f=e.querySelectorAll("#lib-stats .lib-stat-sub");m[2]&&(m[2].textContent=g(s.saldo),f[2].textContent="Juros: "+g(s.saldo-c));const $=U({pv:n,fases:l.fases,taxaAA:l.taxa,meta:i});m[3]&&(m[3].textContent=g(Math.max(0,i-n)),f[3].textContent=$!=null?`Bate em ${X($)}`:"Aumente o aporte")}function mt({metaId:t=null,aporte:e=null}={}){var f,$,y;const a=new Date().toISOString().slice(0,10),o=N(),n=!!e,i=n?e.meta_id||"":t||((f=v.find(u=>u.principal))==null?void 0:f.id)||(($=v[0])==null?void 0:$.id)||"",r=n?e.valor:o||"",s=n?e.data:a,c=n&&e.fonte||"manual",d=n&&e.observacao||"",m=["manual","faturamento","bonus","outro"].map(u=>`<option value="${u}"${u===c?" selected":""}>${u==="manual"?"Manual":u==="faturamento"?"Faturamento":u==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");bt(n?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${v.map(u=>`<option value="${u.id}"${u.id===i?" selected":""}>${u.icone||"🎯"} ${S(u.nome)}</option>`).join("")}
        <option value=""${i===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${r}">
      ${!n&&o?`<div class="lib-hint">Sugestão: ${g(o)} (${x.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${n?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${s}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${m}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${S(d)}">
    </div>
  `,`
    ${n?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${n?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",O),(y=document.getElementById("ap-del"))==null||y.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:u}=await k.from("aportes_fin").delete().eq("id",e.id);if(u)return h("Erro: "+u.message,"err");O(),h("Aporte removido"),w()}),document.getElementById("ap-save").addEventListener("click",async()=>{const u=parseFloat(document.getElementById("ap-val").value)||0;if(u<=0)return h("Valor inválido","err");const A={valor:u,data:document.getElementById("ap-data").value||a,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:I}=n?await k.from("aportes_fin").update(A).eq("id",e.id):await k.from("aportes_fin").insert(A);if(I)return h("Erro: "+I.message,"err");O(),h(n?"Aporte atualizado":"Aporte registrado 🚀"),w()})}function pt(t={}){var r;const e=!t.id,a=t.icone||dt[0],o=t.cor||st[v.length%st.length],n=dt.map(s=>`<button type="button" class="lib-ico-pick${s===a?" on":""}" data-ico="${s}">${s}</button>`).join(""),i=st.map(s=>`<button type="button" class="lib-cor-pick${s===o?" on":""}" style="background:${s}" data-cor="${s}"></button>`).join("");bt(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${S(t.nome||"")}">
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Valor alvo (R$)</label>
        <input class="fi" type="number" id="m-alvo" step="100" placeholder="15000" value="${t.valor_alvo||""}">
      </div>
      <div class="fg"><label class="fl">Saldo inicial (R$)</label>
        <input class="fi" type="number" id="m-ini" step="100" placeholder="0" value="${t.valor_inicial||0}">
        <div class="lib-hint">Quanto você já tem reservado pra essa meta</div>
      </div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Prazo (meses, opcional)</label>
        <input class="fi" type="number" id="m-prazo" step="1" placeholder="Sem prazo" value="${t.prazo_meses||""}">
      </div>
      <div class="fg"><label class="fl">
        <input type="checkbox" id="m-principal"${t.principal?" checked":""}> Marcar como meta principal
      </label>
      <div class="lib-hint">A principal vai no hero (só uma por vez)</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Ícone</label>
      <div class="lib-ico-row" id="m-icones">${n}</div>
      <input type="hidden" id="m-ico" value="${a}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${i}</div>
      <input type="hidden" id="m-cor" value="${o}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",s=>{const c=s.target.closest(".lib-ico-pick");c&&(document.querySelectorAll(".lib-ico-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-ico").value=c.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",s=>{const c=s.target.closest(".lib-cor-pick");c&&(document.querySelectorAll(".lib-cor-pick").forEach(d=>d.classList.remove("on")),c.classList.add("on"),document.getElementById("m-cor").value=c.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",O),(r=document.getElementById("m-del"))==null||r.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${t.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:s}=await k.from("metas_fin").delete().eq("id",t.id);if(s)return h("Erro: "+s.message,"err");O(),h("Meta excluída"),w()}),document.getElementById("m-save").addEventListener("click",async()=>{const s=document.getElementById("m-nome").value.trim(),c=parseFloat(document.getElementById("m-alvo").value)||0;if(!s)return h("Nome obrigatório","err");if(c<=0)return h("Valor alvo inválido","err");const d=document.getElementById("m-principal").checked,m={nome:s,valor_alvo:c,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:d,atualizado_em:new Date().toISOString()};d&&await k.from("metas_fin").update({principal:!1}).neq("id",t.id||"00000000-0000-0000-0000-000000000000");const{error:f}=t.id?await k.from("metas_fin").update(m).eq("id",t.id):await k.from("metas_fin").insert(m);if(f)return h("Erro: "+f.message,"err");O(),h(t.id?"Meta atualizada":"Meta criada 🎯"),w()})}function ee(t){return Math.round(t).toLocaleString("pt-BR")}function H(t){return t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(t).toString()}function X(t){const e=new Date;return e.setMonth(e.getMonth()+t),ft[e.getMonth()]+"/"+e.getFullYear()}function S(t){return String(t||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Et(t,e){const a=t.replace("#",""),o=parseInt(a.slice(0,2),16),n=parseInt(a.slice(2,4),16),i=parseInt(a.slice(4,6),16);return`rgba(${o},${n},${i},${e})`}function ae(t,e){const a=t.replace("#",""),o=Math.min(255,parseInt(a.slice(0,2),16)+e),n=Math.min(255,parseInt(a.slice(2,4),16)+e),i=Math.min(255,parseInt(a.slice(4,6),16)+e);return`rgb(${o},${n},${i})`}function se(t,e){const a=t.replace("#",""),o=Math.max(0,parseInt(a.slice(0,2),16)-e),n=Math.max(0,parseInt(a.slice(2,4),16)-e),i=Math.max(0,parseInt(a.slice(4,6),16)-e);return`rgb(${o},${n},${i})`}export{w as render};
