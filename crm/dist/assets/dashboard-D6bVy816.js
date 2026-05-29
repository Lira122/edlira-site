import{s as T,d as g,M as n,b as V,a as Y,c as v,e as j}from"./index-e80yzYuM.js";async function _(){const d=document.getElementById("content");d.innerHTML='<div class="empty">Carregando...</div>';try{const c=new Date,a=c.getMonth()+1,e=c.getFullYear(),[{data:$,error:m},{data:f,error:u},{data:p,error:h}]=await Promise.all([T("clientes",{order:{column:"criado_em",ascending:!1}}),g.from("faturamento").select("*"),g.from("agentes").select("*")]);if(m||u||h)throw new Error((m||u||h).message);const i=$||[],b=f||[],M=p||[],w=i.filter(s=>s.status==="ativo").length,y=i.filter(s=>s.status==="ativo").reduce((s,t)=>s+Number(t.valor||0),0),E=i.filter(s=>{const t=new Date(s.criado_em);return t.getMonth()+1===a&&t.getFullYear()===e}).length,F=M.filter(s=>s.status==="ativo").length,L=b.filter(s=>s.mes===a&&s.ano===e).reduce((s,t)=>s+Number(t.valor),0),o=[];for(let s=5;s>=0;s--){const t=new Date(e,a-1-s,1),r=t.getMonth()+1,N=t.getFullYear(),D=b.filter(l=>l.mes===r&&l.ano===N).reduce((l,H)=>l+Number(H.valor),0);o.push({label:n[r-1],val:D,cur:s===0})}const R=Math.max(...o.map(s=>s.val),1),S=o.map(s=>{const t=Math.round(s.val/R*100);return`<div class="bg2">
        <div class="bv">${s.val>0?"R$"+V(s.val):""}</div>
        <div class="bar${s.cur?" cur":""}" style="height:${t}%"></div>
        <div class="bl">${s.label}</div>
      </div>`}).join(""),A=i.slice(0,6).map(s=>`<tr data-go="clientes" style="cursor:pointer">
        <td class="tn">${s.nome}</td>
        <td class="tm">${s.empresa||"—"}</td>
        <td class="tm">${s.servico||"—"}</td>
        <td>${Y(s.status)}</td>
        <td>${v(s.valor)}</td>
      </tr>`).join("")||'<tr><td colspan="5"><div class="empty">Sem clientes ainda.</div></td></tr>';d.innerHTML=`
      <div class="sg">
        <div class="sc">
          <div class="sl">Faturamento — ${n[a-1]}</div>
          <div class="sv ac">${v(L)}</div>
          <div class="ss">${j[a-1]} ${e}</div>
        </div>
        <div class="sc">
          <div class="sl">MRR</div>
          <div class="sv ac">${v(y)}</div>
          <div class="ss">${w} cliente(s) ativo(s)</div>
        </div>
        <div class="sc">
          <div class="sl">Leads este mês</div>
          <div class="sv">${E}</div>
          <div class="ss">${n[a-1]} ${e}</div>
        </div>
        <div class="sc">
          <div class="sl">Agentes IA ativos</div>
          <div class="sv">${F}</div>
          <div class="ss">Em operação</div>
        </div>
      </div>
      <div class="cw">
        <div class="ct">Faturamento — últimos 6 meses</div>
        <div class="bc">${S}</div>
      </div>
      <div class="tw">
        <div class="th">
          <h3>Últimos clientes</h3>
          <button class="btn bg bsm" data-go="clientes">Ver todos →</button>
        </div>
        <table>
          <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Status</th><th>Valor</th></tr></thead>
          <tbody>${A}</tbody>
        </table>
      </div>`}catch(c){d.innerHTML=`<div class="empty">Erro ao carregar: ${c.message}</div>`}}export{_ as render};
