import{s as p,c as t}from"./index-LcxVLMuJ.js";import{e as k}from"./clientes-Bq9Qa_ME.js";const m=[{k:"novo",l:"Novo",cor:"#4A9EFF"},{k:"qualificado",l:"Qualificado",cor:"#F5A623"},{k:"proposta",l:"Proposta",cor:"#A78BFA"},{k:"ativo",l:"Ativo",cor:"#C5F82A"},{k:"fechado",l:"Fechado",cor:"#34D399"}];async function $(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const{data:d,error:o}=await p("clientes",{order:{column:"criado_em",ascending:!1}});if(o){e.innerHTML=`<div class="empty">Erro: ${o.message}</div>`;return}const i=d||[],n=m.map(c=>{const s=i.filter(a=>a.status===c.k),r=s.reduce((a,v)=>a+Number(v.valor||0),0),l=s.length?s.map(a=>`
          <div class="kcard" data-id="${a.id}">
            <div class="kcard-name">${a.nome}</div>
            ${a.empresa?`<div class="kcard-co">${a.empresa}</div>`:""}
            <div class="kcard-ft">
              <span class="kcard-val">${a.valor?t(a.valor):"—"}</span>
              <span class="kcard-svc">${a.servico||""}</span>
            </div>
          </div>`).join(""):'<div style="font-size:12px;color:var(--text-3);text-align:center;padding:14px 0">Vazio</div>';return`<div class="kc">
      <div class="kch">
        <span class="kct" style="color:${c.cor}">${c.l}</span>
        <span class="kcn">${s.length}</span>
      </div>
      ${r>0?`<div style="padding:5px 13px;font-size:11px;color:var(--text-3);border-bottom:1px solid var(--line)">${t(r)}</div>`:""}
      <div class="kcards">${l}</div>
    </div>`}).join("");e.innerHTML=`<div class="kanban">${n}</div>`,e.addEventListener("click",c=>{const s=c.target.closest(".kcard");s&&k(s.dataset.id,()=>$())})}export{$ as render};
