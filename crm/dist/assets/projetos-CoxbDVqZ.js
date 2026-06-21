import{s as I,d as f,o as O,f as E,t as u,h as F}from"./index-B_9HHcs0.js";const L=[{k:"todo",l:"A fazer",cor:"#A0A0A0"},{k:"doing",l:"Fazendo",cor:"#4A9EFF"},{k:"review",l:"Revisão",cor:"#F5A623"},{k:"done",l:"Feito",cor:"#34D399"}],M=[{k:"baixa",l:"Baixa",cor:"#A0A0A0"},{k:"media",l:"Média",cor:"#4A9EFF"},{k:"alta",l:"Alta",cor:"#F5A623"},{k:"urgente",l:"Urgente",cor:"#FF5C5C"}],B=Object.fromEntries(M.map(t=>[t.k,t])),q=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4"],S=["#A0A0A0","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4","#C5F82A"],G=[{k:1,l:"Seg"},{k:2,l:"Ter"},{k:3,l:"Qua"},{k:4,l:"Qui"},{k:5,l:"Sex"},{k:6,l:"Sáb"},{k:0,l:"Dom"}];let b=[],k=[],j=[],A=[],h=[],g=null,w="kanban";async function $(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>',await H(),await lt(),await H(),g&&!b.find(n=>n.id===g)&&(g=null),!g&&b.length&&(g=b[0].id),V(),K()}async function H(){const[t,n,i,s,d]=await Promise.all([I("projetos",{order:{column:"criado_em",ascending:!1}}),I("clientes",{columns:"id,nome,empresa,status",order:{column:"nome",ascending:!0}}),I("tarefas",{order:{column:"ordem",ascending:!0}}),I("tarefa_subtasks",{order:{column:"ordem",ascending:!0}}),I("rotinas",{order:{column:"criado_em",ascending:!1}})]);b=t.data||[],k=n.data||[],j=i.data||[],A=s.data||[],h=d.data||[]}function V(){const t=(d,o)=>`<button class="pj-tab${w===d?" on":""}" data-tab="${d}">${o}</button>`,n=w==="rotinas"?'<button class="btn bp" id="btn-add-rotina">+ Nova rotina</button>':'<button class="btn bp" id="btn-add-proj">+ Novo projeto</button>';document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${t("kanban","Kanban")}${t("lista","Lista")}${t("hoje","Hoje")}${t("rotinas","Rotinas")}</div>
    ${n}
  `,document.querySelectorAll(".pj-tab").forEach(d=>d.addEventListener("click",()=>{w=d.dataset.tab,V(),K()}));const i=document.getElementById("btn-add-proj"),s=document.getElementById("btn-add-rotina");i&&i.addEventListener("click",()=>R()),s&&s.addEventListener("click",()=>D())}function K(){return w==="hoje"?Z():w==="rotinas"?tt():Q()}function Z(){const t=document.getElementById("content"),n=new Date().toISOString().slice(0,10),i=j.filter(o=>o.status!=="done"&&o.prazo&&o.prazo<=n);if(!i.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra hoje</div>
      <div style="font-size:12px">Sem tarefas vencidas ou pra hoje. Tá em dia.</div>
    </div>`;return}const s={};for(const o of i)(s[o.projeto_id]=s[o.projeto_id]||[]).push(o);const d=Object.entries(s).map(([o,a])=>{const e=b.find(p=>p.id===o);if(!e)return"";const l=k.find(p=>p.id===e.cliente_id),r=a.sort((p,c)=>(p.prazo||"").localeCompare(c.prazo||"")).map(p=>`<div class="pj-hoje-row" data-tid="${p.id}">
        <input type="checkbox" class="pj-hoje-cb" data-tid="${p.id}">
        <div class="pj-hoje-title">${m(p.titulo)}</div>
        ${W(p.prioridade)}
        ${P(p.prazo)}
      </div>`).join("");return`<div class="pj-hoje-block">
      <div class="pj-hoje-head">
        <span class="pj-side-dot" style="background:${e.cor||"#C5F82A"}"></span>
        <span class="pj-hoje-proj">${m(e.nome)}</span>
        <span class="pj-hoje-cli">${l?m(l.empresa||l.nome):"Interno"}</span>
        <span class="pj-col-count">${a.length}</span>
      </div>
      <div class="pj-hoje-rows">${r}</div>
    </div>`}).join("");t.innerHTML=`<div class="pj-hoje">${d}</div>`,t.addEventListener("click",async o=>{const a=o.target.closest(".pj-hoje-cb");if(a){o.stopPropagation();const l=j.find(r=>r.id===a.dataset.tid);if(!l)return;l.status="done",await f.from("tarefas").update({status:"done",atualizado_em:new Date().toISOString()}).eq("id",l.id),u("Marcada como feita"),$();return}const e=o.target.closest(".pj-hoje-row");if(e){const l=j.find(r=>r.id===e.dataset.tid);l&&z(l)}})}function tt(){const t=document.getElementById("content");if(!h.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma rotina ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Rotinas geram tarefas automaticamente em dias específicos.<br>Ex: toda segunda criar "Mandar vídeo motivacional pra Adriane".</div>
      <button class="btn bp" id="btn-first-rot">+ Criar primeira rotina</button>
    </div>`,document.getElementById("btn-first-rot").addEventListener("click",()=>D());return}const n=h.map(i=>{const s=b.find(a=>a.id===i.projeto_id),d=k.find(a=>a.id===i.cliente_id)||s&&k.find(a=>a.id===s.cliente_id),o=Array.isArray(i.tarefas)?i.tarefas:[];return`<div class="pj-rot-card" data-rid="${i.id}">
      <div class="pj-rot-head">
        <div class="pj-rot-name">${m(i.nome)}</div>
        <label class="pj-rot-toggle">
          <input type="checkbox" class="pj-rot-active" data-rid="${i.id}" ${i.ativa?"checked":""}>
          <span>${i.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="pj-rot-meta">
        ${s?`<span class="pj-rot-chip"><span class="pj-side-dot" style="background:${s.cor||"#C5F82A"};width:7px;height:7px"></span>${m(s.nome)}</span>`:""}
        ${d?`<span class="pj-rot-chip">${m(d.empresa||d.nome)}</span>`:""}
        <span class="pj-rot-chip">${et(i)}</span>
        <span class="pj-rot-chip">${o.length} tarefa${o.length===1?"":"s"}</span>
        ${i.ultima_geracao?`<span class="pj-rot-chip" style="color:var(--text-3)">Última: ${F(i.ultima_geracao)}</span>`:""}
      </div>
      ${o.length?`<div class="pj-rot-tarefas">${o.map(a=>`<span class="pj-rot-tlbl">• ${m(a.titulo||"")}</span>`).join("")}</div>`:""}
      <div class="pj-rot-acts">
        <button class="btn bg bsm rot-edit" data-rid="${i.id}">Editar</button>
        <button class="btn bg bsm rot-run"  data-rid="${i.id}">Rodar agora</button>
        <button class="btn bd bsm rot-del"  data-rid="${i.id}">Excluir</button>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-rot-grid">${n}</div>`,t.addEventListener("click",async i=>{const s=i.target.closest(".rot-edit"),d=i.target.closest(".rot-del"),o=i.target.closest(".rot-run"),a=i.target.closest(".pj-rot-active");if(s){const e=h.find(l=>l.id===s.dataset.rid);e&&D(e)}else if(d){const e=h.find(l=>l.id===d.dataset.rid);e&&confirm(`Excluir rotina "${e.nome}"? (Tarefas já geradas continuam)`)&&(await f.from("rotinas").delete().eq("id",e.id),u("Rotina excluída"),$())}else if(o){const e=h.find(l=>l.id===o.dataset.rid);e&&(await ct(e),u("Tarefas geradas"),$())}else if(a){const e=h.find(l=>l.id===a.dataset.rid);e&&(e.ativa=a.checked,await f.from("rotinas").update({ativa:e.ativa,atualizado_em:new Date().toISOString()}).eq("id",e.id))}})}function et(t){if(t.cadencia==="diaria")return"Todos os dias";if(t.cadencia==="semanal"){const n=(t.dias_semana||[]).map(i=>{var s;return(s=G.find(d=>d.k===i))==null?void 0:s.l}).filter(Boolean).join(", ");return n?`Semanal: ${n}`:"Semanal"}return t.cadencia==="mensal"?`Mensal: dia ${t.dia_mes||1}`:t.cadencia}function Q(){const t=document.getElementById("content");if(!b.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`,document.getElementById("btn-add-first").addEventListener("click",()=>R());return}const n=b.map(i=>{const s=k.find(a=>a.id===i.cliente_id),d=j.filter(a=>a.projeto_id===i.id).length,o=j.filter(a=>a.projeto_id===i.id&&a.status==="done").length;return`<div class="pj-side ${i.id===g?"on":""}" data-pid="${i.id}">
      <div class="pj-side-dot" style="background:${i.cor||"#C5F82A"}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${m(i.nome)}</div>
        <div class="pj-side-meta">${s?m(s.empresa||s.nome):"Interno"} · ${o}/${d}</div>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${b.length})</span></div>
      <div class="pj-sidebar-list">${n}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`,t.querySelector(".pj-sidebar-list").addEventListener("click",i=>{const s=i.target.closest(".pj-side");s&&(g=s.dataset.pid,Q())}),U()}function U(){const t=b.find(a=>a.id===g);if(!t)return;const n=k.find(a=>a.id===t.cliente_id),i=j.filter(a=>a.projeto_id===t.id),s=T(t),d=`<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${t.cor||"#C5F82A"}"></div>
      <div>
        <div class="pj-head-name">${m(t.nome)}</div>
        <div class="pj-head-meta">
          ${n?`<span>${m(n.empresa||n.nome)}</span>`:"<span>Interno</span>"}
          ${t.prazo?` · <span>Prazo ${F(t.prazo)}</span>`:""}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`,o=w==="lista"?st(i,s):at(i,s);document.getElementById("pj-main").innerHTML=d+o,document.getElementById("pj-edit").addEventListener("click",()=>R(t)),document.getElementById("pj-del").addEventListener("click",()=>dt(t)),document.getElementById("pj-add-tar").addEventListener("click",()=>{var a;return z({projeto_id:t.id,status:((a=s[0])==null?void 0:a.k)||"todo"})}),ot()}function T(t){const n=t==null?void 0:t.etapas;return Array.isArray(n)&&n.length?n:L}function at(t,n){return`<div class="pj-kanban">${n.map(s=>{const d=t.filter(a=>a.status===s.k),o=d.length?d.map(a=>it(a)).join(""):'<div class="pj-empty">—</div>';return`<div class="pj-col" data-status="${s.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${s.cor}">
          <span class="pj-col-bullet" style="background:${s.cor}"></span>${m(s.l)}
        </span>
        <span class="pj-col-count">${d.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${s.k}">${o}</div>
    </div>`}).join("")}</div>`}function st(t,n){if(!t.length)return'<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>';const i=n.map(o=>o.k);return`<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${[...t].sort((o,a)=>i.indexOf(o.status)-i.indexOf(a.status)||(o.prazo||"").localeCompare(a.prazo||"")).map(o=>{const a=A.filter(l=>l.tarefa_id===o.id),e=a.filter(l=>l.feito).length;return`<tr class="pj-row" data-tid="${o.id}">
      <td>${nt(o.status,n)}</td>
      <td class="pj-row-title">${m(o.titulo)}${a.length?`<span class="pj-sub-chip">${e}/${a.length}</span>`:""}${o.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</td>
      <td>${W(o.prioridade)}</td>
      <td class="tm">${P(o.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${o.id}">×</button></td>
    </tr>`}).join("")}</tbody>
    </table>
  </div>`}function it(t){const n=A.filter(d=>d.tarefa_id===t.id),i=n.filter(d=>d.feito).length,s=B[t.prioridade]||B.media;return`<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${s.cor}"></div>
      <div class="pj-card-title">${m(t.titulo)}${t.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</div>
    </div>
    ${t.descricao?`<div class="pj-card-desc">${m(t.descricao).slice(0,80)}${t.descricao.length>80?"…":""}</div>`:""}
    <div class="pj-card-foot">
      ${P(t.prazo)}
      ${n.length?`<span class="pj-sub-chip">${i}/${n.length}</span>`:""}
    </div>
  </div>`}function nt(t,n){const i=(n||L).find(s=>s.k===t)||L[0];return`<span class="pj-pill" style="background:${i.cor}22;color:${i.cor}">${m(i.l)}</span>`}function W(t){const n=B[t]||B.media;return`<span class="pj-pill" style="background:${n.cor}22;color:${n.cor}">${n.l}</span>`}function P(t){if(!t)return"";const n=new Date(t+"T00:00:00"),i=new Date;i.setHours(0,0,0,0);const s=Math.round((n-i)/864e5);let d="pj-prazo";return s<0?d+=" late":s<=2&&(d+=" soon"),`<span class="${d}">${F(t)}</span>`}function ot(){const t=document.getElementById("pj-main");if(!t)return;t.addEventListener("click",i=>{const s=i.target.closest(".pj-card"),d=i.target.closest(".pj-row"),o=i.target.closest(".del-tar");if(o){i.stopPropagation();const a=j.find(e=>e.id===o.dataset.tid);a&&confirm(`Excluir "${a.titulo}"?`)&&X(a.id);return}if(s){const a=j.find(e=>e.id===s.dataset.tid);a&&z(a)}else if(d){const a=j.find(e=>e.id===d.dataset.tid);a&&z(a)}});let n=null;t.querySelectorAll(".pj-card").forEach(i=>{i.addEventListener("dragstart",s=>{n=i.dataset.tid,i.classList.add("drag"),s.dataTransfer.effectAllowed="move"}),i.addEventListener("dragend",()=>{i.classList.remove("drag"),t.querySelectorAll(".pj-col-cards.over").forEach(s=>s.classList.remove("over"))})}),t.querySelectorAll(".pj-col-cards").forEach(i=>{i.addEventListener("dragover",s=>{s.preventDefault(),i.classList.add("over")}),i.addEventListener("dragleave",()=>i.classList.remove("over")),i.addEventListener("drop",async s=>{if(s.preventDefault(),i.classList.remove("over"),!n)return;const d=i.dataset.drop,o=j.find(e=>e.id===n);if(!o||o.status===d)return;o.status=d;const{error:a}=await f.from("tarefas").update({status:d,atualizado_em:new Date().toISOString()}).eq("id",n);if(a){u("Erro: "+a.message,"err");return}U()})})}function R(t={}){const n='<option value="">— sem cliente (interno) —</option>'+Y(t.cliente_id).map(a=>`<option value="${a.id}"${t.cliente_id===a.id?" selected":""}>${m(a.empresa||a.nome)}</option>`).join(""),i=q.map(a=>`<span class="pj-cor-opt${(t.cor||q[0])===a?" on":""}" data-cor="${a}" style="background:${a}"></span>`).join("");let s=Array.isArray(t.etapas)&&t.etapas.length?JSON.parse(JSON.stringify(t.etapas)):JSON.parse(JSON.stringify(L));O(t.id?"Editar projeto":"Novo projeto",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${_(t.nome||"")}" placeholder="Ex: Conteúdo semanal Adriane"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${m(t.descricao||"")}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${n}</select></div>
      <div class="fg"><label class="fl">Prazo</label><input class="fi" type="date" id="pj-prazo" value="${t.prazo||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Cor</label>
      <div class="pj-cor-row" id="pj-cor-row">${i}</div></div>
    <div class="fg" style="margin-top:14px">
      <label class="fl">Etapas do fluxo</label>
      <div id="pj-etapas-list" class="pj-etapas-list"></div>
      <button class="btn bg bsm" id="pj-etapa-add" type="button" style="margin-top:6px;align-self:flex-start">+ Etapa</button>
    </div>
  `,`
    <button class="btn bg" id="pj-cancel">Cancelar</button>
    <button class="btn bp" id="pj-save">${t.id?"Salvar":"Criar"}</button>
  `);let d=t.cor||q[0];document.getElementById("pj-cor-row").addEventListener("click",a=>{const e=a.target.closest(".pj-cor-opt");e&&(d=e.dataset.cor,document.querySelectorAll(".pj-cor-opt").forEach(l=>l.classList.toggle("on",l.dataset.cor===d)))});const o=()=>{document.getElementById("pj-etapas-list").innerHTML=s.map((a,e)=>`
      <div class="pj-etapa-row" data-i="${e}">
        <span class="pj-etapa-color" data-i="${e}" style="background:${a.cor}"></span>
        <input type="text" class="fi pj-etapa-l" data-i="${e}" value="${_(a.l)}" style="flex:1;padding:6px 9px;font-size:12.5px">
        <button class="pj-etapa-up"   type="button" data-i="${e}" ${e===0?"disabled":""}>↑</button>
        <button class="pj-etapa-down" type="button" data-i="${e}" ${e===s.length-1?"disabled":""}>↓</button>
        <button class="pj-sub-del"    type="button" data-i="${e}" ${s.length<=1?"disabled":""} title="Remover">×</button>
      </div>
    `).join("")};o(),document.getElementById("pj-etapa-add").addEventListener("click",()=>{const a="etapa_"+Math.random().toString(36).slice(2,7);s.push({k:a,l:"Nova etapa",cor:S[s.length%S.length]}),o()}),document.getElementById("pj-etapas-list").addEventListener("click",a=>{const e=a.target.closest(".pj-etapa-up"),l=a.target.closest(".pj-etapa-down"),r=a.target.closest(".pj-sub-del"),p=a.target.closest(".pj-etapa-color");if(e){const c=+e.dataset.i;[s[c-1],s[c]]=[s[c],s[c-1]],o()}if(l){const c=+l.dataset.i;[s[c+1],s[c]]=[s[c],s[c+1]],o()}if(r&&s.length>1){const c=+r.dataset.i;s.splice(c,1),o()}if(p){const c=+p.dataset.i,x=s[c].cor,v=S.indexOf(x);s[c].cor=S[(v+1)%S.length],o()}}),document.getElementById("pj-etapas-list").addEventListener("input",a=>{const e=a.target.closest(".pj-etapa-l");e&&(s[+e.dataset.i].l=e.value)}),document.getElementById("pj-cancel").addEventListener("click",E),document.getElementById("pj-save").addEventListener("click",async()=>{const a=s.filter(c=>(c.l||"").trim()).map(c=>({k:c.k||"etapa_"+Math.random().toString(36).slice(2,7),l:c.l.trim(),cor:c.cor||"#A0A0A0"}));if(!a.length)return u("Adicione pelo menos 1 etapa","err");const e={nome:document.getElementById("pj-nome").value.trim(),descricao:document.getElementById("pj-desc").value.trim()||null,cliente_id:document.getElementById("pj-cli").value||null,prazo:document.getElementById("pj-prazo").value||null,cor:d,etapas:a,atualizado_em:new Date().toISOString()};if(!e.nome)return u("Nome é obrigatório","err");const l=t.id?f.from("projetos").update(e).eq("id",t.id):f.from("projetos").insert(e).select().single(),{data:r,error:p}=await l;if(p)return u("Erro: "+p.message,"err");!t.id&&r&&(g=r.id),E(),u(t.id?"Projeto salvo":"Projeto criado"),$()})}async function dt(t){if(!confirm(`Excluir "${t.nome}" e TODAS as tarefas e rotinas dele?`))return;const{error:n}=await f.from("projetos").delete().eq("id",t.id);if(n)return u("Erro: "+n.message,"err");g=null,u("Projeto excluído"),$()}function z(t={}){const n=!t.id,i=b.find(e=>e.id===(t.projeto_id||g)),s=T(i),d=s.map(e=>`<option value="${e.k}"${(t.status||s[0].k)===e.k?" selected":""}>${m(e.l)}</option>`).join(""),o=M.map(e=>`<option value="${e.k}"${(t.prioridade||"media")===e.k?" selected":""}>${e.l}</option>`).join(""),a=n?[]:A.filter(e=>e.tarefa_id===t.id);O(n?"Nova tarefa":"Editar tarefa",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${_(t.titulo||"")}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${m(t.descricao||"")}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Etapa</label><select class="fsl" id="tr-status">${d}</select></div>
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="tr-prio">${o}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Prazo</label>
      <input class="fi" type="date" id="tr-prazo" value="${t.prazo||""}"></div>
    <div class="fg">
      <label class="fl">Checklist</label>
      <div id="tr-subs" class="pj-subs">${a.map(e=>J(e.id,e.texto,e.feito)).join("")}</div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `,`
    ${n?"":'<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${n?"Criar":"Salvar"}</button>
  `),document.getElementById("tr-sub-add").addEventListener("click",()=>{const e=document.getElementById("tr-sub-new"),l=e.value.trim();if(!l)return;const r="new-"+Math.random().toString(36).slice(2);document.getElementById("tr-subs").insertAdjacentHTML("beforeend",J(r,l,!1)),e.value="",e.focus()}),document.getElementById("tr-sub-new").addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),document.getElementById("tr-sub-add").click())}),document.getElementById("tr-subs").addEventListener("click",e=>{const l=e.target.closest(".pj-sub-del");l&&l.closest(".pj-sub-row").remove()}),document.getElementById("tr-cancel").addEventListener("click",E),n||document.getElementById("tr-del").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await X(t.id),E())}),document.getElementById("tr-save").addEventListener("click",async()=>{const e={projeto_id:t.projeto_id||g,titulo:document.getElementById("tr-titulo").value.trim(),descricao:document.getElementById("tr-desc").value.trim()||null,status:document.getElementById("tr-status").value,prioridade:document.getElementById("tr-prio").value,prazo:document.getElementById("tr-prazo").value||null,atualizado_em:new Date().toISOString()};if(!e.titulo)return u("Título é obrigatório","err");let l=t.id;if(n){const{data:v,error:y}=await f.from("tarefas").insert(e).select().single();if(y)return u("Erro: "+y.message,"err");l=v.id}else{const{error:v}=await f.from("tarefas").update(e).eq("id",l);if(v)return u("Erro: "+v.message,"err")}const r=[...document.querySelectorAll(".pj-sub-row")],p=n?[]:A.filter(v=>v.tarefa_id===l),c=new Set;let x=0;for(const v of r){const y=v.dataset.sid,C=v.querySelector(".pj-sub-text").value.trim(),N=v.querySelector(".pj-sub-cb").checked;C&&(y.startsWith("new-")?await f.from("tarefa_subtasks").insert({tarefa_id:l,texto:C,feito:N,ordem:x++}):(c.add(y),await f.from("tarefa_subtasks").update({texto:C,feito:N,ordem:x++}).eq("id",y)))}for(const v of p)c.has(v.id)||await f.from("tarefa_subtasks").delete().eq("id",v.id);E(),u(n?"Tarefa criada":"Tarefa salva"),$()})}function J(t,n,i){return`<div class="pj-sub-row" data-sid="${t}">
    <input type="checkbox" class="pj-sub-cb" ${i?"checked":""}>
    <input type="text" class="pj-sub-text fi" value="${_(n)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`}async function X(t){const{error:n}=await f.from("tarefas").delete().eq("id",t);if(n)return u("Erro: "+n.message,"err");u("Tarefa excluída"),$()}function D(t={}){const n=!t.id,i='<option value="">— sem cliente —</option>'+Y(t.cliente_id).map(r=>`<option value="${r.id}"${t.cliente_id===r.id?" selected":""}>${m(r.empresa||r.nome)}</option>`).join(""),s='<option value="">— escolha um projeto —</option>'+b.map(r=>`<option value="${r.id}"${t.projeto_id===r.id?" selected":""}>${m(r.nome)}</option>`).join(""),d=t.cadencia||"semanal",o=t.dias_semana||[1],a=Array.isArray(t.tarefas)?JSON.parse(JSON.stringify(t.tarefas)):[],e=G.map(r=>`<label class="pj-dia-chip ${o.includes(r.k)?"on":""}" data-d="${r.k}"><input type="checkbox" ${o.includes(r.k)?"checked":""} style="display:none">${r.l}</label>`).join("");O(n?"Nova rotina":"Editar rotina",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="rt-nome" value="${_(t.nome||"")}" placeholder="Ex: Rotina semanal Adriane"></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rt-cli">${i}</select></div>
      <div class="fg"><label class="fl">Projeto *</label><select class="fsl" id="rt-proj">${s}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Cadência</label>
      <div class="pj-cad-row">
        <label class="pj-cad-opt ${d==="diaria"?"on":""}"><input type="radio" name="rt-cad" value="diaria" ${d==="diaria"?"checked":""}>Todo dia</label>
        <label class="pj-cad-opt ${d==="semanal"?"on":""}"><input type="radio" name="rt-cad" value="semanal" ${d==="semanal"?"checked":""}>Semanal</label>
        <label class="pj-cad-opt ${d==="mensal"?"on":""}"><input type="radio" name="rt-cad" value="mensal" ${d==="mensal"?"checked":""}>Mensal</label>
      </div>
    </div>
    <div class="fg" id="rt-dias-wrap" style="margin-bottom:11px;${d==="semanal"?"":"display:none"}">
      <label class="fl">Dias da semana</label>
      <div class="pj-dias-row" id="rt-dias">${e}</div>
    </div>
    <div class="fg" id="rt-mes-wrap" style="margin-bottom:11px;${d==="mensal"?"":"display:none"}">
      <label class="fl">Dia do mês (1–28)</label>
      <input class="fi" type="number" min="1" max="28" id="rt-dia-mes" value="${t.dia_mes||1}" style="width:120px">
    </div>
    <div class="fg">
      <label class="fl">Tarefas que serão geradas</label>
      <div id="rt-tars" class="pj-rot-tars-edit"></div>
      <button class="btn bg bsm" id="rt-tar-add" type="button" style="margin-top:6px;align-self:flex-start">+ Tarefa</button>
    </div>
  `,`
    ${n?"":'<button class="btn bd" id="rt-del">Excluir</button>'}
    <button class="btn bg" id="rt-cancel">Cancelar</button>
    <button class="btn bp" id="rt-save">${n?"Criar":"Salvar"}</button>
  `);const l=()=>{document.getElementById("rt-tars").innerHTML=a.map((r,p)=>`
      <div class="pj-rot-tar-row" data-i="${p}">
        <input type="text" class="fi rt-t-titulo" data-i="${p}" value="${_(r.titulo||"")}" placeholder="Título" style="flex:2;padding:6px 9px;font-size:12.5px">
        <select class="fsl rt-t-prio" data-i="${p}" style="flex:1;padding:6px 9px;font-size:12.5px">
          ${M.map(c=>`<option value="${c.k}"${(r.prioridade||"media")===c.k?" selected":""}>${c.l}</option>`).join("")}
        </select>
        <button class="pj-sub-del" type="button" data-i="${p}">×</button>
      </div>
    `).join("")};l(),document.getElementById("rt-tar-add").addEventListener("click",()=>{a.push({titulo:"",prioridade:"media"}),l()}),document.getElementById("rt-tars").addEventListener("click",r=>{const p=r.target.closest(".pj-sub-del");p&&(a.splice(+p.dataset.i,1),l())}),document.getElementById("rt-tars").addEventListener("input",r=>{const p=r.target.closest(".rt-t-titulo"),c=r.target.closest(".rt-t-prio");p&&(a[+p.dataset.i].titulo=p.value),c&&(a[+c.dataset.i].prioridade=c.value)}),document.querySelectorAll('input[name="rt-cad"]').forEach(r=>r.addEventListener("change",()=>{document.querySelectorAll(".pj-cad-opt").forEach(c=>c.classList.toggle("on",c.querySelector("input").checked));const p=document.querySelector('input[name="rt-cad"]:checked').value;document.getElementById("rt-dias-wrap").style.display=p==="semanal"?"":"none",document.getElementById("rt-mes-wrap").style.display=p==="mensal"?"":"none"})),document.getElementById("rt-dias").addEventListener("click",r=>{const p=r.target.closest(".pj-dia-chip");p&&(r.preventDefault(),p.classList.toggle("on"),p.querySelector("input").checked=p.classList.contains("on"))}),document.getElementById("rt-cancel").addEventListener("click",E),n||document.getElementById("rt-del").addEventListener("click",async()=>{confirm(`Excluir rotina "${t.nome}"?`)&&(await f.from("rotinas").delete().eq("id",t.id),E(),u("Rotina excluída"),$())}),document.getElementById("rt-save").addEventListener("click",async()=>{const r=document.querySelector('input[name="rt-cad"]:checked').value,p=[...document.querySelectorAll("#rt-dias .pj-dia-chip.on")].map(y=>+y.dataset.d),c={nome:document.getElementById("rt-nome").value.trim(),cliente_id:document.getElementById("rt-cli").value||null,projeto_id:document.getElementById("rt-proj").value||null,cadencia:r,dias_semana:r==="semanal"?p:[],dia_mes:r==="mensal"?+document.getElementById("rt-dia-mes").value||1:null,tarefas:a.filter(y=>(y.titulo||"").trim()),atualizado_em:new Date().toISOString()};if(!c.nome)return u("Nome é obrigatório","err");if(!c.projeto_id)return u("Selecione um projeto","err");if(r==="semanal"&&!c.dias_semana.length)return u("Marque pelo menos 1 dia","err");if(!c.tarefas.length)return u("Adicione pelo menos 1 tarefa","err");const x=t.id?f.from("rotinas").update(c).eq("id",t.id):f.from("rotinas").insert({...c,ativa:!0}),{error:v}=await x;if(v)return u("Erro: "+v.message,"err");E(),u(t.id?"Rotina salva":"Rotina criada"),$()})}function rt(t,n){const i=n.toISOString().slice(0,10);return t.ultima_geracao===i?!1:t.cadencia==="diaria"?!0:t.cadencia==="semanal"?(t.dias_semana||[]).includes(n.getDay()):t.cadencia==="mensal"?n.getDate()===(t.dia_mes||1):!1}async function lt(){var i;const t=new Date,n=t.toISOString().slice(0,10);for(const s of h){if(!s.ativa||!s.projeto_id||!rt(s,t))continue;const d=b.find(e=>e.id===s.projeto_id),o=((i=T(d)[0])==null?void 0:i.k)||"todo",a=(s.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:s.projeto_id,rotina_id:s.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${s.nome}"]`,prioridade:e.prioridade||"media",status:o,prazo:n}));a.length&&(await f.from("tarefas").insert(a),await f.from("rotinas").update({ultima_geracao:n}).eq("id",s.id))}}async function ct(t){var a;if(!t.projeto_id){u("Rotina sem projeto","err");return}const n=b.find(e=>e.id===t.projeto_id),i=((a=T(n)[0])==null?void 0:a.k)||"todo",s=new Date().toISOString().slice(0,10),{count:d}=await f.from("tarefas").select("id",{count:"exact",head:!0}).eq("rotina_id",t.id).eq("prazo",s);if((d||0)>0&&!confirm(`Essa rotina já rodou hoje (${d} tarefa${d===1?"":"s"} já gerada${d===1?"":"s"}). Rodar de novo vai duplicar. Continuar mesmo assim?`)){u("Cancelado.","er");return}const o=(t.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:t.projeto_id,rotina_id:t.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${t.nome}" — manual]`,prioridade:e.prioridade||"media",status:i,prazo:s}));if(!o.length){u("Rotina sem tarefas","err");return}await f.from("tarefas").insert(o),await f.from("rotinas").update({ultima_geracao:s}).eq("id",t.id)}function Y(t){const n=new Set(["proposta","ativo","em_pausa","fechado"]);return k.filter(i=>n.has(i.status)||i.id===t)}function m(t){return String(t??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n])}function _(t){return m(t)}export{$ as render};
