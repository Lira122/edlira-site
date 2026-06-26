import{d as r,h,t as d}from"./index-CO9aTG8d.js";const c="empresa-assets",E=[{value:"contrato",label:"Contrato"},{value:"briefing",label:"Briefing"},{value:"apresentacao",label:"Apresentação"},{value:"proposta",label:"Proposta comercial"},{value:"marca",label:"Manual da marca"},{value:"financeiro",label:"Financeiro"},{value:"outros",label:"Outros"}],$=Object.fromEntries(E.map(e=>[e.value,e.label]));let f=null,m=[];async function v(){document.getElementById("tbacts").innerHTML="";const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';const{data:t,error:i}=await r.from("empresa_perfil").select("*").eq("id","main").maybeSingle();if(i){e.innerHTML=`<div class="empty">Erro: ${i.message}<br><br>Rode <code>supabase/empresa.sql</code> no SQL Editor primeiro.</div>`;return}t?f=t:(await r.from("empresa_perfil").insert({id:"main"}),f={id:"main"});const{data:a}=await r.from("empresa_documentos").select("*").order("criado_em",{ascending:!1});m=a||[],w()}function w(){const e=f,t=document.getElementById("content"),i=m.length?m.map(a=>`
    <div class="doc-row" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line)">
      <div style="font-size:24px;flex-shrink:0">${C(a.mime_type)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:500">${o(a.nome)}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:2px">
          ${a.categoria?`<span style="display:inline-block;padding:1px 7px;background:rgba(255,255,255,.05);border-radius:8px;margin-right:8px">${o($[a.categoria]||a.categoria)}</span>`:""}
          ${D(a.tamanho_bytes)} · ${h(a.criado_em)}
        </div>
        ${a.descricao?`<div style="font-size:12px;color:var(--text-2);margin-top:4px">${o(a.descricao)}</div>`:""}
      </div>
      <a href="${a.arquivo_url}" target="_blank" rel="noopener" class="btn bg bsm" style="text-decoration:none;flex-shrink:0">Abrir</a>
      <button class="btn bd bsm del-doc" data-id="${a.id}" data-path="${o(a.arquivo_path||"")}" style="flex-shrink:0">Remover</button>
    </div>`).join(""):'<div class="empty" style="padding:30px">Nenhum documento ainda. Suba o primeiro acima.</div>';t.innerHTML=`
    <!-- IDENTIDADE -->
    <div class="tw" style="margin-bottom:22px">
      <div class="th"><h3>Identidade da empresa</h3></div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;max-width:980px">

        <div style="display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap">
          <div style="flex-shrink:0">
            <div style="width:130px;height:130px;border:1px dashed var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg-card)">
              ${e.logo_url?`<img src="${e.logo_url}" style="max-width:100%;max-height:100%;object-fit:contain">`:'<span style="font-size:11px;color:var(--text-3)">Sem logo</span>'}
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">
              <input type="file" id="logo-input" accept="image/*" style="display:none">
              <button class="btn bg bsm" id="logo-btn">${e.logo_url?"Trocar logo":"Subir logo"}</button>
              ${e.logo_url?'<button class="btn bd bsm" id="logo-clear">Remover</button>':""}
            </div>
          </div>

          <div style="flex:1;min-width:280px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="fg"><label class="fl">Nome fantasia</label><input class="fi" id="ep-nome" value="${o(e.nome_fantasia)}" placeholder="Eleva Digital"></div>
            <div class="fg"><label class="fl">Razão social</label><input class="fi" id="ep-razao" value="${o(e.razao_social)}" placeholder="Eleva Digital LTDA"></div>
            <div class="fg"><label class="fl">CNPJ</label><input class="fi" id="ep-cnpj" value="${o(e.cnpj)}" placeholder="00.000.000/0001-00"></div>
            <div class="fg"><label class="fl">Site</label><input class="fi" id="ep-site" value="${o(e.site_url)}" placeholder="https://elevabrands.com.br"></div>
            <div class="fg"><label class="fl">E-mail</label><input class="fi" id="ep-email" value="${o(e.email)}" placeholder="junior@elevabrands.com.br"></div>
            <div class="fg"><label class="fl">WhatsApp</label><input class="fi" id="ep-whats" value="${o(e.whatsapp)}" placeholder="(12) 98166-8507"></div>
          </div>
        </div>

        <div class="fg"><label class="fl">Slogan / tagline</label><input class="fi" id="ep-slogan" value="${o(e.slogan)}" placeholder="Tráfego pago + IA que escala negócios"></div>
        <div class="fg"><label class="fl">Descrição da empresa</label><textarea class="fta" id="ep-descricao" style="min-height:80px">${o(e.descricao)}</textarea></div>
        <div class="frow">
          <div class="fg"><label class="fl">Missão</label><textarea class="fta" id="ep-missao">${o(e.missao)}</textarea></div>
          <div class="fg"><label class="fl">Valores</label><textarea class="fta" id="ep-valores">${o(e.valores)}</textarea></div>
        </div>

        <div style="border-top:1px solid var(--line);padding-top:16px">
          <div style="font-size:11px;font-weight:600;color:var(--text-3);margin-bottom:10px;text-transform:uppercase;letter-spacing:.08em">Identidade Visual</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
            ${b("1","Cor primária",e.cor_primaria||"#C5F82A")}
            ${b("2","Cor secundária",e.cor_secundaria||"#0A0A0A")}
            ${b("3","Cor terciária",e.cor_terciaria||"#FFFFFF")}
            <div class="fg"><label class="fl">Tipografia</label><input class="fi" id="ep-tipo" value="${o(e.tipografia)}" placeholder="Inter, Manrope..."></div>
          </div>
        </div>

        <div class="fg"><label class="fl">Endereço</label><input class="fi" id="ep-end" value="${o(e.endereco)}" placeholder="Rua exemplo, 123 — São José dos Campos, SP"></div>

        <div style="display:flex;gap:10px;align-items:center;padding-top:6px">
          <button class="btn bp" id="ep-salvar">Salvar identidade</button>
          ${e.atualizado_em?`<span style="font-size:11px;color:var(--text-3)">Atualizado em ${h(e.atualizado_em)}</span>`:""}
        </div>
      </div>
    </div>

    <!-- DOCUMENTOS -->
    <div class="tw">
      <div class="th"><h3>Documentos <span style="color:var(--text-3);font-weight:400">(${m.length})</span></h3></div>
      <div style="padding:16px 18px;border-bottom:1px solid var(--line)">
        <div style="display:grid;grid-template-columns:180px 1fr 1.4fr auto;gap:10px;align-items:end">
          <div class="fg"><label class="fl">Categoria</label>
            <select class="fsl" id="doc-cat">${E.map(a=>`<option value="${a.value}">${a.label}</option>`).join("")}</select>
          </div>
          <div class="fg"><label class="fl">Nome do documento</label><input class="fi" id="doc-nome" placeholder="Ex: Contrato modelo 2026"></div>
          <div class="fg"><label class="fl">Descrição (opcional)</label><input class="fi" id="doc-desc" placeholder="Notas sobre o documento..."></div>
          <div style="display:flex;flex-direction:column;gap:6px">
            <input type="file" id="doc-file" style="font-size:11px;color:var(--text-2)">
            <button type="button" class="btn bp bsm" id="doc-upload">Enviar</button>
          </div>
        </div>
        <div id="doc-status" style="font-size:12px;color:var(--text-3);margin-top:8px"></div>
      </div>
      <div id="doc-list">${i}</div>
    </div>`,document.getElementById("logo-btn").addEventListener("click",()=>document.getElementById("logo-input").click()),document.getElementById("logo-input").addEventListener("change",I),e.logo_url&&document.getElementById("logo-clear").addEventListener("click",B);for(const a of["1","2","3"]){const s=document.getElementById("ep-cor"+a),n=document.getElementById("ep-cor"+a+"-txt");s.addEventListener("input",()=>{n.value=s.value.toUpperCase()}),n.addEventListener("change",()=>{const l=n.value.trim();/^#[0-9a-f]{6}$/i.test(l)&&(s.value=l)})}document.getElementById("ep-salvar").addEventListener("click",z),document.getElementById("doc-upload").addEventListener("click",S),t.querySelectorAll(".del-doc").forEach(a=>a.addEventListener("click",()=>L(a.dataset.id,a.dataset.path)))}function b(e,t,i){return`
    <div class="fg">
      <label class="fl">${t}</label>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="color" id="ep-cor${e}" value="${i}" style="width:44px;height:36px;border:1px solid var(--line);border-radius:6px;background:transparent;cursor:pointer;padding:2px">
        <input class="fi" id="ep-cor${e}-txt" value="${o(i)}" placeholder="#000000" style="flex:1;font-family:ui-monospace,monospace;font-size:12px">
      </div>
    </div>`}async function I(e){var p;const t=(p=e.target.files)==null?void 0:p[0];if(!t)return;if(!t.type.startsWith("image/")){d("Selecione uma imagem.","er");return}const i=(t.name.split(".").pop()||"png").toLowerCase(),a=`logos/logo-${Date.now()}.${i}`,{error:s}=await r.storage.from(c).upload(a,t,{upsert:!0,contentType:t.type});if(s){d("Erro no upload: "+s.message,"er");return}const{data:{publicUrl:n}}=r.storage.from(c).getPublicUrl(a),{error:l}=await r.from("empresa_perfil").update({logo_url:n,atualizado_em:new Date().toISOString()}).eq("id","main");if(l){d("Erro ao salvar: "+l.message,"er");return}d("Logo atualizado."),v()}async function B(){confirm("Remover o logo?")&&(await r.from("empresa_perfil").update({logo_url:null,atualizado_em:new Date().toISOString()}).eq("id","main"),d("Logo removido."),v())}async function z(){const e=n=>{const l=document.getElementById(n);return l&&l.value.trim()||null},t=(n,l)=>e(n)||document.getElementById(l).value,i={nome_fantasia:e("ep-nome"),razao_social:e("ep-razao"),cnpj:e("ep-cnpj"),site_url:e("ep-site"),email:e("ep-email"),whatsapp:e("ep-whats"),slogan:e("ep-slogan"),descricao:e("ep-descricao"),missao:e("ep-missao"),valores:e("ep-valores"),cor_primaria:t("ep-cor1-txt","ep-cor1"),cor_secundaria:t("ep-cor2-txt","ep-cor2"),cor_terciaria:t("ep-cor3-txt","ep-cor3"),tipografia:e("ep-tipo"),endereco:e("ep-end"),atualizado_em:new Date().toISOString()},a=document.getElementById("ep-salvar");a.disabled=!0;const{error:s}=await r.from("empresa_perfil").update(i).eq("id","main");if(a.disabled=!1,s){d("Erro ao salvar: "+s.message,"er");return}d("Identidade salva."),Object.assign(f,i)}async function S(){var x;const e=document.getElementById("doc-file"),t=(x=e.files)==null?void 0:x[0];if(!t){d("Selecione um arquivo.","er");return}const i=document.getElementById("doc-nome").value.trim()||t.name,a=document.getElementById("doc-desc").value.trim()||null,s=document.getElementById("doc-cat").value,n=document.getElementById("doc-status"),l=document.getElementById("doc-upload"),p=t.name.replace(/[^a-z0-9.\-_]/gi,"_"),g=`docs/${s}/${Date.now()}-${p}`;n.textContent="Enviando...",l.disabled=!0;try{const{error:u}=await r.storage.from(c).upload(g,t,{contentType:t.type||"application/octet-stream"});if(u)throw u;const{data:{publicUrl:_}}=r.storage.from(c).getPublicUrl(g),{error:y}=await r.from("empresa_documentos").insert({nome:i,descricao:a,categoria:s,arquivo_url:_,arquivo_path:g,tamanho_bytes:t.size,mime_type:t.type||null});if(y)throw y;d("Documento enviado."),e.value="",document.getElementById("doc-nome").value="",document.getElementById("doc-desc").value="",v()}catch(u){d("Erro: "+u.message,"er"),n.textContent=""}finally{l.disabled=!1}}async function L(e,t){if(!confirm("Remover este documento?"))return;t&&await r.storage.from(c).remove([t]);const{error:i}=await r.from("empresa_documentos").delete().eq("id",e);if(i){d("Erro ao remover: "+i.message,"er");return}d("Documento removido."),v()}function o(e){return(e??"").toString().replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function D(e){return e?e<1024?e+" B":e<1024*1024?(e/1024).toFixed(1)+" KB":(e/1024/1024).toFixed(1)+" MB":"—"}function C(e){return e?e.startsWith("image/")?"🖼️":e.includes("pdf")?"📕":e.includes("word")||e.includes("msword")||e.includes("officedocument.wordprocessing")?"📘":e.includes("sheet")||e.includes("excel")?"📗":e.includes("presentation")||e.includes("powerpoint")?"📙":e.includes("zip")||e.includes("rar")||e.includes("compressed")?"🗜️":e.startsWith("video/")?"🎬":e.startsWith("audio/")?"🎵":"📄":"📄"}export{v as render};
