import{s as A,o as I,f as k,d as g,t as n}from"./index-CE09sjGB.js";const u=[{k:"ideia",l:"Ideia",cor:"#94A3B8",dot:"rgba(148,163,184,.7)"},{k:"roteiro",l:"Roteiro",cor:"#4A9EFF",dot:"rgba(74,158,255,.9)"},{k:"gravado",l:"Gravado",cor:"#A78BFA",dot:"rgba(167,139,250,.9)"},{k:"editando",l:"Editando",cor:"#F5A623",dot:"rgba(245,166,35,.95)"},{k:"agendado",l:"Agendado",cor:"#22D3EE",dot:"rgba(34,211,238,.95)"},{k:"publicado",l:"Publicado",cor:"#34D399",dot:"rgba(52,211,153,.95)"}],y=[{k:"reel",l:"Reel",icon:"Rl"},{k:"post",l:"Post",icon:"Po"},{k:"story",l:"Story",icon:"St"},{k:"yt",l:"YouTube",icon:"YT"},{k:"tiktok",l:"TikTok",icon:"TT"},{k:"blog",l:"Blog",icon:"Bl"},{k:"outro",l:"Outro",icon:"**"}],$=Object.fromEntries(y.map(a=>[a.k,a])),S=[{k:"instagram",l:"Instagram"},{k:"youtube",l:"YouTube"},{k:"tiktok",l:"TikTok"},{k:"site",l:"Site / Blog"},{k:"linkedin",l:"LinkedIn"}];let m=[],p=null;const v=a=>String(a??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);function L(a){if(!a)return"";const c=new Date(a),o=["Dom","Seg","Ter","Qua","Qui","Sex","Sab"],d=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];return`${o[c.getDay()]}, ${String(c.getDate()).padStart(2,"0")} ${d[c.getMonth()]}`}async function f(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-ct">+ Nova ideia</button>',document.getElementById("btn-add-ct").addEventListener("click",()=>E());const a=document.getElementById("content");a.innerHTML='<div class="empty">Carregando pauta...</div>';const{data:c,error:o}=await A("conteudos",{order:{column:"ordem",ascending:!0}});if(o){a.innerHTML=`<div class="empty">Erro: ${o.message}<br><br>Rode <code>supabase/conteudos.sql</code> no SQL Editor primeiro.</div>`;return}m=c||[],h()}function h(){const a=m.length,c={};u.forEach(t=>{c[t.k]=[]}),m.forEach(t=>{const e=u.some(s=>s.k===t.status)?t.status:"ideia";c[e].push(t)}),u.forEach(t=>{c[t.k].sort((e,s)=>(e.ordem??0)-(s.ordem??0))});const o=u.map(t=>{const e=c[t.k],s=e.map(T).join("")||'<div class="ct-col-empty">Vazio</div>';return`
      <div class="ct-col" data-status="${t.k}">
        <div class="ct-col-h">
          <div class="ct-col-t">
            <span class="ct-col-dot" style="background:${t.dot}"></span>
            <span>${t.l}</span>
            <span class="ct-col-count">${e.length}</span>
          </div>
          <button class="ct-col-add" data-status="${t.k}" title="Nova ideia nesta coluna">+</button>
        </div>
        <div class="ct-col-body" data-drop="${t.k}">
          ${s}
        </div>
      </div>`}).join(""),d=document.getElementById("content");d.innerHTML=`
    <div class="ct-hdr">
      <div class="ct-hdr-t">
        <div class="ct-hdr-title">Pauta de conteudo</div>
        <div class="ct-hdr-sub">${a} ${a===1?"ideia":"ideias"} no pipeline - arraste os cards entre colunas</div>
      </div>
    </div>
    <div class="ct-kanban">${o}</div>`,d.querySelectorAll(".ct-card").forEach(t=>{t.addEventListener("click",e=>{e.target.closest(".ct-card-del")||E(t.dataset.id)})}),d.querySelectorAll(".ct-card-del").forEach(t=>{t.addEventListener("click",async e=>{e.stopPropagation(),confirm("Remover essa ideia?")&&(await g.from("conteudos").delete().eq("id",t.dataset.id),n("Removida."),f())})}),d.querySelectorAll(".ct-col-add").forEach(t=>{t.addEventListener("click",()=>E(null,t.dataset.status))}),d.querySelectorAll(".ct-card").forEach(t=>{t.setAttribute("draggable","true"),t.addEventListener("dragstart",e=>{p=t.dataset.id,t.classList.add("dragging"),e.dataTransfer.effectAllowed="move"}),t.addEventListener("dragend",()=>{t.classList.remove("dragging"),p=null,d.querySelectorAll(".ct-col-body").forEach(e=>e.classList.remove("drop-over"))})}),d.querySelectorAll(".ct-col-body").forEach(t=>{t.addEventListener("dragover",e=>{e.preventDefault(),t.classList.add("drop-over")}),t.addEventListener("dragleave",()=>{t.classList.remove("drop-over")}),t.addEventListener("drop",async e=>{var i;if(e.preventDefault(),t.classList.remove("drop-over"),!p)return;const s=t.dataset.drop,l=m.find(b=>b.id===p);if(!l||l.status===s)return;l.status=s,h();const{error:r}=await g.from("conteudos").update({status:s,atualizado_em:new Date().toISOString()}).eq("id",p);if(r){n("Erro ao mover: "+r.message,"er"),f();return}n(`Movido para ${((i=u.find(b=>b.k===s))==null?void 0:i.l)||s}.`)})})}function T(a){const c=$[a.tipo]||$.outro,o=a.data_publicacao?L(a.data_publicacao):"",t=(Array.isArray(a.canais)?a.canais:[]).slice(0,3).map(s=>{const l=S.find(r=>r.k===s);return`<span class="ct-chip">${v((l==null?void 0:l.l)||s)}</span>`}).join(""),e=a.descricao?a.descricao.slice(0,90).replace(/\s+/g," ").trim():"";return`
    <div class="ct-card" data-id="${a.id}">
      <div class="ct-card-top">
        <span class="ct-card-tipo" title="${v(c.l)}">${c.icon}</span>
        <div class="ct-card-title">${v(a.titulo)}</div>
        <button class="ct-card-del" data-id="${a.id}" title="Remover">x</button>
      </div>
      ${e?`<div class="ct-card-desc">${v(e)}${a.descricao.length>90?"...":""}</div>`:""}
      ${t?`<div class="ct-card-chips">${t}</div>`:""}
      ${o?`<div class="ct-card-data">${o}</div>`:""}
    </div>`}function E(a,c){const o=a?m.find(i=>i.id===a):{status:c||"ideia",canais:[],tipo:"reel"};if(a&&!o)return;const d=y.map(i=>`<option value="${i.k}"${(o.tipo||"reel")===i.k?" selected":""}>${i.l}</option>`).join(""),t=u.map(i=>`<option value="${i.k}"${(o.status||"ideia")===i.k?" selected":""}>${i.l}</option>`).join(""),e=Array.isArray(o.canais)?o.canais:[],s=S.map(i=>`
    <label class="ct-canal-chip">
      <input type="checkbox" name="ct-canal" value="${i.k}" ${e.includes(i.k)?"checked":""}>
      <span>${i.l}</span>
    </label>
  `).join(""),l=o.data_publicacao?new Date(o.data_publicacao).toISOString().slice(0,16):"",r=`
    <div class="fg"><label class="fl">Titulo *</label>
      <input class="fi" id="ct-titulo" value="${v(o.titulo||"")}" placeholder="Ex: Como IA qualifica lead 24/7" autofocus>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Tipo</label>
        <select class="fsl" id="ct-tipo">${d}</select>
      </div>
      <div class="fg"><label class="fl">Status</label>
        <select class="fsl" id="ct-status">${t}</select>
      </div>
    </div>
    <div class="fg">
      <label class="fl">Canais</label>
      <div class="ct-canais">${s}</div>
    </div>
    <div class="fg"><label class="fl">Data de publicacao (opcional)</label>
      <input class="fi" id="ct-data" type="datetime-local" value="${l}">
    </div>
    <div class="fg"><label class="fl">Roteiro / descricao</label>
      <textarea class="fta" id="ct-desc" style="min-height:180px" placeholder="Escreva o roteiro completo, topicos, hooks, CTA...">${v(o.descricao||"")}</textarea>
    </div>`;I(a?"Editar ideia":"Nova ideia de conteudo",r,`<button class="btn bg" id="ct-cancel">Cancelar</button>
     ${a?'<button class="btn bd" id="ct-del">Remover</button>':""}
     <button class="btn bp" id="ct-save">Salvar</button>`),document.getElementById("ct-cancel").addEventListener("click",k),document.getElementById("ct-save").addEventListener("click",()=>B(a)),a&&document.getElementById("ct-del").addEventListener("click",async()=>{confirm("Remover essa ideia?")&&(await g.from("conteudos").delete().eq("id",a),n("Removida."),k(),f())})}async function B(a){const c=document.getElementById("ct-titulo").value.trim();if(!c){n("Titulo obrigatorio.","er");return}const o=Array.from(document.querySelectorAll('input[name="ct-canal"]:checked')).map(s=>s.value),d=document.getElementById("ct-data").value,t={titulo:c,tipo:document.getElementById("ct-tipo").value,status:document.getElementById("ct-status").value,canais:o,data_publicacao:d?new Date(d).toISOString():null,descricao:document.getElementById("ct-desc").value.trim()||null,atualizado_em:new Date().toISOString()},{error:e}=a?await g.from("conteudos").update(t).eq("id",a):await g.from("conteudos").insert(t);if(e){n("Erro: "+e.message,"er");return}n(a?"Ideia atualizada.":"Ideia criada."),k(),f()}export{f as render};
