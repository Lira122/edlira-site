import{t as l,d as g,s as I,o as z,f as w}from"./index-DKGUaEev.js";let u=null,v=null,y=null;const M=600*1e3,d=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),E=e=>btoa(String.fromCharCode(...new Uint8Array(e))),C=e=>Uint8Array.from(atob(e),t=>t.charCodeAt(0)),L=new TextEncoder,q=new TextDecoder;async function _(e,t){const a=C(t),r=await crypto.subtle.importKey("raw",L.encode(e),"PBKDF2",!1,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:a,iterations:31e4,hash:"SHA-256"},r,{name:"AES-GCM",length:256},!1,["encrypt","decrypt"])}async function $(e,t){const a=crypto.getRandomValues(new Uint8Array(12)),r=await crypto.subtle.encrypt({name:"AES-GCM",iv:a},e,L.encode(t));return{cifrado:E(r),iv:E(a)}}async function x(e,t,a){try{const r=C(t),s=C(a),o=await crypto.subtle.decrypt({name:"AES-GCM",iv:s},e,r);return q.decode(o)}catch{return null}}function F(e=16){const t=crypto.getRandomValues(new Uint8Array(e));return E(t)}function b(){y&&clearTimeout(y),y=setTimeout(()=>{u=null,l("Cofre travado por inatividade (10 min)","warn"),document.body.dataset.view==="senhas"&&h()},M)}function H(){u=null,y&&(clearTimeout(y),y=null),h(),l("Cofre travado")}async function k(){const{data:e,error:t}=await g.from("vault_meta").select("*").eq("id",1).maybeSingle();if(t)throw new Error(t.message);return e}async function D(e){const t=F(16),a=await _(e,t),{cifrado:r,iv:s}=await $(a,"OK"),{error:o}=await g.from("vault_meta").insert({id:1,salt:t,verify_cifrado:r,verify_iv:s});if(o)throw new Error(o.message);return{key:a,meta:{salt:t,verify_cifrado:r,verify_iv:s}}}async function K(e){if(v||(v=await k()),!v){const{key:r}=await D(e);return u=r,v=await k(),!0}const t=await _(e,v.salt);return await x(t,v.verify_cifrado,v.verify_iv)!=="OK"?!1:(u=t,!0)}async function h(){const e=document.getElementById("content");if(document.getElementById("tbacts").innerHTML="",u)return b(),U();e.innerHTML='<div class="empty">Verificando cofre...</div>';try{v=await k()}catch(a){e.innerHTML=`<div class="empty">Erro: ${d(a.message)}</div>`;return}const t=!v;e.innerHTML=`
    <div style="max-width:440px;margin:80px auto;padding:36px 32px;background:var(--bg-card);border:1px solid var(--line);border-radius:14px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-flex;width:54px;height:54px;border-radius:14px;background:rgba(197,248,42,.08);border:1px solid rgba(197,248,42,.2);align-items:center;justify-content:center;margin-bottom:14px">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C5F82A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 style="font-size:18px;font-weight:600;margin-bottom:6px">${t?"Criar cofre de senhas":"Cofre de senhas"}</h2>
        <p style="font-size:13px;color:var(--text-3);line-height:1.5">
          ${t?"Crie uma senha mestra. Vai ser pedida toda vez que você abrir o cofre. Se esquecer, NÃO tem como recuperar as senhas guardadas.":"Digite sua senha mestra pra destravar."}
        </p>
      </div>

      <form id="vault-form" style="display:flex;flex-direction:column;gap:12px">
        <input type="password" id="vault-pw" class="fi" placeholder="Senha mestra" autocomplete="off" autofocus
          style="font-size:15px;padding:13px 16px;letter-spacing:.1em">
        ${t?`
          <input type="password" id="vault-pw2" class="fi" placeholder="Confirme a senha mestra" autocomplete="off"
            style="font-size:15px;padding:13px 16px;letter-spacing:.1em">
          <div style="font-size:11px;color:var(--warn);background:rgba(245,166,35,.06);border:1px solid rgba(245,166,35,.2);padding:10px 12px;border-radius:8px;line-height:1.5">
            ⚠️ Use uma senha forte. <strong>Anote num lugar seguro fora deste sistema</strong>. Se perder, perde tudo que tiver salvo aqui.
          </div>`:""}
        <button type="submit" class="btn bp" style="padding:13px;font-size:14px;font-weight:600">
          ${t?"Criar cofre":"Destravar"}
        </button>
        <div id="vault-err" style="color:var(--danger);font-size:12px;text-align:center;min-height:16px"></div>
      </form>
    </div>`,document.getElementById("vault-form").addEventListener("submit",async a=>{var n;a.preventDefault();const r=document.getElementById("vault-pw").value,s=(n=document.getElementById("vault-pw2"))==null?void 0:n.value,o=document.getElementById("vault-err");if(o.textContent="",!r){o.textContent="Digite a senha";return}if(t){if(r.length<8){o.textContent="Senha mestra precisa ter pelo menos 8 caracteres";return}if(r!==s){o.textContent="As senhas não coincidem";return}}try{if(!await K(r)){o.textContent="Senha mestra incorreta";return}l(t?"Cofre criado e destravado":"Cofre destravado"),h()}catch(c){o.textContent=c.message}})}async function U(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando senhas...</div>',document.getElementById("tbacts").innerHTML=`
    <button class="btn bg bsm" id="vault-lock" title="Travar cofre">🔒 Travar</button>
    <button class="btn bp" id="vault-new">+ Nova senha</button>`,document.getElementById("vault-lock").addEventListener("click",H),document.getElementById("vault-new").addEventListener("click",()=>S());const{data:t,error:a}=await I("senhas_vault",{order:{column:"nome",ascending:!0}});if(a){e.innerHTML=`<div class="empty">Erro: ${d(a.message)}</div>`;return}const r=t||[];if(!r.length){e.innerHTML=`
      <div class="empty" style="padding:80px 20px">
        <div style="font-size:14px;color:var(--text-2);margin-bottom:6px">Cofre vazio</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:18px">Adicione sua primeira senha. Tudo é criptografado antes de sair do browser.</div>
      </div>`;return}e.innerHTML=`
    <div style="margin-bottom:14px;display:flex;gap:10px;align-items:center">
      <input id="vault-busca" class="fi" placeholder="🔍 Buscar por nome, usuário, tag..." style="flex:1;max-width:420px">
      <span style="font-size:12px;color:var(--text-3)">${r.length} entrada${r.length===1?"":"s"} · auto-trava em 10min</span>
    </div>
    <div id="vault-lista" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px"></div>`;function s(o=""){const n=o.toLowerCase(),c=r.filter(i=>!n||(i.nome||"").toLowerCase().includes(n)||(i.usuario||"").toLowerCase().includes(n)||(i.url||"").toLowerCase().includes(n)||(i.tags||[]).some(m=>String(m).toLowerCase().includes(n)));document.getElementById("vault-lista").innerHTML=c.map(i=>N(i)).join(""),c.forEach(i=>j(i))}document.getElementById("vault-busca").addEventListener("input",o=>{b(),s(o.target.value)}),s("")}function N(e){var o;const t=e.cor||"#4A9EFF",a=((o=(e.nome||"#").replace(/[^a-z0-9]/gi,"")[0])==null?void 0:o.toUpperCase())||"#",r=(e.tags||[]).slice(0,3).map(n=>`<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,.04);color:var(--text-3);border:1px solid var(--line)">${d(n)}</span>`).join(""),s=e.url?`<a href="${d(e.url)}" target="_blank" style="color:var(--text-3);font-size:11px;text-decoration:none;display:flex;align-items:center;gap:4px;margin-top:3px">↗ ${d(e.url.replace(/^https?:\/\//,"").slice(0,40))}</a>`:"";return`
    <div class="tw" data-id="${e.id}" style="padding:14px 16px">
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div style="width:38px;height:38px;border-radius:10px;background:${t}1a;color:${t};display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px;flex-shrink:0">${a}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:500;font-size:14px;color:var(--text)">${d(e.nome)}</div>
          ${e.usuario?`<div style="font-size:12px;color:var(--text-2);margin-top:1px">${d(e.usuario)}</div>`:""}
          ${s}
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:12px;padding-top:11px;border-top:1px solid var(--line)">
        <div class="vault-pw-mask" data-id="${e.id}" style="font-family:ui-monospace,monospace;font-size:13px;color:var(--text-3);letter-spacing:.1em;flex:1;min-width:0;white-space:nowrap;overflow:hidden">••••••••••</div>
        <button class="btn bg bsm vault-show" data-id="${e.id}" title="Mostrar/esconder">👁</button>
        <button class="btn bg bsm vault-copy" data-id="${e.id}" title="Copiar senha">📋</button>
        <button class="btn bg bsm vault-edit" data-id="${e.id}" title="Editar">✎</button>
        <button class="btn bd bsm vault-del" data-id="${e.id}" title="Excluir">🗑</button>
      </div>
      ${r?`<div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap">${r}</div>`:""}
    </div>`}function j(e){const t=document.querySelector(`.tw[data-id="${e.id}"]`);t&&(t.querySelector(".vault-show").addEventListener("click",async()=>{b();const a=t.querySelector(".vault-pw-mask");if(a.dataset.aberto==="1"){a.textContent="••••••••••",a.style.color="var(--text-3)",a.dataset.aberto="";return}const r=await x(u,e.senha_cifrada,e.iv);if(r===null){l("Falha ao descriptografar (chave inválida?)","err");return}a.textContent=r,a.style.color="var(--accent)",a.dataset.aberto="1",setTimeout(()=>{a.dataset.aberto==="1"&&(a.textContent="••••••••••",a.style.color="var(--text-3)",a.dataset.aberto="")},2e4)}),t.querySelector(".vault-copy").addEventListener("click",async()=>{b();const a=await x(u,e.senha_cifrada,e.iv);if(a===null){l("Falha ao descriptografar","err");return}try{await navigator.clipboard.writeText(a),l("Senha copiada · limpa do clipboard em 30s"),setTimeout(()=>navigator.clipboard.writeText("").catch(()=>{}),3e4)}catch{l("Não consegui acessar o clipboard","err")}}),t.querySelector(".vault-edit").addEventListener("click",async()=>{b();const a=await x(u,e.senha_cifrada,e.iv),r=e.notas_cifrada?await x(u,e.notas_cifrada,e.notas_iv):"";S({...e,_senha:a||"",_notas:r||""})}),t.querySelector(".vault-del").addEventListener("click",async()=>{if(!confirm(`Excluir "${e.nome}"? Essa ação é permanente.`))return;const{error:a}=await g.from("senhas_vault").delete().eq("id",e.id);if(a){l("Erro: "+a.message,"err");return}l("Excluído"),h()}))}function S(e={}){b();const t=!e.id,a=(e.tags||[]).join(", "),r=["#4A9EFF","#C5F82A","#A78BFA","#F5A623","#34D399","#FF5C5C","#EC4899","#06B6D4"],s=e.cor||r[0];z(t?"Nova senha":"Editar senha",`
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Nome *</label>
      <input class="fi" id="ve-nome" value="${d(e.nome||"")}" placeholder="Ex: Google Ads Adriane" autofocus>
    </div>
    <div class="frow" style="margin-bottom:11px">
      <div class="fg">
        <label class="fl">Usuário / email</label>
        <input class="fi" id="ve-usuario" value="${d(e.usuario||"")}" placeholder="email@ou-user.com">
      </div>
      <div class="fg">
        <label class="fl">URL</label>
        <input class="fi" id="ve-url" value="${d(e.url||"")}" placeholder="https://...">
      </div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Senha *</label>
      <div style="display:flex;gap:6px">
        <input class="fi" id="ve-senha" type="password" value="${d(e._senha||"")}" placeholder="A senha que você quer guardar" style="flex:1;font-family:ui-monospace,monospace">
        <button class="btn bg bsm" type="button" id="ve-show">👁</button>
        <button class="btn bg bsm" type="button" id="ve-gerar" title="Gerar senha forte">⚡</button>
      </div>
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Tags (separadas por vírgula)</label>
      <input class="fi" id="ve-tags" value="${d(a)}" placeholder="ads, google, cliente-adriane">
    </div>
    <div class="fg" style="margin-bottom:11px">
      <label class="fl">Notas (criptografadas)</label>
      <textarea class="fta" id="ve-notas" rows="2" placeholder="MFA, código backup, observações...">${d(e._notas||"")}</textarea>
    </div>
    <div class="fg">
      <label class="fl">Cor</label>
      <div id="ve-cores" style="display:flex;gap:8px;flex-wrap:wrap">
        ${r.map(n=>`<span data-cor="${n}" class="ve-cor${n===s?" on":""}" style="width:26px;height:26px;border-radius:50%;background:${n};cursor:pointer;border:2px solid ${n===s?"var(--text)":"transparent"};transition:border 100ms"></span>`).join("")}
      </div>
    </div>
  `,`
    ${t?"":'<button class="btn bd" id="ve-del">Excluir</button>'}
    <button class="btn bg" id="ve-cancel">Cancelar</button>
    <button class="btn bp" id="ve-save">${t?"Salvar":"Atualizar"}</button>
  `);let o=s;document.getElementById("ve-cores").addEventListener("click",n=>{const c=n.target.closest(".ve-cor");c&&(o=c.dataset.cor,document.querySelectorAll(".ve-cor").forEach(i=>{i.style.border="2px solid "+(i.dataset.cor===o?"var(--text)":"transparent")}))}),document.getElementById("ve-show").addEventListener("click",()=>{const n=document.getElementById("ve-senha");n.type=n.type==="password"?"text":"password"}),document.getElementById("ve-gerar").addEventListener("click",()=>{const n="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*-_+=",i=crypto.getRandomValues(new Uint8Array(20));let m="";for(let f=0;f<20;f++)m+=n[i[f]%n.length];const p=document.getElementById("ve-senha");p.value=m,p.type="text",l("Senha forte gerada")}),document.getElementById("ve-cancel").addEventListener("click",w),t||document.getElementById("ve-del").addEventListener("click",async()=>{confirm(`Excluir "${e.nome}"?`)&&(await g.from("senhas_vault").delete().eq("id",e.id),w(),l("Excluído"),h())}),document.getElementById("ve-save").addEventListener("click",async()=>{const n=document.getElementById("ve-nome").value.trim(),c=document.getElementById("ve-senha").value;if(!n)return l("Nome é obrigatório","err");if(!c)return l("Senha é obrigatória","err");const i=await $(u,c),m=document.getElementById("ve-notas").value.trim(),p=m?await $(u,m):null,f={nome:n,usuario:document.getElementById("ve-usuario").value.trim()||null,url:document.getElementById("ve-url").value.trim()||null,senha_cifrada:i.cifrado,iv:i.iv,notas_cifrada:(p==null?void 0:p.cifrado)||null,notas_iv:(p==null?void 0:p.iv)||null,tags:document.getElementById("ve-tags").value.split(",").map(A=>A.trim()).filter(Boolean),cor:o,atualizado_em:new Date().toISOString()},T=t?g.from("senhas_vault").insert(f):g.from("senhas_vault").update(f).eq("id",e.id),{error:B}=await T;if(B)return l("Erro: "+B.message,"err");l(t?"Senha guardada":"Atualizado"),w(),h()})}export{h as render};
