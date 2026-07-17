import{d as M,s as ea,t as h,c as x,o as qa,f as oa,M as Ca,h as Da,j as Ua}from"./index-CSO0r_Qf.js";let E=null,$=[],L=[],sa=[],ca=[],$a=[],_a=[],fa=[],ya=[],Ba=[],ha=null,d={metaId:null,meses:60,taxa:14.25,fases:[{inicio:0,aporte:2e3}]};const ga=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#EC4899","#34D399","#FF6B35","#06B6D4"],ka=["🚀","💻","✈️","🏠","🚗","💍","📚","🎓","🎯","💰","🏖️","📱","🎸","🎮"],Qa=360*60*1e3;let N={open:!1,msgs:[],loading:!1};async function q(){var s;const a=document.getElementById("content");if(a.innerHTML='<div class="empty">Carregando…</div>',await J(),await Aa(),Ka(),!d.metaId||!$.find(t=>t.id===d.metaId)){const t=$.find(o=>o.principal)||$[0];d.metaId=(t==null?void 0:t.id)||null}(s=d.fases)!=null&&s.length||(d.fases=[{inicio:0,aporte:2e3}]),d.fases[0].aporte=Math.max(d.fases[0].aporte,X()),d.taxa=Number(E.selic_aa)||14.25,a.innerHTML=ie(),_e(a),Ta(a);const e=a.querySelector(".lib-sim-chart");e&&Ya(e)}async function J(){const[a,e,s,t,o,n,l,c,r,u]=await Promise.all([M.from("config_fin").select("*").eq("id","main").maybeSingle(),M.from("metas_fin").select("*").neq("status","arquivada").order("principal",{ascending:!1}).order("ordem"),ea("aportes_fin",{order:{column:"data",ascending:!1}}),ea("faturamento"),ea("despesas",{order:{column:"data",ascending:!1}}),ea("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),ea("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),M.from("caixinhas").select("*").eq("ativa",!0).order("ordem"),ea("caixinhas_mov",{order:{column:"data",ascending:!1}}),M.from("planos_fin").select("*").eq("ativo",!0)]);a.error&&h("config_fin: "+a.error.message,"err"),e.error&&h("metas_fin: "+e.error.message,"err"),s.error&&h("aportes_fin: "+s.error.message,"err"),E=a.data||{id:"main",meta_brl:1e5,saldo_atual_brl:0,selic_aa:14.25,aporte_pct_faturamento:20},$=e.data||[],L=s.data||[],sa=t.data||[],ca=o&&!o.error?o.data||[]:[],$a=n&&!n.error?n.data||[]:[],_a=l&&!l.error?l.data||[]:[],fa=c&&!c.error?c.data||[]:[],ya=r&&!r.error?r.data||[]:[],Ba=u&&!u.error?u.data||[]:[]}function Oa(a){return Ba.find(e=>e.meta_id===a)}async function La({metaId:a,nome:e,fases:s,taxaAA:t,meses:o,pvInicial:n,alvo:l,projFinal:c}){if(!a)throw new Error("meta_id obrigatório");await M.from("planos_fin").update({ativo:!1,atualizado_em:new Date().toISOString()}).eq("meta_id",a).eq("ativo",!0);const r={meta_id:a,nome:e||"Plano "+new Date().toISOString().slice(0,10),fases:s,taxa_aa:t,meses_total:o,pv_inicial:n,valor_alvo:l,proj_final:c,ativo:!0,atualizado_em:new Date().toISOString()},{error:u}=await M.from("planos_fin").insert(r);if(u)throw u}function Xa(a,e=new Date){const s=new Date(a.criado_em),t=(e.getFullYear()-s.getFullYear())*12+(e.getMonth()-s.getMonth());return t<0||t>=a.meses_total?0:wa(a.fases,t)}async function Aa({manual:a=!1}={}){var e;try{const s=await fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json");if(!s.ok)return a&&h("BCB respondeu "+s.status,"err"),!1;const t=await s.json(),o=Number((e=t==null?void 0:t[0])==null?void 0:e.valor);if(!isFinite(o)||o<=0)return a&&h("Resposta inválida do BCB","err"),!1;const n=Number(E.selic_aa),l=Math.abs(o-n)>.01,c=new Date().toISOString();return E.selic_aa=o,E.atualizado_em=c,await M.from("config_fin").upsert({id:"main",selic_aa:o,atualizado_em:c}),l?h(`Selic atualizada: ${o.toFixed(2)}% a.a.`):a&&h(`Selic confirmada: ${o.toFixed(2)}% a.a.`),Za(),!0}catch{return a&&h("Sem conexão com o BCB","err"),!1}}function Ka(){ha&&clearInterval(ha),ha=setInterval(()=>{Aa()},Qa)}function Za(){const a=document.querySelector(".lib-chip-selic");a&&(a.innerHTML=Ra())}function Ra(){const a=Number(E.selic_aa).toFixed(2),e=E.atualizado_em?ae(E.atualizado_em):"não verificada";return`<b>Selic</b> ${a}% a.a. <small>BCB · ${e}</small>
    <button class="lib-selic-refresh" id="lib-selic-refresh" title="Atualizar agora">↻</button>`}function ae(a){const e=Math.floor((Date.now()-new Date(a).getTime())/1e3);return e<60?"agora":e<3600?`há ${Math.floor(e/60)}min`:e<86400?`há ${Math.floor(e/3600)}h`:e<86400*30?`há ${Math.floor(e/86400)}d`:new Date(a).toLocaleDateString("pt-BR")}function wa(a,e){if(!(a!=null&&a.length))return 0;const s=[...a].sort((o,n)=>o.inicio-n.inicio);let t=0;for(const o of s)o.inicio<=e&&(t=Number(o.aporte)||0);return t}function da({pv:a,fases:e,taxaAA:s,meses:t}){const o=Math.pow(1+s/100,.08333333333333333)-1,n=[];let l=a,c=a;for(let r=0;r<=t;r++){if(r>0){const u=wa(e,r-1);l=l*(1+o)+u,c+=u}n.push({mes:r,saldo:l,aportado:c,juros:l-c})}return n}function ua({pv:a,fases:e,taxaAA:s,meta:t}){if(a>=t)return 0;const o=Math.pow(1+s/100,1/12)-1;let n=a,l=0;for(;l<1200;){const c=wa(e,l);if(n=n*(1+o)+c,l++,n>=t)return l;if(c===0&&n<=a*1.0001&&l>12)return null}return null}function za(a,e){return sa.filter(s=>s.ano===a&&s.mes===e).reduce((s,t)=>s+Number(t.valor||0),0)}function Sa(){const a=new Date;let e=0,s=0;for(let t=1;t<=6;t++){const o=new Date(a.getFullYear(),a.getMonth()-t,1),n=za(o.getFullYear(),o.getMonth()+1);n>0&&(e+=n,s++)}return s?e/s:0}function Ma(){const a=new Date;return za(a.getFullYear(),a.getMonth()+1)}function X(){const a=Number((E==null?void 0:E.aporte_pct_faturamento)||20)/100,e=Sa()||Ma();return Math.max(0,Math.round(e*a))}function V(a){const e=L.filter(s=>s.meta_id===a.id).reduce((s,t)=>s+Number(t.valor||0),0);return Number(a.valor_inicial||0)+e}function xa(a){return L.filter(e=>e.meta_id===a.id)}function Pa(a){const e=new Date().toISOString().slice(0,7);return L.filter(s=>(a?s.meta_id===a:!0)&&(s.data||"").startsWith(e)).reduce((s,t)=>s+Number(t.valor||0),0)}function ee(a){const e=X()||1;let s=0;const t=new Date;for(let o=0;o<36;o++){const l=new Date(t.getFullYear(),t.getMonth()-o,1).toISOString().slice(0,7),c=L.filter(r=>(a?r.meta_id===a:!0)&&(r.data||"").startsWith(l)).reduce((r,u)=>r+Number(u.valor||0),0);if(c>=e&&c>0)s++;else break}return s}function te(){var v;const a=$.find(i=>i.principal)||$[0],e=$.find(i=>i.id===d.metaId)||a,s=new Date().toISOString().slice(0,10),t=new Date,o=$.map(i=>{const p=V(i);return{nome:i.nome,alvo:Number(i.valor_alvo),saldo_atual:p,progresso_pct:+(p/Number(i.valor_alvo)*100).toFixed(1),principal:i.principal===!0,prazo_meses:i.prazo_meses||null}}),n=L.slice(0,12).map(i=>{var p;return{data:i.data,valor:Number(i.valor),meta:((p=$.find(S=>S.id===i.meta_id))==null?void 0:p.nome)||null,fonte:i.fonte,obs:i.observacao}}),l=[];for(let i=0;i<=11;i++){const p=new Date(t.getFullYear(),t.getMonth()-i,1),S=p.getMonth()+1,F=p.getFullYear(),j=sa.filter(B=>B.mes===S&&B.ano===F).reduce((B,O)=>B+Number(O.valor||0),0);l.push({mes:`${F}-${String(S).padStart(2,"0")}`,valor:+j.toFixed(2)})}const c=sa.filter(i=>new Date(i.ano,i.mes-1,1)>new Date(t.getFullYear(),t.getMonth(),1)).map(i=>({mes:`${i.ano}-${String(i.mes).padStart(2,"0")}`,valor:+Number(i.valor).toFixed(2),desc:i.descricao||null})),r=s,u=[];for(let i=0;i<=11;i++){const p=new Date(t.getFullYear(),t.getMonth()-i,1);u.push(`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,"0")}`)}const m=ca.filter(i=>u.some(p=>(i.data||"").startsWith(p))&&(i.data||"")<=r),b={},g={};for(const i of m){const p=i.categoria||"outro";b[p]=(b[p]||0)+Number(i.valor||0);const S=(i.data||"").slice(0,7);g[S]=(g[S]||0)+Number(i.valor||0)}const w=Object.values(b).reduce((i,p)=>i+p,0);for(const i of Object.keys(g))g[i]=+g[i].toFixed(2);const f=ca.filter(i=>(i.data||"")>r).sort((i,p)=>(i.data||"").localeCompare(p.data||"")).map(i=>({data:i.data,descricao:i.descricao||"(sem descrição)",categoria:i.categoria||"outro",valor:Number(i.valor||0)})),y={};for(const i of f){const p=i.data.slice(0,7);y[p]||(y[p]={total:0,qtd:0,itens:[]}),y[p].total+=i.valor,y[p].qtd++,y[p].itens.push(`${i.data}: ${i.descricao} (${i.categoria}) — R$${i.valor.toFixed(2)}`)}for(const i of Object.keys(y))y[i].total=+y[i].total.toFixed(2);const C=f.reduce((i,p)=>i+p.valor,0);let _=0;if(f.length){const i=new Date(f[f.length-1].data);_=(i.getFullYear()-t.getFullYear())*12+(i.getMonth()-t.getMonth())}const k=$a.filter(i=>i.ativa).map(i=>({descricao:i.descricao,valor:Number(i.valor),categoria:i.categoria,dia:i.dia_vencimento||null})),G=k.reduce((i,p)=>i+p.valor,0),T=_a.filter(i=>i.ativa).map(i=>({descricao:i.descricao,valor:Number(i.valor)})),W=T.reduce((i,p)=>i+p.valor,0),D=Math.max(6,_),K=+(G*D+C).toFixed(2),z=Number(E.aporte_pct_faturamento||20)/100,I=fa.reduce((i,p)=>i+Number(p.valor_mensal||0),0),U=[];for(let i=0;i<=Math.max(12,D);i++){const p=new Date(t.getFullYear(),t.getMonth()+i,1),S=p.getMonth()+1,F=p.getFullYear(),j=`${F}-${String(S).padStart(2,"0")}`,B=i===0,O=sa.filter(A=>A.mes===S&&A.ano===F).reduce((A,H)=>A+Number(H.valor||0),0);let Z=0;for(const A of _a){if(!A.ativa)continue;sa.some(aa=>aa.recorrente_id===A.id&&aa.mes===S&&aa.ano===F)||(Z+=Number(A.valor||0))}const na=O+Z,pa=ca.filter(A=>(A.data||"").startsWith(j)).reduce((A,H)=>A+Number(H.valor||0),0);let ra=0;for(const A of $a){if(!A.ativa)continue;ca.some(aa=>aa.recorrente_id===A.id&&(aa.data||"").startsWith(j))||(ra+=Number(A.valor||0))}const ba=pa+ra,Ea=L.filter(A=>(A.data||"").startsWith(j)).reduce((A,H)=>A+Number(H.valor||0),0),Wa=ya.filter(A=>(A.data||"").startsWith(j)).reduce((A,H)=>A+Number(H.valor||0),0),va=na-ba,Ga=va-Ea-I,Fa=Math.round(na*z);U.push({mes:j,receita_prevista:+na.toFixed(2),_receita_breakdown:{lancada:+O.toFixed(2),recorrente_pendente:+Z.toFixed(2)},despesa_prevista:+ba.toFixed(2),_despesa_breakdown:{pontuais_lancadas:+pa.toFixed(2),recorrentes_pendentes:+ra.toFixed(2)},lucro_bruto:+va.toFixed(2),aporte_registrado:+Ea.toFixed(2),caixinhas_alocacao_fixa:+I.toFixed(2),caixinhas_usado_real:+Wa.toFixed(2),sobra_pos_aporte_e_caixinhas:+Ga.toFixed(2),aporte_sugerido:Fa,cabe_aporte_sugerido:va-I>=Fa,atual:B})}const P=t.getMonth()+1,Q=t.getFullYear(),ia=fa.map(i=>{const p=`${Q}-${String(P).padStart(2,"0")}`,S=ya.filter(j=>j.caixinha_id===i.id&&(j.data||"").startsWith(p)).reduce((j,B)=>j+Number(B.valor||0),0),F=i.tipo==="gasto"?Number(i.valor_mensal)-S:null;return{id:i.id,nome:i.nome,tipo:i.tipo,valor_mensal:Number(i.valor_mensal),icone:i.icone,cor:i.cor,usado_mes_atual:+S.toFixed(2),saldo_mes_atual:F!==null?+F.toFixed(2):null}});return{hoje:s,selic_aa:Number(E.selic_aa),selic_atualizada_em:E.atualizado_em,faturamento:{medio_6m:+Sa().toFixed(2),mes_atual:+Ma().toFixed(2),ultimos_12_meses:l,futuro_lancado:c,pct_alvo_aporte:Number(E.aporte_pct_faturamento),aporte_sugerido_mensal:X()},despesas_passadas:{total_ultimos_12_meses:+w.toFixed(2),media_mensal_12m:+(w/12).toFixed(2),por_categoria_12m:Object.fromEntries(Object.entries(b).map(([i,p])=>[i,+p.toFixed(2)])),por_mes_12m:g},despesas_futuras_agendadas:{total:+C.toFixed(2),qtd:f.length,horizonte_meses:_,ultima_data:((v=f[f.length-1])==null?void 0:v.data)||null,meses_com_lancamento:Object.keys(y).sort(),por_mes:y,lista_completa:f},contas_fixas_mensais:{total:+G.toFixed(2),lista:k,total_projetado_no_horizonte:+(G*D).toFixed(2),meses_projetados:D},receitas_recorrentes:{total_mensal:+W.toFixed(2),lista:T},compromisso_futuro_total:K,projecao_mensal:U,metas:o,aportes:{total_geral:+L.reduce((i,p)=>i+Number(p.valor||0),0).toFixed(2),qtd_total:L.length,ultimos_12:n},caixinhas:ia,simulador_atual:{meta_em_foco:e==null?void 0:e.nome,taxa_aa:d.taxa,prazo_meses:d.meses,fases:d.fases}}}async function se(a){var c,r,u,m;const e=Ua.OR_KEY;if(!e)throw new Error("Chave da IA não disponível. Faça login de novo.");const s=te(),t=`Você é um planejador financeiro pessoal direto, brasileiro, sem firula. Conversa com o usuário sobre as finanças dele dentro do CRM "Eleva Digital". Linguagem informal, tipo amigo que entende de finanças. Seja sincero quando os números não fecham.

Você tem acesso COMPLETO ao contexto financeiro dele em JSON abaixo, atualizado AGORA:

\`\`\`json
${JSON.stringify(s,null,2)}
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
- Taxa Selic atual: ${s.selic_aa}% a.a.
- LUCRO LÍQUIDO REAL = faturamento.mes_atual − contas_fixas_mensais.total − despesas_futuras_agendadas (no mês) − despesas_passadas (no mês). É a capacidade de aporte real
- Faz contas de cabeça (juros compostos: FV = PV·(1+i)^n + PMT·((1+i)^n−1)/i com i mensal)
- Não invente dados que não estão no contexto. Se faltar, pergunta
- Respostas curtas e práticas (2-4 parágrafos), a não ser que ele peça detalhe
- Pode ser provocativo se ele tiver gastando mais do que faturando ou aportando pouco

⚠️ IMPORTANTE — HORIZONTE DE PROJEÇÃO:
Quando o usuário pedir fluxo mensal ou projeção, vá ATÉ \`despesas_futuras_agendadas.ultima_data\` (não corte em 6 meses por hábito).
- A lista \`despesas_futuras_agendadas.meses_com_lancamento\` mostra TODOS os meses que têm despesa agendada. ITERE POR TODOS ELES — não pule nenhum.
- Hoje o usuário tem ${s.despesas_futuras_agendadas.qtd} despesas futuras cadastradas, indo até **${s.despesas_futuras_agendadas.ultima_data||"nenhuma"}** (horizonte de ${s.despesas_futuras_agendadas.horizonte_meses} meses)
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
{"caixinha_id": "uuid-aqui", "valor": 80, "descricao": "Posto Shell", "data": "${s.hoje}"}
\`\`\`

5. **Excluir caixinha**:
\`\`\`apply-caixinha-delete
{"id": "uuid-aqui", "nome": "Gasolina"}
\`\`\`

6. **Salvar PLANO** (estratégia de longo prazo vinculada a uma meta — fica persistido pra tracking):
\`\`\`apply-plano-save
{"meta_id": "uuid-da-meta", "nome": "Plano agressivo 100k", "fases": [{"inicio":0,"aporte":2500},{"inicio":3,"aporte":4000}], "taxa_aa": 14.25, "meses": 24}
\`\`\`
   Use isso quando o usuário disser "salvar como plano", "vamos com esse plano", ou aprovar uma estratégia que você sugeriu. Plano fica visível no card da meta com tracking mês a mês. Cada meta tem só 1 plano ativo (salvar novo desativa o anterior).

Use IDs reais do contexto. Use APENAS quando o usuário pedir explicitamente ou quando você tiver uma sugestão clara. Não polua com muitos blocos — 1-3 por mensagem.`,o=["anthropic/claude-sonnet-4.6","anthropic/claude-haiku-4.5","meta-llama/llama-3.3-70b-instruct"],n=[{role:"system",content:t},...N.msgs.slice(-10).map(b=>({role:b.role,content:b.content})),{role:"user",content:a}];let l="";for(const b of o){const g=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json"},body:JSON.stringify({model:b,messages:n,max_tokens:800,temperature:.6})});if(g.ok){const f=await g.json();return((m=(u=(r=(c=f==null?void 0:f.choices)==null?void 0:c[0])==null?void 0:r.message)==null?void 0:u.content)==null?void 0:m.trim())||"(sem resposta)"}if(g.status===404){l=`${b} indisponível`;continue}const w=await g.text().catch(()=>"");throw new Error(`OpenRouter ${g.status}: ${w.slice(0,200)}`)}throw new Error(l||"Nenhum modelo disponível")}async function Ia(a){if(!(!a.trim()||N.loading)){N.msgs.push({role:"user",content:a.trim()}),N.loading=!0,Y();try{await J();const e=await se(a.trim());N.msgs.push({role:"assistant",content:e})}catch(e){N.msgs.push({role:"assistant",content:"⚠️ Erro: "+e.message})}finally{N.loading=!1,Y()}}}function Y(){var t;const a=document.getElementById("lib-chat");if(!a)return;const e=((t=Ha().match(/<div id="lib-chat"[\s\S]*<\/div>/))==null?void 0:t[0])||"";a.outerHTML=e,Ta(document.getElementById("content"));const s=document.getElementById("lib-chat-body");s&&(s.scrollTop=s.scrollHeight)}function Ta(a){var t,o,n;(t=a.querySelector("#lib-fab"))==null||t.addEventListener("click",()=>{N.open=!0,Y(),setTimeout(()=>{var l;return(l=document.getElementById("lib-chat-text"))==null?void 0:l.focus()},250)}),(o=a.querySelector("#lib-chat-close"))==null||o.addEventListener("click",()=>{N.open=!1,Y()}),(n=a.querySelector("#lib-chat-clear"))==null||n.addEventListener("click",()=>{confirm("Limpar conversa?")&&(N.msgs=[],Y())});const e=a.querySelector("#lib-chat-input"),s=a.querySelector("#lib-chat-text");e==null||e.addEventListener("submit",l=>{l.preventDefault();const c=s.value;s.value="",s.style.height="auto",Ia(c)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),e.requestSubmit())}),s==null||s.addEventListener("input",()=>{s.style.height="auto",s.style.height=Math.min(140,s.scrollHeight)+"px"}),a.querySelectorAll(".lib-chat-sug-btn").forEach(l=>l.addEventListener("click",()=>Ia(l.dataset.sug))),a.querySelectorAll(".lib-chat-apply").forEach(l=>{const c=l.querySelector(".btn");c==null||c.addEventListener("click",async()=>{try{const r=JSON.parse(l.dataset.action);await oe(r),c.disabled=!0,c.textContent="✓ Feito"}catch(r){h("Erro ao aplicar: "+r.message,"err")}})})}async function oe(a){var s;const e=a.payload||{};switch(a.tipo){case"fases":{if(!Array.isArray(e))throw new Error("payload inválido");d.fases=e.filter(o=>Number.isFinite(+o.inicio)&&Number.isFinite(+o.aporte)).map(o=>({inicio:+o.inicio,aporte:+o.aporte})).sort((o,n)=>o.inicio-n.inicio);const t=d.fases[d.fases.length-1];t&&t.inicio+6>d.meses&&(d.meses=Math.min(240,t.inicio+24)),h("Fases aplicadas no simulador 🎯"),q(),setTimeout(()=>{var o;return(o=document.querySelector(".lib-sim"))==null?void 0:o.scrollIntoView({behavior:"smooth",block:"center"})},100);return}case"caixinha-create":{if(!e.nome||!(+e.valor_mensal>0))throw new Error("nome e valor_mensal obrigatórios");const t={nome:e.nome,valor_mensal:+e.valor_mensal,tipo:e.tipo==="reserva"?"reserva":"gasto",icone:e.icone||"💰",cor:e.cor||"#4A9EFF"},{error:o}=await M.from("caixinhas").insert(t);if(o)throw o;h(`Caixinha "${e.nome}" criada 📦`),await J(),Y();return}case"caixinha-update":{if(!e.id)throw new Error("id obrigatório");const t={atualizado_em:new Date().toISOString()};e.nome&&(t.nome=e.nome),e.valor_mensal!=null&&(t.valor_mensal=+e.valor_mensal),e.tipo&&(t.tipo=e.tipo==="reserva"?"reserva":"gasto"),e.icone&&(t.icone=e.icone),e.cor&&(t.cor=e.cor);const{error:o}=await M.from("caixinhas").update(t).eq("id",e.id);if(o)throw o;h("Caixinha atualizada ✏️"),await J(),Y();return}case"caixinha-mov":{if(!e.caixinha_id||!(+e.valor>0))throw new Error("caixinha_id e valor obrigatórios");const t={caixinha_id:e.caixinha_id,valor:+e.valor,data:e.data||new Date().toISOString().slice(0,10),descricao:e.descricao||null},{error:o}=await M.from("caixinhas_mov").insert(t);if(o)throw o;h("Gasto registrado 💸"),await J(),Y();return}case"caixinha-delete":{if(!e.id)throw new Error("id obrigatório");if(!confirm(`Excluir caixinha "${e.nome||""}"? Movimentações também serão removidas.`))return;const{error:t}=await M.from("caixinhas").delete().eq("id",e.id);if(t)throw t;h("Caixinha excluída"),await J(),Y();return}case"plano-save":{if(!e.meta_id||!Array.isArray(e.fases)||!e.fases.length)throw new Error("meta_id e fases obrigatórios");const t=$.find(m=>m.id===e.meta_id);if(!t)throw new Error("Meta não encontrada");const o=V(t),n=Number(t.valor_alvo),l=+e.taxa_aa||d.taxa||14.25,c=+e.meses||24,r=da({pv:o,fases:e.fases,taxaAA:l,meses:c}),u=((s=r[r.length-1])==null?void 0:s.saldo)||null;await La({metaId:e.meta_id,nome:e.nome||"Plano IA",fases:e.fases.map(m=>({inicio:+m.inicio,aporte:+m.aporte})),taxaAA:l,meses:c,pvInicial:o,alvo:n,projFinal:u!=null?+u.toFixed(2):null}),h(`Plano "${e.nome||"IA"}" salvo 📋`),await J(),q();return}default:throw new Error("Tipo de ação desconhecido: "+a.tipo)}}function ie(){const a=$.find(t=>t.principal)||$[0],e=$.filter(t=>t!==a),s=$.find(t=>t.id===d.metaId)||a;return`
  <div class="lib">
    ${a?pe(a):me()}

    <div class="lib-metas-head">
      <h3>Outras metas</h3>
      <button class="btn bp bsm" id="lib-add-meta">+ Nova meta</button>
    </div>
    <div class="lib-metas-grid">
      ${e.map(fe).join("")}
      <div class="lib-meta-card lib-meta-add" id="lib-add-meta-2">
        <div class="lib-meta-add-icon">＋</div>
        <div class="lib-meta-add-lbl">Nova meta</div>
        <div class="lib-meta-add-sub">Macbook, viagem, carro…</div>
      </div>
    </div>

    ${ve(s)}
    ${he(s)}
    ${xe()}

    ${ne()}
    ${Ha()}
  </div>`}function ne(){return`
  <button class="lib-fab" id="lib-fab" title="Conversar com a IA financeira">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span>IA financeira</span>
    <span class="lib-fab-pulse"></span>
  </button>`}function Ha(){if(!N.open)return'<div id="lib-chat" class="lib-chat"></div>';const a=N.msgs.length?N.msgs.map(e=>re(e)).join(""):`<div class="lib-chat-empty">
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
          <div class="lib-chat-sub">${N.loading?'<span class="lib-chat-typing">pensando…</span>':"sabe tudo do seu contexto"}</div>
        </div>
      </div>
      <div class="lib-chat-head-acts">
        ${N.msgs.length?'<button class="lib-chat-clear" id="lib-chat-clear" title="Limpar conversa">↻</button>':""}
        <button class="lib-chat-close" id="lib-chat-close" title="Fechar">×</button>
      </div>
    </div>
    <div class="lib-chat-body" id="lib-chat-body">${a}</div>
    <form class="lib-chat-input" id="lib-chat-input">
      <textarea id="lib-chat-text" placeholder="Manda a real... ex: e se eu aumentar pra 5k a partir do mês 6?" rows="1" ${N.loading?"disabled":""}></textarea>
      <button type="submit" class="lib-chat-send" ${N.loading?"disabled":""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </form>
  </div>`}function re(a){const e=le(a.content),s=a.content.replace(/```apply-[a-z-]+[\s\S]*?```/g,"").trim(),t=de(s),o=a.role==="user"?"user":"ai",n=e.map((l,c)=>{const r=ce(l);return`
      <div class="lib-chat-apply" data-action='${ue(JSON.stringify(l))}'>
        <div class="lib-chat-apply-info">
          <div class="lib-chat-apply-lbl">${r.label}</div>
          <div class="lib-chat-apply-desc">${r.desc}</div>
        </div>
        <button class="btn ${r.cls||"bp"} bsm">${r.btn||"Aplicar"}</button>
      </div>`}).join("");return`<div class="lib-msg ${o}">
    ${o==="ai"?'<div class="lib-msg-avatar">🤖</div>':""}
    <div class="lib-msg-bubble">
      ${t}
      ${n}
    </div>
  </div>`}function le(a){const e=[],s=/```apply-([a-z-]+)\s*([\s\S]*?)```/g;let t;for(;(t=s.exec(a))!==null;){const o=t[1];try{const n=JSON.parse(t[2].trim());e.push({tipo:o,payload:n})}catch{}}return e}function ce(a){var s;const e=t=>fa.find(o=>o.id===t);switch(a.tipo){case"fases":return{label:"💡 Sugestão pro simulador",desc:(Array.isArray(a.payload)?a.payload:[]).map(n=>`${+n.inicio==0?"Início":`mês ${+n.inicio}+`}: ${x(+n.aporte)}`).join(" · "),btn:"Aplicar fases"};case"caixinha-create":{const t=a.payload||{};return{label:"📦 Criar caixinha",desc:`${t.icone||"💰"} ${t.nome||"?"} · ${x(+t.valor_mensal||0)}/mês · ${t.tipo==="reserva"?"reserva":"gasto"}`,btn:"Criar"}}case"caixinha-update":{const t=a.payload||{},o=e(t.id),n=[];return t.nome&&t.nome!==(o==null?void 0:o.nome)&&n.push(`nome → "${t.nome}"`),t.valor_mensal!=null&&+t.valor_mensal!=+(o==null?void 0:o.valor_mensal)&&n.push(`valor → ${x(+t.valor_mensal)}`),t.icone&&t.icone!==(o==null?void 0:o.icone)&&n.push(`ícone → ${t.icone}`),t.cor&&t.cor!==(o==null?void 0:o.cor)&&n.push("nova cor"),{label:`✏️ Atualizar "${(o==null?void 0:o.nome)||"caixinha"}"`,desc:n.join(" · ")||"sem mudanças",btn:"Aplicar"}}case"caixinha-mov":{const t=a.payload||{},o=e(t.caixinha_id);return{label:`− Gasto em "${(o==null?void 0:o.nome)||"caixinha"}"`,desc:`${t.data||"hoje"} · ${x(+t.valor||0)} · ${t.descricao||"sem desc"}`,btn:"Registrar"}}case"caixinha-delete":{const t=a.payload||{};return{label:"🗑️ Excluir caixinha",desc:`"${t.nome||((s=e(t.id))==null?void 0:s.nome)||"caixinha"}" — movimentações também serão removidas`,cls:"bd",btn:"Excluir"}}case"plano-save":{const t=a.payload||{},o=$.find(l=>l.id===t.meta_id),n=Array.isArray(t.fases)?t.fases.map(l=>`${+l.inicio==0?"M0":"M"+ +l.inicio+"+"}: ${x(+l.aporte)}`).join(" · "):"?";return{label:`📋 Salvar plano "${t.nome||"sem nome"}"`,desc:`Meta: ${(o==null?void 0:o.icone)||"🎯"} ${(o==null?void 0:o.nome)||"?"} · ${t.meses}m · ${t.taxa_aa}% · ${n}`,btn:"Salvar plano"}}default:return{label:a.tipo,desc:JSON.stringify(a.payload).slice(0,80)}}}function de(a){return R(a).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/^- (.+)$/gm,"<li>$1</li>").replace(/(<li>.+<\/li>\n?)+/g,e=>`<ul>${e}</ul>`).replace(/\n/g,"<br>")}function ue(a){return String(a).replace(/'/g,"&#39;").replace(/"/g,"&quot;")}function me(){return`<div class="empty" style="padding:60px;text-align:center">
    <div style="font-size:42px;margin-bottom:14px">🎯</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:6px">Nenhuma meta cadastrada</div>
    <div style="font-size:13px;color:var(--text-3);margin-bottom:20px">Crie sua primeira meta financeira</div>
    <button class="btn bp" id="lib-add-meta">+ Nova meta</button>
  </div>`}function pe(a){const e=V(a),s=Number(a.valor_alvo),t=Math.min(100,e/s*100),o=X(),n=Pa(a.id),l=ee(a.id),c=ua({pv:e,fases:[{inicio:0,aporte:o}],taxaAA:Number(E.selic_aa),meta:s});return`
  <div class="lib-hero" style="--meta-color:${a.cor||"#C5F82A"}">
    <div class="lib-hero-left">
      <div class="lib-eyebrow"><span class="lib-meta-ico">${a.icone||"🎯"}</span> META PRINCIPAL · ${R(a.nome)}</div>
      <div class="lib-hero-big"><span class="lib-curr">R$</span>${ye(e)}</div>
      <div class="lib-hero-sub">
        de <strong>${x(s)}</strong>
        · ${t.toFixed(1)}% do caminho
        ${c!=null?` · faltam <strong>${c}</strong> meses no aporte sugerido`:""}
      </div>
      <div class="lib-bar"><div class="lib-bar-fill" style="width:${t.toFixed(2)}%"></div></div>

      <div class="lib-hero-chips">
        <span class="lib-chip lib-chip-selic">${Ra()}</span>
        <span class="lib-chip"><b>Aporte sug.</b> ${x(o)}/mês <small>(${Number(E.aporte_pct_faturamento)}% do fat)</small></span>
        <span class="lib-chip"><b>Este mês</b> ${x(n)} ${n>=o?'<span class="lib-ok">●</span>':'<span class="lib-warn">●</span>'}</span>
        <span class="lib-chip"><b>Streak</b> ${l} ${l===1?"mês":"meses"} 🔥</span>
      </div>

      ${be(a)}
    </div>

    <div class="lib-hero-right">
      ${ge(t,a.cor||"#C5F82A")}
      <div class="lib-hero-acts">
        <button class="btn bp" data-aporte="${a.id}">+ Aporte aqui</button>
        <button class="btn bg bsm" data-meta-edit="${a.id}">⚙ Editar</button>
      </div>
    </div>
  </div>`}function be(a){const e=Oa(a.id);if(!e)return`<div class="lib-plano-empty">
      <span>📋 Sem plano ativo —</span>
      <button class="lib-plano-link" data-plano-novo="${a.id}">salvar simulação atual como plano</button>
    </div>`;const s=Xa(e),t=Pa(a.id),o=s>0?Math.min(100,t/s*100):100,n=o>=100?"ok":o>=70?"warn":"late",l=new Date(e.criado_em),c=(new Date().getFullYear()-l.getFullYear())*12+(new Date().getMonth()-l.getMonth());Math.max(0,e.meses_total-c);const r=V(a),u=ua({pv:r,fases:e.fases,taxaAA:Number(e.taxa_aa),meta:Number(e.valor_alvo)}),m=(e.fases||[]).map(b=>`<span class="lib-plano-fase">${+b.inicio==0?"M0":"M"+ +b.inicio+"+"} <b>${x(+b.aporte)}</b></span>`).join('<span class="lib-plano-fase-sep">›</span>');return`
  <div class="lib-plano">
    <div class="lib-plano-head">
      <div class="lib-plano-tit">
        <span class="lib-plano-ico">📋</span>
        <span class="lib-plano-nome">${R(e.nome)}</span>
        <span class="lib-plano-meta">criado ${Da(e.criado_em.slice(0,10))} · ${c}/${e.meses_total}m</span>
      </div>
      <button class="lib-plano-edit" data-plano-del="${e.id}" title="Remover plano">×</button>
    </div>
    <div class="lib-plano-fases">${m}</div>
    <div class="lib-plano-stats">
      <div class="lib-plano-stat">
        <div class="lib-plano-stat-lbl">Aporte esperado este mês</div>
        <div class="lib-plano-stat-val">${x(s)}</div>
      </div>
      <div class="lib-plano-stat">
        <div class="lib-plano-stat-lbl">Aporte feito este mês</div>
        <div class="lib-plano-stat-val ${n}">${x(t)} <small>(${o.toFixed(0)}%)</small></div>
      </div>
      <div class="lib-plano-stat">
        <div class="lib-plano-stat-lbl">ETA atual</div>
        <div class="lib-plano-stat-val">${u!=null?`${u}m · ${ma(u)}`:"—"}</div>
      </div>
    </div>
  </div>`}function fe(a){const e=V(a),s=Number(a.valor_alvo),t=Math.min(100,e/s*100),o=a.cor||"#C5F82A",n=X(),l=ua({pv:e,fases:[{inicio:0,aporte:n}],taxaAA:Number(E.selic_aa),meta:s}),c=e>=s;return`
  <div class="lib-meta-card${c?" done":""}" style="--meta-color:${o}">
    <div class="lib-meta-top">
      <div class="lib-meta-ico-box" style="background:${Va(o,.14)};color:${o}">${a.icone||"🎯"}</div>
      <div class="lib-meta-name">${R(a.nome)}</div>
      <button class="lib-meta-menu" data-meta-edit="${a.id}" title="Editar">⋯</button>
    </div>
    <div class="lib-meta-val">
      <span class="lib-meta-cur">${x(e)}</span>
      <span class="lib-meta-sep">/</span>
      <span class="lib-meta-alvo">${x(s)}</span>
    </div>
    <div class="lib-meta-bar"><div class="lib-meta-bar-fill" style="width:${t.toFixed(2)}%;background:${o}"></div></div>
    <div class="lib-meta-foot">
      <span>${t.toFixed(0)}%</span>
      ${c?'<span class="lib-done-tag">✓ Atingida</span>':`<span>${l!=null?`${l}m no ritmo`:"sem prazo"}</span>`}
      ${Oa(a.id)?'<span class="lib-plano-flag" title="Plano ativo">📋</span>':""}
    </div>
    <div class="lib-meta-acts">
      <button class="btn bp bsm" data-aporte="${a.id}">+ Aporte</button>
      <button class="btn bg bsm" data-sim="${a.id}">Simular</button>
    </div>
  </div>`}function ve(a){if(!a)return"";const e=V(a),s=Number(a.valor_alvo),t=da({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=t[t.length-1];o.aportado;const n=o.juros,l=ua({pv:e,fases:d.fases,taxaAA:d.taxa,meta:s});return`
  <div class="lib-stats" id="lib-stats">
    <div class="lib-stat">
      <div class="lib-stat-key">Saldo da meta</div>
      <div class="lib-stat-val">${x(e)}</div>
      <div class="lib-stat-sub">${xa(a).length} aporte${xa(a).length===1?"":"s"} registrado${xa(a).length===1?"":"s"}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Faturamento médio 6m</div>
      <div class="lib-stat-val">${x(Sa())}</div>
      <div class="lib-stat-sub">Mês atual: ${x(Ma())}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Projeção em ${d.meses}m</div>
      <div class="lib-stat-val ac">${x(o.saldo)}</div>
      <div class="lib-stat-sub">Juros: ${x(n)}</div>
    </div>
    <div class="lib-stat">
      <div class="lib-stat-key">Falta pra meta</div>
      <div class="lib-stat-val">${x(Math.max(0,s-e))}</div>
      <div class="lib-stat-sub">${l!=null?`Bate em ${ma(l)}`:"Aumente o aporte"}</div>
    </div>
  </div>`}function he(a){if(!a)return"";const e=V(a),s=Number(a.valor_alvo),t=da({pv:e,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),o=X()||1e3,n=d.fases.map((l,c)=>`
    <div class="lib-fase" data-fase-idx="${c}">
      <div class="lib-fase-when">
        ${c===0?'<span class="lib-fase-tag">Início</span>':`<input type="number" class="lib-fase-inicio" min="1" max="${d.meses}" step="1" value="${l.inicio}"> <small>em diante</small>`}
      </div>
      <div class="lib-fase-val">
        <input type="number" class="lib-fase-aporte" min="0" step="100" value="${l.aporte}"> <small>R$/mês</small>
      </div>
      ${c>0?'<button class="lib-fase-del" title="Remover fase">×</button>':""}
    </div>
  `).join("");return`
  <div class="lib-block">
    <div class="lib-block-head">
      <div>
        <h3>Simulador de juros compostos</h3>
        <div class="lib-block-sub">
          Projetando: <strong>${R(a.nome)}</strong>
          ${$.length>1?`
            <select class="lib-meta-select" id="sim-meta">
              ${$.map(l=>`<option value="${l.id}"${l.id===a.id?" selected":""}>${l.icone||"🎯"} ${R(l.nome)}</option>`).join("")}
            </select>
          `:""}
        </div>
      </div>
      <button class="btn bp bsm" id="lib-salvar-plano" title="Salvar essas fases como plano persistente">📋 Salvar como plano</button>
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
        ${Ja(t,s,d.fases)}
        <div class="lib-chart-legend">
          <span><i style="background:var(--accent)"></i>Saldo total</span>
          <span><i style="background:#4A9EFF"></i>Aportado</span>
          <span><i style="background:#A78BFA"></i>Juros</span>
          <span><i style="background:rgba(255,255,255,.25);height:2px;width:14px;border-radius:0"></i>Meta ${x(s)}</span>
        </div>
      </div>
    </div>
  </div>`}function ge(a,e){const t=2*Math.PI*86,o=t*Math.min(100,a)/100;return`
  <div class="lib-ring">
    <svg viewBox="0 0 220 220" width="220" height="220">
      <defs>
        <linearGradient id="lg-ring" x1="0" y1="0" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="${Ae(e,30)}"/>
          <stop offset=".5" stop-color="${e}"/>
          <stop offset="1" stop-color="${we(e,25)}"/>
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r="86" stroke="rgba(255,255,255,.06)" stroke-width="14" fill="none"/>
      <circle cx="110" cy="110" r="86" stroke="url(#lg-ring)" stroke-width="14" fill="none"
              stroke-linecap="round" stroke-dasharray="${o} ${t-o}"
              stroke-dashoffset="${t/4}" transform="rotate(-90 110 110)"
              style="transition: stroke-dasharray 800ms cubic-bezier(.2,.7,.2,1);">
      </circle>
    </svg>
    <div class="lib-ring-inner">
      <div class="lib-ring-pct">${a.toFixed(1)}<small>%</small></div>
      <div class="lib-ring-lbl">da meta</div>
    </div>
  </div>`}function Ja(a,e,s=null){const n={t:38,r:90,b:32,l:56},l=760-n.l-n.r,c=290-n.t-n.b,r=Math.max(e,...a.map(v=>v.saldo))*1.08,u=v=>n.l+v/(a.length-1)*l,m=v=>n.t+c-Math.max(0,v)/r*c;function b(v){const i=a.map((F,j)=>[u(j),m(F[v])]);if(i.length<2)return"";let p=`M ${i[0][0].toFixed(1)} ${i[0][1].toFixed(1)}`;const S=.18;for(let F=0;F<i.length-1;F++){const j=i[F-1]||i[F],B=i[F],O=i[F+1],Z=i[F+2]||O,na=B[0]+(O[0]-j[0])*S,pa=B[1]+(O[1]-j[1])*S,ra=O[0]-(Z[0]-B[0])*S,ba=O[1]-(Z[1]-B[1])*S;p+=` C ${na.toFixed(1)} ${pa.toFixed(1)}, ${ra.toFixed(1)} ${ba.toFixed(1)}, ${O[0].toFixed(1)} ${O[1].toFixed(1)}`}return p}const g=b("saldo"),w=b("aportado"),f=b("juros"),y=u(a.length-1),C=m(0),_=`${g} L ${y.toFixed(1)} ${C.toFixed(1)} L ${n.l} ${C.toFixed(1)} Z`,k=[0,.5,1].map(v=>{const i=r*v;return`<g>
      <line x1="${n.l}" x2="${760-n.r}" y1="${m(i)}" y2="${m(i)}" stroke="rgba(255,255,255,.04)" stroke-dasharray="${v===0?"":"2 4"}"/>
      <text x="${n.l-10}" y="${m(i)+3}" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="end" font-family="JetBrains Mono" font-weight="500">${ta(i)}</text>
    </g>`}).join(""),T=[0,Math.floor(a.length/2),a.length-1].map(v=>{const i=a[v];return`<text x="${u(v)}" y="280" font-size="10" fill="rgba(255,255,255,.4)" text-anchor="middle" font-family="JetBrains Mono" font-weight="500">${i.mes}m</text>`}).join("");let W="";s&&s.length>1&&(W=s.slice(1).map(v=>{if(v.inicio<=0||v.inicio>=a.length)return"";const i=u(v.inicio);return`
        <line x1="${i}" x2="${i}" y1="${n.t}" y2="${n.t+c}" stroke="rgba(167,139,250,.45)" stroke-dasharray="3 3" stroke-width="1"/>
        <g transform="translate(${i} ${n.t-14})">
          <rect x="-44" y="-10" width="88" height="18" rx="9" fill="rgba(167,139,250,.18)" stroke="rgba(167,139,250,.5)"/>
          <text x="0" y="3" font-size="9.5" font-weight="700" fill="#C7B3FB" text-anchor="middle" font-family="JetBrains Mono">→ ${ta(v.aporte)}/m</text>
        </g>`}).join(""));let D="",K="";if(e<=r){const v=m(e);D=`
      <line x1="${n.l}" x2="${760-n.r}" y1="${v}" y2="${v}" stroke="rgba(255,255,255,.18)" stroke-dasharray="5 5" stroke-width="1"/>
      <g transform="translate(${760-n.r+4} ${v})">
        <rect x="0" y="-9" width="78" height="18" rx="9" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.15)"/>
        <text x="39" y="3.5" font-size="10" fill="rgba(255,255,255,.7)" text-anchor="middle" font-family="JetBrains Mono" font-weight="600">META ${ta(e)}</text>
      </g>`;const i=a.findIndex(p=>p.saldo>=e);if(i>0){const p=u(i),S=m(a[i].saldo);K=`
        <g class="lib-chart-cross" transform="translate(${p} ${S})">
          <circle r="14" fill="none" stroke="#34D399" stroke-width="1.5" opacity=".4" class="lib-chart-cross-pulse"/>
          <circle r="6"  fill="#34D399" stroke="#0A0F0A" stroke-width="2"/>
          <g transform="translate(0 -22)">
            <rect x="-58" y="-13" width="116" height="22" rx="11" fill="#34D399"/>
            <text x="0" y="2" font-size="10.5" font-weight="700" fill="#0A0F0A" text-anchor="middle" font-family="JetBrains Mono">🎯 ${a[i].mes}m · ${ma(a[i].mes).toUpperCase()}</text>
          </g>
        </g>`}}const z=a[a.length-1],I=`
    <g transform="translate(${y+8} ${m(z.saldo)})">
      <text font-size="11" font-weight="700" fill="#C5F82A" font-family="JetBrains Mono" dy="3">${ta(z.saldo)}</text>
    </g>
    <g transform="translate(${y+8} ${m(z.aportado)})">
      <text font-size="10" fill="#4A9EFF" font-family="JetBrains Mono" dy="3">${ta(z.aportado)}</text>
    </g>
    <g transform="translate(${y+8} ${m(z.juros)})">
      <text font-size="10" fill="#A78BFA" font-family="JetBrains Mono" dy="3">${ta(z.juros)}</text>
    </g>`,U=a.map((v,i)=>u(i).toFixed(1)).join(","),P=a.map(v=>Math.round(v.saldo)).join(","),Q=a.map(v=>Math.round(v.aportado)).join(","),ia=a.map(v=>Math.round(v.juros)).join(",");return`
  <svg class="lib-chart" viewBox="0 0 760 290" preserveAspectRatio="xMidYMid meet"
       data-w="760" data-h="290" data-pad-l="${n.l}" data-pad-r="${n.r}"
       data-pad-t="${n.t}" data-pad-b="${n.b}"
       data-xs="${U}" data-saldo="${P}" data-aportado="${Q}" data-juros="${ia}"
       data-meses="${a.map(v=>v.mes).join(",")}">
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

    ${k}
    ${W}
    ${D}

    <path d="${_}" fill="url(#lg-area-saldo)" class="lib-chart-area"/>

    <path d="${w}" fill="none" stroke="#4A9EFF" stroke-width="1.5"
          stroke-dasharray="4 4" opacity=".55" class="lib-chart-line"/>
    <path d="${f}"    fill="none" stroke="#A78BFA" stroke-width="1.5"
          opacity=".6" class="lib-chart-line"/>
    <path d="${g}"    fill="none" stroke="url(#lg-stroke-saldo)" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"
          filter="url(#f-glow-saldo)" class="lib-chart-line lib-chart-line-main"/>

    ${K}
    ${I}
    ${T}

    <g class="lib-chart-hover" style="opacity:0;pointer-events:none">
      <line class="lib-chart-vline" y1="${n.t}" y2="${n.t+c}"
            stroke="rgba(255,255,255,.18)" stroke-width="1" stroke-dasharray="2 3"/>
      <circle class="lib-chart-dot-s" r="5" fill="#C5F82A" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-a" r="3.5" fill="#4A9EFF" stroke="#0A0F0A" stroke-width="2"/>
      <circle class="lib-chart-dot-j" r="3.5" fill="#A78BFA" stroke="#0A0F0A" stroke-width="2"/>
    </g>

    <rect class="lib-chart-hit" x="${n.l}" y="${n.t}" width="${l}" height="${c}" fill="transparent"/>
  </svg>
  <div class="lib-chart-tooltip" style="opacity:0">
    <div class="lib-tt-mes"></div>
    <div class="lib-tt-row"><i style="background:#C5F82A"></i><span>Saldo</span><b class="lib-tt-s"></b></div>
    <div class="lib-tt-row"><i style="background:#4A9EFF"></i><span>Aportado</span><b class="lib-tt-a"></b></div>
    <div class="lib-tt-row"><i style="background:#A78BFA"></i><span>Juros</span><b class="lib-tt-j"></b></div>
  </div>`}function Ya(a){const e=a.querySelector(".lib-chart"),s=a.querySelector(".lib-chart-tooltip");if(!e||!s)return;const t=e.querySelector(".lib-chart-hover"),o=e.querySelector(".lib-chart-hit"),n=e.querySelector(".lib-chart-vline"),l=e.querySelector(".lib-chart-dot-s"),c=e.querySelector(".lib-chart-dot-a"),r=e.querySelector(".lib-chart-dot-j"),u=e.dataset.xs.split(",").map(Number),m=e.dataset.saldo.split(",").map(Number),b=e.dataset.aportado.split(",").map(Number),g=e.dataset.juros.split(",").map(Number),w=e.dataset.meses.split(",").map(Number),f=+e.dataset.w,y=+e.dataset.h,C=+e.dataset.padT,_=+e.dataset.padB,k=Math.max(...m)*1.08,G=y-C-_,T=W=>C+G-Math.max(0,W)/k*G;o.addEventListener("mousemove",W=>{const D=e.getBoundingClientRect(),K=f/D.width,z=(W.clientX-D.left)*K;let I=0,U=1/0;for(let v=0;v<u.length;v++){const i=Math.abs(u[v]-z);i<U&&(U=i,I=v)}const P=u[I];t.style.opacity=1,n.setAttribute("x1",P),n.setAttribute("x2",P),l.setAttribute("cx",P),l.setAttribute("cy",T(m[I])),c.setAttribute("cx",P),c.setAttribute("cy",T(b[I])),r.setAttribute("cx",P),r.setAttribute("cy",T(g[I]));const Q=P/f*D.width,ia=Q>D.width/2?"left":"right";s.style.opacity=1,s.style.left=ia==="right"?Q+14+"px":Q-14-s.offsetWidth+"px",s.style.top=Math.max(8,T(m[I])/y*D.height-s.offsetHeight/2)+"px",s.querySelector(".lib-tt-mes").textContent=`${w[I]}m · ${ma(w[I])}`,s.querySelector(".lib-tt-s").textContent=x(m[I]),s.querySelector(".lib-tt-a").textContent=x(b[I]),s.querySelector(".lib-tt-j").textContent=x(g[I])}),o.addEventListener("mouseleave",()=>{t.style.opacity=0,s.style.opacity=0})}function xe(){return`
  <div class="lib-block">
    <div class="lib-block-head">
      <h3>Histórico de aportes</h3>
      <button class="btn bp bsm" data-aporte="">+ Aporte</button>
    </div>
    ${L.length?$e():'<div class="empty" style="padding:34px;text-align:center;color:var(--text-3)">Nenhum aporte ainda. Bora começar!</div>'}
  </div>`}function $e(){const a={};for(const e of L){const s=(e.data||"").slice(0,7);a[s]||(a[s]=[]),a[s].push(e)}return Object.entries(a).sort((e,s)=>s[0].localeCompare(e[0])).map(([e,s])=>{const[t,o]=e.split("-"),n=s.reduce((l,c)=>l+Number(c.valor||0),0);return`
    <div class="lib-mes">
      <div class="lib-mes-head">
        <span class="lib-mes-name">${Ca[parseInt(o)-1]} / ${t}</span>
        <span class="lib-mes-tot">${x(n)}</span>
      </div>
      ${s.map(l=>{const c=$.find(r=>r.id===l.meta_id);return`
        <div class="lib-ap-row" data-ap-edit="${l.id}" title="Clica pra editar">
          <div class="lib-ap-data">${Da(l.data)}</div>
          <div class="lib-ap-meta">${c?`<span class="lib-ap-tag" style="background:${Va(c.cor||"#C5F82A",.15)};color:${c.cor||"#C5F82A"}">${c.icone||"🎯"} ${R(c.nome)}</span>`:'<span class="lib-ap-tag" style="background:rgba(255,255,255,.05);color:var(--text-3)">sem meta</span>'}
          </div>
          <div class="lib-ap-fonte">${R(l.fonte||"manual")}${l.observacao?" · "+R(l.observacao):""}</div>
          <div class="lib-ap-val">${x(Number(l.valor))}</div>
          <button class="lib-ap-del" data-aid="${l.id}" title="Excluir">×</button>
        </div>`}).join("")}
    </div>`}).join("")}function _e(a){var e,s,t,o,n,l,c;a.querySelectorAll("#lib-add-meta, #lib-add-meta-2").forEach(r=>r.addEventListener("click",()=>Na())),(e=a.querySelector("#sim-taxa"))==null||e.addEventListener("input",r=>la({taxa:+r.target.value})),(s=a.querySelector("#sim-meses"))==null||s.addEventListener("input",r=>la({meses:+r.target.value})),(t=a.querySelector("#sim-meta"))==null||t.addEventListener("change",r=>{d.metaId=r.target.value,q()}),(o=a.querySelector("#lib-fases-list"))==null||o.addEventListener("input",r=>{const u=r.target.closest(".lib-fase");if(!u)return;const m=+u.dataset.faseIdx;if(d.fases[m]){if(r.target.classList.contains("lib-fase-aporte"))d.fases[m].aporte=Math.max(0,+r.target.value||0),la({});else if(r.target.classList.contains("lib-fase-inicio")){const b=Math.max(1,+r.target.value||1);if(d.fases[m].inicio=b,b+6>d.meses){d.meses=Math.min(240,b+24),q();return}la({})}}}),(n=a.querySelector("#lib-fase-add"))==null||n.addEventListener("click",()=>{const r=d.fases[d.fases.length-1],u=((r==null?void 0:r.inicio)||0)+12,m=Math.round(((r==null?void 0:r.aporte)||2e3)*1.5);d.fases.push({inicio:u,aporte:m}),u+6>d.meses&&(d.meses=Math.min(240,u+24)),q(),setTimeout(()=>{var b;return(b=document.querySelector(".lib-fase:last-child .lib-fase-aporte"))==null?void 0:b.focus()},50)}),(l=a.querySelector("#lib-fases-list"))==null||l.addEventListener("click",r=>{const u=r.target.closest(".lib-fase-del");if(!u)return;const b=+u.closest(".lib-fase").dataset.faseIdx;b!==0&&(d.fases.splice(b,1),q())}),a.querySelectorAll(".lib-qk").forEach(r=>r.addEventListener("click",()=>{d.fases[0].aporte=+r.dataset.pmt,q()})),(c=a.querySelector("#lib-salvar-plano"))==null||c.addEventListener("click",async()=>{const r=$.find(m=>m.id===d.metaId)||$.find(m=>m.principal)||$[0];if(!r)return h("Sem meta selecionada","err");const u=prompt("Nome do plano:",`Plano ${new Date().toLocaleDateString("pt-BR")}`);if(u)try{const m=V(r),b=da({pv:m,fases:d.fases,taxaAA:d.taxa,meses:d.meses});await La({metaId:r.id,nome:u,fases:d.fases.map(g=>({inicio:+g.inicio,aporte:+g.aporte})),taxaAA:d.taxa,meses:d.meses,pvInicial:m,alvo:Number(r.valor_alvo),projFinal:+b[b.length-1].saldo.toFixed(2)}),h("Plano salvo 📋"),await J(),q()}catch(m){h("Erro: "+m.message,"err")}}),a.addEventListener("click",async r=>{const u=r.target.closest("[data-aporte]"),m=r.target.closest("[data-sim]"),b=r.target.closest("[data-meta-edit]"),g=r.target.closest(".lib-ap-del"),w=r.target.closest("#lib-selic-refresh"),f=r.target.closest("[data-plano-del]"),y=r.target.closest("[data-plano-novo]");if(f){if(r.stopPropagation(),!confirm("Remover esse plano? O tracking deixa de aparecer."))return;const{error:_}=await M.from("planos_fin").update({ativo:!1,atualizado_em:new Date().toISOString()}).eq("id",f.dataset.planoDel);if(_)return h("Erro: "+_.message,"err");h("Plano removido"),await J(),q();return}if(y){const _=y.dataset.planoNovo;d.metaId=_,q(),setTimeout(()=>{var k;return(k=document.getElementById("lib-salvar-plano"))==null?void 0:k.click()},100);return}if(w){r.stopPropagation(),w.classList.add("spinning");const _=await Aa({manual:!0});if(w.classList.remove("spinning"),_){d.taxa=Number(E.selic_aa);const k=document.getElementById("sim-taxa");k&&document.activeElement!==k&&(k.value=d.taxa,la({taxa:d.taxa}))}return}if(u){ja({metaId:u.dataset.aporte||null});return}if(m){d.metaId=m.dataset.sim,q(),setTimeout(()=>{var _;return(_=document.querySelector(".lib-sim"))==null?void 0:_.scrollIntoView({behavior:"smooth",block:"center"})},50);return}if(b){const _=$.find(k=>k.id===b.dataset.metaEdit);_&&Na(_);return}if(g){if(r.stopPropagation(),!confirm("Excluir esse aporte?"))return;const{error:_}=await M.from("aportes_fin").delete().eq("id",g.dataset.aid);if(_)return h("Erro: "+_.message,"err");h("Aporte removido"),q();return}const C=r.target.closest("[data-ap-edit]");if(C){const _=L.find(k=>k.id===C.dataset.apEdit);_&&ja({aporte:_})}})}function la(a){Object.assign(d,a);const e=document.getElementById("content"),s=$.find(w=>w.id===d.metaId)||$.find(w=>w.principal)||$[0];if(!s)return;const t=e.querySelectorAll(".lib-slider-v");t[0]&&(t[0].textContent=d.taxa.toFixed(2)+"% a.a."),t[1]&&(t[1].textContent=`${d.meses} meses (${(d.meses/12).toFixed(1)} anos)`);const o=V(s),n=Number(s.valor_alvo),l=da({pv:o,fases:d.fases,taxaAA:d.taxa,meses:d.meses}),c=l[l.length-1],r=c.aportado,u=e.querySelector(".lib-sim-chart");if(u){const w=u.querySelector(".lib-chart-legend");u.innerHTML=Ja(l,n,d.fases)+(w?w.outerHTML:""),Ya(u)}const m=e.querySelectorAll("#lib-stats .lib-stat-val"),b=e.querySelectorAll("#lib-stats .lib-stat-sub");m[2]&&(m[2].textContent=x(c.saldo),b[2].textContent="Juros: "+x(c.saldo-r));const g=ua({pv:o,fases:d.fases,taxaAA:d.taxa,meta:n});m[3]&&(m[3].textContent=x(Math.max(0,n-o)),b[3].textContent=g!=null?`Bate em ${ma(g)}`:"Aumente o aporte")}function ja({metaId:a=null,aporte:e=null}={}){var b,g,w;const s=new Date().toISOString().slice(0,10),t=X(),o=!!e,n=o?e.meta_id||"":a||((b=$.find(f=>f.principal))==null?void 0:b.id)||((g=$[0])==null?void 0:g.id)||"",l=o?e.valor:t||"",c=o?e.data:s,r=o&&e.fonte||"manual",u=o&&e.observacao||"",m=["manual","faturamento","bonus","outro"].map(f=>`<option value="${f}"${f===r?" selected":""}>${f==="manual"?"Manual":f==="faturamento"?"Faturamento":f==="bonus"?"Bônus / Extra":"Outro"}</option>`).join("");qa(o?"Editar aporte":"Registrar aporte",`
    <div class="fg"><label class="fl">Para qual meta?</label>
      <select class="fsl" id="ap-meta">
        ${$.map(f=>`<option value="${f.id}"${f.id===n?" selected":""}>${f.icone||"🎯"} ${R(f.nome)}</option>`).join("")}
        <option value=""${n===""?" selected":""}>— Sem meta específica —</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Valor</label>
      <input class="fi" type="number" id="ap-val" placeholder="0,00" step="0.01" value="${l}">
      ${!o&&t?`<div class="lib-hint">Sugestão: ${x(t)} (${E.aporte_pct_faturamento}% do faturamento médio)</div>`:""}
    </div>
    <div class="fg"><label class="fl">Data ${o?'<small style="color:var(--text-3);font-weight:400">(mude pra mover de mês)</small>':""}</label>
      <input class="fi" type="date" id="ap-data" value="${c}">
    </div>
    <div class="fg"><label class="fl">Fonte</label>
      <select class="fsl" id="ap-fonte">${m}</select>
    </div>
    <div class="fg"><label class="fl">Observação (opcional)</label>
      <input class="fi" type="text" id="ap-obs" placeholder="Ex: Cliente Desjoyaux" value="${R(u)}">
    </div>
  `,`
    ${o?'<button class="btn bd bsm" id="ap-del" style="margin-right:auto">Excluir</button>':""}
    <button class="btn bg" id="ap-cancel">Cancelar</button>
    <button class="btn bp" id="ap-save">${o?"Salvar alteração":"Salvar aporte"}</button>
  `),document.getElementById("ap-cancel").addEventListener("click",oa),(w=document.getElementById("ap-del"))==null||w.addEventListener("click",async()=>{if(!confirm("Excluir esse aporte?"))return;const{error:f}=await M.from("aportes_fin").delete().eq("id",e.id);if(f)return h("Erro: "+f.message,"err");oa(),h("Aporte removido"),q()}),document.getElementById("ap-save").addEventListener("click",async()=>{const f=parseFloat(document.getElementById("ap-val").value)||0;if(f<=0)return h("Valor inválido","err");const y={valor:f,data:document.getElementById("ap-data").value||s,fonte:document.getElementById("ap-fonte").value,observacao:document.getElementById("ap-obs").value.trim()||null,meta_id:document.getElementById("ap-meta").value||null},{error:C}=o?await M.from("aportes_fin").update(y).eq("id",e.id):await M.from("aportes_fin").insert(y);if(C)return h("Erro: "+C.message,"err");oa(),h(o?"Aporte atualizado":"Aporte registrado 🚀"),q()})}function Na(a={}){var l;const e=!a.id,s=a.icone||ka[0],t=a.cor||ga[$.length%ga.length],o=ka.map(c=>`<button type="button" class="lib-ico-pick${c===s?" on":""}" data-ico="${c}">${c}</button>`).join(""),n=ga.map(c=>`<button type="button" class="lib-cor-pick${c===t?" on":""}" style="background:${c}" data-cor="${c}"></button>`).join("");qa(e?"Nova meta":"Editar meta",`
    <div class="fg"><label class="fl">Nome da meta</label>
      <input class="fi" type="text" id="m-nome" placeholder="Ex: Macbook M4 Pro, Viagem Japão…" value="${R(a.nome||"")}">
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Valor alvo (R$)</label>
        <input class="fi" type="number" id="m-alvo" step="100" placeholder="15000" value="${a.valor_alvo||""}">
      </div>
      <div class="fg"><label class="fl">Saldo inicial (R$)</label>
        <input class="fi" type="number" id="m-ini" step="100" placeholder="0" value="${a.valor_inicial||0}">
        <div class="lib-hint">Quanto você já tem reservado pra essa meta</div>
      </div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Prazo (meses, opcional)</label>
        <input class="fi" type="number" id="m-prazo" step="1" placeholder="Sem prazo" value="${a.prazo_meses||""}">
      </div>
      <div class="fg"><label class="fl">
        <input type="checkbox" id="m-principal"${a.principal?" checked":""}> Marcar como meta principal
      </label>
      <div class="lib-hint">A principal vai no hero (só uma por vez)</div>
      </div>
    </div>
    <div class="fg"><label class="fl">Ícone</label>
      <div class="lib-ico-row" id="m-icones">${o}</div>
      <input type="hidden" id="m-ico" value="${s}">
    </div>
    <div class="fg"><label class="fl">Cor</label>
      <div class="lib-cor-row" id="m-cores">${n}</div>
      <input type="hidden" id="m-cor" value="${t}">
    </div>
  `,`
    ${e?"":'<button class="btn bd bsm" id="m-del" style="margin-right:auto">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-icones").addEventListener("click",c=>{const r=c.target.closest(".lib-ico-pick");r&&(document.querySelectorAll(".lib-ico-pick").forEach(u=>u.classList.remove("on")),r.classList.add("on"),document.getElementById("m-ico").value=r.dataset.ico)}),document.getElementById("m-cores").addEventListener("click",c=>{const r=c.target.closest(".lib-cor-pick");r&&(document.querySelectorAll(".lib-cor-pick").forEach(u=>u.classList.remove("on")),r.classList.add("on"),document.getElementById("m-cor").value=r.dataset.cor)}),document.getElementById("m-cancel").addEventListener("click",oa),(l=document.getElementById("m-del"))==null||l.addEventListener("click",async()=>{if(!confirm(`Excluir meta "${a.nome}"? Aportes vinculados ficam sem meta.`))return;const{error:c}=await M.from("metas_fin").delete().eq("id",a.id);if(c)return h("Erro: "+c.message,"err");oa(),h("Meta excluída"),q()}),document.getElementById("m-save").addEventListener("click",async()=>{const c=document.getElementById("m-nome").value.trim(),r=parseFloat(document.getElementById("m-alvo").value)||0;if(!c)return h("Nome obrigatório","err");if(r<=0)return h("Valor alvo inválido","err");const u=document.getElementById("m-principal").checked,m={nome:c,valor_alvo:r,valor_inicial:parseFloat(document.getElementById("m-ini").value)||0,prazo_meses:parseInt(document.getElementById("m-prazo").value)||null,cor:document.getElementById("m-cor").value,icone:document.getElementById("m-ico").value,principal:u,atualizado_em:new Date().toISOString()};u&&await M.from("metas_fin").update({principal:!1}).neq("id",a.id||"00000000-0000-0000-0000-000000000000");const{error:b}=a.id?await M.from("metas_fin").update(m).eq("id",a.id):await M.from("metas_fin").insert(m);if(b)return h("Erro: "+b.message,"err");oa(),h(a.id?"Meta atualizada":"Meta criada 🎯"),q()})}function ye(a){return Math.round(a).toLocaleString("pt-BR")}function ta(a){return a>=1e6?(a/1e6).toFixed(1).replace(/\.0$/,"")+"M":a>=1e3?(a/1e3).toFixed(1).replace(/\.0$/,"")+"k":Math.round(a).toString()}function ma(a){const e=new Date;return e.setMonth(e.getMonth()+a),Ca[e.getMonth()]+"/"+e.getFullYear()}function R(a){return String(a||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function Va(a,e){const s=a.replace("#",""),t=parseInt(s.slice(0,2),16),o=parseInt(s.slice(2,4),16),n=parseInt(s.slice(4,6),16);return`rgba(${t},${o},${n},${e})`}function Ae(a,e){const s=a.replace("#",""),t=Math.min(255,parseInt(s.slice(0,2),16)+e),o=Math.min(255,parseInt(s.slice(2,4),16)+e),n=Math.min(255,parseInt(s.slice(4,6),16)+e);return`rgb(${t},${o},${n})`}function we(a,e){const s=a.replace("#",""),t=Math.max(0,parseInt(s.slice(0,2),16)-e),o=Math.max(0,parseInt(s.slice(2,4),16)-e),n=Math.max(0,parseInt(s.slice(4,6),16)-e);return`rgb(${t},${o},${n})`}export{q as render};
