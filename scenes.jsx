// scenes.jsx — "Como funciona" — 6 cenas literais, monocromático, Helvetica.
// Ícones geométricos simples (telefone, monitor, robô, câmera) + texto.

const W = 1280;
const H = 720;
const CX = W / 2;
const CY = H / 2;

const helv = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const mono = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

// ── Generic primitives ──────────────────────────────────────────────────────

function Circle({ x, y, r, fill = 'transparent', stroke = null, strokeWidth = 1, opacity = 1 }) {
  return (
    <div style={{
      position: 'absolute',
      left: x - r, top: y - r,
      width: r * 2, height: r * 2,
      borderRadius: '50%',
      background: fill,
      border: stroke ? `${strokeWidth}px solid ${stroke}` : 'none',
      opacity,
      boxSizing: 'border-box',
    }} />
  );
}

function Box({ x, y, w, h, radius = 0, stroke = '#fff', strokeWidth = 1.5, fill = 'transparent', opacity = 1, children, clip = false }) {
  // x, y is CENTER
  return (
    <div style={{
      position: 'absolute',
      left: x - w / 2, top: y - h / 2,
      width: w, height: h,
      borderRadius: radius,
      border: stroke ? `${strokeWidth}px solid ${stroke}` : 'none',
      background: fill,
      opacity,
      boxSizing: 'border-box',
      overflow: clip ? 'hidden' : 'visible',
    }}>{children}</div>
  );
}

function HLine({ x, y, w, color = '#fff', thickness = 1, opacity = 1 }) {
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y - thickness / 2,
      width: w, height: thickness,
      background: color, opacity,
    }} />
  );
}

function Arrow({ x1, y1, x2, y2, color = '#fff', opacity = 1, head = 9 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  return (
    <>
      <div style={{
        position: 'absolute',
        left: x1, top: y1 - 0.5,
        width: Math.max(0, len - head), height: 1,
        background: color, opacity,
        transform: `rotate(${ang}rad)`, transformOrigin: '0 50%',
      }} />
      <div style={{
        position: 'absolute',
        left: x2, top: y2,
        width: 0, height: 0,
        borderLeft: `${head}px solid ${color}`,
        borderTop: `${head * 0.6}px solid transparent`,
        borderBottom: `${head * 0.6}px solid transparent`,
        transform: `translate(-${head}px, -${head * 0.6}px) rotate(${ang}rad)`,
        transformOrigin: `${head}px ${head * 0.6}px`,
        opacity,
      }} />
    </>
  );
}

function Kicker({ children, x, y, color = 'rgba(255,255,255,0.45)', size = 11, op = 1 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: 'translate(-50%, -50%)',
      fontFamily: mono, fontSize: size,
      letterSpacing: '0.22em', textTransform: 'uppercase',
      color, opacity: op, whiteSpace: 'nowrap',
    }}>{children}</div>
  );
}

function Headline({ children, x, y, size = 56, weight = 500, color = '#fff', op = 1, align = 'center', maxW = 1000, ls = '-0.04em' }) {
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(${tx}, 0)`,
      fontFamily: helv, fontSize: size, fontWeight: weight,
      letterSpacing: ls, color, opacity: op,
      textAlign: align, lineHeight: 1.05,
      maxWidth: maxW,
    }}>{children}</div>
  );
}

function Body({ children, x, y, size = 20, color = 'rgba(255,255,255,0.6)', op = 1, align = 'center', maxW = 800, weight = 300 }) {
  const tx = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(${tx}, 0)`,
      fontFamily: helv, fontSize: size, fontWeight: weight,
      letterSpacing: '-0.005em', color, opacity: op,
      textAlign: align, lineHeight: 1.35,
      maxWidth: maxW,
    }}>{children}</div>
  );
}

// ── Iconography ─────────────────────────────────────────────────────────────

function Person({ x, y, scale = 1, opacity = 1, fill = '#fff' }) {
  const headR = 11 * scale;
  const bodyW = 32 * scale;
  const bodyH = 22 * scale;
  return (
    <>
      <Circle x={x} y={y - headR - 2} r={headR} fill={fill} opacity={opacity} />
      <div style={{
        position: 'absolute',
        left: x - bodyW / 2, top: y + 4,
        width: bodyW, height: bodyH,
        background: fill, opacity,
        borderTopLeftRadius: bodyW / 2,
        borderTopRightRadius: bodyW / 2,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
      }} />
    </>
  );
}

function Phone({ x, y, w = 200, h = 380, opacity = 1, children }) {
  return (
    <>
      <Box x={x} y={y} w={w} h={h} radius={26} stroke="#fff" strokeWidth={1.5} opacity={opacity} clip>
        <div style={{
          position: 'absolute', left: '50%', top: 14,
          transform: 'translateX(-50%)',
          width: 56, height: 6, borderRadius: 3,
          background: 'rgba(255,255,255,0.5)',
        }} />
        {children}
      </Box>
    </>
  );
}

function Computer({ x, y, w = 460, h = 280, opacity = 1, children }) {
  return (
    <>
      <Box x={x} y={y} w={w} h={h} radius={8} stroke="#fff" strokeWidth={1.5} opacity={opacity} clip>
        {children}
      </Box>
      {/* stand */}
      <div style={{
        position: 'absolute',
        left: x - 5, top: y + h / 2,
        width: 10, height: 26,
        background: '#fff', opacity,
      }} />
      <div style={{
        position: 'absolute',
        left: x - 60, top: y + h / 2 + 24,
        width: 120, height: 4, borderRadius: 2,
        background: '#fff', opacity,
      }} />
    </>
  );
}

function Robot({ x, y, scale = 1, opacity = 1, eyeOpen = 1, antennaPulse = 1 }) {
  const w = 200 * scale, h = 170 * scale;
  return (
    <>
      {/* antenna */}
      <div style={{
        position: 'absolute',
        left: x - 0.75, top: y - h / 2 - 28,
        width: 1.5, height: 28,
        background: '#fff', opacity,
      }} />
      <Circle x={x} y={y - h / 2 - 32} r={5 * antennaPulse} fill="#fff" opacity={opacity} />
      <Circle x={x} y={y - h / 2 - 32} r={11} stroke="rgba(255,255,255,0.4)" strokeWidth={1} opacity={opacity * antennaPulse * 0.6} />
      {/* head */}
      <Box x={x} y={y} w={w} h={h} radius={18} stroke="#fff" strokeWidth={1.5} opacity={opacity} />
      {/* eyes (rectangular vs circular toggled by eyeOpen) */}
      <div style={{
        position: 'absolute',
        left: x - 38 * scale - 11 * scale, top: y - 14 * scale - 11 * scale * eyeOpen,
        width: 22 * scale, height: 22 * scale * eyeOpen,
        borderRadius: '50%',
        background: '#fff', opacity,
      }} />
      <div style={{
        position: 'absolute',
        left: x + 38 * scale - 11 * scale, top: y - 14 * scale - 11 * scale * eyeOpen,
        width: 22 * scale, height: 22 * scale * eyeOpen,
        borderRadius: '50%',
        background: '#fff', opacity,
      }} />
      {/* mouth bar */}
      <div style={{
        position: 'absolute',
        left: x - 30 * scale, top: y + 30 * scale,
        width: 60 * scale, height: 4, borderRadius: 2,
        background: '#fff', opacity,
      }} />
    </>
  );
}

function Camera({ x, y, scale = 1, opacity = 1 }) {
  const w = 220 * scale, h = 150 * scale;
  return (
    <>
      {/* viewfinder bump */}
      <div style={{
        position: 'absolute',
        left: x - 28 * scale, top: y - h / 2 - 16 * scale,
        width: 56 * scale, height: 18 * scale,
        borderTopLeftRadius: 4, borderTopRightRadius: 4,
        border: '1.5px solid #fff', borderBottom: 'none',
        opacity, boxSizing: 'border-box',
      }} />
      <Box x={x} y={y} w={w} h={h} radius={10} stroke="#fff" strokeWidth={1.5} opacity={opacity} />
      <Circle x={x} y={y} r={42 * scale} stroke="#fff" strokeWidth={1.5} opacity={opacity} />
      <Circle x={x} y={y} r={28 * scale} stroke="#fff" strokeWidth={1} opacity={opacity * 0.7} />
      <Circle x={x} y={y} r={8 * scale} fill="#fff" opacity={opacity} />
      {/* shutter button */}
      <Circle x={x + w / 2 - 18 * scale} y={y - h / 2 + 12 * scale} r={4 * scale} fill="#fff" opacity={opacity} />
    </>
  );
}

// Cursor (arrow) — classic pointer with optional click ripple
function Cursor({ x, y, opacity = 1, click = 0 }) {
  return (
    <>
      <svg width="20" height="22" viewBox="0 0 20 22" style={{
        position: 'absolute', left: x, top: y,
        opacity, pointerEvents: 'none',
      }}>
        <path d="M2 1 L18 12 L11 13 L15 21 L11 22 L7 14 L2 18 Z"
              fill="#fff" stroke="#000" strokeWidth="0.8" strokeLinejoin="round"/>
      </svg>
      {click > 0 && (
        <Circle x={x + 4} y={y + 4} r={4 + click * 18} stroke="#fff" strokeWidth={1.2}
                opacity={opacity * (1 - click)} />
      )}
    </>
  );
}

function ChatBubble({ x, y, w, h = 52, opacity = 1, side = 'left', stroke = '#fff', children, fontSize = 15, padding = '14px 18px' }) {
  return (
    <>
      <div style={{
        position: 'absolute',
        left: x, top: y,
        width: w, height: h,
        borderRadius: 14,
        border: `1.5px solid ${stroke}`,
        opacity, boxSizing: 'border-box',
        padding,
        fontFamily: helv, fontSize, fontWeight: 400, color: '#fff',
        display: 'flex', alignItems: 'center',
        whiteSpace: 'nowrap',
      }}>
        {children}
      </div>
      <div style={{
        position: 'absolute',
        left: side === 'left' ? x + 14 : x + w - 26,
        top: y + h - 4,
        width: 12, height: 12,
        borderLeft: `1.5px solid ${stroke}`,
        borderBottom: `1.5px solid ${stroke}`,
        background: '#000',
        transform: 'rotate(-45deg)',
        opacity,
      }} />
    </>
  );
}

// ── SCENE 1 — Intro ─────────────────────────────────────────────────────────

function SceneIntro() {
  const { progress, localTime } = useSprite();
  const fadeIn = clamp(progress / 0.20, 0, 1);
  const fadeOut = 1 - clamp((progress - 0.85) / 0.15, 0, 1);

  // Pulsing dot
  const pulse = 1 + Math.sin(localTime * 2.6) * 0.25;

  // Subtitle reveals after title
  const subOp = clamp((progress - 0.30) / 0.18, 0, 1);

  return (
    <>
      <Circle x={CX} y={CY - 80} r={4 * pulse} fill="#fff" opacity={fadeIn * fadeOut} />
      <Circle x={CX} y={CY - 80} r={11} stroke="rgba(255,255,255,0.3)" opacity={fadeIn * fadeOut * 0.8} />
      <Circle x={CX} y={CY - 80} r={26} stroke="rgba(255,255,255,0.12)" opacity={fadeIn * fadeOut * 0.6} />

      <Headline x={CX} y={CY} size={92} weight={500} ls="-0.05em"
                op={fadeIn * fadeOut}>
        Como funciona.
      </Headline>
      <Body x={CX} y={CY + 130} size={22} op={subOp * fadeOut}>
        Quatro passos. Um sistema. O fluxo que faz você vender mais com menos esforço.
      </Body>
    </>
  );
}

// ── SCENE 2 — Passo 01 / Tráfego Pago ───────────────────────────────────────

function SceneTrafego() {
  const { progress, localTime } = useSprite();
  const exitOp = 1 - clamp((progress - 0.92) / 0.08, 0, 1);

  // Phone position (right of center)
  const px = 880, py = CY + 30;

  // Phone draws in (0 - 0.18)
  const phoneOp = clamp((progress - 0.02) / 0.14, 0, 1);

  // Ad rectangle slides in inside phone (0.16 - 0.30)
  const adP = clamp((progress - 0.16) / 0.14, 0, 1);
  const adY = -120 + 100 * Easing.easeOutCubic(adP); // slides up to position

  // Cursor moves towards ad and clicks (0.30 - 0.50)
  const curP = clamp((progress - 0.30) / 0.18, 0, 1);
  const curStartX = px + 200, curStartY = py + 80;
  const curEndX = px + 18, curEndY = py - 26;
  const cx = curStartX + (curEndX - curStartX) * Easing.easeInOutCubic(curP);
  const cy_ = curStartY + (curEndY - curStartY) * Easing.easeInOutCubic(curP);
  // Click ripple at end
  const clickP = clamp((progress - 0.46) / 0.10, 0, 1);

  // Person emerges from phone (0.55 - 0.75) — represents lead
  const persP = clamp((progress - 0.55) / 0.18, 0, 1);
  const persX = px - 280;
  const persY = py + 70 - 30 * Easing.easeOutCubic(persP);
  const persOp = persP;

  // Trail of more people (0.66 - 0.85) — multiple leads
  const moreP = clamp((progress - 0.66) / 0.20, 0, 1);

  // Punchline (0.70 - end)
  const punchOp = clamp((progress - 0.74) / 0.12, 0, 1);

  return (
    <>
      <Kicker x={CX} y={70}>PASSO 01 / 04</Kicker>

      {/* Phone with ad inside */}
      <Phone x={px} y={py} w={200} h={380} opacity={phoneOp * exitOp}>
        {/* Inside content area — ad card */}
        <div style={{
          position: 'absolute',
          left: 16, right: 16, top: 50,
          height: 140, borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.5)',
          padding: 10,
          opacity: adP,
          transform: `translateY(${adY}px)`,
          boxSizing: 'border-box',
          color: '#fff',
        }}>
          <div style={{
            fontFamily: mono, fontSize: 8, letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.55)', marginBottom: 6,
          }}>ANÚNCIO</div>
          <div style={{
            height: 60, borderRadius: 4,
            background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 4px, rgba(255,255,255,0.04) 4px 8px)',
            marginBottom: 8,
          }} />
          <div style={{ height: 6, background: 'rgba(255,255,255,0.6)', borderRadius: 1, marginBottom: 4, width: '80%' }}/>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 1, width: '55%' }}/>
        </div>
        {/* Feed lines below the ad */}
        <div style={{ position: 'absolute', left: 16, right: 16, top: 210, opacity: phoneOp * 0.4 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 1, marginBottom: 6, width: '70%' }}/>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 1, marginBottom: 6, width: '90%' }}/>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 1, marginBottom: 6, width: '50%' }}/>
        </div>
      </Phone>

      {/* Cursor (only during click phase) */}
      {curP > 0 && curP < 1 && (
        <Cursor x={cx} y={cy_} opacity={exitOp} click={clickP < 1 ? clickP : 0} />
      )}

      {/* Person walking out left = lead generated */}
      {persP > 0 && (
        <Person x={persX} y={persY} scale={1.4} opacity={persOp * exitOp} />
      )}
      {/* More leads */}
      {moreP > 0 && (
        <>
          <Person x={persX - 90} y={persY + 6} scale={1.1} opacity={moreP * 0.7 * exitOp} />
          <Person x={persX - 170} y={persY + 12} scale={0.9} opacity={moreP * 0.45 * exitOp} />
          <Person x={persX - 240} y={persY + 16} scale={0.7} opacity={moreP * 0.25 * exitOp} />
        </>
      )}

      <Headline x={80} y={120} size={56} ls="-0.04em" align="left"
                op={clamp((progress - 0.06) / 0.12, 0, 1) * exitOp}>
        Tráfego pago.
      </Headline>
      <Body x={80} y={200} size={16} align="left" op={clamp((progress - 0.16) / 0.14, 0, 1) * exitOp} maxW={460}>
        Anúncios em Google, Meta e TikTok que <span style={{color:'#fff'}}>chegam até a pessoa certa</span> — não só impressões para qualquer um.
      </Body>

      <Body x={CX} y={H - 170} size={36} weight={500} color="#fff"
            op={punchOp * exitOp} maxW={900}>
        Anúncio certo. Pessoa certa. Lead na sua mão.
      </Body>
      <Kicker x={CX} y={H - 100} color="rgba(255,255,255,0.55)" size={11} op={punchOp * exitOp}>
        GOOGLE ADS &nbsp;·&nbsp; META ADS &nbsp;·&nbsp; TIKTOK ADS
      </Kicker>
    </>
  );
}

// ── SCENE 3 — Passo 02 / Site Interativo ────────────────────────────────────

function SceneSite() {
  const { progress, localTime } = useSprite();
  const exitOp = 1 - clamp((progress - 0.92) / 0.08, 0, 1);

  const mx = 880, my = CY + 40;
  const mw = 460, mh = 280;

  // Monitor draws in
  const monOp = clamp((progress - 0.02) / 0.14, 0, 1);

  // Page contents stack in (header bar, image, two text rows, button)
  const headerP = clamp((progress - 0.16) / 0.10, 0, 1);
  const imageP = clamp((progress - 0.22) / 0.10, 0, 1);
  const text1P = clamp((progress - 0.28) / 0.10, 0, 1);
  const text2P = clamp((progress - 0.32) / 0.10, 0, 1);
  const formP = clamp((progress - 0.38) / 0.12, 0, 1);

  // Form fields fill in sequentially (checkmark style)
  const f1 = clamp((progress - 0.50) / 0.06, 0, 1);
  const f2 = clamp((progress - 0.56) / 0.06, 0, 1);
  const f3 = clamp((progress - 0.62) / 0.06, 0, 1);

  // Cursor moves to button and clicks
  const curP = clamp((progress - 0.70) / 0.10, 0, 1);
  const curStartX = mx + mw / 2 + 60, curStartY = my + 60;
  const curEndX = mx - 40, curEndY = my + 84;
  const cx = curStartX + (curEndX - curStartX) * Easing.easeInOutCubic(curP);
  const cyP = curStartY + (curEndY - curStartY) * Easing.easeInOutCubic(curP);
  const clickP = clamp((progress - 0.78) / 0.06, 0, 1);

  // Punchline
  const punchOp = clamp((progress - 0.78) / 0.12, 0, 1);

  // Form fields config (3 of them, stacked)
  const fields = [
    { label: 'NOME',     ck: f1 },
    { label: 'WHATSAPP', ck: f2 },
    { label: 'E-MAIL',   ck: f3 },
  ];

  return (
    <>
      <Kicker x={CX} y={70}>PASSO 02 / 04</Kicker>

      <Computer x={mx} y={my} w={mw} h={mh} opacity={monOp * exitOp}>
        {/* Header bar */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0,
          height: 22, borderBottom: '1px solid rgba(255,255,255,0.25)',
          opacity: headerP, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
        }}>
          <Circle x={6} y={11} r={3} stroke="rgba(255,255,255,0.5)" />
          <Circle x={16} y={11} r={3} stroke="rgba(255,255,255,0.5)" />
          <Circle x={26} y={11} r={3} stroke="rgba(255,255,255,0.5)" />
        </div>

        {/* Hero block left: image placeholder + text */}
        <div style={{
          position: 'absolute', left: 16, top: 38, width: 170, height: 110,
          borderRadius: 4,
          background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 4px, rgba(255,255,255,0.04) 4px 8px)',
          opacity: imageP,
        }} />
        <div style={{
          position: 'absolute', left: 198, top: 44, opacity: text1P,
          fontFamily: helv, fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em',
        }}>Resolva agora.</div>
        <div style={{ position: 'absolute', left: 198, top: 66, height: 4, width: 200, background: 'rgba(255,255,255,0.5)', borderRadius: 1, opacity: text1P }} />
        <div style={{ position: 'absolute', left: 198, top: 76, height: 4, width: 230, background: 'rgba(255,255,255,0.35)', borderRadius: 1, opacity: text2P }} />
        <div style={{ position: 'absolute', left: 198, top: 86, height: 4, width: 180, background: 'rgba(255,255,255,0.35)', borderRadius: 1, opacity: text2P }} />

        {/* Form fields */}
        {fields.map((f, i) => {
          const yy = 162 + i * 22;
          return (
            <React.Fragment key={f.label}>
              <div style={{
                position: 'absolute', left: 16, top: yy,
                width: 240, height: 16, borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.4)',
                opacity: formP,
                fontFamily: mono, fontSize: 7, letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', padding: '0 8px',
                boxSizing: 'border-box',
              }}>
                {f.label}
              </div>
              {/* Filled bar inside */}
              <div style={{
                position: 'absolute', left: 60, top: yy + 7,
                width: 130 * f.ck, height: 2,
                background: 'rgba(255,255,255,0.85)',
                opacity: formP,
              }} />
              {/* Checkmark when complete */}
              <div style={{
                position: 'absolute', left: 268, top: yy + 4,
                width: 8, height: 8, borderRadius: 4,
                border: '1px solid #fff',
                opacity: f.ck >= 1 ? 1 : 0,
              }} />
              <div style={{
                position: 'absolute', left: 270, top: yy + 6, width: 4, height: 2,
                background: '#fff',
                transform: 'rotate(45deg)',
                opacity: f.ck >= 1 ? 1 : 0,
              }} />
            </React.Fragment>
          );
        })}

        {/* CTA button */}
        <div style={{
          position: 'absolute', left: 16, top: 234,
          width: 270, height: 22, borderRadius: 3,
          background: clickP > 0 ? '#fff' : 'rgba(255,255,255,0.15)',
          border: '1px solid #fff',
          opacity: formP,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: helv, fontSize: 11, fontWeight: 500,
          color: clickP > 0 ? '#000' : '#fff', letterSpacing: '0.04em',
          transition: 'background 200ms ease-out, color 200ms ease-out',
        }}>
          QUERO FALAR AGORA →
        </div>

        {/* Right column — sticker */}
        <div style={{
          position: 'absolute', right: 16, top: 162,
          width: 130, height: 60, borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.35)',
          padding: 8, boxSizing: 'border-box',
          opacity: formP,
        }}>
          <div style={{ fontFamily: mono, fontSize: 7, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>RESPOSTA</div>
          <div style={{ fontFamily: helv, fontSize: 18, fontWeight: 600, color: '#fff', marginTop: 4 }}>00:03</div>
        </div>
      </Computer>

      {/* Cursor click */}
      {curP > 0 && curP < 1 && <Cursor x={cx} y={cyP} opacity={exitOp} click={clickP < 1 ? clickP : 0} />}

      <Headline x={80} y={120} size={56} align="left" op={clamp((progress - 0.06) / 0.12, 0, 1) * exitOp}>
        Site que captura.
      </Headline>
      <Body x={80} y={200} size={16} align="left" op={clamp((progress - 0.18) / 0.14, 0, 1) * exitOp} maxW={460}>
        Página de venda direta. Sem distração. Cada elemento empurra para o formulário.
      </Body>

      <Body x={CX} y={H - 170} size={36} weight={500} color="#fff" op={punchOp * exitOp} maxW={900}>
        A visita entra. O formulário fecha.
      </Body>
      <Kicker x={CX} y={H - 100} color="rgba(255,255,255,0.55)" size={11} op={punchOp * exitOp}>
        LANDING PAGE &nbsp;·&nbsp; FORMULÁRIO &nbsp;·&nbsp; CTA &nbsp;·&nbsp; PIXEL
      </Kicker>
    </>
  );
}

// ── SCENE 4 — Passo 03 / IA & Automação ─────────────────────────────────────

function SceneIA() {
  const { progress, localTime } = useSprite();
  const exitOp = 1 - clamp((progress - 0.92) / 0.08, 0, 1);

  // Robot on the right
  const rx = 980, ry = CY + 30;

  // Robot draws in
  const roboOp = clamp((progress - 0.02) / 0.14, 0, 1);
  const blink = (Math.sin(localTime * 0.7) > 0.96) ? 0.1 : 1;
  const antennaPulse = 1 + Math.sin(localTime * 4) * 0.4;

  // Chat bubbles enter sequentially
  // Bubble 1 (lead, left): "Oi! Tenho interesse..."
  const b1 = clamp((progress - 0.18) / 0.10, 0, 1);
  // Bubble 2 (IA, right): typing dots → response
  const b2 = clamp((progress - 0.32) / 0.10, 0, 1);
  // Bubble 3 (lead): "Quanto custa?"
  const b3 = clamp((progress - 0.50) / 0.10, 0, 1);
  // Bubble 4 (IA): response again
  const b4 = clamp((progress - 0.62) / 0.10, 0, 1);

  // Counter showing response time
  const counterP = clamp((progress - 0.30) / 0.05, 0, 1);
  const seconds = 3 - 3 * Easing.easeOutCubic(counterP);

  const punchOp = clamp((progress - 0.78) / 0.12, 0, 1);

  return (
    <>
      <Kicker x={CX} y={70}>PASSO 03 / 04</Kicker>

      {/* Robot */}
      <Robot x={rx} y={ry} scale={1} opacity={roboOp * exitOp} eyeOpen={blink} antennaPulse={antennaPulse} />

      {/* Chat thread, left side */}
      <ChatBubble x={140} y={ry - 130} w={360} h={56} opacity={b1 * exitOp} side="left">
        Oi, tenho interesse no serviço!
      </ChatBubble>
      <Kicker x={140 + 90} y={ry - 130 + 76} color="rgba(255,255,255,0.4)" size={9} op={b1 * exitOp}>
        LEAD &nbsp;·&nbsp; 14:02
      </Kicker>

      <ChatBubble x={500} y={ry - 50} w={300} h={56} opacity={b2 * exitOp} side="right">
        Olá! Posso te ajudar. Qual o seu nicho?
      </ChatBubble>
      <Kicker x={500 + 230} y={ry - 50 + 76} color="rgba(255,255,255,0.4)" size={9} op={b2 * exitOp}>
        IA &nbsp;·&nbsp; 14:02 &nbsp;·&nbsp; +3s
      </Kicker>

      <ChatBubble x={140} y={ry + 50} w={260} h={56} opacity={b3 * exitOp} side="left">
        E o investimento?
      </ChatBubble>
      <Kicker x={140 + 50} y={ry + 50 + 76} color="rgba(255,255,255,0.4)" size={9} op={b3 * exitOp}>
        LEAD &nbsp;·&nbsp; 14:03
      </Kicker>

      <ChatBubble x={500} y={ry + 130} w={320} h={56} opacity={b4 * exitOp} side="right">
        Já te conecto com um especialista →
      </ChatBubble>
      <Kicker x={500 + 245} y={ry + 130 + 76} color="rgba(255,255,255,0.4)" size={9} op={b4 * exitOp}>
        IA &nbsp;·&nbsp; 14:03 &nbsp;·&nbsp; +2s
      </Kicker>

      <Headline x={80} y={110} size={48} align="left" op={clamp((progress - 0.06) / 0.12, 0, 1) * exitOp}>
        IA atende.
      </Headline>
      <Body x={80} y={180} size={14} align="left" op={clamp((progress - 0.16) / 0.14, 0, 1) * exitOp} maxW={420}>
        Robô treinado no seu negócio. Responde, qualifica e agenda. Lead nenhum esfria no WhatsApp.
      </Body>

      <Body x={CX} y={H - 170} size={36} weight={500} color="#fff" op={punchOp * exitOp} maxW={900}>
        Resposta em <span style={{fontVariantNumeric:'tabular-nums'}}>3 segundos</span>. Vinte e quatro horas por dia.
      </Body>
      <Kicker x={CX} y={H - 100} color="rgba(255,255,255,0.55)" size={11} op={punchOp * exitOp}>
        WHATSAPP &nbsp;·&nbsp; CRM &nbsp;·&nbsp; FOLLOW-UP &nbsp;·&nbsp; AGENDAMENTO
      </Kicker>
    </>
  );
}

// ── SCENE 5 — Passo 04 / Vídeo ──────────────────────────────────────────────

function SceneVideo() {
  const { progress, localTime } = useSprite();
  const exitOp = 1 - clamp((progress - 0.92) / 0.08, 0, 1);

  // Camera centered-right
  const camX = 940, camY = CY + 60;
  const camOp = clamp((progress - 0.02) / 0.14, 0, 1);

  // Recording dot pulse (small red... but we're monochrome so it's white)
  const recPulse = 0.5 + Math.abs(Math.sin(localTime * 2.5)) * 0.5;

  // Thumbnails fan out from camera
  // 4 thumbnails at angles around camera
  const thumbDefs = [
    { dx: -180, dy: -120, label: 'REELS', delay: 0.20 },
    { dx: -260, dy: -10,  label: 'ANÚNCIO', delay: 0.30 },
    { dx: -180, dy: 100,  label: 'VSL', delay: 0.40 },
    { dx: -340, dy: 60,   label: 'YOUTUBE', delay: 0.50 },
  ];

  const punchOp = clamp((progress - 0.74) / 0.12, 0, 1);

  return (
    <>
      <Kicker x={CX} y={70}>PASSO 04 / 04</Kicker>

      <Camera x={camX} y={camY} scale={1} opacity={camOp * exitOp} />

      {/* REC indicator */}
      <Circle x={camX - 88} y={camY - 56} r={4} fill="#fff" opacity={camOp * recPulse * exitOp} />
      <div style={{
        position: 'absolute', left: camX - 76, top: camY - 64,
        fontFamily: mono, fontSize: 9, letterSpacing: '0.22em',
        color: '#fff', opacity: camOp * exitOp,
      }}>REC</div>

      {/* Thumbnails fan out */}
      {thumbDefs.map((t, i) => {
        const p = clamp((progress - t.delay) / 0.12, 0, 1);
        const eP = Easing.easeOutCubic(p);
        const tx = camX + t.dx * eP;
        const ty = camY + t.dy * eP;
        const tw = 130, th = 80;
        return (
          <React.Fragment key={t.label}>
            <div style={{
              position: 'absolute', left: tx - tw / 2, top: ty - th / 2,
              width: tw, height: th, borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.7)',
              background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 5px, rgba(255,255,255,0.02) 5px 10px)',
              opacity: p * exitOp, boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Play triangle */}
              <div style={{
                width: 0, height: 0,
                borderLeft: '10px solid #fff',
                borderTop: '7px solid transparent',
                borderBottom: '7px solid transparent',
                marginLeft: 4,
              }} />
            </div>
            <div style={{
              position: 'absolute', left: tx, top: ty + th / 2 + 8,
              transform: 'translate(-50%, 0)',
              fontFamily: mono, fontSize: 9, letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.6)', opacity: p * exitOp,
            }}>{t.label}</div>
          </React.Fragment>
        );
      })}

      <Headline x={80} y={120} size={56} align="left" op={clamp((progress - 0.06) / 0.12, 0, 1) * exitOp}>
        Vídeo que vende.
      </Headline>
      <Body x={80} y={200} size={16} align="left" op={clamp((progress - 0.16) / 0.14, 0, 1) * exitOp} maxW={460}>
        Roteiro, edição e entrega. Conteúdo para anúncios e redes — autoridade que se constrói no feed.
      </Body>

      <Body x={CX} y={H - 170} size={36} weight={500} color="#fff" op={punchOp * exitOp} maxW={900}>
        Conteúdo certo. Quem vê, lembra.
      </Body>
      <Kicker x={CX} y={H - 100} color="rgba(255,255,255,0.55)" size={11} op={punchOp * exitOp}>
        REELS &nbsp;·&nbsp; VSL &nbsp;·&nbsp; ANÚNCIOS &nbsp;·&nbsp; YOUTUBE
      </Kicker>
    </>
  );
}

// ── SCENE 6 — O Sistema ─────────────────────────────────────────────────────

function SceneSistema() {
  const { progress, localTime } = useSprite();
  const exitOp = 1 - clamp((progress - 0.94) / 0.06, 0, 1);

  // Four nodes arranged on a horizontal flow:
  // [Phone] → [Monitor] → [Robot] → [Camera] → loops back
  // Place them evenly across the canvas
  const y = CY + 30;
  const nodes = [
    { kind: 'phone',    x: 200, label: 'TRÁFEGO',    sub: '01' },
    { kind: 'monitor',  x: 510, label: 'SITE',       sub: '02' },
    { kind: 'robot',    x: 800, label: 'IA',         sub: '03' },
    { kind: 'camera',   x: 1080, label: 'VÍDEO',     sub: '04' },
  ];

  // Reveal nodes sequentially
  const revealAt = (i) => clamp((progress - 0.02 - i * 0.08) / 0.10, 0, 1);
  // Arrows reveal between nodes after both are shown
  const arrowAt = (i) => clamp((progress - 0.08 - i * 0.08) / 0.10, 0, 1);

  // Headline reveal
  const headOp = clamp((progress - 0.50) / 0.12, 0, 1);
  const tagOp  = clamp((progress - 0.66) / 0.12, 0, 1);
  const ctaOp  = clamp((progress - 0.80) / 0.12, 0, 1);

  // CTA button hover-glow pulse
  const ctaPulse = 0.6 + Math.abs(Math.sin(localTime * 2)) * 0.4;

  // Subtle particle moving along flow (lead traveling through system)
  const flowT = (localTime % 4) / 4; // 0..1 over 4s
  let flowX, flowSeg;
  // 3 segments between nodes 0→1→2→3
  const segP = flowT * 3;
  const seg = Math.floor(segP);
  const segLocal = segP - seg;
  if (seg < 3) {
    flowX = nodes[seg].x + (nodes[seg + 1].x - nodes[seg].x) * segLocal;
    flowSeg = seg;
  } else {
    flowX = nodes[3].x;
    flowSeg = 2;
  }
  const flowVisible = progress > 0.55;

  return (
    <>
      <Kicker x={CX} y={70}>O SISTEMA</Kicker>

      {/* Nodes */}
      {nodes.map((n, i) => {
        const op = revealAt(i) * exitOp;
        let icon = null;
        if (n.kind === 'phone')   icon = <Phone x={n.x} y={y} w={90} h={150} opacity={op} />;
        if (n.kind === 'monitor') icon = <Computer x={n.x} y={y - 12} w={170} h={110} opacity={op} />;
        if (n.kind === 'robot')   icon = <Robot x={n.x} y={y} scale={0.55} opacity={op} eyeOpen={1} antennaPulse={1} />;
        if (n.kind === 'camera')  icon = <Camera x={n.x} y={y} scale={0.65} opacity={op} />;
        return (
          <React.Fragment key={n.kind}>
            {icon}
            <Kicker x={n.x} y={y + 110} size={11} color="rgba(255,255,255,0.55)" op={op}>
              {n.sub}
            </Kicker>
            <div style={{
              position: 'absolute', left: n.x, top: y + 130,
              transform: 'translate(-50%, 0)',
              fontFamily: helv, fontSize: 22, fontWeight: 500,
              letterSpacing: '-0.02em', color: '#fff', opacity: op,
              whiteSpace: 'nowrap',
            }}>{n.label}</div>
          </React.Fragment>
        );
      })}

      {/* Arrows between nodes */}
      {[0, 1, 2].map((i) => {
        const op = arrowAt(i) * exitOp;
        // From right edge of node[i] to left edge of node[i+1]
        const offsets = [50, 95, 65]; // half-widths of each node icon for arrow start
        const offsetsRight = [95, 65, 80];
        const x1 = nodes[i].x + offsets[i];
        const x2 = nodes[i + 1].x - offsetsRight[i];
        return (
          <Arrow key={i} x1={x1} y1={y} x2={x2} y2={y}
                 color="rgba(255,255,255,0.7)" opacity={op} head={8} />
        );
      })}

      {/* Travelling particle (the lead) */}
      {flowVisible && (
        <>
          <Circle x={flowX} y={y} r={5} fill="#fff" opacity={exitOp} />
          <Circle x={flowX} y={y} r={11} stroke="rgba(255,255,255,0.4)" opacity={exitOp * 0.8} />
        </>
      )}

      <Headline x={CX} y={120} size={48} op={headOp * exitOp} maxW={1100}>
        Quatro passos. Um sistema.
      </Headline>
      <Body x={CX} y={195} size={17} op={tagOp * exitOp} maxW={680}>
        O lead que entra pelo anúncio sai com proposta na mão. Sem você apertar nada.
      </Body>

      {/* CTA */}
      <div style={{
        position: 'absolute', left: CX, top: H - 130,
        transform: 'translate(-50%, 0)',
        opacity: ctaOp * exitOp,
      }}>
        <div style={{
          padding: '16px 32px',
          border: '1.5px solid #fff',
          borderRadius: 4,
          fontFamily: helv, fontSize: 17, fontWeight: 500,
          color: '#fff', letterSpacing: '0.02em',
          boxShadow: `0 0 ${20 * ctaPulse}px rgba(255,255,255,${0.15 * ctaPulse})`,
          background: 'rgba(255,255,255,0.04)',
        }}>
          Falar com um especialista &nbsp;→
        </div>
      </div>
    </>
  );
}

// ── Persistent chrome ───────────────────────────────────────────────────────

function StageChrome() {
  const time = useTime();
  const { duration } = useTimeline();

  const fmt = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const cs = Math.floor((t * 100) % 100);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(cs).padStart(2,'0')}`;
  };

  // Determine current step label
  const step = (() => {
    if (time < T.intro[1])    return '00 / INTRO';
    if (time < T.trafego[1])  return '01 / TRÁFEGO PAGO';
    if (time < T.site[1])     return '02 / SITE INTERATIVO';
    if (time < T.ia[1])       return '03 / IA & AUTOMAÇÃO';
    if (time < T.video[1])    return '04 / EDIÇÃO DE VÍDEO';
    return '— / SISTEMA';
  })();

  return (
    <>
      <CornerTick x={28} y={28} dx={1} dy={1} />
      <CornerTick x={W - 28} y={28} dx={-1} dy={1} />
      <CornerTick x={28} y={H - 28} dx={1} dy={-1} />
      <CornerTick x={W - 28} y={H - 28} dx={-1} dy={-1} />

      <div style={{
        position: 'absolute', left: 48, top: 28,
        fontFamily: mono, fontSize: 10, letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
      }}>
        ◯ &nbsp; COMO FUNCIONA
      </div>

      <div style={{
        position: 'absolute', right: 48, top: 28,
        fontFamily: mono, fontSize: 10, letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums',
      }}>
        T+ {fmt(time)}
      </div>

      <div style={{
        position: 'absolute', left: 48, bottom: 28,
        fontFamily: mono, fontSize: 10, letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
      }}>
        {step}
      </div>

      <div style={{
        position: 'absolute', right: 48, bottom: 28,
        fontFamily: mono, fontSize: 10, letterSpacing: '0.22em',
        color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums',
      }}>
        {fmt(duration)}
      </div>
    </>
  );
}

function CornerTick({ x, y, dx, dy }) {
  const len = 14;
  return (
    <>
      <div style={{
        position: 'absolute',
        left: dx > 0 ? x : x + dx * len,
        top: y - 0.5,
        width: len, height: 1, background: 'rgba(255,255,255,0.4)',
      }} />
      <div style={{
        position: 'absolute',
        left: x - 0.5,
        top: dy > 0 ? y : y + dy * len,
        width: 1, height: len, background: 'rgba(255,255,255,0.4)',
      }} />
    </>
  );
}

// ── Master timeline ─────────────────────────────────────────────────────────

const T = {
  intro:   [0,  6],
  trafego: [6,  15],
  site:    [15, 25],
  ia:      [25, 35],
  video:   [35, 43],
  sistema: [43, 53],
};

function App() {
  return (
    <Stage
      width={W} height={H}
      duration={53}
      background="#000"
      persistKey="como-funciona-v1"
    >
      <StageChrome />

      <Sprite start={T.intro[0]}    end={T.intro[1]}>   <SceneIntro /></Sprite>
      <Sprite start={T.trafego[0]}  end={T.trafego[1]}> <SceneTrafego /></Sprite>
      <Sprite start={T.site[0]}     end={T.site[1]}>    <SceneSite /></Sprite>
      <Sprite start={T.ia[0]}       end={T.ia[1]}>      <SceneIA /></Sprite>
      <Sprite start={T.video[0]}    end={T.video[1]}>   <SceneVideo /></Sprite>
      <Sprite start={T.sistema[0]}  end={T.sistema[1]}> <SceneSistema /></Sprite>
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
