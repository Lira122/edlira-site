import{d as E,t as y,c as x,o as ft,f as V,M as vt,h as Nt,j as Ct}from"./index-BWeNDSVY.js";let k=null,h=[],j=[],ot=[],gt=[],ht=[],$t=[],yt=[],xt=[],at=null,d={metaId:null,meses:60,taxa:14.25,fases:[{inicio:0,aporte:2e3}]};const st=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],ut=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],Lt=360*60*1e3;let M={open:!1,msgs:[],loading:!1};async function q(){var a;const t=document.getElementById("content");if(t.innerHTML='<div class="empty">Carregando…</div>',await Rt(),await rt(),zt(),!d.metaId||!h.find(i=>i.id===d.metaId)){const i=h.find(o=>o.principal)||h[0];d.metaId=(i==null?void 0:i.id)||null}(a=d.fases)!=null&&a.length||(d.fases=[{inicio:0,aporte:2e3}]),d.fases[0].aporte=Math.max(d.fases[0].aporte,O()),d.taxa=Number(k.selic_aa)||14.25,t.innerHTML=Vt(),oe(t),Et(t);const e=t.querySelector(".lib-sim-chart");e&&Ft(e)}async function Rt(){const[t,e,a,i,o,n,r,s,l]=await Promise.all([E.from("config_fin").select("*").eq("id","main").maybeSingle(),E.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),E.from("aportes_fin").select("*").order("data",{ascending:!1}),E.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),E.from("despesas").select("*").order("data",{ascending:!1}),E.from("despesas_recorrentes").select("*").order("criado_em",{ascending:!1}),E.from("receitas_recorrentes").select("*").order("criado_em",{ascending:!1}),E.from("caixinhas").select("*").eq("ativa",!0).order("ordem"),E.from("caixinhas_mov").select("*").order("data",{ascending:!1})]);t.error&&y("config_fin: "+t.error.message,"err"),e.error&&y("metas_fin: "+e.error.message,"err"),a.error&&y("aportes_fin: "+a.error.message,"err"),k=t.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},h=e.data||[],j=a.data||[],ot=i.data||[],gt=o&&!o.error?o.data||[]:[],ht=n&&!n.error?n.data||[]:[],$t=r&&!r.error?r.data||[]:[],yt=s&&!s.error?s.data||[]:[],xt=l&&!l.error?l.data||[]:[]}async function rt({manual:t=!1}={}){var e;try{const a=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!a.ok)return t&&y("BCB respondeu "+a.status,"err"),!1;const i=await a.json(),o=Number((e=i==null?void 0:i[0])==null?void 0:e.valor);if(!isFinite(o)||o<=0)return t&&y("Resposta inválida do BCB","err"),!1;const n=Number(k.selic_aa),r=Math.abs(o-n)>.01,s=new Date().toISOString();return k.selic_aa=o,k.atualizado_em=s,await E.from("config_fin").upsert({id:"main",selic_aa:o,atualizado_em:s}),r?y(`Selic atualizada: ${o.toFixed(2)}% a.a.`):t&&y(`Selic confirmada: ${o.toFixed(2)}% a.a.`),Dt(),!0}catch{return t&&y("Sem conexão com o BCB","err"),!1}}function zt(){at&&clearInterval(at),at=setInterval(()=>{rt()},Lt)}function Dt(){const t=document.querySelector(".lib-chip-selic");t&&(t.innerHTML=_t())}function _t(){const t=Number(k.selic_aa).toFixed(2),e=k.atualizado_em?Ot(k.atualizado_em):"não verificada";return`<b>Selic</b> ${t}% a.a. <small>BCB · ${e}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function Ot(t){const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"agora":e<3600?`há ${Math.floor(e/60)}min`:e<86400?`há ${Math.floor(e/3600)}h`:e<86400*30?`há ${Math.floor(e/86400)}d`:new Date(t).toLocaleDateString("pt-BR")}function At(t,e){if(!(t!=null&&t.length))return 0;const a=[...t].sort((o,n)=>o.inicio-n.inicio);let i=0;for(const o of a)o.inicio<=e&&(i=Number(o.aporte)||0);return i}function nt({pv:t,fases:e,taxaAA:a,meses:i}){const o=Math.pow(1+a/100,.08333333333333333)-1,n=[];let r=t,s=t;for(let l=0;l<=i;l++){if(l>0){const u=At(e,l-1);r=r*(1+o)+u,s+=u}n.push({mes:l,saldo:r,aportado:s,juros:r-s})}return n}function Z({pv:t,fases:e,taxaAA:a,meta:i}){if(t>=i)return 0;const o=Math.pow(1+a/100,1/12)-1;let n=t,r=0;for(;r<1200;){const s=At(e,r);if(n=n*(1+o)+s,r++,n>=i)return r;if(s===0&&n<=t*1.0001&&r>12)return null}return null}function kt(t,e){return ot.filter(a=>a.ano===t&&a.mes===e).reduce((a,i)=>a+Number(i.valor||0),0)}function lt(){const t=new Date;let e=0,a=0;for(let i=1;i<=6;i++){const o=new Date(t.getFullYear(),t.getMonth()-i,1),n=kt(o.getFullYear(),o.getMonth()+1);n>0&&(e+=n,a++)}return a?e/a:0}function ct(){const t=new Date;return kt(t.getFullYear(),t.getMonth()+1)}function O(){const t=Number((k==null?void 0:k.aporte_pct_faturamento)||20)/100,e=lt()||ct();return Math.max(0,Math.round(e*t))}function Y(t){const e=j.filter(a=>a.meta_id===t.id).reduce((a,i)=>a+Number(i.valor||0),0);return Number(t.valor_inicial||0)+e}function it(t){return j.filter(e=>e.meta_id===t.id)}function Pt(t){const e=new Date().toISOString().slice(0,7);return j.filter(a=>(t?a.meta_id===t:!0)&&(a.data||"").startsWith(e)).reduce((a,i)=>a+Number(i.valor||0),0)}function Ht(t){const e=O()||1;let a=0;const i=new Date;for(let o=0;o<36;o++){const r=new Date(i.getFullYear(),i.getMonth()-o,1).toISOString().slice(0,7),s=j.filter(l=>(t?l.meta_id===t:!0)&&(l.data||"").startsWith(r)).reduce((l,u)=>l+Number(u.valor||0),0);if(s>=e&&s>0)a++;else break}return a}function Tt(){const t=h.find(c=>c.principal)||h[0],e=h.find(c=>c.id===d.metaId)||t,a=new Date().toISOString().slice(0,10),i=new Date,o=h.map(c=>{const v=Y(c);return{nome:c.nome,alvo:Number(c.valor_alvo),saldo_atual:v,progresso_pct:+(v/Number(c.valor_alvo)*100).toFixed(1),principal:c.principal===!0,prazo_meses:c.prazo_meses||null}}),n=j.slice(0,12).map(c=>{var v;return{data:c.data,valor:Number(c.valor),meta:((v=h.find(B=>B.id===c.meta_id))==null?void 0:v.nome)||null,fonte:c.fonte,obs:c.observacao}}),r=[];for(let c=0;c<=5;c++){const v=new Date(i.getFullYear(),i.getMonth()-c,1),B=v.getMonth()+1,I=v.getFullYear(),F=ot.filter(S=>S.mes===B&&S.ano===I).reduce((S,P)=>S+Number(P.valor||0),0);r.push({mes:`${I}-${String(B).padStart(2,"0")}`,valor:+F.toFixed(2)})}const s=[];for(let c=0;c<=2;c++){const v=new Date(i.getFullYear(),i.getMonth()-c,1);s.push(`${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,"0")}`)}const l=gt.filter(c=>s.some(v=>(c.data||"").startsWith(v))),u={};for(const c of l){const v=c.categoria||"outro";u[v]=(u[v]||0)+Number(c.valor||0)}const m=Object.values(u).reduce((c,v)=>c+v,0),g=ht.filter(c=>c.ativa).map(c=>({descricao:c.descricao,valor:Number(c.valor),categoria:c.categoria,dia:c.dia_vencimento||null})),$=g.reduce((c,v)=>c+v.valor,0),_=$t.filter(c=>c.ativa).map(c=>({descricao:c.descricao,valor:Number(c.valor)})),p=i.getMonth()+1,A=i.getFullYear(),C=yt.map(c=>{const v=`${A}-${String(p).padStart(2,"0")}`,B=xt.filter(F=>F.caixinha_id===c.id&&(F.data||"").startsWith(v)).reduce((F,S)=>F+Number(S.valor||0),0),I=c.tipo==="gasto"?Number(c.valor_mensal)-B:null;return{nome:c.nome,tipo:c.tipo,valor_mensal:Number(c.valor_mensal),usado_mes_atual:+B.toFixed(2),saldo_mes_atual:I!==null?+I.toFixed(2):null}});return{hoje:a,selic_aa:Number(k.selic_aa),selic_atualizada_em:k.atualizado_em,faturamento:{medio_6m:+lt().toFixed(2),mes_atual:+ct().toFixed(2),ultimos_6_meses:r,pct_alvo_aporte:Number(k.aporte_pct_faturamento),aporte_sugerido_mensal:O()},despesas:{total_ultimos_3_meses:+m.toFixed(2),media_mensal_3m:+(m/3).toFixed(2),por_categoria_3m:Object.fromEntries(Object.entries(u).map(([c,v])=>[c,+v.toFixed(2)]))},contas_fixas_mensais:{total:+$.toFixed(2),lista:g},receitas_recorrentes:_,metas:o,aportes:{total_geral:+j.reduce((c,v)=>c+Number(v.valor||0),0).toFixed(2),qtd_total:j.length,ultimos_12:n},caixinhas:C,simulador_atual:{meta_em_foco:e==null?void 0:e.nome,taxa_aa:d.taxa,prazo_meses:d.meses,fases:d.fases}}}async function Jt(t){var s,l,u,m;const e=Ct.OR_KEY;if(!e)throw new Error("Chave da IA não disponível. Faça login de novo.");const a=Tt(),i=`Você é um planejador financeiro pessoal direto, brasileiro, sem firula. Conversa com o usuário sobre as finanças dele dentro do CRM "Eleva Digital". Linguagem informal, tipo amigo que entende de finanças. Seja sincero quando os números não fecham.

Você tem acesso COMPLETO ao contexto financeiro dele em JSON abaixo, atualizado AGORA:

\`\`\`json
${JSON.stringify(a,null,2)}
\`\`\`

Explicação dos campos:
- **faturamento**: receita do negócio. \`medio_6m\` = média mensal últimos 6 meses; \`ultimos_6_meses\` = mês a mês
- **despesas**: gastos pontuais (não-recorrentes). Vem agregado em \`por_categoria_3m\` (ia, infra, marketing, operacional, pessoal, outro)
- **contas_fixas_mensais**: assinaturas e contas que se repetem todo mês (despesas recorrentes ativas) — \`total\` é o quanto sai fixo todo mês
- **receitas_recorrentes**: receitas que entram todo mês (clientes recorrentes, etc)
- **metas**: objetivos de poupança/investimento (a "principal" = liberdade financeira R$100k)
- **aportes**: histórico de aportes já feitos pras metas
- **caixinhas**: envelope budgeting (tipo Will) — \`gasto\` = reseta no mês, \`reserva\` = acumula; \`saldo_mes_atual\` mostra quanto sobrou da caixinha esse mês
- **simulador_atual**: o que ele tá projetando agora no simulador (fases de aporte, taxa, prazo)

Regras:
- Valores em **R$** com vírgula (R$ 1.234,56)
- Taxa Selic atual: ${a.selic_aa}% a.a. (referência conservadora de juros)
- LUCRO LÍQUIDO REAL ≈ faturamento.mes_atual − contas_fixas_mensais.total − (despesas pontuais do mês). Use isso pra avaliar capacidade de aporte real
- Faz contas de cabeça com números reais (juros compostos: FV = PV·(1+i)^n + PMT·((1+i)^n−1)/i com i mensal)
- Quando você quiser **sugerir uma mudança de fases pro simulador**, inclua um bloco assim no final:
\`\`\`apply-fases
[{"inicio": 0, "aporte": 2500}, {"inicio": 6, "aporte": 4000}]
\`\`\`
  Vai aparecer botão "Aplicar" pra ele adotar na hora.
- Quando ele "viajar na maionese" (cenários hipotéticos), entra na brincadeira e faz a conta. Ex: "e se eu vender meu carro e jogar 30k?" → simula
- Não invente dados que não estão no contexto. Se faltar, pergunta
- Respostas curtas e práticas (2-4 parágrafos), a não ser que ele peça detalhe
- Pode ser provocativo se ele tiver gastando mais do que faturando ou aportando pouco do faturamento`,o=["anthropic/claude-sonnet-4.6","anthropic/claude-haiku-4.5","meta-llama/llama-3.3-70b-instruct"],n=[{role:"system",content:i},...M.msgs.slice(-10).map(g=>({role:g.role,content:g.content})),{role:"user",content:t}];let r="";for(const g of o){const $=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({model:g,messages:n,max_tokens:800,temperature:.6})});if($.ok){const p=await $.json();return((m=(u=(l=(s=p==null?void 0:p.choices)==null?void 0:s[0])==null?void 0:l.message)==null?void 0:u.content)==null?void 0:m.trim())||"(sem resposta)"}if($.status===404){r=`${g} indisponível`;continue}const _=await $.text().catch(()=>"");throw new Error(`OpenRouter ${$.status}: ${_.slice(0,200)}`)}throw new Error(r||"Nenhum modelo disponível")}async function mt(t){if(!(!t.trim()||M.loading)){M.msgs.push({role:"user",content:t.trim()}),M.loading=!0,Q();try{const e=await Jt(t.trim());M.msgs.push({role:"assistant",content:e})}catch(e){M.msgs.push({role:"assistant",content:"⚠️ Erro: "+e.message})}finally{M.loading=!1,Q()}}}function Q(){var i;const t=document.getElementById("lib-chat");if(!t)return;const e=((i=Mt().match(/<div id="lib-chat"[\s\S]*<\/div>/))==null?void 0:i[0])||"";t.outerHTML=e,Et(document.getElementById("content"));const a=document.getElementById("lib-chat-body");a&&(a.scrollTop=a.scrollHeight)}function Et(t){var i,o,n;(i=t.querySelector("#lib-fab"))==null||i.addEventListener("click",()=>{M.open=!0,Q(),setTimeout(()=>{var r;return(r=document.getElementById("lib-chat-text"))==null?void 0:r.focus()},250)}),(o=t.querySelector("#lib-chat-close"))==null||o.addEventListener("click",()=>{M.open=!1,Q()}),(n=t.querySelector("#lib-chat-clear"))==null||n.addEventListener("click",()=>{confirm("Limpar conversa?")&&(M.msgs=[],Q())});const e=t.querySelector("#lib-chat-input"),a=t.querySelector("#lib-chat-text");e==null||e.addEventListener("submit",r=>{r.preventDefault();const s=a.value;a.value="",a.style.height="auto",mt(s)}),a==null||a.addEventListener("keydown",r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),e.requestSubmit())}),a==null||a.addEventListener("input",()=>{a.style.height="auto",a.style.height=Math.min(140,a.scrollHeight)+"px"}),t.querySelectorAll(".lib-chat-sug-btn").forEach(r=>r.addEventListener("click",()=>mt(r.dataset.sug))),t.querySelectorAll(".lib-chat-apply").forEach(r=>{const s=r.querySelector(".btn");s==null||s.addEventListener("click",()=>{try{const l=JSON.parse(r.dataset.apply);d.fases=l.sort((u,m)=>u.inicio-m.inicio),y("Fases aplicadas no simulador 🎯"),q(),setTimeout(()=>{var u;return(u=document.querySelector(".lib-sim"))==null?void 0:u.scrollIntoView({behavior:"smooth",block:"center"})},100)}catch(l){y("Erro ao aplicar: "+l.message,"err")}})})}function Vt(){const t=h.find(i=>i.principal)||h[0],e=h.filter(i=>i!==t),a=h.find(i=>i.id===d.metaId)||t;return`
  <div class="lib">
    ${t?Kt(t):Xt()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(Zt).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${te(a)}
    ${ee(a)}
    ${se()}

    ${Yt()}
    ${Mt()}
  </div>`}function Yt(){return`
  <button class="lib-fab" id="lib-fab" title="Conversar com a IA financeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span>IA financeira</span>
    <span class="lib-fab-pulse"></span>
  </button>`}function Mt(){if(!M.open)return'<div id="lib-chat" class="lib-chat"></div>';const t=M.msgs.length?M.msgs.map(e=>Wt(e)).join(""):`<div class="lib-chat-empty">
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
          <div class="lib-chat-sub">${M.loading?'<span class="lib-chat-typing">pensando…</span>':"sabe tudo do seu contexto"}</div>
        </div>
      </div>
      <div class="lib-chat-head-acts">
        ${M.msgs.length?'<button class="lib-chat-clear" id="lib-chat-clear" title="Limpar conversa">↻</button>':""}
        <button class="lib-chat-close" id="lib-chat-close" title="Fechar">×</button>
      </div>
    </div>
    <div class="lib-chat-body" id="lib-chat-body">${t}</div>
    <form class="lib-chat-input" id="lib-chat-input">
      <textarea id="lib-chat-text" placeholder="Manda a real... ex: e se eu aumentar pra 5k a partir do mês 6?" rows="1" ${M.loading?"disabled":""}></textarea>
      <button type="submit" class="lib-chat-send" ${M.loading?"disabled":""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  </div>`}function Wt(t){const e=Ut(t.content),a=e?t.content.replace(/```apply-fases[\s\S]*?```/g,"").trim():t.content,i=Gt(a),o=t.role==="user"?"user":"ai";let n="";if(e){const r=e.map(s=>`${s.inicio===0?"Início":`mês ${s.inicio}+`}: ${x(s.aporte)}`).join(" · ");n=`
      <div class="lib-chat-apply" data-apply='${Qt(JSON.stringify(e))}'>
        <div class="lib-chat-apply-info">
          <div class="lib-chat-apply-lbl">💡 Sugestão pro simulador</div>
          <div class="lib-chat-apply-desc">${r}</div>
        </div>
        <button class="btn bp bsm">Aplicar</button>
      </div>`}return`<div class="lib-msg ${o}">
    ${o==="ai"?'<div class="lib-msg-avatar">🤖</div>':""}
    <div class="lib-msg-bubble">
      ${i}
      ${n}
    </div>
  </div>`}function Gt(t){return N(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.+<\/li>\n?)+/g,e=>`<ul>${e}</ul>`).replace(/\n/g,"<br>")}function Qt(t){return String(t).replace(/'/g,"&#39;").replace(/"/g,"&quot;")}function Ut(t){const e=t.match(/```apply-fases\s*([\s\S]*?)```/);if(!e)return null;try{const a=JSON.parse(e[1].trim());return!Array.isArray(a)||!a.every(i=>Number.isFinite(+i.inicio)&&Number.isFinite(+i.aporte))?null:a.map(i=>({inicio:+i.inicio,aporte:+i.aporte}))}catch{return null}}function Xt(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function Kt(t){const e=Y(t),a=Number(t.valor_alvo),i=Math.min(100,e/a*100),o=O(),n=Pt(t.id),r=Ht(t.id),s=Z({pv:e,fases:[{inicio:0,aporte:o}],taxaAA:Number(k.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${t.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${t.icone||"🎯"}</span> META PRINCIPAL · ${N(t.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${re(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${x(a)}</strong>
        · ${i.toFixed(1)}% do caminho
        ${s!=null?` · faltam <strong>${s}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${i.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${_t()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${x(o)}/mês <small>(${Number(k.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${x(n)} ${n>=o?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${r} ${r===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${ae(i,t.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${t.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${t.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function Zt(t){const e=Y(t),a=Number(t.valor_alvo),i=Math.min(100,e/a*100),o=t.cor||"#C5F82A",n=O(),r=Z({pv:e,fases:[{inicio:0,aporte:n}],taxaAA:Number(k.selic_aa),meta:a}),s=e>=a;return`
  <div class="lib-meta-card${s?" done":""}" style="--meta-color:${o}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${wt(o,.14)};color:${o}">${t.icone||"🎯"}</div>
      <div class="lib-meta-name">${N(t.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${t.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${x(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${x(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${i.toFixed(2)}%;background:${o}"></div></div>
    <div class="lib-meta-foot">
      <span>${i.toFixed(0)}%</span>
      ${s?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${r!=null?`${r}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${t.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${t.id}">Simular</button>
    </div>
  </div>`}function te(t){if(!t)return"";const e=Y(t),a=Number(t.valor_alvo),i=nt({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=i[i.length-1];o.aportado;const n=o.juros,r=Z({pv:e,fases:d.fases,taxaAA:d.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${x(e)}</div>
      <div class="lib-stat-sub">${it(t).length} aporte${it(t).length===1?"":"s"} registrado${it(t).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${x(lt())}</div>
      <div class="lib-stat-sub">Mês atual: ${x(ct())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${d.meses}m</div>
      <div class="lib-stat-val ac">${x(o.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${x(n)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${x(Math.max(0,a-e))}</div>
      <div class="lib-stat-sub">${r!=null?`Bate em ${tt(r)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function ee(t){if(!t)return"";const e=Y(t),a=Number(t.valor_alvo),i=nt({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=O()||1e3,n=d.fases.map((r,s)=>`
    <div class="lib-fase" data-fase-idx="${s}">
      <div class="lib-fase-when">
        ${s===0?'<span class="lib-fase-tag">Início</span>':`<input type="number" class="lib-fase-inicio" min="1" max="${d.meses}" step="1" value="${r.inicio}"> <small>em diante</small>`}
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
          Projetando: <strong>${N(t.nome)}</strong>
          ${h.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${h.map(r=>`<option value="${r.id}"${r.id===t.id?" selected":""}>${r.icone||"🎯"} ${N(r.nome)}</option>`).join("")}
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
            ${n}
          </div>
          <button type="button" class="btn bg bsm" id="lib-fase-add">+ Adicionar fase</button>
          <div class="lib-sim-quick" style="margin-top:8px">
            <small style="color:var(--text-3);font-family:var(--ff-mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;align-self:center;margin-right:4px">Aplicar na fase 1:</small>
            <button class="lib-qk" data-pmt="${o}">${x(o)}</button>
            <button class="lib-qk" data-pmt="2000">R$ 2k</button>
            <button class="lib-qk" data-pmt="5000">R$ 5k</button>
            <button class="lib-qk" data-pmt="10000">R$ 10k</button>
          </div>
        </div>

        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Taxa anual</label>
            <span class="lib-slider-v">${d.taxa.toFixed(2)}% a.a.</span>
          </div>
          <input type="range" id="sim-taxa" min="4" max="25" step="0.25" value="${d.taxa}">
        </div>
        <div class="lib-slider">
          <div class="lib-slider-row">
            <label>Prazo</label>
            <span class="lib-slider-v">${d.meses} meses (${(d.meses/12).toFixed(1)} anos)</span>
          </div>
          <input type="range" id="sim-meses" min="6" max="240" step="1" value="${d.meses}">
        </div>
      </div>

      <div class="lib-sim-chart">
        ${St(i,a,d.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${x(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function ae(t,e){const i=2*Math.PI*86,o=i*Math.min(100,t)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${ne(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${le(e,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${o} ${i-o}"
              stroke-dashoffset="${i/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${t.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function St(t,e,a=null){const n={t:38,r:90,b:32,l:56},r=760-n.l-n.r,s=290-n.t-n.b,l=Math.max(e,...t.map(b=>b.saldo))*1.08,u=b=>n.l+b/(t.length-1)*r,m=b=>n.t+s-Math.max(0,b)/l*s;function g(b){const f=t.map((L,X)=>[u(X),m(L[b])]);if(f.length<2)return"";let H=`M ${f[0][0].toFixed(1)} ${f[0][1].toFixed(1)}`;const T=.18;for(let L=0;L<f.length-1;L++){const X=f[L-1]||f[L],K=f[L],D=f[L+1],dt=f[L+2]||D,It=K[0]+(D[0]-X[0])*T,qt=K[1]+(D[1]-X[1])*T,Bt=D[0]-(dt[0]-K[0])*T,jt=D[1]-(dt[1]-K[1])*T;H+=` C ${It.toFixed(1)} ${qt.toFixed(1)}, ${Bt.toFixed(1)} ${jt.toFixed(1)}, ${D[0].toFixed(1)} ${D[1].toFixed(1)}`}return H}const $=g("saldo"),_=g("aportado"),p=g("juros"),A=u(t.length-1),C=m(0),c=`${$} L ${A.toFixed(1)} ${C.toFixed(1)} L ${n.l} ${C.toFixed(1)} Z`,v=[0,.5,1].map(b=>{const f=l*b;return`<g>
      <line x1="${n.l}" x2="${760-n.r}" y1="${m(f)}" y2="${m(f)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${b===0?"":"2 4"}"/>
      <text x="${n.l-10}" y="${m(f)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${J(f)}</text>
    </g>`}).join(""),I=[0,Math.floor(t.length/2),t.length-1].map(b=>{const f=t[b];return`<text x="${u(b)}" y="280" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${f.mes}m</text>`}).join("");let F="";a&&a.length>1&&(F=a.slice(1).map(b=>{if(b.inicio<=0||b.inicio>=t.length)return"";const f=u(b.inicio);return`
        <line x1="${f}" x2="${f}" y1="${n.t}" y2="${n.t+s}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${f} ${n.t-14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${J(b.aporte)}/m</text>
        </g>`}).join(""));let S="",P="";if(e<=l){const b=m(e);S=`
      <line x1="${n.l}" x2="${760-n.r}" y1="${b}" y2="${b}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-n.r+4} ${b})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${J(e)}</text>
      </g>`;const f=t.findIndex(H=>H.saldo>=e);if(f>0){const H=u(f),T=m(t[f].saldo);P=`
        <g class="lib-chart-cross" transform="translate(${H} ${T})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${t[f].mes}m · ${tt(t[f].mes).toUpperCase()}</text>
          </g>
        </g>`}}const R=t[t.length-1],w=`
    <g transform="translate(${A+8} ${m(R.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${J(R.saldo)}</text>
    </g>
    <g transform="translate(${A+8} ${m(R.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${J(R.aportado)}</text>
    </g>
    <g transform="translate(${A+8} ${m(R.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${J(R.juros)}</text>
    </g>`,U=t.map((b,f)=>u(f).toFixed(1)).join(","),z=t.map(b=>Math.round(b.saldo)).join(","),W=t.map(b=>Math.round(b.aportado)).join(","),et=t.map(b=>Math.round(b.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 290" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="290" data-pad-l="${n.l}" data-pad-r="${n.r}"
       data-pad-t="${n.t}" data-pad-b="${n.b}"
       data-xs="${U}" data-saldo="${z}" data-aportado="${W}" data-juros="${et}"
       data-meses="${t.map(b=>b.mes).join(",")}">
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

    ${v}
    ${F}
    ${S}

    <path d="${c}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${_}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${p}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${$}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${P}
    ${w}
    ${I}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${n.t}" y2="${n.t+s}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${n.l}" y="${n.t}" width="${r}" height="${s}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function Ft(t){const e=t.querySelector(".lib-chart"),a=t.querySelector(".lib-chart-tooltip");if(!e||!a)return;const i=e.querySelector(".lib-chart-hover"),o=e.querySelector(".lib-chart-hit"),n=e.querySelector(".lib-chart-vline"),r=e.querySelector(".lib-chart-dot-s"),s=e.querySelector(".lib-chart-dot-a"),l=e.querySelector(".lib-chart-dot-j"),u=e.dataset.xs.split(",").map(Number),m=e.dataset.saldo.split(",").map(Number),g=e.dataset.aportado.split(",").map(Number),$=e.dataset.juros.split(",").map(Number),_=e.dataset.meses.split(",").map(Number),p=+e.dataset.w,A=+e.dataset.h,C=+e.dataset.padT,c=+e.dataset.padB,v=Math.max(...m)*1.08,B=A-C-c,I=F=>C+B-Math.max(0,F)/v*B;o.addEventListener("mousemove",F=>{const S=e.getBoundingClientRect(),P=p/S.width,R=(F.clientX-S.left)*P;let w=0,U=1/0;for(let b=0;b<u.length;b++){const f=Math.abs(u[b]-R);f<U&&(U=f,w=b)}const z=u[w];i.style.opacity=1,n.setAttribute("x1",z),n.setAttribute("x2",z),r.setAttribute("cx",z),r.setAttribute("cy",I(m[w])),s.setAttribute("cx",z),s.setAttribute("cy",I(g[w])),l.setAttribute("cx",z),l.setAttribute("cy",I($[w]));const W=z/p*S.width,et=W>S.width/2?"left":"right";a.style.opacity=1,a.style.left=et==="right"?W+14+"px":W-14-a.offsetWidth+"px",a.style.top=Math.max(8,I(m[w])/A*S.height-a.offsetHeight/2)+"px",a.querySelector(".lib-tt-mes").textContent=`${_[w]}m · ${tt(_[w])}`,a.querySelector(".lib-tt-s").textContent=x(m[w]),a.querySelector(".lib-tt-a").textContent=x(g[w]),a.querySelector(".lib-tt-j").textContent=x($[w])}),o.addEventListener("mouseleave",()=>{i.style.opacity=0,a.style.opacity=0})}function se(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${j.length?ie():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function ie(){const t={};for(const e of j){const a=(e.data||"").slice(0,7);t[a]||(t[a]=[]),t[a].push(e)}return Object.entries(t).sort((e,a)=>a[0].localeCompare(e[0])).map(([e,a])=>{const[i,o]=e.split("-"),n=a.reduce((r,s)=>r+Number(s.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${vt[parseInt(o)-1]} / ${i}</span>
        <span class="lib-mes-tot">${x(n)}</span>
      </div>
      ${a.map(r=>{const s=h.find(l=>l.id===r.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${r.id}" title="Clica pra editar">
          <div class="lib-ap-data">${Nt(r.data)}</div>
          <div class="lib-ap-meta">${s?`<span class="lib-ap-tag" style="background:${wt(s.cor||"#C5F82A",.15)};color:${s.cor||"#C5F82A"}">${s.icone||"🎯"} ${N(s.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${N(r.fonte||"manual")}${r.observacao?" · "+N(r.observacao):""}</div>
          <div class="lib-ap-val">${x(Number(r.valor))}</div>
          <button class="lib-ap-del" data-aid="${r.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function oe(t){var e,a,i,o,n,r;t.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(s=>s.addEventListener("click",()=>bt())),(e=t.querySelector("#sim-taxa"))==null||e.addEventListener("input",s=>G({taxa:+s.target.value})),(a=t.querySelector("#sim-meses"))==null||a.addEventListener("input",s=>G({meses:+s.target.value})),(i=t.querySelector("#sim-meta"))==null||i.addEventListener("change",s=>{d.metaId=s.target.value,q()}),(o=t.querySelector("#lib-fases-list"))==null||o.addEventListener("input",s=>{const l=s.target.closest(".lib-fase");if(!l)return;const u=+l.dataset.faseIdx;if(d.fases[u]){if(s.target.classList.contains("lib-fase-aporte"))d.fases[u].aporte=Math.max(0,+s.target.value||0),G({});else if(s.target.classList.contains("lib-fase-inicio")){const m=Math.max(1,+s.target.value||1);if(d.fases[u].inicio=m,m+6>d.meses){d.meses=Math.min(240,m+24),q();return}G({})}}}),(n=t.querySelector("#lib-fase-add"))==null||n.addEventListener("click",()=>{const s=d.fases[d.fases.length-1],l=((s==null?void 0:s.inicio)||0)+12,u=Math.round(((s==null?void 0:s.aporte)||2e3)*1.5);d.fases.push({inicio:l,aporte:u}),l+6>d.meses&&(d.meses=Math.min(240,l+24)),q(),setTimeout(()=>{var m;return(m=document.querySelector(".lib-fase:last-child .lib-fase-aporte"))==null?void 0:m.focus()},50)}),(r=t.querySelector("#lib-fases-list"))==null||r.addEventListener("click",s=>{const l=s.target.closest(".lib-fase-del");if(!l)return;const m=+l.closest(".lib-fase").dataset.faseIdx;m!==0&&(d.fases.splice(m,1),q())}),t.querySelectorAll(".lib-qk").forEach(s=>s.addEventListener("click",()=>{d.fases[0].aporte=+s.dataset.pmt,q()})),t.addEventListener("click",async s=>{const l=s.target.closest("[data-aporte]"),u=s.target.closest("[data-sim]"),m=s.target.closest("[data-meta-edit]"),g=s.target.closest(".lib-ap-del"),$=s.target.closest("#lib-selic-refresh");if($){s.stopPropagation(),$.classList.add("spinning");const p=await rt({manual:!0});if($.classList.remove("spinning"),p){d.taxa=Number(k.selic_aa);const A=document.getElementById("sim-taxa");A&&document.activeElement!==A&&(A.value=d.taxa,G({taxa:d.taxa}))}return}if(l){pt({metaId:l.dataset.aporte||null});return}if(u){d.metaId=u.dataset.sim,q(),setTimeout(()=>{var p;return(p=document.querySelector(".lib-sim"))==null?void 0:p.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(m){const p=h.find(A=>A.id===m.dataset.metaEdit);p&&bt(p);return}if(g){if(s.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:p}=await E.from("aportes_fin").delete().eq("id",g.dataset.aid);if(p)return y("Erro: "+p.message,"err");y("Aporte removido"),q();return}const _=s.target.closest("[data-ap-edit]");if(_){const p=j.find(A=>A.id===_.dataset.apEdit);p&&pt({aporte:p})}})}function G(t){Object.assign(d,t);const e=document.getElementById("content"),a=h.find(_=>_.id===d.metaId)||h.find(_=>_.principal)||h[0];if(!a)return;const i=e.querySelectorAll(".lib-slider-v");i[0]&&(i[0].textContent=d.taxa.toFixed(2)+"% a.a."),i[1]&&(i[1].textContent=`${d.meses} meses (${(d.meses/12).toFixed(1)} anos)`);const o=Y(a),n=Number(a.valor_alvo),r=nt({pv:o,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),s=r[r.length-1],l=s.aportado,u=e.querySelector(".lib-sim-chart");if(u){const _=u.querySelector(".lib-chart-legend");u.innerHTML=St(r,n,d.fases)+(_?_.outerHTML:""),Ft(u)}const m=e.querySelectorAll("#lib-stats .lib-stat-val"),g=e.querySelectorAll("#lib-stats .lib-stat-sub");m[2]&&(m[2].textContent=x(s.saldo),g[2].textContent="Juros: "+x(s.saldo-l));const $=Z({pv:o,fases:d.fases,taxaAA:d.taxa,meta:n});m[3]&&(m[3].textContent=x(Math.max(0,n-o)),g[3].textContent=$!=null?`Bate em ${tt($)}`:"Aumente o aporte")}function pt({metaId:t=null,aporte:e=null}={}){var g,$,_;const a=new Date().toISOString().slice(0,10),i=O(),o=!!e,n=o?e.meta_id||"":t||((g=h.find(p=>p.principal))==null?void 0:g.id)||(($=h[0])==null?void 0:$.id)||"",r=o?e.valor:i||"",s=o?e.data:a,l=o&&e.fonte||"manual",u=o&&e.observacao||"",m=["manual","faturamento","bonus","outro"].map(p=>`<option value="${p}"${p===l?" selected":""}>${p==="manual"?"Manual":p==="faturamento"?"Faturamento":p==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");ft(o?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${h.map(p=>`<option value="${p.id}"${p.id===n?" selected":""}>${p.icone||"🎯"} ${N(p.nome)}</option>`).join("")}
        <option value=""${n===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${r}">
      ${!o&&i?`<div class="lib-hint">Sugestão: ${x(i)} (${k.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${o?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${s}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${m}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${N(u)}">
    </div>
  `,`
    ${o?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${o?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",V),(_=document.getElementById("ap-del"))==null||_.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:p}=await E.from("aportes_fin").delete().eq("id",e.id);if(p)return y("Erro: "+p.message,"err");V(),y("Aporte removido"),q()}),document.getElementById("ap-save").addEventListener("click",async()=>{const p=parseFloat(document.getElementById("ap-val").value)||0;if(p<=0)return y("Valor inválido","err");const A={valor:p,data:document.getElementById("ap-data").value||a,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:C}=o?await E.from("aportes_fin").update(A).eq("id",e.id):await E.from("aportes_fin").insert(A);if(C)return y("Erro: "+C.message,"err");V(),y(o?"Aporte atualizado":"Aporte registrado 🚀"),q()})}function bt(t={}){var r;const e=!t.id,a=t.icone||ut[0],i=t.cor||st[h.length%st.length],o=ut.map(s=>`<button type="button" class="lib-ico-pick${s===a?" on":""}" data-ico="${s}">${s}</button>`).join(""),n=st.map(s=>`<button type="button" class="lib-cor-pick${s===i?" on":""}" style="background:${s}" data-cor="${s}"></button>`).join("");ft(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${N(t.nome||"")}">
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
      <div class="lib-ico-row" id="m-icones">${o}</div>
      <input type="hidden" id="m-ico" value="${a}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${n}</div>
      <input type="hidden" id="m-cor" value="${i}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",s=>{const l=s.target.closest(".lib-ico-pick");l&&(document.querySelectorAll(".lib-ico-pick").forEach(u=>u.classList.remove("on")),l.classList.add("on"),document.getElementById("m-ico").value=l.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",s=>{const l=s.target.closest(".lib-cor-pick");l&&(document.querySelectorAll(".lib-cor-pick").forEach(u=>u.classList.remove("on")),l.classList.add("on"),document.getElementById("m-cor").value=l.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",V),(r=document.getElementById("m-del"))==null||r.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${t.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:s}=await E.from("metas_fin").delete().eq("id",t.id);if(s)return y("Erro: "+s.message,"err");V(),y("Meta excluída"),q()}),document.getElementById("m-save").addEventListener("click",async()=>{const s=document.getElementById("m-nome").value.trim(),l=parseFloat(document.getElementById("m-alvo").value)||0;if(!s)return y("Nome obrigatório","err");if(l<=0)return y("Valor alvo inválido","err");const u=document.getElementById("m-principal").checked,m={nome:s,valor_alvo:l,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:u,atualizado_em:new Date().toISOString()};u&&await E.from("metas_fin").update({principal:!1}).neq("id",t.id||"00000000-0000-0000-0000-000000000000");const{error:g}=t.id?await E.from("metas_fin").update(m).eq("id",t.id):await E.from("metas_fin").insert(m);if(g)return y("Erro: "+g.message,"err");V(),y(t.id?"Meta atualizada":"Meta criada 🎯"),q()})}function re(t){return Math.round(t).toLocaleString("pt-BR")}function J(t){return t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(t).toString()}function tt(t){const e=new Date;return e.setMonth(e.getMonth()+t),vt[e.getMonth()]+"/"+e.getFullYear()}function N(t){return String(t||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function wt(t,e){const a=t.replace("#",""),i=parseInt(a.slice(0,2),16),o=parseInt(a.slice(2,4),16),n=parseInt(a.slice(4,6),16);return`rgba(${i},${o},${n},${e})`}function ne(t,e){const a=t.replace("#",""),i=Math.min(255,parseInt(a.slice(0,2),16)+e),o=Math.min(255,parseInt(a.slice(2,4),16)+e),n=Math.min(255,parseInt(a.slice(4,6),16)+e);return`rgb(${i},${o},${n})`}function le(t,e){const a=t.replace("#",""),i=Math.max(0,parseInt(a.slice(0,2),16)-e),o=Math.max(0,parseInt(a.slice(2,4),16)-e),n=Math.max(0,parseInt(a.slice(4,6),16)-e);return`rgb(${i},${o},${n})`}export{q as render};
