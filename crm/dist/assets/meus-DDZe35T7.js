import{s as o,c as l,t as m,f as v}from"./index-Vs8eoDVV.js";import{editCliente as p}from"./clientes-Cw1fqkru.js";let d=[],a="";async function h(){document.getElementById("tbacts").innerHTML="";const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const{data:i,error:r}=await o("clientes",{order:{column:"nome",ascending:!0}});if(r){e.innerHTML=`<div class="empty">Erro: ${r.message}</div>`;return}d=(i||[]).filter(n=>n.status==="ativo"),c()}function c(){let e=d;if(a){const t=a.toLowerCase();e=e.filter(s=>s.nome.toLowerCase().includes(t)||(s.empresa||"").toLowerCase().includes(t))}const i=e.reduce((t,s)=>t+Number(s.valor||0),0),r=e.length?i/e.length:0,n=e.length?e.map(t=>`
    <tr data-id="${t.id}" class="meu-row" style="cursor:pointer">
      <td class="tn">${t.nome}</td>
      <td class="tm">${t.empresa||"—"}</td>
      <td class="tm">${t.servico||"—"}</td>
      <td>${l(t.valor)}</td>
      <td>${m(t.temperatura)}</td>
      <td class="tm">${t.whatsapp?`<a href="https://wa.me/${t.whatsapp.replace(/\D/g,"")}" target="_blank" class="wa-link" onclick="event.stopPropagation()">${t.whatsapp}</a>`:"—"}</td>
      <td class="tm">${v(t.criado_em)}</td>
    </tr>`).join(""):'<tr><td colspan="7"><div class="empty">Nenhum cliente ativo ainda.<br>Quando um lead virar contrato, mude o status pra "Ativo" na ficha dele e ele aparece aqui.</div></td></tr>';document.getElementById("content").innerHTML=`
    <div class="sg" style="grid-template-columns:repeat(3,1fr);margin-bottom:22px">
      <div class="sc">
        <div class="sl">Clientes ativos</div>
        <div class="sv">${d.length}</div>
        <div class="ss">${d.length===1,"Em operação"}</div>
      </div>
      <div class="sc">
        <div class="sl">MRR</div>
        <div class="sv ac">${l(i)}</div>
        <div class="ss">Recorrência mensal</div>
      </div>
      <div class="sc">
        <div class="sl">Ticket médio</div>
        <div class="sv">${l(r)}</div>
        <div class="ss">Por cliente</div>
      </div>
    </div>

    <div class="tw">
      <div class="th">
        <h3>Meus clientes <span style="color:var(--text-3);font-weight:400">(${e.length}${a?` de ${d.length}`:""})</span></h3>
        <input class="si" id="meu-search" placeholder="Buscar por nome ou empresa..." value="${a}">
      </div>
      <table>
        <thead><tr>
          <th>Nome</th><th>Empresa</th><th>Serviço</th>
          <th>Valor/mês</th><th>Temp.</th><th>WhatsApp</th><th>Cliente desde</th>
        </tr></thead>
        <tbody>${n}</tbody>
      </table>
    </div>`,document.getElementById("meu-search").addEventListener("input",t=>{a=t.target.value,c()}),document.getElementById("content").addEventListener("click",t=>{const s=t.target.closest(".meu-row");s&&p(s.dataset.id,()=>h())})}export{h as render};
