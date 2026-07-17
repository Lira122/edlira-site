import{s as A,d as h,a as I,g as q,t as v,T as O,o as j,f as E}from"./index-LcxVLMuJ.js";const i={f1:"Oi, tudo chegou aí? 😅",f2:"Sei que o dia a dia é corrido. Me diz uma coisa rápida: o maior desafio do seu negócio hoje é captar mais leads ou converter os que já chegam?",f3:"Oi {nome}, passando pra não sumir. Se ainda fizer sentido conversar, ótimo. Se não for o momento certo, sem problema também — é só me falar e a gente retoma quando você quiser. O que você prefere?",reng:"Oi {nome}! Faz um tempo que não conversamos. Tava aqui e lembrei de você. Como tá o negócio? Ainda com os mesmos desafios ou mudou algo?",fim:"Oi {nome}, vou deixar você à vontade por aqui. Se quiser conversar sobre como escalar seu negócio, pode me chamar quando quiser. Abraço! 👋"};function u(e){return e?(Date.now()-new Date(e).getTime())/(1e3*60*60):9999}function T(e){const r=u(e);if(r<1)return`${Math.round(r*60)} min atrás`;if(r<24)return`${Math.round(r)}h atrás`;const c=Math.floor(r/24);return`${c} dia${c>1?"s":""} atrás`}function C(e){return e<1?"var(--ok)":e<24?"var(--warn)":"var(--danger)"}function R(e){return e<.083?{label:"Aguardar 5 min",urgencia:"ok"}:e<1?{label:"Follow-up 1 — enviar",urgencia:"warn"}:e<24?{label:"Follow-up 2 — enviar",urgencia:"warn"}:e<48?{label:"Follow-up 3 — urgente",urgencia:"danger"}:{label:"Reengajar agora",urgencia:"danger"}}async function x(){const e=document.getElementById("content");e.innerHTML='<div class="empty">Carregando...</div>';try{let _=function(t){const a=u(t.atualizado_em),n=t.temperatura;return a<1?i.f1:a<24?i.f2:a<48?i.f3:i.reng},D=function(t){return{quente:{txt:"Feche a reunião agora — está engajado",cor:"#ff6b35"},morno:{txt:"Entregue valor, não pressione",cor:"#F5A623"},frio:{txt:"Follow-up leve, reabra o diálogo",cor:"#4A9EFF"},gelado:{txt:"Reengajamento — mude o ângulo de abordagem",cor:"#64748b"}}[t]||{txt:"Defina a temperatura para ver sugestão",cor:"var(--text-3)"}},L=function(t){const a=u(t.atualizado_em),n=C(a),m=R(a),p=t.whatsapp?t.whatsapp.replace(/\D/g,""):null,b=D(t.temperatura),w=_(t);return`
        <tr data-id="${t.id}">
          <td>
            <div style="font-weight:500">${t.nome}</div>
            <div style="font-size:11px;color:var(--text-3)">${t.empresa||"—"}</div>
          </td>
          <td>${I(t.status)}</td>
          <td>${q(t.temperatura)||'<span style="color:var(--text-3);font-size:11px">—</span>'}</td>
          <td>
            <div style="font-size:11px;color:${b.cor};font-weight:500;max-width:160px;line-height:1.3">${b.txt}</div>
          </td>
          <td>
            <span style="color:${n};font-size:12px;font-weight:500">${T(t.atualizado_em)}</span>
          </td>
          <td>
            <span class="badge" style="background:rgba(255,255,255,.04);color:var(--${m.urgencia==="ok"?"ok":m.urgencia==="warn"?"warn":"danger"});border:1px solid currentColor;padding:3px 9px;font-size:10px">
              ${m.label}
            </span>
          </td>
          <td style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            ${p?`
              <a href="https://wa.me/${p}?text=${encodeURIComponent(w.replace("{nome}",t.nome))}" target="_blank" class="btn bp bsm" style="text-decoration:none">WA →</a>`:""}
            <button class="btn bg bsm mark-btn" data-id="${t.id}">Mover →</button>
            <button class="btn bg bsm pause-btn" data-id="${t.id}" data-nome="${t.nome}" title="Colocar em pausa">⏸</button>
          </td>
        </tr>`},$=function(t,a,n){return a.length?`
        <div class="tw" style="margin-bottom:18px">
          <div class="th" style="border-left:3px solid var(--${n})">
            <h3 style="color:var(--${n})">${t} <span style="font-weight:400;color:var(--text-3)">(${a.length})</span></h3>
          </div>
          <table>
            <thead><tr><th>Lead</th><th>Status</th><th>Temp.</th><th>Abordagem</th><th>Último contato</th><th>Ação</th><th></th></tr></thead>
            <tbody>${a.map(L).join("")}</tbody>
          </table>
        </div>`:""},k=function(){return l.length?`
        <div class="tw" style="margin-bottom:18px;opacity:.7">
          <div class="th" style="border-left:3px solid #94a3b8">
            <h3 style="color:#94a3b8">⏸ Em pausa <span style="font-weight:400;color:var(--text-3)">(${l.length})</span></h3>
          </div>
          <table>
            <thead><tr><th>Lead</th><th>Temperatura</th><th>Retoma em</th><th></th></tr></thead>
            <tbody>
              ${l.map(t=>`
                <tr>
                  <td class="tn">${t.nome}<div style="font-size:11px;color:var(--text-3)">${t.empresa||"—"}</div></td>
                  <td>${q(t.temperatura)||"—"}</td>
                  <td style="font-size:12px;color:var(--warn)">${t.pausado_ate?new Date(t.pausado_ate).toLocaleDateString("pt-BR"):"—"}</td>
                  <td>
                    <button class="btn bg bsm retomar-btn" data-id="${t.id}">Retomar agora</button>
                  </td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`:""};const{data:r,error:c}=await A("clientes",{order:{column:"atualizado_em",ascending:!0}});if(c)throw new Error(c.message);const o=r||[],d=new Date,y=o.filter(t=>t.status==="em_pausa"&&t.pausado_ate&&new Date(t.pausado_ate)<=d);for(const t of y)await h.from("clientes").update({status:"qualificado",pausado_ate:null,temperatura:"frio",atualizado_em:d.toISOString()}).eq("id",t.id),t.status="qualificado",t.temperatura="frio";const s=o.filter(t=>["novo","qualificado","proposta"].includes(t.status)),l=o.filter(t=>t.status==="em_pausa"&&t.pausado_ate&&new Date(t.pausado_ate)>d),f=s.filter(t=>u(t.atualizado_em)>=24),g=s.filter(t=>u(t.atualizado_em)>=1&&u(t.atualizado_em)<24),S=s.filter(t=>u(t.atualizado_em)<1),z=`
      <div class="sg" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px">
        <div class="sc">
          <div class="sl">Em negociação</div>
          <div class="sv">${s.length}</div>
          <div class="ss">Leads ativos</div>
        </div>
        <div class="sc">
          <div class="sl" style="color:var(--danger)">Urgente</div>
          <div class="sv" style="color:var(--danger)">${f.length}</div>
          <div class="ss">Sem resposta +24h</div>
        </div>
        <div class="sc">
          <div class="sl" style="color:var(--warn)">Atenção</div>
          <div class="sv" style="color:var(--warn)">${g.length}</div>
          <div class="ss">Sem resposta 1h–24h</div>
        </div>
        <div class="sc">
          <div class="sl">Em dia</div>
          <div class="sv" style="color:var(--ok)">${S.length}</div>
          <div class="ss">Menos de 1h</div>
        </div>
      </div>`,M=`
      <div class="tw" style="margin-top:24px">
        <div class="th"><h3>Scripts prontos — copie e envie</h3></div>
        <div style="display:flex;flex-direction:column;gap:1px">
          ${Object.entries({"⏱️ 5 min":i.f1,"⏱️ 1 hora":i.f2,"📅 1 dia":i.f3,"🔄 Reengajamento":i.reng,"👋 Último toque":i.fim}).map(([t,a])=>`
            <div style="padding:14px 18px;border-bottom:1px solid var(--line);display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
              <div>
                <div style="font-size:11px;font-weight:600;color:var(--text-3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.07em">${t}</div>
                <div style="font-size:13px;color:var(--text-2);line-height:1.5">${a}</div>
              </div>
              <button class="btn bg bsm copy-btn" data-msg="${encodeURIComponent(a)}" style="flex-shrink:0">Copiar</button>
            </div>`).join("")}
        </div>
      </div>`;e.innerHTML=`
      ${z}
      ${$("🔴 Urgente — follow-up imediato",f,"danger")}
      ${$("🟡 Atenção — verificar em breve",g,"warn")}
      ${$("🟢 Em dia",S,"ok")}
      ${k()}
      ${!s.length&&!l.length?'<div class="empty">Nenhum lead em negociação.</div>':""}
      ${M}`,e.querySelectorAll(".pause-btn").forEach(t=>{t.addEventListener("click",()=>F(t.dataset.id,t.dataset.nome,o))}),e.querySelectorAll(".retomar-btn").forEach(t=>{t.addEventListener("click",async()=>{await h.from("clientes").update({status:"qualificado",pausado_ate:null,atualizado_em:new Date().toISOString()}).eq("id",t.dataset.id),v("Lead retomado."),x()})}),e.querySelectorAll(".copy-btn").forEach(t=>{t.addEventListener("click",()=>{const a=decodeURIComponent(t.dataset.msg);navigator.clipboard.writeText(a).then(()=>{t.textContent="Copiado!",setTimeout(()=>{t.textContent="Copiar"},2e3)})})}),e.querySelectorAll(".mark-btn").forEach(t=>{t.addEventListener("click",async()=>{const a=["novo","qualificado","proposta","ativo","fechado","perdido"],n=o.find(w=>w.id===t.dataset.id);if(!n)return;const m=a.indexOf(n.status),p=a[Math.min(m+1,a.length-1)],{error:b}=await h.from("clientes").update({status:p,atualizado_em:new Date().toISOString()}).eq("id",t.dataset.id);if(b){v("Erro.","er");return}v(`${n.nome} → ${p}`),x()})})}catch(r){e.innerHTML=`<div class="empty">Erro: ${r.message}</div>`}}function F(e,r,c){const o=c.find(s=>s.id===e),d=new Date;d.setDate(d.getDate()+1);const y='<option value="">— manter atual —</option>'+O.map(s=>{const l={quente:"🔥 Quente",morno:"🌡️ Morno",frio:"❄️ Frio",gelado:"🧊 Gelado"};return`<option value="${s}"${(o==null?void 0:o.temperatura)===s?" selected":""}>${l[s]}</option>`}).join("");j(`Pausar ${r}`,`<div style="font-size:13px;color:var(--text-2);line-height:1.6;margin-bottom:16px">
      A pessoa disse que <strong style="color:var(--text)">não é o momento</strong>.<br>
      Defina quando retomar o contato — o follow-up automático ficará suspenso até lá.
    </div>
    <div class="fg" style="margin-bottom:14px">
      <label class="fl">Retomar contato em</label>
      <input class="fi" id="pause-date" type="date" value="${d.toISOString().slice(0,10)}" min="${d.toISOString().slice(0,10)}">
    </div>
    <div class="fg" style="margin-bottom:14px">
      <label class="fl">Temperatura atual da conversa</label>
      <select class="fsl" id="pause-temp">${y}</select>
    </div>
    <div class="fg">
      <label class="fl">Motivo / observação</label>
      <textarea class="fta" id="pause-obs" placeholder="Ex: Disse que volta em julho após fechar o trimestre">${(o==null?void 0:o.observacoes)||""}</textarea>
    </div>`,`<button class="btn bg" id="m-cancel">Cancelar</button>
     <button class="btn bp" id="m-save">Pausar lead</button>`),document.getElementById("m-cancel").addEventListener("click",E),document.getElementById("m-save").addEventListener("click",async()=>{const s=new Date(document.getElementById("pause-date").value).toISOString(),l=document.getElementById("pause-temp").value||(o==null?void 0:o.temperatura),f=document.getElementById("pause-obs").value.trim(),{error:g}=await h.from("clientes").update({status:"em_pausa",pausado_ate:s,temperatura:l,observacoes:f,atualizado_em:new Date().toISOString()}).eq("id",e);if(g){v("Erro.","er");return}v(`${r} pausado — retoma em ${new Date(s).toLocaleDateString("pt-BR")}`),E(),x()})}export{x as render};
