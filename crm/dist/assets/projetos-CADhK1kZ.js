import{s as L,d as g,o as q,f as x,t as f,h as H}from"./index--G5ghwX8.js";const O=[{k:"todo",l:"A fazer",cor:"#A0A0A0"},{k:"doing",l:"Fazendo",cor:"#4A9EFF"},{k:"review",l:"Revisão",cor:"#F5A623"},{k:"done",l:"Feito",cor:"#34D399"}],J=[{k:"baixa",l:"Baixa",cor:"#A0A0A0"},{k:"media",l:"Média",cor:"#4A9EFF"},{k:"alta",l:"Alta",cor:"#F5A623"},{k:"urgente",l:"Urgente",cor:"#FF5C5C"}],D=Object.fromEntries(J.map(t=>[t.k,t])),M=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4"],B=["#A0A0A0","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4","#C5F82A"],V=[{k:1,l:"Seg"},{k:2,l:"Ter"},{k:3,l:"Qua"},{k:4,l:"Qui"},{k:5,l:"Sex"},{k:6,l:"Sáb"},{k:0,l:"Dom"}];let b=[],S=[],E=[],C=[],_=[],$=null,I="kanban";async function k(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>',await Q(),await mt(),await Q(),$&&!b.find(i=>i.id===$)&&($=null),!$&&b.length&&($=b[0].id),W(),X()}async function Q(){const[t,i,n,o,s]=await Promise.all([L("projetos",{order:{column:"criado_em",ascending:!1}}),L("clientes",{columns:"id,nome,empresa,status,whatsapp",order:{column:"nome",ascending:!0}}),L("tarefas",{order:{column:"ordem",ascending:!0}}),L("tarefa_subtasks",{order:{column:"ordem",ascending:!0}}),L("rotinas",{order:{column:"criado_em",ascending:!1}})]);b=t.data||[],S=i.data||[],E=n.data||[],C=o.data||[],_=s.data||[]}function W(){const t=(s,r)=>`<button class="pj-tab${I===s?" on":""}" data-tab="${s}">${r}</button>`,i=I==="rotinas"?'<button class="btn bp" id="btn-add-rotina">+ Nova rotina</button>':'<button class="btn bp" id="btn-add-proj">+ Novo projeto</button>';document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${t("kanban","Kanban")}${t("lista","Lista")}${t("hoje","Hoje")}${t("resumao","Resumão")}${t("rotinas","Rotinas")}</div>
    ${i}
  `,document.querySelectorAll(".pj-tab").forEach(s=>s.addEventListener("click",()=>{I=s.dataset.tab,W(),X()}));const n=document.getElementById("btn-add-proj"),o=document.getElementById("btn-add-rotina");n&&n.addEventListener("click",()=>K()),o&&o.addEventListener("click",()=>T())}function X(){return I==="hoje"?it():I==="rotinas"?ot():I==="resumao"?R():Y()}async function R(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando resumão…</div>';let i;try{const{data:s,error:r}=await g.functions.invoke("digest-cliente",{body:{}});if(r)throw new Error(r.message||String(r));i=s}catch(s){t.innerHTML=`<div class="empty">Erro ao carregar: ${v(s.message)}</div>`;return}const n=(i==null?void 0:i.clientes)||[];if(!n.length){t.innerHTML=`
      <div class="tw" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra avisar hoje 🎯</div>
        <div style="font-size:12px;color:var(--text-3)">Conclua tarefas com cliente vinculado e elas aparecem aqui pra revisão.</div>
      </div>`;return}const o=s=>{const r=s.tarefas.map(a=>`
      <tr data-tid="${a.id}">
        <td style="width:30px">
          <input type="checkbox" class="rs-tar-cb" data-tid="${a.id}" checked>
        </td>
        <td style="color:var(--text-3);font-size:12px;width:42%">${v(a.titulo)}</td>
        <td>
          <input type="text"
            class="fi rs-apelido"
            data-tid="${a.id}"
            value="${w(a.apelido||a.titulo)}"
            placeholder="Como mostrar pro cliente"
            style="width:100%">
        </td>
      </tr>`).join("");return`
      <div class="tw" data-cid="${s.cliente_id}" style="margin-bottom:18px">
        <div class="th" style="align-items:flex-start">
          <div>
            <h3 style="font-size:14px">${v(s.nome)}</h3>
            <div style="font-size:11px;color:var(--text-3);margin-top:3px">${s.tarefas.length} tarefa${s.tarefas.length===1?"":"s"} pendente${s.tarefas.length===1?"":"s"} · ${v(s.whatsapp||"")}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn bg bsm rs-skip" data-cid="${s.cliente_id}">Pular hoje</button>
            <button class="btn bp bsm rs-send" data-cid="${s.cliente_id}">Revisar e enviar →</button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Tarefa interna</th>
              <th>O que o cliente vai ver</th>
            </tr>
          </thead>
          <tbody>${r}</tbody>
        </table>
      </div>`};t.innerHTML=`
    <div style="font-size:13px;color:var(--text-3);margin-bottom:16px;line-height:1.5">
      ${n.length} cliente${n.length===1?"":"s"} esperando aviso.
      Revise os apelidos, desmarque o que não quer mandar, e clique <strong style="color:var(--text-2)">Revisar e enviar</strong> — vai abrir uma confirmação com o texto final.
    </div>
    ${n.map(o).join("")}
  `,t.querySelectorAll(".rs-send").forEach(s=>{s.addEventListener("click",async()=>{const r=s.dataset.cid,a=n.find(m=>m.cliente_id===r);if(!a)return;const e=t.querySelector(`.tw[data-cid="${r}"]`),c=[...e.querySelectorAll(".rs-tar-cb")].filter(m=>m.checked).map(m=>m.dataset.tid);if(!c.length){f("Nenhuma tarefa marcada.","err");return}const d={};c.forEach(m=>{const y=e.querySelector(`.rs-apelido[data-tid="${m}"]`);y&&(d[m]=y.value.trim())});const l=(a.nome||"").split(" ")[0]||"",p=l?`Oi, ${l}! Fechando o dia aqui.`:"Oi! Fechando o dia aqui.",j=c.map(m=>{var y;return`✓ ${d[m]||((y=a.tarefas.find(h=>h.id===m))==null?void 0:y.titulo)||""}`}).join(`
`),u=`${p}

Hoje a gente avançou:
${j}

Qualquer dúvida é só chamar.`;q(`Enviar pra ${a.nome}?`,`<div style="font-size:12px;color:var(--text-3);margin-bottom:8px">Texto final que vai pelo WhatsApp:</div>
         <pre style="background:var(--bg-input);border:1px solid var(--line);border-radius:var(--rs);padding:14px;font-family:inherit;font-size:13px;color:var(--text);white-space:pre-wrap;line-height:1.5;margin-bottom:10px">${v(u)}</pre>
         <div style="font-size:11px;color:var(--text-3)">Pro: <strong style="color:var(--text-2)">${v(a.whatsapp||"—")}</strong></div>`,`<button class="btn bg" id="rs-cancel">Cancelar</button>
         <button class="btn bp" id="rs-confirm">Confirmar envio</button>`),document.getElementById("rs-cancel").addEventListener("click",x),document.getElementById("rs-confirm").addEventListener("click",async()=>{const m=document.getElementById("rs-confirm");m.disabled=!0,m.textContent="Enviando…";try{const y=a.tarefas.filter(A=>!c.includes(A.id)).map(A=>A.id);for(const A of y)await g.from("tarefas").update({notificar_cliente:!1}).eq("id",A);const{data:h,error:z}=await g.functions.invoke("digest-cliente",{body:{cliente_id:r,apelidos:d}});if(z||!(h!=null&&h.ok))throw new Error((h==null?void 0:h.erro)||(z==null?void 0:z.message)||"falhou");f(`Enviado pra ${a.nome} ✓`),x(),R()}catch(y){m.disabled=!1,m.textContent="Confirmar envio",f("Erro: "+y.message,"err")}})})}),t.querySelectorAll(".rs-skip").forEach(s=>{s.addEventListener("click",async()=>{const r=s.dataset.cid,a=n.find(d=>d.cliente_id===r);if(!a||!confirm(`Pular ${a.nome} hoje? As tarefas somem do resumão e não viram aviso.`))return;const e=a.tarefas.map(d=>d.id),c=new Date().toISOString();await g.from("tarefas").update({notificado_cliente_em:c}).in("id",e),f(`${a.nome} pulado`),R()})})}function it(){const t=document.getElementById("content"),i=new Date().toISOString().slice(0,10),n=E.filter(r=>r.status!=="done"&&r.prazo&&r.prazo<=i);if(!n.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra hoje</div>
      <div style="font-size:12px">Sem tarefas vencidas ou pra hoje. Tá em dia.</div>
    </div>`;return}const o={};for(const r of n)(o[r.projeto_id]=o[r.projeto_id]||[]).push(r);const s=Object.entries(o).map(([r,a])=>{const e=b.find(l=>l.id===r);if(!e)return"";const c=S.find(l=>l.id===e.cliente_id),d=a.sort((l,p)=>(l.prazo||"").localeCompare(p.prazo||"")).map(l=>`<div class="pj-hoje-row" data-tid="${l.id}">
        <input type="checkbox" class="pj-hoje-cb" data-tid="${l.id}">
        <div class="pj-hoje-title">${v(l.titulo)}</div>
        ${Z(l.prioridade)}
        ${G(l.prazo)}
      </div>`).join("");return`<div class="pj-hoje-block">
      <div class="pj-hoje-head">
        <span class="pj-side-dot" style="background:${e.cor||"#C5F82A"}"></span>
        <span class="pj-hoje-proj">${v(e.nome)}</span>
        <span class="pj-hoje-cli">${c?v(c.empresa||c.nome):"Interno"}</span>
        <span class="pj-col-count">${a.length}</span>
      </div>
      <div class="pj-hoje-rows">${d}</div>
    </div>`}).join("");t.innerHTML=`<div class="pj-hoje">${s}</div>`,t.addEventListener("click",async r=>{const a=r.target.closest(".pj-hoje-cb");if(a){r.stopPropagation();const c=E.find(d=>d.id===a.dataset.tid);if(!c)return;await tt(c,()=>k());return}const e=r.target.closest(".pj-hoje-row");if(e){const c=E.find(d=>d.id===e.dataset.tid);c&&P(c)}})}function ot(){const t=document.getElementById("content");if(!_.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma rotina ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Rotinas geram tarefas automaticamente em dias específicos.<br>Ex: toda segunda criar "Mandar vídeo motivacional pra Adriane".</div>
      <button class="btn bp" id="btn-first-rot">+ Criar primeira rotina</button>
    </div>`,document.getElementById("btn-first-rot").addEventListener("click",()=>T());return}const i=new Map,n=[];_.forEach(e=>{if(!e.projeto_id){n.push(e);return}i.has(e.projeto_id)||i.set(e.projeto_id,[]),i.get(e.projeto_id).push(e)});const o=[...b].filter(e=>i.has(e.id)).sort((e,c)=>(e.nome||"").localeCompare(c.nome||"")),s=e=>{const c=S.find(l=>l.id===e.cliente_id),d=Array.isArray(e.tarefas)?e.tarefas:[];return`<div class="pj-rot-item ${e.ativa?"":"paused"}" data-rid="${e.id}">
      <div class="pj-rot-item-main">
        <div class="pj-rot-item-top">
          <div class="pj-rot-item-name">${v(e.nome)}</div>
          <label class="pj-rot-toggle">
            <input type="checkbox" class="pj-rot-active" data-rid="${e.id}" ${e.ativa?"checked":""}>
            <span>${e.ativa?"Ativa":"Pausada"}</span>
          </label>
        </div>
        <div class="pj-rot-item-meta">
          ${c?`<span class="pj-rot-chip">${v(c.empresa||c.nome)}</span>`:""}
          <span class="pj-rot-chip">${st(e)}</span>
          <span class="pj-rot-chip">${d.length} tarefa${d.length===1?"":"s"}</span>
          ${e.ultima_geracao?`<span class="pj-rot-chip pj-rot-chip-dim">Última: ${H(e.ultima_geracao)}</span>`:""}
        </div>
        ${d.length?`<div class="pj-rot-item-tarefas">${d.map(l=>`<span class="pj-rot-tlbl">• ${v(l.titulo||"")}</span>`).join("")}</div>`:""}
      </div>
      <div class="pj-rot-item-acts">
        <button class="btn bg bsm rot-edit" data-rid="${e.id}">Editar</button>
        <button class="btn bg bsm rot-run"  data-rid="${e.id}">Rodar agora</button>
        <button class="btn bd bsm rot-del"  data-rid="${e.id}">Excluir</button>
      </div>
    </div>`},r=o.map(e=>{const c=i.get(e.id)||[],d=c.filter(p=>p.ativa).length,l=e.cor||"#C5F82A";return`<div class="pj-rot-group" style="--proj-color:${l}">
      <div class="pj-rot-group-h">
        <div class="pj-rot-group-h-l">
          <span class="pj-rot-group-dot" style="background:${l}"></span>
          <span class="pj-rot-group-name">${v(e.nome)}</span>
        </div>
        <div class="pj-rot-group-h-r">
          <span class="pj-rot-group-count">${d}/${c.length} ativa${c.length===1?"":"s"}</span>
          <button class="btn bp bsm rot-add-proj" data-pid="${e.id}">+ Rotina</button>
        </div>
      </div>
      <div class="pj-rot-group-list">
        ${c.map(s).join("")}
      </div>
    </div>`}).join(""),a=n.length?`<div class="pj-rot-group pj-rot-group-orphan">
    <div class="pj-rot-group-h">
      <div class="pj-rot-group-h-l">
        <span class="pj-rot-group-dot" style="background:var(--text-3)"></span>
        <span class="pj-rot-group-name">Sem projeto vinculado</span>
      </div>
      <span class="pj-rot-group-count">${n.length}</span>
    </div>
    <div class="pj-rot-group-list">
      ${n.map(s).join("")}
    </div>
  </div>`:"";t.innerHTML=`<div class="pj-rot-groups">${r}${a}</div>`,t.addEventListener("click",async e=>{const c=e.target.closest(".rot-add-proj");if(c){T({projeto_id:c.dataset.pid});return}const d=e.target.closest(".rot-edit"),l=e.target.closest(".rot-del"),p=e.target.closest(".rot-run"),j=e.target.closest(".pj-rot-active");if(d){const u=_.find(m=>m.id===d.dataset.rid);u&&T(u)}else if(l){const u=_.find(m=>m.id===l.dataset.rid);u&&confirm(`Excluir rotina "${u.nome}"? (Tarefas já geradas continuam)`)&&(await g.from("rotinas").delete().eq("id",u.id),f("Rotina excluída"),k())}else if(p){const u=_.find(m=>m.id===p.dataset.rid);u&&(await ft(u),f("Tarefas geradas"),k())}else if(j){const u=_.find(m=>m.id===j.dataset.rid);u&&(u.ativa=j.checked,await g.from("rotinas").update({ativa:u.ativa,atualizado_em:new Date().toISOString()}).eq("id",u.id))}})}function st(t){if(t.cadencia==="diaria")return"Todos os dias";if(t.cadencia==="semanal"){const i=(t.dias_semana||[]).map(n=>{var o;return(o=V.find(s=>s.k===n))==null?void 0:o.l}).filter(Boolean).join(", ");return i?`Semanal: ${i}`:"Semanal"}return t.cadencia==="mensal"?`Mensal: dia ${t.dia_mes||1}`:t.cadencia}function Y(){const t=document.getElementById("content");if(!b.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`,document.getElementById("btn-add-first").addEventListener("click",()=>K());return}const i=b.map(n=>{const o=S.find(a=>a.id===n.cliente_id),s=E.filter(a=>a.projeto_id===n.id).length,r=E.filter(a=>a.projeto_id===n.id&&a.status==="done").length;return`<div class="pj-side ${n.id===$?"on":""}" data-pid="${n.id}">
      <div class="pj-side-dot" style="background:${n.cor||"#C5F82A"}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${v(n.nome)}</div>
        <div class="pj-side-meta">${o?v(o.empresa||o.nome):"Interno"} · ${r}/${s}</div>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${b.length})</span></div>
      <div class="pj-sidebar-list">${i}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`,t.querySelector(".pj-sidebar-list").addEventListener("click",n=>{const o=n.target.closest(".pj-side");o&&($=o.dataset.pid,Y())}),N()}function N(){const t=b.find(a=>a.id===$);if(!t)return;const i=S.find(a=>a.id===t.cliente_id),n=E.filter(a=>a.projeto_id===t.id),o=F(t),s=`<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${t.cor||"#C5F82A"}"></div>
      <div>
        <div class="pj-head-name">${v(t.nome)}</div>
        <div class="pj-head-meta">
          ${i?`<span>${v(i.empresa||i.nome)}</span>`:"<span>Interno</span>"}
          ${t.prazo?` · <span>Prazo ${H(t.prazo)}</span>`:""}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`,r=I==="lista"?rt(n,o):nt(n,o);document.getElementById("pj-main").innerHTML=s+r,document.getElementById("pj-edit").addEventListener("click",()=>K(t)),document.getElementById("pj-del").addEventListener("click",()=>pt(t)),document.getElementById("pj-add-tar").addEventListener("click",()=>{var a;return P({projeto_id:t.id,status:((a=o[0])==null?void 0:a.k)||"todo"})}),ct()}function F(t){const i=t==null?void 0:t.etapas;return Array.isArray(i)&&i.length?i:O}function nt(t,i){return`<div class="pj-kanban">${i.map(o=>{const s=t.filter(a=>a.status===o.k),r=s.length?s.map(a=>dt(a)).join(""):'<div class="pj-empty">—</div>';return`<div class="pj-col" data-status="${o.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${o.cor}">
          <span class="pj-col-bullet" style="background:${o.cor}"></span>${v(o.l)}
        </span>
        <span class="pj-col-count">${s.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${o.k}">${r}</div>
    </div>`}).join("")}</div>`}function rt(t,i){if(!t.length)return'<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>';const n=i.map(r=>r.k);return`<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${[...t].sort((r,a)=>n.indexOf(r.status)-n.indexOf(a.status)||(r.prazo||"").localeCompare(a.prazo||"")).map(r=>{const a=C.filter(c=>c.tarefa_id===r.id),e=a.filter(c=>c.feito).length;return`<tr class="pj-row" data-tid="${r.id}">
      <td>${lt(r.status,i)}</td>
      <td class="pj-row-title">${v(r.titulo)}${a.length?`<span class="pj-sub-chip">${e}/${a.length}</span>`:""}${r.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</td>
      <td>${Z(r.prioridade)}</td>
      <td class="tm">${G(r.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${r.id}">×</button></td>
    </tr>`}).join("")}</tbody>
    </table>
  </div>`}function dt(t){const i=C.filter(s=>s.tarefa_id===t.id),n=i.filter(s=>s.feito).length,o=D[t.prioridade]||D.media;return`<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${o.cor}"></div>
      <div class="pj-card-title">${v(t.titulo)}${t.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</div>
    </div>
    ${t.descricao?`<div class="pj-card-desc">${v(t.descricao).slice(0,80)}${t.descricao.length>80?"…":""}</div>`:""}
    <div class="pj-card-foot">
      ${G(t.prazo)}
      ${i.length?`<span class="pj-sub-chip">${n}/${i.length}</span>`:""}
    </div>
  </div>`}function lt(t,i){const n=(i||O).find(o=>o.k===t)||O[0];return`<span class="pj-pill" style="background:${n.cor}22;color:${n.cor}">${v(n.l)}</span>`}function Z(t){const i=D[t]||D.media;return`<span class="pj-pill" style="background:${i.cor}22;color:${i.cor}">${i.l}</span>`}function G(t){if(!t)return"";const i=new Date(t+"T00:00:00"),n=new Date;n.setHours(0,0,0,0);const o=Math.round((i-n)/864e5);let s="pj-prazo";return o<0?s+=" late":o<=2&&(s+=" soon"),`<span class="${s}">${H(t)}</span>`}function ct(){const t=document.getElementById("pj-main");if(!t)return;t.addEventListener("click",n=>{const o=n.target.closest(".pj-card"),s=n.target.closest(".pj-row"),r=n.target.closest(".del-tar");if(r){n.stopPropagation();const a=E.find(e=>e.id===r.dataset.tid);a&&confirm(`Excluir "${a.titulo}"?`)&&et(a.id);return}if(o){const a=E.find(e=>e.id===o.dataset.tid);a&&P(a)}else if(s){const a=E.find(e=>e.id===s.dataset.tid);a&&P(a)}});let i=null;t.querySelectorAll(".pj-card").forEach(n=>{n.addEventListener("dragstart",o=>{i=n.dataset.tid,n.classList.add("drag"),o.dataTransfer.effectAllowed="move"}),n.addEventListener("dragend",()=>{n.classList.remove("drag"),t.querySelectorAll(".pj-col-cards.over").forEach(o=>o.classList.remove("over"))})}),t.querySelectorAll(".pj-col-cards").forEach(n=>{n.addEventListener("dragover",o=>{o.preventDefault(),n.classList.add("over")}),n.addEventListener("dragleave",()=>n.classList.remove("over")),n.addEventListener("drop",async o=>{if(o.preventDefault(),n.classList.remove("over"),!i)return;const s=n.dataset.drop,r=E.find(e=>e.id===i);if(!r||r.status===s)return;if(s==="done"){await tt(r,()=>N());return}r.status=s;const{error:a}=await g.from("tarefas").update({status:s,atualizado_em:new Date().toISOString()}).eq("id",i);if(a){f("Erro: "+a.message,"err");return}N()})})}function K(t={}){const i='<option value="">— sem cliente (interno) —</option>'+at(t.cliente_id).map(a=>`<option value="${a.id}"${t.cliente_id===a.id?" selected":""}>${v(a.empresa||a.nome)}</option>`).join(""),n=M.map(a=>`<span class="pj-cor-opt${(t.cor||M[0])===a?" on":""}" data-cor="${a}" style="background:${a}"></span>`).join("");let o=Array.isArray(t.etapas)&&t.etapas.length?JSON.parse(JSON.stringify(t.etapas)):JSON.parse(JSON.stringify(O));q(t.id?"Editar projeto":"Novo projeto",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${w(t.nome||"")}" placeholder="Ex: Conteúdo semanal Adriane"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${v(t.descricao||"")}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${i}</select></div>
      <div class="fg"><label class="fl">Prazo</label><input class="fi" type="date" id="pj-prazo" value="${t.prazo||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Cor</label>
      <div class="pj-cor-row" id="pj-cor-row">${n}</div></div>
    <div class="fg" style="margin-top:14px">
      <label class="fl">Etapas do fluxo</label>
      <div id="pj-etapas-list" class="pj-etapas-list"></div>
      <button class="btn bg bsm" id="pj-etapa-add" type="button" style="margin-top:6px;align-self:flex-start">+ Etapa</button>
    </div>
  `,`
    <button class="btn bg" id="pj-cancel">Cancelar</button>
    <button class="btn bp" id="pj-save">${t.id?"Salvar":"Criar"}</button>
  `);let s=t.cor||M[0];document.getElementById("pj-cor-row").addEventListener("click",a=>{const e=a.target.closest(".pj-cor-opt");e&&(s=e.dataset.cor,document.querySelectorAll(".pj-cor-opt").forEach(c=>c.classList.toggle("on",c.dataset.cor===s)))});const r=()=>{document.getElementById("pj-etapas-list").innerHTML=o.map((a,e)=>`
      <div class="pj-etapa-row" data-i="${e}">
        <span class="pj-etapa-color" data-i="${e}" style="background:${a.cor}"></span>
        <input type="text" class="fi pj-etapa-l" data-i="${e}" value="${w(a.l)}" style="flex:1;padding:6px 9px;font-size:12.5px">
        <button class="pj-etapa-up"   type="button" data-i="${e}" ${e===0?"disabled":""}>↑</button>
        <button class="pj-etapa-down" type="button" data-i="${e}" ${e===o.length-1?"disabled":""}>↓</button>
        <button class="pj-sub-del"    type="button" data-i="${e}" ${o.length<=1?"disabled":""} title="Remover">×</button>
      </div>
    `).join("")};r(),document.getElementById("pj-etapa-add").addEventListener("click",()=>{const a="etapa_"+Math.random().toString(36).slice(2,7);o.push({k:a,l:"Nova etapa",cor:B[o.length%B.length]}),r()}),document.getElementById("pj-etapas-list").addEventListener("click",a=>{const e=a.target.closest(".pj-etapa-up"),c=a.target.closest(".pj-etapa-down"),d=a.target.closest(".pj-sub-del"),l=a.target.closest(".pj-etapa-color");if(e){const p=+e.dataset.i;[o[p-1],o[p]]=[o[p],o[p-1]],r()}if(c){const p=+c.dataset.i;[o[p+1],o[p]]=[o[p],o[p+1]],r()}if(d&&o.length>1){const p=+d.dataset.i;o.splice(p,1),r()}if(l){const p=+l.dataset.i,j=o[p].cor,u=B.indexOf(j);o[p].cor=B[(u+1)%B.length],r()}}),document.getElementById("pj-etapas-list").addEventListener("input",a=>{const e=a.target.closest(".pj-etapa-l");e&&(o[+e.dataset.i].l=e.value)}),document.getElementById("pj-cancel").addEventListener("click",x),document.getElementById("pj-save").addEventListener("click",async()=>{const a=o.filter(p=>(p.l||"").trim()).map(p=>({k:p.k||"etapa_"+Math.random().toString(36).slice(2,7),l:p.l.trim(),cor:p.cor||"#A0A0A0"}));if(!a.length)return f("Adicione pelo menos 1 etapa","err");const e={nome:document.getElementById("pj-nome").value.trim(),descricao:document.getElementById("pj-desc").value.trim()||null,cliente_id:document.getElementById("pj-cli").value||null,prazo:document.getElementById("pj-prazo").value||null,cor:s,etapas:a,atualizado_em:new Date().toISOString()};if(!e.nome)return f("Nome é obrigatório","err");const c=t.id?g.from("projetos").update(e).eq("id",t.id):g.from("projetos").insert(e).select().single(),{data:d,error:l}=await c;if(l)return f("Erro: "+l.message,"err");!t.id&&d&&($=d.id),x(),f(t.id?"Projeto salvo":"Projeto criado"),k()})}async function pt(t){if(!confirm(`Excluir "${t.nome}" e TODAS as tarefas e rotinas dele?`))return;const{error:i}=await g.from("projetos").delete().eq("id",t.id);if(i)return f("Erro: "+i.message,"err");$=null,f("Projeto excluído"),k()}async function tt(t,i){if(t.status==="done"){i&&i();return}t.status="done";const{error:n}=await g.from("tarefas").update({status:"done",atualizado_em:new Date().toISOString()}).eq("id",t.id);if(n){f("Erro: "+n.message,"err");return}const o=b.find(l=>l.id===t.projeto_id),s=o?S.find(l=>l.id===o.cliente_id):null;if(!s||!s.whatsapp||t.notificar_cliente===!1){f("Marcada como feita"),i&&i();return}const r=t.apelido_cliente||t.titulo||"",a=(s.nome||"").split(" ")[0]||"";q("Tarefa concluída — avisar o cliente?",`
    <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:14px">
      Cliente: <strong style="color:var(--text)">${v(s.empresa||s.nome)}</strong>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Como mostrar pro cliente</label>
      <input class="fi" id="cn-apelido" value="${w(r)}" placeholder="Ex: Criativo de feed dessa semana">
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
  `);const e=l=>{x(),i&&i()},c=()=>document.getElementById("cn-apelido").value.trim()||t.titulo,d=()=>document.getElementById("cn-incluir").checked;document.getElementById("cn-skip").addEventListener("click",async()=>{await g.from("tarefas").update({apelido_cliente:c(),notificar_cliente:!1}).eq("id",t.id),f("Concluída — cliente não vai ser avisado"),e()}),document.getElementById("cn-save").addEventListener("click",async()=>{const l=c(),p=d();await g.from("tarefas").update({apelido_cliente:l,notificar_cliente:p}).eq("id",t.id),f(p?"No resumão das 18h":"Concluída — sem aviso"),e()}),document.getElementById("cn-now").addEventListener("click",async()=>{const l=c(),p=`Oi${a?`, ${a}`:""}! Terminei aqui: ${l}.`;await g.from("tarefas").update({apelido_cliente:l,notificar_cliente:!0,notificado_cliente_em:new Date().toISOString()}).eq("id",t.id);const j=String(s.whatsapp).replace(/\D/g,"");window.open(`https://wa.me/${j}?text=${encodeURIComponent(p)}`,"_blank"),f("Abrindo WhatsApp…"),e()})}function P(t={}){const i=!t.id,n=b.find(e=>e.id===(t.projeto_id||$)),o=F(n),s=o.map(e=>`<option value="${e.k}"${(t.status||o[0].k)===e.k?" selected":""}>${v(e.l)}</option>`).join(""),r=J.map(e=>`<option value="${e.k}"${(t.prioridade||"media")===e.k?" selected":""}>${e.l}</option>`).join(""),a=i?[]:C.filter(e=>e.tarefa_id===t.id);q(i?"Nova tarefa":"Editar tarefa",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${w(t.titulo||"")}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${v(t.descricao||"")}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Etapa</label><select class="fsl" id="tr-status">${s}</select></div>
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="tr-prio">${r}</select></div>
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
      <div id="tr-subs" class="pj-subs">${a.map(e=>U(e.id,e.texto,e.feito)).join("")}</div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `,`
    ${i?"":'<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${i?"Criar":"Salvar"}</button>
  `),document.getElementById("tr-sub-add").addEventListener("click",()=>{const e=document.getElementById("tr-sub-new"),c=e.value.trim();if(!c)return;const d="new-"+Math.random().toString(36).slice(2);document.getElementById("tr-subs").insertAdjacentHTML("beforeend",U(d,c,!1)),e.value="",e.focus()}),document.getElementById("tr-sub-new").addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),document.getElementById("tr-sub-add").click())}),document.getElementById("tr-subs").addEventListener("click",e=>{const c=e.target.closest(".pj-sub-del");c&&c.closest(".pj-sub-row").remove()}),document.getElementById("tr-cancel").addEventListener("click",x),i||document.getElementById("tr-del").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await et(t.id),x())}),document.getElementById("tr-save").addEventListener("click",async()=>{const e={projeto_id:t.projeto_id||$,titulo:document.getElementById("tr-titulo").value.trim(),descricao:document.getElementById("tr-desc").value.trim()||null,status:document.getElementById("tr-status").value,prioridade:document.getElementById("tr-prio").value,prazo:document.getElementById("tr-prazo").value||null,apelido_cliente:document.getElementById("tr-apelido").value.trim()||null,notificar_cliente:document.getElementById("tr-notif").checked,atualizado_em:new Date().toISOString()};if(!e.titulo)return f("Título é obrigatório","err");let c=t.id;if(i){const{data:u,error:m}=await g.from("tarefas").insert(e).select().single();if(m)return f("Erro: "+m.message,"err");c=u.id}else{const{error:u}=await g.from("tarefas").update(e).eq("id",c);if(u)return f("Erro: "+u.message,"err")}const d=[...document.querySelectorAll(".pj-sub-row")],l=i?[]:C.filter(u=>u.tarefa_id===c),p=new Set;let j=0;for(const u of d){const m=u.dataset.sid,y=u.querySelector(".pj-sub-text").value.trim(),h=u.querySelector(".pj-sub-cb").checked;y&&(m.startsWith("new-")?await g.from("tarefa_subtasks").insert({tarefa_id:c,texto:y,feito:h,ordem:j++}):(p.add(m),await g.from("tarefa_subtasks").update({texto:y,feito:h,ordem:j++}).eq("id",m)))}for(const u of l)p.has(u.id)||await g.from("tarefa_subtasks").delete().eq("id",u.id);x(),f(i?"Tarefa criada":"Tarefa salva"),k()})}function U(t,i,n){return`<div class="pj-sub-row" data-sid="${t}">
    <input type="checkbox" class="pj-sub-cb" ${n?"checked":""}>
    <input type="text" class="pj-sub-text fi" value="${w(i)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`}async function et(t){const{error:i}=await g.from("tarefas").delete().eq("id",t);if(i)return f("Erro: "+i.message,"err");f("Tarefa excluída"),k()}function T(t={}){const i=!t.id,n='<option value="">— sem cliente —</option>'+at(t.cliente_id).map(d=>`<option value="${d.id}"${t.cliente_id===d.id?" selected":""}>${v(d.empresa||d.nome)}</option>`).join(""),o='<option value="">— escolha um projeto —</option>'+b.map(d=>`<option value="${d.id}"${t.projeto_id===d.id?" selected":""}>${v(d.nome)}</option>`).join(""),s=t.cadencia||"semanal",r=t.dias_semana||[1],a=Array.isArray(t.tarefas)?JSON.parse(JSON.stringify(t.tarefas)):[],e=V.map(d=>`<label class="pj-dia-chip ${r.includes(d.k)?"on":""}" data-d="${d.k}"><input type="checkbox" ${r.includes(d.k)?"checked":""} style="display:none">${d.l}</label>`).join("");q(i?"Nova rotina":"Editar rotina",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="rt-nome" value="${w(t.nome||"")}" placeholder="Ex: Rotina semanal Adriane"></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rt-cli">${n}</select></div>
      <div class="fg"><label class="fl">Projeto *</label><select class="fsl" id="rt-proj">${o}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Cadência</label>
      <div class="pj-cad-row">
        <label class="pj-cad-opt ${s==="diaria"?"on":""}"><input type="radio" name="rt-cad" value="diaria" ${s==="diaria"?"checked":""}>Todo dia</label>
        <label class="pj-cad-opt ${s==="semanal"?"on":""}"><input type="radio" name="rt-cad" value="semanal" ${s==="semanal"?"checked":""}>Semanal</label>
        <label class="pj-cad-opt ${s==="mensal"?"on":""}"><input type="radio" name="rt-cad" value="mensal" ${s==="mensal"?"checked":""}>Mensal</label>
      </div>
    </div>
    <div class="fg" id="rt-dias-wrap" style="margin-bottom:11px;${s==="semanal"?"":"display:none"}">
      <label class="fl">Dias da semana</label>
      <div class="pj-dias-row" id="rt-dias">${e}</div>
    </div>
    <div class="fg" id="rt-mes-wrap" style="margin-bottom:11px;${s==="mensal"?"":"display:none"}">
      <label class="fl">Dia do mês (1–28)</label>
      <input class="fi" type="number" min="1" max="28" id="rt-dia-mes" value="${t.dia_mes||1}" style="width:120px">
    </div>
    <div class="fg">
      <label class="fl">Tarefas que serão geradas</label>
      <div id="rt-tars" class="pj-rot-tars-edit"></div>
      <button class="btn bg bsm" id="rt-tar-add" type="button" style="margin-top:6px;align-self:flex-start">+ Tarefa</button>
    </div>
  `,`
    ${i?"":'<button class="btn bd" id="rt-del">Excluir</button>'}
    <button class="btn bg" id="rt-cancel">Cancelar</button>
    <button class="btn bp" id="rt-save">${i?"Criar":"Salvar"}</button>
  `);const c=()=>{document.getElementById("rt-tars").innerHTML=a.map((d,l)=>`
      <div class="pj-rot-tar-row" data-i="${l}">
        <input type="text" class="fi rt-t-titulo" data-i="${l}" value="${w(d.titulo||"")}" placeholder="Título" style="flex:2;padding:6px 9px;font-size:12.5px">
        <select class="fsl rt-t-prio" data-i="${l}" style="flex:1;padding:6px 9px;font-size:12.5px">
          ${J.map(p=>`<option value="${p.k}"${(d.prioridade||"media")===p.k?" selected":""}>${p.l}</option>`).join("")}
        </select>
        <button class="pj-sub-del" type="button" data-i="${l}">×</button>
      </div>
    `).join("")};c(),document.getElementById("rt-tar-add").addEventListener("click",()=>{a.push({titulo:"",prioridade:"media"}),c()}),document.getElementById("rt-tars").addEventListener("click",d=>{const l=d.target.closest(".pj-sub-del");l&&(a.splice(+l.dataset.i,1),c())}),document.getElementById("rt-tars").addEventListener("input",d=>{const l=d.target.closest(".rt-t-titulo"),p=d.target.closest(".rt-t-prio");l&&(a[+l.dataset.i].titulo=l.value),p&&(a[+p.dataset.i].prioridade=p.value)}),document.querySelectorAll('input[name="rt-cad"]').forEach(d=>d.addEventListener("change",()=>{document.querySelectorAll(".pj-cad-opt").forEach(p=>p.classList.toggle("on",p.querySelector("input").checked));const l=document.querySelector('input[name="rt-cad"]:checked').value;document.getElementById("rt-dias-wrap").style.display=l==="semanal"?"":"none",document.getElementById("rt-mes-wrap").style.display=l==="mensal"?"":"none"})),document.getElementById("rt-dias").addEventListener("click",d=>{const l=d.target.closest(".pj-dia-chip");l&&(d.preventDefault(),l.classList.toggle("on"),l.querySelector("input").checked=l.classList.contains("on"))}),document.getElementById("rt-cancel").addEventListener("click",x),i||document.getElementById("rt-del").addEventListener("click",async()=>{confirm(`Excluir rotina "${t.nome}"?`)&&(await g.from("rotinas").delete().eq("id",t.id),x(),f("Rotina excluída"),k())}),document.getElementById("rt-save").addEventListener("click",async()=>{const d=document.querySelector('input[name="rt-cad"]:checked').value,l=[...document.querySelectorAll("#rt-dias .pj-dia-chip.on")].map(m=>+m.dataset.d),p={nome:document.getElementById("rt-nome").value.trim(),cliente_id:document.getElementById("rt-cli").value||null,projeto_id:document.getElementById("rt-proj").value||null,cadencia:d,dias_semana:d==="semanal"?l:[],dia_mes:d==="mensal"?+document.getElementById("rt-dia-mes").value||1:null,tarefas:a.filter(m=>(m.titulo||"").trim()),atualizado_em:new Date().toISOString()};if(!p.nome)return f("Nome é obrigatório","err");if(!p.projeto_id)return f("Selecione um projeto","err");if(d==="semanal"&&!p.dias_semana.length)return f("Marque pelo menos 1 dia","err");if(!p.tarefas.length)return f("Adicione pelo menos 1 tarefa","err");const j=t.id?g.from("rotinas").update(p).eq("id",t.id):g.from("rotinas").insert({...p,ativa:!0}),{error:u}=await j;if(u)return f("Erro: "+u.message,"err");x(),f(t.id?"Rotina salva":"Rotina criada"),k()})}function ut(t,i){const n=i.toISOString().slice(0,10);return t.ultima_geracao===n?!1:t.cadencia==="diaria"?!0:t.cadencia==="semanal"?(t.dias_semana||[]).includes(i.getDay()):t.cadencia==="mensal"?i.getDate()===(t.dia_mes||1):!1}async function mt(){var n;const t=new Date,i=t.toISOString().slice(0,10);for(const o of _){if(!o.ativa||!o.projeto_id||!ut(o,t))continue;const s=b.find(e=>e.id===o.projeto_id),r=((n=F(s)[0])==null?void 0:n.k)||"todo",a=(o.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:o.projeto_id,rotina_id:o.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${o.nome}"]`,prioridade:e.prioridade||"media",status:r,prazo:i}));a.length&&(await g.from("tarefas").insert(a),await g.from("rotinas").update({ultima_geracao:i}).eq("id",o.id))}}async function ft(t){var a;if(!t.projeto_id){f("Rotina sem projeto","err");return}const i=b.find(e=>e.id===t.projeto_id),n=((a=F(i)[0])==null?void 0:a.k)||"todo",o=new Date().toISOString().slice(0,10),{count:s}=await g.from("tarefas").select("id",{count:"exact",head:!0}).eq("rotina_id",t.id).eq("prazo",o);if((s||0)>0&&!confirm(`Essa rotina já rodou hoje (${s} tarefa${s===1?"":"s"} já gerada${s===1?"":"s"}). Rodar de novo vai duplicar. Continuar mesmo assim?`)){f("Cancelado.","er");return}const r=(t.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:t.projeto_id,rotina_id:t.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${t.nome}" — manual]`,prioridade:e.prioridade||"media",status:n,prazo:o}));if(!r.length){f("Rotina sem tarefas","err");return}await g.from("tarefas").insert(r),await g.from("rotinas").update({ultima_geracao:o}).eq("id",t.id)}function at(t){const i=new Set(["proposta","ativo","em_pausa","fechado"]);return S.filter(n=>i.has(n.status)||n.id===t)}function v(t){return String(t??"").replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i])}function w(t){return v(t)}export{k as render};
