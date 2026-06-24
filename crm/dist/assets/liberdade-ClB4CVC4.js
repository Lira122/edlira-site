import{d as k,s as W,t as x,c as y,o as $t,f as X,M as xt,h as Lt,j as zt}from"./index-C1gQ1QXj.js";let w=null,_=[],B=[],at=[],lt=[],yt=[],_t=[],ct=[],At=[],it=null,d={metaId:null,meses:60,taxa:14.25,fases:[{inicio:0,aporte:2e3}]};const rt=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],ft=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],Rt=360*60*1e3;let E={open:!1,msgs:[],loading:!1};async function q(){var a;const t=document.getElementById("content");if(t.innerHTML='<div class="empty">Carregando…</div>',await Q(),await dt(),Ot(),!d.metaId||!_.find(s=>s.id===d.metaId)){const s=_.find(o=>o.principal)||_[0];d.metaId=(s==null?void 0:s.id)||null}(a=d.fases)!=null&&a.length||(d.fases=[{inicio:0,aporte:2e3}]),d.fases[0].aporte=Math.max(d.fases[0].aporte,J()),d.taxa=Number(w.selic_aa)||14.25,t.innerHTML=Gt(),le(t),St(t);const e=t.querySelector(".lib-sim-chart");e&&It(e)}async function Q(){const[t,e,a,s,o,n,l,i,c]=await Promise.all([k.from("config_fin").select("*").eq("id","main").maybeSingle(),k.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),W("aportes_fin",{order:{column:"data",ascending:!1}}),W("faturamento"),W("despesas",{order:{column:"data",ascending:!1}}),W("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),W("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),k.from("caixinhas").select("*").eq("ativa",!0).order("ordem"),W("caixinhas_mov",{order:{column:"data",ascending:!1}})]);t.error&&x("config_fin: "+t.error.message,"err"),e.error&&x("metas_fin: "+e.error.message,"err"),a.error&&x("aportes_fin: "+a.error.message,"err"),w=t.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},_=e.data||[],B=a.data||[],at=s.data||[],lt=o&&!o.error?o.data||[]:[],yt=n&&!n.error?n.data||[]:[],_t=l&&!l.error?l.data||[]:[],ct=i&&!i.error?i.data||[]:[],At=c&&!c.error?c.data||[]:[]}async function dt({manual:t=!1}={}){var e;try{const a=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!a.ok)return t&&x("BCB respondeu "+a.status,"err"),!1;const s=await a.json(),o=Number((e=s==null?void 0:s[0])==null?void 0:e.valor);if(!isFinite(o)||o<=0)return t&&x("Resposta inválida do BCB","err"),!1;const n=Number(w.selic_aa),l=Math.abs(o-n)>.01,i=new Date().toISOString();return w.selic_aa=o,w.atualizado_em=i,await k.from("config_fin").upsert({id:"main",selic_aa:o,atualizado_em:i}),l?x(`Selic atualizada: ${o.toFixed(2)}% a.a.`):t&&x(`Selic confirmada: ${o.toFixed(2)}% a.a.`),Dt(),!0}catch{return t&&x("Sem conexão com o BCB","err"),!1}}function Ot(){it&&clearInterval(it),it=setInterval(()=>{dt()},Rt)}function Dt(){const t=document.querySelector(".lib-chip-selic");t&&(t.innerHTML=wt())}function wt(){const t=Number(w.selic_aa).toFixed(2),e=w.atualizado_em?Tt(w.atualizado_em):"não verificada";return`<b>Selic</b> ${t}% a.a. <small>BCB · ${e}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function Tt(t){const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"agora":e<3600?`há ${Math.floor(e/60)}min`:e<86400?`há ${Math.floor(e/3600)}h`:e<86400*30?`há ${Math.floor(e/86400)}d`:new Date(t).toLocaleDateString("pt-BR")}function Et(t,e){if(!(t!=null&&t.length))return 0;const a=[...t].sort((o,n)=>o.inicio-n.inicio);let s=0;for(const o of a)o.inicio<=e&&(s=Number(o.aporte)||0);return s}function ut({pv:t,fases:e,taxaAA:a,meses:s}){const o=Math.pow(1+a/100,.08333333333333333)-1,n=[];let l=t,i=t;for(let c=0;c<=s;c++){if(c>0){const p=Et(e,c-1);l=l*(1+o)+p,i+=p}n.push({mes:c,saldo:l,aportado:i,juros:l-i})}return n}function st({pv:t,fases:e,taxaAA:a,meta:s}){if(t>=s)return 0;const o=Math.pow(1+a/100,1/12)-1;let n=t,l=0;for(;l<1200;){const i=Et(e,l);if(n=n*(1+o)+i,l++,n>=s)return l;if(i===0&&n<=t*1.0001&&l>12)return null}return null}function kt(t,e){return at.filter(a=>a.ano===t&&a.mes===e).reduce((a,s)=>a+Number(s.valor||0),0)}function mt(){const t=new Date;let e=0,a=0;for(let s=1;s<=6;s++){const o=new Date(t.getFullYear(),t.getMonth()-s,1),n=kt(o.getFullYear(),o.getMonth()+1);n>0&&(e+=n,a++)}return a?e/a:0}function pt(){const t=new Date;return kt(t.getFullYear(),t.getMonth()+1)}function J(){const t=Number((w==null?void 0:w.aporte_pct_faturamento)||20)/100,e=mt()||pt();return Math.max(0,Math.round(e*t))}function K(t){const e=B.filter(a=>a.meta_id===t.id).reduce((a,s)=>a+Number(s.valor||0),0);return Number(t.valor_inicial||0)+e}function nt(t){return B.filter(e=>e.meta_id===t.id)}function Pt(t){const e=new Date().toISOString().slice(0,7);return B.filter(a=>(t?a.meta_id===t:!0)&&(a.data||"").startsWith(e)).reduce((a,s)=>a+Number(s.valor||0),0)}function Ht(t){const e=J()||1;let a=0;const s=new Date;for(let o=0;o<36;o++){const l=new Date(s.getFullYear(),s.getMonth()-o,1).toISOString().slice(0,7),i=B.filter(c=>(t?c.meta_id===t:!0)&&(c.data||"").startsWith(l)).reduce((c,p)=>c+Number(p.valor||0),0);if(i>=e&&i>0)a++;else break}return a}function Jt(){var N;const t=_.find(r=>r.principal)||_[0],e=_.find(r=>r.id===d.metaId)||t,a=new Date().toISOString().slice(0,10),s=new Date,o=_.map(r=>{const f=K(r);return{nome:r.nome,alvo:Number(r.valor_alvo),saldo_atual:f,progresso_pct:+(f/Number(r.valor_alvo)*100).toFixed(1),principal:r.principal===!0,prazo_meses:r.prazo_meses||null}}),n=B.slice(0,12).map(r=>{var f;return{data:r.data,valor:Number(r.valor),meta:((f=_.find(m=>m.id===r.meta_id))==null?void 0:f.nome)||null,fonte:r.fonte,obs:r.observacao}}),l=[];for(let r=0;r<=11;r++){const f=new Date(s.getFullYear(),s.getMonth()-r,1),m=f.getMonth()+1,v=f.getFullYear(),F=at.filter(M=>M.mes===m&&M.ano===v).reduce((M,C)=>M+Number(C.valor||0),0);l.push({mes:`${v}-${String(m).padStart(2,"0")}`,valor:+F.toFixed(2)})}const i=at.filter(r=>new Date(r.ano,r.mes-1,1)>new Date(s.getFullYear(),s.getMonth(),1)).map(r=>({mes:`${r.ano}-${String(r.mes).padStart(2,"0")}`,valor:+Number(r.valor).toFixed(2),desc:r.descricao||null})),c=a,p=[];for(let r=0;r<=11;r++){const f=new Date(s.getFullYear(),s.getMonth()-r,1);p.push(`${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,"0")}`)}const b=lt.filter(r=>p.some(f=>(r.data||"").startsWith(f))&&(r.data||"")<=c),h={},$={};for(const r of b){const f=r.categoria||"outro";h[f]=(h[f]||0)+Number(r.valor||0);const m=(r.data||"").slice(0,7);$[m]=($[m]||0)+Number(r.valor||0)}const A=Object.values(h).reduce((r,f)=>r+f,0);for(const r of Object.keys($))$[r]=+$[r].toFixed(2);const u=lt.filter(r=>(r.data||"")>c).sort((r,f)=>(r.data||"").localeCompare(f.data||"")).map(r=>({data:r.data,descricao:r.descricao||"(sem descrição)",categoria:r.categoria||"outro",valor:Number(r.valor||0)})),g={};for(const r of u){const f=r.data.slice(0,7);g[f]||(g[f]={total:0,qtd:0,itens:[]}),g[f].total+=r.valor,g[f].qtd++,g[f].itens.push(`${r.data}: ${r.descricao} (${r.categoria}) — R$${r.valor.toFixed(2)}`)}for(const r of Object.keys(g))g[r].total=+g[r].total.toFixed(2);const j=u.reduce((r,f)=>r+f.valor,0);let T=0;if(u.length){const r=new Date(u[u.length-1].data);T=(r.getFullYear()-s.getFullYear())*12+(r.getMonth()-s.getMonth())}const V=yt.filter(r=>r.ativa).map(r=>({descricao:r.descricao,valor:Number(r.valor),categoria:r.categoria,dia:r.dia_vencimento||null})),P=V.reduce((r,f)=>r+f.valor,0),R=_t.filter(r=>r.ativa).map(r=>({descricao:r.descricao,valor:Number(r.valor)})),D=R.reduce((r,f)=>r+f.valor,0),I=Math.max(6,T),Y=+(P*I+j).toFixed(2),z=s.getMonth()+1,S=s.getFullYear(),G=ct.map(r=>{const f=`${S}-${String(z).padStart(2,"0")}`,m=At.filter(F=>F.caixinha_id===r.id&&(F.data||"").startsWith(f)).reduce((F,M)=>F+Number(M.valor||0),0),v=r.tipo==="gasto"?Number(r.valor_mensal)-m:null;return{id:r.id,nome:r.nome,tipo:r.tipo,valor_mensal:Number(r.valor_mensal),icone:r.icone,cor:r.cor,usado_mes_atual:+m.toFixed(2),saldo_mes_atual:v!==null?+v.toFixed(2):null}});return{hoje:a,selic_aa:Number(w.selic_aa),selic_atualizada_em:w.atualizado_em,faturamento:{medio_6m:+mt().toFixed(2),mes_atual:+pt().toFixed(2),ultimos_12_meses:l,futuro_lancado:i,pct_alvo_aporte:Number(w.aporte_pct_faturamento),aporte_sugerido_mensal:J()},despesas_passadas:{total_ultimos_12_meses:+A.toFixed(2),media_mensal_12m:+(A/12).toFixed(2),por_categoria_12m:Object.fromEntries(Object.entries(h).map(([r,f])=>[r,+f.toFixed(2)])),por_mes_12m:$},despesas_futuras_agendadas:{total:+j.toFixed(2),qtd:u.length,horizonte_meses:T,ultima_data:((N=u[u.length-1])==null?void 0:N.data)||null,meses_com_lancamento:Object.keys(g).sort(),por_mes:g,lista_completa:u},contas_fixas_mensais:{total:+P.toFixed(2),lista:V,total_projetado_no_horizonte:+(P*I).toFixed(2),meses_projetados:I},receitas_recorrentes:{total_mensal:+D.toFixed(2),lista:R},compromisso_futuro_total:Y,metas:o,aportes:{total_geral:+B.reduce((r,f)=>r+Number(f.valor||0),0).toFixed(2),qtd_total:B.length,ultimos_12:n},caixinhas:G,simulador_atual:{meta_em_foco:e==null?void 0:e.nome,taxa_aa:d.taxa,prazo_meses:d.meses,fases:d.fases}}}async function Vt(t){var i,c,p,b;const e=zt.OR_KEY;if(!e)throw new Error("Chave da IA não disponível. Faça login de novo.");const a=Jt(),s=`Você é um planejador financeiro pessoal direto, brasileiro, sem firula. Conversa com o usuário sobre as finanças dele dentro do CRM "Eleva Digital". Linguagem informal, tipo amigo que entende de finanças. Seja sincero quando os números não fecham.

Você tem acesso COMPLETO ao contexto financeiro dele em JSON abaixo, atualizado AGORA:

\`\`\`json
${JSON.stringify(a,null,2)}
\`\`\`

Explicação dos campos:
- **faturamento**: receita do negócio. \`medio_6m\` = média mensal; \`ultimos_12_meses\` = mês a mês detalhado; \`futuro_lancado\` = receitas já confirmadas pra meses futuros (raras)
- **despesas_passadas**: gastos pontuais já efetuados nos últimos 12 meses. \`por_categoria_12m\` (ia, infra, marketing, operacional, pessoal, outro); \`por_mes_12m\` mostra curva mensal
- **despesas_futuras_agendadas**: TODOS os gastos pontuais agendados pra frente (sem limite). \`horizonte_meses\` = até onde vai a previsão; \`ultima_data\` = data da despesa mais distante; \`lista_completa\` com cada item; \`por_mes\` com curva. SE O USUÁRIO TEM CONTAS LANÇADAS ATÉ JANEIRO, ELAS ESTÃO TODAS AQUI
- **contas_fixas_mensais**: assinaturas/contas recorrentes que cobram TODO mês. \`total\` é o fixo mensal; \`total_projetado_no_horizonte\` = total × meses_projetados (alcance do horizonte de despesas futuras)
- **receitas_recorrentes**: o que entra todo mês (clientes mensais) — \`total_mensal\` + lista
- **compromisso_futuro_total**: soma de contas fixas no horizonte + despesas futuras agendadas — TOTAL DE SAÍDA GARANTIDA até a última despesa lançada
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

⚠️ IMPORTANTE — HORIZONTE DE PROJEÇÃO:
Quando o usuário pedir fluxo mensal ou projeção, vá ATÉ \`despesas_futuras_agendadas.ultima_data\` (não corte em 6 meses por hábito).
- A lista \`despesas_futuras_agendadas.meses_com_lancamento\` mostra TODOS os meses que têm despesa agendada. ITERE POR TODOS ELES — não pule nenhum.
- Hoje o usuário tem ${a.despesas_futuras_agendadas.qtd} despesas futuras cadastradas, indo até **${a.despesas_futuras_agendadas.ultima_data||"nenhuma"}** (horizonte de ${a.despesas_futuras_agendadas.horizonte_meses} meses)
- Se ele tem despesas até maio/2027, mostre a tabela até maio/2027. Não pare em dezembro só porque é "ano corrente"

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

Use IDs reais do contexto (caixinhas[].id). Use APENAS quando o usuário pedir explicitamente ou quando você tiver uma sugestão clara de reorganização. Não polua a resposta com muitos blocos — 1 a 3 por mensagem no máximo.`,o=["anthropic/claude-sonnet-4.6","anthropic/claude-haiku-4.5","meta-llama/llama-3.3-70b-instruct"],n=[{role:"system",content:s},...E.msgs.slice(-10).map(h=>({role:h.role,content:h.content})),{role:"user",content:t}];let l="";for(const h of o){const $=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({model:h,messages:n,max_tokens:800,temperature:.6})});if($.ok){const u=await $.json();return((b=(p=(c=(i=u==null?void 0:u.choices)==null?void 0:i[0])==null?void 0:c.message)==null?void 0:p.content)==null?void 0:b.trim())||"(sem resposta)"}if($.status===404){l=`${h} indisponível`;continue}const A=await $.text().catch(()=>"");throw new Error(`OpenRouter ${$.status}: ${A.slice(0,200)}`)}throw new Error(l||"Nenhum modelo disponível")}async function vt(t){if(!(!t.trim()||E.loading)){E.msgs.push({role:"user",content:t.trim()}),E.loading=!0,O();try{await Q();const e=await Vt(t.trim());E.msgs.push({role:"assistant",content:e})}catch(e){E.msgs.push({role:"assistant",content:"⚠️ Erro: "+e.message})}finally{E.loading=!1,O()}}}function O(){var s;const t=document.getElementById("lib-chat");if(!t)return;const e=((s=Ft().match(/<div id="lib-chat"[\s\S]*<\/div>/))==null?void 0:s[0])||"";t.outerHTML=e,St(document.getElementById("content"));const a=document.getElementById("lib-chat-body");a&&(a.scrollTop=a.scrollHeight)}function St(t){var s,o,n;(s=t.querySelector("#lib-fab"))==null||s.addEventListener("click",()=>{E.open=!0,O(),setTimeout(()=>{var l;return(l=document.getElementById("lib-chat-text"))==null?void 0:l.focus()},250)}),(o=t.querySelector("#lib-chat-close"))==null||o.addEventListener("click",()=>{E.open=!1,O()}),(n=t.querySelector("#lib-chat-clear"))==null||n.addEventListener("click",()=>{confirm("Limpar conversa?")&&(E.msgs=[],O())});const e=t.querySelector("#lib-chat-input"),a=t.querySelector("#lib-chat-text");e==null||e.addEventListener("submit",l=>{l.preventDefault();const i=a.value;a.value="",a.style.height="auto",vt(i)}),a==null||a.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),e.requestSubmit())}),a==null||a.addEventListener("input",()=>{a.style.height="auto",a.style.height=Math.min(140,a.scrollHeight)+"px"}),t.querySelectorAll(".lib-chat-sug-btn").forEach(l=>l.addEventListener("click",()=>vt(l.dataset.sug))),t.querySelectorAll(".lib-chat-apply").forEach(l=>{const i=l.querySelector(".btn");i==null||i.addEventListener("click",async()=>{try{const c=JSON.parse(l.dataset.action);await Yt(c),i.disabled=!0,i.textContent="✓ Feito"}catch(c){x("Erro ao aplicar: "+c.message,"err")}})})}async function Yt(t){const e=t.payload||{};switch(t.tipo){case"fases":{if(!Array.isArray(e))throw new Error("payload inválido");d.fases=e.filter(s=>Number.isFinite(+s.inicio)&&Number.isFinite(+s.aporte)).map(s=>({inicio:+s.inicio,aporte:+s.aporte})).sort((s,o)=>s.inicio-o.inicio);const a=d.fases[d.fases.length-1];a&&a.inicio+6>d.meses&&(d.meses=Math.min(240,a.inicio+24)),x("Fases aplicadas no simulador 🎯"),q(),setTimeout(()=>{var s;return(s=document.querySelector(".lib-sim"))==null?void 0:s.scrollIntoView({behavior:"smooth",block:"center"})},100);return}case"caixinha-create":{if(!e.nome||!(+e.valor_mensal>0))throw new Error("nome e valor_mensal obrigatórios");const a={nome:e.nome,valor_mensal:+e.valor_mensal,tipo:e.tipo==="reserva"?"reserva":"gasto",icone:e.icone||"💰",cor:e.cor||"#4A9EFF"},{error:s}=await k.from("caixinhas").insert(a);if(s)throw s;x(`Caixinha "${e.nome}" criada 📦`),await Q(),O();return}case"caixinha-update":{if(!e.id)throw new Error("id obrigatório");const a={atualizado_em:new Date().toISOString()};e.nome&&(a.nome=e.nome),e.valor_mensal!=null&&(a.valor_mensal=+e.valor_mensal),e.tipo&&(a.tipo=e.tipo==="reserva"?"reserva":"gasto"),e.icone&&(a.icone=e.icone),e.cor&&(a.cor=e.cor);const{error:s}=await k.from("caixinhas").update(a).eq("id",e.id);if(s)throw s;x("Caixinha atualizada ✏️"),await Q(),O();return}case"caixinha-mov":{if(!e.caixinha_id||!(+e.valor>0))throw new Error("caixinha_id e valor obrigatórios");const a={caixinha_id:e.caixinha_id,valor:+e.valor,data:e.data||new Date().toISOString().slice(0,10),descricao:e.descricao||null},{error:s}=await k.from("caixinhas_mov").insert(a);if(s)throw s;x("Gasto registrado 💸"),await Q(),O();return}case"caixinha-delete":{if(!e.id)throw new Error("id obrigatório");if(!confirm(`Excluir caixinha "${e.nome||""}"? Movimentações também serão removidas.`))return;const{error:a}=await k.from("caixinhas").delete().eq("id",e.id);if(a)throw a;x("Caixinha excluída"),await Q(),O();return}default:throw new Error("Tipo de ação desconhecido: "+t.tipo)}}function Gt(){const t=_.find(s=>s.principal)||_[0],e=_.filter(s=>s!==t),a=_.find(s=>s.id===d.metaId)||t;return`
  <div class="lib">
    ${t?ee(t):te()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(ae).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${se(a)}
    ${oe(a)}
    ${re()}

    ${Wt()}
    ${Ft()}
  </div>`}function Wt(){return`
  <button class="lib-fab" id="lib-fab" title="Conversar com a IA financeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span>IA financeira</span>
    <span class="lib-fab-pulse"></span>
  </button>`}function Ft(){if(!E.open)return'<div id="lib-chat" class="lib-chat"></div>';const t=E.msgs.length?E.msgs.map(e=>Ut(e)).join(""):`<div class="lib-chat-empty">
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
  </div>`}function Ut(t){const e=Qt(t.content),a=t.content.replace(/```apply-[a-z-]+[\s\S]*?```/g,"").trim(),s=Kt(a),o=t.role==="user"?"user":"ai",n=e.map((l,i)=>{const c=Xt(l);return`
      <div class="lib-chat-apply" data-action='${Zt(JSON.stringify(l))}'>
        <div class="lib-chat-apply-info">
          <div class="lib-chat-apply-lbl">${c.label}</div>
          <div class="lib-chat-apply-desc">${c.desc}</div>
        </div>
        <button class="btn ${c.cls||"bp"} bsm">${c.btn||"Aplicar"}</button>
      </div>`}).join("");return`<div class="lib-msg ${o}">
    ${o==="ai"?'<div class="lib-msg-avatar">🤖</div>':""}
    <div class="lib-msg-bubble">
      ${s}
      ${n}
    </div>
  </div>`}function Qt(t){const e=[],a=/```apply-([a-z-]+)\s*([\s\S]*?)```/g;let s;for(;(s=a.exec(t))!==null;){const o=s[1];try{const n=JSON.parse(s[2].trim());e.push({tipo:o,payload:n})}catch{}}return e}function Xt(t){var a;const e=s=>ct.find(o=>o.id===s);switch(t.tipo){case"fases":return{label:"💡 Sugestão pro simulador",desc:(Array.isArray(t.payload)?t.payload:[]).map(n=>`${+n.inicio==0?"Início":`mês ${+n.inicio}+`}: ${y(+n.aporte)}`).join(" · "),btn:"Aplicar fases"};case"caixinha-create":{const s=t.payload||{};return{label:"📦 Criar caixinha",desc:`${s.icone||"💰"} ${s.nome||"?"} · ${y(+s.valor_mensal||0)}/mês · ${s.tipo==="reserva"?"reserva":"gasto"}`,btn:"Criar"}}case"caixinha-update":{const s=t.payload||{},o=e(s.id),n=[];return s.nome&&s.nome!==(o==null?void 0:o.nome)&&n.push(`nome → "${s.nome}"`),s.valor_mensal!=null&&+s.valor_mensal!=+(o==null?void 0:o.valor_mensal)&&n.push(`valor → ${y(+s.valor_mensal)}`),s.icone&&s.icone!==(o==null?void 0:o.icone)&&n.push(`ícone → ${s.icone}`),s.cor&&s.cor!==(o==null?void 0:o.cor)&&n.push("nova cor"),{label:`✏️ Atualizar "${(o==null?void 0:o.nome)||"caixinha"}"`,desc:n.join(" · ")||"sem mudanças",btn:"Aplicar"}}case"caixinha-mov":{const s=t.payload||{},o=e(s.caixinha_id);return{label:`− Gasto em "${(o==null?void 0:o.nome)||"caixinha"}"`,desc:`${s.data||"hoje"} · ${y(+s.valor||0)} · ${s.descricao||"sem desc"}`,btn:"Registrar"}}case"caixinha-delete":{const s=t.payload||{};return{label:"🗑️ Excluir caixinha",desc:`"${s.nome||((a=e(s.id))==null?void 0:a.nome)||"caixinha"}" — movimentações também serão removidas`,cls:"bd",btn:"Excluir"}}default:return{label:t.tipo,desc:JSON.stringify(t.payload).slice(0,80)}}}function Kt(t){return L(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.+<\/li>\n?)+/g,e=>`<ul>${e}</ul>`).replace(/\n/g,"<br>")}function Zt(t){return String(t).replace(/'/g,"&#39;").replace(/"/g,"&quot;")}function te(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function ee(t){const e=K(t),a=Number(t.valor_alvo),s=Math.min(100,e/a*100),o=J(),n=Pt(t.id),l=Ht(t.id),i=st({pv:e,fases:[{inicio:0,aporte:o}],taxaAA:Number(w.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${t.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${t.icone||"🎯"}</span> META PRINCIPAL · ${L(t.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${ce(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${y(a)}</strong>
        · ${s.toFixed(1)}% do caminho
        ${i!=null?` · faltam <strong>${i}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${s.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${wt()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${y(o)}/mês <small>(${Number(w.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${y(n)} ${n>=o?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${l} ${l===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${ie(s,t.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${t.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${t.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function ae(t){const e=K(t),a=Number(t.valor_alvo),s=Math.min(100,e/a*100),o=t.cor||"#C5F82A",n=J(),l=st({pv:e,fases:[{inicio:0,aporte:n}],taxaAA:Number(w.selic_aa),meta:a}),i=e>=a;return`
  <div class="lib-meta-card${i?" done":""}" style="--meta-color:${o}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${qt(o,.14)};color:${o}">${t.icone||"🎯"}</div>
      <div class="lib-meta-name">${L(t.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${t.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${y(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${y(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${s.toFixed(2)}%;background:${o}"></div></div>
    <div class="lib-meta-foot">
      <span>${s.toFixed(0)}%</span>
      ${i?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${l!=null?`${l}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${t.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${t.id}">Simular</button>
    </div>
  </div>`}function se(t){if(!t)return"";const e=K(t),a=Number(t.valor_alvo),s=ut({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=s[s.length-1];o.aportado;const n=o.juros,l=st({pv:e,fases:d.fases,taxaAA:d.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${y(e)}</div>
      <div class="lib-stat-sub">${nt(t).length} aporte${nt(t).length===1?"":"s"} registrado${nt(t).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${y(mt())}</div>
      <div class="lib-stat-sub">Mês atual: ${y(pt())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${d.meses}m</div>
      <div class="lib-stat-val ac">${y(o.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${y(n)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${y(Math.max(0,a-e))}</div>
      <div class="lib-stat-sub">${l!=null?`Bate em ${ot(l)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function oe(t){if(!t)return"";const e=K(t),a=Number(t.valor_alvo),s=ut({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=J()||1e3,n=d.fases.map((l,i)=>`
    <div class="lib-fase" data-fase-idx="${i}">
      <div class="lib-fase-when">
        ${i===0?'<span class="lib-fase-tag">Início</span>':`<input type="number" class="lib-fase-inicio" min="1" max="${d.meses}" step="1" value="${l.inicio}"> <small>em diante</small>`}
      </div>
      <div class="lib-fase-val">
        <input type="number" class="lib-fase-aporte" min="0" step="100" value="${l.aporte}"> <small>R$/mês</small>
      </div>
      ${i>0?'<button class="lib-fase-del" title="Remover fase">×</button>':""}
    </div>
  `).join("");return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${L(t.nome)}</strong>
          ${_.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${_.map(l=>`<option value="${l.id}"${l.id===t.id?" selected":""}>${l.icone||"🎯"} ${L(l.nome)}</option>`).join("")}
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
            <button class="lib-qk" data-pmt="${o}">${y(o)}</button>
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
        ${Mt(s,a,d.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${y(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function ie(t,e){const s=2*Math.PI*86,o=s*Math.min(100,t)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${de(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${ue(e,25)}"/>
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
  </div>`}function Mt(t,e,a=null){const n={t:38,r:90,b:32,l:56},l=760-n.l-n.r,i=290-n.t-n.b,c=Math.max(e,...t.map(m=>m.saldo))*1.08,p=m=>n.l+m/(t.length-1)*l,b=m=>n.t+i-Math.max(0,m)/c*i;function h(m){const v=t.map((C,tt)=>[p(tt),b(C[m])]);if(v.length<2)return"";let F=`M ${v[0][0].toFixed(1)} ${v[0][1].toFixed(1)}`;const M=.18;for(let C=0;C<v.length-1;C++){const tt=v[C-1]||v[C],et=v[C],H=v[C+1],bt=v[C+2]||H,jt=et[0]+(H[0]-tt[0])*M,Nt=et[1]+(H[1]-tt[1])*M,Ct=H[0]-(bt[0]-et[0])*M,Bt=H[1]-(bt[1]-et[1])*M;F+=` C ${jt.toFixed(1)} ${Nt.toFixed(1)}, ${Ct.toFixed(1)} ${Bt.toFixed(1)}, ${H[0].toFixed(1)} ${H[1].toFixed(1)}`}return F}const $=h("saldo"),A=h("aportado"),u=h("juros"),g=p(t.length-1),j=b(0),T=`${$} L ${g.toFixed(1)} ${j.toFixed(1)} L ${n.l} ${j.toFixed(1)} Z`,V=[0,.5,1].map(m=>{const v=c*m;return`<g>
      <line x1="${n.l}" x2="${760-n.r}" y1="${b(v)}" y2="${b(v)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${m===0?"":"2 4"}"/>
      <text x="${n.l-10}" y="${b(v)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${U(v)}</text>
    </g>`}).join(""),R=[0,Math.floor(t.length/2),t.length-1].map(m=>{const v=t[m];return`<text x="${p(m)}" y="280" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${v.mes}m</text>`}).join("");let D="";a&&a.length>1&&(D=a.slice(1).map(m=>{if(m.inicio<=0||m.inicio>=t.length)return"";const v=p(m.inicio);return`
        <line x1="${v}" x2="${v}" y1="${n.t}" y2="${n.t+i}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${v} ${n.t-14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${U(m.aporte)}/m</text>
        </g>`}).join(""));let I="",Y="";if(e<=c){const m=b(e);I=`
      <line x1="${n.l}" x2="${760-n.r}" y1="${m}" y2="${m}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-n.r+4} ${m})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${U(e)}</text>
      </g>`;const v=t.findIndex(F=>F.saldo>=e);if(v>0){const F=p(v),M=b(t[v].saldo);Y=`
        <g class="lib-chart-cross" transform="translate(${F} ${M})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${t[v].mes}m · ${ot(t[v].mes).toUpperCase()}</text>
          </g>
        </g>`}}const z=t[t.length-1],S=`
    <g transform="translate(${g+8} ${b(z.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${U(z.saldo)}</text>
    </g>
    <g transform="translate(${g+8} ${b(z.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${U(z.aportado)}</text>
    </g>
    <g transform="translate(${g+8} ${b(z.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${U(z.juros)}</text>
    </g>`,G=t.map((m,v)=>p(v).toFixed(1)).join(","),N=t.map(m=>Math.round(m.saldo)).join(","),r=t.map(m=>Math.round(m.aportado)).join(","),f=t.map(m=>Math.round(m.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 290" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="290" data-pad-l="${n.l}" data-pad-r="${n.r}"
       data-pad-t="${n.t}" data-pad-b="${n.b}"
       data-xs="${G}" data-saldo="${N}" data-aportado="${r}" data-juros="${f}"
       data-meses="${t.map(m=>m.mes).join(",")}">
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

    ${V}
    ${D}
    ${I}

    <path d="${T}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${A}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${u}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${$}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${Y}
    ${S}
    ${R}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${n.t}" y2="${n.t+i}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${n.l}" y="${n.t}" width="${l}" height="${i}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function It(t){const e=t.querySelector(".lib-chart"),a=t.querySelector(".lib-chart-tooltip");if(!e||!a)return;const s=e.querySelector(".lib-chart-hover"),o=e.querySelector(".lib-chart-hit"),n=e.querySelector(".lib-chart-vline"),l=e.querySelector(".lib-chart-dot-s"),i=e.querySelector(".lib-chart-dot-a"),c=e.querySelector(".lib-chart-dot-j"),p=e.dataset.xs.split(",").map(Number),b=e.dataset.saldo.split(",").map(Number),h=e.dataset.aportado.split(",").map(Number),$=e.dataset.juros.split(",").map(Number),A=e.dataset.meses.split(",").map(Number),u=+e.dataset.w,g=+e.dataset.h,j=+e.dataset.padT,T=+e.dataset.padB,V=Math.max(...b)*1.08,P=g-j-T,R=D=>j+P-Math.max(0,D)/V*P;o.addEventListener("mousemove",D=>{const I=e.getBoundingClientRect(),Y=u/I.width,z=(D.clientX-I.left)*Y;let S=0,G=1/0;for(let m=0;m<p.length;m++){const v=Math.abs(p[m]-z);v<G&&(G=v,S=m)}const N=p[S];s.style.opacity=1,n.setAttribute("x1",N),n.setAttribute("x2",N),l.setAttribute("cx",N),l.setAttribute("cy",R(b[S])),i.setAttribute("cx",N),i.setAttribute("cy",R(h[S])),c.setAttribute("cx",N),c.setAttribute("cy",R($[S]));const r=N/u*I.width,f=r>I.width/2?"left":"right";a.style.opacity=1,a.style.left=f==="right"?r+14+"px":r-14-a.offsetWidth+"px",a.style.top=Math.max(8,R(b[S])/g*I.height-a.offsetHeight/2)+"px",a.querySelector(".lib-tt-mes").textContent=`${A[S]}m · ${ot(A[S])}`,a.querySelector(".lib-tt-s").textContent=y(b[S]),a.querySelector(".lib-tt-a").textContent=y(h[S]),a.querySelector(".lib-tt-j").textContent=y($[S])}),o.addEventListener("mouseleave",()=>{s.style.opacity=0,a.style.opacity=0})}function re(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${B.length?ne():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function ne(){const t={};for(const e of B){const a=(e.data||"").slice(0,7);t[a]||(t[a]=[]),t[a].push(e)}return Object.entries(t).sort((e,a)=>a[0].localeCompare(e[0])).map(([e,a])=>{const[s,o]=e.split("-"),n=a.reduce((l,i)=>l+Number(i.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${xt[parseInt(o)-1]} / ${s}</span>
        <span class="lib-mes-tot">${y(n)}</span>
      </div>
      ${a.map(l=>{const i=_.find(c=>c.id===l.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${l.id}" title="Clica pra editar">
          <div class="lib-ap-data">${Lt(l.data)}</div>
          <div class="lib-ap-meta">${i?`<span class="lib-ap-tag" style="background:${qt(i.cor||"#C5F82A",.15)};color:${i.cor||"#C5F82A"}">${i.icone||"🎯"} ${L(i.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${L(l.fonte||"manual")}${l.observacao?" · "+L(l.observacao):""}</div>
          <div class="lib-ap-val">${y(Number(l.valor))}</div>
          <button class="lib-ap-del" data-aid="${l.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function le(t){var e,a,s,o,n,l;t.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(i=>i.addEventListener("click",()=>gt())),(e=t.querySelector("#sim-taxa"))==null||e.addEventListener("input",i=>Z({taxa:+i.target.value})),(a=t.querySelector("#sim-meses"))==null||a.addEventListener("input",i=>Z({meses:+i.target.value})),(s=t.querySelector("#sim-meta"))==null||s.addEventListener("change",i=>{d.metaId=i.target.value,q()}),(o=t.querySelector("#lib-fases-list"))==null||o.addEventListener("input",i=>{const c=i.target.closest(".lib-fase");if(!c)return;const p=+c.dataset.faseIdx;if(d.fases[p]){if(i.target.classList.contains("lib-fase-aporte"))d.fases[p].aporte=Math.max(0,+i.target.value||0),Z({});else if(i.target.classList.contains("lib-fase-inicio")){const b=Math.max(1,+i.target.value||1);if(d.fases[p].inicio=b,b+6>d.meses){d.meses=Math.min(240,b+24),q();return}Z({})}}}),(n=t.querySelector("#lib-fase-add"))==null||n.addEventListener("click",()=>{const i=d.fases[d.fases.length-1],c=((i==null?void 0:i.inicio)||0)+12,p=Math.round(((i==null?void 0:i.aporte)||2e3)*1.5);d.fases.push({inicio:c,aporte:p}),c+6>d.meses&&(d.meses=Math.min(240,c+24)),q(),setTimeout(()=>{var b;return(b=document.querySelector(".lib-fase:last-child .lib-fase-aporte"))==null?void 0:b.focus()},50)}),(l=t.querySelector("#lib-fases-list"))==null||l.addEventListener("click",i=>{const c=i.target.closest(".lib-fase-del");if(!c)return;const b=+c.closest(".lib-fase").dataset.faseIdx;b!==0&&(d.fases.splice(b,1),q())}),t.querySelectorAll(".lib-qk").forEach(i=>i.addEventListener("click",()=>{d.fases[0].aporte=+i.dataset.pmt,q()})),t.addEventListener("click",async i=>{const c=i.target.closest("[data-aporte]"),p=i.target.closest("[data-sim]"),b=i.target.closest("[data-meta-edit]"),h=i.target.closest(".lib-ap-del"),$=i.target.closest("#lib-selic-refresh");if($){i.stopPropagation(),$.classList.add("spinning");const u=await dt({manual:!0});if($.classList.remove("spinning"),u){d.taxa=Number(w.selic_aa);const g=document.getElementById("sim-taxa");g&&document.activeElement!==g&&(g.value=d.taxa,Z({taxa:d.taxa}))}return}if(c){ht({metaId:c.dataset.aporte||null});return}if(p){d.metaId=p.dataset.sim,q(),setTimeout(()=>{var u;return(u=document.querySelector(".lib-sim"))==null?void 0:u.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(b){const u=_.find(g=>g.id===b.dataset.metaEdit);u&&gt(u);return}if(h){if(i.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:u}=await k.from("aportes_fin").delete().eq("id",h.dataset.aid);if(u)return x("Erro: "+u.message,"err");x("Aporte removido"),q();return}const A=i.target.closest("[data-ap-edit]");if(A){const u=B.find(g=>g.id===A.dataset.apEdit);u&&ht({aporte:u})}})}function Z(t){Object.assign(d,t);const e=document.getElementById("content"),a=_.find(A=>A.id===d.metaId)||_.find(A=>A.principal)||_[0];if(!a)return;const s=e.querySelectorAll(".lib-slider-v");s[0]&&(s[0].textContent=d.taxa.toFixed(2)+"% a.a."),s[1]&&(s[1].textContent=`${d.meses} meses (${(d.meses/12).toFixed(1)} anos)`);const o=K(a),n=Number(a.valor_alvo),l=ut({pv:o,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),i=l[l.length-1],c=i.aportado,p=e.querySelector(".lib-sim-chart");if(p){const A=p.querySelector(".lib-chart-legend");p.innerHTML=Mt(l,n,d.fases)+(A?A.outerHTML:""),It(p)}const b=e.querySelectorAll("#lib-stats .lib-stat-val"),h=e.querySelectorAll("#lib-stats .lib-stat-sub");b[2]&&(b[2].textContent=y(i.saldo),h[2].textContent="Juros: "+y(i.saldo-c));const $=st({pv:o,fases:d.fases,taxaAA:d.taxa,meta:n});b[3]&&(b[3].textContent=y(Math.max(0,n-o)),h[3].textContent=$!=null?`Bate em ${ot($)}`:"Aumente o aporte")}function ht({metaId:t=null,aporte:e=null}={}){var h,$,A;const a=new Date().toISOString().slice(0,10),s=J(),o=!!e,n=o?e.meta_id||"":t||((h=_.find(u=>u.principal))==null?void 0:h.id)||(($=_[0])==null?void 0:$.id)||"",l=o?e.valor:s||"",i=o?e.data:a,c=o&&e.fonte||"manual",p=o&&e.observacao||"",b=["manual","faturamento","bonus","outro"].map(u=>`<option value="${u}"${u===c?" selected":""}>${u==="manual"?"Manual":u==="faturamento"?"Faturamento":u==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");$t(o?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${_.map(u=>`<option value="${u.id}"${u.id===n?" selected":""}>${u.icone||"🎯"} ${L(u.nome)}</option>`).join("")}
        <option value=""${n===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${l}">
      ${!o&&s?`<div class="lib-hint">Sugestão: ${y(s)} (${w.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${o?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${i}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${b}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${L(p)}">
    </div>
  `,`
    ${o?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${o?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",X),(A=document.getElementById("ap-del"))==null||A.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:u}=await k.from("aportes_fin").delete().eq("id",e.id);if(u)return x("Erro: "+u.message,"err");X(),x("Aporte removido"),q()}),document.getElementById("ap-save").addEventListener("click",async()=>{const u=parseFloat(document.getElementById("ap-val").value)||0;if(u<=0)return x("Valor inválido","err");const g={valor:u,data:document.getElementById("ap-data").value||a,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:j}=o?await k.from("aportes_fin").update(g).eq("id",e.id):await k.from("aportes_fin").insert(g);if(j)return x("Erro: "+j.message,"err");X(),x(o?"Aporte atualizado":"Aporte registrado 🚀"),q()})}function gt(t={}){var l;const e=!t.id,a=t.icone||ft[0],s=t.cor||rt[_.length%rt.length],o=ft.map(i=>`<button type="button" class="lib-ico-pick${i===a?" on":""}" data-ico="${i}">${i}</button>`).join(""),n=rt.map(i=>`<button type="button" class="lib-cor-pick${i===s?" on":""}" style="background:${i}" data-cor="${i}"></button>`).join("");$t(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${L(t.nome||"")}">
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
      <input type="hidden" id="m-cor" value="${s}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",i=>{const c=i.target.closest(".lib-ico-pick");c&&(document.querySelectorAll(".lib-ico-pick").forEach(p=>p.classList.remove("on")),c.classList.add("on"),document.getElementById("m-ico").value=c.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",i=>{const c=i.target.closest(".lib-cor-pick");c&&(document.querySelectorAll(".lib-cor-pick").forEach(p=>p.classList.remove("on")),c.classList.add("on"),document.getElementById("m-cor").value=c.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",X),(l=document.getElementById("m-del"))==null||l.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${t.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:i}=await k.from("metas_fin").delete().eq("id",t.id);if(i)return x("Erro: "+i.message,"err");X(),x("Meta excluída"),q()}),document.getElementById("m-save").addEventListener("click",async()=>{const i=document.getElementById("m-nome").value.trim(),c=parseFloat(document.getElementById("m-alvo").value)||0;if(!i)return x("Nome obrigatório","err");if(c<=0)return x("Valor alvo inválido","err");const p=document.getElementById("m-principal").checked,b={nome:i,valor_alvo:c,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:p,atualizado_em:new Date().toISOString()};p&&await k.from("metas_fin").update({principal:!1}).neq("id",t.id||"00000000-0000-0000-0000-000000000000");const{error:h}=t.id?await k.from("metas_fin").update(b).eq("id",t.id):await k.from("metas_fin").insert(b);if(h)return x("Erro: "+h.message,"err");X(),x(t.id?"Meta atualizada":"Meta criada 🎯"),q()})}function ce(t){return Math.round(t).toLocaleString("pt-BR")}function U(t){return t>=1e6?(t/1e6).toFixed(1).replace(/\.0$/,"")+"M":t>=1e3?(t/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(t).toString()}function ot(t){const e=new Date;return e.setMonth(e.getMonth()+t),xt[e.getMonth()]+"/"+e.getFullYear()}function L(t){return String(t||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function qt(t,e){const a=t.replace("#",""),s=parseInt(a.slice(0,2),16),o=parseInt(a.slice(2,4),16),n=parseInt(a.slice(4,6),16);return`rgba(${s},${o},${n},${e})`}function de(t,e){const a=t.replace("#",""),s=Math.min(255,parseInt(a.slice(0,2),16)+e),o=Math.min(255,parseInt(a.slice(2,4),16)+e),n=Math.min(255,parseInt(a.slice(4,6),16)+e);return`rgb(${s},${o},${n})`}function ue(t,e){const a=t.replace("#",""),s=Math.max(0,parseInt(a.slice(0,2),16)-e),o=Math.max(0,parseInt(a.slice(2,4),16)-e),n=Math.max(0,parseInt(a.slice(4,6),16)-e);return`rgb(${s},${o},${n})`}export{q as render};
