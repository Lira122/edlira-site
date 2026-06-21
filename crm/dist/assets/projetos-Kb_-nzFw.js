import{s as I,d as m,o as C,f as $,t as u,h as M}from"./index-B9kwJK3H.js";const L=[{k:"todo",l:"A fazer",cor:"#A0A0A0"},{k:"doing",l:"Fazendo",cor:"#4A9EFF"},{k:"review",l:"Revisão",cor:"#F5A623"},{k:"done",l:"Feito",cor:"#34D399"}],P=[{k:"baixa",l:"Baixa",cor:"#A0A0A0"},{k:"media",l:"Média",cor:"#4A9EFF"},{k:"alta",l:"Alta",cor:"#F5A623"},{k:"urgente",l:"Urgente",cor:"#FF5C5C"}],B=Object.fromEntries(P.map(t=>[t.k,t])),D=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4"],S=["#A0A0A0","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4","#C5F82A"],U=[{k:1,l:"Seg"},{k:2,l:"Ter"},{k:3,l:"Qua"},{k:4,l:"Qui"},{k:5,l:"Sex"},{k:6,l:"Sáb"},{k:0,l:"Dom"}];let b=[],k=[],j=[],A=[],x=[],g=null,_="kanban";async function h(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>',await J(),await ct(),await J(),g&&!b.find(n=>n.id===g)&&(g=null),!g&&b.length&&(g=b[0].id),V(),K()}async function J(){const[t,n,s,i,o]=await Promise.all([I("projetos",{order:{column:"criado_em",ascending:!1}}),I("clientes",{columns:"id,nome,empresa,status,whatsapp",order:{column:"nome",ascending:!0}}),I("tarefas",{order:{column:"ordem",ascending:!0}}),I("tarefa_subtasks",{order:{column:"ordem",ascending:!0}}),I("rotinas",{order:{column:"criado_em",ascending:!1}})]);b=t.data||[],k=n.data||[],j=s.data||[],A=i.data||[],x=o.data||[]}function V(){const t=(o,d)=>`<button class="pj-tab${_===o?" on":""}" data-tab="${o}">${d}</button>`,n=_==="rotinas"?'<button class="btn bp" id="btn-add-rotina">+ Nova rotina</button>':'<button class="btn bp" id="btn-add-proj">+ Novo projeto</button>';document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${t("kanban","Kanban")}${t("lista","Lista")}${t("hoje","Hoje")}${t("rotinas","Rotinas")}</div>
    ${n}
  `,document.querySelectorAll(".pj-tab").forEach(o=>o.addEventListener("click",()=>{_=o.dataset.tab,V(),K()}));const s=document.getElementById("btn-add-proj"),i=document.getElementById("btn-add-rotina");s&&s.addEventListener("click",()=>N()),i&&i.addEventListener("click",()=>F())}function K(){return _==="hoje"?tt():_==="rotinas"?et():Q()}function tt(){const t=document.getElementById("content"),n=new Date().toISOString().slice(0,10),s=j.filter(d=>d.status!=="done"&&d.prazo&&d.prazo<=n);if(!s.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra hoje</div>
      <div style="font-size:12px">Sem tarefas vencidas ou pra hoje. Tá em dia.</div>
    </div>`;return}const i={};for(const d of s)(i[d.projeto_id]=i[d.projeto_id]||[]).push(d);const o=Object.entries(i).map(([d,a])=>{const e=b.find(r=>r.id===d);if(!e)return"";const c=k.find(r=>r.id===e.cliente_id),l=a.sort((r,p)=>(r.prazo||"").localeCompare(p.prazo||"")).map(r=>`<div class="pj-hoje-row" data-tid="${r.id}">
        <input type="checkbox" class="pj-hoje-cb" data-tid="${r.id}">
        <div class="pj-hoje-title">${f(r.titulo)}</div>
        ${W(r.prioridade)}
        ${R(r.prazo)}
      </div>`).join("");return`<div class="pj-hoje-block">
      <div class="pj-hoje-head">
        <span class="pj-side-dot" style="background:${e.cor||"#C5F82A"}"></span>
        <span class="pj-hoje-proj">${f(e.nome)}</span>
        <span class="pj-hoje-cli">${c?f(c.empresa||c.nome):"Interno"}</span>
        <span class="pj-col-count">${a.length}</span>
      </div>
      <div class="pj-hoje-rows">${l}</div>
    </div>`}).join("");t.innerHTML=`<div class="pj-hoje">${o}</div>`,t.addEventListener("click",async d=>{const a=d.target.closest(".pj-hoje-cb");if(a){d.stopPropagation();const c=j.find(l=>l.id===a.dataset.tid);if(!c)return;await X(c,()=>h());return}const e=d.target.closest(".pj-hoje-row");if(e){const c=j.find(l=>l.id===e.dataset.tid);c&&z(c)}})}function et(){const t=document.getElementById("content");if(!x.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma rotina ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Rotinas geram tarefas automaticamente em dias específicos.<br>Ex: toda segunda criar "Mandar vídeo motivacional pra Adriane".</div>
      <button class="btn bp" id="btn-first-rot">+ Criar primeira rotina</button>
    </div>`,document.getElementById("btn-first-rot").addEventListener("click",()=>F());return}const n=x.map(s=>{const i=b.find(a=>a.id===s.projeto_id),o=k.find(a=>a.id===s.cliente_id)||i&&k.find(a=>a.id===i.cliente_id),d=Array.isArray(s.tarefas)?s.tarefas:[];return`<div class="pj-rot-card" data-rid="${s.id}">
      <div class="pj-rot-head">
        <div class="pj-rot-name">${f(s.nome)}</div>
        <label class="pj-rot-toggle">
          <input type="checkbox" class="pj-rot-active" data-rid="${s.id}" ${s.ativa?"checked":""}>
          <span>${s.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="pj-rot-meta">
        ${i?`<span class="pj-rot-chip"><span class="pj-side-dot" style="background:${i.cor||"#C5F82A"};width:7px;height:7px"></span>${f(i.nome)}</span>`:""}
        ${o?`<span class="pj-rot-chip">${f(o.empresa||o.nome)}</span>`:""}
        <span class="pj-rot-chip">${at(s)}</span>
        <span class="pj-rot-chip">${d.length} tarefa${d.length===1?"":"s"}</span>
        ${s.ultima_geracao?`<span class="pj-rot-chip" style="color:var(--text-3)">Última: ${M(s.ultima_geracao)}</span>`:""}
      </div>
      ${d.length?`<div class="pj-rot-tarefas">${d.map(a=>`<span class="pj-rot-tlbl">• ${f(a.titulo||"")}</span>`).join("")}</div>`:""}
      <div class="pj-rot-acts">
        <button class="btn bg bsm rot-edit" data-rid="${s.id}">Editar</button>
        <button class="btn bg bsm rot-run"  data-rid="${s.id}">Rodar agora</button>
        <button class="btn bd bsm rot-del"  data-rid="${s.id}">Excluir</button>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-rot-grid">${n}</div>`,t.addEventListener("click",async s=>{const i=s.target.closest(".rot-edit"),o=s.target.closest(".rot-del"),d=s.target.closest(".rot-run"),a=s.target.closest(".pj-rot-active");if(i){const e=x.find(c=>c.id===i.dataset.rid);e&&F(e)}else if(o){const e=x.find(c=>c.id===o.dataset.rid);e&&confirm(`Excluir rotina "${e.nome}"? (Tarefas já geradas continuam)`)&&(await m.from("rotinas").delete().eq("id",e.id),u("Rotina excluída"),h())}else if(d){const e=x.find(c=>c.id===d.dataset.rid);e&&(await pt(e),u("Tarefas geradas"),h())}else if(a){const e=x.find(c=>c.id===a.dataset.rid);e&&(e.ativa=a.checked,await m.from("rotinas").update({ativa:e.ativa,atualizado_em:new Date().toISOString()}).eq("id",e.id))}})}function at(t){if(t.cadencia==="diaria")return"Todos os dias";if(t.cadencia==="semanal"){const n=(t.dias_semana||[]).map(s=>{var i;return(i=U.find(o=>o.k===s))==null?void 0:i.l}).filter(Boolean).join(", ");return n?`Semanal: ${n}`:"Semanal"}return t.cadencia==="mensal"?`Mensal: dia ${t.dia_mes||1}`:t.cadencia}function Q(){const t=document.getElementById("content");if(!b.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`,document.getElementById("btn-add-first").addEventListener("click",()=>N());return}const n=b.map(s=>{const i=k.find(a=>a.id===s.cliente_id),o=j.filter(a=>a.projeto_id===s.id).length,d=j.filter(a=>a.projeto_id===s.id&&a.status==="done").length;return`<div class="pj-side ${s.id===g?"on":""}" data-pid="${s.id}">
      <div class="pj-side-dot" style="background:${s.cor||"#C5F82A"}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${f(s.nome)}</div>
        <div class="pj-side-meta">${i?f(i.empresa||i.nome):"Interno"} · ${d}/${o}</div>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${b.length})</span></div>
      <div class="pj-sidebar-list">${n}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`,t.querySelector(".pj-sidebar-list").addEventListener("click",s=>{const i=s.target.closest(".pj-side");i&&(g=i.dataset.pid,Q())}),O()}function O(){const t=b.find(a=>a.id===g);if(!t)return;const n=k.find(a=>a.id===t.cliente_id),s=j.filter(a=>a.projeto_id===t.id),i=T(t),o=`<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${t.cor||"#C5F82A"}"></div>
      <div>
        <div class="pj-head-name">${f(t.nome)}</div>
        <div class="pj-head-meta">
          ${n?`<span>${f(n.empresa||n.nome)}</span>`:"<span>Interno</span>"}
          ${t.prazo?` · <span>Prazo ${M(t.prazo)}</span>`:""}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`,d=_==="lista"?st(s,i):it(s,i);document.getElementById("pj-main").innerHTML=o+d,document.getElementById("pj-edit").addEventListener("click",()=>N(t)),document.getElementById("pj-del").addEventListener("click",()=>rt(t)),document.getElementById("pj-add-tar").addEventListener("click",()=>{var a;return z({projeto_id:t.id,status:((a=i[0])==null?void 0:a.k)||"todo"})}),dt()}function T(t){const n=t==null?void 0:t.etapas;return Array.isArray(n)&&n.length?n:L}function it(t,n){return`<div class="pj-kanban">${n.map(i=>{const o=t.filter(a=>a.status===i.k),d=o.length?o.map(a=>nt(a)).join(""):'<div class="pj-empty">—</div>';return`<div class="pj-col" data-status="${i.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${i.cor}">
          <span class="pj-col-bullet" style="background:${i.cor}"></span>${f(i.l)}
        </span>
        <span class="pj-col-count">${o.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${i.k}">${d}</div>
    </div>`}).join("")}</div>`}function st(t,n){if(!t.length)return'<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>';const s=n.map(d=>d.k);return`<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${[...t].sort((d,a)=>s.indexOf(d.status)-s.indexOf(a.status)||(d.prazo||"").localeCompare(a.prazo||"")).map(d=>{const a=A.filter(c=>c.tarefa_id===d.id),e=a.filter(c=>c.feito).length;return`<tr class="pj-row" data-tid="${d.id}">
      <td>${ot(d.status,n)}</td>
      <td class="pj-row-title">${f(d.titulo)}${a.length?`<span class="pj-sub-chip">${e}/${a.length}</span>`:""}${d.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</td>
      <td>${W(d.prioridade)}</td>
      <td class="tm">${R(d.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${d.id}">×</button></td>
    </tr>`}).join("")}</tbody>
    </table>
  </div>`}function nt(t){const n=A.filter(o=>o.tarefa_id===t.id),s=n.filter(o=>o.feito).length,i=B[t.prioridade]||B.media;return`<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${i.cor}"></div>
      <div class="pj-card-title">${f(t.titulo)}${t.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</div>
    </div>
    ${t.descricao?`<div class="pj-card-desc">${f(t.descricao).slice(0,80)}${t.descricao.length>80?"…":""}</div>`:""}
    <div class="pj-card-foot">
      ${R(t.prazo)}
      ${n.length?`<span class="pj-sub-chip">${s}/${n.length}</span>`:""}
    </div>
  </div>`}function ot(t,n){const s=(n||L).find(i=>i.k===t)||L[0];return`<span class="pj-pill" style="background:${s.cor}22;color:${s.cor}">${f(s.l)}</span>`}function W(t){const n=B[t]||B.media;return`<span class="pj-pill" style="background:${n.cor}22;color:${n.cor}">${n.l}</span>`}function R(t){if(!t)return"";const n=new Date(t+"T00:00:00"),s=new Date;s.setHours(0,0,0,0);const i=Math.round((n-s)/864e5);let o="pj-prazo";return i<0?o+=" late":i<=2&&(o+=" soon"),`<span class="${o}">${M(t)}</span>`}function dt(){const t=document.getElementById("pj-main");if(!t)return;t.addEventListener("click",s=>{const i=s.target.closest(".pj-card"),o=s.target.closest(".pj-row"),d=s.target.closest(".del-tar");if(d){s.stopPropagation();const a=j.find(e=>e.id===d.dataset.tid);a&&confirm(`Excluir "${a.titulo}"?`)&&Y(a.id);return}if(i){const a=j.find(e=>e.id===i.dataset.tid);a&&z(a)}else if(o){const a=j.find(e=>e.id===o.dataset.tid);a&&z(a)}});let n=null;t.querySelectorAll(".pj-card").forEach(s=>{s.addEventListener("dragstart",i=>{n=s.dataset.tid,s.classList.add("drag"),i.dataTransfer.effectAllowed="move"}),s.addEventListener("dragend",()=>{s.classList.remove("drag"),t.querySelectorAll(".pj-col-cards.over").forEach(i=>i.classList.remove("over"))})}),t.querySelectorAll(".pj-col-cards").forEach(s=>{s.addEventListener("dragover",i=>{i.preventDefault(),s.classList.add("over")}),s.addEventListener("dragleave",()=>s.classList.remove("over")),s.addEventListener("drop",async i=>{if(i.preventDefault(),s.classList.remove("over"),!n)return;const o=s.dataset.drop,d=j.find(e=>e.id===n);if(!d||d.status===o)return;if(o==="done"){await X(d,()=>O());return}d.status=o;const{error:a}=await m.from("tarefas").update({status:o,atualizado_em:new Date().toISOString()}).eq("id",n);if(a){u("Erro: "+a.message,"err");return}O()})})}function N(t={}){const n='<option value="">— sem cliente (interno) —</option>'+Z(t.cliente_id).map(a=>`<option value="${a.id}"${t.cliente_id===a.id?" selected":""}>${f(a.empresa||a.nome)}</option>`).join(""),s=D.map(a=>`<span class="pj-cor-opt${(t.cor||D[0])===a?" on":""}" data-cor="${a}" style="background:${a}"></span>`).join("");let i=Array.isArray(t.etapas)&&t.etapas.length?JSON.parse(JSON.stringify(t.etapas)):JSON.parse(JSON.stringify(L));C(t.id?"Editar projeto":"Novo projeto",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${w(t.nome||"")}" placeholder="Ex: Conteúdo semanal Adriane"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${f(t.descricao||"")}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${n}</select></div>
      <div class="fg"><label class="fl">Prazo</label><input class="fi" type="date" id="pj-prazo" value="${t.prazo||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Cor</label>
      <div class="pj-cor-row" id="pj-cor-row">${s}</div></div>
    <div class="fg" style="margin-top:14px">
      <label class="fl">Etapas do fluxo</label>
      <div id="pj-etapas-list" class="pj-etapas-list"></div>
      <button class="btn bg bsm" id="pj-etapa-add" type="button" style="margin-top:6px;align-self:flex-start">+ Etapa</button>
    </div>
  `,`
    <button class="btn bg" id="pj-cancel">Cancelar</button>
    <button class="btn bp" id="pj-save">${t.id?"Salvar":"Criar"}</button>
  `);let o=t.cor||D[0];document.getElementById("pj-cor-row").addEventListener("click",a=>{const e=a.target.closest(".pj-cor-opt");e&&(o=e.dataset.cor,document.querySelectorAll(".pj-cor-opt").forEach(c=>c.classList.toggle("on",c.dataset.cor===o)))});const d=()=>{document.getElementById("pj-etapas-list").innerHTML=i.map((a,e)=>`
      <div class="pj-etapa-row" data-i="${e}">
        <span class="pj-etapa-color" data-i="${e}" style="background:${a.cor}"></span>
        <input type="text" class="fi pj-etapa-l" data-i="${e}" value="${w(a.l)}" style="flex:1;padding:6px 9px;font-size:12.5px">
        <button class="pj-etapa-up"   type="button" data-i="${e}" ${e===0?"disabled":""}>↑</button>
        <button class="pj-etapa-down" type="button" data-i="${e}" ${e===i.length-1?"disabled":""}>↓</button>
        <button class="pj-sub-del"    type="button" data-i="${e}" ${i.length<=1?"disabled":""} title="Remover">×</button>
      </div>
    `).join("")};d(),document.getElementById("pj-etapa-add").addEventListener("click",()=>{const a="etapa_"+Math.random().toString(36).slice(2,7);i.push({k:a,l:"Nova etapa",cor:S[i.length%S.length]}),d()}),document.getElementById("pj-etapas-list").addEventListener("click",a=>{const e=a.target.closest(".pj-etapa-up"),c=a.target.closest(".pj-etapa-down"),l=a.target.closest(".pj-sub-del"),r=a.target.closest(".pj-etapa-color");if(e){const p=+e.dataset.i;[i[p-1],i[p]]=[i[p],i[p-1]],d()}if(c){const p=+c.dataset.i;[i[p+1],i[p]]=[i[p],i[p+1]],d()}if(l&&i.length>1){const p=+l.dataset.i;i.splice(p,1),d()}if(r){const p=+r.dataset.i,E=i[p].cor,v=S.indexOf(E);i[p].cor=S[(v+1)%S.length],d()}}),document.getElementById("pj-etapas-list").addEventListener("input",a=>{const e=a.target.closest(".pj-etapa-l");e&&(i[+e.dataset.i].l=e.value)}),document.getElementById("pj-cancel").addEventListener("click",$),document.getElementById("pj-save").addEventListener("click",async()=>{const a=i.filter(p=>(p.l||"").trim()).map(p=>({k:p.k||"etapa_"+Math.random().toString(36).slice(2,7),l:p.l.trim(),cor:p.cor||"#A0A0A0"}));if(!a.length)return u("Adicione pelo menos 1 etapa","err");const e={nome:document.getElementById("pj-nome").value.trim(),descricao:document.getElementById("pj-desc").value.trim()||null,cliente_id:document.getElementById("pj-cli").value||null,prazo:document.getElementById("pj-prazo").value||null,cor:o,etapas:a,atualizado_em:new Date().toISOString()};if(!e.nome)return u("Nome é obrigatório","err");const c=t.id?m.from("projetos").update(e).eq("id",t.id):m.from("projetos").insert(e).select().single(),{data:l,error:r}=await c;if(r)return u("Erro: "+r.message,"err");!t.id&&l&&(g=l.id),$(),u(t.id?"Projeto salvo":"Projeto criado"),h()})}async function rt(t){if(!confirm(`Excluir "${t.nome}" e TODAS as tarefas e rotinas dele?`))return;const{error:n}=await m.from("projetos").delete().eq("id",t.id);if(n)return u("Erro: "+n.message,"err");g=null,u("Projeto excluído"),h()}async function X(t,n){if(t.status==="done"){n&&n();return}t.status="done";const{error:s}=await m.from("tarefas").update({status:"done",atualizado_em:new Date().toISOString()}).eq("id",t.id);if(s){u("Erro: "+s.message,"err");return}const i=b.find(r=>r.id===t.projeto_id),o=i?k.find(r=>r.id===i.cliente_id):null;if(!o||!o.whatsapp||t.notificar_cliente===!1){u("Marcada como feita"),n&&n();return}const d=t.apelido_cliente||t.titulo||"",a=(o.nome||"").split(" ")[0]||"";C("Tarefa concluída — avisar o cliente?",`
    <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:14px">
      Cliente: <strong style="color:var(--text)">${f(o.empresa||o.nome)}</strong>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Como mostrar pro cliente</label>
      <input class="fi" id="cn-apelido" value="${w(d)}" placeholder="Ex: Criativo de feed dessa semana">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Linguagem de cliente, não de tarefa interna.</div>
    </div>
    <div class="fg" style="margin-bottom:6px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
        <input type="checkbox" id="cn-incluir" checked>
        <span>Incluir no resumão automático das 18h</span>
      </label>
    </div>
  `,`
    <button class="btn bg" id="cn-skip">Não notificar</button>
    <button class="btn bg" id="cn-save">Salvar no resumão</button>
    <button class="btn bp" id="cn-now">Avisar agora</button>
  `);const e=r=>{$(),n&&n()},c=()=>document.getElementById("cn-apelido").value.trim()||t.titulo,l=()=>document.getElementById("cn-incluir").checked;document.getElementById("cn-skip").addEventListener("click",async()=>{await m.from("tarefas").update({apelido_cliente:c(),notificar_cliente:!1}).eq("id",t.id),u("Concluída — cliente não vai ser avisado"),e()}),document.getElementById("cn-save").addEventListener("click",async()=>{const r=c(),p=l();await m.from("tarefas").update({apelido_cliente:r,notificar_cliente:p}).eq("id",t.id),u(p?"No resumão das 18h":"Concluída — sem aviso"),e()}),document.getElementById("cn-now").addEventListener("click",async()=>{const r=c(),p=`Oi${a?`, ${a}`:""}! Terminei aqui: ${r}.`;await m.from("tarefas").update({apelido_cliente:r,notificar_cliente:!0,notificado_cliente_em:new Date().toISOString()}).eq("id",t.id);const E=String(o.whatsapp).replace(/\D/g,"");window.open(`https://wa.me/${E}?text=${encodeURIComponent(p)}`,"_blank"),u("Abrindo WhatsApp…"),e()})}function z(t={}){const n=!t.id,s=b.find(e=>e.id===(t.projeto_id||g)),i=T(s),o=i.map(e=>`<option value="${e.k}"${(t.status||i[0].k)===e.k?" selected":""}>${f(e.l)}</option>`).join(""),d=P.map(e=>`<option value="${e.k}"${(t.prioridade||"media")===e.k?" selected":""}>${e.l}</option>`).join(""),a=n?[]:A.filter(e=>e.tarefa_id===t.id);C(n?"Nova tarefa":"Editar tarefa",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${w(t.titulo||"")}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${f(t.descricao||"")}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Etapa</label><select class="fsl" id="tr-status">${o}</select></div>
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="tr-prio">${d}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Prazo</label>
      <input class="fi" type="date" id="tr-prazo" value="${t.prazo||""}"></div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Como mostrar pro cliente <span style="color:var(--text-3);font-weight:400">(opcional)</span></label>
      <input class="fi" id="tr-apelido" value="${w(t.apelido_cliente||"")}" placeholder="Se vazio, usa o título da tarefa">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Aparece no resumão das 18h pro cliente.</div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
        <input type="checkbox" id="tr-notif" ${t.notificar_cliente===!1?"":"checked"}>
        <span>Incluir esta tarefa no resumão automático pro cliente</span>
      </label>
    </div>
    <div class="fg">
      <label class="fl">Checklist</label>
      <div id="tr-subs" class="pj-subs">${a.map(e=>G(e.id,e.texto,e.feito)).join("")}</div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `,`
    ${n?"":'<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${n?"Criar":"Salvar"}</button>
  `),document.getElementById("tr-sub-add").addEventListener("click",()=>{const e=document.getElementById("tr-sub-new"),c=e.value.trim();if(!c)return;const l="new-"+Math.random().toString(36).slice(2);document.getElementById("tr-subs").insertAdjacentHTML("beforeend",G(l,c,!1)),e.value="",e.focus()}),document.getElementById("tr-sub-new").addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),document.getElementById("tr-sub-add").click())}),document.getElementById("tr-subs").addEventListener("click",e=>{const c=e.target.closest(".pj-sub-del");c&&c.closest(".pj-sub-row").remove()}),document.getElementById("tr-cancel").addEventListener("click",$),n||document.getElementById("tr-del").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await Y(t.id),$())}),document.getElementById("tr-save").addEventListener("click",async()=>{const e={projeto_id:t.projeto_id||g,titulo:document.getElementById("tr-titulo").value.trim(),descricao:document.getElementById("tr-desc").value.trim()||null,status:document.getElementById("tr-status").value,prioridade:document.getElementById("tr-prio").value,prazo:document.getElementById("tr-prazo").value||null,apelido_cliente:document.getElementById("tr-apelido").value.trim()||null,notificar_cliente:document.getElementById("tr-notif").checked,atualizado_em:new Date().toISOString()};if(!e.titulo)return u("Título é obrigatório","err");let c=t.id;if(n){const{data:v,error:y}=await m.from("tarefas").insert(e).select().single();if(y)return u("Erro: "+y.message,"err");c=v.id}else{const{error:v}=await m.from("tarefas").update(e).eq("id",c);if(v)return u("Erro: "+v.message,"err")}const l=[...document.querySelectorAll(".pj-sub-row")],r=n?[]:A.filter(v=>v.tarefa_id===c),p=new Set;let E=0;for(const v of l){const y=v.dataset.sid,q=v.querySelector(".pj-sub-text").value.trim(),H=v.querySelector(".pj-sub-cb").checked;q&&(y.startsWith("new-")?await m.from("tarefa_subtasks").insert({tarefa_id:c,texto:q,feito:H,ordem:E++}):(p.add(y),await m.from("tarefa_subtasks").update({texto:q,feito:H,ordem:E++}).eq("id",y)))}for(const v of r)p.has(v.id)||await m.from("tarefa_subtasks").delete().eq("id",v.id);$(),u(n?"Tarefa criada":"Tarefa salva"),h()})}function G(t,n,s){return`<div class="pj-sub-row" data-sid="${t}">
    <input type="checkbox" class="pj-sub-cb" ${s?"checked":""}>
    <input type="text" class="pj-sub-text fi" value="${w(n)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`}async function Y(t){const{error:n}=await m.from("tarefas").delete().eq("id",t);if(n)return u("Erro: "+n.message,"err");u("Tarefa excluída"),h()}function F(t={}){const n=!t.id,s='<option value="">— sem cliente —</option>'+Z(t.cliente_id).map(l=>`<option value="${l.id}"${t.cliente_id===l.id?" selected":""}>${f(l.empresa||l.nome)}</option>`).join(""),i='<option value="">— escolha um projeto —</option>'+b.map(l=>`<option value="${l.id}"${t.projeto_id===l.id?" selected":""}>${f(l.nome)}</option>`).join(""),o=t.cadencia||"semanal",d=t.dias_semana||[1],a=Array.isArray(t.tarefas)?JSON.parse(JSON.stringify(t.tarefas)):[],e=U.map(l=>`<label class="pj-dia-chip ${d.includes(l.k)?"on":""}" data-d="${l.k}"><input type="checkbox" ${d.includes(l.k)?"checked":""} style="display:none">${l.l}</label>`).join("");C(n?"Nova rotina":"Editar rotina",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="rt-nome" value="${w(t.nome||"")}" placeholder="Ex: Rotina semanal Adriane"></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rt-cli">${s}</select></div>
      <div class="fg"><label class="fl">Projeto *</label><select class="fsl" id="rt-proj">${i}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Cadência</label>
      <div class="pj-cad-row">
        <label class="pj-cad-opt ${o==="diaria"?"on":""}"><input type="radio" name="rt-cad" value="diaria" ${o==="diaria"?"checked":""}>Todo dia</label>
        <label class="pj-cad-opt ${o==="semanal"?"on":""}"><input type="radio" name="rt-cad" value="semanal" ${o==="semanal"?"checked":""}>Semanal</label>
        <label class="pj-cad-opt ${o==="mensal"?"on":""}"><input type="radio" name="rt-cad" value="mensal" ${o==="mensal"?"checked":""}>Mensal</label>
      </div>
    </div>
    <div class="fg" id="rt-dias-wrap" style="margin-bottom:11px;${o==="semanal"?"":"display:none"}">
      <label class="fl">Dias da semana</label>
      <div class="pj-dias-row" id="rt-dias">${e}</div>
    </div>
    <div class="fg" id="rt-mes-wrap" style="margin-bottom:11px;${o==="mensal"?"":"display:none"}">
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
  `);const c=()=>{document.getElementById("rt-tars").innerHTML=a.map((l,r)=>`
      <div class="pj-rot-tar-row" data-i="${r}">
        <input type="text" class="fi rt-t-titulo" data-i="${r}" value="${w(l.titulo||"")}" placeholder="Título" style="flex:2;padding:6px 9px;font-size:12.5px">
        <select class="fsl rt-t-prio" data-i="${r}" style="flex:1;padding:6px 9px;font-size:12.5px">
          ${P.map(p=>`<option value="${p.k}"${(l.prioridade||"media")===p.k?" selected":""}>${p.l}</option>`).join("")}
        </select>
        <button class="pj-sub-del" type="button" data-i="${r}">×</button>
      </div>
    `).join("")};c(),document.getElementById("rt-tar-add").addEventListener("click",()=>{a.push({titulo:"",prioridade:"media"}),c()}),document.getElementById("rt-tars").addEventListener("click",l=>{const r=l.target.closest(".pj-sub-del");r&&(a.splice(+r.dataset.i,1),c())}),document.getElementById("rt-tars").addEventListener("input",l=>{const r=l.target.closest(".rt-t-titulo"),p=l.target.closest(".rt-t-prio");r&&(a[+r.dataset.i].titulo=r.value),p&&(a[+p.dataset.i].prioridade=p.value)}),document.querySelectorAll('input[name="rt-cad"]').forEach(l=>l.addEventListener("change",()=>{document.querySelectorAll(".pj-cad-opt").forEach(p=>p.classList.toggle("on",p.querySelector("input").checked));const r=document.querySelector('input[name="rt-cad"]:checked').value;document.getElementById("rt-dias-wrap").style.display=r==="semanal"?"":"none",document.getElementById("rt-mes-wrap").style.display=r==="mensal"?"":"none"})),document.getElementById("rt-dias").addEventListener("click",l=>{const r=l.target.closest(".pj-dia-chip");r&&(l.preventDefault(),r.classList.toggle("on"),r.querySelector("input").checked=r.classList.contains("on"))}),document.getElementById("rt-cancel").addEventListener("click",$),n||document.getElementById("rt-del").addEventListener("click",async()=>{confirm(`Excluir rotina "${t.nome}"?`)&&(await m.from("rotinas").delete().eq("id",t.id),$(),u("Rotina excluída"),h())}),document.getElementById("rt-save").addEventListener("click",async()=>{const l=document.querySelector('input[name="rt-cad"]:checked').value,r=[...document.querySelectorAll("#rt-dias .pj-dia-chip.on")].map(y=>+y.dataset.d),p={nome:document.getElementById("rt-nome").value.trim(),cliente_id:document.getElementById("rt-cli").value||null,projeto_id:document.getElementById("rt-proj").value||null,cadencia:l,dias_semana:l==="semanal"?r:[],dia_mes:l==="mensal"?+document.getElementById("rt-dia-mes").value||1:null,tarefas:a.filter(y=>(y.titulo||"").trim()),atualizado_em:new Date().toISOString()};if(!p.nome)return u("Nome é obrigatório","err");if(!p.projeto_id)return u("Selecione um projeto","err");if(l==="semanal"&&!p.dias_semana.length)return u("Marque pelo menos 1 dia","err");if(!p.tarefas.length)return u("Adicione pelo menos 1 tarefa","err");const E=t.id?m.from("rotinas").update(p).eq("id",t.id):m.from("rotinas").insert({...p,ativa:!0}),{error:v}=await E;if(v)return u("Erro: "+v.message,"err");$(),u(t.id?"Rotina salva":"Rotina criada"),h()})}function lt(t,n){const s=n.toISOString().slice(0,10);return t.ultima_geracao===s?!1:t.cadencia==="diaria"?!0:t.cadencia==="semanal"?(t.dias_semana||[]).includes(n.getDay()):t.cadencia==="mensal"?n.getDate()===(t.dia_mes||1):!1}async function ct(){var s;const t=new Date,n=t.toISOString().slice(0,10);for(const i of x){if(!i.ativa||!i.projeto_id||!lt(i,t))continue;const o=b.find(e=>e.id===i.projeto_id),d=((s=T(o)[0])==null?void 0:s.k)||"todo",a=(i.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:i.projeto_id,rotina_id:i.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${i.nome}"]`,prioridade:e.prioridade||"media",status:d,prazo:n}));a.length&&(await m.from("tarefas").insert(a),await m.from("rotinas").update({ultima_geracao:n}).eq("id",i.id))}}async function pt(t){var a;if(!t.projeto_id){u("Rotina sem projeto","err");return}const n=b.find(e=>e.id===t.projeto_id),s=((a=T(n)[0])==null?void 0:a.k)||"todo",i=new Date().toISOString().slice(0,10),{count:o}=await m.from("tarefas").select("id",{count:"exact",head:!0}).eq("rotina_id",t.id).eq("prazo",i);if((o||0)>0&&!confirm(`Essa rotina já rodou hoje (${o} tarefa${o===1?"":"s"} já gerada${o===1?"":"s"}). Rodar de novo vai duplicar. Continuar mesmo assim?`)){u("Cancelado.","er");return}const d=(t.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:t.projeto_id,rotina_id:t.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${t.nome}" — manual]`,prioridade:e.prioridade||"media",status:s,prazo:i}));if(!d.length){u("Rotina sem tarefas","err");return}await m.from("tarefas").insert(d),await m.from("rotinas").update({ultima_geracao:i}).eq("id",t.id)}function Z(t){const n=new Set(["proposta","ativo","em_pausa","fechado"]);return k.filter(s=>n.has(s.status)||s.id===t)}function f(t){return String(t??"").replace(/[&<>"']/g,n=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[n])}function w(t){return f(t)}export{h as render};
