import{s as T,o as N,f as A,t as y,d as C}from"./index-D1sIpxRd.js";const M=[{v:"",l:"— Sem local —",icon:""},{v:"google_meet",l:"Google Meet",icon:"🎥"},{v:"whatsapp",l:"WhatsApp",icon:"💬"},{v:"telefone",l:"Telefone",icon:"📞"},{v:"presencial",l:"Presencial",icon:"🏢"},{v:"outro",l:"Outro",icon:"📍"}],V=Object.fromEntries(M.map(e=>[e.v,e.l])),G=Object.fromEntries(M.map(e=>[e.v,e.icon])),I=[{v:"agendado",l:"Agendado",cor:"var(--accent)"},{v:"realizado",l:"Realizado",cor:"var(--ok)"},{v:"cancelado",l:"Cancelado",cor:"var(--text-3)"}],W=Object.fromEntries(I.map(e=>[e.v,e.l])),P=Object.fromEntries(I.map(e=>[e.v,e.cor])),Z=["domingo","segunda","terça","quarta","quinta","sexta","sábado"],K=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],X=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],ee=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];let w=[],B=[],L="pendente",j="",z="lista",u=null;function d(e){return String(e??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function _(){return new Date().toLocaleDateString("en-CA",{timeZone:"America/Sao_Paulo"})}function te(e){if(!e)return"";const[a,n,l]=e.split("-").map(Number),r=new Date(a,n-1,l);return`${Z[r.getDay()]}, ${String(l).padStart(2,"0")} ${X[n-1]}`}function k(e){return e?String(e).slice(0,5):""}async function H(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-ev">+ Novo evento</button>',document.getElementById("btn-add-ev").addEventListener("click",()=>F());const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const[a,n]=await Promise.all([T("agenda",{order:{column:"data",ascending:!0}}),T("clientes",{columns:"id, nome, empresa",order:{column:"nome",ascending:!0}})]);if(a.error){e.innerHTML=`<div class="empty">Erro: ${a.error.message}<br><br>Rode <code>supabase/agenda.sql</code> no SQL Editor primeiro.</div>`;return}if(w=a.data||[],B=n.data||[],!u){const l=_().split("-").map(Number);u=new Date(l[0],l[1]-1,1)}b()}function b(){let e=w;if(L==="pendente"?e=e.filter(t=>t.status==="agendado"):L!=="todos"&&(e=e.filter(t=>t.status===L)),j){const t=j.toLowerCase();e=e.filter(i=>(i.titulo||"").toLowerCase().includes(t)||(i.cliente_nome||"").toLowerCase().includes(t)||(i.descricao||"").toLowerCase().includes(t))}const a=_(),n=new Date(a+"T00:00:00"),l=new Date(n);l.setDate(n.getDate()+1);const r=new Date(n);r.setDate(n.getDate()+7);const o=l.toLocaleDateString("en-CA"),f=r.toLocaleDateString("en-CA"),s={hoje:[],amanha:[],semana:[],futuro:[],passado:[]};for(const t of e){const i=String(t.data||"").slice(0,10);if(i)i<a?s.passado.push(t):i===a?s.hoje.push(t):i===o?s.amanha.push(t):i<=f?s.semana.push(t):s.futuro.push(t);else continue}for(const t of Object.keys(s))s[t].sort((i,g)=>(i.data+(i.hora_inicio||"99:99")).localeCompare(g.data+(g.hora_inicio||"99:99")));s.passado.reverse();const p={pendente:w.filter(t=>t.status==="agendado").length,realizado:w.filter(t=>t.status==="realizado").length,cancelado:w.filter(t=>t.status==="cancelado").length},v=[{k:"pendente",l:`Pendentes (${p.pendente})`},{k:"realizado",l:`Realizados (${p.realizado})`},{k:"cancelado",l:`Cancelados (${p.cancelado})`},{k:"todos",l:"Todos"}].map(t=>`<div class="fc${L===t.k?" on":""}" data-fil="${t.k}">${t.l}</div>`).join(""),E=z==="mes"?ae(e):`<div id="ag-lista" style="padding:8px 0 12px">
         ${D("Hoje",s.hoje,"var(--accent)")}
         ${D("Amanhã",s.amanha,"var(--ok)")}
         ${D("Próximos dias",s.semana,"var(--text-2)")}
         ${D("Mais à frente",s.futuro,"var(--text-3)")}
         ${D("Passados",s.passado,"var(--text-3)",!0)}
         ${e.length===0?'<div class="empty" style="padding:40px 20px">Nada agendado por aqui. Clique em "+ Novo evento" pra começar.</div>':""}
       </div>`,c=document.getElementById("content");c.innerHTML=`
    <div class="tw">
      <div class="th" style="flex-wrap:wrap;gap:10px">
        <h3>Agenda</h3>
        <div style="display:flex;gap:6px">
          <button class="btn ${z==="lista"?"bp":"bg"} bsm" data-view="lista">Lista</button>
          <button class="btn ${z==="mes"?"bp":"bg"} bsm" data-view="mes">Calendário</button>
        </div>
        <input class="si" id="ag-search" placeholder="Buscar por título, cliente ou nota..." value="${d(j)}">
      </div>
      <div class="fr" id="ag-filters">${v}</div>
      ${E}
    </div>`,document.getElementById("ag-search").addEventListener("input",t=>{j=t.target.value,b()}),document.getElementById("ag-filters").addEventListener("click",t=>{const i=t.target.closest(".fc");i&&(L=i.dataset.fil,b())}),c.querySelectorAll("[data-view]").forEach(t=>t.addEventListener("click",()=>{z=t.dataset.view,b()})),c.querySelectorAll(".ev-card").forEach(t=>t.addEventListener("click",()=>q(t.dataset.id)));const m=document.getElementById("cal-prev"),h=document.getElementById("cal-next"),$=document.getElementById("cal-hoje");m&&m.addEventListener("click",()=>{u=new Date(u.getFullYear(),u.getMonth()-1,1),b()}),h&&h.addEventListener("click",()=>{u=new Date(u.getFullYear(),u.getMonth()+1,1),b()}),$&&$.addEventListener("click",()=>{const t=_().split("-").map(Number);u=new Date(t[0],t[1]-1,1),b()}),c.querySelectorAll(".cal-chip").forEach(t=>t.addEventListener("click",i=>{i.stopPropagation(),q(t.dataset.id)})),c.querySelectorAll(".cal-cell[data-data]").forEach(t=>t.addEventListener("click",()=>F(t.dataset.data)))}function ae(e){const a=u.getFullYear(),n=u.getMonth(),l=_(),r={};for(const c of e){const m=String(c.data||"").slice(0,10);m&&(r[m]||(r[m]=[]),r[m].push(c))}const o=new Date(a,n,1),f=new Date(a,n+1,0).getDate(),s=o.getDay(),p=Math.ceil((s+f)/7)*7,v=[];for(let c=0;c<p;c++){const m=c-s,h=new Date(a,n,m+1),$=ne(h),t=h.getMonth()===n,i=$===l,g=(r[$]||[]).sort((x,S)=>(x.hora_inicio||"99:99").localeCompare(S.hora_inicio||"99:99")),J=g.slice(0,3).map(x=>{const S=P[x.status]||"var(--accent)",O=k(x.hora_inicio),U=(O?O+" ":"")+(x.titulo||"");return`<div class="cal-chip" data-id="${x.id}" style="background:${S}22;color:${S};border-left:2px solid ${S};padding:2px 5px;border-radius:3px;font-size:10px;line-height:1.3;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" title="${d(x.titulo)}">${d(U)}</div>`}).join(""),Q=g.length>3?`<div style="font-size:9px;color:var(--text-3);padding:0 5px">+${g.length-3} mais</div>`:"";v.push(`
      <div class="cal-cell" ${t?`data-data="${$}"`:""} style="
        background:${i?"rgba(193,255,42,.08)":"var(--bg-card)"};
        min-height:96px;padding:5px 5px 4px;cursor:${t?"pointer":"default"};
        ${i?"box-shadow:inset 2px 0 0 var(--accent);":""}
        ${t?"":"opacity:.32;"}
        display:flex;flex-direction:column;gap:2px;overflow:hidden;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:${i?"var(--accent)":"var(--text-3)"};font-weight:${i?"700":"500"};margin-bottom:3px">
          <span>${h.getDate()}</span>
          ${g.length?`<span style="font-size:9px;color:var(--text-3)">${g.length}</span>`:""}
        </div>
        ${J}${Q}
      </div>`)}const E=K.map(c=>`<div style="background:var(--bg-card);padding:8px 5px;font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;text-align:center;font-weight:600">${c}</div>`).join("");return`
    <div style="padding:14px 18px 6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <h3 style="margin:0;font-size:16px">${ee[n]} ${a}</h3>
      <div style="display:flex;gap:4px;margin-left:auto">
        <button class="btn bg bsm" id="cal-hoje">Hoje</button>
        <button class="btn bg bsm" id="cal-prev" style="padding:4px 10px">‹</button>
        <button class="btn bg bsm" id="cal-next" style="padding:4px 10px">›</button>
      </div>
    </div>
    <div style="padding:0 14px 16px">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:6px;overflow:hidden">
        ${E}
        ${v.join("")}
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:8px">Clique numa célula vazia pra criar um evento naquela data, ou num evento pra editar.</div>
    </div>`}function ne(e){const a=n=>String(n).padStart(2,"0");return`${e.getFullYear()}-${a(e.getMonth()+1)}-${a(e.getDate())}`}function D(e,a,n,l=!1){return a.length?`
    <div style="margin:14px 0 8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 18px;font-size:11px;font-weight:600;color:${n};text-transform:uppercase;letter-spacing:.1em">
        <span>${e}</span>
        <span style="font-weight:400;opacity:.5">· ${a.length}</span>
        <span style="flex:1;height:1px;background:var(--line);margin-left:4px"></span>
      </div>
      ${a.map(r=>oe(r,l)).join("")}
    </div>`:""}function oe(e,a=!1){const n=k(e.hora_inicio),l=k(e.hora_fim),r=n&&l?`${n} – ${l}`:n||(a?"":"— sem hora —"),o=G[e.local]||"",f=te(String(e.data).slice(0,10)),s=e.cliente_nome?`<span style="color:var(--text-2);font-size:12px"> · com ${d(e.cliente_nome)}</span>`:"",p=P[e.status]||"var(--text-3)",v=e.status&&e.status!=="agendado"?`<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${p}22;color:${p};text-transform:uppercase;letter-spacing:.06em;flex-shrink:0">${W[e.status]}</span>`:"";return`
    <div class="ev-card" data-id="${e.id}" style="margin:0 12px 6px;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--bg-card);cursor:pointer;display:flex;gap:14px;align-items:flex-start;${a?"opacity:.55":""}">
      <div style="min-width:62px;font-size:11px;color:var(--text-3);line-height:1.4">
        <div style="color:var(--text-2);font-weight:600">${r||"—"}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-top:1px">${f}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:500;color:var(--text)">
          ${o?`<span style="font-size:14px">${o}</span>`:""}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d(e.titulo)}</span>
          ${v}
        </div>
        ${e.cliente_nome||e.local?`<div style="font-size:11px;color:var(--text-3);margin-top:2px">${e.local?d(V[e.local]||e.local):""}${s}</div>`:""}
        ${e.descricao?`<div style="font-size:12px;color:var(--text-2);margin-top:5px;line-height:1.45">${d(e.descricao)}</div>`:""}
      </div>
    </div>`}function R(e={}){const a=e.data||_(),n=I.map(o=>`<option value="${o.v}"${(e.status||"agendado")===o.v?" selected":""}>${o.l}</option>`).join(""),l=M.map(o=>`<option value="${o.v}"${(e.local||"")===o.v?" selected":""}>${o.icon} ${o.l}</option>`).join(""),r=B.map(o=>`<option value="${d(o.nome)}${o.empresa?" · "+d(o.empresa):""}"></option>`).join("");return`
    <div class="fg"><label class="fl">Título *</label>
      <input class="fi" id="ev-titulo" value="${d(e.titulo)}" placeholder="Ex: Conversa com Pedro sobre marmoraria">
    </div>

    <div class="fg"><label class="fl">Cliente (opcional)</label>
      <input class="fi" id="ev-cliente" value="${d(e.cliente_nome)}" placeholder="Digite ou escolha da lista..." list="ev-clientes-list" autocomplete="off">
      <datalist id="ev-clientes-list">${r}</datalist>
      <span style="font-size:11px;color:var(--text-3);margin-top:4px">Se for um cliente já cadastrado, escolha pra linkar.</span>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Data *</label><input class="fi" id="ev-data" type="date" value="${a}"></div>
      <div class="fg"><label class="fl">Hora início</label><input class="fi" id="ev-hi" type="time" value="${k(e.hora_inicio)}"></div>
      <div class="fg"><label class="fl">Hora fim</label><input class="fi" id="ev-hf" type="time" value="${k(e.hora_fim)}"></div>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Local</label><select class="fsl" id="ev-local">${l}</select></div>
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="ev-status">${n}</select></div>
    </div>

    <div class="fg"><label class="fl">Descrição / pauta</label>
      <textarea class="fta" id="ev-desc" placeholder="O que vão tratar, links de reunião, contexto rápido...">${d(e.descricao)}</textarea>
    </div>

    <div class="fg"><label class="fl">Notas internas</label>
      <textarea class="fta" id="ev-notas">${d(e.notas)}</textarea>
    </div>`}function F(e){N("Novo evento",R(e?{data:e}:{}),`<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bp" id="ev-save">Salvar</button>`),document.getElementById("ev-cancel").addEventListener("click",A),document.getElementById("ev-save").addEventListener("click",()=>Y())}function q(e){const a=w.find(n=>n.id===e);a&&(N("Editar evento",R(a),`<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bd" id="ev-del">Remover</button>
     <button class="btn bp" id="ev-save">Salvar</button>`),document.getElementById("ev-cancel").addEventListener("click",A),document.getElementById("ev-del").addEventListener("click",()=>se(e)),document.getElementById("ev-save").addEventListener("click",()=>Y(e)))}function ie(){const e=p=>document.getElementById(p).value,a=e("ev-titulo").trim(),n=e("ev-data"),l=e("ev-hi")||null,r=e("ev-hf")||null,o=e("ev-cliente").trim();let f=null,s=o||null;if(o){const p=o.split("·")[0].trim().toLowerCase(),v=B.find(E=>(E.nome||"").toLowerCase()===p);v&&(f=v.id,s=v.nome)}return{titulo:a,data:n,hora_inicio:l,hora_fim:r,cliente_id:f,cliente_nome:s,local:e("ev-local")||null,status:e("ev-status"),descricao:e("ev-desc").trim()||null,notas:e("ev-notas").trim()||null,atualizado_em:new Date().toISOString()}}async function Y(e){const a=ie();if(!a.titulo){y("Título obrigatório.","er");return}if(!a.data){y("Data obrigatória.","er");return}const{error:n}=e?await C.from("agenda").update(a).eq("id",e):await C.from("agenda").insert(a);if(n){y("Erro: "+n.message,"er");return}y(e?"Evento atualizado.":"Evento criado."),A(),H()}async function se(e){if(!confirm("Remover este evento?"))return;const{error:a}=await C.from("agenda").delete().eq("id",e);if(a){y("Erro ao remover: "+a.message,"er");return}y("Removido."),A(),H()}export{H as render};
