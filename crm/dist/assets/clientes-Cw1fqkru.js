import{d as c,g as o,o as p,h as m,s as y,S as v,i as f,T as E,a as $,t as w,c as B,f as I}from"./index-Vs8eoDVV.js";let u=[],i="todos",d="";async function g(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-cliente">+ Novo cliente</button>',document.getElementById("btn-add-cliente").addEventListener("click",L);const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>';const{data:s,error:l}=await y("clientes",{order:{column:"criado_em",ascending:!1}});if(l){t.innerHTML=`<div class="empty">Erro: ${l.message}</div>`;return}u=s||[],r()}function r(){let t=u;if(i!=="todos"&&(t=t.filter(e=>e.status===i)),d){const e=d.toLowerCase();t=t.filter(a=>a.nome.toLowerCase().includes(e)||(a.empresa||"").toLowerCase().includes(e))}const s=["todos",...v].map(e=>`<div class="fc${i===e?" on":""}" data-fil="${e}">
      ${e==="todos"?"Todos":f[e]||e.charAt(0).toUpperCase()+e.slice(1)}
    </div>`).join(""),l=t.length?t.map(e=>`
        <tr data-id="${e.id}" class="cl-row">
          <td class="tn">${e.nome}</td>
          <td class="tm">${e.empresa||"—"}</td>
          <td class="tm">${e.servico||"—"}</td>
          <td>${$(e.status)}${e.status==="em_pausa"&&e.pausado_ate?`<div style="font-size:10px;color:var(--text-3);margin-top:2px">até ${new Date(e.pausado_ate).toLocaleDateString("pt-BR")}</div>`:""}</td>
          <td>${w(e.temperatura)}</td>
          <td>${B(e.valor)}</td>
          <td class="tm">${e.whatsapp?`<a href="https://wa.me/${e.whatsapp.replace(/\D/g,"")}" target="_blank" class="wa-link">${e.whatsapp}</a>`:"—"}</td>
          <td class="tm">${I(e.criado_em)}</td>
          <td><button class="btn bd bsm bic del-cl" data-id="${e.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button></td>
        </tr>`).join(""):'<tr><td colspan="8"><div class="empty">Nenhum resultado.</div></td></tr>';document.getElementById("content").innerHTML=`
    <div class="tw">
      <div class="th">
        <h3>Clientes <span style="color:var(--text-3);font-weight:400">(${t.length})</span></h3>
        <input class="si" id="cl-search" placeholder="Buscar..." value="${d}">
      </div>
      <div class="fr" id="cl-filters">${s}</div>
      <table>
        <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Status</th><th>Temp.</th><th>Valor</th><th>WhatsApp</th><th>Entrada</th><th></th></tr></thead>
        <tbody>${l}</tbody>
      </table>
    </div>`,document.getElementById("cl-search").addEventListener("input",e=>{d=e.target.value,r()}),document.getElementById("cl-filters").addEventListener("click",e=>{const a=e.target.closest(".fc");a&&(i=a.dataset.fil,r())}),document.getElementById("content").addEventListener("click",e=>{const a=e.target.closest(".cl-row"),n=e.target.closest(".del-cl");n?(e.stopPropagation(),_(n.dataset.id)):a&&C(a.dataset.id)})}function b(t={}){const s=v.map(a=>{const n=a==="em_pausa"?"Em pausa (não agora)":f[a]||a.charAt(0).toUpperCase()+a.slice(1);return`<option value="${a}"${t.status===a?" selected":""}>${n}</option>`}).join(""),l='<option value="">— não definida —</option>'+E.map(a=>{const n={quente:"🔥 Quente",morno:"🌡️ Morno",frio:"❄️ Frio",gelado:"🧊 Gelado"};return`<option value="${a}"${t.temperatura===a?" selected":""}>${n[a]}</option>`}).join(""),e=t.pausado_ate?new Date(t.pausado_ate).toISOString().slice(0,10):"";return`
    <div class="frow">
      <div class="fg"><label class="fl">Nome *</label><input class="fi" id="fn" value="${t.nome||""}"></div>
      <div class="fg"><label class="fl">Empresa</label><input class="fi" id="fe" value="${t.empresa||""}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">WhatsApp</label><input class="fi" id="fw" value="${t.whatsapp||""}" placeholder="5512..."></div>
      <div class="fg"><label class="fl">E-mail</label><input class="fi" id="fem" value="${t.email||""}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Serviço</label><input class="fi" id="fs" value="${t.servico||""}" placeholder="Ex: Tráfego + IA"></div>
      <div class="fg"><label class="fl">Valor/mês (R$)</label><input class="fi" id="fv" type="number" value="${t.valor||""}"></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Status</label><select class="fsl" id="fst" onchange="document.getElementById('pausa-row').style.display=this.value==='em_pausa'?'flex':'none'">${s}</select></div>
      <div class="fg"><label class="fl">Temperatura da conversa</label><select class="fsl" id="ftemp">${l}</select></div>
    </div>
    <div class="frow" id="pausa-row" style="display:${t.status==="em_pausa"?"flex":"none"}">
      <div class="fg" style="grid-column:1/-1">
        <label class="fl">Retomar contato em</label>
        <input class="fi" id="fpause" type="date" value="${e}" min="${new Date().toISOString().slice(0,10)}">
        <span style="font-size:11px;color:var(--text-3);margin-top:4px">O lead ficará pausado até esta data — o follow-up automático não será disparado nesse período.</span>
      </div>
    </div>
    <div class="fg"><label class="fl">Observações / notas da conversa</label><textarea class="fta" id="fob">${t.observacoes||""}</textarea></div>`}function S(){const t=document.getElementById("fst").value,s=document.getElementById("fpause");return{nome:document.getElementById("fn").value.trim(),empresa:document.getElementById("fe").value.trim(),whatsapp:document.getElementById("fw").value.trim(),email:document.getElementById("fem").value.trim(),servico:document.getElementById("fs").value.trim(),valor:parseFloat(document.getElementById("fv").value)||null,status:t,temperatura:document.getElementById("ftemp").value||null,pausado_ate:t==="em_pausa"&&(s!=null&&s.value)?new Date(s.value).toISOString():null,observacoes:document.getElementById("fob").value.trim(),atualizado_em:new Date().toISOString()}}function L(){p("Novo cliente",b(),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",m),document.getElementById("m-save").addEventListener("click",()=>h())}async function C(t,s){let l=u.find(e=>e.id===t);if(!l){const{data:e}=await c.from("clientes").select("*").eq("id",t).maybeSingle();l=e}if(!l){o("Cliente não encontrado.","er");return}p("Editar cliente",b(l),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",m),document.getElementById("m-save").addEventListener("click",()=>h(t,s))}async function h(t,s){const l=S();if(!l.nome){o("Nome obrigatório.","er");return}const{error:e}=t?await c.from("clientes").update(l).eq("id",t):await c.from("clientes").insert(l);if(e){o("Erro ao salvar.","er"),console.error(e);return}o(t?"Cliente atualizado.":"Cliente adicionado."),m(),s?s():g()}async function _(t){if(!confirm("Remover este cliente?"))return;const{error:s}=await c.from("clientes").delete().eq("id",t);if(s){o("Erro.","er");return}o("Removido."),g()}export{u as _cl,C as editCliente,g as render};
