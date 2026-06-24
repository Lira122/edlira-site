import{d as I,s as Z,t as x,c as $,o as Ne,f as se,M as qe,h as Je,j as Ye}from"./index-CLvRET4Q.js";let S=null,_=[],B=[],te=[],ce=[],xe=[],$e=[],me=[],ye=[],ve=null,d={metaId:null,meses:60,taxa:14.25,fases:[{inicio:0,aporte:2e3}]};const he=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],ke=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],Ve=360*60*1e3;let F={open:!1,msgs:[],loading:!1};async function C(){var a;const e=document.getElementById("content");if(e.innerHTML='<div class="empty">Carregando…</div>',await ae(),await _e(),We(),!d.metaId||!_.find(s=>s.id===d.metaId)){const s=_.find(i=>i.principal)||_[0];d.metaId=(s==null?void 0:s.id)||null}(a=d.fases)!=null&&a.length||(d.fases=[{inicio:0,aporte:2e3}]),d.fases[0].aporte=Math.max(d.fases[0].aporte,G()),d.taxa=Number(S.selic_aa)||14.25,e.innerHTML=tt(),vt(e),Le(e);const t=e.querySelector(".lib-sim-chart");t&&De(t)}async function ae(){const[e,t,a,s,i,n,l,r,c]=await Promise.all([I.from("config_fin").select("*").eq("id","main").maybeSingle(),I.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),Z("aportes_fin",{order:{column:"data",ascending:!1}}),Z("faturamento"),Z("despesas",{order:{column:"data",ascending:!1}}),Z("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),Z("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),I.from("caixinhas").select("*").eq("ativa",!0).order("ordem"),Z("caixinhas_mov",{order:{column:"data",ascending:!1}})]);e.error&&x("config_fin: "+e.error.message,"err"),t.error&&x("metas_fin: "+t.error.message,"err"),a.error&&x("aportes_fin: "+a.error.message,"err"),S=e.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},_=t.data||[],B=a.data||[],te=s.data||[],ce=i&&!i.error?i.data||[]:[],xe=n&&!n.error?n.data||[]:[],$e=l&&!l.error?l.data||[]:[],me=r&&!r.error?r.data||[]:[],ye=c&&!c.error?c.data||[]:[]}async function _e({manual:e=!1}={}){var t;try{const a=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!a.ok)return e&&x("BCB respondeu "+a.status,"err"),!1;const s=await a.json(),i=Number((t=s==null?void 0:s[0])==null?void 0:t.valor);if(!isFinite(i)||i<=0)return e&&x("Resposta inválida do BCB","err"),!1;const n=Number(S.selic_aa),l=Math.abs(i-n)>.01,r=new Date().toISOString();return S.selic_aa=i,S.atualizado_em=r,await I.from("config_fin").upsert({id:"main",selic_aa:i,atualizado_em:r}),l?x(`Selic atualizada: ${i.toFixed(2)}% a.a.`):e&&x(`Selic confirmada: ${i.toFixed(2)}% a.a.`),Ge(),!0}catch{return e&&x("Sem conexão com o BCB","err"),!1}}function We(){ve&&clearInterval(ve),ve=setInterval(()=>{_e()},Ve)}function Ge(){const e=document.querySelector(".lib-chip-selic");e&&(e.innerHTML=Ce())}function Ce(){const e=Number(S.selic_aa).toFixed(2),t=S.atualizado_em?Ue(S.atualizado_em):"não verificada";return`<b>Selic</b> ${e}% a.a. <small>BCB · ${t}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function Ue(e){const t=Math.floor((Date.now()-new Date(e).getTime())/1e3);return t<60?"agora":t<3600?`há ${Math.floor(t/60)}min`:t<86400?`há ${Math.floor(t/3600)}h`:t<86400*30?`há ${Math.floor(t/86400)}d`:new Date(e).toLocaleDateString("pt-BR")}function Be(e,t){if(!(e!=null&&e.length))return 0;const a=[...e].sort((i,n)=>i.inicio-n.inicio);let s=0;for(const i of a)i.inicio<=t&&(s=Number(i.aporte)||0);return s}function Ae({pv:e,fases:t,taxaAA:a,meses:s}){const i=Math.pow(1+a/100,.08333333333333333)-1,n=[];let l=e,r=e;for(let c=0;c<=s;c++){if(c>0){const p=Be(t,c-1);l=l*(1+i)+p,r+=p}n.push({mes:c,saldo:l,aportado:r,juros:l-r})}return n}function pe({pv:e,fases:t,taxaAA:a,meta:s}){if(e>=s)return 0;const i=Math.pow(1+a/100,1/12)-1;let n=e,l=0;for(;l<1200;){const r=Be(t,l);if(n=n*(1+i)+r,l++,n>=s)return l;if(r===0&&n<=e*1.0001&&l>12)return null}return null}function Oe(e,t){return te.filter(a=>a.ano===e&&a.mes===t).reduce((a,s)=>a+Number(s.valor||0),0)}function Ee(){const e=new Date;let t=0,a=0;for(let s=1;s<=6;s++){const i=new Date(e.getFullYear(),e.getMonth()-s,1),n=Oe(i.getFullYear(),i.getMonth()+1);n>0&&(t+=n,a++)}return a?t/a:0}function Se(){const e=new Date;return Oe(e.getFullYear(),e.getMonth()+1)}function G(){const e=Number((S==null?void 0:S.aporte_pct_faturamento)||20)/100,t=Ee()||Se();return Math.max(0,Math.round(t*e))}function oe(e){const t=B.filter(a=>a.meta_id===e.id).reduce((a,s)=>a+Number(s.valor||0),0);return Number(e.valor_inicial||0)+t}function ge(e){return B.filter(t=>t.meta_id===e.id)}function Qe(e){const t=new Date().toISOString().slice(0,7);return B.filter(a=>(e?a.meta_id===e:!0)&&(a.data||"").startsWith(t)).reduce((a,s)=>a+Number(s.valor||0),0)}function Xe(e){const t=G()||1;let a=0;const s=new Date;for(let i=0;i<36;i++){const l=new Date(s.getFullYear(),s.getMonth()-i,1).toISOString().slice(0,7),r=B.filter(c=>(e?c.meta_id===e:!0)&&(c.data||"").startsWith(l)).reduce((c,p)=>c+Number(p.valor||0),0);if(r>=t&&r>0)a++;else break}return a}function Ke(){var f;const e=_.find(o=>o.principal)||_[0],t=_.find(o=>o.id===d.metaId)||e,a=new Date().toISOString().slice(0,10),s=new Date,i=_.map(o=>{const m=oe(o);return{nome:o.nome,alvo:Number(o.valor_alvo),saldo_atual:m,progresso_pct:+(m/Number(o.valor_alvo)*100).toFixed(1),principal:o.principal===!0,prazo_meses:o.prazo_meses||null}}),n=B.slice(0,12).map(o=>{var m;return{data:o.data,valor:Number(o.valor),meta:((m=_.find(E=>E.id===o.meta_id))==null?void 0:m.nome)||null,fonte:o.fonte,obs:o.observacao}}),l=[];for(let o=0;o<=11;o++){const m=new Date(s.getFullYear(),s.getMonth()-o,1),E=m.getMonth()+1,w=m.getFullYear(),k=te.filter(N=>N.mes===E&&N.ano===w).reduce((N,q)=>N+Number(q.valor||0),0);l.push({mes:`${w}-${String(E).padStart(2,"0")}`,valor:+k.toFixed(2)})}const r=te.filter(o=>new Date(o.ano,o.mes-1,1)>new Date(s.getFullYear(),s.getMonth(),1)).map(o=>({mes:`${o.ano}-${String(o.mes).padStart(2,"0")}`,valor:+Number(o.valor).toFixed(2),desc:o.descricao||null})),c=a,p=[];for(let o=0;o<=11;o++){const m=new Date(s.getFullYear(),s.getMonth()-o,1);p.push(`${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}`)}const b=ce.filter(o=>p.some(m=>(o.data||"").startsWith(m))&&(o.data||"")<=c),v={},g={};for(const o of b){const m=o.categoria||"outro";v[m]=(v[m]||0)+Number(o.valor||0);const E=(o.data||"").slice(0,7);g[E]=(g[E]||0)+Number(o.valor||0)}const A=Object.values(v).reduce((o,m)=>o+m,0);for(const o of Object.keys(g))g[o]=+g[o].toFixed(2);const u=ce.filter(o=>(o.data||"")>c).sort((o,m)=>(o.data||"").localeCompare(m.data||"")).map(o=>({data:o.data,descricao:o.descricao||"(sem descrição)",categoria:o.categoria||"outro",valor:Number(o.valor||0)})),h={};for(const o of u){const m=o.data.slice(0,7);h[m]||(h[m]={total:0,qtd:0,itens:[]}),h[m].total+=o.valor,h[m].qtd++,h[m].itens.push(`${o.data}: ${o.descricao} (${o.categoria}) — R$${o.valor.toFixed(2)}`)}for(const o of Object.keys(h))h[o].total=+h[o].total.toFixed(2);const O=u.reduce((o,m)=>o+m.valor,0);let J=0;if(u.length){const o=new Date(u[u.length-1].data);J=(o.getFullYear()-s.getFullYear())*12+(o.getMonth()-s.getMonth())}const U=xe.filter(o=>o.ativa).map(o=>({descricao:o.descricao,valor:Number(o.valor),categoria:o.categoria,dia:o.dia_vencimento||null})),Y=U.reduce((o,m)=>o+m.valor,0),D=$e.filter(o=>o.ativa).map(o=>({descricao:o.descricao,valor:Number(o.valor)})),H=D.reduce((o,m)=>o+m.valor,0),j=Math.max(6,J),Q=+(Y*j+O).toFixed(2),R=Number(S.aporte_pct_faturamento||20)/100,M=me.reduce((o,m)=>o+Number(m.valor_mensal||0),0),V=[];for(let o=0;o<=Math.max(12,j);o++){const m=new Date(s.getFullYear(),s.getMonth()+o,1),E=m.getMonth()+1,w=m.getFullYear(),k=`${w}-${String(E).padStart(2,"0")}`,N=o===0,q=te.filter(y=>y.mes===E&&y.ano===w).reduce((y,T)=>y+Number(T.valor||0),0);let X=0;for(const y of $e){if(!y.ativa)continue;te.some(K=>K.recorrente_id===y.id&&K.mes===E&&K.ano===w)||(X+=Number(y.valor||0))}const re=q+X,de=ce.filter(y=>(y.data||"").startsWith(k)).reduce((y,T)=>y+Number(T.valor||0),0);let ne=0;for(const y of xe){if(!y.ativa)continue;ce.some(K=>K.recorrente_id===y.id&&(K.data||"").startsWith(k))||(ne+=Number(y.valor||0))}const ue=de+ne,we=B.filter(y=>(y.data||"").startsWith(k)).reduce((y,T)=>y+Number(T.valor||0),0),Pe=ye.filter(y=>(y.data||"").startsWith(k)).reduce((y,T)=>y+Number(T.valor||0),0),fe=re-ue,He=fe-we-M,Me=Math.round(re*R);V.push({mes:k,receita_prevista:+re.toFixed(2),_receita_breakdown:{lancada:+q.toFixed(2),recorrente_pendente:+X.toFixed(2)},despesa_prevista:+ue.toFixed(2),_despesa_breakdown:{pontuais_lancadas:+de.toFixed(2),recorrentes_pendentes:+ne.toFixed(2)},lucro_bruto:+fe.toFixed(2),aporte_registrado:+we.toFixed(2),caixinhas_alocacao_fixa:+M.toFixed(2),caixinhas_usado_real:+Pe.toFixed(2),sobra_pos_aporte_e_caixinhas:+He.toFixed(2),aporte_sugerido:Me,cabe_aporte_sugerido:fe-M>=Me,atual:N})}const z=s.getMonth()+1,W=s.getFullYear(),ie=me.map(o=>{const m=`${W}-${String(z).padStart(2,"0")}`,E=ye.filter(k=>k.caixinha_id===o.id&&(k.data||"").startsWith(m)).reduce((k,N)=>k+Number(N.valor||0),0),w=o.tipo==="gasto"?Number(o.valor_mensal)-E:null;return{id:o.id,nome:o.nome,tipo:o.tipo,valor_mensal:Number(o.valor_mensal),icone:o.icone,cor:o.cor,usado_mes_atual:+E.toFixed(2),saldo_mes_atual:w!==null?+w.toFixed(2):null}});return{hoje:a,selic_aa:Number(S.selic_aa),selic_atualizada_em:S.atualizado_em,faturamento:{medio_6m:+Ee().toFixed(2),mes_atual:+Se().toFixed(2),ultimos_12_meses:l,futuro_lancado:r,pct_alvo_aporte:Number(S.aporte_pct_faturamento),aporte_sugerido_mensal:G()},despesas_passadas:{total_ultimos_12_meses:+A.toFixed(2),media_mensal_12m:+(A/12).toFixed(2),por_categoria_12m:Object.fromEntries(Object.entries(v).map(([o,m])=>[o,+m.toFixed(2)])),por_mes_12m:g},despesas_futuras_agendadas:{total:+O.toFixed(2),qtd:u.length,horizonte_meses:J,ultima_data:((f=u[u.length-1])==null?void 0:f.data)||null,meses_com_lancamento:Object.keys(h).sort(),por_mes:h,lista_completa:u},contas_fixas_mensais:{total:+Y.toFixed(2),lista:U,total_projetado_no_horizonte:+(Y*j).toFixed(2),meses_projetados:j},receitas_recorrentes:{total_mensal:+H.toFixed(2),lista:D},compromisso_futuro_total:Q,projecao_mensal:V,metas:i,aportes:{total_geral:+B.reduce((o,m)=>o+Number(m.valor||0),0).toFixed(2),qtd_total:B.length,ultimos_12:n},caixinhas:ie,simulador_atual:{meta_em_foco:t==null?void 0:t.nome,taxa_aa:d.taxa,prazo_meses:d.meses,fases:d.fases}}}async function Ze(e){var r,c,p,b;const t=Ye.OR_KEY;if(!t)throw new Error("Chave da IA não disponível. Faça login de novo.");const a=Ke(),s=`Você é um planejador financeiro pessoal direto, brasileiro, sem firula. Conversa com o usuário sobre as finanças dele dentro do CRM "Eleva Digital". Linguagem informal, tipo amigo que entende de finanças. Seja sincero quando os números não fecham.

Você tem acesso COMPLETO ao contexto financeiro dele em JSON abaixo, atualizado AGORA:

\`\`\`json
${JSON.stringify(a,null,2)}
\`\`\`

⭐ **CAMPO MAIS IMPORTANTE — \`projecao_mensal\`**:
É um array com TODOS os meses já calculados (do mês atual até o horizonte). Cada item tem:
- \`mes\` ("AAAA-MM")
- \`receita_prevista\` = receita lançada + recorrente pendente (JÁ SOMADAS — USE ESTE NÚMERO)
- \`despesa_prevista\` = despesas pontuais + recorrentes (JÁ SOMADAS)
- \`lucro_bruto\` = receita − despesa
- \`aporte_registrado\` = quanto JÁ foi registrado em aportes_fin nesse mês
- \`caixinhas_alocacao_fixa\` = soma do valor_mensal de todas caixinhas (compromisso)
- \`sobra_pos_aporte_e_caixinhas\` = lucro − aporte registrado − caixinhas (a sobra REAL)
- \`aporte_sugerido\` = X% do faturamento desse mês
- \`cabe_aporte_sugerido\` = boolean: se sobraria pra fazer o aporte sugerido

Use esse array como fonte da verdade. NÃO some receita + lançamento separado — já tá somado em \`receita_prevista\`. Se a IA cometer erro de aritmética, é nessa parte.

Explicação dos demais campos:
- **faturamento**: dados históricos. \`medio_6m\`, \`mes_atual\`, \`ultimos_12_meses\` mês a mês passado
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

Use IDs reais do contexto (caixinhas[].id). Use APENAS quando o usuário pedir explicitamente ou quando você tiver uma sugestão clara de reorganização. Não polua a resposta com muitos blocos — 1 a 3 por mensagem no máximo.`,i=["anthropic/claude-sonnet-4.6","anthropic/claude-haiku-4.5","meta-llama/llama-3.3-70b-instruct"],n=[{role:"system",content:s},...F.msgs.slice(-10).map(v=>({role:v.role,content:v.content})),{role:"user",content:e}];let l="";for(const v of i){const g=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({model:v,messages:n,max_tokens:800,temperature:.6})});if(g.ok){const u=await g.json();return((b=(p=(c=(r=u==null?void 0:u.choices)==null?void 0:r[0])==null?void 0:c.message)==null?void 0:p.content)==null?void 0:b.trim())||"(sem resposta)"}if(g.status===404){l=`${v} indisponível`;continue}const A=await g.text().catch(()=>"");throw new Error(`OpenRouter ${g.status}: ${A.slice(0,200)}`)}throw new Error(l||"Nenhum modelo disponível")}async function Fe(e){if(!(!e.trim()||F.loading)){F.msgs.push({role:"user",content:e.trim()}),F.loading=!0,P();try{await ae();const t=await Ze(e.trim());F.msgs.push({role:"assistant",content:t})}catch(t){F.msgs.push({role:"assistant",content:"⚠️ Erro: "+t.message})}finally{F.loading=!1,P()}}}function P(){var s;const e=document.getElementById("lib-chat");if(!e)return;const t=((s=Re().match(/<div id="lib-chat"[\s\S]*<\/div>/))==null?void 0:s[0])||"";e.outerHTML=t,Le(document.getElementById("content"));const a=document.getElementById("lib-chat-body");a&&(a.scrollTop=a.scrollHeight)}function Le(e){var s,i,n;(s=e.querySelector("#lib-fab"))==null||s.addEventListener("click",()=>{F.open=!0,P(),setTimeout(()=>{var l;return(l=document.getElementById("lib-chat-text"))==null?void 0:l.focus()},250)}),(i=e.querySelector("#lib-chat-close"))==null||i.addEventListener("click",()=>{F.open=!1,P()}),(n=e.querySelector("#lib-chat-clear"))==null||n.addEventListener("click",()=>{confirm("Limpar conversa?")&&(F.msgs=[],P())});const t=e.querySelector("#lib-chat-input"),a=e.querySelector("#lib-chat-text");t==null||t.addEventListener("submit",l=>{l.preventDefault();const r=a.value;a.value="",a.style.height="auto",Fe(r)}),a==null||a.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),t.requestSubmit())}),a==null||a.addEventListener("input",()=>{a.style.height="auto",a.style.height=Math.min(140,a.scrollHeight)+"px"}),e.querySelectorAll(".lib-chat-sug-btn").forEach(l=>l.addEventListener("click",()=>Fe(l.dataset.sug))),e.querySelectorAll(".lib-chat-apply").forEach(l=>{const r=l.querySelector(".btn");r==null||r.addEventListener("click",async()=>{try{const c=JSON.parse(l.dataset.action);await et(c),r.disabled=!0,r.textContent="✓ Feito"}catch(c){x("Erro ao aplicar: "+c.message,"err")}})})}async function et(e){const t=e.payload||{};switch(e.tipo){case"fases":{if(!Array.isArray(t))throw new Error("payload inválido");d.fases=t.filter(s=>Number.isFinite(+s.inicio)&&Number.isFinite(+s.aporte)).map(s=>({inicio:+s.inicio,aporte:+s.aporte})).sort((s,i)=>s.inicio-i.inicio);const a=d.fases[d.fases.length-1];a&&a.inicio+6>d.meses&&(d.meses=Math.min(240,a.inicio+24)),x("Fases aplicadas no simulador 🎯"),C(),setTimeout(()=>{var s;return(s=document.querySelector(".lib-sim"))==null?void 0:s.scrollIntoView({behavior:"smooth",block:"center"})},100);return}case"caixinha-create":{if(!t.nome||!(+t.valor_mensal>0))throw new Error("nome e valor_mensal obrigatórios");const a={nome:t.nome,valor_mensal:+t.valor_mensal,tipo:t.tipo==="reserva"?"reserva":"gasto",icone:t.icone||"💰",cor:t.cor||"#4A9EFF"},{error:s}=await I.from("caixinhas").insert(a);if(s)throw s;x(`Caixinha "${t.nome}" criada 📦`),await ae(),P();return}case"caixinha-update":{if(!t.id)throw new Error("id obrigatório");const a={atualizado_em:new Date().toISOString()};t.nome&&(a.nome=t.nome),t.valor_mensal!=null&&(a.valor_mensal=+t.valor_mensal),t.tipo&&(a.tipo=t.tipo==="reserva"?"reserva":"gasto"),t.icone&&(a.icone=t.icone),t.cor&&(a.cor=t.cor);const{error:s}=await I.from("caixinhas").update(a).eq("id",t.id);if(s)throw s;x("Caixinha atualizada ✏️"),await ae(),P();return}case"caixinha-mov":{if(!t.caixinha_id||!(+t.valor>0))throw new Error("caixinha_id e valor obrigatórios");const a={caixinha_id:t.caixinha_id,valor:+t.valor,data:t.data||new Date().toISOString().slice(0,10),descricao:t.descricao||null},{error:s}=await I.from("caixinhas_mov").insert(a);if(s)throw s;x("Gasto registrado 💸"),await ae(),P();return}case"caixinha-delete":{if(!t.id)throw new Error("id obrigatório");if(!confirm(`Excluir caixinha "${t.nome||""}"? Movimentações também serão removidas.`))return;const{error:a}=await I.from("caixinhas").delete().eq("id",t.id);if(a)throw a;x("Caixinha excluída"),await ae(),P();return}default:throw new Error("Tipo de ação desconhecido: "+e.tipo)}}function tt(){const e=_.find(s=>s.principal)||_[0],t=_.filter(s=>s!==e),a=_.find(s=>s.id===d.metaId)||e;return`
  <div class="lib">
    ${e?ct(e):lt()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${t.map(dt).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${ut(a)}
    ${mt(a)}
    ${bt()}

    ${at()}
    ${Re()}
  </div>`}function at(){return`
  <button class="lib-fab" id="lib-fab" title="Conversar com a IA financeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span>IA financeira</span>
    <span class="lib-fab-pulse"></span>
  </button>`}function Re(){if(!F.open)return'<div id="lib-chat" class="lib-chat"></div>';const e=F.msgs.length?F.msgs.map(t=>st(t)).join(""):`<div class="lib-chat-empty">
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
          <div class="lib-chat-sub">${F.loading?'<span class="lib-chat-typing">pensando…</span>':"sabe tudo do seu contexto"}</div>
        </div>
      </div>
      <div class="lib-chat-head-acts">
        ${F.msgs.length?'<button class="lib-chat-clear" id="lib-chat-clear" title="Limpar conversa">↻</button>':""}
        <button class="lib-chat-close" id="lib-chat-close" title="Fechar">×</button>
      </div>
    </div>
    <div class="lib-chat-body" id="lib-chat-body">${e}</div>
    <form class="lib-chat-input" id="lib-chat-input">
      <textarea id="lib-chat-text" placeholder="Manda a real... ex: e se eu aumentar pra 5k a partir do mês 6?" rows="1" ${F.loading?"disabled":""}></textarea>
      <button type="submit" class="lib-chat-send" ${F.loading?"disabled":""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  </div>`}function st(e){const t=ot(e.content),a=e.content.replace(/```apply-[a-z-]+[\s\S]*?```/g,"").trim(),s=rt(a),i=e.role==="user"?"user":"ai",n=t.map((l,r)=>{const c=it(l);return`
      <div class="lib-chat-apply" data-action='${nt(JSON.stringify(l))}'>
        <div class="lib-chat-apply-info">
          <div class="lib-chat-apply-lbl">${c.label}</div>
          <div class="lib-chat-apply-desc">${c.desc}</div>
        </div>
        <button class="btn ${c.cls||"bp"} bsm">${c.btn||"Aplicar"}</button>
      </div>`}).join("");return`<div class="lib-msg ${i}">
    ${i==="ai"?'<div class="lib-msg-avatar">🤖</div>':""}
    <div class="lib-msg-bubble">
      ${s}
      ${n}
    </div>
  </div>`}function ot(e){const t=[],a=/```apply-([a-z-]+)\s*([\s\S]*?)```/g;let s;for(;(s=a.exec(e))!==null;){const i=s[1];try{const n=JSON.parse(s[2].trim());t.push({tipo:i,payload:n})}catch{}}return t}function it(e){var a;const t=s=>me.find(i=>i.id===s);switch(e.tipo){case"fases":return{label:"💡 Sugestão pro simulador",desc:(Array.isArray(e.payload)?e.payload:[]).map(n=>`${+n.inicio==0?"Início":`mês ${+n.inicio}+`}: ${$(+n.aporte)}`).join(" · "),btn:"Aplicar fases"};case"caixinha-create":{const s=e.payload||{};return{label:"📦 Criar caixinha",desc:`${s.icone||"💰"} ${s.nome||"?"} · ${$(+s.valor_mensal||0)}/mês · ${s.tipo==="reserva"?"reserva":"gasto"}`,btn:"Criar"}}case"caixinha-update":{const s=e.payload||{},i=t(s.id),n=[];return s.nome&&s.nome!==(i==null?void 0:i.nome)&&n.push(`nome → "${s.nome}"`),s.valor_mensal!=null&&+s.valor_mensal!=+(i==null?void 0:i.valor_mensal)&&n.push(`valor → ${$(+s.valor_mensal)}`),s.icone&&s.icone!==(i==null?void 0:i.icone)&&n.push(`ícone → ${s.icone}`),s.cor&&s.cor!==(i==null?void 0:i.cor)&&n.push("nova cor"),{label:`✏️ Atualizar "${(i==null?void 0:i.nome)||"caixinha"}"`,desc:n.join(" · ")||"sem mudanças",btn:"Aplicar"}}case"caixinha-mov":{const s=e.payload||{},i=t(s.caixinha_id);return{label:`− Gasto em "${(i==null?void 0:i.nome)||"caixinha"}"`,desc:`${s.data||"hoje"} · ${$(+s.valor||0)} · ${s.descricao||"sem desc"}`,btn:"Registrar"}}case"caixinha-delete":{const s=e.payload||{};return{label:"🗑️ Excluir caixinha",desc:`"${s.nome||((a=t(s.id))==null?void 0:a.nome)||"caixinha"}" — movimentações também serão removidas`,cls:"bd",btn:"Excluir"}}default:return{label:e.tipo,desc:JSON.stringify(e.payload).slice(0,80)}}}function rt(e){return L(e).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.+<\/li>\n?)+/g,t=>`<ul>${t}</ul>`).replace(/\n/g,"<br>")}function nt(e){return String(e).replace(/'/g,"&#39;").replace(/"/g,"&quot;")}function lt(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function ct(e){const t=oe(e),a=Number(e.valor_alvo),s=Math.min(100,t/a*100),i=G(),n=Qe(e.id),l=Xe(e.id),r=pe({pv:t,fases:[{inicio:0,aporte:i}],taxaAA:Number(S.selic_aa),meta:a});return`
  <div class="lib-hero" style="--meta-color:${e.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${e.icone||"🎯"}</span> META PRINCIPAL · ${L(e.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${ht(t)}</div>
      <div class="lib-hero-sub">
        de <strong>${$(a)}</strong>
        · ${s.toFixed(1)}% do caminho
        ${r!=null?` · faltam <strong>${r}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${s.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${Ce()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${$(i)}/mês <small>(${Number(S.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${$(n)} ${n>=i?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${l} ${l===1?"mês":"meses"} 🔥</span>
      </div>
    </div>

    <div class="lib-hero-right">
      ${pt(s,e.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${e.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${e.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function dt(e){const t=oe(e),a=Number(e.valor_alvo),s=Math.min(100,t/a*100),i=e.cor||"#C5F82A",n=G(),l=pe({pv:t,fases:[{inicio:0,aporte:n}],taxaAA:Number(S.selic_aa),meta:a}),r=t>=a;return`
  <div class="lib-meta-card${r?" done":""}" style="--meta-color:${i}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${Te(i,.14)};color:${i}">${e.icone||"🎯"}</div>
      <div class="lib-meta-name">${L(e.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${e.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${$(t)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${$(a)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${s.toFixed(2)}%;background:${i}"></div></div>
    <div class="lib-meta-foot">
      <span>${s.toFixed(0)}%</span>
      ${r?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${l!=null?`${l}m no ritmo`:"sem prazo"}</span>`}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${e.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${e.id}">Simular</button>
    </div>
  </div>`}function ut(e){if(!e)return"";const t=oe(e),a=Number(e.valor_alvo),s=Ae({pv:t,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),i=s[s.length-1];i.aportado;const n=i.juros,l=pe({pv:t,fases:d.fases,taxaAA:d.taxa,meta:a});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${$(t)}</div>
      <div class="lib-stat-sub">${ge(e).length} aporte${ge(e).length===1?"":"s"} registrado${ge(e).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${$(Ee())}</div>
      <div class="lib-stat-sub">Mês atual: ${$(Se())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${d.meses}m</div>
      <div class="lib-stat-val ac">${$(i.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${$(n)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${$(Math.max(0,a-t))}</div>
      <div class="lib-stat-sub">${l!=null?`Bate em ${be(l)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function mt(e){if(!e)return"";const t=oe(e),a=Number(e.valor_alvo),s=Ae({pv:t,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),i=G()||1e3,n=d.fases.map((l,r)=>`
    <div class="lib-fase" data-fase-idx="${r}">
      <div class="lib-fase-when">
        ${r===0?'<span class="lib-fase-tag">Início</span>':`<input type="number" class="lib-fase-inicio" min="1" max="${d.meses}" step="1" value="${l.inicio}"> <small>em diante</small>`}
      </div>
      <div class="lib-fase-val">
        <input type="number" class="lib-fase-aporte" min="0" step="100" value="${l.aporte}"> <small>R$/mês</small>
      </div>
      ${r>0?'<button class="lib-fase-del" title="Remover fase">×</button>':""}
    </div>
  `).join("");return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${L(e.nome)}</strong>
          ${_.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${_.map(l=>`<option value="${l.id}"${l.id===e.id?" selected":""}>${l.icone||"🎯"} ${L(l.nome)}</option>`).join("")}
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
            <button class="lib-qk" data-pmt="${i}">${$(i)}</button>
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
        ${ze(s,a,d.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${$(a)}</span>
        </div>
      </div>
    </div>
  </div>`}function pt(e,t){const s=2*Math.PI*86,i=s*Math.min(100,e)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${gt(t,30)}"/>
          <stop offset=".5" stop-color="${t}"/>
          <stop offset="1" stop-color="${xt(t,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${i} ${s-i}"
              stroke-dashoffset="${s/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${e.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function ze(e,t,a=null){const n={t:38,r:90,b:32,l:56},l=760-n.l-n.r,r=290-n.t-n.b,c=Math.max(t,...e.map(f=>f.saldo))*1.08,p=f=>n.l+f/(e.length-1)*l,b=f=>n.t+r-Math.max(0,f)/c*r;function v(f){const o=e.map((w,k)=>[p(k),b(w[f])]);if(o.length<2)return"";let m=`M ${o[0][0].toFixed(1)} ${o[0][1].toFixed(1)}`;const E=.18;for(let w=0;w<o.length-1;w++){const k=o[w-1]||o[w],N=o[w],q=o[w+1],X=o[w+2]||q,re=N[0]+(q[0]-k[0])*E,de=N[1]+(q[1]-k[1])*E,ne=q[0]-(X[0]-N[0])*E,ue=q[1]-(X[1]-N[1])*E;m+=` C ${re.toFixed(1)} ${de.toFixed(1)}, ${ne.toFixed(1)} ${ue.toFixed(1)}, ${q[0].toFixed(1)} ${q[1].toFixed(1)}`}return m}const g=v("saldo"),A=v("aportado"),u=v("juros"),h=p(e.length-1),O=b(0),J=`${g} L ${h.toFixed(1)} ${O.toFixed(1)} L ${n.l} ${O.toFixed(1)} Z`,U=[0,.5,1].map(f=>{const o=c*f;return`<g>
      <line x1="${n.l}" x2="${760-n.r}" y1="${b(o)}" y2="${b(o)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${f===0?"":"2 4"}"/>
      <text x="${n.l-10}" y="${b(o)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${ee(o)}</text>
    </g>`}).join(""),D=[0,Math.floor(e.length/2),e.length-1].map(f=>{const o=e[f];return`<text x="${p(f)}" y="280" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${o.mes}m</text>`}).join("");let H="";a&&a.length>1&&(H=a.slice(1).map(f=>{if(f.inicio<=0||f.inicio>=e.length)return"";const o=p(f.inicio);return`
        <line x1="${o}" x2="${o}" y1="${n.t}" y2="${n.t+r}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${o} ${n.t-14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${ee(f.aporte)}/m</text>
        </g>`}).join(""));let j="",Q="";if(t<=c){const f=b(t);j=`
      <line x1="${n.l}" x2="${760-n.r}" y1="${f}" y2="${f}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-n.r+4} ${f})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${ee(t)}</text>
      </g>`;const o=e.findIndex(m=>m.saldo>=t);if(o>0){const m=p(o),E=b(e[o].saldo);Q=`
        <g class="lib-chart-cross" transform="translate(${m} ${E})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${e[o].mes}m · ${be(e[o].mes).toUpperCase()}</text>
          </g>
        </g>`}}const R=e[e.length-1],M=`
    <g transform="translate(${h+8} ${b(R.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${ee(R.saldo)}</text>
    </g>
    <g transform="translate(${h+8} ${b(R.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${ee(R.aportado)}</text>
    </g>
    <g transform="translate(${h+8} ${b(R.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${ee(R.juros)}</text>
    </g>`,V=e.map((f,o)=>p(o).toFixed(1)).join(","),z=e.map(f=>Math.round(f.saldo)).join(","),W=e.map(f=>Math.round(f.aportado)).join(","),ie=e.map(f=>Math.round(f.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 290" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="290" data-pad-l="${n.l}" data-pad-r="${n.r}"
       data-pad-t="${n.t}" data-pad-b="${n.b}"
       data-xs="${V}" data-saldo="${z}" data-aportado="${W}" data-juros="${ie}"
       data-meses="${e.map(f=>f.mes).join(",")}">
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

    ${U}
    ${H}
    ${j}

    <path d="${J}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${A}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${u}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${g}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${Q}
    ${M}
    ${D}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${n.t}" y2="${n.t+r}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${n.l}" y="${n.t}" width="${l}" height="${r}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function De(e){const t=e.querySelector(".lib-chart"),a=e.querySelector(".lib-chart-tooltip");if(!t||!a)return;const s=t.querySelector(".lib-chart-hover"),i=t.querySelector(".lib-chart-hit"),n=t.querySelector(".lib-chart-vline"),l=t.querySelector(".lib-chart-dot-s"),r=t.querySelector(".lib-chart-dot-a"),c=t.querySelector(".lib-chart-dot-j"),p=t.dataset.xs.split(",").map(Number),b=t.dataset.saldo.split(",").map(Number),v=t.dataset.aportado.split(",").map(Number),g=t.dataset.juros.split(",").map(Number),A=t.dataset.meses.split(",").map(Number),u=+t.dataset.w,h=+t.dataset.h,O=+t.dataset.padT,J=+t.dataset.padB,U=Math.max(...b)*1.08,Y=h-O-J,D=H=>O+Y-Math.max(0,H)/U*Y;i.addEventListener("mousemove",H=>{const j=t.getBoundingClientRect(),Q=u/j.width,R=(H.clientX-j.left)*Q;let M=0,V=1/0;for(let f=0;f<p.length;f++){const o=Math.abs(p[f]-R);o<V&&(V=o,M=f)}const z=p[M];s.style.opacity=1,n.setAttribute("x1",z),n.setAttribute("x2",z),l.setAttribute("cx",z),l.setAttribute("cy",D(b[M])),r.setAttribute("cx",z),r.setAttribute("cy",D(v[M])),c.setAttribute("cx",z),c.setAttribute("cy",D(g[M]));const W=z/u*j.width,ie=W>j.width/2?"left":"right";a.style.opacity=1,a.style.left=ie==="right"?W+14+"px":W-14-a.offsetWidth+"px",a.style.top=Math.max(8,D(b[M])/h*j.height-a.offsetHeight/2)+"px",a.querySelector(".lib-tt-mes").textContent=`${A[M]}m · ${be(A[M])}`,a.querySelector(".lib-tt-s").textContent=$(b[M]),a.querySelector(".lib-tt-a").textContent=$(v[M]),a.querySelector(".lib-tt-j").textContent=$(g[M])}),i.addEventListener("mouseleave",()=>{s.style.opacity=0,a.style.opacity=0})}function bt(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${B.length?ft():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function ft(){const e={};for(const t of B){const a=(t.data||"").slice(0,7);e[a]||(e[a]=[]),e[a].push(t)}return Object.entries(e).sort((t,a)=>a[0].localeCompare(t[0])).map(([t,a])=>{const[s,i]=t.split("-"),n=a.reduce((l,r)=>l+Number(r.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${qe[parseInt(i)-1]} / ${s}</span>
        <span class="lib-mes-tot">${$(n)}</span>
      </div>
      ${a.map(l=>{const r=_.find(c=>c.id===l.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${l.id}" title="Clica pra editar">
          <div class="lib-ap-data">${Je(l.data)}</div>
          <div class="lib-ap-meta">${r?`<span class="lib-ap-tag" style="background:${Te(r.cor||"#C5F82A",.15)};color:${r.cor||"#C5F82A"}">${r.icone||"🎯"} ${L(r.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${L(l.fonte||"manual")}${l.observacao?" · "+L(l.observacao):""}</div>
          <div class="lib-ap-val">${$(Number(l.valor))}</div>
          <button class="lib-ap-del" data-aid="${l.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function vt(e){var t,a,s,i,n,l;e.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(r=>r.addEventListener("click",()=>je())),(t=e.querySelector("#sim-taxa"))==null||t.addEventListener("input",r=>le({taxa:+r.target.value})),(a=e.querySelector("#sim-meses"))==null||a.addEventListener("input",r=>le({meses:+r.target.value})),(s=e.querySelector("#sim-meta"))==null||s.addEventListener("change",r=>{d.metaId=r.target.value,C()}),(i=e.querySelector("#lib-fases-list"))==null||i.addEventListener("input",r=>{const c=r.target.closest(".lib-fase");if(!c)return;const p=+c.dataset.faseIdx;if(d.fases[p]){if(r.target.classList.contains("lib-fase-aporte"))d.fases[p].aporte=Math.max(0,+r.target.value||0),le({});else if(r.target.classList.contains("lib-fase-inicio")){const b=Math.max(1,+r.target.value||1);if(d.fases[p].inicio=b,b+6>d.meses){d.meses=Math.min(240,b+24),C();return}le({})}}}),(n=e.querySelector("#lib-fase-add"))==null||n.addEventListener("click",()=>{const r=d.fases[d.fases.length-1],c=((r==null?void 0:r.inicio)||0)+12,p=Math.round(((r==null?void 0:r.aporte)||2e3)*1.5);d.fases.push({inicio:c,aporte:p}),c+6>d.meses&&(d.meses=Math.min(240,c+24)),C(),setTimeout(()=>{var b;return(b=document.querySelector(".lib-fase:last-child .lib-fase-aporte"))==null?void 0:b.focus()},50)}),(l=e.querySelector("#lib-fases-list"))==null||l.addEventListener("click",r=>{const c=r.target.closest(".lib-fase-del");if(!c)return;const b=+c.closest(".lib-fase").dataset.faseIdx;b!==0&&(d.fases.splice(b,1),C())}),e.querySelectorAll(".lib-qk").forEach(r=>r.addEventListener("click",()=>{d.fases[0].aporte=+r.dataset.pmt,C()})),e.addEventListener("click",async r=>{const c=r.target.closest("[data-aporte]"),p=r.target.closest("[data-sim]"),b=r.target.closest("[data-meta-edit]"),v=r.target.closest(".lib-ap-del"),g=r.target.closest("#lib-selic-refresh");if(g){r.stopPropagation(),g.classList.add("spinning");const u=await _e({manual:!0});if(g.classList.remove("spinning"),u){d.taxa=Number(S.selic_aa);const h=document.getElementById("sim-taxa");h&&document.activeElement!==h&&(h.value=d.taxa,le({taxa:d.taxa}))}return}if(c){Ie({metaId:c.dataset.aporte||null});return}if(p){d.metaId=p.dataset.sim,C(),setTimeout(()=>{var u;return(u=document.querySelector(".lib-sim"))==null?void 0:u.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(b){const u=_.find(h=>h.id===b.dataset.metaEdit);u&&je(u);return}if(v){if(r.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:u}=await I.from("aportes_fin").delete().eq("id",v.dataset.aid);if(u)return x("Erro: "+u.message,"err");x("Aporte removido"),C();return}const A=r.target.closest("[data-ap-edit]");if(A){const u=B.find(h=>h.id===A.dataset.apEdit);u&&Ie({aporte:u})}})}function le(e){Object.assign(d,e);const t=document.getElementById("content"),a=_.find(A=>A.id===d.metaId)||_.find(A=>A.principal)||_[0];if(!a)return;const s=t.querySelectorAll(".lib-slider-v");s[0]&&(s[0].textContent=d.taxa.toFixed(2)+"% a.a."),s[1]&&(s[1].textContent=`${d.meses} meses (${(d.meses/12).toFixed(1)} anos)`);const i=oe(a),n=Number(a.valor_alvo),l=Ae({pv:i,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),r=l[l.length-1],c=r.aportado,p=t.querySelector(".lib-sim-chart");if(p){const A=p.querySelector(".lib-chart-legend");p.innerHTML=ze(l,n,d.fases)+(A?A.outerHTML:""),De(p)}const b=t.querySelectorAll("#lib-stats .lib-stat-val"),v=t.querySelectorAll("#lib-stats .lib-stat-sub");b[2]&&(b[2].textContent=$(r.saldo),v[2].textContent="Juros: "+$(r.saldo-c));const g=pe({pv:i,fases:d.fases,taxaAA:d.taxa,meta:n});b[3]&&(b[3].textContent=$(Math.max(0,n-i)),v[3].textContent=g!=null?`Bate em ${be(g)}`:"Aumente o aporte")}function Ie({metaId:e=null,aporte:t=null}={}){var v,g,A;const a=new Date().toISOString().slice(0,10),s=G(),i=!!t,n=i?t.meta_id||"":e||((v=_.find(u=>u.principal))==null?void 0:v.id)||((g=_[0])==null?void 0:g.id)||"",l=i?t.valor:s||"",r=i?t.data:a,c=i&&t.fonte||"manual",p=i&&t.observacao||"",b=["manual","faturamento","bonus","outro"].map(u=>`<option value="${u}"${u===c?" selected":""}>${u==="manual"?"Manual":u==="faturamento"?"Faturamento":u==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");Ne(i?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${_.map(u=>`<option value="${u.id}"${u.id===n?" selected":""}>${u.icone||"🎯"} ${L(u.nome)}</option>`).join("")}
        <option value=""${n===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${l}">
      ${!i&&s?`<div class="lib-hint">Sugestão: ${$(s)} (${S.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${i?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${r}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${b}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${L(p)}">
    </div>
  `,`
    ${i?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${i?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",se),(A=document.getElementById("ap-del"))==null||A.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:u}=await I.from("aportes_fin").delete().eq("id",t.id);if(u)return x("Erro: "+u.message,"err");se(),x("Aporte removido"),C()}),document.getElementById("ap-save").addEventListener("click",async()=>{const u=parseFloat(document.getElementById("ap-val").value)||0;if(u<=0)return x("Valor inválido","err");const h={valor:u,data:document.getElementById("ap-data").value||a,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:O}=i?await I.from("aportes_fin").update(h).eq("id",t.id):await I.from("aportes_fin").insert(h);if(O)return x("Erro: "+O.message,"err");se(),x(i?"Aporte atualizado":"Aporte registrado 🚀"),C()})}function je(e={}){var l;const t=!e.id,a=e.icone||ke[0],s=e.cor||he[_.length%he.length],i=ke.map(r=>`<button type="button" class="lib-ico-pick${r===a?" on":""}" data-ico="${r}">${r}</button>`).join(""),n=he.map(r=>`<button type="button" class="lib-cor-pick${r===s?" on":""}" style="background:${r}" data-cor="${r}"></button>`).join("");Ne(t?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${L(e.nome||"")}">
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Valor alvo (R$)</label>
        <input class="fi" type="number" id="m-alvo" step="100" placeholder="15000" value="${e.valor_alvo||""}">
      </div>
      <div class="fg"><label class="fl">Saldo inicial (R$)</label>
        <input class="fi" type="number" id="m-ini" step="100" placeholder="0" value="${e.valor_inicial||0}">
        <div class="lib-hint">Quanto você já tem reservado pra essa meta</div>
      </div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Prazo (meses, opcional)</label>
        <input class="fi" type="number" id="m-prazo" step="1" placeholder="Sem prazo" value="${e.prazo_meses||""}">
      </div>
      <div class="fg"><label class="fl">
        <input type="checkbox" id="m-principal"${e.principal?" checked":""}> Marcar como meta principal
      </label>
      <div class="lib-hint">A principal vai no hero (só uma por vez)</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Ícone</label>
      <div class="lib-ico-row" id="m-icones">${i}</div>
      <input type="hidden" id="m-ico" value="${a}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${n}</div>
      <input type="hidden" id="m-cor" value="${s}">
    </div>
  `,`
    ${t?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",r=>{const c=r.target.closest(".lib-ico-pick");c&&(document.querySelectorAll(".lib-ico-pick").forEach(p=>p.classList.remove("on")),c.classList.add("on"),document.getElementById("m-ico").value=c.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",r=>{const c=r.target.closest(".lib-cor-pick");c&&(document.querySelectorAll(".lib-cor-pick").forEach(p=>p.classList.remove("on")),c.classList.add("on"),document.getElementById("m-cor").value=c.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",se),(l=document.getElementById("m-del"))==null||l.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${e.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:r}=await I.from("metas_fin").delete().eq("id",e.id);if(r)return x("Erro: "+r.message,"err");se(),x("Meta excluída"),C()}),document.getElementById("m-save").addEventListener("click",async()=>{const r=document.getElementById("m-nome").value.trim(),c=parseFloat(document.getElementById("m-alvo").value)||0;if(!r)return x("Nome obrigatório","err");if(c<=0)return x("Valor alvo inválido","err");const p=document.getElementById("m-principal").checked,b={nome:r,valor_alvo:c,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:p,atualizado_em:new Date().toISOString()};p&&await I.from("metas_fin").update({principal:!1}).neq("id",e.id||"00000000-0000-0000-0000-000000000000");const{error:v}=e.id?await I.from("metas_fin").update(b).eq("id",e.id):await I.from("metas_fin").insert(b);if(v)return x("Erro: "+v.message,"err");se(),x(e.id?"Meta atualizada":"Meta criada 🎯"),C()})}function ht(e){return Math.round(e).toLocaleString("pt-BR")}function ee(e){return e>=1e6?(e/1e6).toFixed(1).replace(/\.0$/,"")+"M":e>=1e3?(e/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(e).toString()}function be(e){const t=new Date;return t.setMonth(t.getMonth()+e),qe[t.getMonth()]+"/"+t.getFullYear()}function L(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function Te(e,t){const a=e.replace("#",""),s=parseInt(a.slice(0,2),16),i=parseInt(a.slice(2,4),16),n=parseInt(a.slice(4,6),16);return`rgba(${s},${i},${n},${t})`}function gt(e,t){const a=e.replace("#",""),s=Math.min(255,parseInt(a.slice(0,2),16)+t),i=Math.min(255,parseInt(a.slice(2,4),16)+t),n=Math.min(255,parseInt(a.slice(4,6),16)+t);return`rgb(${s},${i},${n})`}function xt(e,t){const a=e.replace("#",""),s=Math.max(0,parseInt(a.slice(0,2),16)-t),i=Math.max(0,parseInt(a.slice(2,4),16)-t),n=Math.max(0,parseInt(a.slice(4,6),16)-t);return`rgb(${s},${i},${n})`}export{C as render};
