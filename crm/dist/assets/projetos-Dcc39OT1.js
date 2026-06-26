import{s as A,d as g,o as z,f as x,t as f,h as N,k as at}from"./index-D7U8TZfb.js";const it="https://flzpblpegoqjxaacjvhf.supabase.co";async function F(t,i){var e;const{data:n}=await at.auth.getSession(),o=(e=n==null?void 0:n.session)==null?void 0:e.access_token,s=await fetch(`${it}/functions/v1/${t}`,{method:"POST",headers:{"Content-Type":"application/json",...o?{Authorization:`Bearer ${o}`}:{}},body:JSON.stringify(i||{})}),d=await s.text();let a;try{a=JSON.parse(d)}catch{a={ok:!1,erro:d}}if(!s.ok||(a==null?void 0:a.ok)===!1)throw new Error((a==null?void 0:a.erro)||`HTTP ${s.status}`);return a}const q=[{k:"todo",l:"A fazer",cor:"#A0A0A0"},{k:"doing",l:"Fazendo",cor:"#4A9EFF"},{k:"review",l:"Revisão",cor:"#F5A623"},{k:"done",l:"Feito",cor:"#34D399"}],H=[{k:"baixa",l:"Baixa",cor:"#A0A0A0"},{k:"media",l:"Média",cor:"#4A9EFF"},{k:"alta",l:"Alta",cor:"#F5A623"},{k:"urgente",l:"Urgente",cor:"#FF5C5C"}],T=Object.fromEntries(H.map(t=>[t.k,t])),P=["#C5F82A","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4"],L=["#A0A0A0","#4A9EFF","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4","#C5F82A"],U=[{k:1,l:"Seg"},{k:2,l:"Ter"},{k:3,l:"Qua"},{k:4,l:"Qui"},{k:5,l:"Sex"},{k:6,l:"Sáb"},{k:0,l:"Dom"}];let j=[],S=[],$=[],B=[],w=[],h=null,I="kanban";async function _(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>',await K(),await ft(),await K(),h&&!j.find(i=>i.id===h)&&(h=null),!h&&j.length&&(h=j[0].id),V(),W()}async function K(){const[t,i,n,o,s]=await Promise.all([A("projetos",{order:{column:"criado_em",ascending:!1}}),A("clientes",{columns:"id,nome,empresa,status,whatsapp",order:{column:"nome",ascending:!0}}),A("tarefas",{order:{column:"ordem",ascending:!0}}),A("tarefa_subtasks",{order:{column:"ordem",ascending:!0}}),A("rotinas",{order:{column:"criado_em",ascending:!1}})]);j=t.data||[],S=i.data||[],$=n.data||[],B=o.data||[],w=s.data||[]}function V(){const t=(s,d)=>`<button class="pj-tab${I===s?" on":""}" data-tab="${s}">${d}</button>`,i=I==="rotinas"?'<button class="btn bp" id="btn-add-rotina">+ Nova rotina</button>':'<button class="btn bp" id="btn-add-proj">+ Novo projeto</button>';document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${t("kanban","Kanban")}${t("lista","Lista")}${t("hoje","Hoje")}${t("resumao","Resumão")}${t("rotinas","Rotinas")}</div>
    ${i}
  `,document.querySelectorAll(".pj-tab").forEach(s=>s.addEventListener("click",()=>{I=s.dataset.tab,V(),W()}));const n=document.getElementById("btn-add-proj"),o=document.getElementById("btn-add-rotina");n&&n.addEventListener("click",()=>G()),o&&o.addEventListener("click",()=>C())}function W(){return I==="hoje"?ot():I==="rotinas"?st():I==="resumao"?M():X()}async function M(){const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando resumão…</div>';let i;try{i=await F("digest-cliente",{})}catch(s){t.innerHTML=`<div class="empty">Erro ao carregar: ${v(s.message)}</div>`;return}const n=(i==null?void 0:i.clientes)||[];if(!n.length){t.innerHTML=`
      <div class="tw" style="padding:60px 20px;text-align:center">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra avisar hoje 🎯</div>
        <div style="font-size:12px;color:var(--text-3)">Conclua tarefas com cliente vinculado e elas aparecem aqui pra revisão.</div>
      </div>`;return}const o=s=>{const d=s.tarefas.map(a=>`
      <tr data-tid="${a.id}">
        <td style="width:30px">
          <input type="checkbox" class="rs-tar-cb" data-tid="${a.id}" checked>
        </td>
        <td style="color:var(--text-3);font-size:12px;width:42%">${v(a.titulo)}</td>
        <td>
          <input type="text"
            class="fi rs-apelido"
            data-tid="${a.id}"
            value="${E(a.apelido||a.titulo)}"
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
          <tbody>${d}</tbody>
        </table>
      </div>`};t.innerHTML=`
    <div style="font-size:13px;color:var(--text-3);margin-bottom:16px;line-height:1.5">
      ${n.length} cliente${n.length===1?"":"s"} esperando aviso.
      Revise os apelidos, desmarque o que não quer mandar, e clique <strong style="color:var(--text-2)">Revisar e enviar</strong> — vai abrir uma confirmação com o texto final.
    </div>
    ${n.map(o).join("")}
  `,t.querySelectorAll(".rs-send").forEach(s=>{s.addEventListener("click",async()=>{const d=s.dataset.cid,a=n.find(m=>m.cliente_id===d);if(!a)return;const e=t.querySelector(`.tw[data-cid="${d}"]`),c=[...e.querySelectorAll(".rs-tar-cb")].filter(m=>m.checked).map(m=>m.dataset.tid);if(!c.length){f("Nenhuma tarefa marcada.","err");return}const r={};c.forEach(m=>{const y=e.querySelector(`.rs-apelido[data-tid="${m}"]`);y&&(r[m]=y.value.trim())});const l=a.tipo==="grupo"?"Boa noite, pessoal! Fechando o dia aqui.":a.saudacao?`Oi, ${a.saudacao}! Fechando o dia aqui.`:"Oi! Fechando o dia aqui.",p=c.map(m=>{var y;return`✓ ${r[m]||((y=a.tarefas.find(k=>k.id===m))==null?void 0:y.titulo)||""}`}).join(`
`),u=`${l}

Hoje a gente avançou:
${p}

Qualquer dúvida é só chamar.

_Essa é uma mensagem automática gerada no fim do dia pelo nosso sistema._`;z(`Enviar pra ${a.nome}?`,`<div style="font-size:12px;color:var(--text-3);margin-bottom:8px">Texto final que vai pelo WhatsApp:</div>
         <pre style="background:var(--bg-input);border:1px solid var(--line);border-radius:var(--rs);padding:14px;font-family:inherit;font-size:13px;color:var(--text);white-space:pre-wrap;line-height:1.5;margin-bottom:10px">${v(u)}</pre>
         <div style="font-size:11px;color:var(--text-3)">Pro: <strong style="color:var(--text-2)">${v(a.whatsapp||"—")}</strong></div>`,`<button class="btn bg" id="rs-cancel">Cancelar</button>
         <button class="btn bp" id="rs-confirm">Confirmar envio</button>`),document.getElementById("rs-cancel").addEventListener("click",x),document.getElementById("rs-confirm").addEventListener("click",async()=>{const m=document.getElementById("rs-confirm");m.disabled=!0,m.textContent="Enviando…";try{const y=a.tarefas.filter(k=>!c.includes(k.id)).map(k=>k.id);for(const k of y)await g.from("tarefas").update({notificar_cliente:!1}).eq("id",k);await F("digest-cliente",{bloco_id:d,apelidos:r}),f(`Enviado pra ${a.nome} ✓`),x(),M()}catch(y){m.disabled=!1,m.textContent="Confirmar envio",f("Erro: "+y.message,"err")}})})}),t.querySelectorAll(".rs-skip").forEach(s=>{s.addEventListener("click",async()=>{const d=s.dataset.cid,a=n.find(r=>r.cliente_id===d);if(!a||!confirm(`Pular ${a.nome} hoje? As tarefas somem do resumão e não viram aviso.`))return;const e=a.tarefas.map(r=>r.id),c=new Date().toISOString();await g.from("tarefas").update({notificado_cliente_em:c}).in("id",e),f(`${a.nome} pulado`),M()})})}function ot(){const t=document.getElementById("content"),i=new Date().toISOString().slice(0,10),n=$.filter(d=>d.status!=="done"&&d.prazo&&d.prazo<=i);if(!n.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nada pra hoje</div>
      <div style="font-size:12px">Sem tarefas vencidas ou pra hoje. Tá em dia.</div>
    </div>`;return}const o={};for(const d of n)(o[d.projeto_id]=o[d.projeto_id]||[]).push(d);const s=Object.entries(o).map(([d,a])=>{const e=j.find(l=>l.id===d);if(!e)return"";const c=S.find(l=>l.id===e.cliente_id),r=a.sort((l,p)=>(l.prazo||"").localeCompare(p.prazo||"")).map(l=>`<div class="pj-hoje-row" data-tid="${l.id}">
        <input type="checkbox" class="pj-hoje-cb" data-tid="${l.id}">
        <div class="pj-hoje-title">${v(l.titulo)}</div>
        ${Y(l.prioridade)}
        ${J(l.prazo)}
      </div>`).join("");return`<div class="pj-hoje-block">
      <div class="pj-hoje-head">
        <span class="pj-side-dot" style="background:${e.cor||"#C5F82A"}"></span>
        <span class="pj-hoje-proj">${v(e.nome)}</span>
        <span class="pj-hoje-cli">${c?v(c.empresa||c.nome):"Interno"}</span>
        <span class="pj-col-count">${a.length}</span>
      </div>
      <div class="pj-hoje-rows">${r}</div>
    </div>`}).join("");t.innerHTML=`<div class="pj-hoje">${s}</div>`,t.addEventListener("click",async d=>{const a=d.target.closest(".pj-hoje-cb");if(a){d.stopPropagation();const c=$.find(r=>r.id===a.dataset.tid);if(!c)return;await Z(c,()=>_());return}const e=d.target.closest(".pj-hoje-row");if(e){const c=$.find(r=>r.id===e.dataset.tid);c&&O(c)}})}function st(){const t=document.getElementById("content");if(!w.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhuma rotina ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Rotinas geram tarefas automaticamente em dias específicos.<br>Ex: toda segunda criar "Mandar vídeo motivacional pra Adriane".</div>
      <button class="btn bp" id="btn-first-rot">+ Criar primeira rotina</button>
    </div>`,document.getElementById("btn-first-rot").addEventListener("click",()=>C());return}const i=new Map,n=[];w.forEach(e=>{if(!e.projeto_id){n.push(e);return}i.has(e.projeto_id)||i.set(e.projeto_id,[]),i.get(e.projeto_id).push(e)});const o=[...j].filter(e=>i.has(e.id)).sort((e,c)=>(e.nome||"").localeCompare(c.nome||"")),s=e=>{const c=S.find(l=>l.id===e.cliente_id),r=Array.isArray(e.tarefas)?e.tarefas:[];return`<div class="pj-rot-item ${e.ativa?"":"paused"}" data-rid="${e.id}">
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
          <span class="pj-rot-chip">${nt(e)}</span>
          <span class="pj-rot-chip">${r.length} tarefa${r.length===1?"":"s"}</span>
          ${e.ultima_geracao?`<span class="pj-rot-chip pj-rot-chip-dim">Última: ${N(e.ultima_geracao)}</span>`:""}
        </div>
        ${r.length?`<div class="pj-rot-item-tarefas">${r.map(l=>`<span class="pj-rot-tlbl">• ${v(l.titulo||"")}</span>`).join("")}</div>`:""}
      </div>
      <div class="pj-rot-item-acts">
        <button class="btn bg bsm rot-edit" data-rid="${e.id}">Editar</button>
        <button class="btn bg bsm rot-run"  data-rid="${e.id}">Rodar agora</button>
        <button class="btn bd bsm rot-del"  data-rid="${e.id}">Excluir</button>
      </div>
    </div>`},d=o.map(e=>{const c=i.get(e.id)||[],r=c.filter(p=>p.ativa).length,l=e.cor||"#C5F82A";return`<div class="pj-rot-group" style="--proj-color:${l}">
      <div class="pj-rot-group-h">
        <div class="pj-rot-group-h-l">
          <span class="pj-rot-group-dot" style="background:${l}"></span>
          <span class="pj-rot-group-name">${v(e.nome)}</span>
        </div>
        <div class="pj-rot-group-h-r">
          <span class="pj-rot-group-count">${r}/${c.length} ativa${c.length===1?"":"s"}</span>
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
  </div>`:"";t.innerHTML=`<div class="pj-rot-groups">${d}${a}</div>`,t.addEventListener("click",async e=>{const c=e.target.closest(".rot-add-proj");if(c){C({projeto_id:c.dataset.pid});return}const r=e.target.closest(".rot-edit"),l=e.target.closest(".rot-del"),p=e.target.closest(".rot-run"),b=e.target.closest(".pj-rot-active");if(r){const u=w.find(m=>m.id===r.dataset.rid);u&&C(u)}else if(l){const u=w.find(m=>m.id===l.dataset.rid);u&&confirm(`Excluir rotina "${u.nome}"? (Tarefas já geradas continuam)`)&&(await g.from("rotinas").delete().eq("id",u.id),f("Rotina excluída"),_())}else if(p){const u=w.find(m=>m.id===p.dataset.rid);u&&(await vt(u),f("Tarefas geradas"),_())}else if(b){const u=w.find(m=>m.id===b.dataset.rid);u&&(u.ativa=b.checked,await g.from("rotinas").update({ativa:u.ativa,atualizado_em:new Date().toISOString()}).eq("id",u.id))}})}function nt(t){if(t.cadencia==="diaria")return"Todos os dias";if(t.cadencia==="semanal"){const i=(t.dias_semana||[]).map(n=>{var o;return(o=U.find(s=>s.k===n))==null?void 0:o.l}).filter(Boolean).join(", ");return i?`Semanal: ${i}`:"Semanal"}return t.cadencia==="mensal"?`Mensal: dia ${t.dia_mes||1}`:t.cadencia}function X(){const t=document.getElementById("content");if(!j.length){t.innerHTML=`<div class="empty" style="padding:80px 20px">
      <div style="font-size:14px;color:var(--text-2);margin-bottom:8px">Nenhum projeto ainda</div>
      <div style="font-size:12px;margin-bottom:18px">Crie seu primeiro projeto pra começar.</div>
      <button class="btn bp" id="btn-add-first">+ Criar projeto</button>
    </div>`,document.getElementById("btn-add-first").addEventListener("click",()=>G());return}const i=j.map(n=>{const o=S.find(a=>a.id===n.cliente_id),s=$.filter(a=>a.projeto_id===n.id).length,d=$.filter(a=>a.projeto_id===n.id&&a.status==="done").length;return`<div class="pj-side ${n.id===h?"on":""}" data-pid="${n.id}">
      <div class="pj-side-dot" style="background:${n.cor||"#C5F82A"}"></div>
      <div class="pj-side-body">
        <div class="pj-side-name">${v(n.nome)}</div>
        <div class="pj-side-meta">${o?v(o.empresa||o.nome):"Interno"} · ${d}/${s}</div>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="pj-wrap">
    <div class="pj-sidebar">
      <div class="pj-sidebar-head">Projetos <span style="color:var(--text-3);font-weight:400">(${j.length})</span></div>
      <div class="pj-sidebar-list">${i}</div>
    </div>
    <div class="pj-main" id="pj-main"></div>
  </div>`,t.querySelector(".pj-sidebar-list").addEventListener("click",n=>{const o=n.target.closest(".pj-side");o&&(h=o.dataset.pid,X())}),R()}function R(){const t=j.find(a=>a.id===h);if(!t)return;const i=S.find(a=>a.id===t.cliente_id),n=$.filter(a=>a.projeto_id===t.id),o=D(t),s=`<div class="pj-head">
    <div class="pj-head-left">
      <div class="pj-head-dot" style="background:${t.cor||"#C5F82A"}"></div>
      <div>
        <div class="pj-head-name">${v(t.nome)}</div>
        <div class="pj-head-meta">
          ${i?`<span>${v(i.empresa||i.nome)}</span>`:"<span>Interno</span>"}
          ${t.prazo?` · <span>Prazo ${N(t.prazo)}</span>`:""}
        </div>
      </div>
    </div>
    <div class="pj-head-acts">
      <button class="btn bg bsm" id="pj-edit">Editar</button>
      <button class="btn bd bsm" id="pj-del">Excluir</button>
      <button class="btn bp" id="pj-add-tar">+ Tarefa</button>
    </div>
  </div>`,d=I==="lista"?dt(n,o):rt(n,o);document.getElementById("pj-main").innerHTML=s+d,document.getElementById("pj-edit").addEventListener("click",()=>G(t)),document.getElementById("pj-del").addEventListener("click",()=>ut(t)),document.getElementById("pj-add-tar").addEventListener("click",()=>{var a;return O({projeto_id:t.id,status:((a=o[0])==null?void 0:a.k)||"todo"})}),pt()}function D(t){const i=t==null?void 0:t.etapas;return Array.isArray(i)&&i.length?i:q}function rt(t,i){return`<div class="pj-kanban">${i.map(o=>{const s=t.filter(a=>a.status===o.k),d=s.length?s.map(a=>lt(a)).join(""):'<div class="pj-empty">—</div>';return`<div class="pj-col" data-status="${o.k}">
      <div class="pj-col-head">
        <span class="pj-col-title" style="color:${o.cor}">
          <span class="pj-col-bullet" style="background:${o.cor}"></span>${v(o.l)}
        </span>
        <span class="pj-col-count">${s.length}</span>
      </div>
      <div class="pj-col-cards" data-drop="${o.k}">${d}</div>
    </div>`}).join("")}</div>`}function dt(t,i){if(!t.length)return'<div class="empty" style="padding:40px">Sem tarefas neste projeto.</div>';const n=i.map(d=>d.k);return`<div class="tw" style="margin-top:14px">
    <table>
      <thead><tr><th>Status</th><th>Tarefa</th><th>Prio</th><th>Prazo</th><th></th></tr></thead>
      <tbody>${[...t].sort((d,a)=>n.indexOf(d.status)-n.indexOf(a.status)||(d.prazo||"").localeCompare(a.prazo||"")).map(d=>{const a=B.filter(c=>c.tarefa_id===d.id),e=a.filter(c=>c.feito).length;return`<tr class="pj-row" data-tid="${d.id}">
      <td>${ct(d.status,i)}</td>
      <td class="pj-row-title">${v(d.titulo)}${a.length?`<span class="pj-sub-chip">${e}/${a.length}</span>`:""}${d.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</td>
      <td>${Y(d.prioridade)}</td>
      <td class="tm">${J(d.prazo)}</td>
      <td><button class="btn bd bsm bic del-tar" data-tid="${d.id}">×</button></td>
    </tr>`}).join("")}</tbody>
    </table>
  </div>`}function lt(t){const i=B.filter(s=>s.tarefa_id===t.id),n=i.filter(s=>s.feito).length,o=T[t.prioridade]||T.media;return`<div class="pj-card" draggable="true" data-tid="${t.id}">
    <div class="pj-card-top">
      <div class="pj-card-prio" style="background:${o.cor}"></div>
      <div class="pj-card-title">${v(t.titulo)}${t.rotina_id?'<span class="pj-rot-badge" title="De rotina">↻</span>':""}</div>
    </div>
    ${t.descricao?`<div class="pj-card-desc">${v(t.descricao).slice(0,80)}${t.descricao.length>80?"…":""}</div>`:""}
    <div class="pj-card-foot">
      ${J(t.prazo)}
      ${i.length?`<span class="pj-sub-chip">${n}/${i.length}</span>`:""}
    </div>
  </div>`}function ct(t,i){const n=(i||q).find(o=>o.k===t)||q[0];return`<span class="pj-pill" style="background:${n.cor}22;color:${n.cor}">${v(n.l)}</span>`}function Y(t){const i=T[t]||T.media;return`<span class="pj-pill" style="background:${i.cor}22;color:${i.cor}">${i.l}</span>`}function J(t){if(!t)return"";const i=new Date(t+"T00:00:00"),n=new Date;n.setHours(0,0,0,0);const o=Math.round((i-n)/864e5);let s="pj-prazo";return o<0?s+=" late":o<=2&&(s+=" soon"),`<span class="${s}">${N(t)}</span>`}function pt(){const t=document.getElementById("pj-main");if(!t)return;t.addEventListener("click",n=>{const o=n.target.closest(".pj-card"),s=n.target.closest(".pj-row"),d=n.target.closest(".del-tar");if(d){n.stopPropagation();const a=$.find(e=>e.id===d.dataset.tid);a&&confirm(`Excluir "${a.titulo}"?`)&&tt(a.id);return}if(o){const a=$.find(e=>e.id===o.dataset.tid);a&&O(a)}else if(s){const a=$.find(e=>e.id===s.dataset.tid);a&&O(a)}});let i=null;t.querySelectorAll(".pj-card").forEach(n=>{n.addEventListener("dragstart",o=>{i=n.dataset.tid,n.classList.add("drag"),o.dataTransfer.effectAllowed="move"}),n.addEventListener("dragend",()=>{n.classList.remove("drag"),t.querySelectorAll(".pj-col-cards.over").forEach(o=>o.classList.remove("over"))})}),t.querySelectorAll(".pj-col-cards").forEach(n=>{n.addEventListener("dragover",o=>{o.preventDefault(),n.classList.add("over")}),n.addEventListener("dragleave",()=>n.classList.remove("over")),n.addEventListener("drop",async o=>{if(o.preventDefault(),n.classList.remove("over"),!i)return;const s=n.dataset.drop,d=$.find(e=>e.id===i);if(!d||d.status===s)return;if(s==="done"){await Z(d,()=>R());return}d.status=s;const{error:a}=await g.from("tarefas").update({status:s,atualizado_em:new Date().toISOString()}).eq("id",i);if(a){f("Erro: "+a.message,"err");return}R()})})}function G(t={}){const i='<option value="">— sem cliente (interno) —</option>'+et(t.cliente_id).map(a=>`<option value="${a.id}"${t.cliente_id===a.id?" selected":""}>${v(a.empresa||a.nome)}</option>`).join(""),n=P.map(a=>`<span class="pj-cor-opt${(t.cor||P[0])===a?" on":""}" data-cor="${a}" style="background:${a}"></span>`).join("");let o=Array.isArray(t.etapas)&&t.etapas.length?JSON.parse(JSON.stringify(t.etapas)):JSON.parse(JSON.stringify(q));z(t.id?"Editar projeto":"Novo projeto",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="pj-nome" value="${E(t.nome||"")}" placeholder="Ex: Conteúdo semanal Adriane"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="pj-desc" rows="2" placeholder="Resumo do projeto">${v(t.descricao||"")}</textarea></div>
    <div class="frow">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="pj-cli">${i}</select></div>
      <div class="fg"><label class="fl">Prazo</label><input class="fi" type="date" id="pj-prazo" value="${t.prazo||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Cor</label>
      <div class="pj-cor-row" id="pj-cor-row">${n}</div></div>
    <div class="fg" style="margin-top:11px">
      <label class="fl">JID do grupo WhatsApp <span style="color:var(--text-3);font-weight:400">(opcional — deixe vazio pra enviar no DM do cliente)</span></label>
      <input class="fi" id="pj-jid" value="${E(t.jid_grupo||"")}" placeholder="Ex: 120363409551896994@g.us">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Se preenchido, o resumão deste projeto vai pro grupo (e não pro DM do cliente).</div>
    </div>
    <div class="fg" style="margin-top:14px">
      <label class="fl">Etapas do fluxo</label>
      <div id="pj-etapas-list" class="pj-etapas-list"></div>
      <button class="btn bg bsm" id="pj-etapa-add" type="button" style="margin-top:6px;align-self:flex-start">+ Etapa</button>
    </div>
  `,`
    <button class="btn bg" id="pj-cancel">Cancelar</button>
    <button class="btn bp" id="pj-save">${t.id?"Salvar":"Criar"}</button>
  `);let s=t.cor||P[0];document.getElementById("pj-cor-row").addEventListener("click",a=>{const e=a.target.closest(".pj-cor-opt");e&&(s=e.dataset.cor,document.querySelectorAll(".pj-cor-opt").forEach(c=>c.classList.toggle("on",c.dataset.cor===s)))});const d=()=>{document.getElementById("pj-etapas-list").innerHTML=o.map((a,e)=>`
      <div class="pj-etapa-row" data-i="${e}">
        <span class="pj-etapa-color" data-i="${e}" style="background:${a.cor}"></span>
        <input type="text" class="fi pj-etapa-l" data-i="${e}" value="${E(a.l)}" style="flex:1;padding:6px 9px;font-size:12.5px">
        <button class="pj-etapa-up"   type="button" data-i="${e}" ${e===0?"disabled":""}>↑</button>
        <button class="pj-etapa-down" type="button" data-i="${e}" ${e===o.length-1?"disabled":""}>↓</button>
        <button class="pj-sub-del"    type="button" data-i="${e}" ${o.length<=1?"disabled":""} title="Remover">×</button>
      </div>
    `).join("")};d(),document.getElementById("pj-etapa-add").addEventListener("click",()=>{const a="etapa_"+Math.random().toString(36).slice(2,7);o.push({k:a,l:"Nova etapa",cor:L[o.length%L.length]}),d()}),document.getElementById("pj-etapas-list").addEventListener("click",a=>{const e=a.target.closest(".pj-etapa-up"),c=a.target.closest(".pj-etapa-down"),r=a.target.closest(".pj-sub-del"),l=a.target.closest(".pj-etapa-color");if(e){const p=+e.dataset.i;[o[p-1],o[p]]=[o[p],o[p-1]],d()}if(c){const p=+c.dataset.i;[o[p+1],o[p]]=[o[p],o[p+1]],d()}if(r&&o.length>1){const p=+r.dataset.i;o.splice(p,1),d()}if(l){const p=+l.dataset.i,b=o[p].cor,u=L.indexOf(b);o[p].cor=L[(u+1)%L.length],d()}}),document.getElementById("pj-etapas-list").addEventListener("input",a=>{const e=a.target.closest(".pj-etapa-l");e&&(o[+e.dataset.i].l=e.value)}),document.getElementById("pj-cancel").addEventListener("click",x),document.getElementById("pj-save").addEventListener("click",async()=>{const a=o.filter(p=>(p.l||"").trim()).map(p=>({k:p.k||"etapa_"+Math.random().toString(36).slice(2,7),l:p.l.trim(),cor:p.cor||"#A0A0A0"}));if(!a.length)return f("Adicione pelo menos 1 etapa","err");const e={nome:document.getElementById("pj-nome").value.trim(),descricao:document.getElementById("pj-desc").value.trim()||null,cliente_id:document.getElementById("pj-cli").value||null,jid_grupo:document.getElementById("pj-jid").value.trim()||null,prazo:document.getElementById("pj-prazo").value||null,cor:s,etapas:a,atualizado_em:new Date().toISOString()};if(!e.nome)return f("Nome é obrigatório","err");const c=t.id?g.from("projetos").update(e).eq("id",t.id):g.from("projetos").insert(e).select().single(),{data:r,error:l}=await c;if(l)return f("Erro: "+l.message,"err");!t.id&&r&&(h=r.id),x(),f(t.id?"Projeto salvo":"Projeto criado"),_()})}async function ut(t){if(!confirm(`Excluir "${t.nome}" e TODAS as tarefas e rotinas dele?`))return;const{error:i}=await g.from("projetos").delete().eq("id",t.id);if(i)return f("Erro: "+i.message,"err");h=null,f("Projeto excluído"),_()}async function Z(t,i){if(t.status==="done"){i&&i();return}t.status="done";const{error:n}=await g.from("tarefas").update({status:"done",atualizado_em:new Date().toISOString()}).eq("id",t.id);if(n){f("Erro: "+n.message,"err");return}const o=j.find(r=>r.id===t.projeto_id),s=o?S.find(r=>r.id===o.cliente_id):null;if(!s||!s.whatsapp||t.notificar_cliente===!1){f("Marcada como feita"),i&&i();return}const d=t.apelido_cliente||t.titulo||"";(s.nome||"").split(" ")[0],z("Tarefa concluída — avisar o cliente?",`
    <div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:14px">
      Cliente: <strong style="color:var(--text)">${v(s.empresa||s.nome)}</strong>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Como mostrar pro cliente</label>
      <input class="fi" id="cn-apelido" value="${E(d)}" placeholder="Ex: Criativo de feed dessa semana">
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
  `);const a=r=>{x(),i&&i()},e=()=>document.getElementById("cn-apelido").value.trim()||t.titulo,c=()=>document.getElementById("cn-incluir").checked;document.getElementById("cn-skip").addEventListener("click",async()=>{await g.from("tarefas").update({apelido_cliente:e(),notificar_cliente:!1}).eq("id",t.id),f("Concluída — cliente não vai ser avisado"),a()}),document.getElementById("cn-save").addEventListener("click",async()=>{const r=e(),l=c();await g.from("tarefas").update({apelido_cliente:r,notificar_cliente:l}).eq("id",t.id),f(l?"No resumão das 18h":"Concluída — sem aviso"),a()}),document.getElementById("cn-now").addEventListener("click",async()=>{const r=document.getElementById("cn-now");r.disabled=!0,r.textContent="Enviando…";try{const l=e();await g.from("tarefas").update({apelido_cliente:l,notificar_cliente:!0}).eq("id",t.id);const p=j.find(u=>u.id===t.projeto_id),b=p&&p.jid_grupo||s.whatsapp;await F("digest-cliente",{bloco_id:b,apelidos:{[t.id]:l}}),f(`Enviado pra ${s.empresa||s.nome} ✓`),a()}catch(l){r.disabled=!1,r.textContent="Avisar agora",f("Erro ao enviar: "+l.message,"err")}})}function O(t={}){const i=!t.id,n=j.find(e=>e.id===(t.projeto_id||h)),o=D(n),s=o.map(e=>`<option value="${e.k}"${(t.status||o[0].k)===e.k?" selected":""}>${v(e.l)}</option>`).join(""),d=H.map(e=>`<option value="${e.k}"${(t.prioridade||"media")===e.k?" selected":""}>${e.l}</option>`).join(""),a=i?[]:B.filter(e=>e.tarefa_id===t.id);z(i?"Nova tarefa":"Editar tarefa",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Título *</label>
      <input class="fi" id="tr-titulo" value="${E(t.titulo||"")}" placeholder="O que precisa ser feito?"></div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Descrição</label>
      <textarea class="fta" id="tr-desc" rows="3" placeholder="Detalhes, contexto, links...">${v(t.descricao||"")}</textarea></div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg"><label class="fl">Etapa</label><select class="fsl" id="tr-status">${s}</select></div>
      <div class="fg"><label class="fl">Prioridade</label><select class="fsl" id="tr-prio">${d}</select></div>
    </div>
    <div class="fg" style="margin-bottom:11px"><label class="fl">Prazo</label>
      <input class="fi" type="date" id="tr-prazo" value="${t.prazo||""}"></div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Como mostrar pro cliente <span style="color:var(--text-3);font-weight:400">(opcional)</span></label>
      <input class="fi" id="tr-apelido" value="${E(t.apelido_cliente||"")}" placeholder="Se vazio, usa o título da tarefa">
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
      <div id="tr-subs" class="pj-subs">${a.map(e=>Q(e.id,e.texto,e.feito)).join("")}</div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input class="fi" id="tr-sub-new" placeholder="+ adicionar item" style="flex:1">
        <button class="btn bg bsm" id="tr-sub-add">Add</button>
      </div>
    </div>
  `,`
    ${i?"":'<button class="btn bd" id="tr-del">Excluir</button>'}
    <button class="btn bg" id="tr-cancel">Cancelar</button>
    <button class="btn bp" id="tr-save">${i?"Criar":"Salvar"}</button>
  `),document.getElementById("tr-sub-add").addEventListener("click",()=>{const e=document.getElementById("tr-sub-new"),c=e.value.trim();if(!c)return;const r="new-"+Math.random().toString(36).slice(2);document.getElementById("tr-subs").insertAdjacentHTML("beforeend",Q(r,c,!1)),e.value="",e.focus()}),document.getElementById("tr-sub-new").addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),document.getElementById("tr-sub-add").click())}),document.getElementById("tr-subs").addEventListener("click",e=>{const c=e.target.closest(".pj-sub-del");c&&c.closest(".pj-sub-row").remove()}),document.getElementById("tr-cancel").addEventListener("click",x),i||document.getElementById("tr-del").addEventListener("click",async()=>{confirm(`Excluir "${t.titulo}"?`)&&(await tt(t.id),x())}),document.getElementById("tr-save").addEventListener("click",async()=>{const e={projeto_id:t.projeto_id||h,titulo:document.getElementById("tr-titulo").value.trim(),descricao:document.getElementById("tr-desc").value.trim()||null,status:document.getElementById("tr-status").value,prioridade:document.getElementById("tr-prio").value,prazo:document.getElementById("tr-prazo").value||null,apelido_cliente:document.getElementById("tr-apelido").value.trim()||null,notificar_cliente:document.getElementById("tr-notif").checked,atualizado_em:new Date().toISOString()};if(!e.titulo)return f("Título é obrigatório","err");let c=t.id;if(i){const{data:u,error:m}=await g.from("tarefas").insert(e).select().single();if(m)return f("Erro: "+m.message,"err");c=u.id}else{const{error:u}=await g.from("tarefas").update(e).eq("id",c);if(u)return f("Erro: "+u.message,"err")}const r=[...document.querySelectorAll(".pj-sub-row")],l=i?[]:B.filter(u=>u.tarefa_id===c),p=new Set;let b=0;for(const u of r){const m=u.dataset.sid,y=u.querySelector(".pj-sub-text").value.trim(),k=u.querySelector(".pj-sub-cb").checked;y&&(m.startsWith("new-")?await g.from("tarefa_subtasks").insert({tarefa_id:c,texto:y,feito:k,ordem:b++}):(p.add(m),await g.from("tarefa_subtasks").update({texto:y,feito:k,ordem:b++}).eq("id",m)))}for(const u of l)p.has(u.id)||await g.from("tarefa_subtasks").delete().eq("id",u.id);x(),f(i?"Tarefa criada":"Tarefa salva"),_()})}function Q(t,i,n){return`<div class="pj-sub-row" data-sid="${t}">
    <input type="checkbox" class="pj-sub-cb" ${n?"checked":""}>
    <input type="text" class="pj-sub-text fi" value="${E(i)}" style="flex:1">
    <button class="pj-sub-del" type="button" title="Remover">×</button>
  </div>`}async function tt(t){const{error:i}=await g.from("tarefas").delete().eq("id",t);if(i)return f("Erro: "+i.message,"err");f("Tarefa excluída"),_()}function C(t={}){const i=!t.id,n='<option value="">— sem cliente —</option>'+et(t.cliente_id).map(r=>`<option value="${r.id}"${t.cliente_id===r.id?" selected":""}>${v(r.empresa||r.nome)}</option>`).join(""),o='<option value="">— escolha um projeto —</option>'+j.map(r=>`<option value="${r.id}"${t.projeto_id===r.id?" selected":""}>${v(r.nome)}</option>`).join(""),s=t.cadencia||"semanal",d=t.dias_semana||[1],a=Array.isArray(t.tarefas)?JSON.parse(JSON.stringify(t.tarefas)):[],e=U.map(r=>`<label class="pj-dia-chip ${d.includes(r.k)?"on":""}" data-d="${r.k}"><input type="checkbox" ${d.includes(r.k)?"checked":""} style="display:none">${r.l}</label>`).join("");z(i?"Nova rotina":"Editar rotina",`
    <div class="fg" style="margin-bottom:11px"><label class="fl">Nome *</label>
      <input class="fi" id="rt-nome" value="${E(t.nome||"")}" placeholder="Ex: Rotina semanal Adriane"></div>
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
  `);const c=()=>{document.getElementById("rt-tars").innerHTML=a.map((r,l)=>{const p=r.notificar_cliente!==!1;return`
      <div class="pj-rot-tar-row" data-i="${l}" style="flex-direction:column;align-items:stretch;gap:6px;padding:10px;border:1px solid var(--line);border-radius:var(--rs);margin-bottom:6px">
        <div style="display:flex;gap:6px;align-items:center">
          <input type="text" class="fi rt-t-titulo" data-i="${l}" value="${E(r.titulo||"")}" placeholder="Título interno" style="flex:2;padding:6px 9px;font-size:12.5px">
          <select class="fsl rt-t-prio" data-i="${l}" style="flex:1;padding:6px 9px;font-size:12.5px">
            ${H.map(b=>`<option value="${b.k}"${(r.prioridade||"media")===b.k?" selected":""}>${b.l}</option>`).join("")}
          </select>
          <button class="pj-sub-del" type="button" data-i="${l}">×</button>
        </div>
        <input type="text" class="fi rt-t-apelido" data-i="${l}" value="${E(r.apelido_cliente||"")}" placeholder="Como mostrar pro cliente (opcional)" style="padding:6px 9px;font-size:12.5px">
        <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-3);cursor:pointer">
          <input type="checkbox" class="rt-t-notif" data-i="${l}" ${p?"checked":""}>
          <span>Incluir no resumão pro cliente</span>
        </label>
      </div>`}).join("")};c(),document.getElementById("rt-tar-add").addEventListener("click",()=>{a.push({titulo:"",prioridade:"media",apelido_cliente:"",notificar_cliente:!0}),c()}),document.getElementById("rt-tars").addEventListener("click",r=>{const l=r.target.closest(".pj-sub-del");l&&(a.splice(+l.dataset.i,1),c())}),document.getElementById("rt-tars").addEventListener("input",r=>{const l=r.target.closest(".rt-t-titulo"),p=r.target.closest(".rt-t-prio"),b=r.target.closest(".rt-t-apelido");l&&(a[+l.dataset.i].titulo=l.value),p&&(a[+p.dataset.i].prioridade=p.value),b&&(a[+b.dataset.i].apelido_cliente=b.value)}),document.getElementById("rt-tars").addEventListener("change",r=>{const l=r.target.closest(".rt-t-notif");l&&(a[+l.dataset.i].notificar_cliente=l.checked)}),document.querySelectorAll('input[name="rt-cad"]').forEach(r=>r.addEventListener("change",()=>{document.querySelectorAll(".pj-cad-opt").forEach(p=>p.classList.toggle("on",p.querySelector("input").checked));const l=document.querySelector('input[name="rt-cad"]:checked').value;document.getElementById("rt-dias-wrap").style.display=l==="semanal"?"":"none",document.getElementById("rt-mes-wrap").style.display=l==="mensal"?"":"none"})),document.getElementById("rt-dias").addEventListener("click",r=>{const l=r.target.closest(".pj-dia-chip");l&&(r.preventDefault(),l.classList.toggle("on"),l.querySelector("input").checked=l.classList.contains("on"))}),document.getElementById("rt-cancel").addEventListener("click",x),i||document.getElementById("rt-del").addEventListener("click",async()=>{confirm(`Excluir rotina "${t.nome}"?`)&&(await g.from("rotinas").delete().eq("id",t.id),x(),f("Rotina excluída"),_())}),document.getElementById("rt-save").addEventListener("click",async()=>{const r=document.querySelector('input[name="rt-cad"]:checked').value,l=[...document.querySelectorAll("#rt-dias .pj-dia-chip.on")].map(m=>+m.dataset.d),p={nome:document.getElementById("rt-nome").value.trim(),cliente_id:document.getElementById("rt-cli").value||null,projeto_id:document.getElementById("rt-proj").value||null,cadencia:r,dias_semana:r==="semanal"?l:[],dia_mes:r==="mensal"?+document.getElementById("rt-dia-mes").value||1:null,tarefas:a.filter(m=>(m.titulo||"").trim()),atualizado_em:new Date().toISOString()};if(!p.nome)return f("Nome é obrigatório","err");if(!p.projeto_id)return f("Selecione um projeto","err");if(r==="semanal"&&!p.dias_semana.length)return f("Marque pelo menos 1 dia","err");if(!p.tarefas.length)return f("Adicione pelo menos 1 tarefa","err");const b=t.id?g.from("rotinas").update(p).eq("id",t.id):g.from("rotinas").insert({...p,ativa:!0}),{error:u}=await b;if(u)return f("Erro: "+u.message,"err");x(),f(t.id?"Rotina salva":"Rotina criada"),_()})}function mt(t,i){const n=i.toISOString().slice(0,10);return t.ultima_geracao===n?!1:t.cadencia==="diaria"?!0:t.cadencia==="semanal"?(t.dias_semana||[]).includes(i.getDay()):t.cadencia==="mensal"?i.getDate()===(t.dia_mes||1):!1}async function ft(){var n;const t=new Date,i=t.toISOString().slice(0,10);for(const o of w){if(!o.ativa||!o.projeto_id||!mt(o,t))continue;const s=j.find(e=>e.id===o.projeto_id),d=((n=D(s)[0])==null?void 0:n.k)||"todo",a=(o.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:o.projeto_id,rotina_id:o.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${o.nome}"]`,prioridade:e.prioridade||"media",status:d,prazo:i,apelido_cliente:(e.apelido_cliente||"").trim()||null,notificar_cliente:e.notificar_cliente!==!1}));a.length&&(await g.from("tarefas").insert(a),await g.from("rotinas").update({ultima_geracao:i}).eq("id",o.id))}}async function vt(t){var a;if(!t.projeto_id){f("Rotina sem projeto","err");return}const i=j.find(e=>e.id===t.projeto_id),n=((a=D(i)[0])==null?void 0:a.k)||"todo",o=new Date().toISOString().slice(0,10),{count:s}=await g.from("tarefas").select("id",{count:"exact",head:!0}).eq("rotina_id",t.id).eq("prazo",o);if((s||0)>0&&!confirm(`Essa rotina já rodou hoje (${s} tarefa${s===1?"":"s"} já gerada${s===1?"":"s"}). Rodar de novo vai duplicar. Continuar mesmo assim?`)){f("Cancelado.","er");return}const d=(t.tarefas||[]).filter(e=>(e.titulo||"").trim()).map(e=>({projeto_id:t.projeto_id,rotina_id:t.id,titulo:e.titulo,descricao:e.descricao||`[Gerada pela rotina "${t.nome}" — manual]`,prioridade:e.prioridade||"media",status:n,prazo:o,apelido_cliente:(e.apelido_cliente||"").trim()||null,notificar_cliente:e.notificar_cliente!==!1}));if(!d.length){f("Rotina sem tarefas","err");return}await g.from("tarefas").insert(d),await g.from("rotinas").update({ultima_geracao:o}).eq("id",t.id)}function et(t){const i=new Set(["proposta","ativo","em_pausa","fechado"]);return S.filter(n=>i.has(n.status)||n.id===t)}function v(t){return String(t??"").replace(/[&<>"']/g,i=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[i])}function E(t){return v(t)}export{_ as render};
