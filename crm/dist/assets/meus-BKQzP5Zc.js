import{s as p,c as o,g as h,h as u}from"./index-69yFrWws.js";import{g,e as $}from"./clientes-MucSPROD.js";let a=[],d="";async function b(){document.getElementById("tbacts").innerHTML="";const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const{data:n,error:i}=await p("clientes",{order:{column:"nome",ascending:!0}});if(i){e.innerHTML=`<div class="empty">Erro: ${i.message}</div>`;return}a=(n||[]).filter(r=>r.status==="ativo"),m()}function m(){let e=a;if(d){const t=d.toLowerCase();e=e.filter(s=>s.nome.toLowerCase().includes(t)||(s.empresa||"").toLowerCase().includes(t))}const n=e.reduce((t,s)=>t+Number(s.valor||0),0),i=e.length?n/e.length:0,r=e.length?e.map(t=>`
    <tr data-id="${t.id}" class="meu-row" style="cursor:pointer">
      <td class="tn">${t.nome}</td>
      <td class="tm">${t.empresa||"—"}</td>
      <td class="tm">${t.servico||"—"}</td>
      <td>${o(t.valor)}</td>
      <td>${h(t.temperatura)}</td>
      <td class="tm">${t.whatsapp?`<a href="https://wa.me/${t.whatsapp.replace(/\D/g,"")}" target="_blank" class="wa-link" onclick="event.stopPropagation()">${t.whatsapp}</a>`:"—"}</td>
      <td class="tm">${u(t.criado_em)}</td>
      <td><button class="btn bg bsm gen-contrato" data-id="${t.id}" title="Gerar contrato">Contrato</button></td>
    </tr>`).join(""):'<tr><td colspan="8"><div class="empty">Nenhum cliente ativo ainda.<br>Quando um lead virar contrato, mude o status pra "Ativo" na ficha dele e ele aparece aqui.</div></td></tr>';document.getElementById("content").innerHTML=`
    <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:22px">
      <div class="sc">
        <div class="sl">Clientes ativos</div>
        <div class="sv">${a.length}</div>
        <div class="ss">${a.length===1,"Em operação"}</div>
      </div>
      <div class="sc">
        <div class="sl">MRR</div>
        <div class="sv ac">${o(n)}</div>
        <div class="ss">Recorrência mensal</div>
      </div>
      <div class="sc">
        <div class="sl">Ticket médio</div>
        <div class="sv">${o(i)}</div>
        <div class="ss">Por cliente</div>
      </div>
    </div>

    <div class="tw">
      <div class="th">
        <h3>Meus clientes <span style="color:var(--text-3);font-weight:400">(${e.length}${d?` de ${a.length}`:""})</span></h3>
        <input class="si" id="meu-search" placeholder="Buscar por nome ou empresa..." value="${d}">
      </div>
      <table>
        <thead><tr>
          <th>Nome</th><th>Empresa</th><th>Serviço</th>
          <th>Valor/mês</th><th>Temp.</th><th>WhatsApp</th><th>Cliente desde</th><th></th>
        </tr></thead>
        <tbody>${r}</tbody>
      </table>
    </div>`,document.getElementById("meu-search").addEventListener("input",t=>{d=t.target.value,m()}),document.getElementById("content").addEventListener("click",t=>{const s=t.target.closest(".gen-contrato");if(s){t.stopPropagation();const l=a.find(v=>v.id===s.dataset.id);l&&g(l);return}const c=t.target.closest(".meu-row");c&&$(c.dataset.id,()=>b())})}export{b as render};
