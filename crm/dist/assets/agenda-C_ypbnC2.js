import{s as F,d as y,o as T,f as h,t as v}from"./index-BTPdxtDK.js";const N=[{v:"",l:"— Sem local —",icon:""},{v:"google_meet",l:"Google Meet",icon:"🎥"},{v:"whatsapp",l:"WhatsApp",icon:"💬"},{v:"telefone",l:"Telefone",icon:"📞"},{v:"presencial",l:"Presencial",icon:"🏢"},{v:"outro",l:"Outro",icon:"📍"}],ae=Object.fromEntries(N.map(e=>[e.v,e.l])),oe=Object.fromEntries(N.map(e=>[e.v,e.icon])),P=[{v:"agendado",l:"Agendado",cor:"var(--accent)"},{v:"realizado",l:"Realizado",cor:"var(--ok)"},{v:"cancelado",l:"Cancelado",cor:"var(--text-3)"}],ne=Object.fromEntries(P.map(e=>[e.v,e.l])),Q=Object.fromEntries(P.map(e=>[e.v,e.cor])),ie=["domingo","segunda","terça","quarta","quinta","sexta","sábado"],U=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],V=["dom","seg","ter","qua","qui","sex","sab"],se=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"],re=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],K=[{v:"academia",l:"Academia",icone:"💪",cor:"#FF6B35"},{v:"leitura",l:"Leitura",icone:"📚",cor:"#4A9EFF"},{v:"estudo",l:"Estudo",icone:"✍️",cor:"#A78BFA"},{v:"meditacao",l:"Meditação",icone:"🧘",cor:"#34D399"},{v:"sono",l:"Sono / Acordar",icone:"😴",cor:"#94A3B8"},{v:"alimentacao",l:"Alimentação",icone:"🥗",cor:"#F5A623"},{v:"trabalho",l:"Trabalho",icone:"💼",cor:"#C5F82A"},{v:"outra",l:"Outra",icone:"⭐",cor:"#22D3EE"}],S=Object.fromEntries(K.map(e=>[e.v,e]));let A=[],H=[],Y=[],_=[],k="pendente",L="",R="lista",x=null;function p(e){return String(e??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function C(){return new Date().toLocaleDateString("en-CA",{timeZone:"America/Sao_Paulo"})}function G(e){if(!e)return"";const[t,n,o]=e.split("-").map(Number),i=new Date(t,n-1,o);return`${ie[i.getDay()]}, ${String(o).padStart(2,"0")} ${se[n-1]}`}function D(e){return e?String(e).slice(0,5):""}async function O(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-ev">+ Adicionar</button>',document.getElementById("btn-add-ev").addEventListener("click",()=>xe());const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const t=new Date;t.setDate(t.getDate()-60);const n=t.toLocaleDateString("en-CA"),[o,i,s,l]=await Promise.all([F("agenda",{order:{column:"data",ascending:!0}}),F("clientes",{columns:"id, nome, empresa",order:{column:"nome",ascending:!0}}),F("agenda_rotinas",{order:{column:"criado_em",ascending:!0}}).catch(()=>({data:[],error:null})),y.from("agenda_rotinas_check").select("rotina_id, data").gte("data",n).then(d=>d,()=>({data:[],error:null}))]);if(o.error){e.innerHTML=`<div class="empty">Erro: ${o.error.message}<br><br>Rode <code>supabase/agenda.sql</code> no SQL Editor primeiro.</div>`;return}if(A=o.data||[],H=i.data||[],Y=s&&!s.error&&s.data?s.data:[],_=l&&!l.error&&l.data?l.data:[],!x){const d=C().split("-").map(Number);x=new Date(d[0],d[1]-1,1)}E()}function le(e){return V[e.getDay()]}function ce(e,t){const n=t||C(),o=new Set(_.filter(l=>l.rotina_id===e).map(l=>l.data));let i=0;const s=new Date(n+"T00:00:00");for(;o.has(s.toLocaleDateString("en-CA"));)i++,s.setDate(s.getDate()-1);return i}function de(e,t){return _.some(n=>n.rotina_id===e&&n.data===t)}function pe(e){const t=new Date(e+"T00:00:00"),n=le(t);return Y.filter(o=>o.ativa&&Array.isArray(o.dias_semana)&&o.dias_semana.includes(n)).map(o=>{const i=S[o.categoria]||S.outra;return{_isRotina:!0,id:"rot-"+o.id+"-"+e,rotina_id:o.id,titulo:o.nome,data:e,hora_inicio:o.horario||null,local:null,categoria:o.categoria,icone:o.icone||i.icone,cor:o.cor||i.cor,observacoes:o.observacoes,feito:de(o.id,e),streak:ce(o.id,e)}})}async function ue(e,t){if(_.find(o=>o.rotina_id===e&&o.data===t)){const{error:o}=await y.from("agenda_rotinas_check").delete().eq("rotina_id",e).eq("data",t);if(o){v("Erro: "+o.message,"er");return}_=_.filter(i=>!(i.rotina_id===e&&i.data===t)),v("Desmarcado.")}else{const{error:o}=await y.from("agenda_rotinas_check").insert({rotina_id:e,data:t});if(o){v("Erro: "+o.message,"er");return}_.push({rotina_id:e,data:t}),v("Feito! 🔥")}E()}function E(){let e=A;if(k==="pendente"?e=e.filter(a=>a.status==="agendado"):k!=="todos"&&(e=e.filter(a=>a.status===k)),L){const a=L.toLowerCase();e=e.filter(r=>(r.titulo||"").toLowerCase().includes(a)||(r.cliente_nome||"").toLowerCase().includes(a)||(r.descricao||"").toLowerCase().includes(a))}const t=C(),n=new Date(t+"T00:00:00"),o=new Date(n);o.setDate(n.getDate()+1);const i=new Date(n);i.setDate(n.getDate()+7);const s=o.toLocaleDateString("en-CA"),l=i.toLocaleDateString("en-CA"),d=[t,s];for(let a=2;a<=7;a++){const r=new Date(n);r.setDate(n.getDate()+a),d.push(r.toLocaleDateString("en-CA"))}const u=[];for(const a of d)u.push(...pe(a));let m=u;if(L){const a=L.toLowerCase();m=u.filter(r=>(r.titulo||"").toLowerCase().includes(a)||(r.categoria||"").toLowerCase().includes(a))}const z=k==="pendente"||k==="todos",c={hoje:[],amanha:[],semana:[],futuro:[],passado:[]};for(const a of e){const r=String(a.data||"").slice(0,10);if(r)r<t?c.passado.push(a):r===t?c.hoje.push(a):r===s?c.amanha.push(a):r<=l?c.semana.push(a):c.futuro.push(a);else continue}if(z)for(const a of m)a.data===t?c.hoje.push(a):a.data===s?c.amanha.push(a):a.data<=l&&c.semana.push(a);for(const a of Object.keys(c))c[a].sort((r,g)=>(r.data+(r.hora_inicio||"99:99")).localeCompare(g.data+(g.hora_inicio||"99:99")));c.passado.reverse();const b={pendente:A.filter(a=>a.status==="agendado").length,realizado:A.filter(a=>a.status==="realizado").length,cancelado:A.filter(a=>a.status==="cancelado").length},B=[{k:"pendente",l:`Pendentes (${b.pendente})`},{k:"realizado",l:`Realizados (${b.realizado})`},{k:"cancelado",l:`Cancelados (${b.cancelado})`},{k:"todos",l:"Todos"}].map(a=>`<div class="fc${k===a.k?" on":""}" data-fil="${a.k}">${a.l}</div>`).join(""),j=R==="mes"?ve(e):`<div id="ag-lista" style="padding:8px 0 12px">
         ${I("Hoje",c.hoje,"var(--accent)")}
         ${I("Amanhã",c.amanha,"var(--ok)")}
         ${I("Próximos dias",c.semana,"var(--text-2)")}
         ${I("Mais à frente",c.futuro,"var(--text-3)")}
         ${I("Passados",c.passado,"var(--text-3)",!0)}
         ${e.length===0?'<div class="empty" style="padding:40px 20px">Nada agendado por aqui. Clique em "+ Novo evento" pra começar.</div>':""}
       </div>`,f=document.getElementById("content");f.innerHTML=`
    <div class="tw">
      <div class="th" style="flex-wrap:wrap;gap:10px">
        <h3>Agenda</h3>
        <div style="display:flex;gap:6px">
          <button class="btn ${R==="lista"?"bp":"bg"} bsm" data-view="lista">Lista</button>
          <button class="btn ${R==="mes"?"bp":"bg"} bsm" data-view="mes">Calendário</button>
        </div>
        <input class="si" id="ag-search" placeholder="Buscar por título, cliente ou nota..." value="${p(L)}">
      </div>
      <div class="fr" id="ag-filters">${B}</div>
      ${j}
    </div>`,document.getElementById("ag-search").addEventListener("input",a=>{L=a.target.value,E()}),document.getElementById("ag-filters").addEventListener("click",a=>{const r=a.target.closest(".fc");r&&(k=r.dataset.fil,E())}),f.querySelectorAll("[data-view]").forEach(a=>a.addEventListener("click",()=>{R=a.dataset.view,E()})),f.querySelectorAll(".ev-card:not(.rot-card)").forEach(a=>a.addEventListener("click",()=>J(a.dataset.id))),f.querySelectorAll(".rot-check").forEach(a=>a.addEventListener("click",r=>{r.stopPropagation(),ue(a.dataset.rotid,a.dataset.data)})),f.querySelectorAll(".rot-edit-btn").forEach(a=>a.addEventListener("click",r=>{r.stopPropagation();const g=Y.find(M=>M.id===a.dataset.rotid);g&&X(g)}));const w=document.getElementById("cal-prev"),$=document.getElementById("cal-next"),q=document.getElementById("cal-hoje");w&&w.addEventListener("click",()=>{x=new Date(x.getFullYear(),x.getMonth()-1,1),E()}),$&&$.addEventListener("click",()=>{x=new Date(x.getFullYear(),x.getMonth()+1,1),E()}),q&&q.addEventListener("click",()=>{const a=C().split("-").map(Number);x=new Date(a[0],a[1]-1,1),E()}),f.querySelectorAll(".cal-chip").forEach(a=>a.addEventListener("click",r=>{r.stopPropagation(),J(a.dataset.id)})),f.querySelectorAll(".cal-cell[data-data]").forEach(a=>a.addEventListener("click",()=>Z(a.dataset.data)))}function ve(e){const t=x.getFullYear(),n=x.getMonth(),o=C(),i={};for(const c of e){const b=String(c.data||"").slice(0,10);b&&(i[b]||(i[b]=[]),i[b].push(c))}const s=new Date(t,n,1),l=new Date(t,n+1,0).getDate(),d=s.getDay(),u=Math.ceil((d+l)/7)*7,m=[];for(let c=0;c<u;c++){const b=c-d,B=new Date(t,n,b+1),j=me(B),f=B.getMonth()===n,w=j===o,$=(i[j]||[]).sort((r,g)=>(r.hora_inicio||"99:99").localeCompare(g.hora_inicio||"99:99")),q=$.slice(0,3).map(r=>{const g=Q[r.status]||"var(--accent)",M=D(r.hora_inicio),te=(M?M+" ":"")+(r.titulo||"");return`<div class="cal-chip" data-id="${r.id}" style="background:${g}22;color:${g};border-left:2px solid ${g};padding:2px 5px;border-radius:3px;font-size:10px;line-height:1.3;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer" title="${p(r.titulo)}">${p(te)}</div>`}).join(""),a=$.length>3?`<div style="font-size:9px;color:var(--text-3);padding:0 5px">+${$.length-3} mais</div>`:"";m.push(`
      <div class="cal-cell" ${f?`data-data="${j}"`:""} style="
        background:${w?"rgba(193,255,42,.08)":"var(--bg-card)"};
        min-height:96px;padding:5px 5px 4px;cursor:${f?"pointer":"default"};
        ${w?"box-shadow:inset 2px 0 0 var(--accent);":""}
        ${f?"":"opacity:.32;"}
        display:flex;flex-direction:column;gap:2px;overflow:hidden;
      ">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:${w?"var(--accent)":"var(--text-3)"};font-weight:${w?"700":"500"};margin-bottom:3px">
          <span>${B.getDate()}</span>
          ${$.length?`<span style="font-size:9px;color:var(--text-3)">${$.length}</span>`:""}
        </div>
        ${q}${a}
      </div>`)}const z=U.map(c=>`<div style="background:var(--bg-card);padding:8px 5px;font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:.1em;text-align:center;font-weight:600">${c}</div>`).join("");return`
    <div style="padding:14px 18px 6px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <h3 style="margin:0;font-size:16px">${re[n]} ${t}</h3>
      <div style="display:flex;gap:4px;margin-left:auto">
        <button class="btn bg bsm" id="cal-hoje">Hoje</button>
        <button class="btn bg bsm" id="cal-prev" style="padding:4px 10px">‹</button>
        <button class="btn bg bsm" id="cal-next" style="padding:4px 10px">›</button>
      </div>
    </div>
    <div style="padding:0 14px 16px">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:6px;overflow:hidden">
        ${z}
        ${m.join("")}
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:8px">Clique numa célula vazia pra criar um evento naquela data, ou num evento pra editar.</div>
    </div>`}function me(e){const t=n=>String(n).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}function I(e,t,n,o=!1){return t.length?`
    <div style="margin:14px 0 8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 18px;font-size:11px;font-weight:600;color:${n};text-transform:uppercase;letter-spacing:.1em">
        <span>${e}</span>
        <span style="font-weight:400;opacity:.5">· ${t.length}</span>
        <span style="flex:1;height:1px;background:var(--line);margin-left:4px"></span>
      </div>
      ${t.map(i=>fe(i,o)).join("")}
    </div>`:""}function fe(e,t=!1){if(e._isRotina)return ge(e,t);const n=D(e.hora_inicio),o=D(e.hora_fim),i=n&&o?`${n} – ${o}`:n||(t?"":"— sem hora —"),s=oe[e.local]||"",l=G(String(e.data).slice(0,10)),d=e.cliente_nome?`<span style="color:var(--text-2);font-size:12px"> · com ${p(e.cliente_nome)}</span>`:"",u=Q[e.status]||"var(--text-3)",m=e.status&&e.status!=="agendado"?`<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${u}22;color:${u};text-transform:uppercase;letter-spacing:.06em;flex-shrink:0">${ne[e.status]}</span>`:"";return`
    <div class="ev-card" data-id="${e.id}" style="margin:0 12px 6px;padding:12px 14px;border:1px solid var(--line);border-radius:8px;background:var(--bg-card);cursor:pointer;display:flex;gap:14px;align-items:flex-start;${t?"opacity:.55":""}">
      <div style="min-width:62px;font-size:11px;color:var(--text-3);line-height:1.4">
        <div style="color:var(--text-2);font-weight:600">${i||"—"}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-top:1px">${l}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:500;color:var(--text)">
          ${s?`<span style="font-size:14px">${s}</span>`:""}
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p(e.titulo)}</span>
          ${m}
        </div>
        ${e.cliente_nome||e.local?`<div style="font-size:11px;color:var(--text-3);margin-top:2px">${e.local?p(ae[e.local]||e.local):""}${d}</div>`:""}
        ${e.descricao?`<div style="font-size:12px;color:var(--text-2);margin-top:5px;line-height:1.45">${p(e.descricao)}</div>`:""}
      </div>
    </div>`}function ge(e,t=!1){const n=e.hora_inicio?D(e.hora_inicio):"",o=G(e.data),i=e.feito,s=e.streak||0,l=e.cor||"#C5F82A",d=e.icone||"⭐",u=s>0?`<span class="rot-streak" title="${s} dia${s===1?"":"s"} consecutivo${s===1?"":"s"}">🔥 ${s}</span>`:"";return`
    <div class="ev-card rot-card${i?" rot-done":""}" data-rotid="${e.rotina_id}" data-data="${e.data}"
      style="margin:0 12px 6px;padding:12px 14px;border:1px solid ${i?l+"55":"var(--line)"};border-radius:8px;background:${i?l+"0A":"var(--bg-card)"};display:flex;gap:14px;align-items:center;${t?"opacity:.55;":""}">
      <div style="min-width:62px;font-size:11px;color:var(--text-3);line-height:1.4">
        <div style="color:var(--text-2);font-weight:600">${n||"—"}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-top:1px">${o}</div>
      </div>
      <button class="rot-check" data-rotid="${e.rotina_id}" data-data="${e.data}" title="${i?"Desmarcar":"Marcar como feito"}"
        style="width:32px;height:32px;border-radius:50%;border:2px solid ${i?l:"var(--line2)"};background:${i?l:"transparent"};color:${i?"#000":"var(--text-3)"};cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 140ms">
        ${i?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>':""}
      </button>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:500;color:var(--text)">
          <span style="font-size:18px;line-height:1">${d}</span>
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${i?"text-decoration:line-through;opacity:.65":""}">${p(e.titulo)}</span>
          ${u}
        </div>
        <div style="font-size:11px;color:var(--text-3);margin-top:2px">
          Rotina pessoal · ${p((S[e.categoria]||S.outra).l)}
          ${e.observacoes?` · ${p(e.observacoes)}`:""}
        </div>
      </div>
      <button class="rot-edit-btn" data-rotid="${e.rotina_id}" title="Editar rotina"
        style="background:transparent;border:none;color:var(--text-3);cursor:pointer;padding:6px;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
      </button>
    </div>`}function W(e={}){const t=e.data||C(),n=P.map(s=>`<option value="${s.v}"${(e.status||"agendado")===s.v?" selected":""}>${s.l}</option>`).join(""),o=N.map(s=>`<option value="${s.v}"${(e.local||"")===s.v?" selected":""}>${s.icon} ${s.l}</option>`).join(""),i=H.map(s=>`<option value="${p(s.nome)}${s.empresa?" · "+p(s.empresa):""}"></option>`).join("");return`
    <div class="fg"><label class="fl">Título *</label>
      <input class="fi" id="ev-titulo" value="${p(e.titulo)}" placeholder="Ex: Conversa com Pedro sobre marmoraria">
    </div>

    <div class="fg"><label class="fl">Cliente (opcional)</label>
      <input class="fi" id="ev-cliente" value="${p(e.cliente_nome)}" placeholder="Digite ou escolha da lista..." list="ev-clientes-list" autocomplete="off">
      <datalist id="ev-clientes-list">${i}</datalist>
      <span style="font-size:11px;color:var(--text-3);margin-top:4px">Se for um cliente já cadastrado, escolha pra linkar.</span>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Data *</label><input class="fi" id="ev-data" type="date" value="${t}"></div>
      <div class="fg"><label class="fl">Hora início</label><input class="fi" id="ev-hi" type="time" value="${D(e.hora_inicio)}"></div>
      <div class="fg"><label class="fl">Hora fim</label><input class="fi" id="ev-hf" type="time" value="${D(e.hora_fim)}"></div>
    </div>

    <div class="frow">
      <div class="fg"><label class="fl">Local</label><select class="fsl" id="ev-local">${o}</select></div>
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="ev-status">${n}</select></div>
    </div>

    <div class="fg"><label class="fl">Descrição / pauta</label>
      <textarea class="fta" id="ev-desc" placeholder="O que vão tratar, links de reunião, contexto rápido...">${p(e.descricao)}</textarea>
    </div>

    <div class="fg"><label class="fl">Notas internas</label>
      <textarea class="fta" id="ev-notas">${p(e.notas)}</textarea>
    </div>`}function Z(e){T("Novo evento",W(e?{data:e}:{}),`<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bp" id="ev-save">Salvar</button>`),document.getElementById("ev-cancel").addEventListener("click",h),document.getElementById("ev-save").addEventListener("click",()=>ee())}function xe(e){T("Adicionar na agenda",`
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="ag-pick-opt" id="pick-evento"
        style="text-align:left;padding:16px 18px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);cursor:pointer;font-family:inherit;display:flex;gap:14px;align-items:center;transition:border-color 140ms">
        <div style="font-size:28px;line-height:1">📅</div>
        <div>
          <div style="font-size:14px;font-weight:600">Evento pontual</div>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px">Reunião, conversa, compromisso com data e hora.</div>
        </div>
      </button>
      <button class="ag-pick-opt" id="pick-rotina"
        style="text-align:left;padding:16px 18px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--text);cursor:pointer;font-family:inherit;display:flex;gap:14px;align-items:center;transition:border-color 140ms">
        <div style="font-size:28px;line-height:1">🔁</div>
        <div>
          <div style="font-size:14px;font-weight:600">Rotina pessoal</div>
          <div style="font-size:12px;color:var(--text-2);margin-top:2px">Hábito que se repete (academia, leitura, estudo...). Marca como feito e acompanha o streak.</div>
        </div>
      </button>
    </div>
  `,'<button class="btn bg" id="ag-pick-cancel">Cancelar</button>'),document.getElementById("ag-pick-cancel").addEventListener("click",h),document.getElementById("pick-evento").addEventListener("click",()=>{h(),Z(e)}),document.getElementById("pick-rotina").addEventListener("click",()=>{h(),X()})}function be(e={}){const t=K.map(i=>`<option value="${i.v}"${e.categoria===i.v?" selected":""}>${i.icone} ${i.l}</option>`).join(""),n=Array.isArray(e.dias_semana)?e.dias_semana:["seg","ter","qua","qui","sex"],o=V.map((i,s)=>`
    <label class="rot-day-chip">
      <input type="checkbox" name="rot-dia" value="${i}" ${n.includes(i)?"checked":""}>
      <span>${U[s]}</span>
    </label>
  `).join("");return`
    <div class="fg"><label class="fl">Nome *</label>
      <input class="fi" id="rot-nome" value="${p(e.nome)}" placeholder="Ex: Treino de manhã, Ler 30min, Meditar..." autofocus>
    </div>
    <div class="fg"><label class="fl">Categoria</label>
      <select class="fsl" id="rot-cat">${t}</select>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Ícone (emoji)</label>
        <input class="fi" id="rot-icone" value="${p(e.icone||"")}" placeholder="💪" maxlength="4">
      </div>
      <div class="fg"><label class="fl">Horário (opcional)</label>
        <input class="fi" id="rot-hora" type="time" value="${D(e.horario)}">
      </div>
    </div>
    <div class="fg">
      <label class="fl">Dias da semana</label>
      <div class="rot-days">${o}</div>
    </div>
    <div class="fg"><label class="fl">Observações (opcional)</label>
      <textarea class="fta" id="rot-obs" placeholder="Ex: Foco em pernas / Livro atual / Pomodoro 25min">${p(e.observacoes)}</textarea>
    </div>`}function X(e){const t=e&&e.id;T(t?"Editar rotina":"Nova rotina pessoal",be(e||{}),`<button class="btn bg" id="rot-cancel">Cancelar</button>
     ${t?'<button class="btn bd" id="rot-del">Remover</button>':""}
     <button class="btn bp" id="rot-save">Salvar</button>`),document.getElementById("rot-cancel").addEventListener("click",h),document.getElementById("rot-save").addEventListener("click",()=>he(t?e.id:null)),t&&document.getElementById("rot-del").addEventListener("click",()=>ye(e.id)),document.getElementById("rot-cat").addEventListener("change",n=>{const o=S[n.target.value];o&&!document.getElementById("rot-icone").value.trim()&&(document.getElementById("rot-icone").value=o.icone)})}async function he(e){const t=document.getElementById("rot-nome").value.trim();if(!t){v("Nome obrigatório.","er");return}const n=Array.from(document.querySelectorAll('input[name="rot-dia"]:checked')).map(u=>u.value);if(!n.length){v("Escolha pelo menos um dia da semana.","er");return}const o=document.getElementById("rot-cat").value,i=document.getElementById("rot-icone").value.trim(),s=S[o]||S.outra,l={nome:t,categoria:o,icone:i||s.icone,cor:s.cor,dias_semana:n,horario:document.getElementById("rot-hora").value||null,observacoes:document.getElementById("rot-obs").value.trim()||null,ativa:!0},{error:d}=e?await y.from("agenda_rotinas").update(l).eq("id",e):await y.from("agenda_rotinas").insert(l);if(d){v("Erro: "+d.message,"er");return}v(e?"Rotina atualizada.":"Rotina criada."),h(),O()}async function ye(e){if(!confirm("Remover essa rotina? O histórico de checks também será apagado."))return;const{error:t}=await y.from("agenda_rotinas").delete().eq("id",e);if(t){v("Erro: "+t.message,"er");return}v("Rotina removida."),h(),O()}function J(e){const t=A.find(n=>n.id===e);t&&(T("Editar evento",W(t),`<button class="btn bg" id="ev-cancel">Cancelar</button>
     <button class="btn bd" id="ev-del">Remover</button>
     <button class="btn bp" id="ev-save">Salvar</button>`),document.getElementById("ev-cancel").addEventListener("click",h),document.getElementById("ev-del").addEventListener("click",()=>Ee(e)),document.getElementById("ev-save").addEventListener("click",()=>ee(e)))}function $e(){const e=u=>document.getElementById(u).value,t=e("ev-titulo").trim(),n=e("ev-data"),o=e("ev-hi")||null,i=e("ev-hf")||null,s=e("ev-cliente").trim();let l=null,d=s||null;if(s){const u=s.split("·")[0].trim().toLowerCase(),m=H.find(z=>(z.nome||"").toLowerCase()===u);m&&(l=m.id,d=m.nome)}return{titulo:t,data:n,hora_inicio:o,hora_fim:i,cliente_id:l,cliente_nome:d,local:e("ev-local")||null,status:e("ev-status"),descricao:e("ev-desc").trim()||null,notas:e("ev-notas").trim()||null,atualizado_em:new Date().toISOString()}}async function ee(e){const t=$e();if(!t.titulo){v("Título obrigatório.","er");return}if(!t.data){v("Data obrigatória.","er");return}const{error:n}=e?await y.from("agenda").update(t).eq("id",e):await y.from("agenda").insert(t);if(n){v("Erro: "+n.message,"er");return}v(e?"Evento atualizado.":"Evento criado."),h(),O()}async function Ee(e){if(!confirm("Remover este evento?"))return;const{error:t}=await y.from("agenda").delete().eq("id",e);if(t){v("Erro ao remover: "+t.message,"er");return}v("Removido."),h(),O()}export{O as render};
