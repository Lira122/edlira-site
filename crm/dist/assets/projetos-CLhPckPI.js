import{s as L,d as f,o as z,f as x,t as u,h as H}from"./index-XqOBBJO8.js";const T=[{k:"todo",l:"A fazer",cor:"#A0A0A0"},{k:"doing",l:"Fazendo",cor:"#4A9EFF"},{k:"review",l:"Revisão",cor:"#F5A623"},{k:"done",l:"Feito",cor:"#34D399"}],J=[{k:"baixa",l:"Baixa",cor:"#A0A0A0"},{k:"media",l:"Média",cor:"#4A9EFF"},{k:"alta",l:"Alta",cor:"#F5A623"},{k:"urgente",l:"Urgente",cor:"#FF5C5C"}],O=Object.fromEntries(J.map(t=>[t.k,t])),M=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4"],B=["#A0A0A0","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4","#C5F82A"],V=[{k:1,l:"Seg"},{k:2,l:"Ter"},{k:3,l:"Qua"},{k:4,l:"Qui"},{k:5,l:"Sex"},{k:6,l:"Sáb"},{k:0,l:"Dom"}];let g=[],I=[],h=[],q=[],_=[],y=null,S="kanban";async function k(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>',await Q(),await mt(),await Q(),y&&!g.find(s=>s.id===y)&&(y=null),!y&&g.length&&(y=g[0].id),W(),X()}async function Q(){const[t,s,i,n,o]=await Promise.all([L("projetos",{order:{column:"criado_em",ascending:!1}}),L("clientes",{columns:"id,nome,empresa,status,whatsapp",order:{column:"nome",ascending:!0}}),L("tarefas",{order:{column:"ordem",ascending:!0}}),L("tarefa_subtasks",{order:{column:"ordem",ascending:!0}}),L("rotinas",{order:{column:"criado_em",ascending:!1}})]);g=t.data||[],I=s.data||[],h=i.data||[],q=n.data||[],_=o.data||[]}function W(){const t=(o,r)=>`<button class="pj-tab${S===o?" on":""}" data-tab="${o}">${r}</button>`,s=S==="rotinas"?'<button class="btn bp" id="btn-add-rotina">+ Nova rotina</button>':'<button class="btn bp" id="btn-add-proj">+ Novo projeto</button>';document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${t("kanban","Kanban")}${t("lista","Lista")}${t("hoje","Hoje")}${t("resumao","Resumão")}${t("rotinas","Rotinas")}</div>
    ${s}
  `,document.querySelectorAll(".pj-tab").forEach(o=>o.addEventListener("click",()=>{S=o.dataset.tab,W(),X()}));const i=document.getElementById("btn-add-proj"),n=document.getElementById("btn-add-rotina");i&&i.addEventListener("click",()=>K()),n&&n.addEventListener("click",()=>N())}function X(){return S==="hoje"?it():S==="rotinas"?nt():S==="resumao"?R():Y()}async function R(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando resumão…</div>';let s;try{const{data:o,error:r}=await f.functions.invoke("digest-cliente",{body:{}});if(r)throw new Error(r.message||String(r));s=o}catch(o){t.innerHTML=`<div class="empty">Erro ao carregar: ${m(o.message)}</div>`;return}const i=(s==null?void 0:s.clientes)||[];if(!i.length){t.innerHTML=`
      <div class="tw" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra avisar hoje 🎯</div>
        <div style="font-size:12px;color:var(--text-3)">Conclua tarefas com cliente vinculado e elas aparecem aqui pra revisão.</div>
      </div>`;return}const n=o=>{const r=o.tarefas.map(e=>`
      <tr data-tid="${e.id}">
        <td style="width:30px">
          <input type="checkbox" class="rs-tar-cb" data-tid="${e.id}" checked>
        </td>
        <td style="color:var(--text-3);font-size:12px;width:42%">${m(e.titulo)}</td>
        <td>
          <input type="text"
            class="fi rs-apelido"
            data-tid="${e.id}"
            value="${w(e.apelido||e.titulo)}"
            placeholder="Como mostrar pro cliente"
            style="width:100%">
        </td>
      </tr>`).join("");return`
      <div class="tw" data-cid="${o.cliente_id}" style="margin-bottom:18px">
        <div class="th" style="align-items:flex-start">
          <div>
            <h3 style="font-size:14px">${m(o.nome)}</h3>
            <div style="font-size:11px;color:var(--text-3);margin-top:3px">${o.tarefas.length} tarefa${o.tarefas.length===1?"":"s"} pendente${o.tarefas.length===1?"":"s"} · ${m(o.whatsapp||"")}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn bg bsm rs-skip" data-cid="${o.cliente_id}">Pular hoje</button>
            <button class="btn bp bsm rs-send" data-cid="${o.cliente_id}">Revisar e enviar →</button>
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
      ${i.length} cliente${i.length===1?"":"s"} esperando aviso.
      Revise os apelidos, desmarque o que não quer mandar, e clique <strong style="color:var(--text-2)">Revisar e enviar</strong> — vai abrir uma confirmação com o texto final.
    </div>
    ${i.map(n).join("")}
  `,t.querySelectorAll(".rs-send").forEach(o=>{o.addEventListener("click",async()=>{const r=o.dataset.cid,e=i.find(v=>v.cliente_id===r);if(!e)return;const a=t.querySelector(`.tw[data-cid="${r}"]`),l=[...a.querySelectorAll(".rs-tar-cb")].filter(v=>v.checked).map(v=>v.dataset.tid);if(!l.length){u("Nenhuma tarefa marcada.","err");return}const d={};l.forEach(v=>{const j=a.querySelector(`.rs-apelido[data-tid="${v}"]`);j&&(d[v]=j.value.trim())});const c=(e.nome||"").split(" ")[0]||"",p=c?`Oi, ${c}! Fechando o dia aqui.`:"Oi! Fechando o dia aqui.",E=l.map(v=>{var j;return`✓ ${d[v]||((j=e.tarefas.find($=>$.id===v))==null?void 0:j.titulo)||""}`}).join(`
`),b=`${p}

Hoje a gente avançou:
${E}

Qualquer dúvida é só chamar.`;z(`Enviar pra ${e.nome}?`,`<div style="font-size:12px;color:var(--text-3);margin-bottom:8px">Texto final que vai pelo WhatsApp:</div>
         <pre style="background:var(--bg-input);border:1px solid var(--line);border-radius:var(--rs);padding:14px;font-family:inherit;font-size:13px;color:var(--text);white-space:pre-wrap;line-height:1.5;margin-bottom:10px">${m(b)}</pre>
         <div style="font-size:11px;color:var(--text-3)">Pro: <strong style="color:var(--text-2)">${m(e.whatsapp||"—")}</strong></div>`,`<button class="btn bg" id="rs-cancel">Cancelar</button>
         <button class="btn bp" id="rs-confirm">Confirmar envio</button>`),document.getElementById("rs-cancel").addEventListener("click",x),document.getElementById("rs-confirm").addEventListener("click",async()=>{const v=document.getElementById("rs-confirm");v.disabled=!0,v.textContent="Enviando…";try{const j=e.tarefas.filter(A=>!l.includes(A.id)).map(A=>A.id);for(const A of j)await f.from("tarefas").update({notificar_cliente:!1}).eq("id",A);const{data:$,error:C}=await f.functions.invoke("digest-cliente",{body:{cliente_id:r,apelidos:d}});if(C||!($!=null&&$.ok))throw new Error(($==null?void 0:$.erro)||(C==null?void 0:C.message)||"falhou");u(`Enviado pra ${e.nome} ✓`),x(),R()}catch(j){v.disabled=!1,v.textContent="Confirmar envio",u("Erro: "+j.message,"err")}})})}),t.querySelectorAll(".rs-skip").forEach(o=>{o.addEventListener("click",async()=>{const r=o.dataset.cid,e=i.find(d=>d.cliente_id===r);if(!e||!confirm(`Pular ${e.nome} hoje? As tarefas somem do resumão e não viram aviso.`))return;const a=e.tarefas.map(d=>d.id),l=new Date().toISOString();await f.from("tarefas").update({notificado_cliente_em:l}).in("id",a),u(`${e.nome} pulado`),R()})})}function it(){const t=document.getElementById("content"),s=new Date().toISOString().slice(0,10),i=h.filter(r=>r.status!=="done"&&r.prazo&&r.prazo<=s);if(!i.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra hoje</div>
      <div style="font-size:12px">Sem tarefas vencidas ou pra hoje. Tá em dia.</div>
    </div>`;return}const n={};for(const r of i)(n[r.projeto_id]=n[r.projeto_id]||[]).push(r);const o=Object.entries(n).map(([r,e])=>{const a=g.find(c=>c.id===r);if(!a)return"";const l=I.find(c=>c.id===a.cliente_id),d=e.sort((c,p)=>(c.prazo||"").localeCompare(p.prazo||"")).map(c=>`<div class="pj-hoje-row" data-tid="${c.id}">
        <input type="checkbox" class="pj-hoje-cb" data-tid="${c.id}">
        <div class="pj-hoje-title">${m(c.titulo)}</div>
        ${Z(c.prioridade)}
        ${G(c.prazo)}
      </div>`).join("");return`<div class="pj-hoje-block">
      <div class="pj-hoje-head">
        <span class="pj-side-dot" style="background:${a.cor||"#C5F82A"}"></span>
        <span class="pj-hoje-proj">${m(a.nome)}</span>
        <span class="pj-hoje-cli">${l?m(l.empresa||l.nome):"Interno"}</span>
        <span class="pj-col-count">${e.length}</span>
      </div>
      <div class="pj-hoje-rows">${d}</div>
    </div>`}).join("");t.innerHTML=`<div class="pj-hoje">${o}</div>`,t.addEventListener("click",async r=>{const e=r.target.closest(".pj-hoje-cb");if(e){r.stopPropagation();const l=h.find(d=>d.id===e.dataset.tid);if(!l)return;await tt(l,()=>k());return}const a=r.target.closest(".pj-hoje-row");if(a){const l=h.find(d=>d.id===a.dataset.tid);l&&D(l)}})}function nt(){const t=document.getElementById("content");if(!_.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma rotina ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Rotinas geram tarefas automaticamente em dias específicos.<br>Ex: toda segunda criar "Mandar vídeo motivacional pra Adriane".</div>
      <button class="btn bp" id="btn-first-rot">+ Criar primeira rotina</button>
    </div>`,document.getElementById("btn-first-rot").addEventListener("click",()=>N());return}const s=_.map(i=>{const n=g.find(e=>e.id===i.projeto_id),o=I.find(e=>e.id===i.cliente_id)||n&&I.find(e=>e.id===n.cliente_id),r=Array.isArray(i.tarefas)?i.tarefas:[];return`<div class="pj-rot-card" data-rid="${i.id}">
      <div class="pj-rot-head">
        <div class="pj-rot-name">${m(i.nome)}</div>
        <label class="pj-rot-toggle">
          <input type="checkbox" class="pj-rot-active" data-rid="${i.id}" ${i.ativa?"checked":""}>
          <span>${i.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="pj-rot-meta">
        ${n?`<span class="pj-rot-chip"><span class="pj-side-dot" style="background:${n.cor||"#C5F82A"};width:7px;height:7px"></span>${m(n.nome)}</span>`:""}
        ${o?`<span class="pj-rot-chip">${m(o.empresa||o.nome)}</span>`:""}
        <span class="pj-rot-chip">${st(i)}</span>
        <span class="pj-rot-chip">${r.length} tarefa${r.length===1?"":"s"}</span>
        ${i.ultima_geracao?`<span class="pj-rot-chip" style="color:var(--text-3)">Última: ${H(i.ultima_geracao)}</span>`:""}
      </div>
      ${r.length?`<div class="pj-rot-tarefas">${r.map(e=>`<span class="pj-rot-tlbl">• ${m(e.titulo||"")}</span>`).join("")}</div>`:""}
      <div class="pj-rot-acts">
        <button class="btn bg bsm rot-edit" data-rid="${i.id}">Editar</button>
        <button class="btn bg bsm rot-run"  data-rid="${i.id}">Rodar agora</button>
        <button class="btn bd bsm rot-del"  data-rid="${i.id}">Excluir</button>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-rot-grid">${s}</div>`,t.addEventListener("click",async i=>{const n=i.target.closest(".rot-edit"),o=i.target.closest(".rot-del"),r=i.target.closest(".rot-run"),e=i.target.closest(".pj-rot-active");if(n){const a=_.find(l=>l.id===n.dataset.rid);a&&N(a)}else if(o){const a=_.find(l=>l.id===o.dataset.rid);a&&confirm(`Excluir rotina "${a.nome}"? (Tarefas já geradas continuam)`)&&(await f.from("rotinas").delete().eq("id",a.id),u("Rotina excluída"),k())}else if(r){const a=_.find(l=>l.id===r.dataset.rid);a&&(await ft(a),u("Tarefas geradas"),k())}else if(e){const a=_.find(l=>l.id===e.dataset.rid);a&&(a.ativa=e.checked,await f.from("rotinas").update({ativa:a.ativa,atualizado_em:new Date().toISOString()}).eq("id",a.id))}})}function st(t){if(t.cadencia==="diaria")return"Todos os dias";if(t.cadencia==="semanal"){const s=(t.dias_semana||[]).map(i=>{var n;return(n=V.find(o=>o.k===i))==null?void 0:n.l}).filter(Boolean).join(", ");return s?`Semanal: ${s}`:"Semanal"}return t.cadencia==="mensal"?`Mensal: dia ${t.dia_mes||1}`:t.cadencia}function Y(){const t=document.getElementById("content");if(!g.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`,document.getElementById("btn-add-first").addEventListener("click",()=>K());return}const s=g.map(i=>{const n=I.find(e=>e.id===i.cliente_id),o=h.filter(e=>e.projeto_id===i.id).length,r=h.filter(e=>e.projeto_id===i.id&&e.status==="done").length;return`<div class="pj-side ${i.id===y?"on":""}" data-pid="${i.id}">
      <div class="pj-side-dot" style="background:${i.cor||"#C5F82A"}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${m(i.nome)}</div>
        <div class="pj-side-meta">${n?m(n.empresa||n.nome):"Interno"} · ${r}/${o}</div>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${g.length})</span></div>
      <div class="pj-sidebar-list">${s}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`,t.querySelector(".pj-sidebar-list").addEventListener("click",i=>{const n=i.target.closest(".pj-side");n&&(y=n.dataset.pid,Y())}),P()}function P(){const t=g.find(e=>e.id===y);if(!t)return;const s=I.find(e=>e.id===t.cliente_id),i=h.filter(e=>e.projeto_id===t.id),n=F(t),o=`<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${t.cor||"#C5F82A"}"></div>
      <div>
        <div class="pj-head-name">${m(t.nome)}</div>
        <div class="pj-head-meta">
          ${s?`<span>${m(s.empresa||s.nome)}</span>`:"<span>Interno</span>"}
          ${t.prazo?` · <span>Prazo ${H(t.prazo)}</span>`:""}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`,r=S==="lista"?rt(i,n):ot(i,n);document.getElementById("pj-main").innerHTML=o+r,document.getElementById("pj-edit").addEventListener("click",()=>K(t)),document.getElementById("pj-del").addEventListener("click",()=>pt(t)),document.getElementById("pj-add-tar").addEventListener("click",()=>{var e;return D({projeto_id:t.id,status:((e=n[0])==null?void 0:e.k)||"todo"})}),ct()}function F(t){const s=t==null?void 0:t.etapas;return Array.isArray(s)&&s.length?s:T}function ot(t,s){return`<div class="pj-kanban">${s.map(n=>{const o=t.filter(e=>e.status===n.k),r=o.length?o.map(e=>dt(e)).join(""):'<div class="pj-empty">—</div>';return`<div class="pj-col" data-status="${n.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${n.cor}">
          <span class="pj-col-bullet" style="background:${n.cor}"></span>${m(n.l)}
        </span>
        <span class="pj-col-count">${o.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${n.k}">${r}</div>
    </div>`}).join("")}</div>`}function rt(t,s){if(!t.length)return'<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>';const i=s.map(r=>r.k);return`<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${[...t].sort((r,e)=>i.indexOf(r.status)-i.indexOf(e.status)||(r.prazo||"").localeCompare(e.prazo||"")).map(r=>{const e=q.filter(l=>l.tarefa_id===r.id),a=e.filter(l=>l.feito).length;return`<tr class="pj-row" data-tid="${r.id}">
      <td>${lt(r.status,s)}</td>
      <td class="pj-row-title">${m(r.titulo)}${e.length?`<span class="pj-sub-chip">${a}/${e.length}</span>`:""}${r.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</td>
      <td>${Z(r.prioridade)}</td>
      <td class="tm">${G(r.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${r.id}">×</button></td>
    </tr>`}).join("")}</tbody>
    </table>
  </div>`}function dt(t){const s=q.filter(o=>o.tarefa_id===t.id),i=s.filter(o=>o.feito).length,n=O[t.prioridade]||O.media;return`<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${n.cor}"></div>
      <div class="pj-card-title">${m(t.titulo)}${t.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</div>
    </div>
    ${t.descricao?`<div class="pj-card-desc">${m(t.descricao).slice(0,80)}${t.descricao.length>80?"…":""}</div>`:""}
    <div class="pj-card-foot">
      ${G(t.prazo)}
      ${s.length?`<span class="pj-sub-chip">${i}/${s.length}</span>`:""}
    </div>
  </div>`}function lt(t,s){const i=(s||T).find(n=>n.k===t)||T[0];return`<span class="pj-pill" style="background:${i.cor}22;color:${i.cor}">${m(i.l)}</span>`}function Z(t){const s=O[t]||O.media;return`<span class="pj-pill" style="background:${s.cor}22;color:${s.cor}">${s.l}</span>`}function G(t){if(!t)return"";const s=new Date(t+"T00:00:00"),i=new Date;i.setHours(0,0,0,0);const n=Math.round((s-i)/864e5);let o="pj-prazo";return n<0?o+=" late":n<=2&&(o+=" soon"),`<span class="${o}">${H(t)}</span>`}function ct(){const t=document.getElementById("pj-main");if(!t)return;t.addEventListener("click",i=>{const n=i.target.closest(".pj-card"),o=i.target.closest(".pj-row"),r=i.target.closest(".del-tar");if(r){i.stopPropagation();const e=h.find(a=>a.id===r.dataset.tid);e&&confirm(`Excluir "${e.titulo}"?`)&&et(e.id);return}if(n){const e=h.find(a=>a.id===n.dataset.tid);e&&D(e)}else if(o){const e=h.find(a=>a.id===o.dataset.tid);e&&D(e)}});let s=null;t.querySelectorAll(".pj-card").forEach(i=>{i.addEventListener("dragstart",n=>{s=i.dataset.tid,i.classList.add("drag"),n.dataTransfer.effectAllowed="move"}),i.addEventListener("dragend",()=>{i.classList.remove("drag"),t.querySelectorAll(".pj-col-cards.over").forEach(n=>n.classList.remove("over"))})}),t.querySelectorAll(".pj-col-cards").forEach(i=>{i.addEventListener("dragover",n=>{n.preventDefault(),i.classList.add("over")}),i.addEventListener("dragleave",()=>i.classList.remove("over")),i.addEventListener("drop",async n=>{if(n.preventDefault(),i.classList.remove("over"),!s)return;const o=i.dataset.drop,r=h.find(a=>a.id===s);if(!r||r.status===o)return;if(o==="done"){await tt(r,()=>P());return}r.status=o;const{error:e}=await f.from("tarefas").update({status:o,atualizado_em:new Date().toISOString()}).eq("id",s);if(e){u("Erro: "+e.message,"err");return}P()})})}function K(t={}){const s='<option value="">— sem cliente (interno) —</option>'+at(t.cliente_id).map(e=>`<option value="${e.id}"${t.cliente_id===e.id?" selected":""}>${m(e.empresa||e.nome)}</option>`).join(""),i=M.map(e=>`<span class="pj-cor-opt${(t.cor||M[0])===e?" on":""}" data-cor="${e}" style="background:${e}"></span>`).join("");let n=Array.isArray(t.etapas)&&t.etapas.length?JSON.parse(JSON.stringify(t.etapas)):JSON.parse(JSON.stringify(T));z(t.id?"Editar projeto":"Novo projeto",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${w(t.nome||"")}" placeholder="Ex: Conteúdo semanal Adriane"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${m(t.descricao||"")}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${s}</select></div>
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
  `);let o=t.cor||M[0];document.getElementById("pj-cor-row").addEventListener("click",e=>{const a=e.target.closest(".pj-cor-opt");a&&(o=a.dataset.cor,document.querySelectorAll(".pj-cor-opt").forEach(l=>l.classList.toggle("on",l.dataset.cor===o)))});const r=()=>{document.getElementById("pj-etapas-list").innerHTML=n.map((e,a)=>`
      <div class="pj-etapa-row" data-i="${a}">
        <span class="pj-etapa-color" data-i="${a}" style="background:${e.cor}"></span>
        <input type="text" class="fi pj-etapa-l" data-i="${a}" value="${w(e.l)}" style="flex:1;padding:6px 9px;font-size:12.5px">
        <button class="pj-etapa-up"   type="button" data-i="${a}" ${a===0?"disabled":""}>↑</button>
        <button class="pj-etapa-down" type="button" data-i="${a}" ${a===n.length-1?"disabled":""}>↓</button>
        <button class="pj-sub-del"    type="button" data-i="${a}" ${n.length<=1?"disabled":""} title="Remover">×</button>
      </div>
    `).join("")};r(),document.getElementById("pj-etapa-add").addEventListener("click",()=>{const e="etapa_"+Math.random().toString(36).slice(2,7);n.push({k:e,l:"Nova etapa",cor:B[n.length%B.length]}),r()}),document.getElementById("pj-etapas-list").addEventListener("click",e=>{const a=e.target.closest(".pj-etapa-up"),l=e.target.closest(".pj-etapa-down"),d=e.target.closest(".pj-sub-del"),c=e.target.closest(".pj-etapa-color");if(a){const p=+a.dataset.i;[n[p-1],n[p]]=[n[p],n[p-1]],r()}if(l){const p=+l.dataset.i;[n[p+1],n[p]]=[n[p],n[p+1]],r()}if(d&&n.length>1){const p=+d.dataset.i;n.splice(p,1),r()}if(c){const p=+c.dataset.i,E=n[p].cor,b=B.indexOf(E);n[p].cor=B[(b+1)%B.length],r()}}),document.getElementById("pj-etapas-list").addEventListener("input",e=>{const a=e.target.closest(".pj-etapa-l");a&&(n[+a.dataset.i].l=a.value)}),document.getElementById("pj-cancel").addEventListener("click",x),document.getElementById("pj-save").addEventListener("click",async()=>{const e=n.filter(p=>(p.l||"").trim()).map(p=>({k:p.k||"etapa_"+Math.random().toString(36).slice(2,7),l:p.l.trim(),cor:p.cor||"#A0A0A0"}));if(!e.length)return u("Adicione pelo menos 1 etapa","err");const a={nome:document.getElementById("pj-nome").value.trim(),descricao:document.getElementById("pj-desc").value.trim()||null,cliente_id:document.getElementById("pj-cli").value||null,prazo:document.getElementById("pj-prazo").value||null,cor:o,etapas:e,atualizado_em:new Date().toISOString()};if(!a.nome)return u("Nome é obrigatório","err");const l=t.id?f.from("projetos").update(a).eq("id",t.id):f.from("projetos").insert(a).select().single(),{data:d,error:c}=await l;if(c)return u("Erro: "+c.message,"err");!t.id&&d&&(y=d.id),x(),u(t.id?"Projeto salvo":"Projeto criado"),k()})}async function pt(t){if(!confirm(`Excluir "${t.nome}" e TODAS as tarefas e rotinas dele?`))return;const{error:s}=await f.from("projetos").delete().eq("id",t.id);if(s)return u("Erro: "+s.message,"err");y=null,u("Projeto excluído"),k()}async function tt(t,s){if(t.status==="done"){s&&s();return}t.status="done";const{error:i}=await f.from("tarefas").update({status:"done",atualizado_em:new Date().toISOString()}).eq("id",t.id);if(i){u("Erro: "+i.message,"err");return}const n=g.find(c=>c.id===t.projeto_id),o=n?I.find(c=>c.id===n.cliente_id):null;if(!o||!o.whatsapp||t.notificar_cliente===!1){u("Marcada como feita"),s&&s();return}const r=t.apelido_cliente||t.titulo||"",e=(o.nome||"").split(" ")[0]||"";z("Tarefa concluída — avisar o cliente?",`
    <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:14px">
      Cliente: <strong style="color:var(--text)">${m(o.empresa||o.nome)}</strong>
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
  `);const a=c=>{x(),s&&s()},l=()=>document.getElementById("cn-apelido").value.trim()||t.titulo,d=()=>document.getElementById("cn-incluir").checked;document.getElementById("cn-skip").addEventListener("click",async()=>{await f.from("tarefas").update({apelido_cliente:l(),notificar_cliente:!1}).eq("id",t.id),u("Concluída — cliente não vai ser avisado"),a()}),document.getElementById("cn-save").addEventListener("click",async()=>{const c=l(),p=d();await f.from("tarefas").update({apelido_cliente:c,notificar_cliente:p}).eq("id",t.id),u(p?"No resumão das 18h":"Concluída — sem aviso"),a()}),document.getElementById("cn-now").addEventListener("click",async()=>{const c=l(),p=`Oi${e?`, ${e}`:""}! Terminei aqui: ${c}.`;await f.from("tarefas").update({apelido_cliente:c,notificar_cliente:!0,notificado_cliente_em:new Date().toISOString()}).eq("id",t.id);const E=String(o.whatsapp).replace(/\D/g,"");window.open(`https://wa.me/${E}?text=${encodeURIComponent(p)}`,"_blank"),u("Abrindo WhatsApp…"),a()})}function D(t={}){const s=!t.id,i=g.find(a=>a.id===(t.projeto_id||y)),n=F(i),o=n.map(a=>`<option value="${a.k}"${(t.status||n[0].k)===a.k?" selected":""}>${m(a.l)}</option>`).join(""),r=J.map(a=>`<option value="${a.k}"${(t.prioridade||"media")===a.k?" selected":""}>${a.l}</option>`).join(""),e=s?[]:q.filter(a=>a.tarefa_id===t.id);z(s?"Nova tarefa":"Editar tarefa",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${w(t.titulo||"")}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${m(t.descricao||"")}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Etapa</label><select class="fsl" id="tr-status">${o}</select></div>
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
      <div id="tr-subs" class="pj-subs">${e.map(a=>U(a.id,a.texto,a.feito)).join("")}</div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `,`
    ${s?"":'<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${s?"Criar":"Salvar"}</button>
  `),document.getElementById("tr-sub-add").addEventListener("click",()=>{const a=document.getElementById("tr-sub-new"),l=a.value.trim();if(!l)return;const d="new-"+Math.random().toString(36).slice(2);document.getElementById("tr-subs").insertAdjacentHTML("beforeend",U(d,l,!1)),a.value="",a.focus()}),document.getElementById("tr-sub-new").addEventListener("keydown",a=>{a.key==="Enter"&&(a.preventDefault(),document.getElementById("tr-sub-add").click())}),document.getElementById("tr-subs").addEventListener("click",a=>{const l=a.target.closest(".pj-sub-del");l&&l.closest(".pj-sub-row").remove()}),document.getElementById("tr-cancel").addEventListener("click",x),s||document.getElementById("tr-del").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await et(t.id),x())}),document.getElementById("tr-save").addEventListener("click",async()=>{const a={projeto_id:t.projeto_id||y,titulo:document.getElementById("tr-titulo").value.trim(),descricao:document.getElementById("tr-desc").value.trim()||null,status:document.getElementById("tr-status").value,prioridade:document.getElementById("tr-prio").value,prazo:document.getElementById("tr-prazo").value||null,apelido_cliente:document.getElementById("tr-apelido").value.trim()||null,notificar_cliente:document.getElementById("tr-notif").checked,atualizado_em:new Date().toISOString()};if(!a.titulo)return u("Título é obrigatório","err");let l=t.id;if(s){const{data:b,error:v}=await f.from("tarefas").insert(a).select().single();if(v)return u("Erro: "+v.message,"err");l=b.id}else{const{error:b}=await f.from("tarefas").update(a).eq("id",l);if(b)return u("Erro: "+b.message,"err")}const d=[...document.querySelectorAll(".pj-sub-row")],c=s?[]:q.filter(b=>b.tarefa_id===l),p=new Set;let E=0;for(const b of d){const v=b.dataset.sid,j=b.querySelector(".pj-sub-text").value.trim(),$=b.querySelector(".pj-sub-cb").checked;j&&(v.startsWith("new-")?await f.from("tarefa_subtasks").insert({tarefa_id:l,texto:j,feito:$,ordem:E++}):(p.add(v),await f.from("tarefa_subtasks").update({texto:j,feito:$,ordem:E++}).eq("id",v)))}for(const b of c)p.has(b.id)||await f.from("tarefa_subtasks").delete().eq("id",b.id);x(),u(s?"Tarefa criada":"Tarefa salva"),k()})}function U(t,s,i){return`<div class="pj-sub-row" data-sid="${t}">
    <input type="checkbox" class="pj-sub-cb" ${i?"checked":""}>
    <input type="text" class="pj-sub-text fi" value="${w(s)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`}async function et(t){const{error:s}=await f.from("tarefas").delete().eq("id",t);if(s)return u("Erro: "+s.message,"err");u("Tarefa excluída"),k()}function N(t={}){const s=!t.id,i='<option value="">— sem cliente —</option>'+at(t.cliente_id).map(d=>`<option value="${d.id}"${t.cliente_id===d.id?" selected":""}>${m(d.empresa||d.nome)}</option>`).join(""),n='<option value="">— escolha um projeto —</option>'+g.map(d=>`<option value="${d.id}"${t.projeto_id===d.id?" selected":""}>${m(d.nome)}</option>`).join(""),o=t.cadencia||"semanal",r=t.dias_semana||[1],e=Array.isArray(t.tarefas)?JSON.parse(JSON.stringify(t.tarefas)):[],a=V.map(d=>`<label class="pj-dia-chip ${r.includes(d.k)?"on":""}" data-d="${d.k}"><input type="checkbox" ${r.includes(d.k)?"checked":""} style="display:none">${d.l}</label>`).join("");z(s?"Nova rotina":"Editar rotina",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="rt-nome" value="${w(t.nome||"")}" placeholder="Ex: Rotina semanal Adriane"></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rt-cli">${i}</select></div>
      <div class="fg"><label class="fl">Projeto *</label><select class="fsl" id="rt-proj">${n}</select></div>
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
      <div class="pj-dias-row" id="rt-dias">${a}</div>
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
    ${s?"":'<button class="btn bd" id="rt-del">Excluir</button>'}
    <button class="btn bg" id="rt-cancel">Cancelar</button>
    <button class="btn bp" id="rt-save">${s?"Criar":"Salvar"}</button>
  `);const l=()=>{document.getElementById("rt-tars").innerHTML=e.map((d,c)=>`
      <div class="pj-rot-tar-row" data-i="${c}">
        <input type="text" class="fi rt-t-titulo" data-i="${c}" value="${w(d.titulo||"")}" placeholder="Título" style="flex:2;padding:6px 9px;font-size:12.5px">
        <select class="fsl rt-t-prio" data-i="${c}" style="flex:1;padding:6px 9px;font-size:12.5px">
          ${J.map(p=>`<option value="${p.k}"${(d.prioridade||"media")===p.k?" selected":""}>${p.l}</option>`).join("")}
        </select>
        <button class="pj-sub-del" type="button" data-i="${c}">×</button>
      </div>
    `).join("")};l(),document.getElementById("rt-tar-add").addEventListener("click",()=>{e.push({titulo:"",prioridade:"media"}),l()}),document.getElementById("rt-tars").addEventListener("click",d=>{const c=d.target.closest(".pj-sub-del");c&&(e.splice(+c.dataset.i,1),l())}),document.getElementById("rt-tars").addEventListener("input",d=>{const c=d.target.closest(".rt-t-titulo"),p=d.target.closest(".rt-t-prio");c&&(e[+c.dataset.i].titulo=c.value),p&&(e[+p.dataset.i].prioridade=p.value)}),document.querySelectorAll('input[name="rt-cad"]').forEach(d=>d.addEventListener("change",()=>{document.querySelectorAll(".pj-cad-opt").forEach(p=>p.classList.toggle("on",p.querySelector("input").checked));const c=document.querySelector('input[name="rt-cad"]:checked').value;document.getElementById("rt-dias-wrap").style.display=c==="semanal"?"":"none",document.getElementById("rt-mes-wrap").style.display=c==="mensal"?"":"none"})),document.getElementById("rt-dias").addEventListener("click",d=>{const c=d.target.closest(".pj-dia-chip");c&&(d.preventDefault(),c.classList.toggle("on"),c.querySelector("input").checked=c.classList.contains("on"))}),document.getElementById("rt-cancel").addEventListener("click",x),s||document.getElementById("rt-del").addEventListener("click",async()=>{confirm(`Excluir rotina "${t.nome}"?`)&&(await f.from("rotinas").delete().eq("id",t.id),x(),u("Rotina excluída"),k())}),document.getElementById("rt-save").addEventListener("click",async()=>{const d=document.querySelector('input[name="rt-cad"]:checked').value,c=[...document.querySelectorAll("#rt-dias .pj-dia-chip.on")].map(v=>+v.dataset.d),p={nome:document.getElementById("rt-nome").value.trim(),cliente_id:document.getElementById("rt-cli").value||null,projeto_id:document.getElementById("rt-proj").value||null,cadencia:d,dias_semana:d==="semanal"?c:[],dia_mes:d==="mensal"?+document.getElementById("rt-dia-mes").value||1:null,tarefas:e.filter(v=>(v.titulo||"").trim()),atualizado_em:new Date().toISOString()};if(!p.nome)return u("Nome é obrigatório","err");if(!p.projeto_id)return u("Selecione um projeto","err");if(d==="semanal"&&!p.dias_semana.length)return u("Marque pelo menos 1 dia","err");if(!p.tarefas.length)return u("Adicione pelo menos 1 tarefa","err");const E=t.id?f.from("rotinas").update(p).eq("id",t.id):f.from("rotinas").insert({...p,ativa:!0}),{error:b}=await E;if(b)return u("Erro: "+b.message,"err");x(),u(t.id?"Rotina salva":"Rotina criada"),k()})}function ut(t,s){const i=s.toISOString().slice(0,10);return t.ultima_geracao===i?!1:t.cadencia==="diaria"?!0:t.cadencia==="semanal"?(t.dias_semana||[]).includes(s.getDay()):t.cadencia==="mensal"?s.getDate()===(t.dia_mes||1):!1}async function mt(){var i;const t=new Date,s=t.toISOString().slice(0,10);for(const n of _){if(!n.ativa||!n.projeto_id||!ut(n,t))continue;const o=g.find(a=>a.id===n.projeto_id),r=((i=F(o)[0])==null?void 0:i.k)||"todo",e=(n.tarefas||[]).filter(a=>(a.titulo||"").trim()).map(a=>({projeto_id:n.projeto_id,rotina_id:n.id,titulo:a.titulo,descricao:a.descricao||`[Gerada pela rotina "${n.nome}"]`,prioridade:a.prioridade||"media",status:r,prazo:s}));e.length&&(await f.from("tarefas").insert(e),await f.from("rotinas").update({ultima_geracao:s}).eq("id",n.id))}}async function ft(t){var e;if(!t.projeto_id){u("Rotina sem projeto","err");return}const s=g.find(a=>a.id===t.projeto_id),i=((e=F(s)[0])==null?void 0:e.k)||"todo",n=new Date().toISOString().slice(0,10),{count:o}=await f.from("tarefas").select("id",{count:"exact",head:!0}).eq("rotina_id",t.id).eq("prazo",n);if((o||0)>0&&!confirm(`Essa rotina já rodou hoje (${o} tarefa${o===1?"":"s"} já gerada${o===1?"":"s"}). Rodar de novo vai duplicar. Continuar mesmo assim?`)){u("Cancelado.","er");return}const r=(t.tarefas||[]).filter(a=>(a.titulo||"").trim()).map(a=>({projeto_id:t.projeto_id,rotina_id:t.id,titulo:a.titulo,descricao:a.descricao||`[Gerada pela rotina "${t.nome}" — manual]`,prioridade:a.prioridade||"media",status:i,prazo:n}));if(!r.length){u("Rotina sem tarefas","err");return}await f.from("tarefas").insert(r),await f.from("rotinas").update({ultima_geracao:n}).eq("id",t.id)}function at(t){const s=new Set(["proposta","ativo","em_pausa","fechado"]);return I.filter(i=>s.has(i.status)||i.id===t)}function m(t){return String(t??"").replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[s])}function w(t){return m(t)}export{k as render};
