import{s as T,c}from"./index-Be77b9jp.js";const f=[{k:"novo",l:"Novo lead",cor:"#4A9EFF",desc:"Acabou de entrar"},{k:"qualificado",l:"Qualificado",cor:"#F5A623",desc:"Situação e problema mapeados"},{k:"proposta",l:"Proposta",cor:"#A78BFA",desc:"Reunião agendada / proposta enviada"},{k:"ativo",l:"Cliente ativo",cor:"#C5F82A",desc:"Fechou e está em andamento"},{k:"fechado",l:"Encerrado",cor:"#34D399",desc:"Contrato finalizado"},{k:"perdido",l:"Perdido",cor:"#FF5C5C",desc:"Não avançou"}];async function E(){const l=document.getElementById("content");l.innerHTML='<div class="empty">Carregando...</div>';try{let $=function(s,o){return a[s]?Math.round(a[o]/a[s]*100):null};const{data:e,error:u}=await T("clientes");if(u)throw new Error(u.message);const r=e||[],i=r.length;if(!i){l.innerHTML='<div class="empty">Nenhum lead cadastrado ainda.</div>';return}const a={},n={};f.forEach(s=>{a[s.k]=r.filter(o=>o.status===s.k).length,n[s.k]=r.filter(o=>o.status===s.k).reduce((o,d)=>o+Number(d.valor||0),0)});const v=f.filter(s=>s.k!=="perdido"),m=Math.max(...v.map(s=>a[s.k]),1),h=n.ativo,y=n.qualificado+n.proposta,b=a.perdido,p=i?Math.round((a.ativo+a.fechado)/i*100):0,k=`
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:28px">
        <div class="sc">
          <div class="sl">Total de leads</div>
          <div class="sv">${i}</div>
          <div class="ss">Na base completa</div>
        </div>
        <div class="sc">
          <div class="sl">Em negociação</div>
          <div class="sv" style="color:#A78BFA">${a.qualificado+a.proposta}</div>
          <div class="ss">${c(y)} em aberto</div>
        </div>
        <div class="sc">
          <div class="sl">MRR (ativos)</div>
          <div class="sv ac">${c(h)}</div>
          <div class="ss">${a.ativo} cliente(s)</div>
        </div>
        <div class="sc">
          <div class="sl">Conversão geral</div>
          <div class="sv" style="color:${p>20?"var(--ok)":p>10?"var(--warn)":"var(--danger)"}">${p}%</div>
          <div class="ss">${b} lead(s) perdido(s)</div>
        </div>
      </div>`,x=v.map((s,o)=>{const d=a[s.k],g=n[s.k],w=i?Math.round(d/i*100):0,C=d===0?12:Math.max(18,Math.round(d/m*100));return`
        ${o>0?(()=>{const t=$(v[o-1].k,s.k);return t===null?"":`<div class="fn-conv" style="color:${t>=50?"var(--ok)":t>=25?"var(--warn)":"var(--danger)"}">↓ ${t}% converteram</div>`})():""}
        <div class="fn-stage">
          <div class="fn-bar-wrap">
            <div class="fn-bar" style="width:${C}%;background:${s.cor}22;border:1px solid ${s.cor}44;border-left:3px solid ${s.cor}">
              <div class="fn-bar-inner">
                <div class="fn-stage-left">
                  <span class="fn-label" style="color:${s.cor}">${s.l}</span>
                  <span class="fn-desc">${s.desc}</span>
                </div>
                <div class="fn-stage-right">
                  <span class="fn-count">${d}</span>
                  <span class="fn-pct">${w}% do total</span>
                </div>
              </div>
            </div>
            <div class="fn-valor">${g>0?c(g):""}</div>
          </div>
        </div>`}).join(""),M=`
      <div class="fn-conv" style="color:var(--danger)">↓ ${$("novo","perdido")??0}% foram perdidos</div>
      <div class="fn-stage">
        <div class="fn-bar-wrap">
          <div class="fn-bar" style="width:${Math.max(8,Math.round(a.perdido/m*100))}%;background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.2);border-left:3px solid #FF5C5C;opacity:.6">
            <div class="fn-bar-inner">
              <div class="fn-stage-left">
                <span class="fn-label" style="color:#FF5C5C">Perdidos</span>
                <span class="fn-desc">Não avançaram no funil</span>
              </div>
              <div class="fn-stage-right">
                <span class="fn-count">${a.perdido}</span>
                <span class="fn-pct">${i?Math.round(a.perdido/i*100):0}% do total</span>
              </div>
            </div>
          </div>
        </div>
      </div>`,F=f.filter(s=>a[s.k]>0).map(s=>{const o=r.filter(d=>d.status===s.k).slice(0,5);return`
        <div class="fn-detail">
          <div class="fn-detail-head" style="border-left:3px solid ${s.cor}">
            <span style="color:${s.cor};font-weight:600;font-size:13px">${s.l}</span>
            <span style="font-size:11px;color:var(--text-3)">${a[s.k]} lead(s)</span>
          </div>
          ${o.map(d=>`
            <div class="fn-detail-row">
              <span class="fn-detail-nome">${d.nome}</span>
              <span class="fn-detail-val">${d.valor?c(d.valor):"—"}</span>
            </div>`).join("")}
          ${a[s.k]>5?`<div style="font-size:11px;color:var(--text-3);padding:6px 14px">+${a[s.k]-5} mais...</div>`:""}
        </div>`}).join("");l.innerHTML=`
      ${k}
      <div style="display:grid;grid-template-columns:1fr 320px;gap:18px;align-items:start">
        <div class="tw" style="padding:22px">
          <div style="font-size:13px;font-weight:600;margin-bottom:20px">Funil de vendas</div>
          <div class="fn-funil">${x}${M}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${F}
        </div>
      </div>`}catch(e){l.innerHTML=`<div class="empty">Erro: ${e.message}</div>`}}export{E as render};
