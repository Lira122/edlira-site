import{d as c,o as u,f as x,h as p,t as v}from"./index-BTPdxtDK.js";const o=t=>String(t??"").replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e]);let l=[],m=[];async function y(){document.getElementById("tbacts").innerHTML='<button class="btn bp" id="btn-novo-onb">+ Novo link de onboarding</button>',document.getElementById("btn-novo-onb").addEventListener("click",z);const t=document.getElementById("content");t.innerHTML='<div class="empty">Carregando...</div>';const{data:e,error:a}=await c.from("onboarding_tokens_status").select("*").order("criado_em",{ascending:!1});if(a){t.innerHTML=`<div class="empty">Erro: ${o(a.message)}</div>`;return}l=e||[];const{data:s}=await c.from("clientes").select("id, nome, empresa, status").not("status","in","(prospeccao,perdido)").order("nome");m=s||[],h()}function h(){const t=l.length,e=l.filter(n=>n.status==="pendente").length,a=l.filter(n=>n.status==="preenchido").length,s=l.filter(n=>n.status==="expirado").length,d=`
    <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px">
      <div class="sc"><div class="sl">Total</div><div class="sv">${t}</div></div>
      <div class="sc"><div class="sl">Pendentes</div><div class="sv" style="color:var(--warn)">${e}</div></div>
      <div class="sc"><div class="sl">Preenchidos</div><div class="sv" style="color:var(--ok)">${a}</div></div>
      <div class="sc"><div class="sl">Expirados</div><div class="sv" style="color:var(--text-3)">${s}</div></div>
    </div>`,r=l.length?l.map(n=>`
        <tr>
          <td class="tn">${o(n.cliente_nome||"—")}</td>
          <td class="tm">${p(n.criado_em)}</td>
          <td class="tm">${p(n.expira_em)}</td>
          <td>${k(n.status)}</td>
          <td class="tm">${p(n.usado_em)||"—"}</td>
          <td class="tm" style="text-align:right">${$(n)}</td>
        </tr>`).join(""):'<tr><td colspan="6"><div class="empty">Nenhum link gerado ainda. Crie o primeiro acima.</div></td></tr>';document.getElementById("content").innerHTML=`
    ${d}
    <div class="tw">
      <div class="th"><h3>Links de onboarding</h3></div>
      <table>
        <thead><tr><th>Cliente</th><th>Criado</th><th>Expira</th><th>Status</th><th>Preenchido em</th><th></th></tr></thead>
        <tbody>${r}</tbody>
      </table>
    </div>`,document.getElementById("content").addEventListener("click",n=>{const i=n.target.closest("button[data-act]");if(!i)return;const g=i.dataset.act;g==="copiar"?f(i.dataset.token):g==="ver"&&B(i.dataset.cliente)})}function k(t){const e={pendente:"var(--warn)",preenchido:"var(--ok)",expirado:"var(--text-3)"},a={pendente:"Pendente",preenchido:"Preenchido",expirado:"Expirado"};return`<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px;background:${e[t]}22;color:${e[t]}">${a[t]||t}</span>`}function $(t){return t.status==="pendente"?`<button class="btn bg bsm" data-act="copiar" data-token="${o(t.token)}">Copiar link</button>`:t.status==="preenchido"?`<button class="btn bg bsm" data-act="ver" data-cliente="${o(t.cliente_id)}">Ver dados</button>`:'<span style="font-size:12px;color:var(--text-3)">—</span>'}const _="https://elevabrands.com.br/onboarding/";function E(t){return`${_}?t=${t}`}async function f(t){const e=E(t);try{await navigator.clipboard.writeText(e),v("Link copiado pro clipboard!")}catch{prompt("Copie o link:",e)}}function z(){const t=m.length?m.map(e=>`<option value="${o(e.id)}">${o(e.empresa||e.nome)}${e.nome&&e.empresa?" — "+o(e.nome):""}</option>`).join(""):'<option value="">Nenhum cliente ativo</option>';u("Gerar link de onboarding",`<div class="fg">
       <label class="fl">Cliente *</label>
       <select class="fsl" id="onb-cli">
         <option value="">Selecione…</option>
         ${t}
       </select>
     </div>
     <div class="fg">
       <label class="fl">Validade (dias)</label>
       <input class="fi" id="onb-dias" type="number" value="7" min="1" max="60">
       <span style="font-size:11px;color:var(--text-3);margin-top:4px;display:block">O link expira automaticamente após esse prazo, ou no primeiro envio.</span>
     </div>
     <div id="onb-result" style="display:none"></div>`,`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-gerar">Gerar link</button>`),document.getElementById("m-cancel").addEventListener("click",x),document.getElementById("m-gerar").addEventListener("click",w)}async function w(){const t=document.getElementById("onb-cli").value,e=Number(document.getElementById("onb-dias").value)||7;if(!t){v("Escolha um cliente.","er");return}const a=document.getElementById("m-gerar");a.disabled=!0,a.textContent="Gerando…";const{data:s,error:d}=await c.functions.invoke("onboarding-link",{body:{cliente_id:t,dias_validade:e}});if(d||!(s!=null&&s.ok)){v((s==null?void 0:s.error)||(d==null?void 0:d.message)||"Erro ao gerar","er"),a.disabled=!1,a.textContent="Gerar link";return}const r=`https://wa.me/?text=${encodeURIComponent(`Oi! Pra começar, preciso de algumas informações. Acessa esse link e preenche quando puder:

${s.url}

— Lira, Eleva Digital`)}`;document.getElementById("onb-result").style.display="block",document.getElementById("onb-result").innerHTML=`
    <div style="background:rgba(193,255,42,.07);border:1px solid rgba(193,255,42,.22);border-left:3px solid var(--accent);border-radius:10px;padding:14px 16px;margin-top:6px">
      <div style="font-size:12px;font-weight:700;color:var(--accent);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Link gerado pra ${o(s.cliente_nome)}</div>
      <div style="font-family:ui-monospace,monospace;font-size:12px;color:var(--text);word-break:break-all;padding:8px 10px;background:rgba(0,0,0,.25);border-radius:6px;margin-bottom:10px">${o(s.url)}</div>
      <div style="display:flex;gap:8px">
        <button class="btn bg bsm" id="onb-copiar">Copiar link</button>
        <a class="btn bg bsm" href="${r}" target="_blank" rel="noopener" style="text-decoration:none">Compartilhar no WhatsApp</a>
      </div>
      <div style="font-size:11px;color:var(--text-3);margin-top:10px">Expira em ${p(s.expira_em)}.</div>
    </div>`,document.getElementById("onb-copiar").addEventListener("click",()=>f(s.token)),a.disabled=!1,a.textContent="Gerar novo",y()}async function B(t){const{data:e}=await c.from("onboarding_dados").select("*").eq("cliente_id",t).maybeSingle(),{data:a}=await c.from("onboarding_credenciais").select("*").eq("cliente_id",t).maybeSingle(),d=["insta_pass","meta_pass","google_pass"].map(r=>{var i;return((i=a==null?void 0:a.cred_jsonb)==null?void 0:i[r])?`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid var(--line)">
      <span style="font-size:13px;color:var(--text)">${b(r)}</span>
      <button class="btn bg bsm" data-cred="${o(r)}" data-cliente="${o(t)}">Ver senha</button>
    </div>`:""}).filter(Boolean).join("")||'<div style="font-size:13px;color:var(--text-3)">Nenhuma senha guardada.</div>';u("Dados do onboarding",`<div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px">Negócio</div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Ramo</span><div>${o(e==null?void 0:e.ramo)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Ticket médio</span><div>${e!=null&&e.ticket_medio?"R$ "+Number(e.ticket_medio).toLocaleString("pt-BR"):"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Objetivo 90 dias</span><div style="white-space:pre-wrap">${o(e==null?void 0:e.objetivo_90d)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Site</span><div>${e!=null&&e.site?`<a href="${o(e.site)}" target="_blank" style="color:var(--accent)">${o(e.site)}</a>`:"—"}</div></div>

     <div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin:24px 0 8px">Acessos</div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">@ Instagram</span><div>${o(a==null?void 0:a.insta_handle)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">BM / Meta</span><div>${o(a==null?void 0:a.meta_bm_id)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Google Ads</span><div>${o(a==null?void 0:a.google_ads_id)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">WhatsApp comercial</span><div>${o(a==null?void 0:a.whatsapp_com)||"—"}</div></div>
     <div style="margin-top:14px;border-top:1px solid var(--line);padding-top:14px">
       <div style="font-size:12px;color:var(--text-2);margin-bottom:8px">Senhas (cifradas, cada visualização fica registrada em log):</div>
       ${d}
     </div>

     <div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin:24px 0 8px">Bot / Conhecimento</div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Produtos & preços</span><div style="white-space:pre-wrap">${o(e==null?void 0:e.produtos)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">FAQs</span><div style="white-space:pre-wrap">${o(e==null?void 0:e.faqs)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Horário</span><div>${o(e==null?void 0:e.horario_atend)||"—"}</div></div>
     <div class="fg"><span style="color:var(--text-2);font-size:12px">Tom de voz</span><div>${o(e==null?void 0:e.tom_de_voz)||"—"}</div></div>

     <div id="cred-revealed" style="margin-top:14px"></div>`,'<button class="btn bg" id="m-fechar">Fechar</button>'),document.getElementById("m-fechar").addEventListener("click",x),document.getElementById("mbody").addEventListener("click",async r=>{const n=r.target.closest("button[data-cred]");if(!n)return;n.disabled=!0,n.textContent="Carregando…";const{data:i}=await c.functions.invoke("onboarding-cred-ver",{body:{cliente_id:n.dataset.cliente,campo:n.dataset.cred,origem:"crm"}});if(!(i!=null&&i.ok)){v((i==null?void 0:i.error)||"Erro","er"),n.disabled=!1,n.textContent="Ver senha";return}document.getElementById("cred-revealed").innerHTML=`
      <div style="background:rgba(193,255,42,.07);border:1px solid rgba(193,255,42,.22);border-radius:8px;padding:12px 14px">
        <div style="font-size:11px;color:var(--text-2);margin-bottom:4px">${b(n.dataset.cred)}</div>
        <div style="font-family:ui-monospace,monospace;font-size:14px;color:var(--accent);word-break:break-all">${o(i.valor)}</div>
        <div style="font-size:10px;color:var(--text-3);margin-top:6px">Visualização registrada em log de auditoria.</div>
      </div>`,n.disabled=!1,n.textContent="Ver senha"})}function b(t){return{insta_pass:"Senha do Instagram",meta_pass:"Senha do Meta/Facebook",google_pass:"Senha do Google"}[t]||t}export{y as render};
