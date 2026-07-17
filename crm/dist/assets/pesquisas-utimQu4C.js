import{s as B,o as P,f as j,d as f,t as u,h as z}from"./index-CDa9fny6.js";const k=[{k:"nova",l:"Nova",cor:"#4A9EFF"},{k:"lida",l:"Lida",cor:"#A78BFA"},{k:"em_analise",l:"Em análise",cor:"#F5A623"},{k:"virou_acao",l:"Virou ação",cor:"#34D399"},{k:"arquivada",l:"Arquivada",cor:"#A0A0A0"}],N=Object.fromEntries(k.map(t=>[t.k,t])),L=[{k:"concorrencia",l:"Concorrência",cor:"#FF5C5C",icon:"⚔️"},{k:"tendencia",l:"Tendência",cor:"#EC4899",icon:"📈"},{k:"ideia_conteudo",l:"Ideia de conteúdo",cor:"#A78BFA",icon:"💡"},{k:"oportunidade",l:"Oportunidade",cor:"#34D399",icon:"🎯"},{k:"noticia",l:"Notícia/mercado",cor:"#4A9EFF",icon:"📰"},{k:"insight_cliente",l:"Insight de cliente",cor:"#F5A623",icon:"🔍"},{k:"benchmark",l:"Benchmark",cor:"#06B6D4",icon:"🏆"},{k:"outro",l:"Outro",cor:"#A0A0A0",icon:"📌"}],b=Object.fromEntries(L.map(t=>[t.k,t])),q=[{k:"baixa",l:"Baixa",cor:"#A0A0A0"},{k:"media",l:"Média",cor:"#4A9EFF"},{k:"alta",l:"Alta",cor:"#F5A623"},{k:"urgente",l:"Urgente",cor:"#FF5C5C"}],$=Object.fromEntries(q.map(t=>[t.k,t]));let c=[],A=[],y="kanban",E="",h="",_=!1;async function w(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>',K(),await R(),T(),g()}async function R(){const[t,s]=await Promise.all([B("pesquisas",{order:{column:"criado_em",ascending:!1}}),B("clientes",{columns:"id,nome,empresa,status"})]);c=t.data||[],A=s.data||[]}function T(){const t=(e,n)=>`<button class="pj-tab${y===e?" on":""}" data-tab="${e}">${n}</button>`,s='<option value="">Todos os clientes</option>'+O("").map(e=>`<option value="${e.id}"${h===e.id?" selected":""}>${r(e.empresa||e.nome)}</option>`).join(""),a='<option value="">Todas categorias</option>'+L.map(e=>`<option value="${e.k}"${E===e.k?" selected":""}>${e.icon} ${e.l}</option>`).join("");document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${t("kanban","Kanban")}${t("lista","Lista")}</div>
    <select class="fsl" id="ps-filcat" style="width:auto;padding:6px 11px">${a}</select>
    <select class="fsl" id="ps-filcli" style="width:auto;padding:6px 11px">${s}</select>
    <button class="btn bp" id="ps-add">+ Nova pesquisa</button>
  `,document.querySelectorAll(".pj-tab").forEach(e=>e.addEventListener("click",()=>{y=e.dataset.tab,T(),g()})),document.getElementById("ps-filcat").addEventListener("change",e=>{E=e.target.value,g()}),document.getElementById("ps-filcli").addEventListener("change",e=>{h=e.target.value,g()}),document.getElementById("ps-add").addEventListener("click",()=>m())}function g(){return y==="lista"?G():F()}function S(){return c.filter(t=>!(E&&t.categoria!==E||h&&t.cliente_id!==h))}function F(){var e;const t=document.getElementById("content"),s=S();if(!s.length&&!c.length){t.innerHTML=M(),(e=document.getElementById("ps-first"))==null||e.addEventListener("click",()=>m());return}const a=k.map(n=>{const i=s.filter(o=>o.status===n.k),l=i.length?i.map(o=>U(o)).join(""):'<div class="pj-empty">—</div>';return`<div class="pj-col" data-status="${n.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${n.cor}">
          <span class="pj-col-bullet" style="background:${n.cor}"></span>${n.l}
        </span>
        <span class="pj-col-count">${i.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${n.k}">${l}</div>
    </div>`}).join("");t.innerHTML=`<div class="pj-kanban">${a}</div>`,x()}function U(t){const s=b[t.categoria]||b.outro,a=$[t.prioridade]||$.media,e=A.find(i=>i.id===t.cliente_id),n=C(t.criado_em);return`<div class="pj-card ps-card" draggable="true" data-id="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${a.cor}"></div>
      <div class="pj-card-title">${r(t.titulo)}</div>
    </div>
    ${t.resumo?`<div class="pj-card-desc">${r(t.resumo).slice(0,90)}${t.resumo.length>90?"…":""}</div>`:""}
    <div class="pj-card-foot">
      <span class="ps-cat-pill" style="background:${s.cor}22;color:${s.cor}">${s.icon} ${s.l}</span>
      ${e?`<span class="pj-sub-chip">${r((e.empresa||e.nome).slice(0,14))}</span>`:""}
    </div>
    <div style="font-size:10px;color:var(--text-3);margin-top:6px;display:flex;justify-content:space-between">
      <span>${t.responsavel?r(t.responsavel):"—"}</span>
      <span>${n}</span>
    </div>
  </div>`}function C(t){if(!t)return"";const s=new Date(t),a=Math.floor((Date.now()-s.getTime())/36e5);if(a<1)return"agora";if(a<24)return`${a}h atrás`;const e=Math.floor(a/24);return e===1?"ontem":e<7?`${e} dias`:z(t)}function x(){const t=document.getElementById("content");let s=null;t.querySelectorAll(".ps-card").forEach(a=>{a.addEventListener("dragstart",e=>{s=a.dataset.id,a.classList.add("drag"),e.dataTransfer.effectAllowed="move"}),a.addEventListener("dragend",()=>{a.classList.remove("drag"),t.querySelectorAll(".pj-col-cards.over").forEach(e=>e.classList.remove("over"))})}),t.querySelectorAll(".pj-col-cards").forEach(a=>{a.addEventListener("dragover",e=>{e.preventDefault(),a.classList.add("over")}),a.addEventListener("dragleave",()=>a.classList.remove("over")),a.addEventListener("drop",async e=>{if(e.preventDefault(),a.classList.remove("over"),!s)return;const n=a.dataset.drop,i=c.find(o=>o.id===s);if(!i||i.status===n)return;const{error:l}=await f.from("pesquisas").update({status:n,atualizado_em:new Date().toISOString()}).eq("id",s);if(l){u("Erro: "+l.message,"err");return}i.status=n,F()})})}function G(){var e;const t=document.getElementById("content"),s=S();if(!s.length){t.innerHTML=M(),(e=document.getElementById("ps-first"))==null||e.addEventListener("click",()=>m());return}const a=s.map(n=>{const i=N[n.status]||k[0],l=b[n.categoria]||b.outro,o=$[n.prioridade]||$.media,d=A.find(p=>p.id===n.cliente_id);return`<tr class="ps-row" data-id="${n.id}">
      <td class="tm">${C(n.criado_em)}</td>
      <td><span class="ps-cat-pill" style="background:${l.cor}22;color:${l.cor}">${l.icon} ${l.l}</span></td>
      <td class="tn">${r(n.titulo)}</td>
      <td class="tm">${d?r(d.empresa||d.nome):"—"}</td>
      <td class="tm">${n.responsavel||"—"}</td>
      <td><span class="pj-pill" style="background:${o.cor}22;color:${o.cor}">${o.l}</span></td>
      <td><span class="pj-pill" style="background:${i.cor}22;color:${i.cor}">${i.l}</span></td>
    </tr>`}).join("");t.innerHTML=`<div class="tw">
    <table>
      <thead><tr><th>Adicionada</th><th>Categoria</th><th>Título</th><th>Cliente</th><th>Por</th><th>Prio</th><th>Status</th></tr></thead>
      <tbody>${a}</tbody>
    </table>
  </div>`}function m(t={}){const s=!t.id,a='<option value="">— sem cliente vinculado —</option>'+O(t.cliente_id).map(o=>`<option value="${o.id}"${t.cliente_id===o.id?" selected":""}>${r(o.empresa||o.nome)}</option>`).join(""),e=L.map(o=>`<option value="${o.k}"${(t.categoria||"concorrencia")===o.k?" selected":""}>${o.icon} ${o.l}</option>`).join(""),n=k.map(o=>`<option value="${o.k}"${(t.status||"nova")===o.k?" selected":""}>${o.l}</option>`).join(""),i=q.map(o=>`<option value="${o.k}"${(t.prioridade||"media")===o.k?" selected":""}>${o.l}</option>`).join(""),l=Array.isArray(t.tags)?t.tags.join(", "):t.tags||"";P(s?"Nova pesquisa":"Editar pesquisa",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título / achado *</label>
      <input class="fi" id="ps-titulo" value="${v(t.titulo||"")}" placeholder="Ex: Marmoraria X tá rodando promoção -30% no granito preto"></div>

    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="ps-cat">${e}</select></div>
      <div class="fg"><label class="fl">Cliente relacionado</label><select class="fsl" id="ps-cli">${a}</select></div>
    </div>

    <div class="fg" style="margin-bottom:11px"><label class="fl">Resumo do que achou</label>
      <textarea class="fta" id="ps-resumo" rows="4" placeholder="Detalhes, contexto, o que chamou atenção...">${r(t.resumo||"")}</textarea></div>

    <div class="fg" style="margin-bottom:11px"><label class="fl">Fonte (link)</label>
      <input class="fi" id="ps-fonte" value="${v(t.fonte_url||"")}" placeholder="URL do post, anúncio, artigo..."></div>

    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="ps-prio">${i}</select></div>
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="ps-status">${n}</select></div>
      <div class="fg"><label class="fl">Feita por</label><input class="fi" id="ps-resp" value="${v(t.responsavel||"Hermes")}" placeholder="Hermes"></div>
    </div>

    <div class="fg" style="margin-bottom:11px"><label class="fl">Tags (vírgula)</label>
      <input class="fi" id="ps-tags" value="${v(l)}" placeholder="ex: instagram, promocao, criativo-video"></div>

    <div class="fg"><label class="fl">Ação proposta (opcional)</label>
      <textarea class="fta" id="ps-acao" rows="2" placeholder="O que fazer com isso? Ex: replicar promoção pra outro cliente, criar post no mesmo formato...">${r(t.acao_proposta||"")}</textarea></div>
  `,`
    ${s?"":'<button class="btn bd" id="ps-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",j),s||document.getElementById("ps-del").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await f.from("pesquisas").delete().eq("id",t.id),u("Excluída"),j(),w())}),document.getElementById("m-save").addEventListener("click",async()=>{const o=document.getElementById("ps-tags").value.trim(),d=o?o.split(",").map(H=>H.trim()).filter(Boolean):[],p={titulo:document.getElementById("ps-titulo").value.trim(),categoria:document.getElementById("ps-cat").value,cliente_id:document.getElementById("ps-cli").value||null,resumo:document.getElementById("ps-resumo").value.trim()||null,fonte_url:document.getElementById("ps-fonte").value.trim()||null,prioridade:document.getElementById("ps-prio").value,status:document.getElementById("ps-status").value,responsavel:document.getElementById("ps-resp").value.trim()||null,tags:d,acao_proposta:document.getElementById("ps-acao").value.trim()||null,atualizado_em:new Date().toISOString()};if(!p.titulo)return u("Título é obrigatório","err");const D=t.id?f.from("pesquisas").update(p).eq("id",t.id):f.from("pesquisas").insert(p),{error:I}=await D;if(I)return u("Erro: "+I.message,"err");j(),u(t.id?"Salvo":"Adicionada"),w()})}function K(){_||(_=!0,document.getElementById("content").addEventListener("click",t=>{if(y==="lista"){const s=t.target.closest(".ps-row");if(s){const a=c.find(e=>e.id===s.dataset.id);a&&m(a)}}else{const s=t.target.closest(".ps-card");if(s){const a=c.find(e=>e.id===s.dataset.id);a&&m(a)}}}))}function M(){return`<div class="empty" style="padding:80px 20px">
    <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma pesquisa ainda</div>
    <div style="font-size:12px;margin-bottom:18px">Pipeline pro Hermes preencher todo dia de manhã.<br>Concorrência, tendências, ideias, oportunidades…</div>
    <button class="btn bp" id="ps-first">+ Adicionar primeira</button>
  </div>`}function O(t){const s=new Set(["proposta","ativo","em_pausa","fechado"]);return A.filter(a=>s.has(a.status)||a.id===t)}function r(t){return String(t??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s])}function v(t){return r(t)}export{w as render};
