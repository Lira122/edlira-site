import{s as B,h as w,o as z,f as y,t as i,d as b}from"./index-CDa9fny6.js";let u=[];const M="https://elevabrands.com.br";function h(e){return String(e||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,80)}const r=e=>String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]),n=e=>r(e);async function E(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando posts...</div>';const{data:a,error:s}=await B("blog_posts",{order:{column:"criado_em",ascending:!1}});if(s){e.innerHTML=`<div class="empty">Erro: ${s.message}</div>`;return}if(u=a||[],document.getElementById("tbacts").innerHTML=`
    <button class="btn bp" id="btn-new-post">+ Novo post</button>`,document.getElementById("btn-new-post").addEventListener("click",()=>_()),!u.length){e.innerHTML=`
      <div class="empty" style="padding:80px 20px">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Nenhum post ainda</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px">Crie o primeiro post pra começar a alavancar seu SEO.</div>
      </div>`;return}const l=u.map(t=>{const o=!!t.publicado,d=o?'<span class="badge b-ativo">Publicado</span>':'<span class="badge b-em_pausa">Rascunho</span>',p=o&&t.publicado_em?`<span style="font-size:12px;color:var(--text-3)">Publicado em ${w(t.publicado_em)}</span>`:`<span style="font-size:12px;color:var(--text-3)">Criado em ${w(t.criado_em)}</span>`,m=t.view_count?`<span style="font-size:12px;color:var(--text-3)">${t.view_count} views</span>`:"",c=(t.tags||[]).map(g=>`<span class="badge" style="background:rgba(255,255,255,.04);color:var(--text-2);border:1px solid var(--line);font-size:10px">${r(g)}</span>`).join(" ");return`
      <div class="tw" style="margin-bottom:14px;padding:18px" data-pid="${t.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:10px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">${d}${p}${m}</div>
            <h3 style="font-size:18px;font-weight:600;margin-bottom:4px;color:var(--text)">${r(t.titulo)}</h3>
            <div style="font-size:12px;color:var(--text-3);font-family:ui-monospace,monospace">/blog/${r(t.slug)}</div>
            ${t.resumo?`<div style="font-size:13px;color:var(--text-2);margin-top:8px;line-height:1.5">${r(t.resumo)}</div>`:""}
            ${c?`<div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${c}</div>`:""}
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
            <button class="btn bg bsm post-edit" data-pid="${t.id}">Editar</button>
            ${o?`<a class="btn bg bsm" href="${M}/blog/${r(t.slug)}" target="_blank" style="text-decoration:none;text-align:center">Ver no site →</a>
                 <button class="btn bg bsm post-unpublish" data-pid="${t.id}">Despublicar</button>`:`<button class="btn bp bsm post-publish" data-pid="${t.id}">Publicar</button>`}
            <button class="btn bd bsm post-del" data-pid="${t.id}">Excluir</button>
          </div>
        </div>
      </div>`}).join("");e.innerHTML=`<div>${l}</div>`,e.querySelectorAll(".post-edit").forEach(t=>t.addEventListener("click",()=>{const o=u.find(d=>d.id===t.dataset.pid);o&&_(o)})),e.querySelectorAll(".post-publish").forEach(t=>t.addEventListener("click",()=>$(t.dataset.pid,!0))),e.querySelectorAll(".post-unpublish").forEach(t=>t.addEventListener("click",()=>$(t.dataset.pid,!1))),e.querySelectorAll(".post-del").forEach(t=>t.addEventListener("click",()=>I(t.dataset.pid)))}async function $(e,a){const s=u.find(o=>o.id===e);if(!s)return;const l={publicado:a,atualizado_em:new Date().toISOString()};a&&!s.publicado_em&&(l.publicado_em=new Date().toISOString());const{error:t}=await b.from("blog_posts").update(l).eq("id",e);if(t){i("Erro: "+t.message,"err");return}i(a?"Publicado ✓":"Despublicado"),E()}async function I(e){const a=u.find(l=>l.id===e);if(!a||!confirm(`Excluir post "${a.titulo}"? Essa ação é permanente.`))return;const{error:s}=await b.from("blog_posts").delete().eq("id",e);if(s){i("Erro: "+s.message,"err");return}i("Post excluído"),E()}function _(e={}){const a=!e.id,s=(e.tags||[]).join(", ");z(a?"Novo post":"Editar post",`
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Título *</label>
      <input class="fi" id="bp-titulo" value="${n(e.titulo||"")}" placeholder="Ex: Quanto custa anúncio no Instagram em Taubaté">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Slug (URL) <span style="color:var(--text-3);font-weight:400">— auto-gerado se vazio</span></label>
      <input class="fi" id="bp-slug" value="${n(e.slug||"")}" placeholder="anuncio-instagram-taubate" style="font-family:ui-monospace,monospace">
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">URL final: <span style="color:var(--accent);font-family:ui-monospace,monospace">/blog/<span id="bp-slug-preview">${n(e.slug||"...")}</span></span></div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Subtítulo <span style="color:var(--text-3);font-weight:400">(opcional)</span></label>
      <input class="fi" id="bp-subtitulo" value="${n(e.subtitulo||"")}" placeholder="Linha de apoio que aparece logo após o título">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Resumo (meta description) <span style="color:var(--text-3);font-weight:400">— máx 160 caracteres</span></label>
      <textarea class="fta" id="bp-resumo" rows="2" maxlength="200" placeholder="O que esse post entrega. Aparece no Google e nos cards.">${r(e.resumo||"")}</textarea>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">URL da imagem de capa</label>
        <input class="fi" id="bp-cover" value="${n(e.cover_url||"")}" placeholder="https://...">
      </div>
      <div class="fg">
        <label class="fl">Alt da imagem (SEO)</label>
        <input class="fi" id="bp-cover-alt" value="${n(e.cover_alt||"")}" placeholder="Descrição da imagem">
      </div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Tags <span style="color:var(--text-3);font-weight:400">(separadas por vírgula)</span></label>
      <input class="fi" id="bp-tags" value="${n(s)}" placeholder="tráfego pago, taubaté, instagram ads">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Keywords (SEO) <span style="color:var(--text-3);font-weight:400">— meta keywords</span></label>
      <input class="fi" id="bp-keywords" value="${n(e.keywords||"")}" placeholder="agência marketing digital Taubaté, anúncio Instagram">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Conteúdo (Markdown) *</label>
      <textarea class="fta" id="bp-conteudo" rows="18" style="font-family:ui-monospace,monospace;font-size:13px" placeholder="## Subtítulo do post&#10;&#10;Texto em **markdown**.&#10;&#10;- Lista&#10;- Mais um item&#10;&#10;[Link](https://...)">${r(e.conteudo||"")}</textarea>
      <div style="font-size:11px;color:var(--text-3);margin-top:5px">Suporta GFM (Github-flavored Markdown): tabelas, código, listas, blockquote, etc.</div>
    </div>
    <div class="fg">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
        <input type="checkbox" id="bp-publicado" ${e.publicado?"checked":""}>
        <span>Publicar ao salvar (visível em /blog)</span>
      </label>
    </div>
  `,`
    ${a?"":'<button class="btn bd" id="bp-del">Excluir</button>'}
    <button class="btn bg" id="bp-cancel">Cancelar</button>
    <button class="btn bp" id="bp-save">${a?"Criar post":"Salvar"}</button>
  `);const l=document.getElementById("bp-titulo"),t=document.getElementById("bp-slug"),o=document.getElementById("bp-slug-preview");let d=!!e.slug;l.addEventListener("input",()=>{d||(t.value=h(l.value),o.textContent=t.value||"...")}),t.addEventListener("input",()=>{d=!0,t.value=h(t.value),o.textContent=t.value||"..."}),document.getElementById("bp-cancel").addEventListener("click",y),a||document.getElementById("bp-del").addEventListener("click",async()=>{confirm(`Excluir "${e.titulo}"?`)&&(await I(e.id),y())}),document.getElementById("bp-save").addEventListener("click",async()=>{const p=l.value.trim();if(!p)return i("Título é obrigatório","err");const m=t.value.trim()||h(p);if(!m)return i("Slug inválido","err");const c=document.getElementById("bp-conteudo").value.trim();if(!c)return i("Conteúdo é obrigatório","err");const g=document.getElementById("bp-tags").value.split(",").map(L=>L.trim()).filter(Boolean),v=document.getElementById("bp-publicado").checked,S=c.split(/\s+/).filter(Boolean).length,f={titulo:p,slug:m,subtitulo:document.getElementById("bp-subtitulo").value.trim()||null,resumo:document.getElementById("bp-resumo").value.trim()||null,conteudo:c,cover_url:document.getElementById("bp-cover").value.trim()||null,cover_alt:document.getElementById("bp-cover-alt").value.trim()||null,tags:g,keywords:document.getElementById("bp-keywords").value.trim()||null,publicado:v,tempo_leitura_min:Math.max(1,Math.round(S/200)),atualizado_em:new Date().toISOString()};v&&!e.publicado_em&&(f.publicado_em=new Date().toISOString());const k=a?b.from("blog_posts").insert(f).select().single():b.from("blog_posts").update(f).eq("id",e.id).select().single(),{error:x}=await k;if(x)return x.code==="23505"?i("Já existe um post com esse slug","err"):i("Erro: "+x.message,"err");i(a?v?"Post criado e publicado ✓":"Rascunho salvo":"Salvo ✓"),y(),E()})}export{E as render};
