/* Canvas UI, https://github.com/DavidHDev/canvas-ui. Copyright (c) 2026 David Haz. MIT + Commons Clause, see
   LICENSE.md beside this file: use it as part of an application, website or product, not to sell or redistribute the
   components themselves. Built from the vanilla WebGL source by tools/canvas-ui.mjs. */
var he=new WeakMap;function ge(a,i){let t=window.visualViewport?.scale||1,s=Math.min(window.devicePixelRatio||1,2)*t,r=Math.max(a.clientWidth,1),o=Math.max(a.clientHeight,1),e=8192;if(i){let p=he.get(i);p===void 0&&(p=Math.min(e,i.getParameter(i.MAX_TEXTURE_SIZE),i.getParameter(i.MAX_RENDERBUFFER_SIZE)),he.set(i,p)),e=p}return Math.min(s,e/Math.max(r,o),Math.sqrt(16777216/(r*o)))}function ve(a){let i=window.visualViewport,t=0,s=!1,r=()=>{t||s||(t=requestAnimationFrame(()=>{t=0,a()}))},o=new ResizeObserver(r);return window.addEventListener("resize",r,{passive:!0}),i?.addEventListener("resize",r,{passive:!0}),{observe(e,p){o.observe(e,p)},unobserve(e){o.unobserve(e)},disconnect(){s=!0,o.disconnect(),cancelAnimationFrame(t),window.removeEventListener("resize",r),i?.removeEventListener("resize",r)}}}function Y(){return typeof navigator>"u"?!1:navigator.userAgentData?.platform==="Android"||/Android/i.test(navigator.userAgent)}function be(a,i){"content"in a?(a.setAttribute("content","drawable"),i.setAttribute("drawable","")):a.setAttribute("layoutsubtree","")}var xe=new WeakMap;function Le(a){let i=performance.now(),t=xe.get(a);if(t&&i-t.at<500)return t.layers;let s=[];for(let r=a;r;r=r.parentElement){let o=getComputedStyle(r).backgroundColor,e=1;if(!o||o==="transparent")e=0;else{let p=/\/\s*([\d.]+)(%?)\s*\)$/.exec(o),w=/^rgba\(([^)]+)\)$/.exec(o);p?e=Number(p[1])/(p[2]?100:1):w&&(e=Number(w[1].split(",")[3]??1))}if(e>0&&(s.unshift(o),e>=1))break}return xe.set(a,{at:i,layers:s}),s}function Me(a,i,t,s=!1){if(s)for(let e of Le(a))i.fillStyle=e,i.fillRect(0,0,a.width,a.height);let r=i.drawElementImage(t,0,0),o=a;r&&typeof o.updateElementGeometry=="function"&&o.updateElementGeometry(t,{canvasTransform:r})}function Ee(a){let i=a.getBoundingClientRect(),t=()=>{i=a.getBoundingClientRect()},s=new ResizeObserver(t);return s.observe(a),window.addEventListener("resize",t,{passive:!0}),window.addEventListener("scroll",t,{capture:!0,passive:!0}),{get current(){return i},destroy(){s.disconnect(),window.removeEventListener("resize",t),window.removeEventListener("scroll",t,!0)}}}function j(a,i){let t={};for(let s of Object.keys(i)){let r=i[s];t[s]=r===void 0?a[s]:r}return t}var K={size:140,zoom:1.5,scrollZoom:!1,zoomModifier:"shift",color:[.8,.8,.8],follow:.25,hud:.8,ring:!0,crosshair:!0,ticks:!0,brackets:!0,dot:!0,grid:!1,readout:!0,aberration:.8,haze:.2,ripples:!0,rippleSpeed:900,rippleWidth:2,rippleBendWidth:100,rippleBend:20,rippleGlow:1,rippleLife:1.4},_=6,De=1,Pe=4,Se=16,Ie=.0022;function Q(a){return Math.min(Math.max(a,De),Pe)}var Re={shift:a=>a.shiftKey,alt:a=>a.altKey,ctrl:a=>a.ctrlKey,meta:a=>a.metaKey,none:()=>!0},_e=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
void main () {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,He=`#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uContent;
uniform vec2 uResolution;
uniform float uMaxX;
uniform float uHasContent;
uniform float uDpr;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uZoom;
uniform float uAlpha;
uniform vec3 uColor;
uniform float uHud;
uniform float uRing;
uniform float uCross;
uniform float uTicks;
uniform float uBrackets;
uniform float uDot;
uniform float uGrid;
uniform float uAberration;
uniform float uHaze;
uniform vec4 uRipples[${_}];
uniform float uRippleWidth;
uniform float uRippleBendWidth;
uniform float uRippleBend;
uniform float uRippleGlow;

const float PI = 3.14159265358979;

float pow2 (float x) { return x * x; }

vec3 page (vec2 px, float lod) {
  vec2 uv = px / uResolution;
  uv.x = clamp(uv.x, 0.0005, uMaxX - 0.0005);
  uv.y = clamp(uv.y, 0.0005, 0.9995);
  return pow(textureLod(uContent, vec2(uv.x, 1.0 - uv.y), lod).rgb, vec3(2.2));
}

vec3 pageAA (vec2 px, float minLod) {
  float footprint = max(length(fwidth(px)), 1.0);
  return page(px, max(minLod, log2(footprint)));
}

float line (float d, float halfWidth) {
  return 1.0 - smoothstep(halfWidth - 0.75, halfWidth + 0.75, abs(d));
}

void main () {
  vec2 fragPx = gl_FragCoord.xy;
  vec2 p = fragPx - uCenter;
  float d = length(p);
  float R = uRadius;
  float w = 1.1 * uDpr;

  vec2 rippleOffset = vec2(0.0);
  float crest = 0.0;
  float bendVis = 0.0;
  for (int i = 0; i < ${_}; i++) {
    vec4 rp = uRipples[i];
    vec2 rd = fragPx - rp.xy;
    float rl = max(length(rd), 1.0);
    float bendBand = exp(-pow2((rl - rp.z) / max(uRippleBendWidth * uDpr, 1.0)));
    float crestBand = exp(-pow2((rl - rp.z) / max(uRippleWidth * uDpr, 1.0)));
    rippleOffset += (rd / rl) * bendBand * rp.w * uRippleBend * uDpr;
    crest = max(crest, crestBand * rp.w);
    bendVis = max(bendVis, bendBand * rp.w);
  }

  float inContent = 1.0 - smoothstep(
    uMaxX * uResolution.x - 2.0, uMaxX * uResolution.x, fragPx.x);
  crest *= inContent;
  float rippleCover = smoothstep(0.001, 0.03, bendVis) * inContent;

  float lensMask = 1.0 - smoothstep(R - 1.5, R, d);
  vec2 lensPx = uCenter + p / max(uZoom, 1.0) - rippleOffset;
  float rimT = pow2(clamp(d / max(R, 1.0), 0.0, 1.0));
  vec2 dir = p / max(d, 0.5);
  float caPx = uAberration * 5.0 * rimT * uDpr;
  float hazeLod = uHaze * 3.0 * (0.3 + 0.7 * rimT);
  vec3 inside;
  inside.r = pageAA(lensPx + dir * caPx, hazeLod).r;
  inside.g = pageAA(lensPx, hazeLod).g;
  inside.b = pageAA(lensPx - dir * caPx, hazeLod).b;

  vec3 soft = page(lensPx, 4.5);
  inside = mix(
    inside,
    soft * (1.0 + 0.4 * uHaze) + uColor * 0.06 * uHaze,
    clamp(uHaze, 0.0, 1.0) * 0.45);

  vec3 bent = pageAA(fragPx - rippleOffset, 0.0);

  float hud = 0.0;

  hud += uRing * line(d - R, 1.3 * uDpr);

  float angle = atan(p.y, p.x);
  float sector = PI / 4.0;
  float da = abs(angle - (floor(angle / sector + 0.5) * sector)) * max(d, 1.0);
  float tickBand = smoothstep(R + 4.0 * uDpr, R + 6.0 * uDpr, d)
    * (1.0 - smoothstep(R + 12.0 * uDpr, R + 14.0 * uDpr, d));
  hud += uTicks * line(da, w) * tickBand;

  float reach = R * 1.14;
  float crossLine = max(
    line(p.x, w) * step(abs(p.y), reach),
    line(p.y, w) * step(abs(p.x), reach));
  hud += uCross * crossLine * smoothstep(6.0 * uDpr, 10.0 * uDpr, d) * 0.75;

  vec2 q = abs(p);
  float c = R * 0.64;
  float len = R * 0.2;
  float arm1 = line(q.x - c, w) * step(c - len, q.y) * step(q.y, c + w);
  float arm2 = line(q.y - c, w) * step(c - len, q.x) * step(q.x, c + w);
  hud += uBrackets * max(arm1, arm2);

  hud += uDot * (1.0 - smoothstep(1.6 * uDpr, 2.6 * uDpr, d));
  hud += uDot * line(d - 5.5 * uDpr, 0.9 * uDpr) * 0.6;

  float spacing = max(R * 0.25, 8.0);
  float gx = line(mod(p.x + spacing * 0.5, spacing) - spacing * 0.5, 0.6 * uDpr);
  float gy = line(mod(p.y + spacing * 0.5, spacing) - spacing * 0.5, 0.6 * uDpr);
  hud += uGrid * max(gx, gy) * lensMask * 0.16;

  hud = clamp(hud, 0.0, 1.0) * uHud;

  if (uHasContent < 0.5) {
    vec3 hudCol = pow(max(uColor, 0.0), vec3(1.0 / 2.2));
    float hudA = hud * uAlpha;
    float glow = clamp(pow(crest, 1.5) * uRippleGlow, 0.0, 1.0) * inContent;
    float a = max(hudA, lensMask * uAlpha * 0.08);
    a = max(a, glow * 0.7);
    outColor = vec4(hudCol * clamp(hudA + glow * 0.7, 0.0, 1.0), a);
    return;
  }

  vec3 base = mix(bent, inside, lensMask * uAlpha);
  base += uColor * pow(crest, 1.5) * uRippleGlow * 0.7;
  float hudA = hud * uAlpha;
  base = mix(base, uColor, hudA);

  float alpha = max(lensMask * uAlpha, rippleCover);
  alpha = max(alpha, clamp(pow(crest, 1.5) * uRippleGlow, 0.0, 1.0));
  alpha = max(alpha, hudA);

  outColor = vec4(pow(max(base, 0.0), vec3(1.0 / 2.2)) * alpha, alpha);
}`;function ze(){if(typeof document>"u"||Y())return!1;let a=document.createElement("canvas"),i=a.getContext("2d");return!!(i&&typeof i.drawElementImage=="function"&&typeof a.requestPaint=="function")}function Be(a,i={}){let t={...K,...j(K,i)},{source:s,content:r,output:o}=a,e=o.getContext("webgl2",{alpha:!0,depth:!1,stencil:!1,antialias:!1,premultipliedAlpha:!0});if(!e||e.isContextLost())return null;let p=s.getContext("2d"),w=s,T=!!(!Y()&&s.contains(r)&&p&&typeof p.drawElementImage=="function"&&typeof w.requestPaint=="function");T&&be(s,r);let H=!1,J=()=>{};T&&(w.onpaint=()=>{try{p.reset(),Me(s,p,r,!0),H=!0,J()}catch{}});function ee(n,l){let c=e.createShader(n);return e.shaderSource(c,l),e.compileShader(c),e.getShaderParameter(c,e.COMPILE_STATUS)||console.error("Magnify shader error:",e.getShaderInfoLog(c)),c}let te=ee(e.VERTEX_SHADER,_e),ne=ee(e.FRAGMENT_SHADER,He),E=e.createProgram();e.attachShader(E,te),e.attachShader(E,ne),e.linkProgram(E);let u={},we=e.getProgramParameter(E,e.ACTIVE_UNIFORMS);for(let n=0;n<we;n++){let l=e.getActiveUniform(E,n);u[l.name]=e.getUniformLocation(E,l.name)}let oe=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,oe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let z=e.createTexture();e.bindTexture(e.TEXTURE_2D,z),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),e.generateMipmap(e.TEXTURE_2D);let ae=1,R=document.createElement("div");R.setAttribute("aria-hidden","true"),Object.assign(R.style,{position:"absolute",left:"0",top:"0",pointerEvents:"none",whiteSpace:"pre",fontFamily:"ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",fontSize:"10px",lineHeight:"1.8",letterSpacing:"0.14em",opacity:"0",zIndex:"1",willChange:"transform, opacity"}),(o.parentElement??o.ownerDocument.body).appendChild(R);function Ce(){let[n,l,c]=t.color;return`rgb(${Math.round(n*255)} ${Math.round(l*255)} ${Math.round(c*255)})`}function k(){let n=ge(o,e),l=Math.max(1,Math.round(o.clientWidth*n)),c=Math.max(1,Math.round(o.clientHeight*n));if((o.width!==l||o.height!==c)&&(o.width=l,o.height=c),ae=Math.min(1,Math.max(.05,r.clientWidth/Math.max(o.clientWidth,1))),T){let d=Math.max(1,Math.round(s.clientWidth*n)),h=Math.max(1,Math.round(s.clientHeight*n));(s.width!==d||s.height!==h)&&(s.width=d,s.height=h),w.requestPaint()}}k();function Te(){!T||!H||(H=!1,e.bindTexture(e.TEXTURE_2D,z),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,s),e.generateMipmap(e.TEXTURE_2D))}let x=o.clientWidth/2,M=o.clientHeight/2,P=x,S=M,b=0,I=0,F=!1,C=Q(t.zoom),y=C,g=[],A=new Float32Array(_*4);function ye(n){let l=t.readout&&t.hud>.01&&b>.05;if(R.style.opacity=l?String(Math.min(b,1)*Math.min(t.hud,1)):"0",!l)return;let c=Math.max(t.size,8)*b,d=o.clientWidth,h=120,m=x+c+18;m+h>d-8&&(m=x-c-18-h);let f=Math.min(Math.max(M-34,8),Math.max(o.clientHeight-90,8));R.style.transform=`translate(${Math.round(m)}px, ${Math.round(f)}px)`,R.style.color=Ce();let D=Math.floor(n/600)%2===0?"\u25CF":"\u25CB";R.textContent=`X ${String(Math.round(x)).padStart(4," ")}
Y ${String(Math.round(M)).padStart(4," ")}
${y.toFixed(1)}X MAG
R ${Math.round(t.size)}PX ${D}`}function Ae(){Te();let n=o.width/Math.max(o.clientWidth,1);if(e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,o.width,o.height),e.disable(e.SCISSOR_TEST),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),b<=.004&&g.length===0)return;let l=Math.max(t.size,8)*b,c=Math.min(b*5,1),d=x*n,h=o.height-M*n;if(g.length===0){let m=(l*.25+160)*n,f=Math.max(0,Math.floor(d-l*n-m)),D=Math.max(0,Math.floor(h-l*n-m));e.enable(e.SCISSOR_TEST),e.scissor(f,D,Math.min(o.width-f,Math.ceil((l*n+m)*2)),Math.min(o.height-D,Math.ceil((l*n+m)*2)))}A.fill(0);for(let m=0;m<Math.min(g.length,_);m++){let f=g[m],D=f.age/Math.max(t.rippleLife,.1);A[m*4]=f.x*n,A[m*4+1]=o.height-f.y*n,A[m*4+2]=(f.r0+Math.max(t.rippleSpeed,1)*f.age)*n,A[m*4+3]=Math.pow(Math.max(1-D,0),2)}e.useProgram(E),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,z),e.uniform1i(u.uContent,0),e.uniform2f(u.uResolution,o.width,o.height),e.uniform1f(u.uMaxX,ae),e.uniform1f(u.uHasContent,T?1:0),e.uniform1f(u.uDpr,n),e.uniform2f(u.uCenter,d,h),e.uniform1f(u.uRadius,l*n),e.uniform1f(u.uZoom,y),e.uniform1f(u.uAlpha,c),e.uniform3f(u.uColor,t.color[0],t.color[1],t.color[2]),e.uniform1f(u.uHud,Math.min(Math.max(t.hud,0),1)),e.uniform1f(u.uRing,t.ring?1:0),e.uniform1f(u.uCross,t.crosshair?1:0),e.uniform1f(u.uTicks,t.ticks?1:0),e.uniform1f(u.uBrackets,t.brackets?1:0),e.uniform1f(u.uDot,t.dot?1:0),e.uniform1f(u.uGrid,t.grid?1:0),e.uniform1f(u.uAberration,Math.max(t.aberration,0)),e.uniform1f(u.uHaze,Math.min(Math.max(t.haze,0),1)),e.uniform4fv(u["uRipples[0]"],A),e.uniform1f(u.uRippleWidth,Math.max(t.rippleWidth,.5)),e.uniform1f(u.uRippleBendWidth,Math.max(t.rippleBendWidth,1)),e.uniform1f(u.uRippleBend,Math.max(t.rippleBend,0)),e.uniform1f(u.uRippleGlow,Math.max(t.rippleGlow,0)),e.drawArrays(e.TRIANGLE_STRIP,0,4),e.disable(e.SCISSOR_TEST)}let B=0,G=performance.now(),U=!1,L=!1,O=!0,W=window.matchMedia("(prefers-reduced-motion: reduce)"),X=W.matches;function re(n){if(U)return;if(!O){L=!1;return}let l=Math.min((n-G)/1e3,1/30);G=n;let c=Math.min(Math.max(t.follow,.02),1),d=X||c>=1?1:1-Math.exp(-l*(4+c*26)),h=X?1:1-Math.exp(-l*11);x+=(P-x)*d,M+=(S-M)*d,b+=(I-b)*h,y+=(C-y)*h;for(let f of g)f.age+=l;for(let f=g.length-1;f>=0;f--)g[f].age>Math.max(t.rippleLife,.1)&&g.splice(f,1);if(Ae(),ye(n),Math.abs(P-x)<.1&&Math.abs(S-M)<.1&&Math.abs(I-b)<.002&&Math.abs(C-y)<.002&&!H&&g.length===0){x=P,M=S,b=I,y=C,L=!1;return}B=requestAnimationFrame(re)}function v(){U||L||!O||(L=!0,G=performance.now(),B=requestAnimationFrame(re))}J=v,v();let ie=Ee(o);function se(n){let l=ie.current;P=n.clientX-l.left,S=n.clientY-l.top,F||(x=P,M=S,F=!0),I=1,v()}function le(){I=0,F=!1,v()}function ue(n){!t.ripples||n.button>0||X||(g.length>=_&&g.shift(),g.push({x,y:M,r0:Math.max(t.size,8)*b,age:0}),v())}r.addEventListener("pointermove",se,{passive:!0}),r.addEventListener("pointerleave",le,{passive:!0}),r.addEventListener("pointerdown",ue,{passive:!0});function N(n){if(!(Re[t.zoomModifier]??Re.shift)(n))return;let c=o.getBoundingClientRect();if(n.clientX<c.left||n.clientX>c.right||n.clientY<c.top||n.clientY>c.bottom)return;n.preventDefault();let d=n.deltaMode===1?Se:n.deltaMode===2?o.clientHeight:1,h=Math.abs(n.deltaY)>=Math.abs(n.deltaX)?n.deltaY:n.deltaX;C=Q(C*Math.exp(-h*d*Ie)),v()}let q={passive:!1,capture:!0},Z=!1;function ce(){t.scrollZoom!==Z&&(Z=t.scrollZoom,Z?window.addEventListener("wheel",N,q):window.removeEventListener("wheel",N,q))}ce();function me(){v()}r.addEventListener("scroll",me,{passive:!0});function fe(){X=W.matches,v()}W.addEventListener("change",fe);let $=ve(()=>{k(),v()});$.observe(o),$.observe(r);let pe=!0;function V(){O=pe&&document.visibilityState!=="hidden",O?v():L&&(cancelAnimationFrame(B),L=!1)}let de=new IntersectionObserver(n=>{pe=n[n.length-1]?.isIntersecting??!0,V()});return document.addEventListener("visibilitychange",V),de.observe(o),{setOptions(n){if(n=j(K,n),!Object.entries(n).some(([c,d])=>t[c]!==d))return;let l=t.zoom;Object.assign(t,n),(!t.scrollZoom||t.zoom!==l)&&(C=Q(t.zoom)),ce(),v()},resize(){k(),v()},destroy(){U=!0,ie.destroy(),cancelAnimationFrame(B),r.removeEventListener("pointermove",se),r.removeEventListener("pointerleave",le),r.removeEventListener("pointerdown",ue),window.removeEventListener("wheel",N,q),r.removeEventListener("scroll",me),$.disconnect(),de.disconnect(),document.removeEventListener("visibilitychange",V),W.removeEventListener("change",fe),R.remove(),e.deleteTexture(z),e.deleteProgram(E),e.deleteShader(te),e.deleteShader(ne),e.deleteBuffer(oe),T&&(w.onpaint=null)}}}export{Be as createMagnify,ze as supportsHtmlInCanvas};
