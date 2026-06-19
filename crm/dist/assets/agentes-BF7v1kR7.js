import{d as c,o as C,f as $,t as g,C as D}from"./index-BuQVJmeZ.js";let r=[];const b='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8" width="17" height="11.5" rx="2.5"/><path d="M12 8V4.5"/><circle cx="12" cy="3" r="1.3"/><path d="M8.5 13v1.5M15.5 13v1.5"/><path d="M1.5 13v3M22.5 13v3"/></svg>',O='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z"/></svg>',F='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>',q='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',z='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',P='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',V='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',U='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',i=t=>String(t??"").replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e]);function W(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/6e4);if(e<1)return"agora";if(e<60)return`há ${e} min`;const s=Math.floor(e/60);if(s<24)return`há ${s}h`;const v=Math.floor(s/24);return v<30?`há ${v}d`:new Date(t).toLocaleDateString("pt-BR")}const A=["#4A9EFF","#A78BFA","#34D399","#F5A623","#FF6B9D","#22D3EE"];function K(t){let e=0;for(const s of String(t))e=e*31+s.charCodeAt(0)>>>0;return A[e%A.length]}async function h(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-add-ag">+ Novo agente</button>',document.getElementById("btn-add-ag").addEventListener("click",w);const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>';const{data:e,error:s}=await c.from("agentes").select("*").order("criado_em",{ascending:!1});if(s){t.innerHTML=`<div class="empty">Erro: ${s.message}</div>`;return}if(r=e||[],!r.length){t.innerHTML=`
      <div class="ag-empty">
        ${b}
        <h3>Nenhum agente de IA ainda</h3>
        <p>Crie seu primeiro agente para qualificar leads e agendar reuniões automaticamente.</p>
        <button class="btn bp" id="btn-add-ag2">+ Criar agente</button>
      </div>`,document.getElementById("btn-add-ag2").addEventListener("click",w);return}const v=r.map(n=>{const p=n.status==="ativo";return`
    <div class="acard" data-painel="${n.id}">
      <div class="ach">
        <div class="aav">${b}</div>
        <div class="ahinfo">
          <div class="an">${i(n.nome)}</div>
          <div class="acan">${O}${i(n.canal||"Canal não definido")}</div>
        </div>
        <span class="apill ${p?"on":"off"}">${p?"Ativo":"Inativo"}</span>
      </div>
      ${n.prompt?`<div class="adesc">${i(n.prompt)}</div>`:""}
      ${n.notas?`<div class="anote">${i(n.notas)}</div>`:""}
      <div class="aft">
        <div class="aacts">
          <button class="btn bg bsm edit-ag" data-id="${n.id}">Editar</button>
          <button class="btn bd bsm bic del-ag" data-id="${n.id}">${F}</button>
        </div>
        <span class="adate">abrir painel →</span>
      </div>
    </div>`}).join("");t.innerHTML=`<div class="ag">${v}</div>`,t.addEventListener("click",n=>{const p=n.target.closest(".edit-ag"),u=n.target.closest(".del-ag"),m=n.target.closest(".acard");p?(n.stopPropagation(),G(p.dataset.id)):u?(n.stopPropagation(),Q(u.dataset.id)):m&&B(m.dataset.painel)})}async function B(t){const e=r.find(a=>a.id===t);if(!e){h();return}document.getElementById("tbacts").innerHTML="";const s=document.getElementById("content");s.innerHTML='<div class="empty">Carregando painel...</div>';const{data:v}=await c.from("chatbot_conversations").select("phone, messages, stage, lead_data, updated_at").order("updated_at",{ascending:!1}),n=v||[],u=(await c.from("mensagens").select("id",{count:"exact",head:!0})).count||n.reduce((a,o)=>a+(Array.isArray(o.messages)?o.messages.length:0),0),m=Date.now()-10080*60*1e3,L=a=>{var d;const o=a.messages;return Array.isArray(o)&&o.length?(d=o[o.length-1])==null?void 0:d.role:null},_=n.filter(a=>L(a)==="user").length,x=n.filter(a=>!["opt_out","pausado"].includes(a.stage)&&a.updated_at&&new Date(a.updated_at).getTime()>m).length,f=e.status==="ativo",H=[{ic:z,l:"Conversas",v:n.length,cor:"var(--info)"},{ic:P,l:"Mensagens trocadas",v:u,cor:"var(--text)"},{ic:V,l:"Ativas (7 dias)",v:x,cor:"var(--ok)"},{ic:U,l:"Aguardando resposta",v:_,cor:"var(--warn)"}].map(a=>`
    <div class="apnl-st">
      <div class="apnl-st-ic">${a.ic}</div>
      <div class="apnl-st-l">${a.l}</div>
      <div class="apnl-st-v" style="color:${a.cor}">${a.v.toLocaleString("pt-BR")}</div>
    </div>`).join(""),S=n.slice(0,8).map(a=>{var E;const o=((E=a.lead_data)==null?void 0:E.nome)||a.phone||"—",d=Array.isArray(a.messages)?a.messages:[],l=d.length?d[d.length-1]:null,T=l!=null&&l.content?l.content.replace(/\s+/g," ").trim():"Sem mensagens",j=a.stage==="opt_out",N=(l==null?void 0:l.role)==="user",k=j?["off","Encerrada"]:N?["wait","Aguardando"]:["on","Ativa"],R=(o.replace(/[^a-zA-Z0-9]/g,"")[0]||"#").toUpperCase(),y=K(o);return`
      <div class="apnl-conv-row">
        <div class="apnl-av" style="background:${y}22;color:${y}">${R}</div>
        <div class="apnl-cinfo">
          <div class="apnl-cname">${i(o)}</div>
          <div class="apnl-cmsg">${i(T)}</div>
        </div>
        <div class="apnl-cmeta">
          <span class="apnl-chip ${k[0]}">${k[1]}</span>
          <span class="apnl-ctime">${W(a.updated_at)}</span>
        </div>
      </div>`}).join("");s.innerHTML=`
    <div class="apnl">
      <div class="apnl-back" id="apnl-back">${q} Voltar para agentes</div>

      <div class="apnl-head">
        <div class="apnl-hic">${b}</div>
        <div>
          <div class="apnl-title">${i(e.nome)}</div>
          <div class="apnl-sub">${i(e.canal||"WhatsApp")} · IA: <b>Groq llama-3.3-70b</b> + OpenRouter</div>
        </div>
      </div>

      <div class="apnl-banner ${f?"on":"off"}">
        <span><span class="dot"></span>${f?"Bot ativo — respondendo no WhatsApp":"Bot desativado — não está respondendo mensagens"}</span>
        <button class="apnl-toggle" id="apnl-toggle">${f?"Desativar bot":"Ativar bot"}</button>
      </div>

      <div class="apnl-stats">${H}</div>

      <div class="apnl-conv">
        <div class="apnl-conv-h">Conversas recentes</div>
        ${S||'<div class="empty" style="padding:28px">Nenhuma conversa ainda.</div>'}
      </div>
    </div>`,document.getElementById("apnl-back").addEventListener("click",h),document.getElementById("apnl-toggle").addEventListener("click",async()=>{const a=f?"inativo":"ativo",{error:o}=await c.from("agentes").update({status:a}).eq("id",e.id);if(o){g("Erro ao alterar status.","er");return}e.status=a;const d=r.findIndex(l=>l.id===e.id);d>=0&&(r[d].status=a),g(a==="ativo"?"Bot ativado.":"Bot desativado."),B(t)})}function I(t={}){const e=D.map(s=>`<option value="${s}"${t.canal===s?" selected":""}>${s}</option>`).join("");return`
    <div class="frow">
      <div class="fg"><label class="fl">Nome *</label><input class="fi" id="agn" value="${i(t.nome||"")}" placeholder="Ex: Qualificador WA"></div>
      <div class="fg"><label class="fl">Canal</label>
        <select class="fsl" id="agc"><option value="">Selecione...</option>${e}</select>
      </div>
    </div>
    <div class="fg"><label class="fl">Status</label>
      <select class="fsl" id="agst">
        <option value="ativo"${t.status==="ativo"?" selected":""}>Ativo</option>
        <option value="inativo"${t.status==="inativo"?" selected":""}>Inativo</option>
      </select>
    </div>
    <div class="fg"><label class="fl">Prompt / Instrução</label>
      <textarea class="fta" id="agp" style="min-height:110px;font-family:ui-monospace,monospace;font-size:12px">${i(t.prompt||"")}</textarea>
    </div>
    <div class="fg"><label class="fl">Notas</label><textarea class="fta" id="agno">${i(t.notas||"")}</textarea></div>`}function w(){C("Novo agente IA",I(),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",$),document.getElementById("m-save").addEventListener("click",()=>M())}function G(t){const e=r.find(s=>s.id===t);e&&(C("Editar agente",I(e),`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Salvar</button>`),document.getElementById("m-cancel").addEventListener("click",$),document.getElementById("m-save").addEventListener("click",()=>M(t)))}async function M(t){const e={nome:document.getElementById("agn").value.trim(),canal:document.getElementById("agc").value,status:document.getElementById("agst").value,prompt:document.getElementById("agp").value.trim(),notas:document.getElementById("agno").value.trim()};if(!e.nome){g("Nome obrigatório.","er");return}const{error:s}=t?await c.from("agentes").update(e).eq("id",t):await c.from("agentes").insert(e);if(s){g("Erro.","er");return}g(t?"Agente atualizado.":"Agente criado."),$(),h()}async function Q(t){confirm("Remover agente?")&&(await c.from("agentes").delete().eq("id",t),g("Removido."),h())}export{h as render};
