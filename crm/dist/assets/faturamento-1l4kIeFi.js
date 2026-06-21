import{d as p,s as B,o as L,e as x,f as _,t as m,c as u,h as j,b as J,M as V}from"./index-B_9HHcs0.js";const N=[{k:"ia",l:"IA / Software",cor:"#A78BFA"},{k:"infra",l:"Infra",cor:"#4A9EFF"},{k:"marketing",l:"Marketing/Ads",cor:"#F5A623"},{k:"operacional",l:"Operacional",cor:"#34D399"},{k:"pessoal",l:"Pessoal",cor:"#EC4899"},{k:"outro",l:"Outro",cor:"#A0A0A0"}],S=Object.fromEntries(N.map(e=>[e.k,e]));let w=[],I=[],k=[],M=[],F=[],y="receita";async function D(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>',await q(),await te(),await q(),T(),O()}async function q(){const[e,c,d,s,t]=await Promise.all([p.from("faturamento").select("*").order("ano",{ascending:!1}).order("mes",{ascending:!1}),B("despesas",{order:{column:"data",ascending:!1}}),B("despesas_recorrentes",{order:{column:"criado_em",ascending:!1}}),B("receitas_recorrentes",{order:{column:"criado_em",ascending:!1}}),B("clientes",{columns:"id,nome,empresa,status"})]);w=e.data||[],I=c.data||[],k=d.data||[],M=s.data||[],F=t.data||[]}function T(){const e=(n,r)=>`<button class="pj-tab${y===n?" on":""}" data-tab="${n}">${r}</button>`;let c="";y==="receita"&&(c='<button class="btn bp" id="btn-add">+ Receita</button>'),y==="despesas"&&(c='<button class="btn bp" id="btn-add">+ Despesa</button>'),y==="recorrentes"&&(c=`
    <button class="btn bg" id="btn-add-rec-receita">+ Receita recorrente</button>
    <button class="btn bp" id="btn-add-rec-despesa">+ Despesa recorrente</button>`),document.getElementById("tbacts").innerHTML=`
    <div class="pj-tabs">${e("receita","Receita")}${e("despesas","Despesas")}${e("recorrentes","Recorrentes")}${e("resumo","Resumo")}</div>
    ${c}
  `,document.querySelectorAll(".pj-tab").forEach(n=>n.addEventListener("click",()=>{y=n.dataset.tab,T(),O()}));const d=document.getElementById("btn-add");d&&(y==="receita"&&d.addEventListener("click",()=>P()),y==="despesas"&&d.addEventListener("click",()=>z()));const s=document.getElementById("btn-add-rec-receita"),t=document.getElementById("btn-add-rec-despesa");s&&s.addEventListener("click",()=>W()),t&&t.addEventListener("click",()=>H())}function O(){return y==="despesas"?Q():y==="recorrentes"?X():y==="resumo"?Z():K()}function K(){const e=document.getElementById("content"),c=new Date,d=c.getFullYear(),s=c.getMonth()+1,t=w.filter(a=>a.ano===d).reduce((a,l)=>a+Number(l.valor),0),n=[...new Set(w.filter(a=>a.ano===d).map(a=>a.mes))],r=n.length?t/n.length:0,i=w.reduce((a,l)=>!a||Number(l.valor)>Number(a.valor)?l:a,null),v=[];for(let a=11;a>=0;a--){const l=new Date(d,s-1-a,1),$=l.getMonth()+1,E=l.getFullYear(),g=w.filter(h=>h.mes===$&&h.ano===E).reduce((h,G)=>h+Number(G.valor),0);v.push({label:V[$-1],val:g,cur:a===0})}const o=Math.max(...v.map(a=>a.val),1),b=v.map(a=>{const l=Math.round(a.val/o*100);return`<div class="bg2">
      <div class="bv">${a.val>0?"R$"+J(a.val):""}</div>
      <div class="bar${a.cur?" cur":""}" style="height:${l}%"></div>
      <div class="bl">${a.label}</div>
    </div>`}).join(""),f=w.length?w.map(a=>`
        <tr>
          <td>${x[a.mes-1]}</td>
          <td class="tm">${a.ano}</td>
          <td style="font-weight:600;color:var(--accent)">${u(a.valor)}</td>
          <td class="tm">${R(a.descricao||"—")}${a.recorrente_id?'<span class="desp-rec-tag" title="Receita recorrente">↻</span>':""}</td>
          <td class="tm">${j(a.criado_em)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-fat" data-id="${a.id}">Editar</button>
            <button class="btn bd bsm bic del-fat" data-id="${a.id}">×</button>
          </td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Sem lançamentos.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Total ${d}</div><div class="sv ac">${u(t)}</div></div>
      <div class="sc"><div class="sl">Média mensal</div><div class="sv">${u(r)}</div></div>
      <div class="sc">
        <div class="sl">Melhor mês</div>
        <div class="sv">${i?u(i.valor):"—"}</div>
        <div class="ss">${i?x[i.mes-1]+" "+i.ano:""}</div>
      </div>
    </div>
    <div class="cw">
      <div class="ct">Receita — últimos 12 meses</div>
      <div class="bc">${b}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Lançamentos</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Ano</th><th>Valor</th><th>Descrição</th><th>Data</th><th></th></tr></thead>
        <tbody>${f}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-fat").forEach(a=>a.addEventListener("click",()=>{const l=w.find($=>$.id===a.dataset.id);l&&P(l)})),e.querySelectorAll(".del-fat").forEach(a=>a.addEventListener("click",()=>ee(a.dataset.id)))}function Q(){const e=document.getElementById("content"),c=new Date,d=c.getFullYear(),s=c.getMonth()+1,t=`${d}-${String(s).padStart(2,"0")}`,n=I.filter(a=>(a.data||"").startsWith(t)),r=n.reduce((a,l)=>a+Number(l.valor),0),i=I.filter(a=>(a.data||"").startsWith(String(d))).reduce((a,l)=>a+Number(l.valor),0),v=_recorrentes.filter(a=>a.ativa).reduce((a,l)=>a+Number(l.valor),0),o={};for(const a of n)o[a.categoria||"outro"]=(o[a.categoria||"outro"]||0)+Number(a.valor);const b=Object.entries(o).sort(([,a],[,l])=>l-a).map(([a,l])=>{const $=S[a]||S.outro,E=r>0?Math.round(l/r*100):0;return`<div class="desp-cat-card">
        <div class="desp-cat-head">
          <span class="desp-cat-dot" style="background:${$.cor}"></span>
          <span class="desp-cat-name">${$.l}</span>
          <span class="desp-cat-pct">${E}%</span>
        </div>
        <div class="desp-cat-val">${u(l)}</div>
      </div>`}).join("")||'<div class="empty">Sem despesas neste mês.</div>',f=I.length?I.map(a=>{const l=S[a.categoria]||S.outro;return`<tr>
          <td class="tm">${j(a.data)}</td>
          <td class="tn">${R(a.descricao)}${a.recorrente_id?'<span class="desp-rec-tag" title="Gerada por recorrente">↻</span>':""}</td>
          <td><span class="desp-cat-pill" style="background:${l.cor}22;color:${l.cor}">${l.l}</span></td>
          <td style="font-weight:600;color:var(--danger)">${u(a.valor)}</td>
          <td style="display:flex;gap:6px">
            <button class="btn bg bsm edit-desp" data-id="${a.id}">Editar</button>
            <button class="btn bd bsm bic del-desp" data-id="${a.id}">×</button>
          </td>
        </tr>`}).join(""):'<tr><td colspan="5"><div class="empty">Sem despesas cadastradas.</div></td></tr>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Despesas ${x[s-1]}</div><div class="sv" style="color:var(--danger)">${u(r)}</div></div>
      <div class="sc"><div class="sl">Despesas ${d}</div><div class="sv">${u(i)}</div></div>
      <div class="sc"><div class="sl">Recorrentes ativas</div><div class="sv">${u(v)}<span style="font-size:11px;color:var(--text-3);font-weight:400;margin-left:6px">/mês</span></div></div>
    </div>
    <div class="cw">
      <div class="ct">Por categoria — ${x[s-1]} ${d}</div>
      <div class="desp-cat-grid">${b}</div>
    </div>
    <div class="tw">
      <div class="th"><h3>Todas as despesas</h3></div>
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>
        <tbody>${f}</tbody>
      </table>
    </div>`,e.querySelectorAll(".edit-desp").forEach(a=>a.addEventListener("click",()=>{const l=I.find($=>$.id===a.dataset.id);l&&z(l)})),e.querySelectorAll(".del-desp").forEach(a=>a.addEventListener("click",()=>Y(a.dataset.id)))}function X(){const e=document.getElementById("content"),c=M.filter(i=>i.ativa).reduce((i,v)=>i+Number(v.valor),0),d=k.filter(i=>i.ativa).reduce((i,v)=>i+Number(v.valor),0),s=c-d,t=(i,v)=>{const o=v==="receita"?"var(--accent)":"var(--danger)",b=v==="despesa"?S[i.categoria]||S.outro:null,f=v==="receita"&&i.cliente_id?F.find(l=>l.id===i.cliente_id):null,a=i.dia_util?`${i.dia_mes}º dia útil`:`Dia ${i.dia_mes}`;return`<div class="desp-rec-card ${i.ativa?"":"paused"}" data-rid="${i.id}" data-tipo="${v}">
      <div class="desp-rec-head">
        ${b?`<span class="desp-cat-pill" style="background:${b.cor}22;color:${b.cor}">${b.l}</span>`:f?`<span class="desp-cat-pill" style="background:rgba(193,255,42,.12);color:var(--accent)">${R(f.empresa||f.nome)}</span>`:"<span></span>"}
        <label class="pj-rot-toggle">
          <input type="checkbox" class="desp-rec-active" data-rid="${i.id}" data-tipo="${v}" ${i.ativa?"checked":""}>
          <span>${i.ativa?"Ativa":"Pausada"}</span>
        </label>
      </div>
      <div class="desp-rec-name">${R(i.descricao)}</div>
      <div class="desp-rec-val" style="color:${o}">${u(i.valor)}</div>
      <div class="desp-rec-meta">${a} de cada mês${i.ultima_geracao?" · Última: "+j(i.ultima_geracao):""}</div>
      <div class="desp-rec-acts">
        <button class="btn bg bsm rec-edit" data-rid="${i.id}" data-tipo="${v}">Editar</button>
        <button class="btn bg bsm rec-run"  data-rid="${i.id}" data-tipo="${v}">Lançar agora</button>
        <button class="btn bd bsm rec-del"  data-rid="${i.id}" data-tipo="${v}">Excluir</button>
      </div>
    </div>`},n=M.map(i=>t(i,"receita")).join("")||'<div class="empty">Nenhuma receita recorrente cadastrada.</div>',r=k.map(i=>t(i,"despesa")).join("")||'<div class="empty">Nenhuma despesa recorrente cadastrada.</div>';e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receitas/mês</div><div class="sv" style="color:var(--accent)">${u(c)}</div></div>
      <div class="sc"><div class="sl">Despesas/mês</div><div class="sv" style="color:var(--danger)">${u(d)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/mês</div><div class="sv" style="color:${s>=0?"var(--ok)":"var(--danger)"}">${u(s)}</div></div>
      <div class="sc"><div class="sl">Lucro projetado/ano</div><div class="sv">${u(s*12)}</div></div>
    </div>

    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>💰 Receitas Recorrentes — entram automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${n}</div></div>
    </div>

    <div class="tw">
      <div class="th"><h3>💸 Despesas Recorrentes — saem automaticamente</h3></div>
      <div style="padding:14px"><div class="desp-rec-grid">${r}</div></div>
    </div>`,e.addEventListener("click",async i=>{const v=i.target.closest(".rec-edit"),o=i.target.closest(".rec-del"),b=i.target.closest(".rec-run"),f=i.target.closest(".desp-rec-active"),a=v||o||b||f;if(!a)return;const l=a.dataset.tipo,$=l==="receita"?M:k,E=l==="receita"?"receitas_recorrentes":"despesas_recorrentes",g=$.find(h=>h.id===a.dataset.rid);if(g)if(v)l==="receita"?W(g):H(g);else if(o){if(!confirm(`Excluir "${g.descricao}"? (Lançamentos já gerados continuam)`))return;await p.from(E).delete().eq("id",g.id),m("Excluída"),D()}else b?(await se(g,l),m(l==="receita"?"Receita lançada":"Despesa lançada"),D()):f&&(g.ativa=f.checked,await p.from(E).update({ativa:g.ativa,atualizado_em:new Date().toISOString()}).eq("id",g.id),D())})}function Z(){const e=document.getElementById("content"),c=new Date,d=c.getFullYear(),s=c.getMonth()+1,t=[];for(let o=11;o>=0;o--){const b=new Date(d,s-1-o,1),f=b.getMonth()+1,a=b.getFullYear(),l=`${a}-${String(f).padStart(2,"0")}`,$=w.filter(g=>g.mes===f&&g.ano===a).reduce((g,h)=>g+Number(h.valor),0),E=I.filter(g=>(g.data||"").startsWith(l)).reduce((g,h)=>g+Number(h.valor),0);t.push({label:V[f-1],rec:$,des:E,lucro:$-E,cur:o===0})}const n=Math.max(...t.flatMap(o=>[o.rec,o.des,Math.abs(o.lucro)]),1),r=t[t.length-1],i=t.slice().reverse().map(o=>`
    <tr>
      <td>${o.label}${o.cur?' <span style="font-size:10px;color:var(--accent);font-weight:600">ATUAL</span>':""}</td>
      <td style="color:var(--accent);font-weight:500">${u(o.rec)}</td>
      <td style="color:var(--danger);font-weight:500">${u(o.des)}</td>
      <td style="font-weight:700;color:${o.lucro>=0?"var(--ok)":"var(--danger)"}">${u(o.lucro)}</td>
    </tr>`).join(""),v=t.map(o=>{const b=Math.round(o.rec/n*100),f=Math.round(o.des/n*100);return`<div class="resumo-bg">
      <div class="resumo-bars">
        <div class="resumo-bar rec" style="height:${b}%" title="Receita ${u(o.rec)}"></div>
        <div class="resumo-bar des" style="height:${f}%" title="Despesa ${u(o.des)}"></div>
      </div>
      <div class="bl">${o.label}</div>
    </div>`}).join("");e.innerHTML=`
    <div class="sg">
      <div class="sc"><div class="sl">Receita ${x[s-1]}</div><div class="sv" style="color:var(--accent)">${u(r.rec)}</div></div>
      <div class="sc"><div class="sl">Despesa ${x[s-1]}</div><div class="sv" style="color:var(--danger)">${u(r.des)}</div></div>
      <div class="sc"><div class="sl">Lucro ${x[s-1]}</div><div class="sv" style="color:${r.lucro>=0?"var(--ok)":"var(--danger)"}">${u(r.lucro)}</div></div>
      <div class="sc"><div class="sl">Margem</div><div class="sv">${r.rec>0?Math.round(r.lucro/r.rec*100)+"%":"—"}</div></div>
    </div>
    <div class="cw">
      <div class="ct">Receita vs Despesa — últimos 12 meses</div>
      <div class="bc">${v}</div>
      <div style="display:flex;gap:18px;font-size:11px;color:var(--text-3);margin-top:8px;justify-content:center">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Receita</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:5px"></span>Despesa</span>
      </div>
    </div>
    <div class="tw">
      <div class="th"><h3>Detalhamento mensal</h3></div>
      <table>
        <thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th>Lucro</th></tr></thead>
        <tbody>${i}</tbody>
      </table>
    </div>`}function P(e={}){const c=!e.id,d=new Date;L(c?"Nova receita":"Editar receita",`
    <div class="frow">
      <div class="fg"><label class="fl">Mês *</label>
        <select class="fsl" id="fmes">
          ${x.map((s,t)=>`<option value="${t+1}"${(e.mes||d.getMonth()+1)===t+1?" selected":""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="fg"><label class="fl">Ano *</label><input class="fi" id="fano" type="number" value="${e.ano||d.getFullYear()}"></div>
    </div>
    <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="fval" type="number" step="0.01" value="${e.valor||""}"></div>
    <div class="fg"><label class="fl">Descrição</label><input class="fi" id="fdesc" value="${A(e.descricao||"")}" placeholder="Ex: Clientes recorrentes"></div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),document.getElementById("m-save").addEventListener("click",async()=>{const s={mes:parseInt(document.getElementById("fmes").value),ano:parseInt(document.getElementById("fano").value),valor:parseFloat(document.getElementById("fval").value)||0,descricao:document.getElementById("fdesc").value.trim()};if(!s.valor)return m("Valor obrigatório","err");const{error:t}=e.id?await p.from("faturamento").update(s).eq("id",e.id):await p.from("faturamento").insert(s);if(t)return m("Erro: "+t.message,"err");_(),m("Salvo"),D()})}async function ee(e){confirm("Remover?")&&(await p.from("faturamento").delete().eq("id",e),m("Removido"),D())}function z(e={}){const c=!e.id,d=new Date().toISOString().slice(0,10),s=N.map(t=>`<option value="${t.k}"${(e.categoria||"outro")===t.k?" selected":""}>${t.l}</option>`).join("");L(c?"Nova despesa":"Editar despesa",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="d-desc" value="${A(e.descricao||"")}" placeholder="Ex: Fatura Nubank, Mensalidade Claude…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="d-cat">${s}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="d-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="fg" style="margin-top:11px"><label class="fl">Data *</label>
      <input class="fi" type="date" id="d-data" value="${e.data||d}"></div>
  `,`
    ${c?"":'<button class="btn bd" id="d-del">Excluir</button>'}
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),c||document.getElementById("d-del").addEventListener("click",async()=>{confirm("Excluir?")&&(await Y(e.id),_())}),document.getElementById("m-save").addEventListener("click",async()=>{const t={descricao:document.getElementById("d-desc").value.trim(),categoria:document.getElementById("d-cat").value,valor:parseFloat(document.getElementById("d-val").value)||0,data:document.getElementById("d-data").value};if(!t.descricao)return m("Descrição obrigatória","err");if(!t.valor)return m("Valor obrigatório","err");if(!t.data)return m("Data obrigatória","err");const{error:n}=e.id?await p.from("despesas").update(t).eq("id",e.id):await p.from("despesas").insert(t);if(n)return m("Erro: "+n.message,"err");_(),m("Salvo"),D()})}async function Y(e){await p.from("despesas").delete().eq("id",e),m("Removida"),D()}function H(e={}){const c=!e.id,d=N.map(s=>`<option value="${s.k}"${(e.categoria||"outro")===s.k?" selected":""}>${s.l}</option>`).join("");L(c?"Nova despesa recorrente":"Editar despesa recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="r-desc" value="${A(e.descricao||"")}" placeholder="Ex: Claude Pro, Supabase, Vercel…"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Categoria</label><select class="fsl" id="r-cat">${d}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="r-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="r-dia" value="${e.dia_mes||1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="r-dia-util">
          <option value="false"${e.dia_util?"":" selected"}>Dia do calendário</option>
          <option value="true"${e.dia_util?" selected":""}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A despesa é lançada automaticamente toda vez que você abre essa tela e chega o dia configurado.<br>Ex: "Dia 30" cai no último dia em fevereiro. "5º dia útil" pula sáb/dom.</div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),document.getElementById("m-save").addEventListener("click",async()=>{const s={descricao:document.getElementById("r-desc").value.trim(),categoria:document.getElementById("r-cat").value,valor:parseFloat(document.getElementById("r-val").value)||0,dia_mes:parseInt(document.getElementById("r-dia").value)||1,dia_util:document.getElementById("r-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!s.descricao)return m("Descrição obrigatória","err");if(!s.valor)return m("Valor obrigatório","err");if(s.dia_mes<1||s.dia_mes>31)return m("Dia entre 1 e 31","err");const{error:t}=e.id?await p.from("despesas_recorrentes").update(s).eq("id",e.id):await p.from("despesas_recorrentes").insert({...s,ativa:!0});if(t)return m("Erro: "+t.message,"err");_(),m("Salvo"),D()})}function W(e={}){const c=!e.id,s='<option value="">— sem cliente vinculado —</option>'+F.filter(t=>["proposta","ativo","em_pausa","fechado"].includes(t.status)||t.id===e.cliente_id).map(t=>`<option value="${t.id}"${e.cliente_id===t.id?" selected":""}>${A(t.empresa||t.nome)}</option>`).join("");L(c?"Nova receita recorrente":"Editar receita recorrente",`
    <div class="fg"><label class="fl">Descrição *</label>
      <input class="fi" id="rr-desc" value="${A(e.descricao||"")}" placeholder="Ex: Vale Pet — mensalidade"></div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Cliente</label><select class="fsl" id="rr-cli">${s}</select></div>
      <div class="fg"><label class="fl">Valor (R$) *</label><input class="fi" id="rr-val" type="number" step="0.01" value="${e.valor||""}"></div>
    </div>
    <div class="frow" style="margin-top:11px">
      <div class="fg"><label class="fl">Dia *</label>
        <input class="fi" type="number" min="1" max="31" id="rr-dia" value="${e.dia_mes||1}"></div>
      <div class="fg"><label class="fl">Tipo de dia</label>
        <select class="fsl" id="rr-dia-util">
          <option value="false"${e.dia_util?"":" selected"}>Dia do calendário</option>
          <option value="true"${e.dia_util?" selected":""}>Dia útil (seg-sex)</option>
        </select></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:var(--text-3);line-height:1.5">A receita entra automaticamente na aba Faturamento quando chegar o dia configurado.</div>
  `,`
    <button class="btn bg" id="m-cancel">Cancelar</button>
    <button class="btn bp" id="m-save">Salvar</button>
  `),document.getElementById("m-cancel").addEventListener("click",_),document.getElementById("m-save").addEventListener("click",async()=>{const t={descricao:document.getElementById("rr-desc").value.trim(),cliente_id:document.getElementById("rr-cli").value||null,valor:parseFloat(document.getElementById("rr-val").value)||0,dia_mes:parseInt(document.getElementById("rr-dia").value)||1,dia_util:document.getElementById("rr-dia-util").value==="true",atualizado_em:new Date().toISOString()};if(!t.descricao)return m("Descrição obrigatória","err");if(!t.valor)return m("Valor obrigatório","err");if(t.dia_mes<1||t.dia_mes>31)return m("Dia entre 1 e 31","err");const{error:n}=e.id?await p.from("receitas_recorrentes").update(t).eq("id",e.id):await p.from("receitas_recorrentes").insert({...t,ativa:!0});if(n)return m("Erro: "+n.message,"err");_(),m("Salvo"),D()})}function U(e,c){return new Date(e,c,0).getDate()}function ae(e,c,d){let s=0;const t=U(e,c);for(let n=1;n<=t;n++){const r=new Date(e,c-1,n).getDay();if(r!==0&&r!==6&&(s++,s===d))return n}return t}function C(e,c,d){return e.dia_util?ae(c,d,e.dia_mes):Math.min(e.dia_mes,U(c,d))}async function te(){const e=new Date,c=e.toISOString().slice(0,10),d=e.getFullYear(),s=e.getMonth()+1,t=e.getDate(),n=`${d}-${String(s).padStart(2,"0")}`;for(const r of M){if(!r.ativa||r.ultima_geracao&&r.ultima_geracao.startsWith(n))continue;const i=C(r,d,s);t<i||(await p.from("faturamento").insert({mes:s,ano:d,valor:r.valor,descricao:r.descricao,cliente_id:r.cliente_id||null,recorrente_id:r.id}),await p.from("receitas_recorrentes").update({ultima_geracao:c}).eq("id",r.id))}for(const r of k){if(!r.ativa||r.ultima_geracao&&r.ultima_geracao.startsWith(n))continue;const i=C(r,d,s);t<i||(await p.from("despesas").insert({descricao:r.descricao,categoria:r.categoria,valor:r.valor,data:`${n}-${String(i).padStart(2,"0")}`,recorrente_id:r.id}),await p.from("despesas_recorrentes").update({ultima_geracao:c}).eq("id",r.id))}}async function se(e,c){const d=new Date,s=d.toISOString().slice(0,10);c==="receita"?(await p.from("faturamento").insert({mes:d.getMonth()+1,ano:d.getFullYear(),valor:e.valor,descricao:e.descricao,cliente_id:e.cliente_id||null,recorrente_id:e.id}),await p.from("receitas_recorrentes").update({ultima_geracao:s}).eq("id",e.id)):(await p.from("despesas").insert({descricao:e.descricao,categoria:e.categoria,valor:e.valor,data:s,recorrente_id:e.id}),await p.from("despesas_recorrentes").update({ultima_geracao:s}).eq("id",e.id))}function R(e){return String(e??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c])}function A(e){return R(e)}export{D as render};
