import{d as A,t as g,c as $,o as gt,f as G,M as $t,h as Nt,j as Lt}from"./index-CS-BTh6q.js";let E=null,y=[],j=[],nt=[],rt=[],xt=[],yt=[],lt=[],_t=[],st=null,d={metaId:null,meses:60,taxa:14.25,fases:[{inicio:0,aporte:2e3}]};const ot=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],bt=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],zt=360*60*1e3;let S={open:!1,msgs:[],loading:!1};async function I(){var a;const t=document.getElementById("content");if(t.innerHTML='<div class="empty">Carregando…</div>',await K(),await ct(),Rt(),!d.metaId||!y.find(s=>s.id===d.metaId)){const s=y.find(o=>o.principal)||y[0];d.metaId=(s==null?void 0:s.id)||null}(a=d.fases)!=null&&a.length||(d.fases=[{inicio:0,aporte:2e3}]),d.fases[0].aporte=Math.max(d.fases[0].aporte,T()),d.taxa=Number(E.selic_aa)||14.25,t.innerHTML=Gt(),ne(t),Et(t);const e=t.querySelector(".lib-sim-chart");e&&Mt(e)}async function K(){const[t,e,a,s,o,r,n,i,c]=await Promise.all([A.from("config_fin").select("*").eq("id","main").maybeSingle(),A.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),A.from("aportes_fin").select("*").order("data",{ascending:!1}),A.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),A.from("despesas").select("*").order("data",{ascending:!1}),A.from("despesas_recorrentes").select("*").order("criado_em",{ascending:!1}),A.from("receitas_recorrentes").select("*").order("criado_em",{ascending:!1}),A.from("caixinhas").select("*").eq("ativa",!0).order("ordem"),A.from("caixinhas_mov").select("*").order("data",{ascending:!1})]);t.error&&g("config_fin: "+t.error.message,"err"),e.error&&g("metas_fin: "+e.error.message,"err"),a.error&&g("aportes_fin: "+a.error.message,"err"),E=t.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},y=e.data||[],j=a.data||[],nt=s.data||[],rt=o&&!o.error?o.data||[]:[],xt=r&&!r.error?r.data||[]:[],yt=n&&!n.error?n.data||[]:[],lt=i&&!i.error?i.data||[]:[],_t=c&&!c.error?c.data||[]:[]}async function ct({manual:t=!1}={}){var e;try{const a=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!a.ok)return t&&g("BCB respondeu "+a.status,"err"),!1;const s=await a.json(),o=Number((e=s==null?void 0:s[0])==null?void 0:e.valor);if(!isFinite(o)||o<=0)return t&&g("Resposta inválida do BCB","err"),!1;const r=Number(E.selic_aa),n=Math.abs(o-r)>.01,i=new Date().toISOString();return E.selic_aa=o,E.atualizado_em=i,await A.from("config_fin").upsert({id:"main",selic_aa:o,atualizado_em:i}),n?g(`Selic atualizada: ${o.toFixed(2)}% a.a.`):t&&g(`Selic confirmada: ${o.toFixed(2)}% a.a.`),Dt(),!0}catch{return t&&g("Sem conexão com o BCB","err"),!1}}function Rt(){st&&clearInterval(st),st=setInterval(()=>{ct()},zt)}function Dt(){const t=document.querySelector(".lib-chip-selic");t&&(t.innerHTML=At())}function At(){const t=Number(E.selic_aa).toFixed(2),e=E.atualizado_em?Ot(E.atualizado_em):"não verificada";return`<b>Selic</b> ${t}% a.a. <small>BCB · ${e}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function Ot(t){const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"agora":e<3600?`há ${Math.floor(e/60)}min`:e<86400?`há ${Math.floor(e/3600)}h`:e<86400*30?`há ${Math.floor(e/86400)}d`:new Date(t).toLocaleDateString("pt-BR")}function wt(t,e){if(!(t!=null&&t.length))return 0;const a=[...t].sort((o,r)=>o.inicio-r.inicio);let s=0;for(const o of a)o.inicio<=e&&(s=Number(o.aporte)||0);return s}function dt({pv:t,fases:e,taxaAA:a,meses:s}){const o=Math.pow(1+a/100,.08333333333333333)-1,r=[];let n=t,i=t;for(let c=0;c<=s;c++){if(c>0){const b=wt(e,c-1);n=n*(1+o)+b,i+=b}r.push({mes:c,saldo:n,aportado:i,juros:n-i})}return r}function et({pv:t,fases:e,taxaAA:a,meta:s}){if(t>=s)return 0;const o=Math.pow(1+a/100,1/12)-1;let r=t,n=0;for(;n<1200;){const i=wt(e,n);if(r=r*(1+o)+i,n++,r>=s)return n;if(i===0&&r<=t*1.0001&&n>12)return null}return null}function kt(t,e){return nt.filter(a=>a.ano===t&&a.mes===e).reduce((a,s)=>a+Number(s.valor||0),0)}function ut(){const t=new Date;let e=0,a=0;for(let s=1;s<=6;s++){const o=new Date(t.getFullYear(),t.getMonth()-s,1),r=kt(o.getFullYear(),o.getMonth()+1);r>0&&(e+=r,a++)}return a?e/a:0}function mt(){const t=new Date;return kt(t.getFullYear(),t.getMonth()+1)}function T(){const t=Number((E==null?void 0:E.aporte_pct_faturamento)||20)/100,e=ut()||mt();return Math.max(0,Math.round(e*t))}function Y(t){const e=j.filter(a=>a.meta_id===t.id).reduce((a,s)=>a+Number(s.valor||0),0);return Number(t.valor_inicial||0)+e}function it(t){return j.filter(e=>e.meta_id===t.id)}function Pt(t){const e=new Date().toISOString().slice(0,7);return j.filter(a=>(t?a.meta_id===t:!0)&&(a.data||"").startsWith(e)).reduce((a,s)=>a+Number(s.valor||0),0)}function Tt(t){const e=T()||1;let a=0;const s=new Date;for(let o=0;o<36;o++){const n=new Date(s.getFullYear(),s.getMonth()-o,1).toISOString().slice(0,7),i=j.filter(c=>(t?c.meta_id===t:!0)&&(c.data||"").startsWith(n)).reduce((c,b)=>c+Number(b.valor||0),0);if(i>=e&&i>0)a++;else break}return a}function Ht(){const t=y.find(l=>l.principal)||y[0],e=y.find(l=>l.id===d.metaId)||t,a=new Date().toISOString().slice(0,10),s=new Date,o=y.map(l=>{const p=Y(l);return{nome:l.nome,alvo:Number(l.valor_alvo),saldo_atual:p,progresso_pct:+(p/Number(l.valor_alvo)*100).toFixed(1),principal:l.principal===!0,prazo_meses:l.prazo_meses||null}}),r=j.slice(0,12).map(l=>{var p;return{data:l.data,valor:Number(l.valor),meta:((p=y.find(k=>k.id===l.meta_id))==null?void 0:p.nome)||null,fonte:l.fonte,obs:l.observacao}}),n=[];for(let l=0;l<=5;l++){const p=new Date(s.getFullYear(),s.getMonth()-l,1),k=p.getMonth()+1,N=p.getFullYear(),F=nt.filter(M=>M.mes===k&&M.ano===N).reduce((M,Q)=>M+Number(Q.valor||0),0);n.push({mes:`${N}-${String(k).padStart(2,"0")}`,valor:+F.toFixed(2)})}const i=a,c=[];for(let l=0;l<=2;l++){const p=new Date(s.getFullYear(),s.getMonth()-l,1);c.push(`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,"0")}`)}const b=rt.filter(l=>c.some(p=>(l.data||"").startsWith(p))&&(l.data||"")<=i),m={};for(const l of b){const p=l.categoria||"outro";m[p]=(m[p]||0)+Number(l.valor||0)}const h=Object.values(m).reduce((l,p)=>l+p,0),_=new Date(s.getFullYear(),s.getMonth()+7,0).toISOString().slice(0,10),x=rt.filter(l=>(l.data||"")>i&&(l.data||"")<=_).sort((l,p)=>(l.data||"").localeCompare(p.data||"")).map(l=>({data:l.data,descricao:l.descricao||"(sem descrição)",categoria:l.categoria||"outro",valor:Number(l.valor||0)})),u={};for(const l of x){const p=l.data.slice(0,7);u[p]||(u[p]={total:0,qtd:0,itens:[]}),u[p].total+=l.valor,u[p].qtd++,u[p].itens.push(`${l.data}: ${l.descricao} (${l.categoria}) — R$${l.valor.toFixed(2)}`)}for(const l of Object.keys(u))u[l].total=+u[l].total.toFixed(2);const w=x.reduce((l,p)=>l+p.valor,0),q=xt.filter(l=>l.ativa).map(l=>({descricao:l.descricao,valor:Number(l.valor),categoria:l.categoria,dia:l.dia_vencimento||null})),O=q.reduce((l,p)=>l+p.valor,0),W=yt.filter(l=>l.ativa).map(l=>({descricao:l.descricao,valor:Number(l.valor)})),U=+(O*6+w).toFixed(2),R=s.getMonth()+1,D=s.getFullYear(),C=lt.map(l=>{const p=`${D}-${String(R).padStart(2,"0")}`,k=_t.filter(F=>F.caixinha_id===l.id&&(F.data||"").startsWith(p)).reduce((F,M)=>F+Number(M.valor||0),0),N=l.tipo==="gasto"?Number(l.valor_mensal)-k:null;return{id:l.id,nome:l.nome,tipo:l.tipo,valor_mensal:Number(l.valor_mensal),icone:l.icone,cor:l.cor,usado_mes_atual:+k.toFixed(2),saldo_mes_atual:N!==null?+N.toFixed(2):null}});return{hoje:a,selic_aa:Number(E.selic_aa),selic_atualizada_em:E.atualizado_em,faturamento:{medio_6m:+ut().toFixed(2),mes_atual:+mt().toFixed(2),ultimos_6_meses:n,pct_alvo_aporte:Number(E.aporte_pct_faturamento),aporte_sugerido_mensal:T()},despesas_passadas:{total_ultimos_3_meses:+h.toFixed(2),media_mensal_3m:+(h/3).toFixed(2),por_categoria_3m:Object.fromEntries(Object.entries(m).map(([l,p])=>[l,+p.toFixed(2)]))},despesas_futuras_agendadas:{total_proximos_6_meses:+w.toFixed(2),qtd:x.length,por_mes:u,lista_completa:x},contas_fixas_mensais:{total:+O.toFixed(2),lista:q,total_projetado_6m:+(O*6).toFixed(2)},compromisso_total_proximos_6m:U,receitas_recorrentes:W,metas:o,aportes:{total_geral:+j.reduce((l,p)=>l+Number(p.valor||0),0).toFixed(2),qtd_total:j.length,ultimos_12:r},caixinhas:C,simulador_atual:{meta_em_foco:e==null?void 0:e.nome,taxa_aa:d.taxa,prazo_meses:d.meses,fases:d.fases}}}async function Jt(t){var i,c,b,m;const e=Lt.OR_KEY;if(!e)throw new Error("Chave da IA não disponível. Faça login de novo.");const a=Ht(),s=`Você é um planejador financeiro pessoal direto, brasileiro, sem firula. Conversa com o usuário sobre as finanças dele dentro do CRM "Eleva Digital". Linguagem informal, tipo amigo que entende de finanças. Seja sincero quando os números não fecham.

Você tem acesso COMPLETO ao contexto financeiro dele em JSON abaixo, atualizado AGORA:

\`\`\`json
${JSON.stringify(a,null,2)}
\`\`\`

Explicação dos campos:
- **faturamento**: receita do negócio. \`medio_6m\` = média mensal; \`ultimos_6_meses\` = mês a mês detalhado
- **despesas_passadas**: gastos pontuais (não-recorrentes) já efetuados, agregados em \`por_categoria_3m\`
- **despesas_futuras_agendadas**: gastos pontuais AGENDADOS pros próximos 6 meses — \`lista_completa\` tem descrição/data/valor/categoria de cada um, \`por_mes\` mostra a curva mensal. USE ISSO pra avaliar se o aporte planejado cabe junto com esses compromissos
- **contas_fixas_mensais**: assinaturas/contas recorrentes — \`total\` é o que sai fixo todo mês; \`total_projetado_6m\` = ×6
- **compromisso_total_proximos_6m**: soma de contas fixas (×6) + despesas futuras agendadas — é o "fluxo de saída garantido" pros próximos 6 meses
- **receitas_recorrentes**: o que entra todo mês (clientes mensais)
- **metas**: objetivos de poupança ("principal" = norte da pessoa, geralmente liberdade financeira)
- **aportes**: histórico de aportes já feitos pras metas
- **caixinhas**: envelope budgeting (tipo Will) — \`gasto\` = reseta no mês, \`reserva\` = acumula. Cada caixinha tem \`id\` — use o id quando for sugerir update/movimentação
- **simulador_atual**: o que ele tá projetando agora (fases de aporte, taxa, prazo)

Regras:
- Valores em **R$** com vírgula (R$ 1.234,56)
- Taxa Selic atual: ${a.selic_aa}% a.a.
- LUCRO LÍQUIDO REAL = faturamento.mes_atual − contas_fixas_mensais.total − despesas_futuras_agendadas (no mês) − despesas_passadas (no mês). É a capacidade de aporte real
- Faz contas de cabeça (juros compostos: FV = PV·(1+i)^n + PMT·((1+i)^n−1)/i com i mensal)
- Não invente dados que não estão no contexto. Se faltar, pergunta
- Respostas curtas e práticas (2-4 parágrafos), a não ser que ele peça detalhe
- Pode ser provocativo se ele tiver gastando mais do que faturando ou aportando pouco

VOCÊ PODE AGIR NO SISTEMA. Inclua blocos quando fizer sentido — cada um vira um botão "Aplicar" no chat:

1. **Mudar fases do simulador**:
\`\`\`apply-fases
[{"inicio": 0, "aporte": 2500}, {"inicio": 6, "aporte": 4000}]
\`\`\`

2. **Criar caixinha nova**:
\`\`\`apply-caixinha-create
{"nome": "Lazer", "valor_mensal": 300, "tipo": "gasto", "icone": "🎬", "cor": "#A78BFA"}
\`\`\`
   (tipo: "gasto" reseta no mês | "reserva" acumula | ícones: ⛽🚗🏠🛒🍔💊🎬📱✈️🎁🏥💼🐾🎓🆘💰)

3. **Atualizar caixinha existente** (ex: aumentar valor mensal alocado, mudar nome):
\`\`\`apply-caixinha-update
{"id": "uuid-aqui", "valor_mensal": 500, "nome": "Gasolina novo"}
\`\`\`

4. **Registrar gasto numa caixinha**:
\`\`\`apply-caixinha-mov
{"caixinha_id": "uuid-aqui", "valor": 80, "descricao": "Posto Shell", "data": "${a.hoje}"}
\`\`\`

5. **Excluir caixinha**:
\`\`\`apply-caixinha-delete
{"id": "uuid-aqui", "nome": "Gasolina"}
\`\`\`

Use IDs reais do contexto (caixinhas[].id). Use APENAS quando o usuário pedir explicitamente ou quando você tiver uma sugestão clara de reorganização. Não polua a resposta com muitos blocos — 1 a 3 por mensagem no máximo.`,o=["anthropic/claude-sonnet-4.6","anthropic/claude-haiku-4.5","meta-llama/llama-3.3-70b-instruct"],r=[{role:"system",content:s},...S.msgs.slice(-10).map(h=>({role:h.role,content:h.content})),{role:"user",content:t}];let n="";for(const h of o){const _=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({model:h,messages:r,max_tokens:800,temperature:.6})});if(_.ok){const u=await _.json();return((m=(b=(c=(i=u==null?void 0:u.choices)==null?void 0:i[0])==null?void 0:c.message)==null?void 0:b.content)==null?void 0:m.trim())||"(sem resposta)"}if(_.status===404){n=`${h} indisponível`;continue}const x=await _.text().catch(()=>"");throw new Error(`OpenRouter ${_.status}: ${x.slice(0,200)}`)}throw new Error(n||"Nenhum modelo disponível")}async function ft(t){if(!(!t.trim()||S.loading)){S.msgs.push({role:"user",content:t.trim()}),S.loading=!0,z();try{const e=await Jt(t.trim());S.msgs.push({role:"assistant",content:e})}catch(e){S.msgs.push({role:"assistant",content:"⚠️ Erro: "+e.message})}finally{S.loading=!1,z()}}}function z(){var s;const t=document.getElementById("lib-chat");if(!t)return;const e=((s=St().match(/<div id="lib-chat"[\s\S]*<\/div>/))==null?void 0:s[0])||"";t.outerHTML=e,Et(document.getElementById("content"));const a=document.getElementById("lib-chat-body");a&&(a.scrollTop=a.scrollHeight)}function Et(t){var s,o,r;(s=t.querySelector("#lib-fab"))==null||s.addEventListener("click",()=>{S.open=!0,z(),setTimeout(()=>{var n;return(n=document.getElementById("lib-chat-text"))==null?void 0:n.focus()},250)}),(o=t.querySelector("#lib-chat-close"))==null||o.addEventListener("click",()=>{S.open=!1,z()}),(r=t.querySelector("#lib-chat-clear"))==null||r.addEventListener("click",()=>{confirm("Limpar conversa?")&&(S.msgs=[],z())});const e=t.querySelector("#lib-chat-input"),a=t.querySelector("#lib-chat-text");e==null||e.addEventListener("submit",n=>{n.preventDefault();const i=a.value;a.value="",a.style.height="auto",ft(i)}),a==null||a.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),e.requestSubmit())}),a==null||a.addEventListener("input",()=>{a.style.height="auto",a.style.height=Math.min(140,a.scrollHeight)+"px"}),t.querySelectorAll(".lib-chat-sug-btn").forEach(n=>n.addEventListener("click",()=>ft(n.dataset.sug))),t.querySelectorAll(".lib-chat-apply").forEach(n=>{const i=n.querySelector(".btn");i==null||i.addEventListener("click",async()=>{try{const c=JSON.parse(n.dataset.action);await Vt(c),i.disabled=!0,i.textContent="✓ Feito"}catch(c){g("Erro ao aplicar: "+c.message,"err")}})})}async function Vt(t){const e=t.payload||{};switch(t.tipo){case"fases":{if(!Array.isArray(e))throw new Error("payload inválido");d.fases=e.filter(s=>Number.isFinite(+s.inicio)&&Number.isFinite(+s.aporte)).map(s=>({inicio:+s.inicio,aporte:+s.aporte})).sort((s,o)=>s.inicio-o.inicio);const a=d.fases[d.fases.length-1];a&&a.inicio+6>d.meses&&(d.meses=Math.min(240,a.inicio+24)),g("Fases aplicadas no simulador 🎯"),I(),setTimeout(()=>{var s;return(s=document.querySelector(".lib-sim"))==null?void 0:s.scrollIntoView({behavior:"smooth",block:"center"})},100);return}case"caixinha-create":{if(!e.nome||!(+e.valor_mensal>0))throw new Error("nome e valor_mensal obrigatórios");const a={nome:e.nome,valor_mensal:+e.valor_mensal,tipo:e.tipo==="reserva"?"reserva":"gasto",icone:e.icone||"💰",cor:e.cor||"#4A9EFF"},{error:s}=await A.from("caixinhas").insert(a);if(s)throw s;g(`Caixinha "${e.nome}" criada 📦`),await K(),z();return}case"caixinha-update":{if(!e.id)throw new Error("id obrigatório");const a={atualizado_em:new Date().toISOString()};e.nome&&(a.nome=e.nome),e.valor_mensal!=null&&(a.valor_mensal=+e.valor_mensal),e.tipo&&(a.tipo=e.tipo==="reserva"?"reserva":"gasto"),e.icone&&(a.icone=e.icone),e.cor&&(a.cor=e.cor);const{error:s}=await A.from("caixinhas").update(a).eq("id",e.id);if(s)throw s;g("Caixinha atualizada ✏️"),await K(),z();return}case"caixinha-mov":{if(!e.caixinha_id||!(+e.valor>0))throw new Error("caixinha_id e valor obrigatórios");const a={caixinha_id:e.caixinha_id,valor:+e.valor,data:e.data||new Date().toISOString().slice(0,10),descricao:e.descricao||null},{error:s}=await A.from("caixinhas_mov").insert(a);if(s)throw s;g("Gasto registrado 💸"),await K(),z();return}case"caixinha-delete":{if(!e.id)throw new Error("id obrigatório");if(!confirm(`Excluir caixinha "${e.nome||""}"? Movimentações também serão removidas.`))return;const{error:a}=await A.from("caixinhas").delete().eq("id",e.id);if(a)throw a;g("Caixinha excluída"),await K(),z();return}default:throw new Error("Tipo de ação desconhecido: "+t.tipo)}}function Gt(){const t=y.find(s=>s.principal)||y[0],e=y.filter(s=>s!==t),a=y.find(s=>s.id===d.metaId)||t;return`
  <div class="lib">
    ${t?te(t):Zt()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(ee).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${ae(a)}
    ${se(a)}
    ${ie()}

    ${Yt()}
    ${St()}
  </div>`}function Yt(){return`
  <button class="lib-fab" id="lib-fab" title="Conversar com a IA financeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span>IA financeira</span>
    <span class="lib-fab-pulse"></span>
  </button>`}function St(){if(!S.open)return'<div id="lib-chat" class="lib-chat"></div>';const t=S.msgs.length?S.msgs.map(e=>Wt(e)).join(""):`<div class="lib-chat-empty">
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
          <div class="lib-chat-sub">${S.loading?'<span class="lib-chat-typing">pensando…</span>':"sabe tudo do seu contexto"}</div>
        </div>
      </div>
      <div class="lib-chat-head-acts">
        ${S.msgs.length?'<button class="lib-chat-clear" id="lib-chat-clear" title="Limpar conversa">↻</button>':""}
        <button class="lib-chat-close" id="lib-chat-close" title="Fechar">×</button>
      </div>
    </div>
    <div class="lib-chat-body" id="lib-chat-body">${t}</div>
    <form class="lib-chat-input" id="lib-chat-input">
      <textarea id="lib-chat-text" placeholder="Manda a real... ex: e se eu aumentar pra 5k a partir do mês 6?" rows="1" ${S.loading?"disabled":""}></textarea>
      <button type="submit" class="lib-chat-send" ${S.loading?"disabled":""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  </div>`}function Wt(t){const e=Ut(t.content),a=t.content.replace(/```apply-[a-z-]+[\s\S]*?```/g,"").trim(),s=Xt(a),o=t.role==="user"?"user":"ai",r=e.map((n,i)=>{const c=Qt(n);return`
      <div class="lib-chat-apply" data-action='${Kt(JSON.stringify(n))}'>
        <div class="lib-chat-apply-info">
          <div class="lib-chat-apply-lbl">${c.label}</div>
          <div class="lib-chat-apply-desc">${c.desc}</div>
        </div>
        <button class="btn ${c.cls||"bp"} bsm">${c.btn||"Aplicar"}</button>
      </div>`}).join("");return`<div class="lib-msg ${o}">
    ${o==="ai"?'<div class="lib-msg-avatar">🤖</div>':""}
    <div class="lib-msg-bubble">
      ${s}
      ${r}
    </div>
  </div>`}function Ut(t){const e=[],a=/```apply-([a-z-]+)\s*([\s\S]*?)```/g;let s;for(;(s=a.exec(t))!==null;){const o=s[1];try{const r=JSON.parse(s[2].trim());e.push({tipo:o,payload:r})}catch{}}return e}function Qt(t){var a;const e=s=>lt.find(o=>o.id===s);switch(t.tipo){case"fases":return{label:"💡 Sugestão pro simulador",desc:(Array.isArray(t.payload)?t.payload:[]).map(r=>`${+r.inicio==0?"Início":`mês ${+r.inicio}+`}: ${$(+r.aporte)}`).join(" · "),btn:"Aplicar fases"};case"caixinha-create":{const s=t.payload||{};return{label:"📦 Criar caixinha",desc:`${s.icone||"💰"} ${s.nome||"?"} · ${$(+s.valor_mensal||0)}/mês · ${s.tipo==="reserva"?"reserva":"gasto"}`,btn:"Criar"}}case"caixinha-update":{const s=t.payload||{},o=e(s.id),r=[];return s.nome&&s.nome!==(o==null?void 0:o.nome)&&r.push(`nome → "${s.nome}"`),s.valor_mensal!=null&&+s.valor_mensal!=+(o==null?void 0:o.valor_mensal)&&r.push(`valor → ${$(+s.valor_mensal)}`),s.icone&&s.icone!==(o==null?void 0:o.icone)&&r.push(`ícone → ${s.icone}`),s.cor&&s.cor!==(o==null?void 0:o.cor)&&r.push("nova cor"),{label:`✏️ Atualizar "${(o==null?void 0:o.nome)||"caixinha"}"`,desc:r.join(" · ")||"sem mudanças",btn:"Aplicar"}}case"caixinha-mov":{const s=t.payload||{},o=e(s.caixinha_id);return{label:`− Gasto em "${(o==null?void 0:o.nome)||"caixinha"}"`,desc:`${s.data||"hoje"} · ${$(+s.valor||0)} · ${s.descricao||"sem desc"}`,btn:"Registrar"}}case"caixinha-delete":{const s=t.payload||{};return{label:"🗑️ Excluir caixinha",desc:`"${s.nome||((a=e(s.id))==null?void 0:a.nome)||"caixinha"}" — movimentações também serão removidas`,cls:"bd",btn:"Excluir"}}default:return{label:t.tipo,desc:JSON.stringify(t.payload).slice(0,80)}}}function Xt(t){return B(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.+<\/li>\n?)+/g,e=>`<ul>${e}</ul>`).replace(/\n/g,"<br>")}function Kt(t){return String(t).replace(/'/g,"&#39;").replace(/"/g,"&quot;")}function Zt(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function te(t){const e=Y(t),a=Number(t.valor_alvo),s=Math.min(100,e/a*100),o=T(),r=Pt(t.id),n=Tt(t.id),i=et({pv:e,fases:[{inicio:0,aporte:o}],taxaAA:Number(E.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${t.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${t.icone||"🎯"}</span> META PRINCIPAL · ${B(t.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${le(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${$(a)}</strong>
        · ${s.toFixed(1)}% do caminho
        ${i!=null?` · faltam <strong>${i}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${s.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${At()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${$(o)}/mês <small>(${Number(E.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${$(r)} ${r>=o?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${n} ${n===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${oe(s,t.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${t.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${t.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function ee(t){const e=Y(t),a=Number(t.valor_alvo),s=Math.min(100,e/a*100),o=t.cor||"#C5F82A",r=T(),n=et({pv:e,fases:[{inicio:0,aporte:r}],taxaAA:Number(E.selic_aa),meta:a}),i=e>=a;return`
  <div class="lib-meta-card${i?" done":""}" style="--meta-color:${o}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${It(o,.14)};color:${o}">${t.icone||"🎯"}</div>
      <div class="lib-meta-name">${B(t.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${t.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${$(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${$(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${s.toFixed(2)}%;background:${o}"></div></div>
    <div class="lib-meta-foot">
      <span>${s.toFixed(0)}%</span>
      ${i?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${n!=null?`${n}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${t.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${t.id}">Simular</button>
    </div>
  </div>`}function ae(t){if(!t)return"";const e=Y(t),a=Number(t.valor_alvo),s=dt({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=s[s.length-1];o.aportado;const r=o.juros,n=et({pv:e,fases:d.fases,taxaAA:d.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${$(e)}</div>
      <div class="lib-stat-sub">${it(t).length} aporte${it(t).length===1?"":"s"} registrado${it(t).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${$(ut())}</div>
      <div class="lib-stat-sub">Mês atual: ${$(mt())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${d.meses}m</div>
      <div class="lib-stat-val ac">${$(o.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${$(r)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${$(Math.max(0,a-e))}</div>
      <div class="lib-stat-sub">${n!=null?`Bate em ${at(n)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function se(t){if(!t)return"";const e=Y(t),a=Number(t.valor_alvo),s=dt({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=T()||1e3,r=d.fases.map((n,i)=>`
    <div class="lib-fase" data-fase-idx="${i}">
      <div class="lib-fase-when">
        ${i===0?'<span class="lib-fase-tag">Início</span>':`<input type="number" class="lib-fase-inicio" min="1" max="${d.meses}" step="1" value="${n.inicio}"> <small>em diante</small>`}
      </div>
      <div class="lib-fase-val">
        <input type="number" class="lib-fase-aporte" min="0" step="100" value="${n.aporte}"> <small>R$/mês</small>
      </div>
      ${i>0?'<button class="lib-fase-del" title="Remover fase">×</button>':""}
    </div>
  `).join("");return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${B(t.nome)}</strong>
          ${y.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${y.map(n=>`<option value="${n.id}"${n.id===t.id?" selected":""}>${n.icone||"🎯"} ${B(n.nome)}</option>`).join("")}
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
            ${r}
          </div>
          <button type="button" class="btn bg bsm" id="lib-fase-add">+ Adicionar fase</button>
          <div class="lib-sim-quick" style="margin-top:8px">
            <small style="color:var(--text-3);font-family:var(--ff-mono);font-size:10px;text-transform:uppercase;letter-spacing:.12em;align-self:center;margin-right:4px">Aplicar na fase 1:</small>
            <button class="lib-qk" data-pmt="${o}">${$(o)}</button>
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
        ${Ft(s,a,d.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${$(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function oe(t,e){const s=2*Math.PI*86,o=s*Math.min(100,t)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${ce(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${de(e,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${o} ${s-o}"
              stroke-dashoffset="${s/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${t.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function Ft(t,e,a=null){const r={t:38,r:90,b:32,l:56},n=760-r.l-r.r,i=290-r.t-r.b,c=Math.max(e,...t.map(f=>f.saldo))*1.08,b=f=>r.l+f/(t.length-1)*n,m=f=>r.t+i-Math.max(0,f)/c*i;function h(f){const v=t.map((L,Z)=>[b(Z),m(L[f])]);if(v.length<2)return"";let H=`M ${v[0][0].toFixed(1)} ${v[0][1].toFixed(1)}`;const J=.18;for(let L=0;L<v.length-1;L++){const Z=v[L-1]||v[L],tt=v[L],P=v[L+1],pt=v[L+2]||P,qt=tt[0]+(P[0]-Z[0])*J,jt=tt[1]+(P[1]-Z[1])*J,Bt=P[0]-(pt[0]-tt[0])*J,Ct=P[1]-(pt[1]-tt[1])*J;H+=` C ${qt.toFixed(1)} ${jt.toFixed(1)}, ${Bt.toFixed(1)} ${Ct.toFixed(1)}, ${P[0].toFixed(1)} ${P[1].toFixed(1)}`}return H}const _=h("saldo"),x=h("aportado"),u=h("juros"),w=b(t.length-1),q=m(0),O=`${_} L ${w.toFixed(1)} ${q.toFixed(1)} L ${r.l} ${q.toFixed(1)} Z`,W=[0,.5,1].map(f=>{const v=c*f;return`<g>
      <line x1="${r.l}" x2="${760-r.r}" y1="${m(v)}" y2="${m(v)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${f===0?"":"2 4"}"/>
      <text x="${r.l-10}" y="${m(v)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${V(v)}</text>
    </g>`}).join(""),R=[0,Math.floor(t.length/2),t.length-1].map(f=>{const v=t[f];return`<text x="${b(f)}" y="280" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${v.mes}m</text>`}).join("");let D="";a&&a.length>1&&(D=a.slice(1).map(f=>{if(f.inicio<=0||f.inicio>=t.length)return"";const v=b(f.inicio);return`
        <line x1="${v}" x2="${v}" y1="${r.t}" y2="${r.t+i}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${v} ${r.t-14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${V(f.aporte)}/m</text>
        </g>`}).join(""));let C="",l="";if(e<=c){const f=m(e);C=`
      <line x1="${r.l}" x2="${760-r.r}" y1="${f}" y2="${f}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-r.r+4} ${f})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${V(e)}</text>
      </g>`;const v=t.findIndex(H=>H.saldo>=e);if(v>0){const H=b(v),J=m(t[v].saldo);l=`
        <g class="lib-chart-cross" transform="translate(${H} ${J})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${t[v].mes}m · ${at(t[v].mes).toUpperCase()}</text>
          </g>
        </g>`}}const p=t[t.length-1],k=`
    <g transform="translate(${w+8} ${m(p.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${V(p.saldo)}</text>
    </g>
    <g transform="translate(${w+8} ${m(p.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${V(p.aportado)}</text>
    </g>
    <g transform="translate(${w+8} ${m(p.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${V(p.juros)}</text>
    </g>`,N=t.map((f,v)=>b(v).toFixed(1)).join(","),F=t.map(f=>Math.round(f.saldo)).join(","),M=t.map(f=>Math.round(f.aportado)).join(","),Q=t.map(f=>Math.round(f.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 290" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="290" data-pad-l="${r.l}" data-pad-r="${r.r}"
       data-pad-t="${r.t}" data-pad-b="${r.b}"
       data-xs="${N}" data-saldo="${F}" data-aportado="${M}" data-juros="${Q}"
       data-meses="${t.map(f=>f.mes).join(",")}">
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

    ${W}
    ${D}
    ${C}

    <path d="${O}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${x}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${u}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${_}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${l}
    ${k}
    ${R}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${r.t}" y2="${r.t+i}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${r.l}" y="${r.t}" width="${n}" height="${i}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function Mt(t){const e=t.querySelector(".lib-chart"),a=t.querySelector(".lib-chart-tooltip");if(!e||!a)return;const s=e.querySelector(".lib-chart-hover"),o=e.querySelector(".lib-chart-hit"),r=e.querySelector(".lib-chart-vline"),n=e.querySelector(".lib-chart-dot-s"),i=e.querySelector(".lib-chart-dot-a"),c=e.querySelector(".lib-chart-dot-j"),b=e.dataset.xs.split(",").map(Number),m=e.dataset.saldo.split(",").map(Number),h=e.dataset.aportado.split(",").map(Number),_=e.dataset.juros.split(",").map(Number),x=e.dataset.meses.split(",").map(Number),u=+e.dataset.w,w=+e.dataset.h,q=+e.dataset.padT,O=+e.dataset.padB,W=Math.max(...m)*1.08,U=w-q-O,R=D=>q+U-Math.max(0,D)/W*U;o.addEventListener("mousemove",D=>{const C=e.getBoundingClientRect(),l=u/C.width,p=(D.clientX-C.left)*l;let k=0,N=1/0;for(let f=0;f<b.length;f++){const v=Math.abs(b[f]-p);v<N&&(N=v,k=f)}const F=b[k];s.style.opacity=1,r.setAttribute("x1",F),r.setAttribute("x2",F),n.setAttribute("cx",F),n.setAttribute("cy",R(m[k])),i.setAttribute("cx",F),i.setAttribute("cy",R(h[k])),c.setAttribute("cx",F),c.setAttribute("cy",R(_[k]));const M=F/u*C.width,Q=M>C.width/2?"left":"right";a.style.opacity=1,a.style.left=Q==="right"?M+14+"px":M-14-a.offsetWidth+"px",a.style.top=Math.max(8,R(m[k])/w*C.height-a.offsetHeight/2)+"px",a.querySelector(".lib-tt-mes").textContent=`${x[k]}m · ${at(x[k])}`,a.querySelector(".lib-tt-s").textContent=$(m[k]),a.querySelector(".lib-tt-a").textContent=$(h[k]),a.querySelector(".lib-tt-j").textContent=$(_[k])}),o.addEventListener("mouseleave",()=>{s.style.opacity=0,a.style.opacity=0})}function ie(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${j.length?re():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function re(){const t={};for(const e of j){const a=(e.data||"").slice(0,7);t[a]||(t[a]=[]),t[a].push(e)}return Object.entries(t).sort((e,a)=>a[0].localeCompare(e[0])).map(([e,a])=>{const[s,o]=e.split("-"),r=a.reduce((n,i)=>n+Number(i.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${$t[parseInt(o)-1]} / ${s}</span>
        <span class="lib-mes-tot">${$(r)}</span>
      </div>
      ${a.map(n=>{const i=y.find(c=>c.id===n.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${n.id}" title="Clica pra editar">
          <div class="lib-ap-data">${Nt(n.data)}</div>
          <div class="lib-ap-meta">${i?`<span class="lib-ap-tag" style="background:${It(i.cor||"#C5F82A",.15)};color:${i.cor||"#C5F82A"}">${i.icone||"🎯"} ${B(i.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${B(n.fonte||"manual")}${n.observacao?" · "+B(n.observacao):""}</div>
          <div class="lib-ap-val">${$(Number(n.valor))}</div>
          <button class="lib-ap-del" data-aid="${n.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function ne(t){var e,a,s,o,r,n;t.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(i=>i.addEventListener("click",()=>ht())),(e=t.querySelector("#sim-taxa"))==null||e.addEventListener("input",i=>X({taxa:+i.target.value})),(a=t.querySelector("#sim-meses"))==null||a.addEventListener("input",i=>X({meses:+i.target.value})),(s=t.querySelector("#sim-meta"))==null||s.addEventListener("change",i=>{d.metaId=i.target.value,I()}),(o=t.querySelector("#lib-fases-list"))==null||o.addEventListener("input",i=>{const c=i.target.closest(".lib-fase");if(!c)return;const b=+c.dataset.faseIdx;if(d.fases[b]){if(i.target.classList.contains("lib-fase-aporte"))d.fases[b].aporte=Math.max(0,+i.target.value||0),X({});else if(i.target.classList.contains("lib-fase-inicio")){const m=Math.max(1,+i.target.value||1);if(d.fases[b].inicio=m,m+6>d.meses){d.meses=Math.min(240,m+24),I();return}X({})}}}),(r=t.querySelector("#lib-fase-add"))==null||r.addEventListener("click",()=>{const i=d.fases[d.fases.length-1],c=((i==null?void 0:i.inicio)||0)+12,b=Math.round(((i==null?void 0:i.aporte)||2e3)*1.5);d.fases.push({inicio:c,aporte:b}),c+6>d.meses&&(d.meses=Math.min(240,c+24)),I(),setTimeout(()=>{var m;return(m=document.querySelector(".lib-fase:last-child .lib-fase-aporte"))==null?void 0:m.focus()},50)}),(n=t.querySelector("#lib-fases-list"))==null||n.addEventListener("click",i=>{const c=i.target.closest(".lib-fase-del");if(!c)return;const m=+c.closest(".lib-fase").dataset.faseIdx;m!==0&&(d.fases.splice(m,1),I())}),t.querySelectorAll(".lib-qk").forEach(i=>i.addEventListener("click",()=>{d.fases[0].aporte=+i.dataset.pmt,I()})),t.addEventListener("click",async i=>{const c=i.target.closest("[data-aporte]"),b=i.target.closest("[data-sim]"),m=i.target.closest("[data-meta-edit]"),h=i.target.closest(".lib-ap-del"),_=i.target.closest("#lib-selic-refresh");if(_){i.stopPropagation(),_.classList.add("spinning");const u=await ct({manual:!0});if(_.classList.remove("spinning"),u){d.taxa=Number(E.selic_aa);const w=document.getElementById("sim-taxa");w&&document.activeElement!==w&&(w.value=d.taxa,X({taxa:d.taxa}))}return}if(c){vt({metaId:c.dataset.aporte||null});return}if(b){d.metaId=b.dataset.sim,I(),setTimeout(()=>{var u;return(u=document.querySelector(".lib-sim"))==null?void 0:u.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(m){const u=y.find(w=>w.id===m.dataset.metaEdit);u&&ht(u);return}if(h){if(i.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:u}=await A.from("aportes_fin").delete().eq("id",h.dataset.aid);if(u)return g("Erro: "+u.message,"err");g("Aporte removido"),I();return}const x=i.target.closest("[data-ap-edit]");if(x){const u=j.find(w=>w.id===x.dataset.apEdit);u&&vt({aporte:u})}})}function X(t){Object.assign(d,t);const e=document.getElementById("content"),a=y.find(x=>x.id===d.metaId)||y.find(x=>x.principal)||y[0];if(!a)return;const s=e.querySelectorAll(".lib-slider-v");s[0]&&(s[0].textContent=d.taxa.toFixed(2)+"% a.a."),s[1]&&(s[1].textContent=`${d.meses} meses (${(d.meses/12).toFixed(1)} anos)`);const o=Y(a),r=Number(a.valor_alvo),n=dt({pv:o,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),i=n[n.length-1],c=i.aportado,b=e.querySelector(".lib-sim-chart");if(b){const x=b.querySelector(".lib-chart-legend");b.innerHTML=Ft(n,r,d.fases)+(x?x.outerHTML:""),Mt(b)}const m=e.querySelectorAll("#lib-stats .lib-stat-val"),h=e.querySelectorAll("#lib-stats .lib-stat-sub");m[2]&&(m[2].textContent=$(i.saldo),h[2].textContent="Juros: "+$(i.saldo-c));const _=et({pv:o,fases:d.fases,taxaAA:d.taxa,meta:r});m[3]&&(m[3].textContent=$(Math.max(0,r-o)),h[3].textContent=_!=null?`Bate em ${at(_)}`:"Aumente o aporte")}function vt({metaId:t=null,aporte:e=null}={}){var h,_,x;const a=new Date().toISOString().slice(0,10),s=T(),o=!!e,r=o?e.meta_id||"":t||((h=y.find(u=>u.principal))==null?void 0:h.id)||((_=y[0])==null?void 0:_.id)||"",n=o?e.valor:s||"",i=o?e.data:a,c=o&&e.fonte||"manual",b=o&&e.observacao||"",m=["manual","faturamento","bonus","outro"].map(u=>`<option value="${u}"${u===c?" selected":""}>${u==="manual"?"Manual":u==="faturamento"?"Faturamento":u==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");gt(o?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${y.map(u=>`<option value="${u.id}"${u.id===r?" selected":""}>${u.icone||"🎯"} ${B(u.nome)}</option>`).join("")}
        <option value=""${r===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${n}">
      ${!o&&s?`<div class="lib-hint">Sugestão: ${$(s)} (${E.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${o?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${i}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${m}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${B(b)}">
    </div>
  `,`
    ${o?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${o?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",G),(x=document.getElementById("ap-del"))==null||x.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:u}=await A.from("aportes_fin").delete().eq("id",e.id);if(u)return g("Erro: "+u.message,"err");G(),g("Aporte removido"),I()}),document.getElementById("ap-save").addEventListener("click",async()=>{const u=parseFloat(document.getElementById("ap-val").value)||0;if(u<=0)return g("Valor inválido","err");const w={valor:u,data:document.getElementById("ap-data").value||a,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:q}=o?await A.from("aportes_fin").update(w).eq("id",e.id):await A.from("aportes_fin").insert(w);if(q)return g("Erro: "+q.message,"err");G(),g(o?"Aporte atualizado":"Aporte registrado 🚀"),I()})}function ht(t={}){var n;const e=!t.id,a=t.icone||bt[0],s=t.cor||ot[y.length%ot.length],o=bt.map(i=>`<button type="button" class="lib-ico-pick${i===a?" on":""}" data-ico="${i}">${i}</button>`).join(""),r=ot.map(i=>`<button type="button" class="lib-cor-pick${i===s?" on":""}" style="background:${i}" data-cor="${i}"></button>`).join("");gt(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${B(t.nome||"")}">
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
      <div class="lib-cor-row" id="m-cores">${r}</div>
      <input type="hidden" id="m-cor" value="${s}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",i=>{const c=i.target.closest(".lib-ico-pick");c&&(document.querySelectorAll(".lib-ico-pick").forEach(b=>b.classList.remove("on")),c.classList.add("on"),document.getElementById("m-ico").value=c.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",i=>{const c=i.target.closest(".lib-cor-pick");c&&(document.querySelectorAll(".lib-cor-pick").forEach(b=>b.classList.remove("on")),c.classList.add("on"),document.getElementById("m-cor").value=c.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",G),(n=document.getElementById("m-del"))==null||n.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${t.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:i}=await A.from("metas_fin").delete().eq("id",t.id);if(i)return g("Erro: "+i.message,"err");G(),g("Meta excluída"),I()}),document.getElementById("m-save").addEventListener("click",async()=>{const i=document.getElementById("m-nome").value.trim(),c=parseFloat(document.getElementById("m-alvo").value)||0;if(!i)return g("Nome obrigatório","err");if(c<=0)return g("Valor alvo inválido","err");const b=document.getElementById("m-principal").checked,m={nome:i,valor_alvo:c,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:b,atualizado_em:new Date().toISOString()};b&&await A.from("metas_fin").update({principal:!1}).neq("id",t.id||"00000000-0000-0000-0000-000000000000");const{error:h}=t.id?await A.from("metas_fin").update(m).eq("id",t.id):await A.from("metas_fin").insert(m);if(h)return g("Erro: "+h.message,"err");G(),g(t.id?"Meta atualizada":"Meta criada 🎯"),I()})}function le(t){return Math.round(t).toLocaleString("pt-BR")}function V(t){return t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(t).toString()}function at(t){const e=new Date;return e.setMonth(e.getMonth()+t),$t[e.getMonth()]+"/"+e.getFullYear()}function B(t){return String(t||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function It(t,e){const a=t.replace("#",""),s=parseInt(a.slice(0,2),16),o=parseInt(a.slice(2,4),16),r=parseInt(a.slice(4,6),16);return`rgba(${s},${o},${r},${e})`}function ce(t,e){const a=t.replace("#",""),s=Math.min(255,parseInt(a.slice(0,2),16)+e),o=Math.min(255,parseInt(a.slice(2,4),16)+e),r=Math.min(255,parseInt(a.slice(4,6),16)+e);return`rgb(${s},${o},${r})`}function de(t,e){const a=t.replace("#",""),s=Math.max(0,parseInt(a.slice(0,2),16)-e),o=Math.max(0,parseInt(a.slice(2,4),16)-e),r=Math.max(0,parseInt(a.slice(4,6),16)-e);return`rgb(${s},${o},${r})`}export{I as render};
