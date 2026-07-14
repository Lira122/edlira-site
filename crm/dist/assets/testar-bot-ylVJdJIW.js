import{t as h,k as y}from"./index-DduhYjoe.js";let n=[],d="inicio",o={},c=!1;const p=[{lbl:'👋 "Oi"',txt:"Oi"},{lbl:'🙋 "Tudo bem? Quem fala?"',txt:"Tudo bem? Quem fala?"},{lbl:'🤔 "Por que está me chamando?"',txt:"Por que tá me chamando?"},{lbl:"🏪 Lead engajado",txt:"Oi! Sou a Maria, tenho uma loja de roupa aqui em Taubaté. Conta mais."},{lbl:"😒 Lead frio",txt:"Não tô interessado em nada, valeu"},{lbl:"💰 Pergunta preço",txt:"Quanto vocês cobram?"},{lbl:"🤖 Desconfia bot",txt:"Isso é um bot né?"},{lbl:"🏁 Lead encerrou negócio",txt:"Vendi a empresa ano passado, tô aposentado"}];async function k(){const e=document.getElementById("content");e.innerHTML=x(),E(e)}function x(){return`
  <div class="tb">
    <div class="tb-side">
      <div class="tb-block">
        <div class="tb-block-tit">Estado da conversa</div>
        <div class="tb-state">
          <div><span class="tb-k">Estágio</span><span class="tb-v" id="tb-stage">${b(d)}</span></div>
          <div><span class="tb-k">Mensagens</span><span class="tb-v" id="tb-count">${n.length}</span></div>
        </div>
        <div class="tb-lead-data" id="tb-lead">${g()}</div>
        <button class="btn bd bsm" id="tb-reset" style="width:100%;margin-top:14px">↻ Limpar conversa</button>
      </div>

      <div class="tb-block">
        <div class="tb-block-tit">Cenários rápidos</div>
        <div class="tb-sugs">
          ${p.map((e,t)=>`<button class="tb-sug" data-sug="${t}">${e.lbl}</button>`).join("")}
        </div>
      </div>

      <div class="tb-block tb-hint">
        <div class="tb-block-tit">⚠️ Modo sandbox</div>
        <div class="tb-hint-txt">
          As mensagens NÃO vão pro WhatsApp.<br>
          Não criam lead, não logam disparo.<br>
          Só roda a IA pra você ver a resposta.
        </div>
      </div>
    </div>

    <div class="tb-chat">
      <div class="tb-chat-body" id="tb-body">
        ${n.length?n.map(f).join(""):m()}
      </div>
      <form class="tb-input" id="tb-form">
        <textarea id="tb-text" placeholder="Digita como se fosse o lead respondendo no Zap..." rows="1"></textarea>
        <button type="submit" class="tb-send" id="tb-send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  </div>`}function m(){return`<div class="tb-empty">
    <div class="tb-empty-ico">💬</div>
    <div class="tb-empty-tit">Manda a primeira mensagem</div>
    <div class="tb-empty-sub">Você é o LEAD. Escreve aqui como se tivesse recebido o disparo de prospecção.<br>O Lira-IA vai responder do outro lado.</div>
  </div>`}function g(){const e=Object.keys(o).filter(t=>{var s;return o[t]&&(typeof o[t]!="object"||((s=o[t])==null?void 0:s.length))});return e.length?e.map(t=>`<div><span class="tb-k">${t}</span><span class="tb-v">${b(String(Array.isArray(o[t])?o[t].join(", "):o[t]))}</span></div>`).join(""):'<div class="tb-lead-empty">— ainda sem dados capturados</div>'}function f(e){const t=e.role==="user"?"lead":"bot";return`<div class="tb-msg ${t}">
    ${t==="bot"?'<div class="tb-msg-av">🤖</div>':""}
    <div class="tb-msg-bubble">${b(e.content)}</div>
  </div>`}function E(e){var i;(i=e.querySelector("#tb-reset"))==null||i.addEventListener("click",()=>{confirm("Limpar a conversa de teste?")&&(n=[],d="inicio",o={},k())}),e.querySelectorAll("[data-sug]").forEach(a=>{a.addEventListener("click",()=>{const r=p[+a.dataset.sug];u(r.txt)})});const t=e.querySelector("#tb-form"),s=e.querySelector("#tb-text");t==null||t.addEventListener("submit",a=>{a.preventDefault();const r=s.value;s.value="",s.style.height="auto",u(r)}),s==null||s.addEventListener("keydown",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),t.requestSubmit())}),s==null||s.addEventListener("input",()=>{s.style.height="auto",s.style.height=Math.min(120,s.scrollHeight)+"px"})}async function u(e){if(e=String(e||"").trim(),!(!e||c)){c=!0,n.push({role:"user",content:e}),v({thinking:!0});try{const t=await S(e);if(!t.ok)throw new Error(t.erro||"falha");const s=Array.isArray(t.messages)?t.messages:[String(t.messages||"")];for(const i of s)i&&n.push({role:"assistant",content:i});d=t.stage||d,o={...o,...t.lead_data||{}},t.action==="book"&&h("🗓️ Bot retornou action=book (em produção agendaria no Cal.com)")}catch(t){n.push({role:"assistant",content:"⚠️ Erro ao chamar a IA: "+(t.message||t)})}finally{c=!1,v({thinking:!1})}}}function v({thinking:e}){const t=document.getElementById("tb-body"),s=document.getElementById("tb-stage"),i=document.getElementById("tb-count"),a=document.getElementById("tb-lead");if(!t)return;let r=n.map(f).join("");n.length||(r=m()),e&&(r+='<div class="tb-msg bot"><div class="tb-msg-av">🤖</div><div class="tb-msg-bubble tb-typing">digitando…</div></div>'),t.innerHTML=r,t.scrollTop=t.scrollHeight,s&&(s.textContent=d),i&&(i.textContent=n.length),a&&(a.innerHTML=g())}async function S(e){var r;const{data:t}=await y.auth.getSession(),s=(r=t==null?void 0:t.session)==null?void 0:r.access_token;if(!s)throw new Error("Sessão expirou. Faça login de novo.");const i=n.slice(0,-1).map(l=>({role:l.role,content:l.content})),a=await fetch("https://flzpblpegoqjxaacjvhf.supabase.co/functions/v1/bot-test",{method:"POST",headers:{Authorization:"Bearer "+s,"Content-Type":"application/json"},body:JSON.stringify({history:i,userMessage:e,stage:d,lead_data:o})});if(!a.ok){const l=await a.text().catch(()=>"");return{ok:!1,erro:`bot-test ${a.status}: ${l.slice(0,200)}`}}return await a.json()}function b(e){return String(e||"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}export{k as render};
