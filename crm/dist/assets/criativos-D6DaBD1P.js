import{s as b,d as v,t as c}from"./index-Dta-29re.js";const y=[{value:"ad",label:"📣 Anúncio / Ad",ratio:"1:1"},{value:"carrossel",label:"🎠 Carrossel",ratio:"4:5"},{value:"produto",label:"📦 Foto de Produto",ratio:"1:1"},{value:"cinematic",label:"🎬 Cinematic / Story",ratio:"9:16"},{value:"auto",label:"✨ Auto (IA decide)",ratio:"1:1"}],f=[{value:"1:1",label:"Quadrado 1:1 (Feed)"},{value:"4:5",label:"Retrato 4:5 (Instagram)"},{value:"9:16",label:"Story / Reels 9:16"},{value:"16:9",label:"Landscape 16:9 (YouTube)"}];let g=[],p=[];async function x(){const o=document.getElementById("content");o.innerHTML='<div class="empty">Carregando...</div>';const{data:a}=await b("clientes",{columns:"id, nome, empresa, servico, segmento",order:{column:"nome"}});g=a||[];const{data:l}=await v.from("criativos").select("*").order("criado_em",{ascending:!1}).limit(20);p=l||[],h()}function h(){const o=document.getElementById("content"),a='<option value="">— Selecione um cliente (opcional) —</option>'+g.map(e=>`<option value="${e.id}" data-nome="${e.nome}" data-empresa="${e.empresa||""}" data-servico="${e.servico||""}">${e.nome}${e.empresa?` — ${e.empresa}`:""}</option>`).join(""),l=y.map(e=>`<option value="${e.value}" data-ratio="${e.ratio}">${e.label}</option>`).join(""),i=f.map(e=>`<option value="${e.value}">${e.label}</option>`).join(""),r=p.length?`
    <div class="tw" style="margin-top:24px">
      <div class="th"><h3>Criativos gerados</h3></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:16px">
        ${p.map(e=>{var t;return`
          <div style="border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--card)">
            <img src="${e.url}" style="width:100%;aspect-ratio:1;object-fit:cover;display:block" loading="lazy">
            <div style="padding:10px">
              <div style="font-size:11px;font-weight:600;color:var(--text-2);margin-bottom:2px">${((t=e.tipo)==null?void 0:t.toUpperCase())||"—"}</div>
              <div style="font-size:12px;color:var(--text-3);margin-bottom:8px">${e.cliente_nome||"Sem cliente"}</div>
              <div style="display:flex;gap:6px">
                <a href="${e.url}" target="_blank" class="btn bg bsm" style="text-decoration:none;flex:1;text-align:center">Ver</a>
                <button class="btn bg bsm copy-url" data-url="${e.url}" style="flex:1">Copiar URL</button>
              </div>
            </div>
          </div>`}).join("")}
      </div>
    </div>`:"";o.innerHTML=`
    <div class="tw">
      <div class="th">
        <h3>Gerar Criativo com IA</h3>
        <div style="font-size:12px;color:var(--text-3)">Powered by Higgsfield AI</div>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:16px;max-width:680px">

        <div class="frow">
          <div class="fg">
            <label class="fl">Cliente (opcional)</label>
            <select class="fsl" id="cr-cliente">${a}</select>
          </div>
          <div class="fg">
            <label class="fl">Tipo de criativo</label>
            <select class="fsl" id="cr-tipo">${l}</select>
          </div>
        </div>

        <div class="frow">
          <div class="fg">
            <label class="fl">Proporção</label>
            <select class="fsl" id="cr-ratio">${i}</select>
          </div>
          <div class="fg">
            <label class="fl">Segmento / nicho</label>
            <input class="fi" id="cr-segmento" placeholder="Ex: e-commerce, academia, clínica...">
          </div>
        </div>

        <div class="fg">
          <label class="fl">Headline / mensagem principal</label>
          <input class="fi" id="cr-headline" placeholder="Ex: Aumente seu faturamento 3x em 90 dias">
        </div>

        <div class="frow">
          <div class="fg">
            <label class="fl">CTA (chamada pra ação)</label>
            <input class="fi" id="cr-cta" placeholder="Ex: Fale com a gente, Saiba mais...">
          </div>
          <div class="fg">
            <label class="fl">Serviço / produto</label>
            <input class="fi" id="cr-servico" placeholder="Ex: Tráfego pago + IA">
          </div>
        </div>

        <div class="fg">
          <label class="fl">Estilo visual (opcional)</label>
          <input class="fi" id="cr-estilo" placeholder="Ex: dark, neon green, minimalista, colorido...">
        </div>

        <div class="fg" style="display:none" id="cr-prompt-row">
          <label class="fl">Prompt customizado (avançado)</label>
          <textarea class="fta" id="cr-prompt" placeholder="Descreva o que quer gerar em inglês..."></textarea>
        </div>

        <div style="display:flex;align-items:center;gap:12px">
          <button class="btn bp" id="cr-gerar" style="min-width:160px">Gerar criativo</button>
          <button class="btn bg" id="cr-toggle-prompt" style="font-size:11px">+ Prompt avançado</button>
          <div id="cr-status" style="font-size:12px;color:var(--text-3)"></div>
        </div>

        <div id="cr-resultado" style="display:none;margin-top:8px">
          <img id="cr-img" src="" style="max-width:100%;border-radius:10px;border:1px solid var(--line)">
          <div style="display:flex;gap:8px;margin-top:10px">
            <a id="cr-download" href="#" target="_blank" class="btn bp bsm" style="text-decoration:none">⬇ Baixar</a>
            <button id="cr-copy-url" class="btn bg bsm">Copiar URL</button>
            <button id="cr-salvar" class="btn bg bsm">Salvar no histórico</button>
          </div>
        </div>

      </div>
    </div>
    ${r}`;const n=document.getElementById("cr-tipo");n.addEventListener("change",()=>{const t=n.options[n.selectedIndex].dataset.ratio;t&&(document.getElementById("cr-ratio").value=t)}),document.getElementById("cr-cliente").addEventListener("change",e=>{const t=e.target.options[e.target.selectedIndex];t.dataset.servico&&(document.getElementById("cr-servico").value=t.dataset.servico)}),document.getElementById("cr-toggle-prompt").addEventListener("click",()=>{const e=document.getElementById("cr-prompt-row"),t=document.getElementById("cr-toggle-prompt"),s=e.style.display==="none";e.style.display=s?"":"none",t.textContent=s?"- Ocultar prompt":"+ Prompt avançado"}),document.getElementById("cr-gerar").addEventListener("click",E),o.querySelectorAll(".copy-url").forEach(e=>{e.addEventListener("click",()=>{navigator.clipboard.writeText(e.dataset.url).then(()=>{e.textContent="Copiado!",setTimeout(()=>e.textContent="Copiar URL",2e3)})})})}async function E(){var s;const o=document.getElementById("cr-gerar"),a=document.getElementById("cr-status"),l=document.getElementById("cr-resultado"),i=document.getElementById("cr-cliente"),r=i.options[i.selectedIndex],n=((s=r==null?void 0:r.dataset)==null?void 0:s.nome)||"",e=i.value||null,t={tipo:document.getElementById("cr-tipo").value,ratio:document.getElementById("cr-ratio").value,cliente:n,segmento:document.getElementById("cr-segmento").value.trim(),headline:document.getElementById("cr-headline").value.trim(),cta:document.getElementById("cr-cta").value.trim(),servico:document.getElementById("cr-servico").value.trim(),estilo:document.getElementById("cr-estilo").value.trim(),prompt:document.getElementById("cr-prompt").value.trim()||void 0};if(!t.headline&&!t.prompt){c("Preencha pelo menos a headline ou o prompt.","er");return}o.disabled=!0,o.textContent="Gerando...",a.textContent="⏳ Aguardando a IA... (pode levar ~30s)",l.style.display="none";try{const{data:d,error:u}=await v.functions.invoke("gerar-criativo",{body:t});if(u)throw u;if(!d.ok)throw new Error(d.error||"Erro desconhecido");const m=d.url;a.textContent="✅ Criativo gerado!",document.getElementById("cr-img").src=m,document.getElementById("cr-download").href=m,document.getElementById("cr-copy-url").onclick=()=>{navigator.clipboard.writeText(m).then(()=>c("URL copiada!"))},document.getElementById("cr-salvar").onclick=()=>I(m,t,e,n),l.style.display=""}catch(d){c(`Erro: ${d.message}`,"er"),a.textContent=""}finally{o.disabled=!1,o.textContent="Gerar criativo"}}async function I(o,a,l,i){const{error:r}=await v.from("criativos").insert({url:o,tipo:a.tipo,ratio:a.ratio,headline:a.headline,cliente_id:l,cliente_nome:i,prompt:a.prompt||null,criado_em:new Date().toISOString()});if(r){c("Erro ao salvar.","er");return}c("Salvo no histórico!"),x()}export{x as render};
