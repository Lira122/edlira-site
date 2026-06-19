import{s as j,o as F,f as b,t as l,d as p,h as T}from"./index-BuQVJmeZ.js";const $=[{k:"todo",l:"A fazer",cor:"#A0A0A0"},{k:"doing",l:"Fazendo",cor:"#4A9EFF"},{k:"review",l:"Revisão",cor:"#F5A623"},{k:"done",l:"Feito",cor:"#34D399"}],P=[{k:"baixa",l:"Baixa",cor:"#A0A0A0"},{k:"media",l:"Média",cor:"#4A9EFF"},{k:"alta",l:"Alta",cor:"#F5A623"},{k:"urgente",l:"Urgente",cor:"#FF5C5C"}],E=Object.fromEntries(P.map(t=>[t.k,t])),x=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4"];let m=[],h=[],f=[],g=[],c=null,y="kanban";async function k(){document.getElementById("tbacts").innerHTML=`<button class="btn bg" id="btn-mode">Lista</button>
     <button class="btn bp" id="btn-add-proj">+ Novo projeto</button>`,document.getElementById("btn-add-proj").addEventListener("click",()=>B()),document.getElementById("btn-mode").addEventListener("click",()=>{y=y==="kanban"?"lista":"kanban",document.getElementById("btn-mode").textContent=y==="kanban"?"Lista":"Kanban",I()});const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>';const[s,a,o,d]=await Promise.all([j("projetos",{order:{column:"criado_em",ascending:!1}}),j("clientes",{columns:"id,nome,empresa",order:{column:"nome",ascending:!0}}),j("tarefas",{order:{column:"ordem",ascending:!0}}),j("tarefa_subtasks",{order:{column:"ordem",ascending:!0}})]);if(s.error){t.innerHTML=`<div class="empty">Erro: ${s.error.message}</div>`;return}m=s.data||[],h=a.data||[],f=o.data||[],g=d.data||[],c&&!m.find(e=>e.id===c)&&(c=null),!c&&m.length&&(c=m[0].id),I()}function I(){const t=document.getElementById("content");if(!m.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar a organizar tarefas.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`,document.getElementById("btn-add-first").addEventListener("click",()=>B());return}const s=m.map(a=>{const o=h.find(r=>r.id===a.cliente_id),d=f.filter(r=>r.projeto_id===a.id).length,e=f.filter(r=>r.projeto_id===a.id&&r.status==="done").length;return`<div class="pj-side ${a.id===c?"on":""}" data-pid="${a.id}">
      <div class="pj-side-dot" style="background:${a.cor||"#C5F82A"}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${u(a.nome)}</div>
        <div class="pj-side-meta">${o?u(o.empresa||o.nome):"Interno"} · ${e}/${d}</div>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${m.length})</span></div>
      <div class="pj-sidebar-list">${s}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`,t.querySelector(".pj-sidebar-list").addEventListener("click",a=>{const o=a.target.closest(".pj-side");o&&(c=o.dataset.pid,I())}),q()}function q(){const t=m.find(e=>e.id===c);if(!t)return;const s=h.find(e=>e.id===t.cliente_id),a=f.filter(e=>e.projeto_id===t.id),o=`<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${t.cor||"#C5F82A"}"></div>
      <div>
        <div class="pj-head-name">${u(t.nome)}</div>
        <div class="pj-head-meta">
          ${s?`<span>${u(s.empresa||s.nome)}</span>`:"<span>Interno</span>"}
          ${t.prazo?` · <span>Prazo ${T(t.prazo)}</span>`:""}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`,d=y==="kanban"?H(a):R(a);document.getElementById("pj-main").innerHTML=o+d,document.getElementById("pj-edit").addEventListener("click",()=>B(t)),document.getElementById("pj-del").addEventListener("click",()=>G(t)),document.getElementById("pj-add-tar").addEventListener("click",()=>L({projeto_id:t.id,status:"todo"})),W()}function H(t){return`<div class="pj-kanban">${$.map(a=>{const o=t.filter(e=>e.status===a.k),d=o.length?o.map(e=>N(e)).join(""):'<div class="pj-empty">—</div>';return`<div class="pj-col" data-status="${a.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${a.cor}">
          <span class="pj-col-bullet" style="background:${a.cor}"></span>${a.l}
        </span>
        <span class="pj-col-count">${o.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${a.k}">${d}</div>
    </div>`}).join("")}</div>`}function R(t){return t.length?`<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${[...t].sort((o,d)=>{const e=["todo","doing","review","done"];return e.indexOf(o.status)-e.indexOf(d.status)||(o.prazo||"").localeCompare(d.prazo||"")}).map(o=>{const d=g.filter(r=>r.tarefa_id===o.id),e=d.filter(r=>r.feito).length;return`<tr class="pj-row" data-tid="${o.id}">
      <td>${K(o.status)}</td>
      <td class="pj-row-title">${u(o.titulo)}${d.length?`<span class="pj-sub-chip">${e}/${d.length}</span>`:""}</td>
      <td>${U(o.prioridade)}</td>
      <td class="tm">${D(o.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${o.id}">×</button></td>
    </tr>`}).join("")}</tbody>
    </table>
  </div>`:'<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>'}function N(t){const s=g.filter(d=>d.tarefa_id===t.id),a=s.filter(d=>d.feito).length,o=E[t.prioridade]||E.media;return`<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${o.cor}"></div>
      <div class="pj-card-title">${u(t.titulo)}</div>
    </div>
    ${t.descricao?`<div class="pj-card-desc">${u(t.descricao).slice(0,80)}${t.descricao.length>80?"…":""}</div>`:""}
    <div class="pj-card-foot">
      ${D(t.prazo)}
      ${s.length?`<span class="pj-sub-chip">${a}/${s.length}</span>`:""}
    </div>
  </div>`}function K(t){const s=$.find(a=>a.k===t)||$[0];return`<span class="pj-pill" style="background:${s.cor}22;color:${s.cor}">${s.l}</span>`}function U(t){const s=E[t]||E.media;return`<span class="pj-pill" style="background:${s.cor}22;color:${s.cor}">${s.l}</span>`}function D(t){if(!t)return"";const s=new Date(t+"T00:00:00"),a=new Date;a.setHours(0,0,0,0);const o=Math.round((s-a)/864e5);let d="pj-prazo";return o<0?d+=" late":o<=2&&(d+=" soon"),`<span class="${d}">${T(t)}</span>`}function W(){const t=document.getElementById("pj-main");if(!t)return;t.addEventListener("click",a=>{const o=a.target.closest(".pj-card"),d=a.target.closest(".pj-row"),e=a.target.closest(".del-tar");if(e){a.stopPropagation();const r=f.find(n=>n.id===e.dataset.tid);r&&confirm(`Excluir "${r.titulo}"?`)&&O(r.id);return}if(o){const r=f.find(n=>n.id===o.dataset.tid);r&&L(r)}else if(d){const r=f.find(n=>n.id===d.dataset.tid);r&&L(r)}});let s=null;t.querySelectorAll(".pj-card").forEach(a=>{a.addEventListener("dragstart",o=>{s=a.dataset.tid,a.classList.add("drag"),o.dataTransfer.effectAllowed="move"}),a.addEventListener("dragend",()=>{a.classList.remove("drag"),t.querySelectorAll(".pj-col-cards.over").forEach(o=>o.classList.remove("over"))})}),t.querySelectorAll(".pj-col-cards").forEach(a=>{a.addEventListener("dragover",o=>{o.preventDefault(),a.classList.add("over")}),a.addEventListener("dragleave",()=>a.classList.remove("over")),a.addEventListener("drop",async o=>{if(o.preventDefault(),a.classList.remove("over"),!s)return;const d=a.dataset.drop,e=f.find(n=>n.id===s);if(!e||e.status===d)return;e.status=d;const{error:r}=await p.from("tarefas").update({status:d,atualizado_em:new Date().toISOString()}).eq("id",s);if(r){l("Erro: "+r.message,"err");return}q()})})}function B(t={}){const s='<option value="">— sem cliente (interno) —</option>'+h.map(d=>`<option value="${d.id}"${t.cliente_id===d.id?" selected":""}>${u(d.empresa||d.nome)}</option>`).join(""),a=x.map(d=>`<span class="pj-cor-opt${(t.cor||x[0])===d?" on":""}" data-cor="${d}" style="background:${d}"></span>`).join("");F(t.id?"Editar projeto":"Novo projeto",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${A(t.nome||"")}" placeholder="Ex: Site Desjoyaux"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${u(t.descricao||"")}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${s}</select></div>
      <div class="fg"><label class="fl">Prazo</label><input class="fi" type="date" id="pj-prazo" value="${t.prazo||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Cor</label>
      <div class="pj-cor-row" id="pj-cor-row">${a}</div></div>
  `,`
    <button class="btn bg" id="pj-cancel">Cancelar</button>
    <button class="btn bp" id="pj-save">${t.id?"Salvar":"Criar"}</button>
  `);let o=t.cor||x[0];document.getElementById("pj-cor-row").addEventListener("click",d=>{const e=d.target.closest(".pj-cor-opt");e&&(o=e.dataset.cor,document.querySelectorAll(".pj-cor-opt").forEach(r=>r.classList.toggle("on",r.dataset.cor===o)))}),document.getElementById("pj-cancel").addEventListener("click",b),document.getElementById("pj-save").addEventListener("click",async()=>{const d={nome:document.getElementById("pj-nome").value.trim(),descricao:document.getElementById("pj-desc").value.trim()||null,cliente_id:document.getElementById("pj-cli").value||null,prazo:document.getElementById("pj-prazo").value||null,cor:o,atualizado_em:new Date().toISOString()};if(!d.nome)return l("Nome é obrigatório","err");const e=t.id?p.from("projetos").update(d).eq("id",t.id):p.from("projetos").insert(d).select().single(),{data:r,error:n}=await e;if(n)return l("Erro: "+n.message,"err");!t.id&&r&&(c=r.id),b(),l(t.id?"Projeto salvo":"Projeto criado"),k()})}async function G(t){if(!confirm(`Excluir o projeto "${t.nome}" e TODAS as tarefas dele?`))return;const{error:s}=await p.from("projetos").delete().eq("id",t.id);if(s)return l("Erro: "+s.message,"err");c=null,l("Projeto excluído"),k()}function L(t={}){const s=!t.id,a=$.map(e=>`<option value="${e.k}"${(t.status||"todo")===e.k?" selected":""}>${e.l}</option>`).join(""),o=P.map(e=>`<option value="${e.k}"${(t.prioridade||"media")===e.k?" selected":""}>${e.l}</option>`).join(""),d=s?[]:g.filter(e=>e.tarefa_id===t.id);F(s?"Nova tarefa":"Editar tarefa",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${A(t.titulo||"")}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${u(t.descricao||"")}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="tr-status">${a}</select></div>
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="tr-prio">${o}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Prazo</label>
      <input class="fi" type="date" id="tr-prazo" value="${t.prazo||""}"></div>
    <div class="fg">
      <label class="fl">Checklist</label>
      <div id="tr-subs" class="pj-subs">
        ${d.map(e=>C(e.id,e.texto,e.feito)).join("")}
      </div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `,`
    ${s?"":'<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${s?"Criar":"Salvar"}</button>
  `),document.getElementById("tr-sub-add").addEventListener("click",()=>{const e=document.getElementById("tr-sub-new"),r=e.value.trim();if(!r)return;const n="new-"+Math.random().toString(36).slice(2);document.getElementById("tr-subs").insertAdjacentHTML("beforeend",C(n,r,!1)),e.value="",e.focus()}),document.getElementById("tr-sub-new").addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),document.getElementById("tr-sub-add").click())}),document.getElementById("tr-subs").addEventListener("click",e=>{const r=e.target.closest(".pj-sub-del");r&&r.closest(".pj-sub-row").remove()}),document.getElementById("tr-cancel").addEventListener("click",b),s||document.getElementById("tr-del").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await O(t.id),b())}),document.getElementById("tr-save").addEventListener("click",async()=>{const e={projeto_id:t.projeto_id||c,titulo:document.getElementById("tr-titulo").value.trim(),descricao:document.getElementById("tr-desc").value.trim()||null,status:document.getElementById("tr-status").value,prioridade:document.getElementById("tr-prio").value,prazo:document.getElementById("tr-prazo").value||null,atualizado_em:new Date().toISOString()};if(!e.titulo)return l("Título é obrigatório","err");let r=t.id;if(s){const{data:i,error:v}=await p.from("tarefas").insert(e).select().single();if(v)return l("Erro: "+v.message,"err");r=i.id}else{const{error:i}=await p.from("tarefas").update(e).eq("id",r);if(i)return l("Erro: "+i.message,"err")}const n=[...document.querySelectorAll(".pj-sub-row")],M=s?[]:g.filter(i=>i.tarefa_id===r),_=new Set;let S=0;for(const i of n){const v=i.dataset.sid,w=i.querySelector(".pj-sub-text").value.trim(),z=i.querySelector(".pj-sub-cb").checked;w&&(v.startsWith("new-")?await p.from("tarefa_subtasks").insert({tarefa_id:r,texto:w,feito:z,ordem:S++}):(_.add(v),await p.from("tarefa_subtasks").update({texto:w,feito:z,ordem:S++}).eq("id",v)))}for(const i of M)_.has(i.id)||await p.from("tarefa_subtasks").delete().eq("id",i.id);b(),l(s?"Tarefa criada":"Tarefa salva"),k()})}function C(t,s,a){return`<div class="pj-sub-row" data-sid="${t}">
    <input type="checkbox" class="pj-sub-cb" ${a?"checked":""}>
    <input type="text" class="pj-sub-text fi" value="${A(s)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`}async function O(t){const{error:s}=await p.from("tarefas").delete().eq("id",t);if(s)return l("Erro: "+s.message,"err");l("Tarefa excluída"),k()}function u(t){return String(t??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s])}function A(t){return u(t)}export{k as render};
