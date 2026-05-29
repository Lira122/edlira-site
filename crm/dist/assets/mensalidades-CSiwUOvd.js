import{s as R,d as c,c as i,h as N,M as p,e as $,o as k,f as y,t as o}from"./index-e80yzYuM.js";async function u(){document.getElementById("tbacts").innerHTML='<button class="btn bg bsm" id="btn-fat-manual">+ Lançamento manual</button>',document.getElementById("btn-fat-manual").addEventListener("click",F);const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';try{const a=new Date,s=a.getMonth()+1,n=a.getFullYear(),[{data:d,error:m},{data:E,error:f}]=await Promise.all([R("clientes",{order:{column:"nome",ascending:!0}}),c.from("faturamento").select("*").eq("mes",s).eq("ano",n)]);if(m||f)throw new Error((m||f).message);const l=(d||[]).filter(t=>t.status==="ativo"),v=E||[],g=l.reduce((t,r)=>t+Number(r.valor||0),0),h=v.reduce((t,r)=>t+Number(r.valor||0),0),b=Math.max(0,g-h),w=l.map(t=>{const r=v.some(B=>B.cliente_id===t.id),I=r?'<span class="badge b-ativo">Pago</span>':'<span class="badge b-inativo">Pendente</span>',q=r?`<button class="btn bg bsm estornar-btn" data-id="${t.id}" data-nome="${t.nome}" data-mes="${s}" data-ano="${n}">Estornar</button>`:`<button class="btn bp bsm registrar-btn" data-id="${t.id}" data-nome="${t.nome}" data-valor="${t.valor||0}" data-mes="${s}" data-ano="${n}">Registrar</button>`;return`<tr>
        <td class="tn">${t.nome}</td>
        <td class="tm">${t.empresa||"—"}</td>
        <td class="tm">${t.servico||"—"}</td>
        <td style="font-weight:600;color:var(--accent)">${i(t.valor)}</td>
        <td>${I}</td>
        <td>${q}</td>
      </tr>`}).join(""),M=v.map(t=>`
      <tr>
        <td class="tn">${t.descricao||"—"}</td>
        <td style="font-weight:600;color:var(--accent)">${i(t.valor)}</td>
        <td class="tm">${N(t.criado_em)}</td>
        <td><button class="btn bd bsm bic del-fat-btn" data-id="${t.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          </svg>
        </button></td>
      </tr>`).join("")||'<tr><td colspan="4"><div class="empty">Sem lançamentos este mês.</div></td></tr>',L=l.length?`<table>
          <thead><tr><th>Nome</th><th>Empresa</th><th>Serviço</th><th>Valor/mês</th><th>${p[s-1]}/${n}</th><th></th></tr></thead>
          <tbody>${w}</tbody>
        </table>`:'<div class="empty">Nenhum cliente com status <strong>Ativo</strong>.<br>Altere o status do cliente em Clientes para ele aparecer aqui.</div>';e.innerHTML=`
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px">
        <div class="sc"><div class="sl">MRR</div><div class="sv ac">${i(g)}</div><div class="ss">Recorrência mensal</div></div>
        <div class="sc"><div class="sl">Clientes ativos</div><div class="sv">${l.length}</div><div class="ss">Com contrato vigente</div></div>
        <div class="sc"><div class="sl">Recebido — ${p[s-1]}</div><div class="sv" style="color:var(--ok)">${i(h)}</div><div class="ss">${v.length} lançamento(s)</div></div>
        <div class="sc"><div class="sl">Pendente</div><div class="sv" style="color:${b>0?"var(--warn)":"var(--text-3)"}">${i(b)}</div><div class="ss">${b>0?"A receber":"Em dia"}</div></div>
      </div>
      <div class="tw" style="margin-bottom:22px">
        <div class="th">
          <h3>Clientes ativos <span style="color:var(--text-3);font-weight:400">(${l.length})</span></h3>
          <span style="font-size:12px;color:var(--text-3)">Clique em Registrar para lançar o pagamento do mês</span>
        </div>
        ${L}
      </div>
      <div class="tw">
        <div class="th"><h3>Lançamentos — ${$[s-1]} ${n}</h3></div>
        <table>
          <thead><tr><th>Descrição</th><th>Valor</th><th>Data</th><th></th></tr></thead>
          <tbody>${M}</tbody>
        </table>
      </div>`,e.querySelectorAll(".registrar-btn").forEach(t=>{t.addEventListener("click",()=>A(t.dataset.id,t.dataset.nome,t.dataset.valor,Number(t.dataset.mes),Number(t.dataset.ano)))}),e.querySelectorAll(".estornar-btn").forEach(t=>{t.addEventListener("click",()=>C(t.dataset.id,t.dataset.nome,Number(t.dataset.mes),Number(t.dataset.ano)))}),e.querySelectorAll(".del-fat-btn").forEach(t=>{t.addEventListener("click",()=>S(t.dataset.id))})}catch(a){document.getElementById("content").innerHTML=`<div class="empty">Erro ao carregar: ${a.message}</div>`}}async function A(e,a,s,n,d){const{error:m}=await c.from("faturamento").insert({mes:n,ano:d,valor:Number(s)||0,descricao:a,cliente_id:e});if(m){o("Erro ao registrar.","er");return}o(`${a} — pagamento registrado.`),u()}async function C(e,a,s,n){if(!confirm(`Estornar pagamento de ${a}?`))return;const{error:d}=await c.from("faturamento").delete().eq("cliente_id",e).eq("mes",s).eq("ano",n);if(d){o("Erro.","er");return}o("Estornado."),u()}async function S(e){confirm("Remover lançamento?")&&(await c.from("faturamento").delete().eq("id",e),o("Removido."),u())}function F(){const e=new Date,a=`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${$.map((s,n)=>`<option value="${n+1}"${e.getMonth()===n?" selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" placeholder="Ex: Clientes recorrentes"></div>`;k("Novo lançamento",a,`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",y),document.getElementById("m-save").addEventListener("click",D)}async function D(){const e={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!e.valor){o("Valor obrigatório.","er");return}const{error:a}=await c.from("faturamento").insert(e);if(a){o("Erro.","er");return}o("Adicionado."),y(),u()}export{u as render};
