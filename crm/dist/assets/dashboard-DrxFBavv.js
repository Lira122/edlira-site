import{s as T,d as r,M as f,b as q,a as A,c as h,e as V}from"./index-BWeNDSVY.js";async function P(){const d=document.getElementById("content");d.innerHTML='<div class="empty">Carregando...</div>';try{const a=new Date,e=a.getMonth()+1,l=a.getFullYear(),y=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo"}).format(a),[{data:w,error:p},{data:M,error:b},{data:j,error:$},{count:F},{count:_}]=await Promise.all([T("clientes",{order:{column:"criado_em",ascending:!1}}),r.from("faturamento").select("*"),r.from("agentes").select("*"),r.from("clientes").select("*",{count:"exact",head:!0}).eq("status","prospeccao"),r.from("chatbot_conversations").select("*",{count:"exact",head:!0}).eq("lead_data->>origem","disparo_prospeccao").eq("lead_data->>disparo_dia",y)]);if(p||b||$)throw new Error((p||b||$).message);const n=w||[],g=M||[],B=j||[],v=n.filter(s=>s.status==="ativo").length,E=n.filter(s=>s.status==="ativo").reduce((s,t)=>s+Number(t.valor||0),0),L=g.filter(s=>s.mes===e&&s.ano===l).reduce((s,t)=>s+Number(t.valor),0),R=F||0,o=_||0,c=20,m=[];for(let s=5;s>=0;s--){const t=new Date(l,e-1-s,1),u=t.getMonth()+1,D=t.getFullYear(),H=g.filter(i=>i.mes===u&&i.ano===D).reduce((i,N)=>i+Number(N.valor),0);m.push({label:f[u-1],val:H,cur:s===0})}const S=Math.max(...m.map(s=>s.val),1),x=m.map(s=>{const t=Math.round(s.val/S*100);return`<div class="bg2">
        <div class="bv">${s.val>0?"R$"+q(s.val):""}</div>
        <div class="bar${s.cur?" cur":""}" style="height:${t}%"></div>
        <div class="bl">${s.label}</div>
      </div>`}).join(""),C=n.slice(0,6).map(s=>`<tr data-go="clientes" style="cursor:pointer">
        <td class="tn">${s.nome}</td>
        <td class="tm">${s.empresa||"—"}</td>
        <td class="tm">${s.servico||"—"}</td>
        <td>${A(s.status)}</td>
        <td>${h(s.valor)}</td>
      </tr>`).join("")||'<tr><td colspan="5"><div class="empty">Sem clientes ainda.</div></td></tr>';d.innerHTML=`
      <div class="sg">
        <div class="sc">
          <div class="sl">MRR</div>
          <div class="sv ac">${h(E)}</div>
          <div class="ss">${v} cliente${v===1?"":"s"} ativo${v===1?"":"s"}</div>
        </div>
        <div class="sc">
          <div class="sl">Faturamento · ${f[e-1]}</div>
          <div class="sv">${h(L)}</div>
          <div class="ss">${V[e-1]} ${l}</div>
        </div>
        <div class="sc">
          <div class="sl">Fila prospecção</div>
          <div class="sv">${R}</div>
          <div class="ss">Leads aguardando disparo</div>
        </div>
        <div class="sc">
          <div class="sl">Disparos hoje</div>
          <div class="sv">${o}<span style="font-family:var(--ff-mono);font-size:14px;font-weight:500;color:var(--text-3);letter-spacing:.02em;margin-left:4px">/${c}</span></div>
          <div class="ss">${o>=c?"Cota diária batida":`${c-o} restante${c-o===1?"":"s"} hoje`}</div>
        </div>
      </div>
      <div class="cw">
        <div class="ct">Faturamento · últimos 6 meses</div>
        <div class="bc">${x}</div>
      </div>
      <div class="tw">
        <div class="th">
          <h3>Últimos clientes</h3>
          <button class="btn bg bsm" data-go="clientes">Ver todos →</button>
        </div>
        <table>
          <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Status</th><th>Valor</th></tr></thead>
          <tbody>${C}</tbody>
        </table>
      </div>`}catch(a){d.innerHTML=`<div class="empty">Erro ao carregar: ${a.message}</div>`}}export{P as render};
