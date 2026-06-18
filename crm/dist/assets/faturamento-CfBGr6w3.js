import{d as m,b as A,e as b,c as r,h as D,o as y,f,t as v,M as R}from"./index-BZZbXi9u.js";let l=[];async function $(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-fat">+ Lançamento</button>',document.getElementById("btn-add-fat").addEventListener("click",C);const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const{data:a,error:n}=await m.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1});if(n){e.innerHTML=`<div class="empty">Erro: ${n.message}</div>`;return}l=a||[];const d=new Date,c=d.getFullYear(),M=d.getMonth()+1,h=l.filter(t=>t.ano===c).reduce((t,s)=>t+Number(s.valor),0),g=[...new Set(l.filter(t=>t.ano===c).map(t=>t.mes))],L=g.length?h/g.length:0,o=l.reduce((t,s)=>!t||Number(s.valor)>Number(t.valor)?s:t,null),u=[];for(let t=11;t>=0;t--){const s=new Date(c,M-1-t,1),p=s.getMonth()+1,k=s.getFullYear(),S=l.filter(i=>i.mes===p&&i.ano===k).reduce((i,x)=>i+Number(x.valor),0);u.push({label:R[p-1],val:S,cur:t===0})}const I=Math.max(...u.map(t=>t.val),1),B=u.map(t=>{const s=Math.round(t.val/I*100);return`<div class="bg2">
      <div class="bv">${t.val>0?"R$"+A(t.val):""}</div>
      <div class="bar${t.cur?" cur":""}" style="height:${s}%"></div>
      <div class="bl">${t.label}</div>
    </div>`}).join(""),F=l.length?l.map(t=>`
        <tr>
          <td>${b[t.mes-1]}</td>
          <td class="tm">${t.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${r(t.valor)}</td>
          <td class="tm">${t.descricao||"—"}</td>
          <td class="tm">${D(t.criado_em)}</td>
          <td style="display:flex;gap:6px;align-items:center">
            <button class="btn bg bsm edit-fat" data-id="${t.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${t.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="fs">
      <div class="sc"><div class="sl">Total ${c}</div><div class="sv ac">${r(h)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${r(L)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${o?r(o.valor):"—"}</div>
        <div class="ss">${o?b[o.mes-1]+" "+o.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Faturamento — últimos 12 meses</div>
      <div class="bc">${B}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${F}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(t=>t.addEventListener("click",()=>H(t.dataset.id))),e.querySelectorAll(".del-fat").forEach(t=>t.addEventListener("click",()=>N(t.dataset.id)))}function E(e={}){const a=new Date;return`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${b.map((n,d)=>`<option value="${d+1}"${(e.mes||a.getMonth()+1)===d+1?" selected":""}>${n}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||a.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${e.descricao||""}" placeholder="Ex: Clientes recorrentes"></div>`}function C(){y("Novo lançamento",E(),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",f),document.getElementById("m-save").addEventListener("click",()=>w())}function H(e){const a=l.find(n=>n.id===e);a&&(y("Editar lançamento",E(a),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",f),document.getElementById("m-save").addEventListener("click",()=>w(e)))}async function w(e){const a={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!a.valor){v("Valor obrigatório.","er");return}const{error:n}=e?await m.from("faturamento").update(a).eq("id",e):await m.from("faturamento").insert(a);if(n){v("Erro.","er");return}v(e?"Atualizado.":"Adicionado."),f(),$()}async function N(e){confirm("Remover?")&&(await m.from("faturamento").delete().eq("id",e),v("Removido."),$())}export{$ as render};
