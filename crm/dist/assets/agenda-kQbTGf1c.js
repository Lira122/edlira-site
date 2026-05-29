import{s as k,o as C,f as $,t as v,d as y}from"./index-my2fy3xs.js";const S=[{v:"",l:"— Sem local —",icon:""},{v:"google_meet",l:"Google Meet",icon:"🎥"},{v:"whatsapp",l:"WhatsApp",icon:"💬"},{v:"telefone",l:"Telefone",icon:"📞"},{v:"presencial",l:"Presencial",icon:"🏢"},{v:"outro",l:"Outro",icon:"📍"}],B=Object.fromEntries(S.map(e=>[e.v,e.l])),I=Object.fromEntries(S.map(e=>[e.v,e.icon])),L=[{v:"agendado",l:"Agendado",cor:"var(--accent)"},{v:"realizado",l:"Realizado",cor:"var(--ok)"},{v:"cancelado",l:"Cancelado",cor:"var(--text-3)"}],O=Object.fromEntries(L.map(e=>[e.v,e.l])),T=Object.fromEntries(L.map(e=>[e.v,e.cor])),q=["domingo","segunda","terça","quarta","quinta","sexta","sábado"],P=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];let f=[],w=[],m="pendente",b="";function c(e){return String(e??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function A(){return new Date().toLocaleDateString("en-CA",{timeZone:"America/Sao_Paulo"})}function M(e){if(!e)return"";const[a,n,i]=e.split("-").map(Number),r=new Date(a,n-1,i);return`${q[r.getDay()]}, ${String(i).padStart(2,"0")} ${P[n-1]}`}function x(e){return e?String(e).slice(0,5):""}async function D(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-ev">+ Novo evento</button>',document.getElementById("btn-add-ev").addEventListener("click",()=>R());const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const[a,n]=await Promise.all([k("agenda",{order:{column:"data",ascending:!0}}),k("clientes",{columns:"id, nome, empresa",order:{column:"nome",ascending:!0}})]);if(a.error){e.innerHTML=`<div class="empty">Erro: ${a.error.message}<br><br>Rode <code>supabase/agenda.sql</code> no SQL Editor primeiro.</div>`;return}f=a.data||[],w=n.data||[],E()}function E(){let e=f;if(m==="pendente"?e=e.filter(t=>t.status==="agendado"):m!=="todos"&&(e=e.filter(t=>t.status===m)),b){const t=b.toLowerCase();e=e.filter(l=>(l.titulo||"").toLowerCase().includes(t)||(l.cliente_nome||"").toLowerCase().includes(t)||(l.descricao||"").toLowerCase().includes(t))}const a=A(),n=new Date(a+"T00:00:00"),i=new Date(n);i.setDate(n.getDate()+1);const r=new Date(n);r.setDate(n.getDate()+7);const o=i.toLocaleDateString("en-CA"),u=r.toLocaleDateString("en-CA"),s={hoje:[],amanha:[],semana:[],futuro:[],passado:[]};for(const t of e){const l=String(t.data||"").slice(0,10);if(l)l<a?s.passado.push(t):l===a?s.hoje.push(t):l===o?s.amanha.push(t):l<=u?s.semana.push(t):s.futuro.push(t);else continue}for(const t of Object.keys(s))s[t].sort((l,_)=>(l.data+(l.hora_inicio||"99:99")).localeCompare(_.data+(_.hora_inicio||"99:99")));s.passado.reverse();const d={pendente:f.filter(t=>t.status==="agendado").length,realizado:f.filter(t=>t.status==="realizado").length,cancelado:f.filter(t=>t.status==="cancelado").length},p=[{k:"pendente",l:`Pendentes (${d.pendente})`},{k:"realizado",l:`Realizados (${d.realizado})`},{k:"cancelado",l:`Cancelados (${d.cancelado})`},{k:"todos",l:"Todos"}].map(t=>`<div class="fc${m===t.k?" on":""}" data-fil="${t.k}">${t.l}</div>`).join(""),h=document.getElementById("content");h.innerHTML=`
    <div class="tw">
      <div class="th" style="flex-wrap:wrap;gap:10px">
        <h3>Agenda</h3>
        <input class="si" id="ag-search" placeholder="Buscar por título, cliente ou nota..." value="${c(b)}">
      </div>
      <div class="fr" id="ag-filters">${p}</div>

      <div id="ag-lista" style="padding:8px 0 12px">
        ${g("Hoje",s.hoje,"var(--accent)")}
        ${g("Amanhã",s.amanha,"var(--ok)")}
        ${g("Próximos dias",s.semana,"var(--text-2)")}
        ${g("Mais à frente",s.futuro,"var(--text-3)")}
        ${g("Passados",s.passado,"var(--text-3)",!0)}
        ${e.length===0?'<div class="empty" style="padding:40px 20px">Nada agendado por aqui. Clique em "+ Novo evento" pra começar.</div>':""}
      </div>
    </div>`,document.getElementById("ag-search").addEventListener("input",t=>{b=t.target.value,E()}),document.getElementById("ag-filters").addEventListener("click",t=>{const l=t.target.closest(".fc");l&&(m=l.dataset.fil,E())}),h.querySelectorAll(".ev-card").forEach(t=>t.addEventListener("click",()=>H(t.dataset.id)))}function g(e,a,n,i=!1){return a.length?`
    <div style="margin:14px 0 8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 18px;font-size:11px;font-weight:600;color:${n};text-transform:uppercase;letter-spacing:.1em">
        <span>${e}</span>
        <span style="font-weight:400;opacity:.5">· ${a.length}</span>
        <span style="flex:1;height:1px;background:var(--line);margin-left:4px"></span>
      </div>
      ${a.map(r=>N(r,i)).join("")}
    </div>`:""}function N(e,a=!1){const n=x(e.hora_inicio),i=x(e.hora_fim),r=n&&i?`${n} – ${i}`:n||(a?"":"— sem hora —"),o=I[e.local]||"",u=M(String(e.data).slice(0,10)),s=e.cliente_nome?`<span style="color:var(--text-2);font-size:12px"> · com ${c(e.cliente_nome)}</span>`:"",d=T[e.status]||"var(--text-3)",p=e.status&&e.status!=="agendado"?`<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${d}22;color:${d};text-transform:uppercase;letter-spacing:.06em;flex-shrink:0">${O[e.status]}</span>`:"";return`
    <div class="ev-card" data-id="${e.id}" style="margin:0 12px 6px;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--bg-card);cursor:pointer;display:flex;gap:14px;align-items:flex-start;${a?"opacity:.55":""}">
      <div style="min-width:62px;font-size:11px;color:var(--text-3);line-height:1.4">
        <div style="color:var(--text-2);font-weight:600">${r||"—"}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-top:1px">${u}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:500;color:var(--text)">
          ${o?`<span style="font-size:14px">${o}</span>`:""}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c(e.titulo)}</span>
          ${p}
        </div>
        ${e.cliente_nome||e.local?`<div style="font-size:11px;color:var(--text-3);margin-top:2px">${e.local?c(B[e.local]||e.local):""}${s}</div>`:""}
        ${e.descricao?`<div style="font-size:12px;color:var(--text-2);margin-top:5px;line-height:1.45">${c(e.descricao)}</div>`:""}
      </div>
    </div>`}function j(e={}){const a=e.data||A(),n=L.map(o=>`<option value="${o.v}"${(e.status||"agendado")===o.v?" selected":""}>${o.l}</option>`).join(""),i=S.map(o=>`<option value="${o.v}"${(e.local||"")===o.v?" selected":""}>${o.icon} ${o.l}</option>`).join(""),r=w.map(o=>`<option value="${c(o.nome)}${o.empresa?" · "+c(o.empresa):""}"></option>`).join("");return`
    <div class="fg"><label class="fl">Título *</label>
      <input class="fi" id="ev-titulo" value="${c(e.titulo)}" placeholder="Ex: Conversa com Pedro sobre marmoraria">
    </div>

    <div class="fg"><label class="fl">Cliente (opcional)</label>
      <input class="fi" id="ev-cliente" value="${c(e.cliente_nome)}" placeholder="Digite ou escolha da lista..." list="ev-clientes-list" autocomplete="off">
      <datalist id="ev-clientes-list">${r}</datalist>
      <span style="font-size:11px;color:var(--text-3);margin-top:4px">Se for um cliente já cadastrado, escolha pra linkar.</span>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Data *</label><input class="fi" id="ev-data" type="date" value="${a}"></div>
      <div class="fg"><label class="fl">Hora início</label><input class="fi" id="ev-hi" type="time" value="${x(e.hora_inicio)}"></div>
      <div class="fg"><label class="fl">Hora fim</label><input class="fi" id="ev-hf" type="time" value="${x(e.hora_fim)}"></div>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Local</label><select class="fsl" id="ev-local">${i}</select></div>
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="ev-status">${n}</select></div>
    </div>

    <div class="fg"><label class="fl">Descrição / pauta</label>
      <textarea class="fta" id="ev-desc" placeholder="O que vão tratar, links de reunião, contexto rápido...">${c(e.descricao)}</textarea>
    </div>

    <div class="fg"><label class="fl">Notas internas</label>
      <textarea class="fta" id="ev-notas">${c(e.notas)}</textarea>
    </div>`}function R(){C("Novo evento",j(),`<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bp" id="ev-save">Salvar</button>`),document.getElementById("ev-cancel").addEventListener("click",$),document.getElementById("ev-save").addEventListener("click",()=>z())}function H(e){const a=f.find(n=>n.id===e);a&&(C("Editar evento",j(a),`<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bd" id="ev-del">Remover</button>
     <button class="btn bp" id="ev-save">Salvar</button>`),document.getElementById("ev-cancel").addEventListener("click",$),document.getElementById("ev-del").addEventListener("click",()=>U(e)),document.getElementById("ev-save").addEventListener("click",()=>z(e)))}function F(){const e=d=>document.getElementById(d).value,a=e("ev-titulo").trim(),n=e("ev-data"),i=e("ev-hi")||null,r=e("ev-hf")||null,o=e("ev-cliente").trim();let u=null,s=o||null;if(o){const d=o.split("·")[0].trim().toLowerCase(),p=w.find(h=>(h.nome||"").toLowerCase()===d);p&&(u=p.id,s=p.nome)}return{titulo:a,data:n,hora_inicio:i,hora_fim:r,cliente_id:u,cliente_nome:s,local:e("ev-local")||null,status:e("ev-status"),descricao:e("ev-desc").trim()||null,notas:e("ev-notas").trim()||null,atualizado_em:new Date().toISOString()}}async function z(e){const a=F();if(!a.titulo){v("Título obrigatório.","er");return}if(!a.data){v("Data obrigatória.","er");return}const{error:n}=e?await y.from("agenda").update(a).eq("id",e):await y.from("agenda").insert(a);if(n){v("Erro: "+n.message,"er");return}v(e?"Evento atualizado.":"Evento criado."),$(),D()}async function U(e){if(!confirm("Remover este evento?"))return;const{error:a}=await y.from("agenda").delete().eq("id",e);if(a){v("Erro ao remover: "+a.message,"er");return}v("Removido."),$(),D()}export{D as render};
