import{HalfFloatType as Of,NoToneMapping as Uf,PerspectiveCamera as Lf,Scene as Bf,Vector3 as wt,WebGLRenderer as Ff,MathUtils as yt}from"three";import{DepthStencilFormat as Bo,DepthTexture as Li,FloatType as Fo,LinearFilter as ca,SRGBColorSpace as ar,UnsignedByteType as Bi,UnsignedInt248Type as Ho,Vector2 as _t,WebGLRenderTarget as la}from"three";import{BasicDepthPacking as Go,BufferAttribute as ua,BufferGeometry as zo,Material as ko,Mesh as Wo,OrthographicCamera as Vo,Scene as ha,Texture as Yo,WebGLRenderTarget as Xo}from"three";import{LinearFilter as da,SRGBColorSpace as fa,UnsignedByteType as Ko,WebGLRenderTarget as jo}from"three";import{AlwaysDepth as qo,NoBlending as Jo,ShaderMaterial as $o,Uniform as Pr}from"three";import{Color as rc}from"three";import{LinearSRGBColorSpace as oc}from"three";import{BackSide as Nr,DoubleSide as br,FrontSide as lc,ShaderMaterial as uc}from"three";import{EventDispatcher as hc,Vector2 as Gi}from"three";import{EventDispatcher as dc,Uniform as fc}from"three";import{Color as Jf,Uniform as $f,Vector2 as e0,Vector4 as t0}from"three";import{CanvasTexture as i0,RepeatWrapping as n0}from"three";import{BasicDepthPacking as Zc,EventDispatcher as Kc,LinearSRGBColorSpace as jc,Material as qc,NoColorSpace as Jc,Texture as $c,WebGLRenderTarget as el}from"three";import{SRGBColorSpace as o0,Uniform as c0,WebGLRenderTarget as l0}from"three";import{SRGBColorSpace as h0,UnsignedByteType as d0,WebGLRenderTarget as f0}from"three";import{NoBlending as p0,ShaderMaterial as g0,Uniform as v0,Vector4 as A0}from"three";import{UnsignedByteType as tl,WebGLRenderTarget as rl}from"three";import{NoBlending as il,REVISION as nl,ShaderMaterial as al,Uniform as Or}from"three";import{SRGBColorSpace as w0,UnsignedByteType as y0,Vector2 as C0,WebGLRenderTarget as D0}from"three";import{NoBlending as _0,ShaderMaterial as I0,Uniform as M0,Vector2 as P0}from"three";import{NoBlending as b0,ShaderMaterial as O0,Uniform as U0,Vector2 as L0}from"three";import{Uniform as F0}from"three";import{SRGBColorSpace as G0,Uniform as z0}from"three";import{Uniform as W0}from"three";import{Uniform as Y0,Vector2 as X0}from"three";import{BasicDepthPacking as Z0,SRGBColorSpace as K0,Uniform as j0,UnsignedByteType as q0,Vector3 as J0,WebGLRenderTarget as $0}from"three";import{NoBlending as tm,ShaderMaterial as rm,Uniform as im,Vector2 as nm}from"three";import{BasicDepthPacking as sm,NoBlending as om,PerspectiveCamera as cm,ShaderMaterial as lm,Uniform as um}from"three";import{NoBlending as dm,ShaderMaterial as fm,Uniform as mm,UnsignedByteType as pm}from"three";import{UnsignedByteType as ll}from"three";import{Uniform as Am,Vector2 as Tm}from"three";import{Uniform as Em}from"three";import{NearestFilter as wm,RepeatWrapping as ym,RGBAFormat as Cm,Uniform as Dm,Vector2 as Rm}from"three";import{DataTexture as Im,RedFormat as Mm,RGFormat as Pm,RGBAFormat as Nm,UnsignedByteType as bm}from"three";import{BasicDepthPacking as Um,DepthTexture as Lm,Matrix4 as Bm,Scene as Fm,SRGBColorSpace as Hm,Uniform as Gm,Vector2 as zm,Vector3 as km,Vector4 as Wm,WebGLRenderTarget as Vm}from"three";import{NoBlending as Xm,ShaderMaterial as Qm,Uniform as Zm}from"three";import{Uniform as jm,Vector2 as qm}from"three";import{Uniform as $m,Vector3 as ep}from"three";import{Uniform as rp,Vector2 as ip}from"three";import{FloatType as ap,HalfFloatType as sp,Uniform as op}from"three";import{Data3DTexture as lp,FloatType as up,HalfFloatType as hp,LinearFilter as dp,NearestFilter as fp,SRGBColorSpace as mp,Uniform as pp,Vector3 as gp}from"three";import{Color as Ap,ClampToEdgeWrapping as Tp,DataTexture as Sp,Data3DTexture as Ep,FloatType as xp,LinearFilter as wp,LinearSRGBColorSpace as yp,RGBAFormat as Cp,SRGBColorSpace as Dp,UnsignedByteType as Rp,Vector3 as _p}from"three";import{Color as Mp,RepeatWrapping as Pp,Uniform as Np,UnsignedByteType as bp,WebGLRenderTarget as Op}from"three";import{NoBlending as Lp,PerspectiveCamera as Bp,RGBADepthPacking as Fp,ShaderMaterial as Hp,Uniform as Gp}from"three";import{NoBlending as kp,ShaderMaterial as Wp,Uniform as Vp,Vector2 as Yp}from"three";import{Color as Qp,MeshDepthMaterial as Zp,NearestFilter as Kp,RGBADepthPacking as jp,WebGLRenderTarget as qp}from"three";import{Uniform as $p,Vector2 as e1,Vector4 as t1}from"three";import{Uniform as i1,Vector4 as n1}from"three";import{Uniform as s1,Vector2 as o1}from"three";import{Uniform as l1,Vector2 as u1,Vector3 as h1}from"three";import{BasicDepthPacking as m1,Color as p1,NotEqualDepth as g1,EqualDepth as v1,RGBADepthPacking as A1,SRGBColorSpace as T1,WebGLRenderTarget as S1}from"three";import{AlwaysDepth as x1,BasicDepthPacking as w1,EqualDepth as y1,GreaterDepth as C1,GreaterEqualDepth as D1,LessDepth as R1,LessEqualDepth as _1,NeverDepth as I1,NoBlending as M1,NotEqualDepth as P1,PerspectiveCamera as N1,ShaderMaterial as b1,Uniform as O1,Vector2 as U1}from"three";import{Uniform as B1,Vector3 as F1}from"three";import{BasicDepthPacking as G1,Color as z1,LinearFilter as k1,LoadingManager as W1,NearestFilter as V1,Texture as Y1,Uniform as X1,WebGLRenderTarget as Q1}from"three";import{BasicDepthPacking as K1,NoBlending as j1,REVISION as q1,ShaderMaterial as J1,Uniform as $1,Vector2 as eg}from"three";import{NoBlending as rg,ShaderMaterial as ig,Uniform as ng,Vector2 as ag}from"three";import{BasicDepthPacking as og,Color as cg,RepeatWrapping as lg,RGBAFormat as ug,Uniform as hg,WebGLRenderTarget as dg}from"three";import{BasicDepthPacking as mg,Matrix4 as pg,NoBlending as gg,PerspectiveCamera as vg,ShaderMaterial as Ag,Uniform as Tg,Vector2 as Sg}from"three";import{BasicDepthPacking as xg,FloatType as wg,NearestFilter as yg,WebGLRenderTarget as Cg}from"three";import{BasicDepthPacking as Rg,NoBlending as _g,ShaderMaterial as Ig,Uniform as Mg,Vector2 as Pg}from"three";import{Uniform as bg,UnsignedByteType as Og}from"three";import{SRGBColorSpace as Lg,Uniform as Bg,Vector2 as Fg,WebGLRenderTarget as Hg}from"three";import{Uniform as zg,Vector2 as kg,Vector4 as Wg}from"three";import{LinearMipmapLinearFilter as ul,REVISION as hl,Uniform as sr,WebGLRenderTarget as dl}from"three";import{NearestFilter as ga,WebGLRenderTarget as fl}from"three";import{NoBlending as ml,ShaderMaterial as pl,Uniform as or}from"three";import{Uniform as Zg}from"three";import{FileLoader as jg,Loader as qg,LoadingManager as Jg}from"three";import{FileLoader as ev,Loader as tv,LoadingManager as rv,Vector3 as iv}from"three";import{Loader as av,LoadingManager as sv}from"three";import{NoBlending as cv,PerspectiveCamera as lv,ShaderMaterial as uv,Uniform as hv,Vector2 as dv}from"three";import{BasicDepthPacking as mv,NoBlending as pv,ShaderMaterial as gv,Uniform as vv,Vector2 as Av}from"three";import{BasicDepthPacking as Sl,NoBlending as El,PerspectiveCamera as xl,REVISION as wl,ShaderMaterial as yl,Uniform as qe,Vector2 as va}from"three";import{NoBlending as Ev,ShaderMaterial as xv,Uniform as wv,Vector2 as yv}from"three";import{BasicDepthPacking as Dv,SRGBColorSpace as Rv,UnsignedByteType as _v,WebGLRenderTarget as Iv}from"three";import{BasicDepthPacking as Pv,FloatType as Nv,REVISION as _l,RGBADepthPacking as bv}from"three";import{BasicDepthPacking as Uv,FloatType as Lv,NearestFilter as Bv,RGBADepthPacking as Fv,UnsignedByteType as Hv,WebGLRenderTarget as Gv}from"three";import{BasicDepthPacking as Il,NoColorSpace as Ml,SRGBColorSpace as xa,UnsignedByteType as Pl}from"three";import{SRGBColorSpace as Xv,UnsignedByteType as Qv,WebGLRenderTarget as Zv}from"three";import{Color as jv,MeshNormalMaterial as qv,NearestFilter as Jv,WebGLRenderTarget as $v}from"three";import{LoadingManager as l2}from"three";var Qo=(()=>{let t=new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),e=new Float32Array([0,0,2,0,0,2]),r=new zo;return r.setAttribute("position",new ua(t,3)),r.setAttribute("uv",new ua(e,2)),r})(),oe=class ki{static get fullscreenGeometry(){return Qo}constructor(e="Pass",r=new ha,i=new Vo){this.name=e,this.renderer=null,this.scene=r,this.camera=i,this.screen=null,this.rtt=!0,this.needsSwap=!0,this.needsDepthBlit=!1,this.needsDepthTexture=!1,this.enabled=!0}get renderToScreen(){return!this.rtt}set renderToScreen(e){if(this.rtt===e){let r=this.fullscreenMaterial;r!==null&&(r.needsUpdate=!0),this.rtt=!e}}set mainScene(e){}set mainCamera(e){}setRenderer(e){this.renderer=e}isEnabled(){return this.enabled}setEnabled(e){this.enabled=e}get fullscreenMaterial(){return this.screen!==null?this.screen.material:null}set fullscreenMaterial(e){let r=this.screen;r!==null?r.material=e:(r=new Wo(ki.fullscreenGeometry,e),r.frustumCulled=!1,this.scene===null&&(this.scene=new ha),this.scene.add(r),this.screen=r)}getFullscreenMaterial(){return this.fullscreenMaterial}setFullscreenMaterial(e){this.fullscreenMaterial=e}getDepthTexture(){return null}setDepthTexture(e,r=Go){}render(e,r,i,n,a){throw new Error("Render method not implemented!")}setSize(e,r){}initialize(e,r,i){}dispose(){for(let e of Object.keys(this)){let r=this[e];(r instanceof Xo||r instanceof ko||r instanceof Yo||r instanceof ki)&&this[e].dispose()}this.fullscreenMaterial!==null&&this.fullscreenMaterial.dispose()}},Zo=class extends oe{constructor(){super("ClearMaskPass",null,null),this.needsSwap=!1}render(t,e,r,i,n){let a=t.state.buffers.stencil;a.setLocked(!1),a.setTest(!1)}},ec=`#ifdef COLOR_WRITE
#include <common>
#include <dithering_pars_fragment>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#endif
#ifdef DEPTH_WRITE
#include <packing>
#ifdef GL_FRAGMENT_PRECISION_HIGH
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
return unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
return texture2D(depthBuffer,uv).r;
#endif
}
#endif
#ifdef USE_WEIGHTS
uniform vec4 channelWeights;
#endif
uniform float opacity;varying vec2 vUv;void main(){
#ifdef COLOR_WRITE
vec4 texel=texture2D(inputBuffer,vUv);
#ifdef USE_WEIGHTS
texel*=channelWeights;
#endif
gl_FragColor=opacity*texel;
#ifdef COLOR_SPACE_CONVERSION
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
#else
gl_FragColor=vec4(0.0);
#endif
#ifdef DEPTH_WRITE
gl_FragDepth=readDepth(vUv);
#endif
}`,Wi="varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}",tc=class extends $o{constructor(){super({name:"CopyMaterial",defines:{COLOR_SPACE_CONVERSION:"1",DEPTH_PACKING:"0",COLOR_WRITE:"1"},uniforms:{inputBuffer:new Pr(null),depthBuffer:new Pr(null),channelWeights:new Pr(null),opacity:new Pr(1)},blending:Jo,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:ec,vertexShader:Wi}),this.depthFunc=qo}get inputBuffer(){return this.uniforms.inputBuffer.value}set inputBuffer(t){let e=t!==null;this.colorWrite!==e&&(e?this.defines.COLOR_WRITE=!0:delete this.defines.COLOR_WRITE,this.colorWrite=e,this.needsUpdate=!0),this.uniforms.inputBuffer.value=t}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(t){let e=t!==null;this.depthWrite!==e&&(e?this.defines.DEPTH_WRITE=!0:delete this.defines.DEPTH_WRITE,this.depthTest=e,this.depthWrite=e,this.needsUpdate=!0),this.uniforms.depthBuffer.value=t}set depthPacking(t){this.defines.DEPTH_PACKING=t.toFixed(0),this.needsUpdate=!0}get colorSpaceConversion(){return this.defines.COLOR_SPACE_CONVERSION!==void 0}set colorSpaceConversion(t){this.colorSpaceConversion!==t&&(t?this.defines.COLOR_SPACE_CONVERSION=!0:delete this.defines.COLOR_SPACE_CONVERSION,this.needsUpdate=!0)}get channelWeights(){return this.uniforms.channelWeights.value}set channelWeights(t){t!==null?(this.defines.USE_WEIGHTS="1",this.uniforms.channelWeights.value=t):delete this.defines.USE_WEIGHTS,this.needsUpdate=!0}setInputBuffer(t){this.uniforms.inputBuffer.value=t}getOpacity(t){return this.uniforms.opacity.value}setOpacity(t){this.uniforms.opacity.value=t}},Ta=class extends oe{constructor(t,e=!0){super("CopyPass"),this.fullscreenMaterial=new tc,this.needsSwap=!1,this.renderTarget=t,t===void 0&&(this.renderTarget=new jo(1,1,{minFilter:da,magFilter:da,stencilBuffer:!1,depthBuffer:!1}),this.renderTarget.texture.name="CopyPass.Target"),this.autoResize=e}get resize(){return this.autoResize}set resize(t){this.autoResize=t}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}setAutoResizeEnabled(t){this.autoResize=t}render(t,e,r,i,n){this.fullscreenMaterial.inputBuffer=e.texture,t.setRenderTarget(this.renderToScreen?null:this.renderTarget),t.render(this.scene,this.camera)}setSize(t,e){this.autoResize&&this.renderTarget.setSize(t,e)}initialize(t,e,r){r!==void 0&&(this.renderTarget.texture.type=r,r!==Ko?this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1":t!==null&&t.outputColorSpace===fa&&(this.renderTarget.texture.colorSpace=fa))}},ma=new rc,Vi=class extends oe{constructor(t=!0,e=!0,r=!1){super("ClearPass",null,null),this.needsSwap=!1,this.color=t,this.depth=e,this.stencil=r,this.overrideClearColor=null,this.overrideClearAlpha=-1}setClearFlags(t,e,r){this.color=t,this.depth=e,this.stencil=r}getOverrideClearColor(){return this.overrideClearColor}setOverrideClearColor(t){this.overrideClearColor=t}getOverrideClearAlpha(){return this.overrideClearAlpha}setOverrideClearAlpha(t){this.overrideClearAlpha=t}render(t,e,r,i,n){let a=this.overrideClearColor,s=this.overrideClearAlpha,o=t.getClearAlpha(),c=a!==null,l=s>=0;c?(t.getClearColor(ma),t.setClearColor(a,l?s:o)):l&&t.setClearAlpha(s),t.setRenderTarget(this.renderToScreen?null:e),t.clear(this.color,this.depth,this.stencil),c?t.setClearColor(ma,o):l&&t.setClearAlpha(o)}},ic=class extends oe{constructor(t,e){super("MaskPass",t,e),this.needsSwap=!1,this.clearPass=new Vi(!1,!1,!0),this.inverse=!1}set mainScene(t){this.scene=t}set mainCamera(t){this.camera=t}get inverted(){return this.inverse}set inverted(t){this.inverse=t}get clear(){return this.clearPass.enabled}set clear(t){this.clearPass.enabled=t}getClearPass(){return this.clearPass}isInverted(){return this.inverted}setInverted(t){this.inverted=t}render(t,e,r,i,n){let a=t.getContext(),s=t.state.buffers,o=this.scene,c=this.camera,l=this.clearPass,u=this.inverted?0:1,h=1-u;s.color.setMask(!1),s.depth.setMask(!1),s.color.setLocked(!0),s.depth.setLocked(!0),s.stencil.setTest(!0),s.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),s.stencil.setFunc(a.ALWAYS,u,4294967295),s.stencil.setClear(h),s.stencil.setLocked(!0),this.clearPass.enabled&&(this.renderToScreen?l.render(t,null):(l.render(t,e),l.render(t,r))),this.renderToScreen?(t.setRenderTarget(null),t.render(o,c)):(t.setRenderTarget(e),t.render(o,c),t.setRenderTarget(r),t.render(o,c)),s.color.setLocked(!1),s.depth.setLocked(!1),s.stencil.setLocked(!1),s.stencil.setFunc(a.EQUAL,1,4294967295),s.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),s.stencil.setLocked(!0)}};function nc(t,e){let r=t.getContext();if(e<=0||typeof r.renderbufferStorageMultisample!="function")return 0;let i=r.getParameter(r.MAX_SAMPLES),n=Math.min(e,i);if(n<=0)return 0;let a=r.getParameter(r.RENDERBUFFER_BINDING),s=r.createRenderbuffer();try{return r.bindRenderbuffer(r.RENDERBUFFER,s),r.renderbufferStorageMultisample(r.RENDERBUFFER,n,r.RGBA8,1,1),n}catch{return 0}finally{r.bindRenderbuffer(r.RENDERBUFFER,a),r.deleteRenderbuffer(s)}}var Fi=1/1e3,ac=1e3,sc=class{constructor(){this.startTime=performance.now(),this.previousTime=0,this.currentTime=0,this._delta=0,this._elapsed=0,this._fixedDelta=1e3/60,this.timescale=1,this.useFixedDelta=!1,this._autoReset=!1}get autoReset(){return this._autoReset}set autoReset(t){typeof document<"u"&&document.hidden!==void 0&&(t?document.addEventListener("visibilitychange",this):document.removeEventListener("visibilitychange",this),this._autoReset=t)}get delta(){return this._delta*Fi}get fixedDelta(){return this._fixedDelta*Fi}set fixedDelta(t){this._fixedDelta=t*ac}get elapsed(){return this._elapsed*Fi}update(t){this.useFixedDelta?this._delta=this.fixedDelta:(this.previousTime=this.currentTime,this.currentTime=(t!==void 0?t:performance.now())-this.startTime,this._delta=this.currentTime-this.previousTime),this._delta*=this.timescale,this._elapsed+=this._delta}reset(){this._delta=0,this._elapsed=0,this.currentTime=performance.now()-this.startTime}getDelta(){return this.delta}getElapsed(){return this.elapsed}handleEvent(t){document.hidden||(this.currentTime=performance.now()-this.startTime)}dispose(){this.autoReset=!1}},Sa=class{constructor(t=null,{depthBuffer:e=!0,stencilBuffer:r=!1,multisampling:i=0,frameBufferType:n=Bi}={}){this.renderer=null,this.inputBuffer=this.createBuffer(e,r,n,i),this.outputBuffer=this.inputBuffer.clone(),this.copyPass=new Ta,this.depthRenderTarget=null,this.passes=[],this.timer=new sc,this.autoRenderToScreen=!0,this.setRenderer(t)}get stableDepthTexture(){return this.depthRenderTarget===null?null:this.depthRenderTarget.depthTexture}get multisampling(){return this.inputBuffer.samples}set multisampling(t){let e=this.renderer===null?t:nc(this.renderer,t);this.multisampling!==e&&(this.inputBuffer.samples=e,this.outputBuffer.samples=e,this.inputBuffer.dispose(),this.outputBuffer.dispose())}getTimer(){return this.timer}getRenderer(){return this.renderer}setRenderer(t){if(this.renderer=t,t!==null){let e=t.getSize(new _t),r=t.getContext().getContextAttributes().alpha,i=this.inputBuffer.texture.type;i===Bi&&t.outputColorSpace===ar&&(this.inputBuffer.texture.colorSpace=ar,this.outputBuffer.texture.colorSpace=ar,this.inputBuffer.dispose(),this.outputBuffer.dispose());let n=this.multisampling;this.multisampling=n,t.autoClear=!1,this.setSize(e.width,e.height);for(let a of this.passes)a.initialize(t,r,i)}}replaceRenderer(t,e=!0){let r=this.renderer,i=r.domElement.parentNode;return this.setRenderer(t),e&&i!==null&&(i.removeChild(r.domElement),i.appendChild(t.domElement)),r}createDepthTexture(){let t=new Li;t.name="EffectComposer.InputDepth",this.inputBuffer.stencilBuffer?(t.format=Bo,t.type=Ho):t.type=Fo;let e=new Li;e.format=t.format,e.type=t.type,e.name="EffectComposer.OutputDepth";let r=new Li;r.format=t.format,r.type=t.type,r.name="EffectComposer.StableDepth",this.inputBuffer.depthTexture=t,this.outputBuffer.depthTexture=e,this.inputBuffer.dispose(),this.outputBuffer.dispose();let{width:i,height:n}=this.inputBuffer;this.depthRenderTarget=new la(i,n,{depthBuffer:!0,stencilBuffer:this.inputBuffer.stencilBuffer,depthTexture:r})}blitDepthBuffer(t){let e=this.renderer,r=this.depthRenderTarget,i=e.properties,n=e.getContext();e.setRenderTarget(r);let a=i.get(t).__webglFramebuffer,s=i.get(r).__webglFramebuffer,o=t.stencilBuffer?n.DEPTH_BUFFER_BIT|n.STENCIL_BUFFER_BIT:n.DEPTH_BUFFER_BIT;n.bindFramebuffer(n.READ_FRAMEBUFFER,a),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,s),n.blitFramebuffer(0,0,t.width,t.height,0,0,r.width,r.height,o,n.NEAREST),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),e.setRenderTarget(null)}deleteDepthTexture(){let t=this.stableDepthTexture;for(let e of this.passes)e.getDepthTexture()===t&&e.setDepthTexture(null);this.depthRenderTarget!==null&&(this.depthRenderTarget.dispose(),this.depthRenderTarget=null),this.inputBuffer.depthTexture!==null&&(this.inputBuffer.depthTexture.dispose(),this.inputBuffer.depthTexture=null),this.outputBuffer.depthTexture!==null&&(this.outputBuffer.depthTexture.dispose(),this.outputBuffer.depthTexture=null)}createBuffer(t,e,r,i){let n=this.renderer,a=n===null?new _t:n.getDrawingBufferSize(new _t),s=new la(a.width,a.height,{minFilter:ca,magFilter:ca,samples:i,stencilBuffer:e,depthBuffer:t,type:r});return r===Bi&&n!==null&&n.outputColorSpace===ar&&(s.texture.colorSpace=ar),s.texture.name="EffectComposer.Buffer",s.texture.generateMipmaps=!1,s}setMainScene(t){for(let e of this.passes)e.mainScene=t}setMainCamera(t){for(let e of this.passes)e.mainCamera=t}addPass(t,e){let r=this.passes,i=this.renderer,n=i.getDrawingBufferSize(new _t),a=i.getContext().getContextAttributes().alpha,s=this.inputBuffer.texture.type;if(t.renderer=i,t.setSize(n.width,n.height),t.initialize(i,a,s),this.autoRenderToScreen&&(r.length>0&&(r[r.length-1].renderToScreen=!1),t.renderToScreen&&(this.autoRenderToScreen=!1)),e!==void 0?r.splice(e,0,t):r.push(t),this.autoRenderToScreen&&(r[r.length-1].renderToScreen=!0),t.needsDepthTexture||this.depthRenderTarget!==null)if(this.depthRenderTarget===null){this.createDepthTexture();for(let o of r)o.setDepthTexture(this.stableDepthTexture)}else t.setDepthTexture(this.stableDepthTexture)}removePass(t){let e=this.passes,r=e.indexOf(t);if(r!==-1&&e.splice(r,1).length>0){let a=this.stableDepthTexture;if(a!==null){let s=(c,l)=>c||l.needsDepthTexture;e.reduce(s,!1)||(t.getDepthTexture()===a&&t.setDepthTexture(null),this.deleteDepthTexture())}this.autoRenderToScreen&&r===e.length&&(t.renderToScreen=!1,e.length>0&&(e[e.length-1].renderToScreen=!0))}}removeAllPasses(){let t=this.passes;this.deleteDepthTexture(),t.length>0&&(this.autoRenderToScreen&&(t[t.length-1].renderToScreen=!1),this.passes=[])}render(t){let e=this.renderer,r=this.copyPass,i=this.inputBuffer,n=this.outputBuffer,a,s=!1;t===void 0&&(this.timer.update(),t=this.timer.getDelta());for(let o of this.passes)if(o.enabled){if(o.render(e,i,n,t,s),o.needsDepthBlit&&this.depthRenderTarget!==null&&this.blitDepthBuffer(i),o.needsSwap){if(s){r.renderToScreen=o.renderToScreen;let c=e.getContext(),l=e.state.buffers.stencil;l.setFunc(c.NOTEQUAL,1,4294967295),r.render(e,i,n,t,s),l.setFunc(c.EQUAL,1,4294967295)}a=i,i=n,n=a}o instanceof ic?s=!0:o instanceof Zo&&(s=!1)}}setSize(t,e,r){let i=this.renderer,n=i.getSize(new _t);(t===void 0||e===void 0)&&(t=n.width,e=n.height),(n.width!==t||n.height!==e)&&i.setSize(t,e,r);let a=i.getDrawingBufferSize(new _t);this.inputBuffer.setSize(a.width,a.height),this.outputBuffer.setSize(a.width,a.height),this.depthRenderTarget!==null&&this.depthRenderTarget.setSize(a.width,a.height);for(let s of this.passes)s.setSize(a.width,a.height)}reset(){this.dispose(),this.autoRenderToScreen=!0}dispose(){for(let t of this.passes)t.dispose();this.deleteDepthTexture(),this.inputBuffer.dispose(),this.outputBuffer.dispose(),this.copyPass.dispose(),this.timer.dispose(),this.passes=[],oe.fullscreenGeometry.dispose()}},Te={NONE:0,DEPTH:1,CONVOLUTION:2},I={FRAGMENT_HEAD:"FRAGMENT_HEAD",FRAGMENT_MAIN_UV:"FRAGMENT_MAIN_UV",FRAGMENT_MAIN_IMAGE:"FRAGMENT_MAIN_IMAGE",VERTEX_HEAD:"VERTEX_HEAD",VERTEX_MAIN_SUPPORT:"VERTEX_MAIN_SUPPORT"},cc=class{constructor(){this.shaderParts=new Map([[I.FRAGMENT_HEAD,null],[I.FRAGMENT_MAIN_UV,null],[I.FRAGMENT_MAIN_IMAGE,null],[I.VERTEX_HEAD,null],[I.VERTEX_MAIN_SUPPORT,null]]),this.defines=new Map,this.uniforms=new Map,this.blendModes=new Map,this.extensions=new Set,this.attributes=Te.NONE,this.varyings=new Set,this.uvTransformation=!1,this.readDepth=!1,this.colorSpace=oc}};var Hi=!1,pa=class{constructor(t=null){this.originalMaterials=new Map,this.material=null,this.materials=null,this.materialsBackSide=null,this.materialsDoubleSide=null,this.materialsFlatShaded=null,this.materialsFlatShadedBackSide=null,this.materialsFlatShadedDoubleSide=null,this.setMaterial(t),this.meshCount=0,this.replaceMaterial=e=>{if(e.isMesh){let r;if(e.material.flatShading)switch(e.material.side){case br:r=this.materialsFlatShadedDoubleSide;break;case Nr:r=this.materialsFlatShadedBackSide;break;default:r=this.materialsFlatShaded;break}else switch(e.material.side){case br:r=this.materialsDoubleSide;break;case Nr:r=this.materialsBackSide;break;default:r=this.materials;break}this.originalMaterials.set(e,e.material),e.isSkinnedMesh?e.material=r[2]:e.isInstancedMesh?e.material=r[1]:e.material=r[0],++this.meshCount}}}cloneMaterial(t){if(!(t instanceof uc))return t.clone();let e=t.uniforms,r=new Map;for(let n in e){let a=e[n].value;a.isRenderTargetTexture&&(e[n].value=null,r.set(n,a))}let i=t.clone();for(let n of r)e[n[0]].value=n[1],i.uniforms[n[0]].value=n[1];return i}setMaterial(t){if(this.disposeMaterials(),this.material=t,t!==null){let e=this.materials=[this.cloneMaterial(t),this.cloneMaterial(t),this.cloneMaterial(t)];for(let r of e)r.uniforms=Object.assign({},t.uniforms),r.side=lc;e[2].skinning=!0,this.materialsBackSide=e.map(r=>{let i=this.cloneMaterial(r);return i.uniforms=Object.assign({},t.uniforms),i.side=Nr,i}),this.materialsDoubleSide=e.map(r=>{let i=this.cloneMaterial(r);return i.uniforms=Object.assign({},t.uniforms),i.side=br,i}),this.materialsFlatShaded=e.map(r=>{let i=this.cloneMaterial(r);return i.uniforms=Object.assign({},t.uniforms),i.flatShading=!0,i}),this.materialsFlatShadedBackSide=e.map(r=>{let i=this.cloneMaterial(r);return i.uniforms=Object.assign({},t.uniforms),i.flatShading=!0,i.side=Nr,i}),this.materialsFlatShadedDoubleSide=e.map(r=>{let i=this.cloneMaterial(r);return i.uniforms=Object.assign({},t.uniforms),i.flatShading=!0,i.side=br,i})}}render(t,e,r){let i=t.shadowMap.enabled;if(t.shadowMap.enabled=!1,Hi){let n=this.originalMaterials;this.meshCount=0,e.traverse(this.replaceMaterial),t.render(e,r);for(let a of n)a[0].material=a[1];this.meshCount!==n.size&&n.clear()}else{let n=e.overrideMaterial;e.overrideMaterial=this.material,t.render(e,r),e.overrideMaterial=n}t.shadowMap.enabled=i}disposeMaterials(){if(this.material!==null){let t=this.materials.concat(this.materialsBackSide).concat(this.materialsDoubleSide).concat(this.materialsFlatShaded).concat(this.materialsFlatShadedBackSide).concat(this.materialsFlatShadedDoubleSide);for(let e of t)e.dispose()}}dispose(){this.originalMaterials.clear(),this.disposeMaterials()}static get workaroundEnabled(){return Hi}static set workaroundEnabled(t){Hi=t}};var je=-1,ht=class extends hc{constructor(t=null,e=je,r=je,i=1){super(),t!==null&&this.addEventListener("change",()=>t.setSize(this.baseSize.width,this.baseSize.height)),this.baseSize=new Gi(1,1),this.preferredSize=new Gi(e,r),this.target=this.preferredSize,this.s=i,this.effectiveSize=new Gi,this.addEventListener("change",()=>this.updateEffectiveSize()),this.updateEffectiveSize()}updateEffectiveSize(){let t=this.baseSize,e=this.preferredSize,r=this.effectiveSize,i=this.scale;e.width!==je?r.width=e.width:e.height!==je?r.width=Math.round(e.height*(t.width/Math.max(t.height,1))):r.width=Math.round(t.width*i),e.height!==je?r.height=e.height:e.width!==je?r.height=Math.round(e.width/Math.max(t.width/Math.max(t.height,1),1)):r.height=Math.round(t.height*i)}get width(){return this.effectiveSize.width}set width(t){this.preferredWidth=t}get height(){return this.effectiveSize.height}set height(t){this.preferredHeight=t}getWidth(){return this.width}getHeight(){return this.height}get scale(){return this.s}set scale(t){this.s!==t&&(this.s=t,this.preferredSize.setScalar(je),this.dispatchEvent({type:"change"}))}getScale(){return this.scale}setScale(t){this.scale=t}get baseWidth(){return this.baseSize.width}set baseWidth(t){this.baseSize.width!==t&&(this.baseSize.width=t,this.dispatchEvent({type:"change"}))}getBaseWidth(){return this.baseWidth}setBaseWidth(t){this.baseWidth=t}get baseHeight(){return this.baseSize.height}set baseHeight(t){this.baseSize.height!==t&&(this.baseSize.height=t,this.dispatchEvent({type:"change"}))}getBaseHeight(){return this.baseHeight}setBaseHeight(t){this.baseHeight=t}setBaseSize(t,e){(this.baseSize.width!==t||this.baseSize.height!==e)&&(this.baseSize.set(t,e),this.dispatchEvent({type:"change"}))}get preferredWidth(){return this.preferredSize.width}set preferredWidth(t){this.preferredSize.width!==t&&(this.preferredSize.width=t,this.dispatchEvent({type:"change"}))}getPreferredWidth(){return this.preferredWidth}setPreferredWidth(t){this.preferredWidth=t}get preferredHeight(){return this.preferredSize.height}set preferredHeight(t){this.preferredSize.height!==t&&(this.preferredSize.height=t,this.dispatchEvent({type:"change"}))}getPreferredHeight(){return this.preferredHeight}setPreferredHeight(t){this.preferredHeight=t}setPreferredSize(t,e){(this.preferredSize.width!==t||this.preferredSize.height!==e)&&(this.preferredSize.set(t,e),this.dispatchEvent({type:"change"}))}copy(t){this.s=t.scale,this.baseSize.set(t.baseWidth,t.baseHeight),this.preferredSize.set(t.preferredWidth,t.preferredHeight),this.dispatchEvent({type:"change"})}static get AUTO_SIZE(){return je}};var w={SKIP:9,SET:30,ADD:0,ALPHA:1,AVERAGE:2,COLOR:3,COLOR_BURN:4,COLOR_DODGE:5,DARKEN:6,DIFFERENCE:7,DIVIDE:8,DST:9,EXCLUSION:10,HARD_LIGHT:11,HARD_MIX:12,HUE:13,INVERT:14,INVERT_RGB:15,LIGHTEN:16,LINEAR_BURN:17,LINEAR_DODGE:18,LINEAR_LIGHT:19,LUMINOSITY:20,MULTIPLY:21,NEGATION:22,NORMAL:23,OVERLAY:24,PIN_LIGHT:25,REFLECT:26,SATURATION:27,SCREEN:28,SOFT_LIGHT:29,SRC:30,SUBTRACT:31,VIVID_LIGHT:32},mc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",pc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,src.a*opacity);}",gc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=(dst.rgb+src.rgb)*0.5;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",vc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.xy,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ac="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=mix(step(0.0,b)*(1.0-min(vec3(1.0),(1.0-a)/max(b,1e-9))),vec3(1.0),step(1.0,a));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Tc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=dst.rgb,b=src.rgb;vec3 c=step(0.0,a)*mix(min(vec3(1.0),a/max(1.0-b,1e-9)),vec3(1.0),step(1.0,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Sc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ec="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=abs(dst.rgb-src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",xc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb/max(src.rgb,1e-9);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",wc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-2.0*dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",yc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb,1.0);vec3 b=min(src.rgb,1.0);vec3 c=mix(2.0*a*b,1.0-2.0*(1.0-a)*(1.0-b),step(0.5,b));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Cc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=step(1.0,dst.rgb+src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Dc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(b.x,a.yz));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Rc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",_c="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=src.rgb*max(1.0-dst.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Ic="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb,src.rgb);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Mc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Pc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=min(dst.rgb+src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Nc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=clamp(2.0*src.rgb+dst.rgb-1.0,0.0,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",bc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.xy,b.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Oc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb*src.rgb;return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Uc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(1.0-abs(1.0-dst.rgb-src.rgb),0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Lc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return mix(dst,src,opacity);}",Bc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=2.0*src.rgb*dst.rgb;vec3 b=1.0-2.0*(1.0-src.rgb)*(1.0-dst.rgb);vec3 c=mix(a,b,step(0.5,dst.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Fc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 c=mix(mix(src2,dst.rgb,step(0.5*dst.rgb,src.rgb)),max(src2-1.0,vec3(0.0)),step(dst.rgb,src2-1.0));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Hc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=min(dst.rgb*dst.rgb/max(1.0-src.rgb,1e-9),1.0);vec3 c=mix(a,src.rgb,step(1.0,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Gc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 a=RGBToHSL(dst.rgb);vec3 b=RGBToHSL(src.rgb);vec3 c=HSLToRGB(vec3(a.x,b.y,a.z));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",zc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=dst.rgb+src.rgb-min(dst.rgb*src.rgb,1.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",kc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 src2=2.0*src.rgb;vec3 d=dst.rgb+(src2-1.0);vec3 w=step(0.5,src.rgb);vec3 a=dst.rgb-(1.0-src2)*dst.rgb*(1.0-dst.rgb);vec3 b=mix(d*(sqrt(dst.rgb)-dst.rgb),d*dst.rgb*((16.0*dst.rgb-12.0)*dst.rgb+3.0),w*(1.0-step(0.25,dst.rgb)));vec3 c=mix(a,b,w);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Wc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){return src;}",Vc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=max(dst.rgb-src.rgb,0.0);return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Yc="vec4 blend(const in vec4 dst,const in vec4 src,const in float opacity){vec3 c=mix(max(1.0-min((1.0-dst.rgb)/(2.0*src.rgb),1.0),0.0),min(dst.rgb/(2.0*(1.0-src.rgb)),1.0),step(0.5,src.rgb));return mix(dst,vec4(c,max(dst.a,src.a)),opacity);}",Xc=new Map([[w.ADD,mc],[w.ALPHA,pc],[w.AVERAGE,gc],[w.COLOR,vc],[w.COLOR_BURN,Ac],[w.COLOR_DODGE,Tc],[w.DARKEN,Sc],[w.DIFFERENCE,Ec],[w.DIVIDE,xc],[w.DST,null],[w.EXCLUSION,wc],[w.HARD_LIGHT,yc],[w.HARD_MIX,Cc],[w.HUE,Dc],[w.INVERT,Rc],[w.INVERT_RGB,_c],[w.LIGHTEN,Ic],[w.LINEAR_BURN,Mc],[w.LINEAR_DODGE,Pc],[w.LINEAR_LIGHT,Nc],[w.LUMINOSITY,bc],[w.MULTIPLY,Oc],[w.NEGATION,Uc],[w.NORMAL,Lc],[w.OVERLAY,Bc],[w.PIN_LIGHT,Fc],[w.REFLECT,Hc],[w.SATURATION,Gc],[w.SCREEN,zc],[w.SOFT_LIGHT,kc],[w.SRC,Wc],[w.SUBTRACT,Vc],[w.VIVID_LIGHT,Yc]]),Qc=class extends dc{constructor(t,e=1){super(),this._blendFunction=t,this.opacity=new fc(e)}getOpacity(){return this.opacity.value}setOpacity(t){this.opacity.value=t}get blendFunction(){return this._blendFunction}set blendFunction(t){this._blendFunction=t,this.dispatchEvent({type:"change"})}getBlendFunction(){return this.blendFunction}setBlendFunction(t){this.blendFunction=t}getShaderCode(){return Xc.get(this.blendFunction)}};var cr=class extends Kc{constructor(t,e,{attributes:r=Te.NONE,blendFunction:i=w.NORMAL,defines:n=new Map,uniforms:a=new Map,extensions:s=null,vertexShader:o=null}={}){super(),this.name=t,this.renderer=null,this.attributes=r,this.fragmentShader=e,this.vertexShader=o,this.defines=n,this.uniforms=a,this.extensions=s,this.blendMode=new Qc(i),this.blendMode.addEventListener("change",c=>this.setChanged()),this._inputColorSpace=jc,this._outputColorSpace=Jc}get inputColorSpace(){return this._inputColorSpace}set inputColorSpace(t){this._inputColorSpace=t,this.setChanged()}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t,this.setChanged()}set mainScene(t){}set mainCamera(t){}getName(){return this.name}setRenderer(t){this.renderer=t}getDefines(){return this.defines}getUniforms(){return this.uniforms}getExtensions(){return this.extensions}getBlendMode(){return this.blendMode}getAttributes(){return this.attributes}setAttributes(t){this.attributes=t,this.setChanged()}getFragmentShader(){return this.fragmentShader}setFragmentShader(t){this.fragmentShader=t,this.setChanged()}getVertexShader(){return this.vertexShader}setVertexShader(t){this.vertexShader=t,this.setChanged()}setChanged(){this.dispatchEvent({type:"change"})}setDepthTexture(t,e=Zc){}update(t,e,r){}setSize(t,e){}initialize(t,e,r){}dispose(){for(let t of Object.keys(this)){let e=this[t];(e instanceof el||e instanceof qc||e instanceof $c||e instanceof oe)&&this[t].dispose()}}};var T0=[new Float32Array([0,0]),new Float32Array([0,1,1]),new Float32Array([0,1,1,2]),new Float32Array([0,1,2,2,3]),new Float32Array([0,1,2,3,4,4,5]),new Float32Array([0,1,2,3,4,5,7,8,9,10])];var sl=`#include <common>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef RANGE
uniform vec2 range;
#elif defined(THRESHOLD)
uniform float threshold;uniform float smoothing;
#endif
varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=luminance(texel.rgb);float mask=1.0;
#ifdef RANGE
float low=step(range.x,l);float high=step(l,range.y);mask=low*high;
#elif defined(THRESHOLD)
mask=smoothstep(threshold,threshold+smoothing,l);
#endif
#ifdef COLOR
gl_FragColor=texel*mask;
#else
gl_FragColor=vec4(l*mask);
#endif
}`,ol=class extends al{constructor(t=!1,e=null){super({name:"LuminanceMaterial",defines:{THREE_REVISION:nl.replace(/\D+/g,"")},uniforms:{inputBuffer:new Or(null),threshold:new Or(0),smoothing:new Or(1),range:new Or(null)},blending:il,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:sl,vertexShader:Wi}),this.colorOutput=t,this.luminanceRange=e}set inputBuffer(t){this.uniforms.inputBuffer.value=t}setInputBuffer(t){this.uniforms.inputBuffer.value=t}get threshold(){return this.uniforms.threshold.value}set threshold(t){this.smoothing>0||t>0?this.defines.THRESHOLD="1":delete this.defines.THRESHOLD,this.uniforms.threshold.value=t}getThreshold(){return this.threshold}setThreshold(t){this.threshold=t}get smoothing(){return this.uniforms.smoothing.value}set smoothing(t){this.threshold>0||t>0?this.defines.THRESHOLD="1":delete this.defines.THRESHOLD,this.uniforms.smoothing.value=t}getSmoothingFactor(){return this.smoothing}setSmoothingFactor(t){this.smoothing=t}get useThreshold(){return this.threshold>0||this.smoothing>0}set useThreshold(t){}get colorOutput(){return this.defines.COLOR!==void 0}set colorOutput(t){t?this.defines.COLOR="1":delete this.defines.COLOR,this.needsUpdate=!0}isColorOutputEnabled(t){return this.colorOutput}setColorOutputEnabled(t){this.colorOutput=t}get useRange(){return this.luminanceRange!==null}set useRange(t){this.luminanceRange=null}get luminanceRange(){return this.uniforms.range.value}set luminanceRange(t){t!==null?this.defines.RANGE="1":delete this.defines.RANGE,this.uniforms.range.value=t,this.needsUpdate=!0}getLuminanceRange(){return this.luminanceRange}setLuminanceRange(t){this.luminanceRange=t}},cl=class extends oe{constructor({renderTarget:t,luminanceRange:e,colorOutput:r,resolutionScale:i=1,width:n=ht.AUTO_SIZE,height:a=ht.AUTO_SIZE,resolutionX:s=n,resolutionY:o=a}={}){super("LuminancePass"),this.fullscreenMaterial=new ol(r,e),this.needsSwap=!1,this.renderTarget=t,this.renderTarget===void 0&&(this.renderTarget=new rl(1,1,{depthBuffer:!1}),this.renderTarget.texture.name="LuminancePass.Target");let c=this.resolution=new ht(this,s,o,i);c.addEventListener("change",l=>this.setSize(c.baseWidth,c.baseHeight))}get texture(){return this.renderTarget.texture}getTexture(){return this.renderTarget.texture}getResolution(){return this.resolution}render(t,e,r,i,n){let a=this.fullscreenMaterial;a.inputBuffer=e.texture,t.setRenderTarget(this.renderToScreen?null:this.renderTarget),t.render(this.scene,this.camera)}setSize(t,e){let r=this.resolution;r.setBaseSize(t,e),this.renderTarget.setSize(r.width,r.height)}initialize(t,e,r){r!==void 0&&r!==tl&&(this.renderTarget.texture.type=r,this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}};var lr=class extends oe{constructor(t,e="inputBuffer"){super("ShaderPass"),this.fullscreenMaterial=t,this.input=e}setInput(t){this.input=t}render(t,e,r,i,n){let a=this.fullscreenMaterial.uniforms;e!==null&&a!==void 0&&a[this.input]!==void 0&&(a[this.input].value=e.texture),t.setRenderTarget(this.renderToScreen?null:r),t.render(this.scene,this.camera)}initialize(t,e,r){r!==void 0&&r!==ll&&(this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}};var Yi=class extends oe{constructor(t,e,r=null){super("RenderPass",t,e),this.needsSwap=!1,this.needsDepthBlit=!0,this.clearPass=new Vi,this.overrideMaterialManager=r===null?null:new pa(r),this.ignoreBackground=!1,this.skipShadowMapUpdate=!1,this.selection=null}set mainScene(t){this.scene=t}set mainCamera(t){this.camera=t}get renderToScreen(){return super.renderToScreen}set renderToScreen(t){super.renderToScreen=t,this.clearPass.renderToScreen=t}get overrideMaterial(){let t=this.overrideMaterialManager;return t!==null?t.material:null}set overrideMaterial(t){let e=this.overrideMaterialManager;t!==null?e!==null?e.setMaterial(t):this.overrideMaterialManager=new pa(t):e!==null&&(e.dispose(),this.overrideMaterialManager=null)}getOverrideMaterial(){return this.overrideMaterial}setOverrideMaterial(t){this.overrideMaterial=t}get clear(){return this.clearPass.enabled}set clear(t){this.clearPass.enabled=t}getSelection(){return this.selection}setSelection(t){this.selection=t}isBackgroundDisabled(){return this.ignoreBackground}setBackgroundDisabled(t){this.ignoreBackground=t}isShadowMapDisabled(){return this.skipShadowMapUpdate}setShadowMapDisabled(t){this.skipShadowMapUpdate=t}getClearPass(){return this.clearPass}render(t,e,r,i,n){let a=this.scene,s=this.camera,o=this.selection,c=s.layers.mask,l=a.background,u=t.shadowMap.autoUpdate,h=this.renderToScreen?null:e;o!==null&&s.layers.set(o.getLayer()),this.skipShadowMapUpdate&&(t.shadowMap.autoUpdate=!1),(this.ignoreBackground||this.clearPass.overrideClearColor!==null)&&(a.background=null),this.clearPass.enabled&&this.clearPass.render(t,e),t.setRenderTarget(h),this.overrideMaterialManager!==null?this.overrideMaterialManager.render(t,a,s):t.render(a,s),s.layers.mask=c,a.background=l,t.shadowMap.autoUpdate=u}};var ae={LINEAR:0,REINHARD:1,REINHARD2:2,REINHARD2_ADAPTIVE:3,UNCHARTED2:4,OPTIMIZED_CINEON:5,CINEON:5,ACES_FILMIC:6,AGX:7,NEUTRAL:8};var d1=Math.PI*.5;var gl=`#include <packing>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
uniform lowp sampler2D luminanceBuffer0;uniform lowp sampler2D luminanceBuffer1;uniform float minLuminance;uniform float deltaTime;uniform float tau;varying vec2 vUv;void main(){float l0=unpackRGBAToFloat(texture2D(luminanceBuffer0,vUv));
#if __VERSION__ < 300
float l1=texture2DLodEXT(luminanceBuffer1,vUv,MIP_LEVEL_1X1).r;
#else
float l1=textureLod(luminanceBuffer1,vUv,MIP_LEVEL_1X1).r;
#endif
l0=max(minLuminance,l0);l1=max(minLuminance,l1);float adaptedLum=l0+(l1-l0)*(1.0-exp(-deltaTime*tau));gl_FragColor=(adaptedLum==1.0)?vec4(1.0):packFloatToRGBA(adaptedLum);}`,vl=class extends pl{constructor(){super({name:"AdaptiveLuminanceMaterial",defines:{MIP_LEVEL_1X1:"0.0"},uniforms:{luminanceBuffer0:new or(null),luminanceBuffer1:new or(null),minLuminance:new or(.01),deltaTime:new or(0),tau:new or(1)},extensions:{shaderTextureLOD:!0},blending:ml,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:gl,vertexShader:Wi})}set luminanceBuffer0(t){this.uniforms.luminanceBuffer0.value=t}setLuminanceBuffer0(t){this.uniforms.luminanceBuffer0.value=t}set luminanceBuffer1(t){this.uniforms.luminanceBuffer1.value=t}setLuminanceBuffer1(t){this.uniforms.luminanceBuffer1.value=t}set mipLevel1x1(t){this.defines.MIP_LEVEL_1X1=t.toFixed(1),this.needsUpdate=!0}setMipLevel1x1(t){this.mipLevel1x1=t}set deltaTime(t){this.uniforms.deltaTime.value=t}setDeltaTime(t){this.uniforms.deltaTime.value=t}get minLuminance(){return this.uniforms.minLuminance.value}set minLuminance(t){this.uniforms.minLuminance.value=t}getMinLuminance(){return this.uniforms.minLuminance.value}setMinLuminance(t){this.uniforms.minLuminance.value=t}get adaptationRate(){return this.uniforms.tau.value}set adaptationRate(t){this.uniforms.tau.value=t}getAdaptationRate(){return this.uniforms.tau.value}setAdaptationRate(t){this.uniforms.tau.value=t}},Al=class extends oe{constructor(t,{minLuminance:e=.01,adaptationRate:r=1}={}){super("AdaptiveLuminancePass"),this.fullscreenMaterial=new vl,this.needsSwap=!1,this.renderTargetPrevious=new fl(1,1,{minFilter:ga,magFilter:ga,depthBuffer:!1}),this.renderTargetPrevious.texture.name="Luminance.Previous";let i=this.fullscreenMaterial;i.luminanceBuffer0=this.renderTargetPrevious.texture,i.luminanceBuffer1=t,i.minLuminance=e,i.adaptationRate=r,this.renderTargetAdapted=this.renderTargetPrevious.clone(),this.renderTargetAdapted.texture.name="Luminance.Adapted",this.copyPass=new Ta(this.renderTargetPrevious,!1)}get texture(){return this.renderTargetAdapted.texture}getTexture(){return this.renderTargetAdapted.texture}set mipLevel1x1(t){this.fullscreenMaterial.mipLevel1x1=t}get adaptationRate(){return this.fullscreenMaterial.adaptationRate}set adaptationRate(t){this.fullscreenMaterial.adaptationRate=t}render(t,e,r,i,n){this.fullscreenMaterial.deltaTime=i,t.setRenderTarget(this.renderToScreen?null:this.renderTargetAdapted),t.render(this.scene,this.camera),this.copyPass.render(t,this.renderTargetAdapted)}},Tl=`#include <tonemapping_pars_fragment>
uniform float whitePoint;
#if TONE_MAPPING_MODE == 2 || TONE_MAPPING_MODE == 3
uniform float middleGrey;
#if TONE_MAPPING_MODE == 3
uniform lowp sampler2D luminanceBuffer;
#else
uniform float averageLuminance;
#endif
vec3 Reinhard2ToneMapping(vec3 color){color*=toneMappingExposure;float l=luminance(color);
#if TONE_MAPPING_MODE == 3
float lumAvg=unpackRGBAToFloat(texture2D(luminanceBuffer,vec2(0.5)));
#else
float lumAvg=averageLuminance;
#endif
float lumScaled=(l*middleGrey)/max(lumAvg,1e-6);float lumCompressed=lumScaled*(1.0+lumScaled/(whitePoint*whitePoint));lumCompressed/=(1.0+lumScaled);return clamp(lumCompressed*color,0.0,1.0);}
#elif TONE_MAPPING_MODE == 4
#define A 0.15
#define B 0.50
#define C 0.10
#define D 0.20
#define E 0.02
#define F 0.30
vec3 Uncharted2Helper(const in vec3 x){return((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;}vec3 Uncharted2ToneMapping(vec3 color){color*=toneMappingExposure;return clamp(Uncharted2Helper(color)/Uncharted2Helper(vec3(whitePoint)),0.0,1.0);}
#endif
void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){
#if TONE_MAPPING_MODE == 2 || TONE_MAPPING_MODE == 3
outputColor=vec4(Reinhard2ToneMapping(inputColor.rgb),inputColor.a);
#elif TONE_MAPPING_MODE == 4
outputColor=vec4(Uncharted2ToneMapping(inputColor.rgb),inputColor.a);
#else
outputColor=vec4(toneMapping(inputColor.rgb),inputColor.a);
#endif
}`,Ea=class extends cr{constructor({blendFunction:t=w.SRC,adaptive:e=!1,mode:r=e?ae.REINHARD2_ADAPTIVE:ae.AGX,resolution:i=256,maxLuminance:n=4,whitePoint:a=n,middleGrey:s=.6,minLuminance:o=.01,averageLuminance:c=1,adaptationRate:l=1}={}){super("ToneMappingEffect",Tl,{blendFunction:t,uniforms:new Map([["luminanceBuffer",new sr(null)],["maxLuminance",new sr(n)],["whitePoint",new sr(a)],["middleGrey",new sr(s)],["averageLuminance",new sr(c)]])}),this.renderTargetLuminance=new dl(1,1,{minFilter:ul,depthBuffer:!1}),this.renderTargetLuminance.texture.generateMipmaps=!0,this.renderTargetLuminance.texture.name="Luminance",this.luminancePass=new cl({renderTarget:this.renderTargetLuminance}),this.adaptiveLuminancePass=new Al(this.luminancePass.texture,{minLuminance:o,adaptationRate:l}),this.uniforms.get("luminanceBuffer").value=this.adaptiveLuminancePass.texture,this.resolution=i,this.mode=r}get mode(){return Number(this.defines.get("TONE_MAPPING_MODE"))}set mode(t){if(this.mode===t)return;let r=hl.replace(/\D+/g,"")>=168?"CineonToneMapping(texel)":"OptimizedCineonToneMapping(texel)";switch(this.defines.clear(),this.defines.set("TONE_MAPPING_MODE",t.toFixed(0)),t){case ae.LINEAR:this.defines.set("toneMapping(texel)","LinearToneMapping(texel)");break;case ae.REINHARD:this.defines.set("toneMapping(texel)","ReinhardToneMapping(texel)");break;case ae.CINEON:case ae.OPTIMIZED_CINEON:this.defines.set("toneMapping(texel)",r);break;case ae.ACES_FILMIC:this.defines.set("toneMapping(texel)","ACESFilmicToneMapping(texel)");break;case ae.AGX:this.defines.set("toneMapping(texel)","AgXToneMapping(texel)");break;case ae.NEUTRAL:this.defines.set("toneMapping(texel)","NeutralToneMapping(texel)");break;default:this.defines.set("toneMapping(texel)","texel");break}this.adaptiveLuminancePass.enabled=t===ae.REINHARD2_ADAPTIVE,this.setChanged()}getMode(){return this.mode}setMode(t){this.mode=t}get whitePoint(){return this.uniforms.get("whitePoint").value}set whitePoint(t){this.uniforms.get("whitePoint").value=t}get middleGrey(){return this.uniforms.get("middleGrey").value}set middleGrey(t){this.uniforms.get("middleGrey").value=t}get averageLuminance(){return this.uniforms.get("averageLuminance").value}set averageLuminance(t){this.uniforms.get("averageLuminance").value=t}get adaptiveLuminanceMaterial(){return this.adaptiveLuminancePass.fullscreenMaterial}getAdaptiveLuminanceMaterial(){return this.adaptiveLuminanceMaterial}get resolution(){return this.luminancePass.resolution.width}set resolution(t){let e=Math.max(0,Math.ceil(Math.log2(t))),r=Math.pow(2,e);this.luminancePass.resolution.setPreferredSize(r,r),this.adaptiveLuminanceMaterial.mipLevel1x1=e}getResolution(){return this.resolution}setResolution(t){this.resolution=t}get adaptive(){return this.mode===ae.REINHARD2_ADAPTIVE}set adaptive(t){this.mode=t?ae.REINHARD2_ADAPTIVE:ae.REINHARD2}get adaptationRate(){return this.adaptiveLuminanceMaterial.adaptationRate}set adaptationRate(t){this.adaptiveLuminanceMaterial.adaptationRate=t}get distinction(){return console.warn(this.name,"distinction was removed."),1}set distinction(t){console.warn(this.name,"distinction was removed.")}update(t,e,r){this.adaptiveLuminancePass.enabled&&(this.luminancePass.render(t,e),this.adaptiveLuminancePass.render(t,null,null,r))}initialize(t,e,r){this.adaptiveLuminancePass.initialize(t,e,r)}};var Cl=`#include <common>
#include <packing>
#include <dithering_pars_fragment>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#if DEPTH_PACKING == 3201
uniform lowp sampler2D depthBuffer;
#elif defined(GL_FRAGMENT_PRECISION_HIGH)
uniform highp sampler2D depthBuffer;
#else
uniform mediump sampler2D depthBuffer;
#endif
uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;vec4 sRGBToLinear(const in vec4 value){return vec4(mix(pow(value.rgb*0.9478672986+vec3(0.0521327014),vec3(2.4)),value.rgb*0.0773993808,vec3(lessThanEqual(value.rgb,vec3(0.04045)))),value.a);}float readDepth(const in vec2 uv){
#if DEPTH_PACKING == 3201
float depth=unpackRGBAToDepth(texture2D(depthBuffer,uv));
#else
float depth=texture2D(depthBuffer,uv).r;
#endif
#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)
float d=pow(2.0,depth*log2(cameraFar+1.0))-1.0;float a=cameraFar/(cameraFar-cameraNear);float b=cameraFar*cameraNear/(cameraNear-cameraFar);depth=a+b/d;
#elif defined(USE_REVERSED_DEPTH_BUFFER)
depth=1.0-depth;
#endif
return depth;}float getViewZ(const in float depth){
#ifdef PERSPECTIVE_CAMERA
return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);
#else
return orthographicDepthToViewZ(depth,cameraNear,cameraFar);
#endif
}vec3 RGBToHCV(const in vec3 RGB){vec4 P=mix(vec4(RGB.bg,-1.0,2.0/3.0),vec4(RGB.gb,0.0,-1.0/3.0),step(RGB.b,RGB.g));vec4 Q=mix(vec4(P.xyw,RGB.r),vec4(RGB.r,P.yzx),step(P.x,RGB.r));float C=Q.x-min(Q.w,Q.y);float H=abs((Q.w-Q.y)/(6.0*C+EPSILON)+Q.z);return vec3(H,C,Q.x);}vec3 RGBToHSL(const in vec3 RGB){vec3 HCV=RGBToHCV(RGB);float L=HCV.z-HCV.y*0.5;float S=HCV.y/(1.0-abs(L*2.0-1.0)+EPSILON);return vec3(HCV.x,S,L);}vec3 HueToRGB(const in float H){float R=abs(H*6.0-3.0)-1.0;float G=2.0-abs(H*6.0-2.0);float B=2.0-abs(H*6.0-4.0);return clamp(vec3(R,G,B),0.0,1.0);}vec3 HSLToRGB(const in vec3 HSL){vec3 RGB=HueToRGB(HSL.x);float C=(1.0-abs(2.0*HSL.z-1.0))*HSL.y;return(RGB-0.5)*C+HSL.z;}FRAGMENT_HEAD void main(){FRAGMENT_MAIN_UV vec4 color0=texture2D(inputBuffer,UV);vec4 color1=vec4(0.0);FRAGMENT_MAIN_IMAGE color0.a=clamp(color0.a,0.0,1.0);gl_FragColor=color0;
#ifdef ENCODE_OUTPUT
#include <colorspace_fragment>
#endif
#include <dithering_fragment>
}`,Dl="uniform vec2 resolution;uniform vec2 texelSize;uniform float cameraNear;uniform float cameraFar;uniform float aspect;uniform float time;varying vec2 vUv;VERTEX_HEAD void main(){vUv=position.xy*0.5+0.5;VERTEX_MAIN_SUPPORT gl_Position=vec4(position.xy,1.0,1.0);}",Rl=class extends yl{constructor(t,e,r,i,n=!1){super({name:"EffectMaterial",defines:{THREE_REVISION:wl.replace(/\D+/g,""),DEPTH_PACKING:"0",ENCODE_OUTPUT:"1"},uniforms:{inputBuffer:new qe(null),depthBuffer:new qe(null),resolution:new qe(new va),texelSize:new qe(new va),cameraNear:new qe(.3),cameraFar:new qe(1e3),aspect:new qe(1),time:new qe(0)},blending:El,toneMapped:!1,depthWrite:!1,depthTest:!1,dithering:n}),t&&this.setShaderParts(t),e&&this.setDefines(e),r&&this.setUniforms(r),this.copyCameraSettings(i)}set inputBuffer(t){this.uniforms.inputBuffer.value=t}setInputBuffer(t){this.uniforms.inputBuffer.value=t}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(t){this.uniforms.depthBuffer.value=t}get depthPacking(){return Number(this.defines.DEPTH_PACKING)}set depthPacking(t){this.defines.DEPTH_PACKING=t.toFixed(0),this.needsUpdate=!0}setDepthBuffer(t,e=Sl){this.depthBuffer=t,this.depthPacking=e}setShaderData(t){this.setShaderParts(t.shaderParts),this.setDefines(t.defines),this.setUniforms(t.uniforms),this.setExtensions(t.extensions)}setShaderParts(t){return this.fragmentShader=Cl.replace(I.FRAGMENT_HEAD,t.get(I.FRAGMENT_HEAD)||"").replace(I.FRAGMENT_MAIN_UV,t.get(I.FRAGMENT_MAIN_UV)||"").replace(I.FRAGMENT_MAIN_IMAGE,t.get(I.FRAGMENT_MAIN_IMAGE)||""),this.vertexShader=Dl.replace(I.VERTEX_HEAD,t.get(I.VERTEX_HEAD)||"").replace(I.VERTEX_MAIN_SUPPORT,t.get(I.VERTEX_MAIN_SUPPORT)||""),this.needsUpdate=!0,this}setDefines(t){for(let e of t.entries())this.defines[e[0]]=e[1];return this.needsUpdate=!0,this}setUniforms(t){for(let e of t.entries())this.uniforms[e[0]]=e[1];return this}setExtensions(t){this.extensions={};for(let e of t)this.extensions[e]=!0;return this}get encodeOutput(){return this.defines.ENCODE_OUTPUT!==void 0}set encodeOutput(t){this.encodeOutput!==t&&(t?this.defines.ENCODE_OUTPUT="1":delete this.defines.ENCODE_OUTPUT,this.needsUpdate=!0)}isOutputEncodingEnabled(t){return this.encodeOutput}setOutputEncodingEnabled(t){this.encodeOutput=t}get time(){return this.uniforms.time.value}set time(t){this.uniforms.time.value=t}setDeltaTime(t){this.uniforms.time.value+=t}adoptCameraSettings(t){this.copyCameraSettings(t)}copyCameraSettings(t){t&&(this.uniforms.cameraNear.value=t.near,this.uniforms.cameraFar.value=t.far,t instanceof xl?this.defines.PERSPECTIVE_CAMERA="1":delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0)}setSize(t,e){let r=this.uniforms;r.resolution.value.set(t,e),r.texelSize.value.set(1/t,1/e),r.aspect.value=t/e}static get Section(){return I}};var zv=Number(_l.replace(/\D+/g,"")),ut=255/256,kv=new Float32Array([ut/256**3,ut/256**2,ut/256,ut]),Wv=new Float32Array([ut,ut/256,ut/256**2,1/256**3]);function Aa(t,e,r){for(let i of e){let n="$1"+t+i.charAt(0).toUpperCase()+i.slice(1),a=new RegExp("([^\\.])(\\b"+i+"\\b)","g");for(let s of r.entries())s[1]!==null&&r.set(s[0],s[1].replace(a,n))}}function Nl(t,e,r){let i=e.getFragmentShader(),n=e.getVertexShader(),a=i!==void 0&&/mainImage/.test(i),s=i!==void 0&&/mainUv/.test(i);if(r.attributes|=e.getAttributes(),i===void 0)throw new Error(`Missing fragment shader (${e.name})`);if(s&&(r.attributes&Te.CONVOLUTION)!==0)throw new Error(`Effects that transform UVs are incompatible with convolution effects (${e.name})`);if(!a&&!s)throw new Error(`Could not find mainImage or mainUv function (${e.name})`);{let o=/\w+\s+(\w+)\([\w\s,]*\)\s*{/g,c=r.shaderParts,l=c.get(I.FRAGMENT_HEAD)||"",u=c.get(I.FRAGMENT_MAIN_UV)||"",h=c.get(I.FRAGMENT_MAIN_IMAGE)||"",p=c.get(I.VERTEX_HEAD)||"",v=c.get(I.VERTEX_MAIN_SUPPORT)||"",A=new Set,g=new Set;if(s&&(u+=`	${t}MainUv(UV);
`,r.uvTransformation=!0),n!==null&&/mainSupport/.test(n)){let y=/mainSupport *\([\w\s]*?uv\s*?\)/.test(n);v+=`	${t}MainSupport(`,v+=y?`vUv);
`:`);
`;for(let E of n.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g))for(let N of E[1].split(/\s*,\s*/))r.varyings.add(N),A.add(N),g.add(N);for(let E of n.matchAll(o))g.add(E[1])}for(let y of i.matchAll(o))g.add(y[1]);for(let y of e.defines.keys())g.add(y.replace(/\([\w\s,]*\)/g,""));for(let y of e.uniforms.keys())g.add(y);g.delete("while"),g.delete("for"),g.delete("if"),e.uniforms.forEach((y,E)=>r.uniforms.set(t+E.charAt(0).toUpperCase()+E.slice(1),y)),e.defines.forEach((y,E)=>r.defines.set(t+E.charAt(0).toUpperCase()+E.slice(1),y));let S=new Map([["fragment",i],["vertex",n]]);Aa(t,g,r.defines),Aa(t,g,S),i=S.get("fragment"),n=S.get("vertex");let D=e.blendMode;if(r.blendModes.set(D.blendFunction,D),a){e.inputColorSpace!==null&&e.inputColorSpace!==r.colorSpace&&(h+=e.inputColorSpace===xa?`color0 = sRGBTransferOETF(color0);
	`:`color0 = sRGBToLinear(color0);
	`),e.outputColorSpace!==Ml?r.colorSpace=e.outputColorSpace:e.inputColorSpace!==null&&(r.colorSpace=e.inputColorSpace);let y=/MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;h+=`${t}MainImage(color0, UV, `,(r.attributes&Te.DEPTH)!==0&&y.test(i)&&(h+="depth, ",r.readDepth=!0),h+=`color1);
	`;let E=t+"BlendOpacity";r.uniforms.set(E,D.opacity),h+=`color0 = blend${D.blendFunction}(color0, color1, ${E});

	`,l+=`uniform float ${E};

`}if(l+=i+`
`,n!==null&&(p+=n+`
`),c.set(I.FRAGMENT_HEAD,l),c.set(I.FRAGMENT_MAIN_UV,u),c.set(I.FRAGMENT_MAIN_IMAGE,h),c.set(I.VERTEX_HEAD,p),c.set(I.VERTEX_MAIN_SUPPORT,v),e.extensions!==null)for(let y of e.extensions)r.extensions.add(y)}}var Xi=class extends oe{constructor(t,...e){super("EffectPass"),this.fullscreenMaterial=new Rl(null,null,null,t),this.listener=r=>this.handleEvent(r),this.effects=[],this.setEffects(e),this.skipRendering=!1,this.minTime=1,this.maxTime=Number.POSITIVE_INFINITY,this.timeScale=1}set mainScene(t){for(let e of this.effects)e.mainScene=t}set mainCamera(t){this.fullscreenMaterial.copyCameraSettings(t);for(let e of this.effects)e.mainCamera=t}get encodeOutput(){return this.fullscreenMaterial.encodeOutput}set encodeOutput(t){this.fullscreenMaterial.encodeOutput=t}get dithering(){return this.fullscreenMaterial.dithering}set dithering(t){let e=this.fullscreenMaterial;e.dithering=t,e.needsUpdate=!0}setEffects(t){for(let e of this.effects)e.removeEventListener("change",this.listener);this.effects=t.sort((e,r)=>r.attributes-e.attributes);for(let e of this.effects)e.addEventListener("change",this.listener)}updateMaterial(){let t=new cc,e=0;for(let s of this.effects)if(s.blendMode.blendFunction===w.DST)t.attributes|=s.getAttributes()&Te.DEPTH;else{if((t.attributes&s.getAttributes()&Te.CONVOLUTION)!==0)throw new Error(`Convolution effects cannot be merged (${s.name})`);Nl("e"+e++,s,t)}let r=t.shaderParts.get(I.FRAGMENT_HEAD),i=t.shaderParts.get(I.FRAGMENT_MAIN_IMAGE),n=t.shaderParts.get(I.FRAGMENT_MAIN_UV),a=/\bblend\b/g;for(let s of t.blendModes.values())r+=s.getShaderCode().replace(a,`blend${s.blendFunction}`)+`
`;(t.attributes&Te.DEPTH)!==0?(t.readDepth&&(i=`float depth = readDepth(UV);

	`+i),this.needsDepthTexture=this.getDepthTexture()===null):this.needsDepthTexture=!1,t.colorSpace===xa&&(i+=`color0 = sRGBToLinear(color0);
	`),t.uvTransformation?(n=`vec2 transformedUv = vUv;
`+n,t.defines.set("UV","transformedUv")):t.defines.set("UV","vUv"),t.shaderParts.set(I.FRAGMENT_HEAD,r),t.shaderParts.set(I.FRAGMENT_MAIN_IMAGE,i),t.shaderParts.set(I.FRAGMENT_MAIN_UV,n);for(let[s,o]of t.shaderParts)o!==null&&t.shaderParts.set(s,o.trim().replace(/^#/,`
#`));this.skipRendering=e===0,this.needsSwap=!this.skipRendering,this.fullscreenMaterial.setShaderData(t)}recompile(){this.updateMaterial()}getDepthTexture(){return this.fullscreenMaterial.depthBuffer}setDepthTexture(t,e=Il){this.fullscreenMaterial.depthBuffer=t,this.fullscreenMaterial.depthPacking=e;for(let r of this.effects)r.setDepthTexture(t,e)}render(t,e,r,i,n){for(let a of this.effects)a.update(t,e,i);if(!this.skipRendering||this.renderToScreen){let a=this.fullscreenMaterial;a.inputBuffer=e.texture,a.time+=i*this.timeScale,t.setRenderTarget(this.renderToScreen?null:r),t.render(this.scene,this.camera)}}setSize(t,e){this.fullscreenMaterial.setSize(t,e);for(let r of this.effects)r.setSize(t,e)}initialize(t,e,r){this.renderer=t;for(let i of this.effects)i.initialize(t,e,r);this.updateMaterial(),r!==void 0&&r!==Pl&&(this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH="1")}dispose(){super.dispose();for(let t of this.effects)t.removeEventListener("change",this.listener),t.dispose()}handleEvent(t){switch(t.type){case"change":this.recompile();break}}};var e2=[new Float32Array(3),new Float32Array(3)],t2=[new Float32Array(3),new Float32Array(3),new Float32Array(3),new Float32Array(3)],r2=[[new Float32Array([0,0,0]),new Float32Array([1,0,0]),new Float32Array([1,1,0]),new Float32Array([1,1,1])],[new Float32Array([0,0,0]),new Float32Array([1,0,0]),new Float32Array([1,0,1]),new Float32Array([1,1,1])],[new Float32Array([0,0,0]),new Float32Array([0,0,1]),new Float32Array([1,0,1]),new Float32Array([1,1,1])],[new Float32Array([0,0,0]),new Float32Array([0,1,0]),new Float32Array([1,1,0]),new Float32Array([1,1,1])],[new Float32Array([0,0,0]),new Float32Array([0,1,0]),new Float32Array([0,1,1]),new Float32Array([1,1,1])],[new Float32Array([0,0,0]),new Float32Array([0,0,1]),new Float32Array([0,1,1]),new Float32Array([1,1,1])]];var i2=[new Float32Array(2),new Float32Array(2)];var n2=new Float32Array([0,-.25,.25,-.125,.125,-.375,.375]),a2=[new Float32Array([0,0]),new Float32Array([.25,-.25]),new Float32Array([-.25,.25]),new Float32Array([.125,-.125]),new Float32Array([-.125,.125])],s2=[new Uint8Array([0,0]),new Uint8Array([3,0]),new Uint8Array([0,3]),new Uint8Array([3,3]),new Uint8Array([1,0]),new Uint8Array([4,0]),new Uint8Array([1,3]),new Uint8Array([4,3]),new Uint8Array([0,1]),new Uint8Array([3,1]),new Uint8Array([0,4]),new Uint8Array([3,4]),new Uint8Array([1,1]),new Uint8Array([4,1]),new Uint8Array([1,4]),new Uint8Array([4,4])],o2=[new Uint8Array([0,0]),new Uint8Array([1,0]),new Uint8Array([0,2]),new Uint8Array([1,2]),new Uint8Array([2,0]),new Uint8Array([3,0]),new Uint8Array([2,2]),new Uint8Array([3,2]),new Uint8Array([0,1]),new Uint8Array([1,1]),new Uint8Array([0,3]),new Uint8Array([1,3]),new Uint8Array([2,1]),new Uint8Array([3,1]),new Uint8Array([2,3]),new Uint8Array([3,3])];var u2=new Map([[ie(0,0,0,0),new Float32Array([0,0,0,0])],[ie(0,0,0,1),new Float32Array([0,0,0,1])],[ie(0,0,1,0),new Float32Array([0,0,1,0])],[ie(0,0,1,1),new Float32Array([0,0,1,1])],[ie(0,1,0,0),new Float32Array([0,1,0,0])],[ie(0,1,0,1),new Float32Array([0,1,0,1])],[ie(0,1,1,0),new Float32Array([0,1,1,0])],[ie(0,1,1,1),new Float32Array([0,1,1,1])],[ie(1,0,0,0),new Float32Array([1,0,0,0])],[ie(1,0,0,1),new Float32Array([1,0,0,1])],[ie(1,0,1,0),new Float32Array([1,0,1,0])],[ie(1,0,1,1),new Float32Array([1,0,1,1])],[ie(1,1,0,0),new Float32Array([1,1,0,0])],[ie(1,1,0,1),new Float32Array([1,1,0,1])],[ie(1,1,1,0),new Float32Array([1,1,1,0])],[ie(1,1,1,1),new Float32Array([1,1,1,1])]]);function zi(t,e,r){return t+(e-t)*r}function ie(t,e,r,i){let n=zi(t,e,.75),a=zi(r,i,1-.25);return zi(n,a,1-.125)}import{Vector3 as O,Color as Us,Uniform as m,Camera as Ls,Vector2 as Bs,Matrix4 as ne,RawShaderMaterial as Fs,Quaternion as oT,HalfFloatType as nt,MeshBasicMaterial as cT,DepthTexture as lT,UnsignedIntType as uT,WebGLRenderTarget as rh,RedFormat as hT,RGBADepthPacking as dT,LessEqualDepth as fT,BasicDepthPacking as mT,Matrix3 as ci,Mesh as ih,PlaneGeometry as nh,Scene as ah,FloatType as sh,GLSL3 as Wn,CustomBlending as oh,NoBlending as ch,AddEquation as Ds,OneFactor as ii,RGBAFormat as Hs,LinearFilter as hi,ClampToEdgeWrapping as Er,NoColorSpace as Gs,WebGL3DRenderTarget as lh,Loader as pT,Data3DTexture as gT,DataTexture as vT,LightProbe as AT,BufferGeometry as TT,InterleavedBuffer as ST,InterleavedBufferAttribute as ET,Sphere as xT,DirectionalLight as wT}from"three";import{Loader as cA,FileLoader as lA,BufferGeometry as uA,BufferAttribute as hA,Box3 as dA,Vector3 as fA,Sphere as mA,WebGLRenderer as kl,LinearFilter as pA,RGBAFormat as gA,ByteType as vA,UnsignedByteType as AA,ShortType as TA,UnsignedShortType as SA,IntType as EA,UnsignedIntType as xA,HalfFloatType as wA,FloatType as yA,MathUtils as we,Material as Xr,Data3DTexture as CA,DataTexture as DA,Quaternion as RA,Matrix4 as _A,Ray as IA,Vector2 as MA}from"three";var bl=!0,Qi="Invariant failed";function It(t,e){if(!t){if(bl)throw new Error(Qi);var r=typeof e=="function"?e():e,i=r?"".concat(Qi,": ").concat(r):Qi;throw new Error(i)}}import{BufferGeometry as U2,Sphere as L2,Vector3 as B2,Float32BufferAttribute as F2,Loader as Ol,Data3DTexture as Ul,FileLoader as Ll,UnsignedByteType as Bl,RedFormat as Fl,NearestFilter as wa,RepeatWrapping as Zi}from"three";var ya=128,Ca=128,Da=64,Hl="9627216cc50057994c98a2118f3c4a23765d43b9",Gl=`https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${Hl}/packages/core/assets/stbn.bin`;var ur=class extends Ol{load(e,r,i,n){let a=new Ul,s=new Ll(this.manager);return s.setPath(this.path),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.setResponseType("arraybuffer"),s.load(e,o=>{It(o instanceof ArrayBuffer),a.image.data=new Uint8Array(o),a.image.width=ya,a.image.height=Ca,a.image.depth=Da,a.type=Bl,a.format=Fl,a.minFilter=wa,a.magFilter=wa,a.wrapS=Zi,a.wrapT=Zi,a.wrapR=Zi,a.needsUpdate=!0,r==null||r(a)},i,n),a}};import{Vector3 as q,Matrix4 as Ra,BufferGeometry as k2,BufferAttribute as W2}from"three";var zl=new q;function Ia(t,e,r=new q,i){let{x:n,y:a,z:s}=t,o=e.x,c=e.y,l=e.z,u=n*n*o,h=a*a*c,p=s*s*l,v=u+h+p,A=Math.sqrt(1/v);if(!Number.isFinite(A))return;let g=zl.copy(t).multiplyScalar(A);if(v<((i==null?void 0:i.centerTolerance)??.1))return r.copy(g);let S=g.multiply(e).multiplyScalar(2),D=(1-A)*t.length()/(S.length()/2),y=0,E,N,L,Y;do{D-=y,E=1/(1+D*o),N=1/(1+D*c),L=1/(1+D*l);let ee=E*E,de=N*N,K=L*L,Pe=ee*E,Ne=de*N,ye=K*L;Y=u*ee+h*de+p*K-1,y=Y/((u*Pe*o+h*Ne*c+p*ye*l)*-2)}while(Math.abs(Y)>1e-12);return r.set(n*E,a*N,s*L)}var Mt=new q,Ki=new q,ji=new q,qi=class{constructor(e,r,i){this.radii=new q(e,r,i)}get minimumRadius(){return Math.min(this.radii.x,this.radii.y,this.radii.z)}get maximumRadius(){return Math.max(this.radii.x,this.radii.y,this.radii.z)}get flattening(){return 1-this.minimumRadius/this.maximumRadius}get eccentricity(){return Math.sqrt(this.eccentricitySquared)}get eccentricitySquared(){let e=this.maximumRadius**2,r=this.minimumRadius**2;return(e-r)/e}reciprocalRadii(e=new q){let{x:r,y:i,z:n}=this.radii;return e.set(1/r,1/i,1/n)}reciprocalRadiiSquared(e=new q){let{x:r,y:i,z:n}=this.radii;return e.set(1/r**2,1/i**2,1/n**2)}projectOnSurface(e,r=new q,i){return Ia(e,this.reciprocalRadiiSquared(),r,i)}getSurfaceNormal(e,r=new q){return r.multiplyVectors(this.reciprocalRadiiSquared(Mt),e).normalize()}getEastNorthUpVectors(e,r=new q,i=new q,n=new q){this.getSurfaceNormal(e,n),r.set(-e.y,e.x,0).normalize(),i.crossVectors(n,r).normalize()}getEastNorthUpFrame(e,r=new Ra){let i=Mt,n=Ki,a=ji;return this.getEastNorthUpVectors(e,i,n,a),r.makeBasis(i,n,a).setPosition(e)}getNorthUpEastFrame(e,r=new Ra){let i=Mt,n=Ki,a=ji;return this.getEastNorthUpVectors(e,i,n,a),r.makeBasis(n,a,i).setPosition(e)}getIntersection(e,r=new q){let i=this.reciprocalRadii(Mt),n=Ki.copy(i).multiply(e.origin),a=ji.copy(i).multiply(e.direction),s=n.lengthSq(),o=a.lengthSq(),c=n.dot(a),l=c**2-o*(s-1);if(s===1)return r.copy(e.origin);if(s>1){if(c>=0||l<0)return;let u=Math.sqrt(l),h=(-c-u)/o,p=(-c+u)/o;return e.at(Math.min(h,p),r)}if(s<1){let u=c**2-o*(s-1),h=Math.sqrt(u),p=(-c+h)/o;return e.at(p,r)}if(c<0)return e.at(-c/o,r)}getOsculatingSphereCenter(e,r,i=new q){It(this.radii.x===this.radii.y);let n=this.radii.x**2,a=this.radii.z**2,s=Mt.set(e.x/n,e.y/n,e.z/a).normalize();return i.copy(s.multiplyScalar(-r).add(e))}getNormalAtHorizon(e,r,i=new q){It(this.radii.x===this.radii.y);let n=this.radii.x**2,a=this.radii.z**2,s=e,o=r,c=(s.x*o.x+s.y*o.y)/n+s.z*o.z/a;c/=(s.x**2+s.y**2)/n+s.z**2/a;let l=Mt.copy(o).multiplyScalar(-c).add(e);return i.set(l.x/n,l.y/n,l.z/a).normalize()}};qi.WGS84=new qi(6378137,6378137,6356752314245179e-9);var Se=qi;var Ur=new q,_a=new q,hr=class Ji{constructor(e=0,r=0,i=0){this.longitude=e,this.latitude=r,this.height=i}set(e,r,i){return this.longitude=e,this.latitude=r,i!=null&&(this.height=i),this}clone(){return new Ji(this.longitude,this.latitude,this.height)}copy(e){return this.longitude=e.longitude,this.latitude=e.latitude,this.height=e.height,this}equals(e){return e.longitude===this.longitude&&e.latitude===this.latitude&&e.height===this.height}setLongitude(e){return this.longitude=e,this}setLatitude(e){return this.latitude=e,this}setHeight(e){return this.height=e,this}normalize(){return this.longitude<Ji.MIN_LONGITUDE&&(this.longitude+=Math.PI*2),this}setFromECEF(e,r){let i=((r==null?void 0:r.ellipsoid)??Se.WGS84).reciprocalRadiiSquared(Ur),n=Ia(e,i,_a,r);if(n==null)throw new Error(`Could not project position to ellipsoid surface: ${e.toArray()}`);let a=Ur.multiplyVectors(n,i).normalize();this.longitude=Math.atan2(a.y,a.x),this.latitude=Math.asin(a.z);let s=Ur.subVectors(e,n);return this.height=Math.sign(s.dot(e))*s.length(),this}toECEF(e=new q,r){let i=(r==null?void 0:r.ellipsoid)??Se.WGS84,n=Ur.multiplyVectors(i.radii,i.radii),a=Math.cos(this.latitude),s=_a.set(a*Math.cos(this.longitude),a*Math.sin(this.longitude),Math.sin(this.latitude)).normalize();return e.multiplyVectors(n,s),e.divideScalar(Math.sqrt(s.dot(e))).add(s.multiplyScalar(this.height))}fromArray(e,r=0){return this.longitude=e[r],this.latitude=e[r+1],this.height=e[r+2],this}toArray(e=[],r=0){return e[r]=this.longitude,e[r+1]=this.latitude,e[r+2]=this.height,e}*[Symbol.iterator](){yield this.longitude,yield this.latitude,yield this.height}};hr.MIN_LONGITUDE=-Math.PI,hr.MAX_LONGITUDE=Math.PI,hr.MIN_LATITUDE=-Math.PI/2,hr.MAX_LATITUDE=Math.PI/2;var ce=hr;import{DataTextureLoader as Z2,DataUtils as K2,FloatType as j2,HalfFloatType as q2,LinearFilter as J2,LinearSRGBColorSpace as $2,RedFormat as eA,RGFormat as tA,RGBAFormat as rA}from"three";function Za(t){var e,r;return t instanceof kl?t.getContext().getExtension("OES_texture_float_linear")!=null:((r=(e=t.backend).hasFeature)==null?void 0:r.call(e,"float32-filterable"))??!1}var Wl="This is not an object",Vl="This is not a Float16Array object",Ma="This constructor is not a subclass of Float16Array",Ka="The constructor property value is not an object",Yl="Species constructor didn't return TypedArray object",Xl="Derived constructor created TypedArray object which was too small length",mr="Attempting to access detached ArrayBuffer",nn="Cannot convert undefined or null to object",an="Cannot mix BigInt and other types, use explicit conversions",Pa="@@iterator property is not callable",Na="Reduce of empty array with no initial value",Ql="The comparison function must be either a function or undefined",$i="Offset is out of bounds";function F(t){return(e,...r)=>le(t,e,r)}function Ut(t,e){return F(Nt(t,e).get)}var{apply:le,construct:fr,defineProperty:Zl,get:en,getOwnPropertyDescriptor:Nt,getPrototypeOf:vr,has:sn,ownKeys:ja,set:ba,setPrototypeOf:qa}=Reflect,Kl=Proxy,{EPSILON:jl,MAX_SAFE_INTEGER:Oa,isFinite:Ja,isNaN:bt}=Number,{iterator:Ie,species:ql,toStringTag:hn,for:Jl}=Symbol,Ot=Object,{create:Qr,defineProperty:Ar,freeze:$l,is:Ua}=Ot,on=Ot.prototype,eu=on.__lookupGetter__?F(on.__lookupGetter__):(t,e)=>{if(t==null)throw G(nn);let r=Ot(t);do{let i=Nt(r,e);if(i!==void 0)return Le(i,"get")?i.get:void 0}while((r=vr(r))!==null)},Le=Ot.hasOwn||F(on.hasOwnProperty),$a=Array,es=$a.isArray,Zr=$a.prototype,tu=F(Zr.join),ru=F(Zr.push),iu=F(Zr.toLocaleString),dn=Zr[Ie],nu=F(dn),{abs:au,trunc:ts}=Math,Kr=ArrayBuffer,su=Kr.isView,rs=Kr.prototype,ou=F(rs.slice),cu=Ut(rs,"byteLength"),cn=typeof SharedArrayBuffer<"u"?SharedArrayBuffer:null,lu=cn&&Ut(cn.prototype,"byteLength"),fn=vr(Uint8Array),uu=fn.from,$=fn.prototype,hu=$[Ie],du=F($.keys),fu=F($.values),mu=F($.entries),pu=F($.set),La=F($.reverse),gu=F($.fill),vu=F($.copyWithin),Ba=F($.sort),dr=F($.slice),Au=F($.subarray),J=Ut($,"buffer"),dt=Ut($,"byteOffset"),P=Ut($,"length"),is=Ut($,hn),Tu=Uint8Array,fe=Uint16Array,Fa=(...t)=>le(uu,fe,t),mn=Uint32Array,Su=Float32Array,ft=vr([][Ie]()),jr=F(ft.next),Eu=F((function*(){})().next),xu=vr(ft),wu=DataView.prototype,LA=F(wu.getUint16),G=TypeError,tn=RangeError,ns=WeakSet,as=ns.prototype,yu=F(as.add),Cu=F(as.has),qr=WeakMap,pn=qr.prototype,Gr=F(pn.get),Du=F(pn.has),gn=F(pn.set),ss=new qr,Ru=Qr(null,{next:{value:function(){let t=Gr(ss,this);return jr(t)}},[Ie]:{value:function(){return this}}});function Lr(t){if(t[Ie]===dn&&ft.next===jr)return t;let e=Qr(Ru);return gn(ss,e,nu(t)),e}var os=new qr,cs=Qr(xu,{next:{value:function(){let t=Gr(os,this);return Eu(t)},writable:!0,configurable:!0}});for(let t of ja(ft))t!=="next"&&Ar(cs,t,Nt(ft,t));function Ha(t){let e=Qr(cs);return gn(os,e,t),e}function zr(t){return t!==null&&typeof t=="object"||typeof t=="function"}function Ga(t){return t!==null&&typeof t=="object"}function kr(t){return is(t)!==void 0}function ln(t){let e=is(t);return e==="BigInt64Array"||e==="BigUint64Array"}function _u(t){try{return es(t)?!1:(cu(t),!0)}catch{return!1}}function ls(t){if(cn===null)return!1;try{return lu(t),!0}catch{return!1}}function Iu(t){return _u(t)||ls(t)}function za(t){return es(t)?t[Ie]===dn&&ft.next===jr:!1}function Mu(t){return kr(t)?t[Ie]===hu&&ft.next===jr:!1}function Br(t){if(typeof t!="string")return!1;let e=+t;return t!==e+""||!Ja(e)?!1:e===ts(e)}var Wr=Jl("__Float16Array__");function Pu(t){if(!Ga(t))return!1;let e=vr(t);if(!Ga(e))return!1;let r=e.constructor;if(r===void 0)return!1;if(!zr(r))throw G(Ka);return sn(r,Wr)}var un=1/jl;function Nu(t){return t+un-un}var us=6103515625e-14,bu=65504,hs=.0009765625,ka=hs*us,Ou=hs*un;function Uu(t){let e=+t;if(!Ja(e)||e===0)return e;let r=e>0?1:-1,i=au(e);if(i<us)return r*Nu(i/ka)*ka;let n=(1+Ou)*i,a=n-(n-i);return a>bu||bt(a)?r*(1/0):r*a}var ds=new Kr(4),fs=new Su(ds),ms=new mn(ds),Ee=new fe(512),xe=new Tu(512);for(let t=0;t<256;++t){let e=t-127;e<-24?(Ee[t]=0,Ee[t|256]=32768,xe[t]=24,xe[t|256]=24):e<-14?(Ee[t]=1024>>-e-14,Ee[t|256]=1024>>-e-14|32768,xe[t]=-e-1,xe[t|256]=-e-1):e<=15?(Ee[t]=e+15<<10,Ee[t|256]=e+15<<10|32768,xe[t]=13,xe[t|256]=13):e<128?(Ee[t]=31744,Ee[t|256]=64512,xe[t]=24,xe[t|256]=24):(Ee[t]=31744,Ee[t|256]=64512,xe[t]=13,xe[t|256]=13)}function _e(t){fs[0]=Uu(t);let e=ms[0],r=e>>23&511;return Ee[r]+((e&8388607)>>xe[r])}var vn=new mn(2048);for(let t=1;t<1024;++t){let e=t<<13,r=0;for(;(e&8388608)===0;)e<<=1,r-=8388608;e&=-8388609,r+=947912704,vn[t]=e|r}for(let t=1024;t<2048;++t)vn[t]=939524096+(t-1024<<13);var Lt=new mn(64);for(let t=1;t<31;++t)Lt[t]=t<<23;Lt[31]=1199570944;Lt[32]=2147483648;for(let t=33;t<63;++t)Lt[t]=2147483648+(t-32<<23);Lt[63]=3347054592;var ps=new fe(64);for(let t=1;t<64;++t)t!==32&&(ps[t]=1024);function b(t){let e=t>>10;return ms[0]=vn[ps[e]+(t&1023)]+Lt[e],fs[0]}function Ue(t){let e=+t;return bt(e)||e===0?0:ts(e)}function rn(t){let e=Ue(t);return e<0?0:e<Oa?e:Oa}function Fr(t,e){if(!zr(t))throw G(Wl);let r=t.constructor;if(r===void 0)return e;if(!zr(r))throw G(Ka);return r[ql]??e}function pr(t){if(ls(t))return!1;try{return ou(t,0,0),!1}catch{}return!0}function Wa(t,e){let r=bt(t),i=bt(e);if(r&&i)return 0;if(r)return 1;if(i||t<e)return-1;if(t>e)return 1;if(t===0&&e===0){let n=Ua(t,0),a=Ua(e,0);if(!n&&a)return-1;if(n&&!a)return 1}return 0}var An=2,Vr=new qr;function Pt(t){return Du(Vr,t)||!su(t)&&Pu(t)}function M(t){if(!Pt(t))throw G(Vl)}function Hr(t,e){let r=Pt(t),i=kr(t);if(!r&&!i)throw G(Yl);if(typeof e=="number"){let n;if(r){let a=x(t);n=P(a)}else n=P(t);if(n<e)throw G(Xl)}if(ln(t))throw G(an)}function x(t){let e=Gr(Vr,t);if(e!==void 0){let n=J(e);if(pr(n))throw G(mr);return e}let r=t.buffer;if(pr(r))throw G(mr);let i=fr(Je,[r,t.byteOffset,t.length],t.constructor);return Gr(Vr,i)}function Va(t){let e=P(t),r=[];for(let i=0;i<e;++i)r[i]=b(t[i]);return r}var gs=new ns;for(let t of ja($)){if(t===hn)continue;let e=Nt($,t);Le(e,"get")&&typeof e.get=="function"&&yu(gs,e.get)}var Lu=$l({get(t,e,r){return Br(e)&&Le(t,e)?b(en(t,e)):Cu(gs,eu(t,e))?en(t,e):en(t,e,r)},set(t,e,r,i){return Br(e)&&Le(t,e)?ba(t,e,_e(r)):ba(t,e,r,i)},getOwnPropertyDescriptor(t,e){if(Br(e)&&Le(t,e)){let r=Nt(t,e);return r.value=b(r.value),r}return Nt(t,e)},defineProperty(t,e,r){return Br(e)&&Le(t,e)&&Le(r,"value")&&(r.value=_e(r.value)),Zl(t,e,r)}}),Je=class t{constructor(e,r,i){let n;if(Pt(e))n=fr(fe,[x(e)],new.target);else if(zr(e)&&!Iu(e)){let s,o;if(kr(e)){s=e,o=P(e);let c=J(e);if(pr(c))throw G(mr);if(ln(e))throw G(an);let l=new Kr(o*An);n=fr(fe,[l],new.target)}else{let c=e[Ie];if(c!=null&&typeof c!="function")throw G(Pa);c!=null?za(e)?(s=e,o=e.length):(s=[...e],o=s.length):(s=e,o=rn(s.length)),n=fr(fe,[o],new.target)}for(let c=0;c<o;++c)n[c]=_e(s[c])}else n=fr(fe,arguments,new.target);let a=new Kl(n,Lu);return gn(Vr,a,n),a}static from(e,...r){let i=this;if(!sn(i,Wr))throw G(Ma);if(i===t){if(Pt(e)&&r.length===0){let u=x(e),h=new fe(J(u),dt(u),P(u));return new t(J(dr(h)))}if(r.length===0)return new t(J(Fa(e,_e)));let c=r[0],l=r[1];return new t(J(Fa(e,function(u,...h){return _e(le(c,this,[u,...Lr(h)]))},l)))}let n,a,s=e[Ie];if(s!=null&&typeof s!="function")throw G(Pa);if(s!=null)za(e)?(n=e,a=e.length):Mu(e)?(n=e,a=P(e)):(n=[...e],a=n.length);else{if(e==null)throw G(nn);n=Ot(e),a=rn(n.length)}let o=new i(a);if(r.length===0)for(let c=0;c<a;++c)o[c]=n[c];else{let c=r[0],l=r[1];for(let u=0;u<a;++u)o[u]=le(c,l,[n[u],u])}return o}static of(...e){let r=this;if(!sn(r,Wr))throw G(Ma);let i=e.length;if(r===t){let a=new t(i),s=x(a);for(let o=0;o<i;++o)s[o]=_e(e[o]);return a}let n=new r(i);for(let a=0;a<i;++a)n[a]=e[a];return n}keys(){M(this);let e=x(this);return du(e)}values(){M(this);let e=x(this);return Ha((function*(){for(let r of fu(e))yield b(r)})())}entries(){M(this);let e=x(this);return Ha((function*(){for(let[r,i]of mu(e))yield[r,b(i)]})())}at(e){M(this);let r=x(this),i=P(r),n=Ue(e),a=n>=0?n:i+n;if(!(a<0||a>=i))return b(r[a])}with(e,r){M(this);let i=x(this),n=P(i),a=Ue(e),s=a>=0?a:n+a,o=+r;if(s<0||s>=n)throw tn($i);let c=new fe(J(i),dt(i),P(i)),l=new t(J(dr(c))),u=x(l);return u[s]=_e(o),l}map(e,...r){M(this);let i=x(this),n=P(i),a=r[0],s=Fr(i,t);if(s===t){let c=new t(n),l=x(c);for(let u=0;u<n;++u){let h=b(i[u]);l[u]=_e(le(e,a,[h,u,this]))}return c}let o=new s(n);Hr(o,n);for(let c=0;c<n;++c){let l=b(i[c]);o[c]=le(e,a,[l,c,this])}return o}filter(e,...r){M(this);let i=x(this),n=P(i),a=r[0],s=[];for(let l=0;l<n;++l){let u=b(i[l]);le(e,a,[u,l,this])&&ru(s,u)}let o=Fr(i,t),c=new o(s);return Hr(c),c}reduce(e,...r){M(this);let i=x(this),n=P(i);if(n===0&&r.length===0)throw G(Na);let a,s;r.length===0?(a=b(i[0]),s=1):(a=r[0],s=0);for(let o=s;o<n;++o)a=e(a,b(i[o]),o,this);return a}reduceRight(e,...r){M(this);let i=x(this),n=P(i);if(n===0&&r.length===0)throw G(Na);let a,s;r.length===0?(a=b(i[n-1]),s=n-2):(a=r[0],s=n-1);for(let o=s;o>=0;--o)a=e(a,b(i[o]),o,this);return a}forEach(e,...r){M(this);let i=x(this),n=P(i),a=r[0];for(let s=0;s<n;++s)le(e,a,[b(i[s]),s,this])}find(e,...r){M(this);let i=x(this),n=P(i),a=r[0];for(let s=0;s<n;++s){let o=b(i[s]);if(le(e,a,[o,s,this]))return o}}findIndex(e,...r){M(this);let i=x(this),n=P(i),a=r[0];for(let s=0;s<n;++s){let o=b(i[s]);if(le(e,a,[o,s,this]))return s}return-1}findLast(e,...r){M(this);let i=x(this),n=P(i),a=r[0];for(let s=n-1;s>=0;--s){let o=b(i[s]);if(le(e,a,[o,s,this]))return o}}findLastIndex(e,...r){M(this);let i=x(this),n=P(i),a=r[0];for(let s=n-1;s>=0;--s){let o=b(i[s]);if(le(e,a,[o,s,this]))return s}return-1}every(e,...r){M(this);let i=x(this),n=P(i),a=r[0];for(let s=0;s<n;++s)if(!le(e,a,[b(i[s]),s,this]))return!1;return!0}some(e,...r){M(this);let i=x(this),n=P(i),a=r[0];for(let s=0;s<n;++s)if(le(e,a,[b(i[s]),s,this]))return!0;return!1}set(e,...r){M(this);let i=x(this),n=Ue(r[0]);if(n<0)throw tn($i);if(e==null)throw G(nn);if(ln(e))throw G(an);if(Pt(e))return pu(x(this),x(e),n);if(kr(e)){let c=J(e);if(pr(c))throw G(mr)}let a=P(i),s=Ot(e),o=rn(s.length);if(n===1/0||o+n>a)throw tn($i);for(let c=0;c<o;++c)i[c+n]=_e(s[c])}reverse(){M(this);let e=x(this);return La(e),this}toReversed(){M(this);let e=x(this),r=new fe(J(e),dt(e),P(e)),i=new t(J(dr(r))),n=x(i);return La(n),i}fill(e,...r){M(this);let i=x(this);return gu(i,_e(e),...Lr(r)),this}copyWithin(e,r,...i){M(this);let n=x(this);return vu(n,e,r,...Lr(i)),this}sort(e){M(this);let r=x(this),i=e!==void 0?e:Wa;return Ba(r,(n,a)=>i(b(n),b(a))),this}toSorted(e){M(this);let r=x(this);if(e!==void 0&&typeof e!="function")throw new G(Ql);let i=e!==void 0?e:Wa,n=new fe(J(r),dt(r),P(r)),a=new t(J(dr(n))),s=x(a);return Ba(s,(o,c)=>i(b(o),b(c))),a}slice(e,r){M(this);let i=x(this),n=Fr(i,t);if(n===t){let A=new fe(J(i),dt(i),P(i));return new t(J(dr(A,e,r)))}let a=P(i),s=Ue(e),o=r===void 0?a:Ue(r),c;s===-1/0?c=0:s<0?c=a+s>0?a+s:0:c=a<s?a:s;let l;o===-1/0?l=0:o<0?l=a+o>0?a+o:0:l=a<o?a:o;let u=l-c>0?l-c:0,h=new n(u);if(Hr(h,u),u===0)return h;let p=J(i);if(pr(p))throw G(mr);let v=0;for(;c<l;)h[v]=b(i[c]),++c,++v;return h}subarray(e,r){M(this);let i=x(this),n=Fr(i,t),a=new fe(J(i),dt(i),P(i)),s=Au(a,e,r),o=new n(J(s),dt(s),P(s));return Hr(o),o}indexOf(e,...r){M(this);let i=x(this),n=P(i),a=Ue(r[0]);if(a===1/0)return-1;a<0&&(a+=n,a<0&&(a=0));for(let s=a;s<n;++s)if(Le(i,s)&&b(i[s])===e)return s;return-1}lastIndexOf(e,...r){M(this);let i=x(this),n=P(i),a=r.length>=1?Ue(r[0]):n-1;if(a===-1/0)return-1;a>=0?a=a<n-1?a:n-1:a+=n;for(let s=a;s>=0;--s)if(Le(i,s)&&b(i[s])===e)return s;return-1}includes(e,...r){M(this);let i=x(this),n=P(i),a=Ue(r[0]);if(a===1/0)return!1;a<0&&(a+=n,a<0&&(a=0));let s=bt(e);for(let o=a;o<n;++o){let c=b(i[o]);if(s&&bt(c)||c===e)return!0}return!1}join(e){M(this);let r=x(this),i=Va(r);return tu(i,e)}toLocaleString(...e){M(this);let r=x(this),i=Va(r);return iu(i,...Lr(e))}get[hn](){if(Pt(this))return"Float16Array"}};Ar(Je,"BYTES_PER_ELEMENT",{value:An});Ar(Je,Wr,{});qa(Je,fn);var Yr=Je.prototype;Ar(Yr,"BYTES_PER_ELEMENT",{value:An});Ar(Yr,Ie,{value:Yr.values,writable:!0,configurable:!0});qa(Yr,$);var gr=we.clamp,BA=we.euclideanModulo,FA=we.inverseLerp,Tn=we.lerp,ge=we.degToRad,HA=we.radToDeg,GA=we.isPowerOfTwo,zA=we.ceilPowerOfTwo,kA=we.floorPowerOfTwo,WA=we.normalize;function vs(t,e,r,i=0,n=1){return we.mapLinear(t,e,r,i,n)}function As(t){return Math.min(Math.max(t,0),1)}function C(t){return(e,r)=>{e instanceof Xr?Object.defineProperty(e,r,{enumerable:!0,get(){var i;return((i=this.defines)==null?void 0:i[t])!=null},set(i){var n;i!==this[r]&&(i?(this.defines??={},this.defines[t]="1"):(n=this.defines)==null||delete n[t],this.needsUpdate=!0)}}):Object.defineProperty(e,r,{enumerable:!0,get(){return this.defines.has(t)},set(i){i!==this[r]&&(i?this.defines.set(t,"1"):this.defines.delete(t),this.setChanged())}})}}function Ya(t){return typeof t=="number"?Math.floor(t):typeof t=="string"?parseInt(t,10):typeof t=="boolean"?+t:0}function Be(t,{min:e=Number.MIN_SAFE_INTEGER,max:r=Number.MAX_SAFE_INTEGER}={}){return(i,n)=>{i instanceof Xr?Object.defineProperty(i,n,{enumerable:!0,get(){var s;let a=(s=this.defines)==null?void 0:s[t];return a!=null?Ya(a):0},set(a){let s=this[n];a!==s&&(this.defines??={},this.defines[t]=gr(a,e,r).toFixed(0),this.needsUpdate=!0)}}):Object.defineProperty(i,n,{enumerable:!0,get(){let a=this.defines.get(t);return a!=null?Ya(a):0},set(a){let s=this[n];a!==s&&(this.defines.set(t,gr(a,e,r).toFixed(0)),this.setChanged())}})}}function Xa(t){return typeof t=="number"?t:typeof t=="string"?parseFloat(t):typeof t=="boolean"?+t:0}function Jr(t,{min:e=-1/0,max:r=1/0,precision:i=7}={}){return(n,a)=>{n instanceof Xr?Object.defineProperty(n,a,{enumerable:!0,get(){var o;let s=(o=this.defines)==null?void 0:o[t];return s!=null?Xa(s):0},set(s){let o=this[a];s!==o&&(this.defines??={},this.defines[t]=gr(s,e,r).toFixed(i),this.needsUpdate=!0)}}):Object.defineProperty(n,a,{enumerable:!0,get(){let s=this.defines.get(t);return s!=null?Xa(s):0},set(s){let o=this[a];s!==o&&(this.defines.set(t,gr(s,e,r).toFixed(i)),this.setChanged())}})}}function Sn(t,{validate:e}={}){return(r,i)=>{r instanceof Xr?Object.defineProperty(r,i,{enumerable:!0,get(){var n;return(n=this.defines)==null?void 0:n[t]},set(n){if(n!==this[i]){if((e==null?void 0:e(n))===!1){console.error(`Expression validation failed: ${n}`);return}this.defines??={},this.defines[t]=n,this.needsUpdate=!0}}}):Object.defineProperty(r,i,{enumerable:!0,get(){return this.defines.get(t)},set(n){if(n!==this[i]){if((e==null?void 0:e(n))===!1){console.error(`Expression validation failed: ${n}`);return}this.defines.set(t,n),this.setChanged()}}})}}function En(t,...e){let r={};for(let i=0;i<e.length;i+=2){let n=e[i],a=e[i+1];for(let s of a)r[s]={enumerable:!0,get:()=>n[s],set:o=>{n[s]=o}}}return Object.defineProperties(t,r),t}function xn(t,e,r){let i={};for(let n of r)i[n]={enumerable:!0,get:()=>e.uniforms[n].value,set:a=>{e.uniforms[n].value=a}};return Object.defineProperties(t,i),t}var Qa=class Ts{constructor(e=0,r=0,i=0,n=0){this.west=e,this.south=r,this.east=i,this.north=n}get width(){let e=this.east;return e<this.west&&(e+=Math.PI*2),e-this.west}get height(){return this.north-this.south}set(e,r,i,n){return this.west=e,this.south=r,this.east=i,this.north=n,this}clone(){return new Ts(this.west,this.south,this.east,this.north)}copy(e){return this.west=e.west,this.south=e.south,this.east=e.east,this.north=e.north,this}equals(e){return e.west===this.west&&e.south===this.south&&e.east===this.east&&e.north===this.north}at(e,r,i=new ce){return i.set(this.west+(this.east-this.west)*e,this.north+(this.south-this.north)*r)}fromArray(e,r=0){return this.west=e[r],this.south=e[r+1],this.east=e[r+2],this.north=e[r+3],this}toArray(e=[],r=0){return e[r]=this.west,e[r+1]=this.south,e[r+2]=this.east,e[r+3]=this.north,e}*[Symbol.iterator](){yield this.west,yield this.south,yield this.east,yield this.north}};Qa.MAX=new Qa(ce.MIN_LONGITUDE,ce.MIN_LATITUDE,ce.MAX_LONGITUDE,ce.MAX_LATITUDE);var Bu=/^[ \t]*#include +"([\w\d./]+)"/gm;function k(t,e){return t.replace(Bu,(r,i)=>{let n=i.split("/").reduce((a,s)=>typeof a!="string"&&a!=null?a[s]:void 0,e);if(typeof n!="string")throw new Error(`Could not find include for ${i}.`);return k(n,e)})}var Fu=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*(?:i\s*\+\+|\+\+\s*i)\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hu(t,e,r,i){let n="";for(let a=parseInt(e,10);a<parseInt(r,10);++a)n+=i.replace(/\[\s*i\s*\]/g,`[${a}]`).replace(/UNROLLED_LOOP_INDEX/g,`${a}`);return n}function mt(t){return t.replace(Fu,Hu)}var Gu=`// Reference: https://github.com/mrdoob/three.js/blob/r171/examples/jsm/csm/CSMShader.js

#ifndef SHADOW_CASCADE_COUNT
#error "SHADOW_CASCADE_COUNT macro must be defined."
#endif // SHADOW_CASCADE_COUNT

int getCascadeIndex(
  const mat4 viewMatrix,
  const vec3 worldPosition,
  const vec2 intervals[SHADOW_CASCADE_COUNT],
  const float near,
  const float far
) {
  vec4 viewPosition = viewMatrix * vec4(worldPosition, 1.0);
  float depth = viewZToOrthographicDepth(viewPosition.z, near, far);
  vec2 interval;
  #pragma unroll_loop_start
  for (int i = 0; i < 4; ++i) {
    #if UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT
    interval = intervals[i];
    if (depth >= interval.x && depth < interval.y) {
      return UNROLLED_LOOP_INDEX;
    }
    #endif // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT
  }
  #pragma unroll_loop_end
  return SHADOW_CASCADE_COUNT - 1;
}

int getFadedCascadeIndex(
  const mat4 viewMatrix,
  const vec3 worldPosition,
  const vec2 intervals[SHADOW_CASCADE_COUNT],
  const float near,
  const float far,
  const float jitter
) {
  vec4 viewPosition = viewMatrix * vec4(worldPosition, 1.0);
  float depth = viewZToOrthographicDepth(viewPosition.z, near, far);

  vec2 interval;
  float intervalCenter;
  float closestEdge;
  float margin;
  int nextIndex = -1;
  int prevIndex = -1;
  float alpha;

  #pragma unroll_loop_start
  for (int i = 0; i < 4; ++i) {
    #if UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT
    interval = intervals[i];
    intervalCenter = (interval.x + interval.y) * 0.5;
    closestEdge = depth < intervalCenter ? interval.x : interval.y;
    margin = closestEdge * closestEdge * 0.5;
    interval += margin * vec2(-0.5, 0.5);

    #if UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT - 1
    if (depth >= interval.x && depth < interval.y) {
      prevIndex = nextIndex;
      nextIndex = UNROLLED_LOOP_INDEX;
      alpha = saturate(min(depth - interval.x, interval.y - depth) / margin);
    }
    #else // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT - 1
    // Don't fade out the last cascade.
    if (depth >= interval.x) {
      prevIndex = nextIndex;
      nextIndex = UNROLLED_LOOP_INDEX;
      alpha = saturate((depth - interval.x) / margin);
    }
    #endif // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT - 1
    #endif // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT
  }
  #pragma unroll_loop_end

  return jitter <= alpha
    ? nextIndex
    : prevIndex;
}
`,zu=`// cSpell:words logdepthbuf

#ifdef DEPTH_PACKING
float readDepthValue(const sampler2D depthBuffer, const vec2 uv) {
  #if DEPTH_PACKING == 3201
  return unpackRGBAToDepth(texture(depthBuffer, uv));
  #else // DEPTH_PACKING == 3201
  return texture(depthBuffer, uv).r;
  #endif // DEPTH_PACKING == 3201
}
#endif // DEPTH_PACKING

float reverseLogDepth(const float depth, const float near, const float far) {
  #if defined(USE_LOGDEPTHBUF) || defined(USE_LOGARITHMIC_DEPTH_BUFFER)
  float d = pow(2.0, depth * log2(far + 1.0)) - 1.0;
  float a = far / (far - near);
  float b = far * near / (near - far);
  return a + b / d;
  #else // defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(USE_LOGARITHMIC_DEPTH_BUFFER)
  return depth;
  #endif // defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(USE_LOGARITHMIC_DEPTH_BUFFER)
}

float linearizeDepth(const float depth, const float near, const float far) {
  float ndc = depth * 2.0 - 1.0;
  return 2.0 * near * far / (far + near - ndc * (far - near));
}
`,ku=`float checker(const vec2 uv, const vec2 repeats) {
  vec2 c = floor(repeats * uv);
  float result = mod(c.x + c.y, 2.0);
  return sign(result);
}

float checker(const vec2 uv, const float repeats) {
  return checker(uv, vec2(repeats));
}
`,Wu=`// Reference: https://advances.realtimerendering.com/s2014/index.html#_NEXT_GENERATION_POST

float interleavedGradientNoise(const vec2 coord) {
  const vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
  return fract(magic.z * fract(dot(coord, magic.xy)));
}
`,Vu=`#if !defined(saturate)
#define saturate(a) clamp(a, 0.0, 1.0)
#endif // !defined(saturate)

float remap(const float x, const float min1, const float max1, const float min2, const float max2) {
  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);
}

vec2 remap(const vec2 x, const vec2 min1, const vec2 max1, const vec2 min2, const vec2 max2) {
  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);
}

vec3 remap(const vec3 x, const vec3 min1, const vec3 max1, const vec3 min2, const vec3 max2) {
  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);
}

vec4 remap(const vec4 x, const vec4 min1, const vec4 max1, const vec4 min2, const vec4 max2) {
  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);
}

float remapClamped(
  const float x,
  const float min1,
  const float max1,
  const float min2,
  const float max2
) {
  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);
}

vec2 remapClamped(
  const vec2 x,
  const vec2 min1,
  const vec2 max1,
  const vec2 min2,
  const vec2 max2
) {
  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);
}

vec3 remapClamped(
  const vec3 x,
  const vec3 min1,
  const vec3 max1,
  const vec3 min2,
  const vec3 max2
) {
  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);
}

vec4 remapClamped(
  const vec4 x,
  const vec4 min1,
  const vec4 max1,
  const vec4 min2,
  const vec4 max2
) {
  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);
}

// Implicitly remap to 0 and 1
float remap(const float x, const float min1, const float max1) {
  return (x - min1) / (max1 - min1);
}

vec2 remap(const vec2 x, const vec2 min1, const vec2 max1) {
  return (x - min1) / (max1 - min1);
}

vec3 remap(const vec3 x, const vec3 min1, const vec3 max1) {
  return (x - min1) / (max1 - min1);
}

vec4 remap(const vec4 x, const vec4 min1, const vec4 max1) {
  return (x - min1) / (max1 - min1);
}

float remapClamped(const float x, const float min1, const float max1) {
  return saturate((x - min1) / (max1 - min1));
}

vec2 remapClamped(const vec2 x, const vec2 min1, const vec2 max1) {
  return saturate((x - min1) / (max1 - min1));
}

vec3 remapClamped(const vec3 x, const vec3 min1, const vec3 max1) {
  return saturate((x - min1) / (max1 - min1));
}

vec4 remapClamped(const vec4 x, const vec4 min1, const vec4 max1) {
  return saturate((x - min1) / (max1 - min1));
}
`,Yu=`// Reference: https://jcgt.org/published/0003/02/01/paper.pdf

vec2 signNotZero(vec2 v) {
  return vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);
}

vec2 packNormalToVec2(vec3 v) {
  vec2 p = v.xy * (1.0 / (abs(v.x) + abs(v.y) + abs(v.z)));
  return v.z <= 0.0
    ? (1.0 - abs(p.yx)) * signNotZero(p)
    : p;
}

vec3 unpackVec2ToNormal(vec2 e) {
  vec3 v = vec3(e.xy, 1.0 - abs(e.x) - abs(e.y));
  if (v.z < 0.0) {
    v.xy = (1.0 - abs(v.yx)) * signNotZero(v.xy);
  }
  return normalize(v);
}
`,Xu=`float raySphereFirstIntersection(
  const vec3 origin,
  const vec3 direction,
  const vec3 center,
  const float radius
) {
  vec3 a = origin - center;
  float b = 2.0 * dot(direction, a);
  float c = dot(a, a) - radius * radius;
  float discriminant = b * b - 4.0 * c;
  return discriminant < 0.0
    ? -1.0
    : (-b - sqrt(discriminant)) * 0.5;
}

float raySphereFirstIntersection(const vec3 origin, const vec3 direction, const float radius) {
  return raySphereFirstIntersection(origin, direction, vec3(0.0), radius);
}

vec4 raySphereFirstIntersection(
  const vec3 origin,
  const vec3 direction,
  const vec3 center,
  const vec4 radius
) {
  vec3 a = origin - center;
  float b = 2.0 * dot(direction, a);
  vec4 c = dot(a, a) - radius * radius;
  vec4 discriminant = b * b - 4.0 * c;
  vec4 mask = step(discriminant, vec4(0.0));
  return mix((-b - sqrt(max(vec4(0.0), discriminant))) * 0.5, vec4(-1.0), mask);
}

vec4 raySphereFirstIntersection(const vec3 origin, const vec3 direction, const vec4 radius) {
  return raySphereFirstIntersection(origin, direction, vec3(0.0), radius);
}

float raySphereSecondIntersection(
  const vec3 origin,
  const vec3 direction,
  const vec3 center,
  const float radius
) {
  vec3 a = origin - center;
  float b = 2.0 * dot(direction, a);
  float c = dot(a, a) - radius * radius;
  float discriminant = b * b - 4.0 * c;
  return discriminant < 0.0
    ? -1.0
    : (-b + sqrt(discriminant)) * 0.5;
}

float raySphereSecondIntersection(const vec3 origin, const vec3 direction, const float radius) {
  return raySphereSecondIntersection(origin, direction, vec3(0.0), radius);
}

vec4 raySphereSecondIntersection(
  const vec3 origin,
  const vec3 direction,
  const vec3 center,
  const vec4 radius
) {
  vec3 a = origin - center;
  float b = 2.0 * dot(direction, a);
  vec4 c = dot(a, a) - radius * radius;
  vec4 discriminant = b * b - 4.0 * c;
  vec4 mask = step(discriminant, vec4(0.0));
  return mix((-b + sqrt(max(vec4(0.0), discriminant))) * 0.5, vec4(-1.0), mask);
}

vec4 raySphereSecondIntersection(const vec3 origin, const vec3 direction, const vec4 radius) {
  return raySphereSecondIntersection(origin, direction, vec3(0.0), radius);
}

void raySphereIntersections(
  const vec3 origin,
  const vec3 direction,
  const vec3 center,
  const float radius,
  out float intersection1,
  out float intersection2
) {
  vec3 a = origin - center;
  float b = 2.0 * dot(direction, a);
  float c = dot(a, a) - radius * radius;
  float discriminant = b * b - 4.0 * c;
  if (discriminant < 0.0) {
    intersection1 = -1.0;
    intersection2 = -1.0;
    return;
  } else {
    float Q = sqrt(discriminant);
    intersection1 = (-b - Q) * 0.5;
    intersection2 = (-b + Q) * 0.5;
  }
}

void raySphereIntersections(
  const vec3 origin,
  const vec3 direction,
  const float radius,
  out float intersection1,
  out float intersection2
) {
  raySphereIntersections(origin, direction, vec3(0.0), radius, intersection1, intersection2);
}

void raySphereIntersections(
  const vec3 origin,
  const vec3 direction,
  const vec3 center,
  const vec4 radius,
  out vec4 intersection1,
  out vec4 intersection2
) {
  vec3 a = origin - center;
  float b = 2.0 * dot(direction, a);
  vec4 c = dot(a, a) - radius * radius;
  vec4 discriminant = b * b - 4.0 * c;
  vec4 mask = step(discriminant, vec4(0.0));
  vec4 Q = sqrt(max(vec4(0.0), discriminant));
  intersection1 = mix((-b - Q) * 0.5, vec4(-1.0), mask);
  intersection2 = mix((-b + Q) * 0.5, vec4(-1.0), mask);
}

void raySphereIntersections(
  const vec3 origin,
  const vec3 direction,
  const vec4 radius,
  out vec4 intersection1,
  out vec4 intersection2
) {
  raySphereIntersections(origin, direction, vec3(0.0), radius, intersection1, intersection2);
}
`,Qu=`vec3 screenToView(
  const vec2 uv,
  const float depth,
  const float viewZ,
  const mat4 projectionMatrix,
  const mat4 inverseProjectionMatrix
) {
  vec4 clip = vec4(vec3(uv, depth) * 2.0 - 1.0, 1.0);
  float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];
  clip *= clipW;
  return (inverseProjectionMatrix * clip).xyz;
}
`,Zu=`// A fifth-order polynomial approximation of Turbo color map.
// See: https://observablehq.com/@mbostock/turbo
// prettier-ignore
vec3 turbo(const float x) {
  float r = 0.1357 + x * (4.5974 - x * (42.3277 - x * (130.5887 - x * (150.5666 - x * 58.1375))));
  float g = 0.0914 + x * (2.1856 + x * (4.8052 - x * (14.0195 - x * (4.2109 + x * 2.7747))));
  float b = 0.1067 + x * (12.5925 - x * (60.1097 - x * (109.0745 - x * (88.5066 - x * 26.8183))));
  return vec3(r, g, b);
}
`,Ku=`// Reference: https://www.gamedev.net/tutorials/programming/graphics/contact-hardening-soft-shadows-made-fast-r4906/

vec2 vogelDisk(const int index, const int sampleCount, const float phi) {
  const float goldenAngle = 2.39996322972865332;
  float r = sqrt(float(index) + 0.5) / sqrt(float(sampleCount));
  float theta = float(index) * goldenAngle + phi;
  return r * vec2(cos(theta), sin(theta));
}
`,$r=Gu,ei=zu,Ss=ku,ti=Wu,Me=Vu,Es=Yu,Bt=Xu,xs=Qu,wn=Zu,ri=Ku;import{Matrix3 as QA,Vector3 as ju}from"three";var ys="eac103980f20c0956f2d3215833e73514be08462",qu=`https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ys}/packages/atmosphere/assets`,Ju=`https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ys}/packages/atmosphere/assets/stars.bin`,pt=64,gt=16,Ft=32,Ht=128,Gt=32,zt=8,$e=zt*Gt,et=Ht,tt=Ft,vt=256,At=64,kt=1/1e3;var $u=new ju;function Wt(t,e,r,i){let n=r.projectOnSurface(t,$u);return n!=null?r.getOsculatingSphereCenter(n,e,i).negate():i.setScalar(0)}var eh=!0,ws="Invariant failed";function Cs(t,e){if(!t){if(eh)throw new Error(ws);var r=ws;throw new Error(r)}}var yn=typeof window<"u"&&window.requestIdleCallback!=null?window.requestIdleCallback:function(t,e={}){let r=e.timeout??1,i=performance.now();return setTimeout(()=>{t({get didTimeout(){return e.timeout!=null?!1:performance.now()-i-1>r},timeRemaining(){return Math.max(0,1+(performance.now()-i))}})},1)};var ve=`// Based on: https://github.com/ebruneton/precomputed_atmospheric_scattering/blob/master/atmosphere/functions.glsl

/**
 * Copyright (c) 2017 Eric Bruneton
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holders nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Precomputed Atmospheric Scattering
 * Copyright (c) 2008 INRIA
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holders nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

Number ClampCosine(const Number mu) {
  return clamp(mu, Number(-1.0), Number(1.0));
}

Length ClampDistance(const Length d) {
  return max(d, 0.0 * m);
}

Length ClampRadius(const AtmosphereParameters atmosphere, const Length r) {
  return clamp(r, atmosphere.bottom_radius, atmosphere.top_radius);
}

Length SafeSqrt(const Area a) {
  return sqrt(max(a, 0.0 * m2));
}

Length DistanceToTopAtmosphereBoundary(const AtmosphereParameters atmosphere,
    const Length r, const Number mu) {
  assert(r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  Area discriminant = r * r * (mu * mu - 1.0) +
      atmosphere.top_radius * atmosphere.top_radius;
  return ClampDistance(-r * mu + SafeSqrt(discriminant));
}

Length DistanceToBottomAtmosphereBoundary(const AtmosphereParameters atmosphere,
    const Length r, const Number mu) {
  assert(r >= atmosphere.bottom_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  Area discriminant = r * r * (mu * mu - 1.0) +
      atmosphere.bottom_radius * atmosphere.bottom_radius;
  return ClampDistance(-r * mu - SafeSqrt(discriminant));
}

bool RayIntersectsGround(const AtmosphereParameters atmosphere,
    const Length r, const Number mu) {
  assert(r >= atmosphere.bottom_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  return mu < 0.0 && r * r * (mu * mu - 1.0) +
      atmosphere.bottom_radius * atmosphere.bottom_radius >= 0.0 * m2;
}

Number GetTextureCoordFromUnitRange(const Number x, const int texture_size) {
  return 0.5 / Number(texture_size) + x * (1.0 - 1.0 / Number(texture_size));
}

vec2 GetTransmittanceTextureUvFromRMu(const AtmosphereParameters atmosphere,
    const Length r, const Number mu) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  // Distance to top atmosphere boundary for a horizontal ray at ground level.
  Length H = sqrt(atmosphere.top_radius * atmosphere.top_radius -
      atmosphere.bottom_radius * atmosphere.bottom_radius);
  // Distance to the horizon.
  Length rho =
      SafeSqrt(r * r - atmosphere.bottom_radius * atmosphere.bottom_radius);
  // Distance to the top atmosphere boundary for the ray (r,mu), and its minimum
  // and maximum values over all mu - obtained for (r,1) and (r,mu_horizon).
  Length d = DistanceToTopAtmosphereBoundary(atmosphere, r, mu);
  Length d_min = atmosphere.top_radius - r;
  Length d_max = rho + H;
  Number x_mu = (d - d_min) / (d_max - d_min);
  Number x_r = rho / H;
  return vec2(GetTextureCoordFromUnitRange(x_mu, TRANSMITTANCE_TEXTURE_WIDTH),
              GetTextureCoordFromUnitRange(x_r, TRANSMITTANCE_TEXTURE_HEIGHT));
}

DimensionlessSpectrum GetTransmittanceToTopAtmosphereBoundary(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const Length r, const Number mu) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  vec2 uv = GetTransmittanceTextureUvFromRMu(atmosphere, r, mu);
  // @shotamatsuda: Added for the precomputation stage in half-float precision.
  #ifdef TRANSMITTANCE_PRECISION_LOG
  // Manually interpolate the transmittance instead of the optical depth.
  const vec2 size = vec2(TRANSMITTANCE_TEXTURE_WIDTH, TRANSMITTANCE_TEXTURE_HEIGHT);
  const vec3 texel_size = vec3(1.0 / size, 0.0);
  vec2 coord = (uv * size) - 0.5;
  vec2 i = (floor(coord) + 0.5) * texel_size.xy;
  vec2 f = fract(coord);
  vec4 t1 = exp(-texture(transmittance_texture, i));
  vec4 t2 = exp(-texture(transmittance_texture, i + texel_size.xz));
  vec4 t3 = exp(-texture(transmittance_texture, i + texel_size.zy));
  vec4 t4 = exp(-texture(transmittance_texture, i + texel_size.xy));
  return DimensionlessSpectrum(mix(mix(t1, t2, f.x), mix(t3, t4, f.x), f.y));
  #else // TRANSMITTANCE_PRECISION_LOG
  return DimensionlessSpectrum(texture(transmittance_texture, uv));
  #endif // TRANSMITTANCE_PRECISION_LOG
}

DimensionlessSpectrum GetTransmittance(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const Length r, const Number mu, const Length d,
    const bool ray_r_mu_intersects_ground) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  assert(d >= 0.0 * m);

  Length r_d = ClampRadius(atmosphere, sqrt(d * d + 2.0 * r * mu * d + r * r));
  Number mu_d = ClampCosine((r * mu + d) / r_d);

  if (ray_r_mu_intersects_ground) {
    return min(
        GetTransmittanceToTopAtmosphereBoundary(
            atmosphere, transmittance_texture, r_d, -mu_d) /
        GetTransmittanceToTopAtmosphereBoundary(
            atmosphere, transmittance_texture, r, -mu),
        DimensionlessSpectrum(1.0));
  } else {
    return min(
        GetTransmittanceToTopAtmosphereBoundary(
            atmosphere, transmittance_texture, r, mu) /
        GetTransmittanceToTopAtmosphereBoundary(
            atmosphere, transmittance_texture, r_d, mu_d),
        DimensionlessSpectrum(1.0));
  }
}

DimensionlessSpectrum GetTransmittanceToSun(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const Length r, const Number mu_s) {
  Number sin_theta_h = atmosphere.bottom_radius / r;
  Number cos_theta_h = -sqrt(max(1.0 - sin_theta_h * sin_theta_h, 0.0));
  return GetTransmittanceToTopAtmosphereBoundary(
          atmosphere, transmittance_texture, r, mu_s) *
      smoothstep(-sin_theta_h * atmosphere.sun_angular_radius / rad,
                 sin_theta_h * atmosphere.sun_angular_radius / rad,
                 mu_s - cos_theta_h);
}

InverseSolidAngle RayleighPhaseFunction(const Number nu) {
  InverseSolidAngle k = 3.0 / (16.0 * PI * sr);
  return k * (1.0 + nu * nu);
}

InverseSolidAngle MiePhaseFunction(const Number g, const Number nu) {
  InverseSolidAngle k = 3.0 / (8.0 * PI * sr) * (1.0 - g * g) / (2.0 + g * g);
  return k * (1.0 + nu * nu) / pow(1.0 + g * g - 2.0 * g * nu, 1.5);
}

vec4 GetScatteringTextureUvwzFromRMuMuSNu(const AtmosphereParameters atmosphere,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const bool ray_r_mu_intersects_ground) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  assert(mu_s >= -1.0 && mu_s <= 1.0);
  assert(nu >= -1.0 && nu <= 1.0);

  // Distance to top atmosphere boundary for a horizontal ray at ground level.
  Length H = sqrt(atmosphere.top_radius * atmosphere.top_radius -
      atmosphere.bottom_radius * atmosphere.bottom_radius);
  // Distance to the horizon.
  Length rho =
      SafeSqrt(r * r - atmosphere.bottom_radius * atmosphere.bottom_radius);
  Number u_r = GetTextureCoordFromUnitRange(rho / H, SCATTERING_TEXTURE_R_SIZE);

  // Discriminant of the quadratic equation for the intersections of the ray
  // (r,mu) with the ground (see RayIntersectsGround).
  Length r_mu = r * mu;
  Area discriminant =
      r_mu * r_mu - r * r + atmosphere.bottom_radius * atmosphere.bottom_radius;
  Number u_mu;
  if (ray_r_mu_intersects_ground) {
    // Distance to the ground for the ray (r,mu), and its minimum and maximum
    // values over all mu - obtained for (r,-1) and (r,mu_horizon).
    Length d = -r_mu - SafeSqrt(discriminant);
    Length d_min = r - atmosphere.bottom_radius;
    Length d_max = rho;
    u_mu = 0.5 - 0.5 * GetTextureCoordFromUnitRange(d_max == d_min ? 0.0 :
        (d - d_min) / (d_max - d_min), SCATTERING_TEXTURE_MU_SIZE / 2);
  } else {
    // Distance to the top atmosphere boundary for the ray (r,mu), and its
    // minimum and maximum values over all mu - obtained for (r,1) and
    // (r,mu_horizon).
    Length d = -r_mu + SafeSqrt(discriminant + H * H);
    Length d_min = atmosphere.top_radius - r;
    Length d_max = rho + H;
    u_mu = 0.5 + 0.5 * GetTextureCoordFromUnitRange(
        (d - d_min) / (d_max - d_min), SCATTERING_TEXTURE_MU_SIZE / 2);
  }

  Length d = DistanceToTopAtmosphereBoundary(
      atmosphere, atmosphere.bottom_radius, mu_s);
  Length d_min = atmosphere.top_radius - atmosphere.bottom_radius;
  Length d_max = H;
  Number a = (d - d_min) / (d_max - d_min);
  Length D = DistanceToTopAtmosphereBoundary(
      atmosphere, atmosphere.bottom_radius, atmosphere.mu_s_min);
  Number A = (D - d_min) / (d_max - d_min);
  // An ad-hoc function equal to 0 for mu_s = mu_s_min (because then d = D and
  // thus a = A), equal to 1 for mu_s = 1 (because then d = d_min and thus
  // a = 0), and with a large slope around mu_s = 0, to get more texture
  // samples near the horizon.
  Number u_mu_s = GetTextureCoordFromUnitRange(
      max(1.0 - a / A, 0.0) / (1.0 + a), SCATTERING_TEXTURE_MU_S_SIZE);

  Number u_nu = (nu + 1.0) / 2.0;
  return vec4(u_nu, u_mu_s, u_mu, u_r);
}

vec2 GetIrradianceTextureUvFromRMuS(const AtmosphereParameters atmosphere,
    const Length r, const Number mu_s) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu_s >= -1.0 && mu_s <= 1.0);
  Number x_r = (r - atmosphere.bottom_radius) /
      (atmosphere.top_radius - atmosphere.bottom_radius);
  Number x_mu_s = mu_s * 0.5 + 0.5;
  return vec2(GetTextureCoordFromUnitRange(x_mu_s, IRRADIANCE_TEXTURE_WIDTH),
              GetTextureCoordFromUnitRange(x_r, IRRADIANCE_TEXTURE_HEIGHT));
}

IrradianceSpectrum GetIrradiance(
    const AtmosphereParameters atmosphere,
    const IrradianceTexture irradiance_texture,
    const Length r, const Number mu_s) {
  vec2 uv = GetIrradianceTextureUvFromRMuS(atmosphere, r, mu_s);
  return IrradianceSpectrum(texture(irradiance_texture, uv));
}
`,Ae=`// Based on: https://github.com/ebruneton/precomputed_atmospheric_scattering/blob/master/atmosphere/definitions.glsl

/**
 * Copyright (c) 2017 Eric Bruneton
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holders nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

#define assert(x)

#define Length float
#define Wavelength float
#define Angle float
#define SolidAngle float
#define Power float
#define LuminousPower float

#define Number float
#define InverseLength float
#define Area float
#define Volume float
#define NumberDensity float
#define Irradiance float
#define Radiance float
#define SpectralPower float
#define SpectralIrradiance float
#define SpectralRadiance float
#define SpectralRadianceDensity float
#define ScatteringCoefficient float
#define InverseSolidAngle float
#define LuminousIntensity float
#define Luminance float
#define Illuminance float

// A generic function from Wavelength to some other type.
#define AbstractSpectrum vec3
// A function from Wavelength to Number.
#define DimensionlessSpectrum vec3
// A function from Wavelength to SpectralPower.
#define PowerSpectrum vec3
// A function from Wavelength to SpectralIrradiance.
#define IrradianceSpectrum vec3
// A function from Wavelength to SpectralRadiance.
#define RadianceSpectrum vec3
// A function from Wavelength to SpectralRadianceDensity.
#define RadianceDensitySpectrum vec3
// A function from Wavelength to ScatteringCoefficient.
#define ScatteringSpectrum vec3

// A position in 3D (3 length values).
#define Position vec3
// A unit direction vector in 3D (3 unit-less values).
#define Direction vec3
// A vector of 3 luminance values.
#define Luminance3 vec3
// A vector of 3 illuminance values.
#define Illuminance3 vec3

#define TransmittanceTexture sampler2D
#define AbstractScatteringTexture sampler3D
#define ReducedScatteringTexture sampler3D
#define ScatteringTexture sampler3D
#define ScatteringDensityTexture sampler3D
#define IrradianceTexture sampler2D

const Length m = 1.0;
const Wavelength nm = 1.0;
const Angle rad = 1.0;
const SolidAngle sr = 1.0;
const Power watt = 1.0;
const LuminousPower lm = 1.0;

#if !defined(PI)
const float PI = 3.14159265358979323846;
#endif // !defined(PI)

const Length km = 1000.0 * m;
const Area m2 = m * m;
const Volume m3 = m * m * m;
const Angle pi = PI * rad;
const Angle deg = pi / 180.0;
const Irradiance watt_per_square_meter = watt / m2;
const Radiance watt_per_square_meter_per_sr = watt / (m2 * sr);
const SpectralIrradiance watt_per_square_meter_per_nm = watt / (m2 * nm);
const SpectralRadiance watt_per_square_meter_per_sr_per_nm = watt / (m2 * sr * nm);
const SpectralRadianceDensity watt_per_cubic_meter_per_sr_per_nm = watt / (m3 * sr * nm);
const LuminousIntensity cd = lm / sr;
const LuminousIntensity kcd = 1000.0 * cd;
const Luminance cd_per_square_meter = cd / m2;
const Luminance kcd_per_square_meter = kcd / m2;

struct DensityProfileLayer {
  Length width;
  Number exp_term;
  InverseLength exp_scale;
  InverseLength linear_term;
  Number constant_term;
};

struct DensityProfile {
  DensityProfileLayer layers[2];
};

// See AtmosphereParameter.ts for further details.
struct AtmosphereParameters {
  IrradianceSpectrum solar_irradiance;
  Angle sun_angular_radius;
  Length bottom_radius;
  Length top_radius;
  DensityProfile rayleigh_density;
  ScatteringSpectrum rayleigh_scattering;
  DensityProfile mie_density;
  ScatteringSpectrum mie_scattering;
  ScatteringSpectrum mie_extinction;
  Number mie_phase_function_g;
  DensityProfile absorption_density;
  ScatteringSpectrum absorption_extinction;
  DimensionlessSpectrum ground_albedo;
  Number mu_s_min;
};
`,Vt=`// Based on: https://github.com/ebruneton/precomputed_atmospheric_scattering/blob/master/atmosphere/functions.glsl

/**
 * Copyright (c) 2017 Eric Bruneton
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holders nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Precomputed Atmospheric Scattering
 * Copyright (c) 2008 INRIA
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holders nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifdef COMBINED_SCATTERING_TEXTURES
vec3 GetExtrapolatedSingleMieScattering(
    const AtmosphereParameters atmosphere, const vec4 scattering) {
  // Algebraically this can never be negative, but rounding errors can produce
  // that effect for sufficiently short view rays.
  // @shotamatsuda: Avoid division by infinitesimal values.
  // See https://github.com/takram-design-engineering/three-geospatial/issues/47
  if (scattering.r < 1e-5) {
    return vec3(0.0);
  }
  return scattering.rgb * scattering.a / scattering.r *
	    (atmosphere.rayleigh_scattering.r / atmosphere.mie_scattering.r) *
	    (atmosphere.mie_scattering / atmosphere.rayleigh_scattering);
}
#endif // COMBINED_SCATTERING_TEXTURES

IrradianceSpectrum GetCombinedScattering(
    const AtmosphereParameters atmosphere,
    const ReducedScatteringTexture scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const bool ray_r_mu_intersects_ground,
    out IrradianceSpectrum single_mie_scattering) {
  vec4 uvwz = GetScatteringTextureUvwzFromRMuMuSNu(
      atmosphere, r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  Number tex_coord_x = uvwz.x * Number(SCATTERING_TEXTURE_NU_SIZE - 1);
  Number tex_x = floor(tex_coord_x);
  Number lerp = tex_coord_x - tex_x;
  vec3 uvw0 = vec3((tex_x + uvwz.y) / Number(SCATTERING_TEXTURE_NU_SIZE),
      uvwz.z, uvwz.w);
  vec3 uvw1 = vec3((tex_x + 1.0 + uvwz.y) / Number(SCATTERING_TEXTURE_NU_SIZE),
      uvwz.z, uvwz.w);
#ifdef COMBINED_SCATTERING_TEXTURES
  vec4 combined_scattering =
      texture(scattering_texture, uvw0) * (1.0 - lerp) +
      texture(scattering_texture, uvw1) * lerp;
  IrradianceSpectrum scattering = IrradianceSpectrum(combined_scattering);
  single_mie_scattering =
      GetExtrapolatedSingleMieScattering(atmosphere, combined_scattering);
#else // COMBINED_SCATTERING_TEXTURES
  IrradianceSpectrum scattering = IrradianceSpectrum(
      texture(scattering_texture, uvw0) * (1.0 - lerp) +
      texture(scattering_texture, uvw1) * lerp);
  single_mie_scattering = IrradianceSpectrum(
      texture(single_mie_scattering_texture, uvw0) * (1.0 - lerp) +
      texture(single_mie_scattering_texture, uvw1) * lerp);
#endif // COMBINED_SCATTERING_TEXTURES
  return scattering;
}

// @shotamatsuda: Added for reading higher-order scattering texture.
#ifdef HAS_HIGHER_ORDER_SCATTERING_TEXTURE
IrradianceSpectrum GetScattering(
    const AtmosphereParameters atmosphere,
    const ReducedScatteringTexture scattering_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const bool ray_r_mu_intersects_ground) {
  vec4 uvwz = GetScatteringTextureUvwzFromRMuMuSNu(
      atmosphere, r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  Number tex_coord_x = uvwz.x * Number(SCATTERING_TEXTURE_NU_SIZE - 1);
  Number tex_x = floor(tex_coord_x);
  Number lerp = tex_coord_x - tex_x;
  vec3 uvw0 = vec3((tex_x + uvwz.y) / Number(SCATTERING_TEXTURE_NU_SIZE),
      uvwz.z, uvwz.w);
  vec3 uvw1 = vec3((tex_x + 1.0 + uvwz.y) / Number(SCATTERING_TEXTURE_NU_SIZE),
      uvwz.z, uvwz.w);
  IrradianceSpectrum scattering = IrradianceSpectrum(
      texture(scattering_texture, uvw0) * (1.0 - lerp) +
      texture(scattering_texture, uvw1) * lerp);
  return scattering;
}
#endif // HAS_HIGHER_ORDER_SCATTERING_TEXTURE

RadianceSpectrum GetSkyRadiance(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const ReducedScatteringTexture scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    Position camera, const Direction view_ray, const Length shadow_length,
    const Direction sun_direction,
    out DimensionlessSpectrum transmittance) {
  // Compute the distance to the top atmosphere boundary along the view ray,
  // assuming the viewer is in space (or NaN if the view ray does not intersect
  // the atmosphere).
  Length r = length(camera);
  Length rmu = dot(camera, view_ray);
  // @shotamatsuda: Use SafeSqrt instead.
  // See: https://github.com/takram-design-engineering/three-geospatial/pull/26
  Length distance_to_top_atmosphere_boundary = -rmu -
      SafeSqrt(rmu * rmu - r * r +
          atmosphere.top_radius * atmosphere.top_radius);
  // If the viewer is in space and the view ray intersects the atmosphere, move
  // the viewer to the top atmosphere boundary (along the view ray):
  if (distance_to_top_atmosphere_boundary > 0.0 * m) {
    camera = camera + view_ray * distance_to_top_atmosphere_boundary;
    r = atmosphere.top_radius;
    rmu += distance_to_top_atmosphere_boundary;
  } else if (r > atmosphere.top_radius) {
    // If the view ray does not intersect the atmosphere, simply return 0.
    transmittance = DimensionlessSpectrum(1.0);
    return RadianceSpectrum(0.0 * watt_per_square_meter_per_sr_per_nm);
  }
  // Compute the r, mu, mu_s and nu parameters needed for the texture lookups.
  Number mu = rmu / r;
  Number mu_s = dot(camera, sun_direction) / r;
  Number nu = dot(view_ray, sun_direction);

  // @shotamatsuda: For rendering points below the bottom atmosphere.
  #ifdef GROUND
  bool ray_r_mu_intersects_ground = RayIntersectsGround(atmosphere, r, mu);
  #else // GROUND
  bool ray_r_mu_intersects_ground = false;
  #endif // GROUND

  transmittance = ray_r_mu_intersects_ground ? DimensionlessSpectrum(0.0) :
      GetTransmittanceToTopAtmosphereBoundary(
          atmosphere, transmittance_texture, r, mu);
  IrradianceSpectrum single_mie_scattering;
  IrradianceSpectrum scattering;
  if (shadow_length == 0.0 * m) {
    scattering = GetCombinedScattering(
        atmosphere, scattering_texture, single_mie_scattering_texture,
        r, mu, mu_s, nu, ray_r_mu_intersects_ground,
        single_mie_scattering);
  } else {
    // Case of light shafts (shadow_length is the total length noted l in our
    // paper): we omit the scattering between the camera and the point at
    // distance l, by implementing Eq. (18) of the paper (shadow_transmittance
    // is the T(x,x_s) term, scattering is the S|x_s=x+lv term).
    Length d = shadow_length;
    Length r_p =
        ClampRadius(atmosphere, sqrt(d * d + 2.0 * r * mu * d + r * r));
    Number mu_p = (r * mu + d) / r_p;
    Number mu_s_p = (r * mu_s + d * nu) / r_p;

    scattering = GetCombinedScattering(
        atmosphere, scattering_texture, single_mie_scattering_texture,
        r_p, mu_p, mu_s_p, nu, ray_r_mu_intersects_ground,
        single_mie_scattering);
    DimensionlessSpectrum shadow_transmittance =
        GetTransmittance(atmosphere, transmittance_texture,
            r, mu, shadow_length, ray_r_mu_intersects_ground);
    // @shotamatsuda: Occlude only single Rayleigh scattering by the shadow.
#ifdef HAS_HIGHER_ORDER_SCATTERING_TEXTURE
    IrradianceSpectrum higher_order_scattering = GetScattering(
        atmosphere, higher_order_scattering_texture,
        r_p, mu_p, mu_s_p, nu, ray_r_mu_intersects_ground);
    IrradianceSpectrum single_scattering = scattering - higher_order_scattering;
    scattering = single_scattering * shadow_transmittance + higher_order_scattering;
#else // HAS_HIGHER_ORDER_SCATTERING_TEXTURE
    scattering = scattering * shadow_transmittance;
#endif // HAS_HIGHER_ORDER_SCATTERING_TEXTURE
    single_mie_scattering = single_mie_scattering * shadow_transmittance;
  }
  return scattering * RayleighPhaseFunction(nu) + single_mie_scattering *
      MiePhaseFunction(atmosphere.mie_phase_function_g, nu);
}

// @shotamatsuda: Returns the point on the ray closest to the origin.
vec3 ClosestPointOnRay(const Position camera, const Position point) {
  Position ray = point - camera;
  Number t = clamp(-dot(camera, ray) / dot(ray, ray), 0.0, 1.0);
  return camera + t * ray;
}

vec2 RaySphereIntersections(
    const Position camera, const Direction direction, const Length radius) {
  float b = 2.0 * dot(direction, camera);
  float c = dot(camera, camera) - radius * radius;
  float discriminant = b * b - 4.0 * c;
  float Q = sqrt(discriminant);
  return vec2(-b - Q, -b + Q) * 0.5;
}

// @shotamatsuda: Clip the view ray at the bottom atmosphere boundary.
bool ClipAtBottomAtmosphere(
    const AtmosphereParameters atmosphere,
    const Direction view_ray, inout Position camera, inout Position point) {
  const Length eps = 0.0;
  Length bottom_radius = atmosphere.bottom_radius + eps;
  Length r_camera = length(camera);
  Length r_point = length(point);
  bool camera_below = r_camera < bottom_radius;
  bool point_below = r_point < bottom_radius;

  vec2 t = RaySphereIntersections(camera, view_ray, bottom_radius);
  Position intersection = camera + view_ray * (camera_below ? t.y : t.x);
  camera = camera_below ? intersection : camera;
  point = point_below ? intersection : point;

  return camera_below && point_below;
}

RadianceSpectrum GetSkyRadianceToPoint(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const ReducedScatteringTexture scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    Position camera, Position point, const Length shadow_length,
    const Direction sun_direction, out DimensionlessSpectrum transmittance) {
  // @shotamatsuda: Avoid artifacts when the ray does not intersect the top
  // atmosphere boundary.
  if (length(ClosestPointOnRay(camera, point)) > atmosphere.top_radius) {
    transmittance = vec3(1.0);
    return vec3(0.0);
  }

  Direction view_ray = normalize(point - camera);
  if (ClipAtBottomAtmosphere(atmosphere, view_ray, camera, point)) {
    transmittance = vec3(1.0);
    return vec3(0.0);
  }

  // Compute the distance to the top atmosphere boundary along the view ray,
  // assuming the viewer is in space (or NaN if the view ray does not intersect
  // the atmosphere).
  Length r = length(camera);
  Length rmu = dot(camera, view_ray);
  // @shotamatsuda: Use SafeSqrt instead.
  // See: https://github.com/takram-design-engineering/three-geospatial/pull/26
  Length distance_to_top_atmosphere_boundary = -rmu -
      SafeSqrt(rmu * rmu - r * r +
          atmosphere.top_radius * atmosphere.top_radius);
  // If the viewer is in space and the view ray intersects the atmosphere, move
  // the viewer to the top atmosphere boundary (along the view ray):
  if (distance_to_top_atmosphere_boundary > 0.0 * m) {
    camera = camera + view_ray * distance_to_top_atmosphere_boundary;
    r = atmosphere.top_radius;
    rmu += distance_to_top_atmosphere_boundary;
  }

  // Compute the r, mu, mu_s and nu parameters for the first texture lookup.
  Number mu = rmu / r;
  Number mu_s = dot(camera, sun_direction) / r;
  Number nu = dot(view_ray, sun_direction);
  Length d = length(point - camera);
  bool ray_r_mu_intersects_ground = RayIntersectsGround(atmosphere, r, mu);

  // @shotamatsuda: Hack to avoid rendering artifacts near the horizon, due to
  // finite atmosphere texture resolution and finite floating point precision.
  // See: https://github.com/ebruneton/precomputed_atmospheric_scattering/pull/32
  if (!ray_r_mu_intersects_ground) {
    Number mu_horizon = -SafeSqrt(1.0 -
        (atmosphere.bottom_radius * atmosphere.bottom_radius) / (r * r));
    const Number eps = 0.004;
    mu = max(mu, mu_horizon + eps);
  }

  transmittance = GetTransmittance(atmosphere, transmittance_texture,
      r, mu, d, ray_r_mu_intersects_ground);

  IrradianceSpectrum single_mie_scattering;
  IrradianceSpectrum scattering = GetCombinedScattering(
      atmosphere, scattering_texture, single_mie_scattering_texture,
      r, mu, mu_s, nu, ray_r_mu_intersects_ground,
      single_mie_scattering);

  // Compute the r, mu, mu_s and nu parameters for the second texture lookup.
  // If shadow_length is not 0 (case of light shafts), we want to ignore the
  // scattering along the last shadow_length meters of the view ray, which we
  // do by subtracting shadow_length from d (this way scattering_p is equal to
  // the S|x_s=x_0-lv term in Eq. (17) of our paper).
  d = max(d - shadow_length, 0.0 * m);
  Length r_p = ClampRadius(atmosphere, sqrt(d * d + 2.0 * r * mu * d + r * r));
  Number mu_p = (r * mu + d) / r_p;
  Number mu_s_p = (r * mu_s + d * nu) / r_p;

  IrradianceSpectrum single_mie_scattering_p;
  IrradianceSpectrum scattering_p = GetCombinedScattering(
      atmosphere, scattering_texture, single_mie_scattering_texture,
      r_p, mu_p, mu_s_p, nu, ray_r_mu_intersects_ground,
      single_mie_scattering_p);

  // Combine the lookup results to get the scattering between camera and point.
  DimensionlessSpectrum shadow_transmittance = transmittance;
  if (shadow_length > 0.0 * m) {
    // This is the T(x,x_s) term in Eq. (17) of our paper, for light shafts.
    shadow_transmittance = GetTransmittance(atmosphere, transmittance_texture,
        r, mu, d, ray_r_mu_intersects_ground);
  }
  // @shotamatsuda: Occlude only single Rayleigh scattering by the shadow.
#ifdef HAS_HIGHER_ORDER_SCATTERING_TEXTURE
  IrradianceSpectrum higher_order_scattering = GetScattering(
      atmosphere, higher_order_scattering_texture,
      r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  IrradianceSpectrum single_scattering = scattering - higher_order_scattering;
  IrradianceSpectrum higher_order_scattering_p = GetScattering(
      atmosphere, higher_order_scattering_texture,
      r_p, mu_p, mu_s_p, nu, ray_r_mu_intersects_ground);
  IrradianceSpectrum single_scattering_p =
      scattering_p - higher_order_scattering_p;
  scattering =
      single_scattering - shadow_transmittance * single_scattering_p +
      higher_order_scattering - transmittance * higher_order_scattering_p;
#else // HAS_HIGHER_ORDER_SCATTERING_TEXTURE
  scattering = scattering - shadow_transmittance * scattering_p;
#endif // HAS_HIGHER_ORDER_SCATTERING_TEXTURE

  single_mie_scattering =
      single_mie_scattering - shadow_transmittance * single_mie_scattering_p;
#ifdef COMBINED_SCATTERING_TEXTURES
  single_mie_scattering = GetExtrapolatedSingleMieScattering(
      atmosphere, vec4(scattering, single_mie_scattering.r));
#endif // COMBINED_SCATTERING_TEXTURES

  // Hack to avoid rendering artifacts when the sun is below the horizon.
  single_mie_scattering = single_mie_scattering *
      smoothstep(Number(0.0), Number(0.01), mu_s);

  return scattering * RayleighPhaseFunction(nu) + single_mie_scattering *
      MiePhaseFunction(atmosphere.mie_phase_function_g, nu);
}

IrradianceSpectrum GetSunAndSkyIrradiance(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const IrradianceTexture irradiance_texture,
    const Position point, const Direction normal, const Direction sun_direction,
    out IrradianceSpectrum sky_irradiance) {
  Length r = length(point);
  Number mu_s = dot(point, sun_direction) / r;

  // Indirect irradiance (approximated if the surface is not horizontal).
  sky_irradiance = GetIrradiance(atmosphere, irradiance_texture, r, mu_s) *
      (1.0 + dot(normal, point) / r) * 0.5;

  // Direct irradiance.
  return atmosphere.solar_irradiance *
      GetTransmittanceToSun(
          atmosphere, transmittance_texture, r, mu_s) *
      max(dot(normal, sun_direction), 0.0);
}

// @shotamatsuda: Added for the clouds.
IrradianceSpectrum GetSunAndSkyScalarIrradiance(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const IrradianceTexture irradiance_texture,
    const Position point, const Direction sun_direction,
    out IrradianceSpectrum sky_irradiance) {
  Length r = length(point);
  Number mu_s = dot(point, sun_direction) / r;

  // Indirect irradiance. Integral over sphere yields 2\u03C0.
  sky_irradiance = GetIrradiance(atmosphere, irradiance_texture, r, mu_s) *
      2.0 * PI;

  // Direct irradiance. Omit the cosine term.
  return atmosphere.solar_irradiance *
      GetTransmittanceToSun(atmosphere, transmittance_texture, r, mu_s);
}

Luminance3 GetSolarLuminance() {
  return ATMOSPHERE.solar_irradiance /
      (PI * ATMOSPHERE.sun_angular_radius * ATMOSPHERE.sun_angular_radius) *
      SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
}

Luminance3 GetSkyLuminance(
    const Position camera, Direction view_ray, const Length shadow_length,
    const Direction sun_direction, out DimensionlessSpectrum transmittance) {
  return GetSkyRadiance(ATMOSPHERE, transmittance_texture,
      scattering_texture, single_mie_scattering_texture,
      camera, view_ray, shadow_length, sun_direction,
      transmittance) * SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;
}

Luminance3 GetSkyLuminanceToPoint(
    const Position camera, const Position point, const Length shadow_length,
    const Direction sun_direction, out DimensionlessSpectrum transmittance) {
  return GetSkyRadianceToPoint(ATMOSPHERE, transmittance_texture,
      scattering_texture, single_mie_scattering_texture,
      camera, point, shadow_length, sun_direction, transmittance) *
      SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;
}

Illuminance3 GetSunAndSkyIlluminance(
    const Position p, const Direction normal, const Direction sun_direction,
    out IrradianceSpectrum sky_irradiance) {
  IrradianceSpectrum sun_irradiance = GetSunAndSkyIrradiance(
      ATMOSPHERE, transmittance_texture, irradiance_texture, p, normal,
      sun_direction, sky_irradiance);
  sky_irradiance *= SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;
  return sun_irradiance * SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
}

// @shotamatsuda: Added for the clouds.
Illuminance3 GetSunAndSkyScalarIlluminance(
    const Position p, const Direction sun_direction,
    out IrradianceSpectrum sky_irradiance) {
  IrradianceSpectrum sun_irradiance = GetSunAndSkyScalarIrradiance(
      ATMOSPHERE, transmittance_texture, irradiance_texture, p,
      sun_direction, sky_irradiance);
  sky_irradiance *= SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;
  return sun_irradiance * SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
}

#define GetSolarRadiance GetSolarLuminance
#define GetSkyRadiance GetSkyLuminance
#define GetSkyRadianceToPoint GetSkyLuminanceToPoint
#define GetSunAndSkyIrradiance GetSunAndSkyIlluminance
#define GetSunAndSkyScalarIrradiance GetSunAndSkyScalarIlluminance
`,rt=`// Based on: https://github.com/ebruneton/precomputed_atmospheric_scattering/blob/master/atmosphere/functions.glsl

/**
 * Copyright (c) 2017 Eric Bruneton
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holders nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Precomputed Atmospheric Scattering
 * Copyright (c) 2008 INRIA
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holders nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 */

Number GetLayerDensity(const DensityProfileLayer layer, const Length altitude) {
  Number density = layer.exp_term * exp(layer.exp_scale * altitude) +
      layer.linear_term * altitude + layer.constant_term;
  return clamp(density, Number(0.0), Number(1.0));
}

Number GetProfileDensity(const DensityProfile profile, const Length altitude) {
  DensityProfileLayer layers[2] = profile.layers;
  return altitude < layers[0].width
    ? GetLayerDensity(layers[0], altitude)
    : GetLayerDensity(layers[1], altitude);
}

Length ComputeOpticalLengthToTopAtmosphereBoundary(
    const AtmosphereParameters atmosphere, const DensityProfile profile,
    const Length r, const Number mu) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  // Number of intervals for the numerical integration.
  const int SAMPLE_COUNT = 500;
  // The integration step, i.e. the length of each integration interval.
  Length dx =
      DistanceToTopAtmosphereBoundary(atmosphere, r, mu) / Number(SAMPLE_COUNT);
  // Integration loop.
  Length result = 0.0 * m;
  for (int i = 0; i <= SAMPLE_COUNT; ++i) {
    Length d_i = Number(i) * dx;
    // Distance between the current sample point and the planet center.
    Length r_i = sqrt(d_i * d_i + 2.0 * r * mu * d_i + r * r);
    // Number density at the current sample point (divided by the number density
    // at the bottom of the atmosphere, yielding a dimensionless number).
    Number y_i = GetProfileDensity(profile, r_i - atmosphere.bottom_radius);
    // Sample weight (from the trapezoidal rule).
    Number weight_i = i == 0 || i == SAMPLE_COUNT ? 0.5 : 1.0;
    result += y_i * weight_i * dx;
  }
  return result;
}

DimensionlessSpectrum ComputeTransmittanceToTopAtmosphereBoundary(
    const AtmosphereParameters atmosphere, const Length r, const Number mu) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  vec3 optical_depth = (
      atmosphere.rayleigh_scattering *
          ComputeOpticalLengthToTopAtmosphereBoundary(
              atmosphere, atmosphere.rayleigh_density, r, mu) +
      atmosphere.mie_extinction *
          ComputeOpticalLengthToTopAtmosphereBoundary(
              atmosphere, atmosphere.mie_density, r, mu) +
      atmosphere.absorption_extinction *
          ComputeOpticalLengthToTopAtmosphereBoundary(
              atmosphere, atmosphere.absorption_density, r, mu));
  // @shotamatsuda: Added for the precomputation stage in half-float precision.
  #ifdef TRANSMITTANCE_PRECISION_LOG
  return optical_depth;
  #else // TRANSMITTANCE_PRECISION_LOG
  return exp(-optical_depth);
  #endif // TRANSMITTANCE_PRECISION_LOG
}

Number GetUnitRangeFromTextureCoord(const Number u, const int texture_size) {
  return (u - 0.5 / Number(texture_size)) / (1.0 - 1.0 / Number(texture_size));
}

void GetRMuFromTransmittanceTextureUv(const AtmosphereParameters atmosphere,
    const vec2 uv, out Length r, out Number mu) {
  assert(uv.x >= 0.0 && uv.x <= 1.0);
  assert(uv.y >= 0.0 && uv.y <= 1.0);
  Number x_mu = GetUnitRangeFromTextureCoord(uv.x, TRANSMITTANCE_TEXTURE_WIDTH);
  Number x_r = GetUnitRangeFromTextureCoord(uv.y, TRANSMITTANCE_TEXTURE_HEIGHT);
  // Distance to top atmosphere boundary for a horizontal ray at ground level.
  Length H = sqrt(atmosphere.top_radius * atmosphere.top_radius -
      atmosphere.bottom_radius * atmosphere.bottom_radius);
  // Distance to the horizon, from which we can compute r:
  Length rho = H * x_r;
  r = sqrt(rho * rho + atmosphere.bottom_radius * atmosphere.bottom_radius);
  // Distance to the top atmosphere boundary for the ray (r,mu), and its minimum
  // and maximum values over all mu - obtained for (r,1) and (r,mu_horizon) -
  // from which we can recover mu:
  Length d_min = atmosphere.top_radius - r;
  Length d_max = rho + H;
  Length d = d_min + x_mu * (d_max - d_min);
  mu = d == 0.0 * m ? Number(1.0) : (H * H - rho * rho - d * d) / (2.0 * r * d);
  mu = ClampCosine(mu);
}

DimensionlessSpectrum ComputeTransmittanceToTopAtmosphereBoundaryTexture(
    const AtmosphereParameters atmosphere, const vec2 frag_coord) {
  const vec2 TRANSMITTANCE_TEXTURE_SIZE =
      vec2(TRANSMITTANCE_TEXTURE_WIDTH, TRANSMITTANCE_TEXTURE_HEIGHT);
  Length r;
  Number mu;
  GetRMuFromTransmittanceTextureUv(
      atmosphere, frag_coord / TRANSMITTANCE_TEXTURE_SIZE, r, mu);
  return ComputeTransmittanceToTopAtmosphereBoundary(atmosphere, r, mu);
}

void ComputeSingleScatteringIntegrand(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const Length d, const bool ray_r_mu_intersects_ground,
    out DimensionlessSpectrum rayleigh, out DimensionlessSpectrum mie) {
  Length r_d = ClampRadius(atmosphere, sqrt(d * d + 2.0 * r * mu * d + r * r));
  Number mu_s_d = ClampCosine((r * mu_s + d * nu) / r_d);
  DimensionlessSpectrum transmittance =
      GetTransmittance(
          atmosphere, transmittance_texture, r, mu, d,
          ray_r_mu_intersects_ground) *
      GetTransmittanceToSun(
          atmosphere, transmittance_texture, r_d, mu_s_d);
  rayleigh = transmittance * GetProfileDensity(
      atmosphere.rayleigh_density, r_d - atmosphere.bottom_radius);
  mie = transmittance * GetProfileDensity(
      atmosphere.mie_density, r_d - atmosphere.bottom_radius);
}

Length DistanceToNearestAtmosphereBoundary(const AtmosphereParameters atmosphere,
    Length r, Number mu, bool ray_r_mu_intersects_ground) {
  if (ray_r_mu_intersects_ground) {
    return DistanceToBottomAtmosphereBoundary(atmosphere, r, mu);
  } else {
    return DistanceToTopAtmosphereBoundary(atmosphere, r, mu);
  }
}

void ComputeSingleScattering(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const bool ray_r_mu_intersects_ground,
    out IrradianceSpectrum rayleigh, out IrradianceSpectrum mie) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  assert(mu_s >= -1.0 && mu_s <= 1.0);
  assert(nu >= -1.0 && nu <= 1.0);

  // Number of intervals for the numerical integration.
  const int SAMPLE_COUNT = 50;
  // The integration step, i.e. the length of each integration interval.
  Length dx =
      DistanceToNearestAtmosphereBoundary(atmosphere, r, mu,
          ray_r_mu_intersects_ground) / Number(SAMPLE_COUNT);
  // Integration loop.
  DimensionlessSpectrum rayleigh_sum = DimensionlessSpectrum(0.0);
  DimensionlessSpectrum mie_sum = DimensionlessSpectrum(0.0);
  for (int i = 0; i <= SAMPLE_COUNT; ++i) {
    Length d_i = Number(i) * dx;
    // The Rayleigh and Mie single scattering at the current sample point.
    DimensionlessSpectrum rayleigh_i;
    DimensionlessSpectrum mie_i;
    ComputeSingleScatteringIntegrand(atmosphere, transmittance_texture,
        r, mu, mu_s, nu, d_i, ray_r_mu_intersects_ground, rayleigh_i, mie_i);
    // Sample weight (from the trapezoidal rule).
    Number weight_i = (i == 0 || i == SAMPLE_COUNT) ? 0.5 : 1.0;
    rayleigh_sum += rayleigh_i * weight_i;
    mie_sum += mie_i * weight_i;
  }
  rayleigh = rayleigh_sum * dx * atmosphere.solar_irradiance *
      atmosphere.rayleigh_scattering;
  mie = mie_sum * dx * atmosphere.solar_irradiance * atmosphere.mie_scattering;
}

void GetRMuMuSNuFromScatteringTextureUvwz(const AtmosphereParameters atmosphere,
    const vec4 uvwz, out Length r, out Number mu, out Number mu_s,
    out Number nu, out bool ray_r_mu_intersects_ground) {
  assert(uvwz.x >= 0.0 && uvwz.x <= 1.0);
  assert(uvwz.y >= 0.0 && uvwz.y <= 1.0);
  assert(uvwz.z >= 0.0 && uvwz.z <= 1.0);
  assert(uvwz.w >= 0.0 && uvwz.w <= 1.0);

  // Distance to top atmosphere boundary for a horizontal ray at ground level.
  Length H = sqrt(atmosphere.top_radius * atmosphere.top_radius -
      atmosphere.bottom_radius * atmosphere.bottom_radius);
  // Distance to the horizon.
  Length rho =
      H * GetUnitRangeFromTextureCoord(uvwz.w, SCATTERING_TEXTURE_R_SIZE);
  r = sqrt(rho * rho + atmosphere.bottom_radius * atmosphere.bottom_radius);

  if (uvwz.z < 0.5) {
    // Distance to the ground for the ray (r,mu), and its minimum and maximum
    // values over all mu - obtained for (r,-1) and (r,mu_horizon) - from which
    // we can recover mu:
    Length d_min = r - atmosphere.bottom_radius;
    Length d_max = rho;
    Length d = d_min + (d_max - d_min) * GetUnitRangeFromTextureCoord(
        1.0 - 2.0 * uvwz.z, SCATTERING_TEXTURE_MU_SIZE / 2);
    mu = d == 0.0 * m ? Number(-1.0) :
        ClampCosine(-(rho * rho + d * d) / (2.0 * r * d));
    ray_r_mu_intersects_ground = true;
  } else {
    // Distance to the top atmosphere boundary for the ray (r,mu), and its
    // minimum and maximum values over all mu - obtained for (r,1) and
    // (r,mu_horizon) - from which we can recover mu:
    Length d_min = atmosphere.top_radius - r;
    Length d_max = rho + H;
    Length d = d_min + (d_max - d_min) * GetUnitRangeFromTextureCoord(
        2.0 * uvwz.z - 1.0, SCATTERING_TEXTURE_MU_SIZE / 2);
    mu = d == 0.0 * m ? Number(1.0) :
        ClampCosine((H * H - rho * rho - d * d) / (2.0 * r * d));
    ray_r_mu_intersects_ground = false;
  }

  Number x_mu_s =
      GetUnitRangeFromTextureCoord(uvwz.y, SCATTERING_TEXTURE_MU_S_SIZE);
  Length d_min = atmosphere.top_radius - atmosphere.bottom_radius;
  Length d_max = H;
  Length D = DistanceToTopAtmosphereBoundary(
      atmosphere, atmosphere.bottom_radius, atmosphere.mu_s_min);
  Number A = (D - d_min) / (d_max - d_min);
  Number a = (A - x_mu_s * A) / (1.0 + x_mu_s * A);
  Length d = d_min + min(a, A) * (d_max - d_min);
  mu_s = d == 0.0 * m ? Number(1.0) :
     ClampCosine((H * H - d * d) / (2.0 * atmosphere.bottom_radius * d));

  nu = ClampCosine(uvwz.x * 2.0 - 1.0);
}

void GetRMuMuSNuFromScatteringTextureFragCoord(
    const AtmosphereParameters atmosphere, const vec3 frag_coord,
    out Length r, out Number mu, out Number mu_s, out Number nu,
    out bool ray_r_mu_intersects_ground) {
  const vec4 SCATTERING_TEXTURE_SIZE = vec4(
      SCATTERING_TEXTURE_NU_SIZE - 1,
      SCATTERING_TEXTURE_MU_S_SIZE,
      SCATTERING_TEXTURE_MU_SIZE,
      SCATTERING_TEXTURE_R_SIZE);
  Number frag_coord_nu =
      floor(frag_coord.x / Number(SCATTERING_TEXTURE_MU_S_SIZE));
  Number frag_coord_mu_s =
      mod(frag_coord.x, Number(SCATTERING_TEXTURE_MU_S_SIZE));
  vec4 uvwz =
      vec4(frag_coord_nu, frag_coord_mu_s, frag_coord.y, frag_coord.z) /
          SCATTERING_TEXTURE_SIZE;
  GetRMuMuSNuFromScatteringTextureUvwz(
      atmosphere, uvwz, r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  // Clamp nu to its valid range of values, given mu and mu_s.
  nu = clamp(nu, mu * mu_s - sqrt((1.0 - mu * mu) * (1.0 - mu_s * mu_s)),
      mu * mu_s + sqrt((1.0 - mu * mu) * (1.0 - mu_s * mu_s)));
}

void ComputeSingleScatteringTexture(const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture, const vec3 frag_coord,
    out IrradianceSpectrum rayleigh, out IrradianceSpectrum mie) {
  Length r;
  Number mu;
  Number mu_s;
  Number nu;
  bool ray_r_mu_intersects_ground;
  GetRMuMuSNuFromScatteringTextureFragCoord(atmosphere, frag_coord,
      r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  ComputeSingleScattering(atmosphere, transmittance_texture,
      r, mu, mu_s, nu, ray_r_mu_intersects_ground, rayleigh, mie);
}

AbstractSpectrum GetScattering(
    const AtmosphereParameters atmosphere,
    const AbstractScatteringTexture scattering_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const bool ray_r_mu_intersects_ground) {
  vec4 uvwz = GetScatteringTextureUvwzFromRMuMuSNu(
      atmosphere, r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  Number tex_coord_x = uvwz.x * Number(SCATTERING_TEXTURE_NU_SIZE - 1);
  Number tex_x = floor(tex_coord_x);
  Number lerp = tex_coord_x - tex_x;
  vec3 uvw0 = vec3((tex_x + uvwz.y) / Number(SCATTERING_TEXTURE_NU_SIZE),
      uvwz.z, uvwz.w);
  vec3 uvw1 = vec3((tex_x + 1.0 + uvwz.y) / Number(SCATTERING_TEXTURE_NU_SIZE),
      uvwz.z, uvwz.w);
  return AbstractSpectrum(texture(scattering_texture, uvw0) * (1.0 - lerp) +
      texture(scattering_texture, uvw1) * lerp);
}

RadianceSpectrum GetScattering(
    const AtmosphereParameters atmosphere,
    const ReducedScatteringTexture single_rayleigh_scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    const ScatteringTexture multiple_scattering_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const bool ray_r_mu_intersects_ground,
    const int scattering_order) {
  if (scattering_order == 1) {
    IrradianceSpectrum rayleigh = GetScattering(
        atmosphere, single_rayleigh_scattering_texture, r, mu, mu_s, nu,
        ray_r_mu_intersects_ground);
    IrradianceSpectrum mie = GetScattering(
        atmosphere, single_mie_scattering_texture, r, mu, mu_s, nu,
        ray_r_mu_intersects_ground);
    return rayleigh * RayleighPhaseFunction(nu) +
        mie * MiePhaseFunction(atmosphere.mie_phase_function_g, nu);
  } else {
    return GetScattering(
        atmosphere, multiple_scattering_texture, r, mu, mu_s, nu,
        ray_r_mu_intersects_ground);
  }
}

IrradianceSpectrum GetIrradiance(
    const AtmosphereParameters atmosphere,
    const IrradianceTexture irradiance_texture,
    const Length r, const Number mu_s);

RadianceDensitySpectrum ComputeScatteringDensity(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const ReducedScatteringTexture single_rayleigh_scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    const ScatteringTexture multiple_scattering_texture,
    const IrradianceTexture irradiance_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const int scattering_order) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  assert(mu_s >= -1.0 && mu_s <= 1.0);
  assert(nu >= -1.0 && nu <= 1.0);
  assert(scattering_order >= 2);

  // Compute unit direction vectors for the zenith, the view direction omega and
  // and the sun direction omega_s, such that the cosine of the view-zenith
  // angle is mu, the cosine of the sun-zenith angle is mu_s, and the cosine of
  // the view-sun angle is nu. The goal is to simplify computations below.
  vec3 zenith_direction = vec3(0.0, 0.0, 1.0);
  vec3 omega = vec3(sqrt(1.0 - mu * mu), 0.0, mu);
  Number sun_dir_x = omega.x == 0.0 ? 0.0 : (nu - mu * mu_s) / omega.x;
  Number sun_dir_y = sqrt(max(1.0 - sun_dir_x * sun_dir_x - mu_s * mu_s, 0.0));
  vec3 omega_s = vec3(sun_dir_x, sun_dir_y, mu_s);

  const int SAMPLE_COUNT = 16;
  const Angle dphi = pi / Number(SAMPLE_COUNT);
  const Angle dtheta = pi / Number(SAMPLE_COUNT);
  RadianceDensitySpectrum rayleigh_mie =
      RadianceDensitySpectrum(0.0 * watt_per_cubic_meter_per_sr_per_nm);

  // Nested loops for the integral over all the incident directions omega_i.
  for (int l = 0; l < SAMPLE_COUNT; ++l) {
    Angle theta = (Number(l) + 0.5) * dtheta;
    Number cos_theta = cos(theta);
    Number sin_theta = sin(theta);
    bool ray_r_theta_intersects_ground =
        RayIntersectsGround(atmosphere, r, cos_theta);

    // The distance and transmittance to the ground only depend on theta, so we
    // can compute them in the outer loop for efficiency.
    Length distance_to_ground = 0.0 * m;
    DimensionlessSpectrum transmittance_to_ground = DimensionlessSpectrum(0.0);
    DimensionlessSpectrum ground_albedo = DimensionlessSpectrum(0.0);
    if (ray_r_theta_intersects_ground) {
      distance_to_ground =
          DistanceToBottomAtmosphereBoundary(atmosphere, r, cos_theta);
      transmittance_to_ground =
          GetTransmittance(atmosphere, transmittance_texture, r, cos_theta,
              distance_to_ground, true /* ray_intersects_ground */);
      ground_albedo = atmosphere.ground_albedo;
    }

    for (int m = 0; m < 2 * SAMPLE_COUNT; ++m) {
      Angle phi = (Number(m) + 0.5) * dphi;
      vec3 omega_i =
          vec3(cos(phi) * sin_theta, sin(phi) * sin_theta, cos_theta);
      SolidAngle domega_i = (dtheta / rad) * (dphi / rad) * sin(theta) * sr;

      // The radiance L_i arriving from direction omega_i after n-1 bounces is
      // the sum of a term given by the precomputed scattering texture for the
      // (n-1)-th order:
      Number nu1 = dot(omega_s, omega_i);
      RadianceSpectrum incident_radiance = GetScattering(atmosphere,
          single_rayleigh_scattering_texture, single_mie_scattering_texture,
          multiple_scattering_texture, r, omega_i.z, mu_s, nu1,
          ray_r_theta_intersects_ground, scattering_order - 1);

      // and of the contribution from the light paths with n-1 bounces and whose
      // last bounce is on the ground. This contribution is the product of the
      // transmittance to the ground, the ground albedo, the ground BRDF, and
      // the irradiance received on the ground after n-2 bounces.
      vec3 ground_normal =
          normalize(zenith_direction * r + omega_i * distance_to_ground);
      IrradianceSpectrum ground_irradiance = GetIrradiance(
          atmosphere, irradiance_texture, atmosphere.bottom_radius,
          dot(ground_normal, omega_s));
      incident_radiance += transmittance_to_ground *
          ground_albedo * (1.0 / (PI * sr)) * ground_irradiance;

      // The radiance finally scattered from direction omega_i towards direction
      // -omega is the product of the incident radiance, the scattering
      // coefficient, and the phase function for directions omega and omega_i
      // (all this summed over all particle types, i.e. Rayleigh and Mie).
      Number nu2 = dot(omega, omega_i);
      Number rayleigh_density = GetProfileDensity(
          atmosphere.rayleigh_density, r - atmosphere.bottom_radius);
      Number mie_density = GetProfileDensity(
          atmosphere.mie_density, r - atmosphere.bottom_radius);
      rayleigh_mie += incident_radiance * (
          atmosphere.rayleigh_scattering * rayleigh_density *
              RayleighPhaseFunction(nu2) +
          atmosphere.mie_scattering * mie_density *
              MiePhaseFunction(atmosphere.mie_phase_function_g, nu2)) *
          domega_i;
    }
  }
  return rayleigh_mie;
}

RadianceSpectrum ComputeMultipleScattering(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const ScatteringDensityTexture scattering_density_texture,
    const Length r, const Number mu, const Number mu_s, const Number nu,
    const bool ray_r_mu_intersects_ground) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu >= -1.0 && mu <= 1.0);
  assert(mu_s >= -1.0 && mu_s <= 1.0);
  assert(nu >= -1.0 && nu <= 1.0);

  // Number of intervals for the numerical integration.
  const int SAMPLE_COUNT = 50;
  // The integration step, i.e. the length of each integration interval.
  Length dx =
      DistanceToNearestAtmosphereBoundary(
          atmosphere, r, mu, ray_r_mu_intersects_ground) /
              Number(SAMPLE_COUNT);
  // Integration loop.
  RadianceSpectrum rayleigh_mie_sum =
      RadianceSpectrum(0.0 * watt_per_square_meter_per_sr_per_nm);
  for (int i = 0; i <= SAMPLE_COUNT; ++i) {
    Length d_i = Number(i) * dx;

    // The r, mu and mu_s parameters at the current integration point (see the
    // single scattering section for a detailed explanation).
    Length r_i =
        ClampRadius(atmosphere, sqrt(d_i * d_i + 2.0 * r * mu * d_i + r * r));
    Number mu_i = ClampCosine((r * mu + d_i) / r_i);
    Number mu_s_i = ClampCosine((r * mu_s + d_i * nu) / r_i);

    // The Rayleigh and Mie multiple scattering at the current sample point.
    RadianceSpectrum rayleigh_mie_i =
        GetScattering(
            atmosphere, scattering_density_texture, r_i, mu_i, mu_s_i, nu,
            ray_r_mu_intersects_ground) *
        GetTransmittance(
            atmosphere, transmittance_texture, r, mu, d_i,
            ray_r_mu_intersects_ground) *
        dx;
    // Sample weight (from the trapezoidal rule).
    Number weight_i = (i == 0 || i == SAMPLE_COUNT) ? 0.5 : 1.0;
    rayleigh_mie_sum += rayleigh_mie_i * weight_i;
  }
  return rayleigh_mie_sum;
}

RadianceDensitySpectrum ComputeScatteringDensityTexture(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const ReducedScatteringTexture single_rayleigh_scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    const ScatteringTexture multiple_scattering_texture,
    const IrradianceTexture irradiance_texture,
    const vec3 frag_coord, const int scattering_order) {
  Length r;
  Number mu;
  Number mu_s;
  Number nu;
  bool ray_r_mu_intersects_ground;
  GetRMuMuSNuFromScatteringTextureFragCoord(atmosphere, frag_coord,
      r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  return ComputeScatteringDensity(atmosphere, transmittance_texture,
      single_rayleigh_scattering_texture, single_mie_scattering_texture,
      multiple_scattering_texture, irradiance_texture, r, mu, mu_s, nu,
      scattering_order);
}

RadianceSpectrum ComputeMultipleScatteringTexture(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const ScatteringDensityTexture scattering_density_texture,
    const vec3 frag_coord, out Number nu) {
  Length r;
  Number mu;
  Number mu_s;
  bool ray_r_mu_intersects_ground;
  GetRMuMuSNuFromScatteringTextureFragCoord(atmosphere, frag_coord,
      r, mu, mu_s, nu, ray_r_mu_intersects_ground);
  return ComputeMultipleScattering(atmosphere, transmittance_texture,
      scattering_density_texture, r, mu, mu_s, nu,
      ray_r_mu_intersects_ground);
}

IrradianceSpectrum ComputeDirectIrradiance(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const Length r, const Number mu_s) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu_s >= -1.0 && mu_s <= 1.0);

  Number alpha_s = atmosphere.sun_angular_radius / rad;
  // Approximate average of the cosine factor mu_s over the visible fraction of
  // the Sun disc.
  Number average_cosine_factor =
    mu_s < -alpha_s ? 0.0 : (mu_s > alpha_s ? mu_s :
        (mu_s + alpha_s) * (mu_s + alpha_s) / (4.0 * alpha_s));

  return atmosphere.solar_irradiance *
      GetTransmittanceToTopAtmosphereBoundary(
          atmosphere, transmittance_texture, r, mu_s) * average_cosine_factor;

}

IrradianceSpectrum ComputeIndirectIrradiance(
    const AtmosphereParameters atmosphere,
    const ReducedScatteringTexture single_rayleigh_scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    const ScatteringTexture multiple_scattering_texture,
    const Length r, const Number mu_s, const int scattering_order) {
  assert(r >= atmosphere.bottom_radius && r <= atmosphere.top_radius);
  assert(mu_s >= -1.0 && mu_s <= 1.0);
  assert(scattering_order >= 1);

  const int SAMPLE_COUNT = 32;
  const Angle dphi = pi / Number(SAMPLE_COUNT);
  const Angle dtheta = pi / Number(SAMPLE_COUNT);

  IrradianceSpectrum result =
      IrradianceSpectrum(0.0 * watt_per_square_meter_per_nm);
  vec3 omega_s = vec3(sqrt(1.0 - mu_s * mu_s), 0.0, mu_s);
  for (int j = 0; j < SAMPLE_COUNT / 2; ++j) {
    Angle theta = (Number(j) + 0.5) * dtheta;
    for (int i = 0; i < 2 * SAMPLE_COUNT; ++i) {
      Angle phi = (Number(i) + 0.5) * dphi;
      vec3 omega =
          vec3(cos(phi) * sin(theta), sin(phi) * sin(theta), cos(theta));
      SolidAngle domega = (dtheta / rad) * (dphi / rad) * sin(theta) * sr;

      Number nu = dot(omega, omega_s);
      result += GetScattering(atmosphere, single_rayleigh_scattering_texture,
          single_mie_scattering_texture, multiple_scattering_texture,
          r, omega.z, mu_s, nu, false /* ray_r_theta_intersects_ground */,
          scattering_order) *
              omega.z * domega;
    }
  }
  return result;
}

void GetRMuSFromIrradianceTextureUv(const AtmosphereParameters atmosphere,
    const vec2 uv, out Length r, out Number mu_s) {
  assert(uv.x >= 0.0 && uv.x <= 1.0);
  assert(uv.y >= 0.0 && uv.y <= 1.0);
  Number x_mu_s = GetUnitRangeFromTextureCoord(uv.x, IRRADIANCE_TEXTURE_WIDTH);
  Number x_r = GetUnitRangeFromTextureCoord(uv.y, IRRADIANCE_TEXTURE_HEIGHT);
  r = atmosphere.bottom_radius +
      x_r * (atmosphere.top_radius - atmosphere.bottom_radius);
  mu_s = ClampCosine(2.0 * x_mu_s - 1.0);
}

const vec2 IRRADIANCE_TEXTURE_SIZE =
    vec2(IRRADIANCE_TEXTURE_WIDTH, IRRADIANCE_TEXTURE_HEIGHT);

IrradianceSpectrum ComputeDirectIrradianceTexture(
    const AtmosphereParameters atmosphere,
    const TransmittanceTexture transmittance_texture,
    const vec2 frag_coord) {
  Length r;
  Number mu_s;
  GetRMuSFromIrradianceTextureUv(
      atmosphere, frag_coord / IRRADIANCE_TEXTURE_SIZE, r, mu_s);
  return ComputeDirectIrradiance(atmosphere, transmittance_texture, r, mu_s);
}

IrradianceSpectrum ComputeIndirectIrradianceTexture(
    const AtmosphereParameters atmosphere,
    const ReducedScatteringTexture single_rayleigh_scattering_texture,
    const ReducedScatteringTexture single_mie_scattering_texture,
    const ScatteringTexture multiple_scattering_texture,
    const vec2 frag_coord, const int scattering_order) {
  Length r;
  Number mu_s;
  GetRMuSFromIrradianceTextureUv(
      atmosphere, frag_coord / IRRADIANCE_TEXTURE_SIZE, r, mu_s);
  return ComputeIndirectIrradiance(atmosphere,
      single_rayleigh_scattering_texture, single_mie_scattering_texture,
      multiple_scattering_texture, r, mu_s, scattering_order);
}
`;var uh=new O(.2126,.7152,.0722),hh=["solarIrradiance","sunAngularRadius","bottomRadius","topRadius","rayleighDensity","rayleighScattering","mieDensity","mieScattering","mieExtinction","miePhaseFunctionG","absorptionDensity","absorptionExtinction","groundAlbedo","muSMin","skyRadianceToLuminance","sunRadianceToLuminance"];function dh(t,e){if(e!=null)for(let r of hh){let i=e[r];i!=null&&(t[r]instanceof O?t[r].copy(i):t[r]=i)}}var Ge=class{constructor(e,r,i,n,a){this.width=e,this.expTerm=r,this.expScale=i,this.linearTerm=n,this.constantTerm=a}toUniform(){return new m({width:this.width,exp_term:this.expTerm,exp_scale:this.expScale,linear_term:this.linearTerm,constant_term:this.constantTerm})}},Dn=class{constructor(e){this.solarIrradiance=new O(1.474,1.8504,1.91198),this.sunAngularRadius=.004675,this.bottomRadius=636e4,this.topRadius=642e4,this.rayleighDensity=[new Ge(0,0,0,0,0),new Ge(0,1,-.125,0,0)],this.rayleighScattering=new O(.005802,.013558,.0331),this.mieDensity=[new Ge(0,0,0,0,0),new Ge(0,1,-.833333,0,0)],this.mieScattering=new O(.003996,.003996,.003996),this.mieExtinction=new O(.00444,.00444,.00444),this.miePhaseFunctionG=.8,this.absorptionDensity=[new Ge(25,0,0,1/15,-2/3),new Ge(0,0,0,-1/15,8/3)],this.absorptionExtinction=new O(65e-5,.001881,85e-6),this.groundAlbedo=new Us().setScalar(.1),this.muSMin=Math.cos(ge(120)),this.sunRadianceToLuminance=new O(98242.786222,69954.398112,66475.012354),this.skyRadianceToLuminance=new O(114974.916437,71305.954816,65310.548555),this.sunRadianceToRelativeLuminance=new O,this.skyRadianceToRelativeLuminance=new O,dh(this,e);let r=uh.dot(this.sunRadianceToLuminance);this.sunRadianceToRelativeLuminance.copy(this.sunRadianceToLuminance).divideScalar(r),this.skyRadianceToRelativeLuminance.copy(this.skyRadianceToLuminance).divideScalar(r)}toUniform(){return new m({solar_irradiance:this.solarIrradiance,sun_angular_radius:this.sunAngularRadius,bottom_radius:this.bottomRadius*kt,top_radius:this.topRadius*kt,rayleigh_density:{layers:this.rayleighDensity.map(e=>e.toUniform().value)},rayleigh_scattering:this.rayleighScattering,mie_density:{layers:this.mieDensity.map(e=>e.toUniform().value)},mie_scattering:this.mieScattering,mie_extinction:this.mieExtinction,mie_phase_function_g:this.miePhaseFunctionG,absorption_density:{layers:this.absorptionDensity.map(e=>e.toUniform().value)},absorption_extinction:this.absorptionExtinction,ground_albedo:this.groundAlbedo,mu_s_min:this.muSMin})}};Dn.DEFAULT=new Dn;var Et=Dn,fh=`precision highp sampler2DArray;

#include "core/depth"
#include "core/math"
#include "core/packing"
#include "core/transform"
#ifdef HAS_SHADOW
#include "core/raySphereIntersection"
#include "core/cascadedShadowMaps"
#include "core/interleavedGradientNoise"
#include "core/vogelDisk"
#endif // HAS_SHADOW

#include "bruneton/definitions"

uniform AtmosphereParameters ATMOSPHERE;
uniform vec3 SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
uniform vec3 SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;

uniform sampler2D transmittance_texture;
uniform sampler3D scattering_texture;
uniform sampler2D irradiance_texture;
uniform sampler3D single_mie_scattering_texture;
uniform sampler3D higher_order_scattering_texture;

#include "bruneton/common"
#include "bruneton/runtime"

uniform sampler2D normalBuffer;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 inverseProjectionMatrix;
uniform mat4 inverseViewMatrix;
uniform float bottomRadius;
uniform mat4 worldToECEFMatrix;
uniform float geometricErrorCorrectionAmount;
uniform vec3 sunDirection;
uniform float cosSunAngularRadius;
uniform vec3 moonDirection;
uniform float moonAngularRadius;
uniform float lunarRadianceScale;
uniform float albedoScale;

#include "sky"

#ifdef HAS_LIGHTING_MASK
uniform sampler2D lightingMaskBuffer;
#endif // HAS_LIGHTING_MASK

// prettier-ignore
#define LIGHTING_MASK_CHANNEL_ LIGHTING_MASK_CHANNEL

#ifdef HAS_OVERLAY
uniform sampler2D overlayBuffer;
#endif // HAS_OVERLAY

#ifdef HAS_SHADOW
uniform sampler2DArray shadowBuffer;
uniform vec2 shadowIntervals[SHADOW_CASCADE_COUNT];
uniform mat4 shadowMatrices[SHADOW_CASCADE_COUNT];
uniform mat4 inverseShadowMatrices[SHADOW_CASCADE_COUNT];
uniform float shadowFar;
uniform float shadowTopHeight;
uniform float shadowRadius;
uniform sampler3D stbnTexture;
uniform int frame;
#endif // HAS_SHADOW

#ifdef HAS_SHADOW_LENGTH
uniform sampler2D shadowLengthBuffer;
#endif // HAS_SHADOW_LENGTH

varying vec3 vCameraPosition;
varying vec3 vRayDirection;
varying vec3 vGeometryAltitudeCorrection;
varying vec3 vEllipsoidRadiiSquared;

vec3 readNormal(const vec2 uv, out bool degenerate) {
  vec3 normal = texture(normalBuffer, uv).xyz;
  degenerate = normal == vec3(0.0);
  #ifdef OCT_ENCODED_NORMAL
  return unpackVec2ToNormal(normal.xy);
  #else // OCT_ENCODED_NORMAL
  return 2.0 * normal - 1.0;
  #endif // OCT_ENCODED_NORMAL
}

void correctGeometricError(inout vec3 positionECEF, inout vec3 normalECEF) {
  // TODO: The error is pronounced at the edge of the ellipsoid due to the
  // large difference between the sphere position and the unprojected position
  // at the current fragment. Calculating the sphere position from the fragment
  // UV may resolve this.

  // Correct way is slerp, but this will be small-angle interpolation anyways.
  vec3 sphereNormal = normalize(positionECEF / vEllipsoidRadiiSquared);
  vec3 spherePosition = ATMOSPHERE.bottom_radius * sphereNormal;
  normalECEF = mix(normalECEF, sphereNormal, geometricErrorCorrectionAmount);
  positionECEF = mix(positionECEF, spherePosition, geometricErrorCorrectionAmount);
}

#if defined(SUN_LIGHT) || defined(SKY_LIGHT)

vec3 getSunSkyIrradiance(
  const vec3 positionECEF,
  const vec3 normal,
  const vec3 inputColor,
  const float sunTransmittance
) {
  // Assume lambertian BRDF. If both SUN_LIGHT and SKY_LIGHT are not defined,
  // regard the inputColor as radiance at the texel.
  vec3 diffuse = inputColor * albedoScale * RECIPROCAL_PI;
  vec3 skyIrradiance;
  vec3 sunIrradiance = GetSunAndSkyIrradiance(positionECEF, normal, sunDirection, skyIrradiance);

  #ifdef HAS_SHADOW
  sunIrradiance *= sunTransmittance;
  #endif // HAS_SHADOW

  #if defined(SUN_LIGHT) && defined(SKY_LIGHT)
  return diffuse * (sunIrradiance + skyIrradiance);
  #elif defined(SUN_LIGHT)
  return diffuse * sunIrradiance;
  #elif defined(SKY_LIGHT)
  return diffuse * skyIrradiance;
  #endif // defined(SUN_LIGHT) && defined(SKY_LIGHT)
}

#endif // defined(SUN_LIGHT) || defined(SKY_LIGHT)

#if defined(TRANSMITTANCE) || defined(INSCATTER)

void applyTransmittanceInscatter(const vec3 positionECEF, float shadowLength, inout vec3 radiance) {
  vec3 transmittance;
  vec3 inscatter = GetSkyRadianceToPoint(
    vCameraPosition,
    positionECEF,
    shadowLength,
    sunDirection,
    transmittance
  );
  #ifdef TRANSMITTANCE
  radiance = radiance * transmittance;
  #endif // TRANSMITTANCE
  #ifdef INSCATTER
  radiance = radiance + inscatter;
  #endif // INSCATTER
}

#endif // defined(TRANSMITTANCE) || defined(INSCATTER)

#ifdef HAS_SHADOW

float getSTBN() {
  ivec3 size = textureSize(stbnTexture, 0);
  vec3 scale = 1.0 / vec3(size);
  return texture(stbnTexture, vec3(gl_FragCoord.xy, float(frame % size.z)) * scale).r;
}

vec2 getShadowUv(const vec3 worldPosition, const int cascadeIndex) {
  vec4 clip = shadowMatrices[cascadeIndex] * vec4(worldPosition, 1.0);
  clip /= clip.w;
  return clip.xy * 0.5 + 0.5;
}

float getDistanceToShadowTop(const vec3 positionECEF) {
  // Distance to the top of the shadows along the sun direction, which matches
  // the ray origin of BSM.
  return raySphereSecondIntersection(
    positionECEF / METER_TO_LENGTH_UNIT, // TODO: Make units consistent
    sunDirection,
    vec3(0.0),
    bottomRadius + shadowTopHeight
  );
}

float readShadowOpticalDepth(const vec2 uv, const float distanceToTop, const int cascadeIndex) {
  // r: frontDepth, g: meanExtinction, b: maxOpticalDepth, a: maxOpticalDepthTail
  vec4 shadow = texture(shadowBuffer, vec3(uv, float(cascadeIndex)));
  // Omit adding maxOpticalDepthTail to avoid pronounced aliasing. Ground
  // shadow will be attenuated by inscatter anyways.
  return min(shadow.b, shadow.g * max(0.0, distanceToTop - shadow.r));
}

float sampleShadowOpticalDepthPCF(
  const vec3 worldPosition,
  const float distanceToTop,
  const float radius,
  const int cascadeIndex
) {
  vec2 uv = getShadowUv(worldPosition, cascadeIndex);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return 0.0;
  }

  vec2 texelSize = vec2(1.0) / vec2(textureSize(shadowBuffer, 0).xy);
  float sum = 0.0;
  vec2 offset;
  #pragma unroll_loop_start
  for (int i = 0; i < 16; ++i) {
    #if UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT
    offset = vogelDisk(
      UNROLLED_LOOP_INDEX,
      SHADOW_SAMPLE_COUNT,
      interleavedGradientNoise(gl_FragCoord.xy) * PI2
    );
    sum += readShadowOpticalDepth(uv + offset * radius * texelSize, distanceToTop, cascadeIndex);
    #endif // UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT
  }
  #pragma unroll_loop_end
  return sum / float(SHADOW_SAMPLE_COUNT);
}

float sampleShadowOpticalDepth(
  const vec3 worldPosition,
  const vec3 positionECEF,
  const float radius,
  const float jitter
) {
  float distanceToTop = getDistanceToShadowTop(positionECEF);
  if (distanceToTop <= 0.0) {
    return 0.0;
  }
  int cascadeIndex = getFadedCascadeIndex(
    viewMatrix,
    worldPosition,
    shadowIntervals,
    cameraNear,
    shadowFar,
    jitter
  );
  return cascadeIndex >= 0
    ? sampleShadowOpticalDepthPCF(worldPosition, distanceToTop, radius, cascadeIndex)
    : 0.0;
}

float getShadowRadius(const vec3 worldPosition) {
  vec4 clip = shadowMatrices[0] * vec4(worldPosition, 1.0);
  clip /= clip.w;

  // Offset by 1px in each direction in shadow's clip coordinates.
  vec2 shadowSize = vec2(textureSize(shadowBuffer, 0));
  vec3 offset = vec3(2.0 / shadowSize, 0.0);
  vec4 clipX = clip + offset.xzzz;
  vec4 clipY = clip + offset.zyzz;

  // Convert back to world space.
  vec4 worldX = inverseShadowMatrices[0] * clipX;
  vec4 worldY = inverseShadowMatrices[0] * clipY;

  // Project into the main camera's clip space.
  mat4 viewProjectionMatrix = projectionMatrix * viewMatrix;
  vec4 projected = viewProjectionMatrix * vec4(worldPosition, 1.0);
  vec4 projectedX = viewProjectionMatrix * worldX;
  vec4 projectedY = viewProjectionMatrix * worldY;
  projected /= projected.w;
  projectedX /= projectedX.w;
  projectedY /= projectedY.w;

  // Take the mean of pixel sizes.
  vec2 center = (projected.xy * 0.5 + 0.5) * resolution;
  vec2 offsetX = (projectedX.xy * 0.5 + 0.5) * resolution;
  vec2 offsetY = (projectedY.xy * 0.5 + 0.5) * resolution;
  float size = max(length(offsetX - center), length(offsetY - center));

  return remapClamped(size, 10.0, 50.0, 0.0, shadowRadius);
}

#endif // HAS_SHADOW

void mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {
  #if defined(HAS_LIGHTING_MASK) && defined(DEBUG_SHOW_LIGHTING_MASK)
  outputColor.rgb = vec3(texture(lightingMaskBuffer, uv).LIGHTING_MASK_CHANNEL_);
  outputColor.a = 1.0;
  return;
  #endif // defined(HAS_LIGHTING_MASK) && defined(DEBUG_SHOW_LIGHTING_MASK)

  float shadowLength = 0.0;
  #ifdef HAS_SHADOW_LENGTH
  shadowLength = texture(shadowLengthBuffer, uv).r;
  #endif // HAS_SHADOW_LENGTH

  #ifdef HAS_OVERLAY
  vec4 overlay = texture(overlayBuffer, uv);
  if (overlay.a == 1.0) {
    outputColor = overlay;
    return;
  }
  #endif // HAS_OVERLAY

  vec3 rayDirection = normalize(vRayDirection);
  vec3 dRDdx = dFdx(rayDirection);
  vec3 dRDdy = dFdy(rayDirection);
  float fragmentAngle = length(dRDdx + dRDdy) / length(rayDirection);

  float depth = readDepthValue(depthBuffer, uv);
  if (depth >= 1.0 - 1e-8) {
    #ifdef SKY
    outputColor.rgb = getSkyRadiance(
      vCameraPosition,
      rayDirection,
      shadowLength,
      sunDirection,
      moonDirection,
      moonAngularRadius,
      lunarRadianceScale,
      fragmentAngle
    );
    outputColor.a = 1.0;
    #else // SKY
    outputColor = inputColor;
    #endif // SKY

    #ifdef HAS_OVERLAY
    outputColor.rgb = outputColor.rgb * (1.0 - overlay.a) + overlay.rgb;
    #endif // HAS_OVERLAY
    return;
  }
  depth = reverseLogDepth(depth, cameraNear, cameraFar);

  // Reconstruct position and normal in world space.
  vec3 viewPosition = screenToView(
    uv,
    depth,
    getViewZ(depth),
    projectionMatrix,
    inverseProjectionMatrix
  );
  vec3 worldPosition = (inverseViewMatrix * vec4(viewPosition, 1.0)).xyz;
  vec3 positionECEF = (worldToECEFMatrix * vec4(worldPosition, 1.0)).xyz;
  positionECEF = positionECEF * METER_TO_LENGTH_UNIT + vGeometryAltitudeCorrection;

  vec3 viewNormal;
  bool degenerateNormal = false;
  #ifdef RECONSTRUCT_NORMAL
  vec3 dVPdx = dFdx(viewPosition);
  vec3 dVPdy = dFdy(viewPosition);
  viewNormal = normalize(cross(dVPdx, dVPdy));
  #elif defined(HAS_NORMALS)
  viewNormal = readNormal(uv, degenerateNormal);
  #endif // defined(HAS_NORMALS)

  #if defined(RECONSTRUCT_NORMAL) || defined(HAS_NORMALS)
  vec3 worldNormal = (inverseViewMatrix * vec4(viewNormal, 0.0)).xyz;
  vec3 normalECEF = (worldToECEFMatrix * vec4(worldNormal, 0.0)).xyz;
  #else // defined(RECONSTRUCT_NORMAL) || defined(HAS_NORMALS)
  vec3 normalECEF = normalize(positionECEF);
  #endif // defined(RECONSTRUCT_NORMAL) || defined(HAS_NORMALS)

  #ifdef CORRECT_GEOMETRIC_ERROR
  correctGeometricError(positionECEF, normalECEF);
  #endif // CORRECT_GEOMETRIC_ERROR

  #ifdef HAS_SHADOW
  float stbn = getSTBN();
  float radius = getShadowRadius(worldPosition);
  float opticalDepth = sampleShadowOpticalDepth(worldPosition, positionECEF, radius, stbn);
  float sunTransmittance = exp(-opticalDepth);
  #else // HAS_SHADOW
  float sunTransmittance = 1.0;
  #endif // HAS_SHADOW

  vec3 radiance;
  #if defined(SUN_LIGHT) || defined(SKY_LIGHT)
  // WORKAROUND: When both post-process lighting and sky options are enabled,
  // stars have degenerate normals. We use this to disable irradiance, which is
  // irrelevant for them.
  if (!degenerateNormal) {
    radiance = getSunSkyIrradiance(positionECEF, normalECEF, inputColor.rgb, sunTransmittance);
  } else {
    radiance = inputColor.rgb;
  }
  #ifdef HAS_LIGHTING_MASK
  float lightingMask = texture(lightingMaskBuffer, uv).LIGHTING_MASK_CHANNEL_;
  radiance = mix(inputColor.rgb, radiance, lightingMask);
  #endif // HAS_LIGHTING_MASK
  #else // defined(SUN_LIGHT) || defined(SKY_LIGHT)
  radiance = inputColor.rgb;
  #endif // defined(SUN_LIGHT) || defined(SKY_LIGHT)

  #if defined(TRANSMITTANCE) || defined(INSCATTER)
  applyTransmittanceInscatter(positionECEF, shadowLength, radiance);
  #endif // defined(TRANSMITTANCE) || defined(INSCATTER)

  outputColor = vec4(radiance, inputColor.a);

  #ifdef HAS_OVERLAY
  outputColor.rgb = outputColor.rgb * (1.0 - overlay.a) + overlay.rgb;
  #endif // HAS_OVERLAY
}
`,mh=`uniform mat4 inverseViewMatrix;
uniform mat4 inverseProjectionMatrix;
uniform vec3 cameraPosition;
uniform mat4 worldToECEFMatrix;
uniform vec3 altitudeCorrection;
uniform float geometricErrorCorrectionAmount;
uniform vec3 ellipsoidRadii;

varying vec3 vCameraPosition;
varying vec3 vRayDirection;
varying vec3 vGeometryAltitudeCorrection;
varying vec3 vEllipsoidRadiiSquared;

void getCameraRay(out vec3 origin, out vec3 direction) {
  bool isPerspective = inverseProjectionMatrix[2][3] != 0.0; // 4th entry in the 3rd column

  if (isPerspective) {
    // Calculate the camera ray for a perspective camera.
    vec4 viewPosition = inverseProjectionMatrix * vec4(position, 1.0);
    vec4 worldDirection = inverseViewMatrix * vec4(viewPosition.xyz, 0.0);
    origin = cameraPosition;
    direction = worldDirection.xyz;
  } else {
    // Unprojected points to calculate direction.
    vec4 nearPoint = inverseProjectionMatrix * vec4(position.xy, -1.0, 1.0);
    vec4 farPoint = inverseProjectionMatrix * vec4(position.xy, -0.9, 1.0);
    nearPoint /= nearPoint.w;
    farPoint /= farPoint.w;

    // Calculate world values.
    vec4 worldDirection = inverseViewMatrix * vec4(farPoint.xyz - nearPoint.xyz, 0.0);
    vec4 worldOrigin = inverseViewMatrix * nearPoint;

    // Outputs
    direction = worldDirection.xyz;
    origin = worldOrigin.xyz;
  }
}

void mainSupport() {
  vec3 direction, origin;
  getCameraRay(origin, direction);

  vec3 cameraPositionECEF = (worldToECEFMatrix * vec4(origin, 1.0)).xyz;
  vCameraPosition = (cameraPositionECEF + altitudeCorrection) * METER_TO_LENGTH_UNIT;
  vRayDirection = (worldToECEFMatrix * vec4(direction, 0.0)).xyz;

  vGeometryAltitudeCorrection = altitudeCorrection * METER_TO_LENGTH_UNIT;
  // Gradually turn off the altitude correction on geometries as the geometric
  // error correction takes effect, because that on the ideal sphere will be
  // over corrected.
  // See: https://github.com/takram-design-engineering/three-geospatial/pull/23#issuecomment-2542914656
  #ifdef CORRECT_GEOMETRIC_ERROR
  vGeometryAltitudeCorrection *= 1.0 - geometricErrorCorrectionAmount;
  #endif // CORRECT_GEOMETRIC_ERROR

  vec3 radii = ellipsoidRadii * METER_TO_LENGTH_UNIT;
  vEllipsoidRadiiSquared = radii * radii;
}
`,zs=`vec3 getLunarRadiance(const float moonAngularRadius) {
  // Not a physical number but the order of 10^-6 relative to the sun may fit.
  vec3 radiance =
    ATMOSPHERE.solar_irradiance *
    0.000002 /
    (PI * moonAngularRadius * moonAngularRadius) *
    SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
  return radiance;
}

float intersectSphere(const vec3 ray, const vec3 point, const float radius) {
  vec3 P = -point;
  float PoR = dot(P, ray);
  float D = dot(P, P) - radius * radius;
  return -PoR - sqrt(PoR * PoR - D);
}

float orenNayarDiffuse(const vec3 L, const vec3 V, const vec3 N) {
  float NoL = dot(N, L);
  float NoV = dot(N, V);
  float s = dot(L, V) - NoL * NoV;
  float t = mix(1.0, max(NoL, NoV), step(0.0, s));
  return max(0.0, NoL) * (0.62406015 + 0.41284404 * s / t);
}

vec3 getSkyRadiance(
  const vec3 cameraPosition,
  const vec3 rayDirection,
  const float shadowLength,
  const vec3 sunDirection,
  const vec3 moonDirection,
  const float moonAngularRadius,
  const float lunarRadianceScale,
  const float fragmentAngle
) {
  vec3 transmittance;
  vec3 radiance = GetSkyRadiance(
    cameraPosition,
    rayDirection,
    shadowLength,
    sunDirection,
    transmittance
  );

  // Rendering celestial objects without perspective doesn't make sense.
  #ifdef PERSPECTIVE_CAMERA

  #ifdef SUN
  float viewDotSun = dot(rayDirection, sunDirection);
  if (viewDotSun > cosSunAngularRadius) {
    float angle = acos(clamp(viewDotSun, -1.0, 1.0));
    float antialias = smoothstep(
      ATMOSPHERE.sun_angular_radius,
      ATMOSPHERE.sun_angular_radius - fragmentAngle,
      angle
    );
    radiance += transmittance * GetSolarRadiance() * antialias;
  }
  #endif // SUN

  #ifdef MOON
  float intersection = intersectSphere(rayDirection, moonDirection, moonAngularRadius);
  if (intersection > 0.0) {
    vec3 normal = normalize(moonDirection - rayDirection * intersection);
    float diffuse = orenNayarDiffuse(-sunDirection, rayDirection, normal);
    float viewDotMoon = dot(rayDirection, moonDirection);
    float angle = acos(clamp(viewDotMoon, -1.0, 1.0));
    float antialias = smoothstep(moonAngularRadius, moonAngularRadius - fragmentAngle, angle);
    radiance +=
      transmittance *
      getLunarRadiance(moonAngularRadius) *
      lunarRadianceScale *
      diffuse *
      antialias;
  }
  #endif // MOON

  #endif // PERSPECTIVE_CAMERA

  return radiance;
}
`,ph=Object.defineProperty,se=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&ph(e,r,n),n},gh=new O,vh=new O,Ah=new ce,ks={blendFunction:w.NORMAL,octEncodedNormal:!1,reconstructNormal:!1,ellipsoid:Se.WGS84,correctAltitude:!0,correctGeometricError:!0,sunLight:!1,skyLight:!1,transmittance:!0,inscatter:!0,albedoScale:1,sky:!1,sun:!0,moon:!0,moonAngularRadius:.0045,lunarRadianceScale:1,ground:!0},Q=class extends cr{constructor(e=new Ls,r,i=Et.DEFAULT){let{blendFunction:n,normalBuffer:a=null,octEncodedNormal:s,reconstructNormal:o,irradianceTexture:c=null,scatteringTexture:l=null,transmittanceTexture:u=null,singleMieScatteringTexture:h=null,higherOrderScatteringTexture:p=null,ellipsoid:v,correctAltitude:A,correctGeometricError:g,sunDirection:S,sunLight:D,skyLight:y,transmittance:E,inscatter:N,albedoScale:L,sky:Y,sun:ee,moon:de,moonDirection:K,moonAngularRadius:Pe,lunarRadianceScale:Ne,ground:ye}={...ks,...r};super("AerialPerspectiveEffect",mt(k(fh,{core:{depth:ei,packing:Es,math:Me,transform:xs,raySphereIntersection:Bt,cascadedShadowMaps:$r,interleavedGradientNoise:ti,vogelDisk:ri},bruneton:{common:ve,definitions:Ae,runtime:Vt},sky:zs})),{blendFunction:n,vertexShader:mh,attributes:Te.DEPTH,uniforms:new Map(Object.entries({normalBuffer:new m(a),projectionMatrix:new m(new ne),viewMatrix:new m(new ne),inverseProjectionMatrix:new m(new ne),inverseViewMatrix:new m(new ne),cameraPosition:new m(new O),bottomRadius:new m(i.bottomRadius),ellipsoidRadii:new m(new O),worldToECEFMatrix:new m(new ne),altitudeCorrection:new m(new O),geometricErrorCorrectionAmount:new m(0),sunDirection:new m((S==null?void 0:S.clone())??new O),cosSunAngularRadius:new m(i.sunAngularRadius),albedoScale:new m(L),moonDirection:new m((K==null?void 0:K.clone())??new O),moonAngularRadius:new m(Pe),lunarRadianceScale:new m(Ne),overlayBuffer:new m(null),shadowBuffer:new m(null),shadowMapSize:new m(new Bs),shadowIntervals:new m([]),shadowMatrices:new m([]),inverseShadowMatrices:new m([]),shadowFar:new m(0),shadowTopHeight:new m(0),shadowRadius:new m(3),stbnTexture:new m(null),frame:new m(0),shadowLengthBuffer:new m(null),lightingMaskBuffer:new m(null),ATMOSPHERE:i.toUniform(),SUN_SPECTRAL_RADIANCE_TO_LUMINANCE:new m(i.sunRadianceToRelativeLuminance),SKY_SPECTRAL_RADIANCE_TO_LUMINANCE:new m(i.skyRadianceToRelativeLuminance),irradiance_texture:new m(c),scattering_texture:new m(l),transmittance_texture:new m(u),single_mie_scattering_texture:new m(null),higher_order_scattering_texture:new m(null)})),defines:new Map([["TRANSMITTANCE_TEXTURE_WIDTH",vt.toFixed(0)],["TRANSMITTANCE_TEXTURE_HEIGHT",At.toFixed(0)],["SCATTERING_TEXTURE_R_SIZE",Ft.toFixed(0)],["SCATTERING_TEXTURE_MU_SIZE",Ht.toFixed(0)],["SCATTERING_TEXTURE_MU_S_SIZE",Gt.toFixed(0)],["SCATTERING_TEXTURE_NU_SIZE",zt.toFixed(0)],["IRRADIANCE_TEXTURE_WIDTH",pt.toFixed(0)],["IRRADIANCE_TEXTURE_HEIGHT",gt.toFixed(0)],["METER_TO_LENGTH_UNIT",kt.toFixed(7)]])}),this.camera=e,this.atmosphere=i,this.overlay=null,this.shadow=null,this.shadowLength=null,this.lightingMask=null,this.hasNormals=!1,this.combinedScatteringTextures=!1,this.hasHigherOrderScatteringTexture=!1,this.shadowSampleCount=8,this.octEncodedNormal=s,this.reconstructNormal=o,this.singleMieScatteringTexture=h,this.higherOrderScatteringTexture=p,this.ellipsoid=v,this.correctAltitude=A,this.correctGeometricError=g,this.sunLight=D,this.skyLight=y,this.transmittance=E,this.inscatter=N,this.sky=Y,this.sun=ee,this.moon=de,this.ground=ye}get mainCamera(){return this.camera}set mainCamera(e){this.camera=e}copyCameraSettings(e){let{projectionMatrix:r,matrixWorldInverse:i,projectionMatrixInverse:n,matrixWorld:a}=e,s=this.uniforms;s.get("projectionMatrix").value.copy(r),s.get("viewMatrix").value.copy(i),s.get("inverseProjectionMatrix").value.copy(n),s.get("inverseViewMatrix").value.copy(a);let o=e.getWorldPosition(s.get("cameraPosition").value),c=s.get("worldToECEFMatrix").value,l=gh.copy(o).applyMatrix4(c);try{let h=Ah.setFromECEF(l).height,p=vh.set(0,this.ellipsoid.maximumRadius,-Math.max(0,h)).applyMatrix4(r);s.get("geometricErrorCorrectionAmount").value=As(vs(p.y,41.5,13.8,0,1))}catch{return}let u=s.get("altitudeCorrection");this.correctAltitude?Wt(l,this.atmosphere.bottomRadius,this.ellipsoid,u.value):u.value.setScalar(0)}updateOverlay(){let e=!1,{uniforms:r,defines:i,overlay:n}=this,a=i.has("HAS_OVERLAY"),s=n!=null;return s!==a&&(s?i.set("HAS_OVERLAY","1"):(i.delete("HAS_OVERLAY"),r.get("overlayBuffer").value=null),e=!0),s&&(r.get("overlayBuffer").value=n.map),e}updateShadow(){let e=!1,{uniforms:r,defines:i,shadow:n}=this,a=i.has("HAS_SHADOW"),s=n!=null;if(s!==a&&(s?i.set("HAS_SHADOW","1"):(i.delete("HAS_SHADOW"),r.get("shadowBuffer").value=null),e=!0),s){let o=i.get("SHADOW_CASCADE_COUNT"),c=`${n.cascadeCount}`;o!==c&&(i.set("SHADOW_CASCADE_COUNT",n.cascadeCount.toFixed(0)),e=!0),r.get("shadowBuffer").value=n.map,r.get("shadowMapSize").value=n.mapSize,r.get("shadowIntervals").value=n.intervals,r.get("shadowMatrices").value=n.matrices,r.get("inverseShadowMatrices").value=n.inverseMatrices,r.get("shadowFar").value=n.far,r.get("shadowTopHeight").value=n.topHeight}return e}updateShadowLength(){let e=!1,{uniforms:r,defines:i,shadowLength:n}=this,a=i.has("HAS_SHADOW_LENGTH"),s=n!=null;return s!==a&&(s?i.set("HAS_SHADOW_LENGTH","1"):(i.delete("HAS_SHADOW_LENGTH"),r.get("shadowLengthBuffer").value=null),e=!0),s&&(r.get("shadowLengthBuffer").value=n.map),e}updateLightingMask(){let e=!1,{uniforms:r,defines:i,lightingMask:n}=this,a=i.has("HAS_LIGHTING_MASK"),s=n!=null;if(s!==a&&(s?i.set("HAS_LIGHTING_MASK","1"):(i.delete("HAS_LIGHTING_MASK"),r.get("lightingMaskBuffer").value=null),e=!0),s){r.get("lightingMaskBuffer").value=n.map;let o=i.get("LIGHTING_MASK_CHANNEL"),c=n.channel;c!==o&&(/^[rgba]$/.test(c)?(i.set("LIGHTING_MASK_CHANNEL",c),e=!0):console.error(`Expression validation failed: ${c}`))}return e}update(e,r,i){this.copyCameraSettings(this.camera);let n=!1;n||=this.updateOverlay(),n||=this.updateShadow(),n||=this.updateShadowLength(),n||=this.updateLightingMask(),n&&this.setChanged(),++this.uniforms.get("frame").value}get normalBuffer(){return this.uniforms.get("normalBuffer").value}set normalBuffer(e){this.uniforms.get("normalBuffer").value=e,this.hasNormals=e!=null}get irradianceTexture(){return this.uniforms.get("irradiance_texture").value}set irradianceTexture(e){this.uniforms.get("irradiance_texture").value=e}get scatteringTexture(){return this.uniforms.get("scattering_texture").value}set scatteringTexture(e){this.uniforms.get("scattering_texture").value=e}get transmittanceTexture(){return this.uniforms.get("transmittance_texture").value}set transmittanceTexture(e){this.uniforms.get("transmittance_texture").value=e}get singleMieScatteringTexture(){return this.uniforms.get("single_mie_scattering_texture").value}set singleMieScatteringTexture(e){this.uniforms.get("single_mie_scattering_texture").value=e,this.combinedScatteringTextures=e==null}get higherOrderScatteringTexture(){return this.uniforms.get("higher_order_scattering_texture").value}set higherOrderScatteringTexture(e){this.uniforms.get("higher_order_scattering_texture").value=e,this.hasHigherOrderScatteringTexture=e!=null}get ellipsoid(){return this._ellipsoid}set ellipsoid(e){this._ellipsoid=e,this.uniforms.get("ellipsoidRadii").value.copy(e.radii)}get worldToECEFMatrix(){return this.uniforms.get("worldToECEFMatrix").value}get sunDirection(){return this.uniforms.get("sunDirection").value}get sunAngularRadius(){return this.uniforms.get("ATMOSPHERE").value.sun_angular_radius}set sunAngularRadius(e){this.uniforms.get("ATMOSPHERE").value.sun_angular_radius=e,this.uniforms.get("cosSunAngularRadius").value=Math.cos(e)}get albedoScale(){return this.uniforms.get("albedoScale").value}set albedoScale(e){this.uniforms.get("albedoScale").value=e}get moonDirection(){return this.uniforms.get("moonDirection").value}get moonAngularRadius(){return this.uniforms.get("moonAngularRadius").value}set moonAngularRadius(e){this.uniforms.get("moonAngularRadius").value=e}get lunarRadianceScale(){return this.uniforms.get("lunarRadianceScale").value}set lunarRadianceScale(e){this.uniforms.get("lunarRadianceScale").value=e}get stbnTexture(){return this.uniforms.get("stbnTexture").value}set stbnTexture(e){this.uniforms.get("stbnTexture").value=e}get shadowRadius(){return this.uniforms.get("shadowRadius").value}set shadowRadius(e){this.uniforms.get("shadowRadius").value=e}};se([C("OCT_ENCODED_NORMAL")],Q.prototype,"octEncodedNormal");se([C("RECONSTRUCT_NORMAL")],Q.prototype,"reconstructNormal");se([C("HAS_NORMALS")],Q.prototype,"hasNormals");se([C("COMBINED_SCATTERING_TEXTURES")],Q.prototype,"combinedScatteringTextures");se([C("HAS_HIGHER_ORDER_SCATTERING_TEXTURE")],Q.prototype,"hasHigherOrderScatteringTexture");se([C("CORRECT_GEOMETRIC_ERROR")],Q.prototype,"correctGeometricError");se([C("SUN_LIGHT")],Q.prototype,"sunLight");se([C("SKY_LIGHT")],Q.prototype,"skyLight");se([C("TRANSMITTANCE")],Q.prototype,"transmittance");se([C("INSCATTER")],Q.prototype,"inscatter");se([C("SKY")],Q.prototype,"sky");se([C("SUN")],Q.prototype,"sun");se([C("MOON")],Q.prototype,"moon");se([C("GROUND")],Q.prototype,"ground");se([Be("SHADOW_SAMPLE_COUNT",{min:1,max:16})],Q.prototype,"shadowSampleCount");var Th=Object.defineProperty,Ws=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&Th(e,r,n),n},Sh=new O;function Eh(t,e){let r="",i="";for(let n=1;n<e;++n)r+=`layout(location = ${n}) out float renderTarget${n};
`,i+=`renderTarget${n} = 0.0;
`;return t.replace("#include <mrt_layout>",r).replace("#include <mrt_output>",i)}var gi={ellipsoid:Se.WGS84,correctAltitude:!0,renderTargetCount:1},ze=class extends Fs{constructor(e,r=Et.DEFAULT){let{irradianceTexture:i=null,scatteringTexture:n=null,transmittanceTexture:a=null,singleMieScatteringTexture:s=null,higherOrderScatteringTexture:o=null,ellipsoid:c,correctAltitude:l,sunDirection:u,sunAngularRadius:h,renderTargetCount:p,...v}={...gi,...e};super({toneMapped:!1,depthWrite:!1,depthTest:!1,...v,uniforms:{cameraPosition:new m(new O),worldToECEFMatrix:new m(new ne),altitudeCorrection:new m(new O),sunDirection:new m((u==null?void 0:u.clone())??new O),cosSunAngularRadius:new m(r.sunAngularRadius),ATMOSPHERE:r.toUniform(),SUN_SPECTRAL_RADIANCE_TO_LUMINANCE:new m(r.sunRadianceToRelativeLuminance),SKY_SPECTRAL_RADIANCE_TO_LUMINANCE:new m(r.skyRadianceToRelativeLuminance),irradiance_texture:new m(i),scattering_texture:new m(n),transmittance_texture:new m(a),single_mie_scattering_texture:new m(null),higher_order_scattering_texture:new m(null),...v.uniforms},defines:{PI:`${Math.PI}`,TRANSMITTANCE_TEXTURE_WIDTH:vt.toFixed(0),TRANSMITTANCE_TEXTURE_HEIGHT:At.toFixed(0),SCATTERING_TEXTURE_R_SIZE:Ft.toFixed(0),SCATTERING_TEXTURE_MU_SIZE:Ht.toFixed(0),SCATTERING_TEXTURE_MU_S_SIZE:Gt.toFixed(0),SCATTERING_TEXTURE_NU_SIZE:zt.toFixed(0),IRRADIANCE_TEXTURE_WIDTH:pt.toFixed(0),IRRADIANCE_TEXTURE_HEIGHT:gt.toFixed(0),METER_TO_LENGTH_UNIT:kt.toFixed(7),...v.defines}}),this.atmosphere=r,this.combinedScatteringTextures=!1,this.hasHigherOrderScatteringTexture=!1,this.singleMieScatteringTexture=s,this.higherOrderScatteringTexture=o,this.ellipsoid=c,this.correctAltitude=l,h!=null&&(this.sunAngularRadius=h),this.renderTargetCount=p}copyCameraSettings(e){let r=this.uniforms,i=e.getWorldPosition(r.cameraPosition.value),n=Sh.copy(i).applyMatrix4(r.worldToECEFMatrix.value),a=r.altitudeCorrection.value;this.correctAltitude?Wt(n,this.atmosphere.bottomRadius,this.ellipsoid,a):a.setScalar(0)}onBeforeCompile(e,r){e.fragmentShader=Eh(e.fragmentShader,this.renderTargetCount)}onBeforeRender(e,r,i,n,a,s){this.copyCameraSettings(i)}get irradianceTexture(){return this.uniforms.irradiance_texture.value}set irradianceTexture(e){this.uniforms.irradiance_texture.value=e}get scatteringTexture(){return this.uniforms.scattering_texture.value}set scatteringTexture(e){this.uniforms.scattering_texture.value=e}get transmittanceTexture(){return this.uniforms.transmittance_texture.value}set transmittanceTexture(e){this.uniforms.transmittance_texture.value=e}get singleMieScatteringTexture(){return this.uniforms.single_mie_scattering_texture.value}set singleMieScatteringTexture(e){this.uniforms.single_mie_scattering_texture.value=e,this.combinedScatteringTextures=e==null}get higherOrderScatteringTexture(){return this.uniforms.higher_order_scattering_texture.value}set higherOrderScatteringTexture(e){this.uniforms.higher_order_scattering_texture.value=e,this.hasHigherOrderScatteringTexture=e!=null}get worldToECEFMatrix(){return this.uniforms.worldToECEFMatrix.value}get sunDirection(){return this.uniforms.sunDirection.value}get sunAngularRadius(){return this.uniforms.ATMOSPHERE.value.sun_angular_radius}set sunAngularRadius(e){this.uniforms.ATMOSPHERE.value.sun_angular_radius=e,this.uniforms.cosSunAngularRadius.value=Math.cos(e)}get renderTargetCount(){return this._renderTargetCount}set renderTargetCount(e){e!==this.renderTargetCount&&(this._renderTargetCount=e,this.needsUpdate=!0)}};Ws([C("COMBINED_SCATTERING_TEXTURES")],ze.prototype,"combinedScatteringTextures");Ws([C("HAS_HIGHER_ORDER_SCATTERING_TEXTURE")],ze.prototype,"hasHigherOrderScatteringTexture");var xh=173.1446326846693,Vs=14959787069098932e-8,St=.017453292519943295;var wh=365.24217,Rs=new Date("2000-01-01T12:00:00Z"),Fe=2*Math.PI,it=3600*(180/Math.PI),Xt=484813681109536e-20,yh=10800*60,Ch=2*yh,Dh=6378.1366,Rh=Dh/Vs,_h=81.30056,Vn=.0002959122082855911,Rn=2825345909524226e-22,_n=8459715185680659e-23,In=1292024916781969e-23,Mn=1524358900784276e-23;function li(t){if(!Number.isFinite(t))throw console.trace(),`Value is not a finite number: ${t}`;return t}function Yt(t){return t-Math.floor(t)}var U;(function(t){t.Sun="Sun",t.Moon="Moon",t.Mercury="Mercury",t.Venus="Venus",t.Earth="Earth",t.Mars="Mars",t.Jupiter="Jupiter",t.Saturn="Saturn",t.Uranus="Uranus",t.Neptune="Neptune",t.Pluto="Pluto",t.SSB="SSB",t.EMB="EMB",t.Star1="Star1",t.Star2="Star2",t.Star3="Star3",t.Star4="Star4",t.Star5="Star5",t.Star6="Star6",t.Star7="Star7",t.Star8="Star8"})(U||(U={}));var Ih=[U.Star1,U.Star2,U.Star3,U.Star4,U.Star5,U.Star6,U.Star7,U.Star8],Mh=[{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0},{ra:0,dec:0,dist:0}];function Ph(t){let e=Ih.indexOf(t);return e>=0?Mh[e]:null}function Ys(t){let e=Ph(t);return e&&e.dist>0?e:null}var ke;(function(t){t[t.From2000=0]="From2000",t[t.Into2000=1]="Into2000"})(ke||(ke={}));var Qt={Mercury:[[[[4.40250710144,0,0],[.40989414977,1.48302034195,26087.9031415742],[.050462942,4.47785489551,52175.8062831484],[.00855346844,1.16520322459,78263.70942472259],[.00165590362,4.11969163423,104351.61256629678],[.00034561897,.77930768443,130439.51570787099],[7583476e-11,3.71348404924,156527.41884944518]],[[26087.90313685529,0,0],[.01131199811,6.21874197797,26087.9031415742],[.00292242298,3.04449355541,52175.8062831484],[.00075775081,6.08568821653,78263.70942472259],[.00019676525,2.80965111777,104351.61256629678]]],[[[.11737528961,1.98357498767,26087.9031415742],[.02388076996,5.03738959686,52175.8062831484],[.01222839532,3.14159265359,0],[.0054325181,1.79644363964,78263.70942472259],[.0012977877,4.83232503958,104351.61256629678],[.00031866927,1.58088495658,130439.51570787099],[7963301e-11,4.60972126127,156527.41884944518]],[[.00274646065,3.95008450011,26087.9031415742],[.00099737713,3.14159265359,0]]],[[[.39528271651,0,0],[.07834131818,6.19233722598,26087.9031415742],[.00795525558,2.95989690104,52175.8062831484],[.00121281764,6.01064153797,78263.70942472259],[.00021921969,2.77820093972,104351.61256629678],[4354065e-11,5.82894543774,130439.51570787099]],[[.0021734774,4.65617158665,26087.9031415742],[.00044141826,1.42385544001,52175.8062831484]]]],Venus:[[[[3.17614666774,0,0],[.01353968419,5.59313319619,10213.285546211],[.00089891645,5.30650047764,20426.571092422],[5477194e-11,4.41630661466,7860.4193924392],[3455741e-11,2.6996444782,11790.6290886588],[2372061e-11,2.99377542079,3930.2096962196],[1317168e-11,5.18668228402,26.2983197998],[1664146e-11,4.25018630147,1577.3435424478],[1438387e-11,4.15745084182,9683.5945811164],[1200521e-11,6.15357116043,30639.856638633]],[[10213.28554621638,0,0],[.00095617813,2.4640651111,10213.285546211],[7787201e-11,.6247848222,20426.571092422]]],[[[.05923638472,.26702775812,10213.285546211],[.00040107978,1.14737178112,20426.571092422],[.00032814918,3.14159265359,0]],[[.00287821243,1.88964962838,10213.285546211]]],[[[.72334820891,0,0],[.00489824182,4.02151831717,10213.285546211],[1658058e-11,4.90206728031,20426.571092422],[1378043e-11,1.12846591367,11790.6290886588],[1632096e-11,2.84548795207,7860.4193924392],[498395e-11,2.58682193892,9683.5945811164],[221985e-11,2.01346696541,19367.1891622328],[237454e-11,2.55136053886,15720.8387848784]],[[.00034551041,.89198706276,10213.285546211]]]],Earth:[[[[1.75347045673,0,0],[.03341656453,4.66925680415,6283.0758499914],[.00034894275,4.62610242189,12566.1516999828],[3417572e-11,2.82886579754,3.523118349],[3497056e-11,2.74411783405,5753.3848848968],[3135899e-11,3.62767041756,77713.7714681205],[2676218e-11,4.41808345438,7860.4193924392],[2342691e-11,6.13516214446,3930.2096962196],[1273165e-11,2.03709657878,529.6909650946],[1324294e-11,.74246341673,11506.7697697936],[901854e-11,2.04505446477,26.2983197998],[1199167e-11,1.10962946234,1577.3435424478],[857223e-11,3.50849152283,398.1490034082],[779786e-11,1.17882681962,5223.6939198022],[99025e-10,5.23268072088,5884.9268465832],[753141e-11,2.53339052847,5507.5532386674],[505267e-11,4.58292599973,18849.2275499742],[492392e-11,4.20505711826,775.522611324],[356672e-11,2.91954114478,.0673103028],[284125e-11,1.89869240932,796.2980068164],[242879e-11,.34481445893,5486.777843175],[317087e-11,5.84901948512,11790.6290886588],[271112e-11,.31486255375,10977.078804699],[206217e-11,4.80646631478,2544.3144198834],[205478e-11,1.86953770281,5573.1428014331],[202318e-11,2.45767790232,6069.7767545534],[126225e-11,1.08295459501,20.7753954924],[155516e-11,.83306084617,213.299095438]],[[6283.0758499914,0,0],[.00206058863,2.67823455808,6283.0758499914],[4303419e-11,2.63512233481,12566.1516999828]],[[8721859e-11,1.07253635559,6283.0758499914]]],[[],[[.00227777722,3.4137662053,6283.0758499914],[3805678e-11,3.37063423795,12566.1516999828]]],[[[1.00013988784,0,0],[.01670699632,3.09846350258,6283.0758499914],[.00013956024,3.05524609456,12566.1516999828],[308372e-10,5.19846674381,77713.7714681205],[1628463e-11,1.17387558054,5753.3848848968],[1575572e-11,2.84685214877,7860.4193924392],[924799e-11,5.45292236722,11506.7697697936],[542439e-11,4.56409151453,3930.2096962196],[47211e-10,3.66100022149,5884.9268465832],[85831e-11,1.27079125277,161000.6857376741],[57056e-11,2.01374292245,83996.84731811189],[55736e-11,5.2415979917,71430.69561812909],[174844e-11,3.01193636733,18849.2275499742],[243181e-11,4.2734953079,11790.6290886588]],[[.00103018607,1.10748968172,6283.0758499914],[1721238e-11,1.06442300386,12566.1516999828]],[[4359385e-11,5.78455133808,6283.0758499914]]]],Mars:[[[[6.20347711581,0,0],[.18656368093,5.0503710027,3340.6124266998],[.01108216816,5.40099836344,6681.2248533996],[.00091798406,5.75478744667,10021.8372800994],[.00027744987,5.97049513147,3.523118349],[.00010610235,2.93958560338,2281.2304965106],[.00012315897,.84956094002,2810.9214616052],[8926784e-11,4.15697846427,.0172536522],[8715691e-11,6.11005153139,13362.4497067992],[6797556e-11,.36462229657,398.1490034082],[7774872e-11,3.33968761376,5621.8429232104],[3575078e-11,1.6618650571,2544.3144198834],[4161108e-11,.22814971327,2942.4634232916],[3075252e-11,.85696614132,191.4482661116],[2628117e-11,.64806124465,3337.0893083508],[2937546e-11,6.07893711402,.0673103028],[2389414e-11,5.03896442664,796.2980068164],[2579844e-11,.02996736156,3344.1355450488],[1528141e-11,1.14979301996,6151.533888305],[1798806e-11,.65634057445,529.6909650946],[1264357e-11,3.62275122593,5092.1519581158],[1286228e-11,3.06796065034,2146.1654164752],[1546404e-11,2.91579701718,1751.539531416],[1024902e-11,3.69334099279,8962.4553499102],[891566e-11,.18293837498,16703.062133499],[858759e-11,2.4009381194,2914.0142358238],[832715e-11,2.46418619474,3340.5951730476],[83272e-10,4.49495782139,3340.629680352],[712902e-11,3.66335473479,1059.3819301892],[748723e-11,3.82248614017,155.4203994342],[723861e-11,.67497311481,3738.761430108],[635548e-11,2.92182225127,8432.7643848156],[655162e-11,.48864064125,3127.3133312618],[550474e-11,3.81001042328,.9803210682],[55275e-10,4.47479317037,1748.016413067],[425966e-11,.55364317304,6283.0758499914],[415131e-11,.49662285038,213.299095438],[472167e-11,3.62547124025,1194.4470102246],[306551e-11,.38052848348,6684.7479717486],[312141e-11,.99853944405,6677.7017350506],[293198e-11,4.22131299634,20.7753954924],[302375e-11,4.48618007156,3532.0606928114],[274027e-11,.54222167059,3340.545116397],[281079e-11,5.88163521788,1349.8674096588],[231183e-11,1.28242156993,3870.3033917944],[283602e-11,5.7688543494,3149.1641605882],[236117e-11,5.75503217933,3333.498879699],[274033e-11,.13372524985,3340.6797370026],[299395e-11,2.78323740866,6254.6266625236]],[[3340.61242700512,0,0],[.01457554523,3.60433733236,3340.6124266998],[.00168414711,3.92318567804,6681.2248533996],[.00020622975,4.26108844583,10021.8372800994],[3452392e-11,4.7321039319,3.523118349],[2586332e-11,4.60670058555,13362.4497067992],[841535e-11,4.45864030426,2281.2304965106]],[[.00058152577,2.04961712429,3340.6124266998],[.00013459579,2.45738706163,6681.2248533996]]],[[[.03197134986,3.76832042431,3340.6124266998],[.00298033234,4.10616996305,6681.2248533996],[.00289104742,0,0],[.00031365539,4.4465105309,10021.8372800994],[34841e-9,4.7881254926,13362.4497067992]],[[.00217310991,6.04472194776,3340.6124266998],[.00020976948,3.14159265359,0],[.00012834709,1.60810667915,6681.2248533996]]],[[[1.53033488271,0,0],[.1418495316,3.47971283528,3340.6124266998],[.00660776362,3.81783443019,6681.2248533996],[.00046179117,4.15595316782,10021.8372800994],[8109733e-11,5.55958416318,2810.9214616052],[7485318e-11,1.77239078402,5621.8429232104],[5523191e-11,1.3643630377,2281.2304965106],[382516e-10,4.49407183687,13362.4497067992],[2306537e-11,.09081579001,2544.3144198834],[1999396e-11,5.36059617709,3337.0893083508],[2484394e-11,4.9254563992,2942.4634232916],[1960195e-11,4.74249437639,3344.1355450488],[1167119e-11,2.11260868341,5092.1519581158],[1102816e-11,5.00908403998,398.1490034082],[899066e-11,4.40791133207,529.6909650946],[992252e-11,5.83861961952,6151.533888305],[807354e-11,2.10217065501,1059.3819301892],[797915e-11,3.44839203899,796.2980068164],[740975e-11,1.49906336885,2146.1654164752]],[[.01107433345,2.03250524857,3340.6124266998],[.00103175887,2.37071847807,6681.2248533996],[128772e-9,0,0],[.0001081588,2.70888095665,10021.8372800994]],[[.00044242249,.47930604954,3340.6124266998],[8138042e-11,.86998389204,6681.2248533996]]]],Jupiter:[[[[.59954691494,0,0],[.09695898719,5.06191793158,529.6909650946],[.00573610142,1.44406205629,7.1135470008],[.00306389205,5.41734730184,1059.3819301892],[.00097178296,4.14264726552,632.7837393132],[.00072903078,3.64042916389,522.5774180938],[.00064263975,3.41145165351,103.0927742186],[.00039806064,2.29376740788,419.4846438752],[.00038857767,1.27231755835,316.3918696566],[.00027964629,1.7845459182,536.8045120954],[.0001358973,5.7748104079,1589.0728952838],[8246349e-11,3.5822792584,206.1855484372],[8768704e-11,3.63000308199,949.1756089698],[7368042e-11,5.0810119427,735.8765135318],[626315e-10,.02497628807,213.299095438],[6114062e-11,4.51319998626,1162.4747044078],[4905396e-11,1.32084470588,110.2063212194],[5305285e-11,1.30671216791,14.2270940016],[5305441e-11,4.18625634012,1052.2683831884],[4647248e-11,4.69958103684,3.9321532631],[3045023e-11,4.31676431084,426.598190876],[2609999e-11,1.56667394063,846.0828347512],[2028191e-11,1.06376530715,3.1813937377],[1764763e-11,2.14148655117,1066.49547719],[1722972e-11,3.88036268267,1265.5674786264],[1920945e-11,.97168196472,639.897286314],[1633223e-11,3.58201833555,515.463871093],[1431999e-11,4.29685556046,625.6701923124],[973272e-11,4.09764549134,95.9792272178]],[[529.69096508814,0,0],[.00489503243,4.2208293947,529.6909650946],[.00228917222,6.02646855621,7.1135470008],[.00030099479,4.54540782858,1059.3819301892],[.0002072092,5.45943156902,522.5774180938],[.00012103653,.16994816098,536.8045120954],[6067987e-11,4.42422292017,103.0927742186],[5433968e-11,3.98480737746,419.4846438752],[4237744e-11,5.89008707199,14.2270940016]],[[.00047233601,4.32148536482,7.1135470008],[.00030649436,2.929777887,529.6909650946],[.00014837605,3.14159265359,0]]],[[[.02268615702,3.55852606721,529.6909650946],[.00109971634,3.90809347197,1059.3819301892],[.00110090358,0,0],[8101428e-11,3.60509572885,522.5774180938],[6043996e-11,4.25883108339,1589.0728952838],[6437782e-11,.30627119215,536.8045120954]],[[.00078203446,1.52377859742,529.6909650946]]],[[[5.20887429326,0,0],[.25209327119,3.49108639871,529.6909650946],[.00610599976,3.84115365948,1059.3819301892],[.00282029458,2.57419881293,632.7837393132],[.00187647346,2.07590383214,522.5774180938],[.00086792905,.71001145545,419.4846438752],[.00072062974,.21465724607,536.8045120954],[.00065517248,5.9799588479,316.3918696566],[.00029134542,1.67759379655,103.0927742186],[.00030135335,2.16132003734,949.1756089698],[.00023453271,3.54023522184,735.8765135318],[.00022283743,4.19362594399,1589.0728952838],[.00023947298,.2745803748,7.1135470008],[.00013032614,2.96042965363,1162.4747044078],[970336e-10,1.90669633585,206.1855484372],[.00012749023,2.71550286592,1052.2683831884],[7057931e-11,2.18184839926,1265.5674786264],[6137703e-11,6.26418240033,846.0828347512],[2616976e-11,2.00994012876,1581.959348283]],[[.0127180152,2.64937512894,529.6909650946],[.00061661816,3.00076460387,1059.3819301892],[.00053443713,3.89717383175,522.5774180938],[.00031185171,4.88276958012,536.8045120954],[.00041390269,0,0]]]],Saturn:[[[[.87401354025,0,0],[.11107659762,3.96205090159,213.299095438],[.01414150957,4.58581516874,7.1135470008],[.00398379389,.52112032699,206.1855484372],[.00350769243,3.30329907896,426.598190876],[.00206816305,.24658372002,103.0927742186],[792713e-9,3.84007056878,220.4126424388],[.00023990355,4.66976924553,110.2063212194],[.00016573588,.43719228296,419.4846438752],[.00014906995,5.76903183869,316.3918696566],[.0001582029,.93809155235,632.7837393132],[.00014609559,1.56518472,3.9321532631],[.00013160301,4.44891291899,14.2270940016],[.00015053543,2.71669915667,639.897286314],[.00013005299,5.98119023644,11.0457002639],[.00010725067,3.12939523827,202.2533951741],[5863206e-11,.23656938524,529.6909650946],[5227757e-11,4.20783365759,3.1813937377],[6126317e-11,1.76328667907,277.0349937414],[5019687e-11,3.17787728405,433.7117378768],[459255e-10,.61977744975,199.0720014364],[4005867e-11,2.24479718502,63.7358983034],[2953796e-11,.98280366998,95.9792272178],[387367e-10,3.22283226966,138.5174968707],[2461186e-11,2.03163875071,735.8765135318],[3269484e-11,.77492638211,949.1756089698],[1758145e-11,3.2658010994,522.5774180938],[1640172e-11,5.5050445305,846.0828347512],[1391327e-11,4.02333150505,323.5054166574],[1580648e-11,4.37265307169,309.2783226558],[1123498e-11,2.83726798446,415.5524906121],[1017275e-11,3.71700135395,227.5261894396],[848642e-11,3.1915017083,209.3669421749]],[[213.2990952169,0,0],[.01297370862,1.82834923978,213.299095438],[.00564345393,2.88499717272,7.1135470008],[.00093734369,1.06311793502,426.598190876],[.00107674962,2.27769131009,206.1855484372],[.00040244455,2.04108104671,220.4126424388],[.00019941774,1.2795439047,103.0927742186],[.00010511678,2.7488034213,14.2270940016],[6416106e-11,.38238295041,639.897286314],[4848994e-11,2.43037610229,419.4846438752],[4056892e-11,2.92133209468,110.2063212194],[3768635e-11,3.6496533078,3.9321532631]],[[.0011644133,1.17988132879,7.1135470008],[.00091841837,.0732519584,213.299095438],[.00036661728,0,0],[.00015274496,4.06493179167,206.1855484372]]],[[[.04330678039,3.60284428399,213.299095438],[.00240348302,2.85238489373,426.598190876],[.00084745939,0,0],[.00030863357,3.48441504555,220.4126424388],[.00034116062,.57297307557,206.1855484372],[.0001473407,2.11846596715,639.897286314],[9916667e-11,5.79003188904,419.4846438752],[6993564e-11,4.7360468972,7.1135470008],[4807588e-11,5.43305312061,316.3918696566]],[[.00198927992,4.93901017903,213.299095438],[.00036947916,3.14159265359,0],[.00017966989,.5197943111,426.598190876]]],[[[9.55758135486,0,0],[.52921382865,2.39226219573,213.299095438],[.01873679867,5.2354960466,206.1855484372],[.01464663929,1.64763042902,426.598190876],[.00821891141,5.93520042303,316.3918696566],[.00547506923,5.0153261898,103.0927742186],[.0037168465,2.27114821115,220.4126424388],[.00361778765,3.13904301847,7.1135470008],[.00140617506,5.70406606781,632.7837393132],[.00108974848,3.29313390175,110.2063212194],[.00069006962,5.94099540992,419.4846438752],[.00061053367,.94037691801,639.897286314],[.00048913294,1.55733638681,202.2533951741],[.00034143772,.19519102597,277.0349937414],[.00032401773,5.47084567016,949.1756089698],[.00020936596,.46349251129,735.8765135318],[9796004e-11,5.20477537945,1265.5674786264],[.00011993338,5.98050967385,846.0828347512],[208393e-9,1.52102476129,433.7117378768],[.00015298404,3.0594381494,529.6909650946],[6465823e-11,.17732249942,1052.2683831884],[.00011380257,1.7310542704,522.5774180938],[3419618e-11,4.94550542171,1581.959348283]],[[.0618298134,.2584351148,213.299095438],[.00506577242,.71114625261,206.1855484372],[.00341394029,5.79635741658,426.598190876],[.00188491195,.47215589652,220.4126424388],[.00186261486,3.14159265359,0],[.00143891146,1.40744822888,7.1135470008]],[[.00436902572,4.78671677509,213.299095438]]]],Uranus:[[[[5.48129294297,0,0],[.09260408234,.89106421507,74.7815985673],[.01504247898,3.6271926092,1.4844727083],[.00365981674,1.89962179044,73.297125859],[.00272328168,3.35823706307,149.5631971346],[.00070328461,5.39254450063,63.7358983034],[.00068892678,6.09292483287,76.2660712756],[.00061998615,2.26952066061,2.9689454166],[.00061950719,2.85098872691,11.0457002639],[.0002646877,3.14152083966,71.8126531507],[.00025710476,6.11379840493,454.9093665273],[.0002107885,4.36059339067,148.0787244263],[.00017818647,1.74436930289,36.6485629295],[.00014613507,4.73732166022,3.9321532631],[.00011162509,5.8268179635,224.3447957019],[.0001099791,.48865004018,138.5174968707],[9527478e-11,2.95516862826,35.1640902212],[7545601e-11,5.236265824,109.9456887885],[4220241e-11,3.23328220918,70.8494453042],[40519e-9,2.277550173,151.0476698429],[3354596e-11,1.0654900738,4.4534181249],[2926718e-11,4.62903718891,9.5612275556],[349034e-10,5.48306144511,146.594251718],[3144069e-11,4.75199570434,77.7505439839],[2922333e-11,5.35235361027,85.8272988312],[2272788e-11,4.36600400036,70.3281804424],[2051219e-11,1.51773566586,.1118745846],[2148602e-11,.60745949945,38.1330356378],[1991643e-11,4.92437588682,277.0349937414],[1376226e-11,2.04283539351,65.2203710117],[1666902e-11,3.62744066769,380.12776796],[1284107e-11,3.11347961505,202.2533951741],[1150429e-11,.93343589092,3.1813937377],[1533221e-11,2.58594681212,52.6901980395],[1281604e-11,.54271272721,222.8603229936],[1372139e-11,4.19641530878,111.4301614968],[1221029e-11,.1990065003,108.4612160802],[946181e-11,1.19253165736,127.4717966068],[1150989e-11,4.17898916639,33.6796175129]],[[74.7815986091,0,0],[.00154332863,5.24158770553,74.7815985673],[.00024456474,1.71260334156,1.4844727083],[9258442e-11,.4282973235,11.0457002639],[8265977e-11,1.50218091379,63.7358983034],[915016e-10,1.41213765216,149.5631971346]]],[[[.01346277648,2.61877810547,74.7815985673],[623414e-9,5.08111189648,149.5631971346],[.00061601196,3.14159265359,0],[9963722e-11,1.61603805646,76.2660712756],[992616e-10,.57630380333,73.297125859]],[[.00034101978,.01321929936,74.7815985673]]],[[[19.21264847206,0,0],[.88784984413,5.60377527014,74.7815985673],[.03440836062,.32836099706,73.297125859],[.0205565386,1.7829515933,149.5631971346],[.0064932241,4.52247285911,76.2660712756],[.00602247865,3.86003823674,63.7358983034],[.00496404167,1.40139935333,454.9093665273],[.00338525369,1.58002770318,138.5174968707],[.00243509114,1.57086606044,71.8126531507],[.00190522303,1.99809394714,1.4844727083],[.00161858838,2.79137786799,148.0787244263],[.00143706183,1.38368544947,11.0457002639],[.00093192405,.17437220467,36.6485629295],[.00071424548,4.24509236074,224.3447957019],[.00089806014,3.66105364565,109.9456887885],[.00039009723,1.66971401684,70.8494453042],[.00046677296,1.39976401694,35.1640902212],[.00039025624,3.36234773834,277.0349937414],[.00036755274,3.88649278513,146.594251718],[.00030348723,.70100838798,151.0476698429],[.00029156413,3.180563367,77.7505439839],[.00022637073,.72518687029,529.6909650946],[.00011959076,1.7504339214,984.6003316219],[.00025620756,5.25656086672,380.12776796]],[[.01479896629,3.67205697578,74.7815985673]]]],Neptune:[[[[5.31188633046,0,0],[.0179847553,2.9010127389,38.1330356378],[.01019727652,.48580922867,1.4844727083],[.00124531845,4.83008090676,36.6485629295],[.00042064466,5.41054993053,2.9689454166],[.00037714584,6.09221808686,35.1640902212],[.00033784738,1.24488874087,76.2660712756],[.00016482741,7727998e-11,491.5579294568],[9198584e-11,4.93747051954,39.6175083461],[899425e-10,.27462171806,175.1660598002]],[[38.13303563957,0,0],[.00016604172,4.86323329249,1.4844727083],[.00015744045,2.27887427527,38.1330356378]]],[[[.03088622933,1.44104372644,38.1330356378],[.00027780087,5.91271884599,76.2660712756],[.00027623609,0,0],[.00015355489,2.52123799551,36.6485629295],[.00015448133,3.50877079215,39.6175083461]]],[[[30.07013205828,0,0],[.27062259632,1.32999459377,38.1330356378],[.01691764014,3.25186135653,36.6485629295],[.00807830553,5.18592878704,1.4844727083],[.0053776051,4.52113935896,35.1640902212],[.00495725141,1.5710564165,491.5579294568],[.00274571975,1.84552258866,175.1660598002],[.0001201232,1.92059384991,1021.2488945514],[.00121801746,5.79754470298,76.2660712756],[.00100896068,.3770272493,73.297125859],[.00135134092,3.37220609835,39.6175083461],[7571796e-11,1.07149207335,388.4651552382]]]]};function Nh(t){var e,r,i,n,a,s,o;let c=2e3+(t-14)/wh;return c<-500?(e=(c-1820)/100,-20+32*e*e):c<500?(e=c/100,r=e*e,i=e*r,n=r*r,a=r*i,s=i*i,10583.6-1014.41*e+33.78311*r-5.952053*i-.1798452*n+.022174192*a+.0090316521*s):c<1600?(e=(c-1e3)/100,r=e*e,i=e*r,n=r*r,a=r*i,s=i*i,1574.2-556.01*e+71.23472*r+.319781*i-.8503463*n-.005050998*a+.0083572073*s):c<1700?(e=c-1600,r=e*e,i=e*r,120-.9808*e-.01532*r+i/7129):c<1800?(e=c-1700,r=e*e,i=e*r,n=r*r,8.83+.1603*e-.0059285*r+13336e-8*i-n/1174e3):c<1860?(e=c-1800,r=e*e,i=e*r,n=r*r,a=r*i,s=i*i,o=i*n,13.72-.332447*e+.0068612*r+.0041116*i-37436e-8*n+121272e-10*a-1699e-10*s+875e-12*o):c<1900?(e=c-1860,r=e*e,i=e*r,n=r*r,a=r*i,7.62+.5737*e-.251754*r+.01680668*i-.0004473624*n+a/233174):c<1920?(e=c-1900,r=e*e,i=e*r,n=r*r,-2.79+1.494119*e-.0598939*r+.0061966*i-197e-6*n):c<1941?(e=c-1920,r=e*e,i=e*r,21.2+.84493*e-.0761*r+.0020936*i):c<1961?(e=c-1950,r=e*e,i=e*r,29.07+.407*e-r/233+i/2547):c<1986?(e=c-1975,r=e*e,i=e*r,45.45+1.067*e-r/260-i/718):c<2005?(e=c-2e3,r=e*e,i=e*r,n=r*r,a=r*i,63.86+.3345*e-.060374*r+.0017275*i+651814e-9*n+2373599e-11*a):c<2050?(e=c-2e3,62.92+.32217*e+.005589*e*e):c<2150?(e=(c-1820)/100,-20+32*e*e-.5628*(2150-c)):(e=(c-1820)/100,-20+32*e*e)}var bh=Nh;function _s(t){return t+bh(t)/86400}var qt=class t{constructor(e){if(e instanceof t){this.date=e.date,this.ut=e.ut,this.tt=e.tt;return}let r=1e3*3600*24;if(e instanceof Date&&Number.isFinite(e.getTime())){this.date=e,this.ut=(e.getTime()-Rs.getTime())/r,this.tt=_s(this.ut);return}if(Number.isFinite(e)){this.date=new Date(Rs.getTime()+e*r),this.ut=e,this.tt=_s(this.ut);return}throw"Argument must be a Date object, an AstroTime object, or a numeric UTC Julian date."}static FromTerrestrialTime(e){let r=new t(e);for(;;){let i=e-r.tt;if(Math.abs(i)<1e-12)return r;r=r.AddDays(i)}}toString(){return this.date.toISOString()}AddDays(e){return new t(this.ut+e)}};function xt(t){return t instanceof qt?t:new qt(t)}function Oh(t){function e(p){return p%Ch*Xt}let r=t.tt/36525,i=e(128710479305e-5+r*1295965810481e-4),n=e(335779.526232+r*17395272628478e-4),a=e(107226070369e-5+r*1602961601209e-3),s=e(450160.398036-r*69628905431e-4),o=Math.sin(s),c=Math.cos(s),l=(-172064161-174666*r)*o+33386*c,u=(92052331+9086*r)*c+15377*o,h=2*(n-a+s);return o=Math.sin(h),c=Math.cos(h),l+=(-13170906-1675*r)*o-13696*c,u+=(5730336-3015*r)*c-4587*o,h=2*(n+s),o=Math.sin(h),c=Math.cos(h),l+=(-2276413-234*r)*o+2796*c,u+=(978459-485*r)*c+1374*o,h=2*s,o=Math.sin(h),c=Math.cos(h),l+=(2074554+207*r)*o-698*c,u+=(-897492+470*r)*c-291*o,o=Math.sin(i),c=Math.cos(i),l+=(1475877-3633*r)*o+11817*c,u+=(73871-184*r)*c-1924*o,{dpsi:-135e-6+l*1e-7,deps:388e-6+u*1e-7}}function Xs(t){var e=t.tt/36525,r=((((-434e-10*e-576e-9)*e+.0020034)*e-1831e-7)*e-46.836769)*e+84381.406;return r/3600}var ni;function Qs(t){if(!ni||Math.abs(ni.tt-t.tt)>1e-6){let e=Oh(t),r=Xs(t),i=r+e.deps/3600;ni={tt:t.tt,dpsi:e.dpsi,deps:e.deps,ee:e.dpsi*Math.cos(r*St)/15,mobl:r,tobl:i}}return ni}function Uh(t,e){let r=t*St,i=Math.cos(r),n=Math.sin(r);return[e[0],e[1]*i-e[2]*n,e[1]*n+e[2]*i]}function Lh(t,e){return Uh(Xs(t),e)}function Bh(t){let e=t.tt/36525;function r(_,B){let X=[],j;for(j=0;j<=B-_;++j)X.push(0);return{min:_,array:X}}function i(_,B,X,j){let te=[];for(let Ke=0;Ke<=B-_;++Ke)te.push(r(X,j));return{min:_,array:te}}function n(_,B,X){let j=_.array[B-_.min];return j.array[X-j.min]}function a(_,B,X,j){let te=_.array[B-_.min];te.array[X-te.min]=j}let s,o,c,l,u,h,p,v,A,g,S,D,y,E,N,L,Y,ee,de,K,Pe,Ne,ye,Ct=i(-6,6,1,4),Qe=i(-6,6,1,4);function pe(_,B){return n(Ct,_,B)}function be(_,B){return n(Qe,_,B)}function Ze(_,B,X){return a(Ct,_,B,X)}function ct(_,B,X){return a(Qe,_,B,X)}function nr(_,B,X,j,te){te(_*X-B*j,B*X+_*j)}function H(_){return Math.sin(Fe*_)}p=e*e,A=0,ye=0,S=0,D=3422.7;var lt=H(.19833+.05611*e),Dt=H(.27869+.04508*e),R=H(.16827-.36903*e),z=H(.34734-5.37261*e),Ce=H(.10498-5.37899*e),De=H(.42681-.41855*e),Uo=H(.14943-5.37511*e);for(ee=.84*lt+.31*Dt+14.27*R+7.26*z+.28*Ce+.24*De,de=2.94*lt+.31*Dt+14.27*R+9.34*z+1.12*Ce+.83*De,K=-6.4*lt-1.89*De,Pe=.21*lt+.31*Dt+14.27*R-88.7*z-15.3*Ce+.24*De-1.86*Uo,Ne=ee-K,v=-3332e-9*H(.59734-5.37261*e)-539e-9*H(.35498-5.37899*e)-64e-9*H(.39943-5.37511*e),y=Fe*Yt(.60643382+1336.85522467*e-313e-8*p)+ee/it,E=Fe*Yt(.37489701+1325.55240982*e+2565e-8*p)+de/it,N=Fe*Yt(.99312619+99.99735956*e-44e-8*p)+K/it,L=Fe*Yt(.25909118+1342.2278298*e-892e-8*p)+Pe/it,Y=Fe*Yt(.82736186+1236.85308708*e-397e-8*p)+Ne/it,u=1;u<=4;++u){switch(u){case 1:c=E,o=4,l=1.000002208;break;case 2:c=N,o=3,l=.997504612-.002495388*e;break;case 3:c=L,o=4,l=1.000002708+139.978*v;break;case 4:c=Y,o=6,l=1;break;default:throw`Internal error: I = ${u}`}for(Ze(0,u,1),Ze(1,u,Math.cos(c)*l),ct(0,u,0),ct(1,u,Math.sin(c)*l),h=2;h<=o;++h)nr(pe(h-1,u),be(h-1,u),pe(1,u),be(1,u),(_,B)=>(Ze(h,u,_),ct(h,u,B)));for(h=1;h<=o;++h)Ze(-h,u,pe(h,u)),ct(-h,u,-be(h,u))}function oa(_,B,X,j){for(var te={x:1,y:0},Ke=[0,_,B,X,j],Oe=1;Oe<=4;++Oe)Ke[Oe]!==0&&nr(te.x,te.y,pe(Ke[Oe],Oe),be(Ke[Oe],Oe),(Ui,Rt)=>(te.x=Ui,te.y=Rt));return te}function f(_,B,X,j,te,Ke,Oe,Ui){var Rt=oa(te,Ke,Oe,Ui);A+=_*Rt.y,ye+=B*Rt.y,S+=X*Rt.x,D+=j*Rt.x}f(13.902,14.06,-.001,.2607,0,0,0,4),f(.403,-4.01,.394,.0023,0,0,0,3),f(2369.912,2373.36,.601,28.2333,0,0,0,2),f(-125.154,-112.79,-.725,-.9781,0,0,0,1),f(1.979,6.98,-.445,.0433,1,0,0,4),f(191.953,192.72,.029,3.0861,1,0,0,2),f(-8.466,-13.51,.455,-.1093,1,0,0,1),f(22639.5,22609.07,.079,186.5398,1,0,0,0),f(18.609,3.59,-.094,.0118,1,0,0,-1),f(-4586.465,-4578.13,-.077,34.3117,1,0,0,-2),f(3.215,5.44,.192,-.0386,1,0,0,-3),f(-38.428,-38.64,.001,.6008,1,0,0,-4),f(-.393,-1.43,-.092,.0086,1,0,0,-6),f(-.289,-1.59,.123,-.0053,0,1,0,4),f(-24.42,-25.1,.04,-.3,0,1,0,2),f(18.023,17.93,.007,.1494,0,1,0,1),f(-668.146,-126.98,-1.302,-.3997,0,1,0,0),f(.56,.32,-.001,-.0037,0,1,0,-1),f(-165.145,-165.06,.054,1.9178,0,1,0,-2),f(-1.877,-6.46,-.416,.0339,0,1,0,-4),f(.213,1.02,-.074,.0054,2,0,0,4),f(14.387,14.78,-.017,.2833,2,0,0,2),f(-.586,-1.2,.054,-.01,2,0,0,1),f(769.016,767.96,.107,10.1657,2,0,0,0),f(1.75,2.01,-.018,.0155,2,0,0,-1),f(-211.656,-152.53,5.679,-.3039,2,0,0,-2),f(1.225,.91,-.03,-.0088,2,0,0,-3),f(-30.773,-34.07,-.308,.3722,2,0,0,-4),f(-.57,-1.4,-.074,.0109,2,0,0,-6),f(-2.921,-11.75,.787,-.0484,1,1,0,2),f(1.267,1.52,-.022,.0164,1,1,0,1),f(-109.673,-115.18,.461,-.949,1,1,0,0),f(-205.962,-182.36,2.056,1.4437,1,1,0,-2),f(.233,.36,.012,-.0025,1,1,0,-3),f(-4.391,-9.66,-.471,.0673,1,1,0,-4),f(.283,1.53,-.111,.006,1,-1,0,4),f(14.577,31.7,-1.54,.2302,1,-1,0,2),f(147.687,138.76,.679,1.1528,1,-1,0,0),f(-1.089,.55,.021,0,1,-1,0,-1),f(28.475,23.59,-.443,-.2257,1,-1,0,-2),f(-.276,-.38,-.006,-.0036,1,-1,0,-3),f(.636,2.27,.146,-.0102,1,-1,0,-4),f(-.189,-1.68,.131,-.0028,0,2,0,2),f(-7.486,-.66,-.037,-.0086,0,2,0,0),f(-8.096,-16.35,-.74,.0918,0,2,0,-2),f(-5.741,-.04,0,-9e-4,0,0,2,2),f(.255,0,0,0,0,0,2,1),f(-411.608,-.2,0,-.0124,0,0,2,0),f(.584,.84,0,.0071,0,0,2,-1),f(-55.173,-52.14,0,-.1052,0,0,2,-2),f(.254,.25,0,-.0017,0,0,2,-3),f(.025,-1.67,0,.0031,0,0,2,-4),f(1.06,2.96,-.166,.0243,3,0,0,2),f(36.124,50.64,-1.3,.6215,3,0,0,0),f(-13.193,-16.4,.258,-.1187,3,0,0,-2),f(-1.187,-.74,.042,.0074,3,0,0,-4),f(-.293,-.31,-.002,.0046,3,0,0,-6),f(-.29,-1.45,.116,-.0051,2,1,0,2),f(-7.649,-10.56,.259,-.1038,2,1,0,0),f(-8.627,-7.59,.078,-.0192,2,1,0,-2),f(-2.74,-2.54,.022,.0324,2,1,0,-4),f(1.181,3.32,-.212,.0213,2,-1,0,2),f(9.703,11.67,-.151,.1268,2,-1,0,0),f(-.352,-.37,.001,-.0028,2,-1,0,-1),f(-2.494,-1.17,-.003,-.0017,2,-1,0,-2),f(.36,.2,-.012,-.0043,2,-1,0,-4),f(-1.167,-1.25,.008,-.0106,1,2,0,0),f(-7.412,-6.12,.117,.0484,1,2,0,-2),f(-.311,-.65,-.032,.0044,1,2,0,-4),f(.757,1.82,-.105,.0112,1,-2,0,2),f(2.58,2.32,.027,.0196,1,-2,0,0),f(2.533,2.4,-.014,-.0212,1,-2,0,-2),f(-.344,-.57,-.025,.0036,0,3,0,-2),f(-.992,-.02,0,0,1,0,2,2),f(-45.099,-.02,0,-.001,1,0,2,0),f(-.179,-9.52,0,-.0833,1,0,2,-2),f(-.301,-.33,0,.0014,1,0,2,-4),f(-6.382,-3.37,0,-.0481,1,0,-2,2),f(39.528,85.13,0,-.7136,1,0,-2,0),f(9.366,.71,0,-.0112,1,0,-2,-2),f(.202,.02,0,0,1,0,-2,-4),f(.415,.1,0,.0013,0,1,2,0),f(-2.152,-2.26,0,-.0066,0,1,2,-2),f(-1.44,-1.3,0,.0014,0,1,-2,2),f(.384,-.04,0,0,0,1,-2,-2),f(1.938,3.6,-.145,.0401,4,0,0,0),f(-.952,-1.58,.052,-.013,4,0,0,-2),f(-.551,-.94,.032,-.0097,3,1,0,0),f(-.482,-.57,.005,-.0045,3,1,0,-2),f(.681,.96,-.026,.0115,3,-1,0,0),f(-.297,-.27,.002,-9e-4,2,2,0,-2),f(.254,.21,-.003,0,2,-2,0,-2),f(-.25,-.22,.004,.0014,1,3,0,-2),f(-3.996,0,0,4e-4,2,0,2,0),f(.557,-.75,0,-.009,2,0,2,-2),f(-.459,-.38,0,-.0053,2,0,-2,2),f(-1.298,.74,0,4e-4,2,0,-2,0),f(.538,1.14,0,-.0141,2,0,-2,-2),f(.263,.02,0,0,1,1,2,0),f(.426,.07,0,-6e-4,1,1,-2,-2),f(-.304,.03,0,3e-4,1,-1,2,0),f(-.372,-.19,0,-.0027,1,-1,-2,2),f(.418,0,0,0,0,0,4,0),f(-.33,-.04,0,0,3,0,2,0);function Re(_,B,X,j,te){return _*oa(B,X,j,te).y}g=0,g+=Re(-526.069,0,0,1,-2),g+=Re(-3.352,0,0,1,-4),g+=Re(44.297,1,0,1,-2),g+=Re(-6,1,0,1,-4),g+=Re(20.599,-1,0,1,0),g+=Re(-30.598,-1,0,1,-2),g+=Re(-24.649,-2,0,1,0),g+=Re(-2,-2,0,1,-2),g+=Re(-22.571,0,1,1,-2),g+=Re(10.985,0,-1,1,-2),A+=.82*H(.7736-62.5512*e)+.31*H(.0466-125.1025*e)+.35*H(.5785-25.1042*e)+.66*H(.4591+1335.8075*e)+.64*H(.313-91.568*e)+1.14*H(.148+1331.2898*e)+.21*H(.5918+1056.5859*e)+.44*H(.5784+1322.8595*e)+.24*H(.2275-5.7374*e)+.28*H(.2965+2.6929*e)+.33*H(.3132+6.3368*e),s=L+ye/it;let Lo=(1.000002708+139.978*v)*(18518.511+1.189+S)*Math.sin(s)-6.24*Math.sin(3*s)+g;return{geo_eclip_lon:Fe*Yt((y+A/it)/Fe),geo_eclip_lat:Math.PI/(180*3600)*Lo,distance_au:it*Rh/(.999953253*D)}}function Fh(t,e){return[t.rot[0][0]*e[0]+t.rot[1][0]*e[1]+t.rot[2][0]*e[2],t.rot[0][1]*e[0]+t.rot[1][1]*e[1]+t.rot[2][1]*e[2],t.rot[0][2]*e[0]+t.rot[1][2]*e[1]+t.rot[2][2]*e[2]]}function Hh(t,e,r){let i=Zs(e,r);return Fh(i,t)}function Zs(t,e){let r=t.tt/36525,i=84381.406,n=((((-951e-10*r+132851e-9)*r-.00114045)*r-1.0790069)*r+5038.481507)*r,a=((((3337e-10*r-467e-9)*r-.00772503)*r+.0512623)*r-.025754)*r+i,s=((((-56e-9*r+170663e-9)*r-.00121197)*r-2.3814292)*r+10.556403)*r;i*=Xt,n*=Xt,a*=Xt,s*=Xt;let o=Math.sin(i),c=Math.cos(i),l=Math.sin(-n),u=Math.cos(-n),h=Math.sin(-a),p=Math.cos(-a),v=Math.sin(s),A=Math.cos(s),g=A*u-l*v*p,S=A*l*c+v*p*u*c-o*v*h,D=A*l*o+v*p*u*o+c*v*h,y=-v*u-l*A*p,E=-v*l*c+A*p*u*c-o*A*h,N=-v*l*o+A*p*u*o+c*A*h,L=l*h,Y=-h*u*c-o*p,ee=-h*u*o+p*c;if(e===ke.Into2000)return new st([[g,S,D],[y,E,N],[L,Y,ee]]);if(e===ke.From2000)return new st([[g,y,L],[S,E,Y],[D,N,ee]]);throw"Invalid precess direction"}function Gh(t){let e=.779057273264+.00273781191135448*t.ut,r=t.ut%1,i=360*((e+r)%1);return i<0&&(i+=360),i}var ai;function zh(t){if(!ai||ai.tt!==t.tt){let e=t.tt/36525,r=15*Qs(t).ee,i=Gh(t),n=((r+.014506+((((-368e-10*e-29956e-9)*e-44e-8)*e+1.3915817)*e+4612.156534)*e)/3600+i)%360/15;n<0&&(n+=24),ai={tt:t.tt,st:n}}return ai.st}function kh(t){let e=xt(t);return zh(e)}function Wh(t,e){let r=Qs(t),i=r.mobl*St,n=r.tobl*St,a=r.dpsi*Xt,s=Math.cos(i),o=Math.sin(i),c=Math.cos(n),l=Math.sin(n),u=Math.cos(a),h=Math.sin(a),p=u,v=-h*s,A=-h*o,g=h*c,S=u*s*c+o*l,D=u*o*c-s*l,y=h*l,E=u*s*l-o*c,N=u*o*l+s*c;if(e===ke.From2000)return new st([[p,g,y],[v,S,E],[A,D,N]]);if(e===ke.Into2000)return new st([[p,v,A],[g,S,D],[y,E,N]]);throw"Invalid precess direction"}var me=class{constructor(e,r,i,n){this.x=e,this.y=r,this.z=i,this.t=n}Length(){return Math.hypot(this.x,this.y,this.z)}},Pn=class{constructor(e,r,i,n,a,s,o){this.x=e,this.y=r,this.z=i,this.vx=n,this.vy=a,this.vz=s,this.t=o}},Nn=class{constructor(e,r,i){this.lat=li(e),this.lon=li(r),this.dist=li(i)}};var st=class{constructor(e){this.rot=e}};function bn(t){let e=xt(t),r=Bh(e),i=r.distance_au*Math.cos(r.geo_eclip_lat),n=[i*Math.cos(r.geo_eclip_lon),i*Math.sin(r.geo_eclip_lon),r.distance_au*Math.sin(r.geo_eclip_lat)],a=Lh(e,n),s=Hh(a,e,ke.Into2000);return new me(s[0],s[1],s[2],e)}function Kt(t,e,r){let i=1,n=0;for(let a of t){let s=0;for(let[c,l,u]of a)s+=c*Math.cos(l+e*u);let o=i*s;r&&(o%=Fe),n+=o,i*=e}return n}function Cn(t,e){let r=1,i=0,n=0,a=0;for(let s of t){let o=0,c=0;for(let[l,u,h]of s){let p=u+e*h;o+=l*h*Math.sin(p),a>0&&(c+=l*Math.cos(p))}n+=a*i*c-r*o,i=r,r*=e,++a}return n}var Sr=365250,On=0,Un=1,Ln=2;function Bn(t){return new We(t[0]+44036e-11*t[1]-190919e-12*t[2],-479966e-12*t[0]+.917482137087*t[1]-.397776982902*t[2],.397776982902*t[1]+.917482137087*t[2])}function Ks(t,e,r){let i=r*Math.cos(e),n=Math.cos(t),a=Math.sin(t);return[i*n,i*a,r*Math.sin(e)]}function ui(t,e){let r=e.tt/Sr,i=Kt(t[On],r,!0),n=Kt(t[Un],r,!1),a=Kt(t[Ln],r,!1),s=Ks(i,n,a);return Bn(s).ToAstroVector(e)}function Vh(t,e){let r=e/Sr,i=Kt(t[On],r,!0),n=Kt(t[Un],r,!1),a=Kt(t[Ln],r,!1),s=Cn(t[On],r),o=Cn(t[Un],r),c=Cn(t[Ln],r),l=Math.cos(i),u=Math.sin(i),h=Math.cos(n),p=Math.sin(n),v=+(c*h*l)-a*p*l*o-a*h*u*s,A=+(c*h*u)-a*p*u*o+a*h*l*s,g=+(c*p)+a*h*o,S=Ks(i,n,a),D=[v/Sr,A/Sr,g/Sr],y=Bn(S),E=Bn(D);return new Jt(e,y,E)}function si(t,e,r,i){let n=i/(i+Vn),a=ui(Qt[r],e);t.x+=n*a.x,t.y+=n*a.y,t.z+=n*a.z}function Yh(t){let e=new me(0,0,0,t);return si(e,t,U.Jupiter,Rn),si(e,t,U.Saturn,_n),si(e,t,U.Uranus,In),si(e,t,U.Neptune,Mn),e}var Fn=51,Xh=29200,Zt=146,He=201,Tt=[[-73e4,[-26.118207232108,-14.376168177825,3.384402515299],[.0016339372163656,-.0027861699588508,-.0013585880229445]],[-700800,[41.974905202127,-.448502952929,-12.770351505989],[.00073458569351457,.0022785014891658,.00048619778602049]],[-671600,[14.706930780744,44.269110540027,9.353698474772],[-.00210001479998,.00022295915939915,.00070143443551414]],[-642400,[-29.441003929957,-6.43016153057,6.858481011305],[.00084495803960544,-.0030783914758711,-.0012106305981192]],[-613200,[39.444396946234,-6.557989760571,-13.913760296463],[.0011480029005873,.0022400006880665,.00035168075922288]],[-584e3,[20.2303809507,43.266966657189,7.382966091923],[-.0019754081700585,.00053457141292226,.00075929169129793]],[-554800,[-30.65832536462,2.093818874552,9.880531138071],[61010603013347e-18,-.0031326500935382,-.00099346125151067]],[-525600,[35.737703251673,-12.587706024764,-14.677847247563],[.0015802939375649,.0021347678412429,.00019074436384343]],[-496400,[25.466295188546,41.367478338417,5.216476873382],[-.0018054401046468,.0008328308359951,.00080260156912107]],[-467200,[-29.847174904071,10.636426313081,12.297904180106],[-.00063257063052907,-.0029969577578221,-.00074476074151596]],[-438e3,[30.774692107687,-18.236637015304,-14.945535879896],[.0020113162005465,.0019353827024189,-20937793168297e-19]],[-408800,[30.243153324028,38.656267888503,2.938501750218],[-.0016052508674468,.0011183495337525,.00083333973416824]],[-379600,[-27.288984772533,18.643162147874,14.023633623329],[-.0011856388898191,-.0027170609282181,-.00049015526126399]],[-350400,[24.519605196774,-23.245756064727,-14.626862367368],[.0024322321483154,.0016062008146048,-.00023369181613312]],[-321200,[34.505274805875,35.125338586954,.557361475637],[-.0013824391637782,.0013833397561817,.00084823598806262]],[-292e3,[-23.275363915119,25.818514298769,15.055381588598],[-.0016062295460975,-.0023395961498533,-.00024377362639479]],[-262800,[17.050384798092,-27.180376290126,-13.608963321694],[.0028175521080578,.0011358749093955,-.00049548725258825]],[-233600,[38.093671910285,30.880588383337,-1.843688067413],[-.0011317697153459,.0016128814698472,.00084177586176055]],[-204400,[-18.197852930878,31.932869934309,15.438294826279],[-.0019117272501813,-.0019146495909842,-19657304369835e-18]],[-175200,[8.528924039997,-29.618422200048,-11.805400994258],[.0031034370787005,.0005139363329243,-.00077293066202546]],[-146e3,[40.94685725864,25.904973592021,-4.256336240499],[-.00083652705194051,.0018129497136404,.0008156422827306]],[-116800,[-12.326958895325,36.881883446292,15.217158258711],[-.0021166103705038,-.001481442003599,.00017401209844705]],[-87600,[-.633258375909,-30.018759794709,-9.17193287495],[.0032016994581737,-.00025279858672148,-.0010411088271861]],[-58400,[42.936048423883,20.344685584452,-6.588027007912],[-.00050525450073192,.0019910074335507,.00077440196540269]],[-29200,[-5.975910552974,40.61180995846,14.470131723673],[-.0022184202156107,-.0010562361130164,.00033652250216211]],[0,[-9.875369580774,-27.978926224737,-5.753711824704],[.0030287533248818,-.0011276087003636,-.0012651326732361]],[29200,[43.958831986165,14.214147973292,-8.808306227163],[-.00014717608981871,.0021404187242141,.00071486567806614]],[58400,[.67813676352,43.094461639362,13.243238780721],[-.0022358226110718,-.00063233636090933,.00047664798895648]],[87600,[-18.282602096834,-23.30503958666,-1.766620508028],[.0025567245263557,-.0019902940754171,-.0013943491701082]],[116800,[43.873338744526,7.700705617215,-10.814273666425],[.00023174803055677,.0022402163127924,.00062988756452032]],[146e3,[7.392949027906,44.382678951534,11.629500214854],[-.002193281545383,-.00021751799585364,.00059556516201114]],[175200,[-24.981690229261,-16.204012851426,2.466457544298],[.001819398914958,-.0026765419531201,-.0013848283502247]],[204400,[42.530187039511,.845935508021,-12.554907527683],[.00065059779150669,.0022725657282262,.00051133743202822]],[233600,[13.999526486822,44.462363044894,9.669418486465],[-.0021079296569252,.00017533423831993,.00069128485798076]],[262800,[-29.184024803031,-7.371243995762,6.493275957928],[.00093581363109681,-.0030610357109184,-.0012364201089345]],[292e3,[39.831980671753,-6.078405766765,-13.909815358656],[.0011117769689167,.0022362097830152,.00036230548231153]],[321200,[20.294955108476,43.417190420251,7.450091985932],[-.0019742157451535,.00053102050468554,.00075938408813008]],[350400,[-30.66999230216,2.318743558955,9.973480913858],[45605107450676e-18,-.0031308219926928,-.00099066533301924]],[379600,[35.626122155983,-12.897647509224,-14.777586508444],[.0016015684949743,.0021171931182284,.00018002516202204]],[408800,[26.133186148561,41.232139187599,5.00640132622],[-.0017857704419579,.00086046232702817,.00080614690298954]],[438e3,[-29.57674022923,11.863535943587,12.631323039872],[-.00072292830060955,-.0029587820140709,-.000708242964503]],[467200,[29.910805787391,-19.159019294,-15.013363865194],[.0020871080437997,.0018848372554514,-38528655083926e-18]],[496400,[31.375957451819,38.050372720763,2.433138343754],[-.0015546055556611,.0011699815465629,.00083565439266001]],[525600,[-26.360071336928,20.662505904952,14.414696258958],[-.0013142373118349,-.0026236647854842,-.00042542017598193]],[554800,[22.599441488648,-24.508879898306,-14.484045731468],[.0025454108304806,.0014917058755191,-.00030243665086079]],[584e3,[35.877864013014,33.894226366071,-.224524636277],[-.0012941245730845,.0014560427668319,.00084762160640137]],[613200,[-21.538149762417,28.204068269761,15.321973799534],[-.001731211740901,-.0021939631314577,-.0001631691327518]],[642400,[13.971521374415,-28.339941764789,-13.083792871886],[.0029334630526035,.00091860931752944,-.00059939422488627]],[671600,[39.526942044143,28.93989736011,-2.872799527539],[-.0010068481658095,.001702113288809,.00083578230511981]],[700800,[-15.576200701394,34.399412961275,15.466033737854],[-.0020098814612884,-.0017191109825989,70414782780416e-18]],[73e4,[4.24325283709,-30.118201690825,-10.707441231349],[.0031725847067411,.0001609846120227,-.00090672150593868]]],We=class t{constructor(e,r,i){this.x=e,this.y=r,this.z=i}clone(){return new t(this.x,this.y,this.z)}ToAstroVector(e){return new me(this.x,this.y,this.z,e)}static zero(){return new t(0,0,0)}quadrature(){return this.x*this.x+this.y*this.y+this.z*this.z}add(e){return new t(this.x+e.x,this.y+e.y,this.z+e.z)}sub(e){return new t(this.x-e.x,this.y-e.y,this.z-e.z)}incr(e){this.x+=e.x,this.y+=e.y,this.z+=e.z}decr(e){this.x-=e.x,this.y-=e.y,this.z-=e.z}mul(e){return new t(e*this.x,e*this.y,e*this.z)}div(e){return new t(this.x/e,this.y/e,this.z/e)}mean(e){return new t((this.x+e.x)/2,(this.y+e.y)/2,(this.z+e.z)/2)}neg(){return new t(-this.x,-this.y,-this.z)}},Jt=class t{constructor(e,r,i){this.tt=e,this.r=r,this.v=i}clone(){return new t(this.tt,this.r,this.v)}sub(e){return new t(this.tt,this.r.sub(e.r),this.v.sub(e.v))}};function Qh(t){let[e,[r,i,n],[a,s,o]]=t;return new Jt(e,new We(r,i,n),new We(a,s,o))}function oi(t,e,r,i){let n=i/(i+Vn),a=Vh(Qt[r],e);return t.r.incr(a.r.mul(n)),t.v.incr(a.v.mul(n)),a}function Tr(t,e,r){let i=r.sub(t),n=i.quadrature();return i.mul(e/(n*Math.sqrt(n)))}var wr=class{constructor(e){let r=new Jt(e,new We(0,0,0),new We(0,0,0));this.Jupiter=oi(r,e,U.Jupiter,Rn),this.Saturn=oi(r,e,U.Saturn,_n),this.Uranus=oi(r,e,U.Uranus,In),this.Neptune=oi(r,e,U.Neptune,Mn),this.Jupiter.r.decr(r.r),this.Jupiter.v.decr(r.v),this.Saturn.r.decr(r.r),this.Saturn.v.decr(r.v),this.Uranus.r.decr(r.r),this.Uranus.v.decr(r.v),this.Neptune.r.decr(r.r),this.Neptune.v.decr(r.v),this.Sun=new Jt(e,r.r.mul(-1),r.v.mul(-1))}Acceleration(e){let r=Tr(e,Vn,this.Sun.r);return r.incr(Tr(e,Rn,this.Jupiter.r)),r.incr(Tr(e,_n,this.Saturn.r)),r.incr(Tr(e,In,this.Uranus.r)),r.incr(Tr(e,Mn,this.Neptune.r)),r}},di=class t{constructor(e,r,i,n){this.tt=e,this.r=r,this.v=i,this.a=n}clone(){return new t(this.tt,this.r.clone(),this.v.clone(),this.a.clone())}},fi=class{constructor(e,r){this.bary=e,this.grav=r}};function mi(t,e,r,i){return new We(e.x+t*(r.x+t*i.x/2),e.y+t*(r.y+t*i.y/2),e.z+t*(r.z+t*i.z/2))}function Is(t,e,r){return new We(e.x+t*r.x,e.y+t*r.y,e.z+t*r.z)}function Hn(t,e){let r=t-e.tt,i=new wr(t),n=mi(r,e.r,e.v,e.a),a=i.Acceleration(n).mean(e.a),s=mi(r,e.r,e.v,a),o=e.v.add(a.mul(r)),c=i.Acceleration(s),l=new di(t,s,o,c);return new fi(i,l)}var Zh=[];function js(t,e){let r=Math.floor(t);return r<0?0:r>=e?e-1:r}function Gn(t){let e=Qh(t),r=new wr(e.tt),i=e.r.add(r.Sun.r),n=e.v.add(r.Sun.v),a=r.Acceleration(i),s=new di(e.tt,i,n,a);return new fi(r,s)}function Kh(t,e){let r=Tt[0][0];if(e<r||e>Tt[Fn-1][0])return null;let i=js((e-r)/Xh,Fn-1);if(!t[i]){let a=t[i]=[];a[0]=Gn(Tt[i]).grav,a[He-1]=Gn(Tt[i+1]).grav;let s,o=a[0].tt;for(s=1;s<He-1;++s)a[s]=Hn(o+=Zt,a[s-1]).grav;o=a[He-1].tt;var n=[];for(n[He-1]=a[He-1],s=He-2;s>0;--s)n[s]=Hn(o-=Zt,n[s+1]).grav;for(s=He-2;s>0;--s){let c=s/(He-1);a[s].r=a[s].r.mul(1-c).add(n[s].r.mul(c)),a[s].v=a[s].v.mul(1-c).add(n[s].v.mul(c)),a[s].a=a[s].a.mul(1-c).add(n[s].a.mul(c))}}return t[i]}function Ms(t,e,r){let i=Gn(t),n=Math.ceil((e-i.grav.tt)/r);for(let a=0;a<n;++a)i=Hn(a+1===n?e:i.grav.tt+r,i.grav);return i}function jh(t,e){let r,i,n,a=Kh(Zh,t.tt);if(a){let s=js((t.tt-a[0].tt)/Zt,He-1),o=a[s],c=a[s+1],l=o.a.mean(c.a),u=mi(t.tt-o.tt,o.r,o.v,l),h=Is(t.tt-o.tt,o.v,l),p=mi(t.tt-c.tt,c.r,c.v,l),v=Is(t.tt-c.tt,c.v,l),A=(t.tt-o.tt)/Zt;r=u.mul(1-A).add(p.mul(A)),i=h.mul(1-A).add(v.mul(A))}else{let s;t.tt<Tt[0][0]?s=Ms(Tt[0],t.tt,-Zt):s=Ms(Tt[Fn-1],t.tt,+Zt),r=s.grav.r,i=s.grav.v,n=s.bary}return n||(n=new wr(t.tt)),r=r.sub(n.Sun.r),i=i.sub(n.Sun.v),new Pn(r.x,r.y,r.z,i.x,i.y,i.z,t)}function xr(t,e){var r=xt(e);if(t in Qt)return ui(Qt[t],r);if(t===U.Pluto){let s=jh(r);return new me(s.x,s.y,s.z,r)}if(t===U.Sun)return new me(0,0,0,r);if(t===U.Moon){var i=ui(Qt.Earth,r),n=bn(r);return new me(i.x+n.x,i.y+n.y,i.z+n.z,r)}if(t===U.EMB){let s=ui(Qt.Earth,r),o=bn(r),c=1+_h;return new me(s.x+o.x/c,s.y+o.y/c,s.z+o.z/c,r)}if(t===U.SSB)return Yh(r);let a=Ys(t);if(a){let s=new Nn(a.dec,15*a.ra,a.dist);return rd(s,r)}throw`HelioVector: Unknown body "${t}"`}function qh(t,e){let r=e,i=0;for(let n=0;n<10;++n){let a=t(r),s=a.Length()/xh;if(s>1)throw"Object is too distant for light-travel solver.";let o=e.AddDays(-s);if(i=Math.abs(o.tt-r.tt),i<1e-9)return a;r=o}throw`Light-travel time solver did not converge: dt = ${i}`}var zn=class{constructor(e,r,i,n){this.observerBody=e,this.targetBody=r,this.aberration=i,this.observerPos=n}Position(e){this.aberration&&(this.observerPos=xr(this.observerBody,e));let r=xr(this.targetBody,e);return new me(r.x-this.observerPos.x,r.y-this.observerPos.y,r.z-this.observerPos.z,e)}};function Jh(t,e,r,i){let n=xt(t);if(Ys(r)){let o=xr(r,n),c=xr(e,n);return new me(o.x-c.x,o.y-c.y,o.z-c.z,n)}let a;a=xr(e,n);let s=new zn(e,r,i,a);return qh(o=>s.Position(o),n)}function $h(t,e,r){let i=xt(e);switch(t){case U.Earth:return new me(0,0,0,i);case U.Moon:return bn(i);default:let n=Jh(i,U.Earth,t,r);return n.t=i,n}}var Ps;(function(t){t[t.Pericenter=0]="Pericenter",t[t.Apocenter=1]="Apocenter"})(Ps||(Ps={}));function ed(t,e){return new st([[e.rot[0][0]*t.rot[0][0]+e.rot[1][0]*t.rot[0][1]+e.rot[2][0]*t.rot[0][2],e.rot[0][1]*t.rot[0][0]+e.rot[1][1]*t.rot[0][1]+e.rot[2][1]*t.rot[0][2],e.rot[0][2]*t.rot[0][0]+e.rot[1][2]*t.rot[0][1]+e.rot[2][2]*t.rot[0][2]],[e.rot[0][0]*t.rot[1][0]+e.rot[1][0]*t.rot[1][1]+e.rot[2][0]*t.rot[1][2],e.rot[0][1]*t.rot[1][0]+e.rot[1][1]*t.rot[1][1]+e.rot[2][1]*t.rot[1][2],e.rot[0][2]*t.rot[1][0]+e.rot[1][2]*t.rot[1][1]+e.rot[2][2]*t.rot[1][2]],[e.rot[0][0]*t.rot[2][0]+e.rot[1][0]*t.rot[2][1]+e.rot[2][0]*t.rot[2][2],e.rot[0][1]*t.rot[2][0]+e.rot[1][1]*t.rot[2][1]+e.rot[2][1]*t.rot[2][2],e.rot[0][2]*t.rot[2][0]+e.rot[1][2]*t.rot[2][1]+e.rot[2][2]*t.rot[2][2]]])}function td(t,e,r){let i=li(r)*St,n=Math.cos(i),a=Math.sin(i),s=(e+1)%3,o=(e+2)%3,c=e,l=[[0,0,0],[0,0,0],[0,0,0]];return l[s][s]=n*t.rot[s][s]-a*t.rot[s][o],l[s][o]=a*t.rot[s][s]+n*t.rot[s][o],l[s][c]=t.rot[s][c],l[o][s]=n*t.rot[o][s]-a*t.rot[o][o],l[o][o]=a*t.rot[o][s]+n*t.rot[o][o],l[o][c]=t.rot[o][c],l[c][s]=n*t.rot[c][s]-a*t.rot[c][o],l[c][o]=a*t.rot[c][s]+n*t.rot[c][o],l[c][c]=t.rot[c][c],new st(l)}function rd(t,e){e=xt(e);let r=t.lat*St,i=t.lon*St,n=t.dist*Math.cos(r);return new me(n*Math.cos(i),n*Math.sin(i),t.dist*Math.sin(r),e)}function id(t){t=xt(t);let e=Zs(t,ke.From2000),r=Wh(t,ke.From2000);return ed(e,r)}var Ns;(function(t){t.Penumbral="penumbral",t.Partial="partial",t.Annular="annular",t.Total="total"})(Ns||(Ns={}));var bs;(function(t){t[t.Invalid=0]="Invalid",t[t.Ascending=1]="Ascending",t[t.Descending=-1]="Descending"})(bs||(bs={}));var nd=.001/Vs,ad=new O;var qs=new ne,sd=new ne;function vi(t){return t instanceof qt?t:new qt(t instanceof Date?t:new Date(t))}function Js(t,e=new O){let{x:r,y:i,z:n}=t;return e.set(r,i,n)}function $s(t,e=new ne){let[r,i,n]=t.rot;return e.set(r[0],i[0],n[0],0,r[1],i[1],n[1],0,r[2],i[2],n[2],0,0,0,0,1)}function Ai(t,e=new ne){let r=vi(t),i=td(id(r),2,-15*kh(r));return $s(i,e)}function eo(t,e,r,i,n){let a=$h(t,e,!1);if(Js(a,r),i!=null){let s=Ai(e,sd).transpose();r.sub(ad.copy(i).applyMatrix4(s).multiplyScalar(nd))}return r.normalize()}function Ti(t,e=new O,r){let i=vi(t);return eo(U.Sun,i,e,r).applyMatrix4(Ai(i,qs))}function Yn(t,e=new O,r){let i=vi(t);return eo(U.Moon,i,e,r).applyMatrix4(Ai(i,qs))}var od=`precision highp float;
precision highp sampler3D;

#include "bruneton/definitions"
#include "bruneton/common"
#include "bruneton/precompute"

uniform AtmosphereParameters ATMOSPHERE;

uniform sampler2D transmittanceTexture;

layout(location = 0) out vec4 outputColor;

void main() {
  vec3 deltaIrradiance;
  vec3 irradiance;
  deltaIrradiance = ComputeDirectIrradianceTexture(
    ATMOSPHERE,
    transmittanceTexture,
    gl_FragCoord.xy
  );
  irradiance = vec3(0.0);
  outputColor = vec4(OUTPUT, 1.0);
}
`,cd=`precision highp float;
precision highp sampler3D;

#include "bruneton/definitions"
#include "bruneton/common"
#include "bruneton/precompute"

uniform AtmosphereParameters ATMOSPHERE;

uniform mat3 luminanceFromRadiance;
uniform sampler3D singleRayleighScatteringTexture;
uniform sampler3D singleMieScatteringTexture;
uniform sampler3D multipleScatteringTexture;
uniform int scatteringOrder;

layout(location = 0) out vec4 outputColor;

void main() {
  vec3 deltaIrradiance;
  vec3 irradiance;
  deltaIrradiance = ComputeIndirectIrradianceTexture(
    ATMOSPHERE,
    singleRayleighScatteringTexture,
    singleMieScatteringTexture,
    multipleScatteringTexture,
    gl_FragCoord.xy,
    scatteringOrder
  );
  irradiance = luminanceFromRadiance * deltaIrradiance;
  outputColor = vec4(OUTPUT, 1.0);
}
`,ld=`precision highp float;
precision highp sampler3D;

#include "bruneton/definitions"
#include "bruneton/common"
#include "bruneton/precompute"

uniform AtmosphereParameters ATMOSPHERE;

uniform mat3 luminanceFromRadiance;
uniform sampler2D transmittanceTexture;
uniform sampler3D scatteringDensityTexture;
uniform int layer;

layout(location = 0) out vec4 outputColor;

void main() {
  vec4 deltaMultipleScattering;
  vec4 scattering;
  float nu;
  deltaMultipleScattering.rgb = ComputeMultipleScatteringTexture(
    ATMOSPHERE,
    transmittanceTexture,
    scatteringDensityTexture,
    vec3(gl_FragCoord.xy, float(layer) + 0.5),
    nu
  );
  deltaMultipleScattering.a = 1.0;
  scattering = vec4(
    luminanceFromRadiance * deltaMultipleScattering.rgb / RayleighPhaseFunction(nu),
    0.0
  );
  outputColor = OUTPUT;
}
`,ud=`precision highp float;
precision highp sampler3D;

#include "bruneton/definitions"
#include "bruneton/common"
#include "bruneton/precompute"

uniform AtmosphereParameters ATMOSPHERE;

uniform sampler2D transmittanceTexture;
uniform sampler3D singleRayleighScatteringTexture;
uniform sampler3D singleMieScatteringTexture;
uniform sampler3D multipleScatteringTexture;
uniform sampler2D irradianceTexture;
uniform int scatteringOrder;
uniform int layer;

layout(location = 0) out vec4 scatteringDensity;

void main() {
  scatteringDensity.rgb = ComputeScatteringDensityTexture(
    ATMOSPHERE,
    transmittanceTexture,
    singleRayleighScatteringTexture,
    singleMieScatteringTexture,
    multipleScatteringTexture,
    irradianceTexture,
    vec3(gl_FragCoord.xy, float(layer) + 0.5),
    scatteringOrder
  );
  scatteringDensity.a = 1.0;
}
`,hd=`precision highp float;
precision highp sampler3D;

#include "bruneton/definitions"
#include "bruneton/common"
#include "bruneton/precompute"

uniform AtmosphereParameters ATMOSPHERE;

uniform mat3 luminanceFromRadiance;
uniform sampler2D transmittanceTexture;
uniform int layer;

layout(location = 0) out vec4 outputColor;

void main() {
  vec4 deltaRayleigh;
  vec4 deltaMie;
  vec4 scattering;
  vec4 singleMieScattering;
  ComputeSingleScatteringTexture(
    ATMOSPHERE,
    transmittanceTexture,
    vec3(gl_FragCoord.xy, float(layer) + 0.5),
    deltaRayleigh.rgb,
    deltaMie.rgb
  );
  deltaRayleigh.a = 1.0;
  deltaMie.a = 1.0;
  scattering = vec4(
    luminanceFromRadiance * deltaRayleigh.rgb,
    (luminanceFromRadiance * deltaMie.rgb).r
  );
  singleMieScattering.rgb = luminanceFromRadiance * deltaMie.rgb;
  singleMieScattering.a = 1.0;
  outputColor = OUTPUT;
}
`,dd=`precision highp float;
precision highp sampler3D;

#include "bruneton/definitions"
#include "bruneton/common"
#include "bruneton/precompute"

uniform AtmosphereParameters ATMOSPHERE;

layout(location = 0) out vec4 transmittance;

void main() {
  transmittance.rgb = ComputeTransmittanceToTopAtmosphereBoundaryTexture(
    ATMOSPHERE,
    gl_FragCoord.xy
  );
  transmittance.a = 1.0;
}
`,fd=`
  precision highp float;
  in vec2 position;
  void main() {
    gl_Position = vec4(position, 1.0, 1.0);
  }
`;function pi(t,e,r){let i=new rh(e,r,{depthBuffer:!1,type:t,format:Hs}),n=i.texture;return n.minFilter=hi,n.magFilter=hi,n.wrapS=Er,n.wrapT=Er,n.colorSpace=Gs,i}function jt(t,e,r,i){let n=new lh(e,r,i,{depthBuffer:!1,type:t,format:Hs}),a=n.texture;return a.minFilter=hi,a.magFilter=hi,a.wrapS=Er,a.wrapT=Er,a.wrapR=Er,a.colorSpace=Gs,n}function md(t){let e=t[Symbol.iterator]();return new Promise((r,i)=>{let n=()=>{try{let{value:a,done:s}=e.next();s===!0?r(a):yn(n)}catch(a){i(a instanceof Error?a:new Error)}};yn(n)})}async function Os(t,e,r){let{width:i,height:n}=e,a=r.type===nt?new Uint16Array(i*n*4):new Float32Array(i*n*4);await t.readRenderTargetPixelsAsync(e,0,0,e.width,e.height,a),r.userData.imageData=a}var kn=class{constructor(e){this.lambdas=new O,this.luminanceFromRadiance=new ci,e===nt&&(this.opticalDepth=pi(e,vt,At)),this.deltaIrradiance=pi(e,pt,gt),this.deltaRayleighScattering=jt(e,$e,et,tt),this.deltaMieScattering=jt(e,$e,et,tt),this.deltaScatteringDensity=jt(e,$e,et,tt),this.deltaMultipleScattering=this.deltaRayleighScattering}dispose(){var e;(e=this.opticalDepth)==null||e.dispose(),this.deltaIrradiance.dispose(),this.deltaRayleighScattering.dispose(),this.deltaMieScattering.dispose(),this.deltaScatteringDensity.dispose()}},at=class extends Fs{constructor(e){super({glslVersion:Wn,vertexShader:fd,...e,defines:{TRANSMITTANCE_TEXTURE_WIDTH:vt.toFixed(0),TRANSMITTANCE_TEXTURE_HEIGHT:At.toFixed(0),SCATTERING_TEXTURE_R_SIZE:Ft.toFixed(0),SCATTERING_TEXTURE_MU_SIZE:Ht.toFixed(0),SCATTERING_TEXTURE_MU_S_SIZE:Gt.toFixed(0),SCATTERING_TEXTURE_NU_SIZE:zt.toFixed(0),IRRADIANCE_TEXTURE_WIDTH:pt.toFixed(0),IRRADIANCE_TEXTURE_HEIGHT:gt.toFixed(0),...e.defines}})}set additive(e){this.transparent=e,this.blending=e?oh:ch,this.blendEquation=Ds,this.blendEquationAlpha=Ds,this.blendSrc=ii,this.blendDst=ii,this.blendSrcAlpha=ii,this.blendDstAlpha=ii}setUniforms(e){let r=this.uniforms;r.luminanceFromRadiance!=null&&r.luminanceFromRadiance.value.copy(e.luminanceFromRadiance),r.singleRayleighScatteringTexture!=null&&(r.singleRayleighScatteringTexture.value=e.deltaRayleighScattering.texture),r.singleMieScatteringTexture!=null&&(r.singleMieScatteringTexture.value=e.deltaMieScattering.texture),r.multipleScatteringTexture!=null&&(r.multipleScatteringTexture.value=e.deltaMultipleScattering.texture),r.scatteringDensityTexture!=null&&(r.scatteringDensityTexture.value=e.deltaScatteringDensity.texture),r.irradianceTexture!=null&&(r.irradianceTexture.value=e.deltaIrradiance.texture)}},yr=class{constructor(e,{type:r=Za(e)?sh:nt,combinedScattering:i=!0,higherOrderScattering:n=!0}={}){var a,s;this.transmittanceMaterial=new at({fragmentShader:k(dd,{bruneton:{common:ve,definitions:Ae,precompute:rt}})}),this.directIrradianceMaterial=new at({fragmentShader:k(od,{bruneton:{common:ve,definitions:Ae,precompute:rt}}),uniforms:{transmittanceTexture:new m(null)}}),this.singleScatteringMaterial=new at({fragmentShader:k(hd,{bruneton:{common:ve,definitions:Ae,precompute:rt}}),uniforms:{luminanceFromRadiance:new m(new ci),transmittanceTexture:new m(null),layer:new m(0)}}),this.scatteringDensityMaterial=new at({fragmentShader:k(ud,{bruneton:{common:ve,definitions:Ae,precompute:rt}}),uniforms:{transmittanceTexture:new m(null),singleRayleighScatteringTexture:new m(null),singleMieScatteringTexture:new m(null),multipleScatteringTexture:new m(null),irradianceTexture:new m(null),scatteringOrder:new m(0),layer:new m(0)}}),this.indirectIrradianceMaterial=new at({fragmentShader:k(cd,{bruneton:{common:ve,definitions:Ae,precompute:rt}}),uniforms:{luminanceFromRadiance:new m(new ci),singleRayleighScatteringTexture:new m(null),singleMieScatteringTexture:new m(null),multipleScatteringTexture:new m(null),scatteringOrder:new m(0)}}),this.multipleScatteringMaterial=new at({fragmentShader:k(ld,{bruneton:{common:ve,definitions:Ae,precompute:rt}}),uniforms:{luminanceFromRadiance:new m(new ci),transmittanceTexture:new m(null),scatteringDensityTexture:new m(null),layer:new m(0)}}),this.mesh=new ih(new nh(2,2)),this.scene=new ah().add(this.mesh),this.camera=new Ls,this.updating=!1,this.renderer=e,this.type=r,this.transmittanceRenderTarget=pi(r,vt,At),this.scatteringRenderTarget=jt(r,$e,et,tt),this.irradianceRenderTarget=pi(r,pt,gt),i||(this.singleMieScatteringRenderTarget=jt(r,$e,et,tt)),n&&(this.higherOrderScatteringRenderTarget=jt(r,$e,et,tt)),this.textures={transmittanceTexture:this.transmittanceRenderTarget.texture,scatteringTexture:this.scatteringRenderTarget.texture,irradianceTexture:this.irradianceRenderTarget.texture,singleMieScatteringTexture:(a=this.singleMieScatteringRenderTarget)==null?void 0:a.texture,higherOrderScatteringTexture:(s=this.higherOrderScatteringRenderTarget)==null?void 0:s.texture}}render3DRenderTarget(e,r){for(let i=0;i<e.depth;++i)r.uniforms.layer.value=i,this.renderer.setRenderTarget(e,i),this.renderer.render(this.scene,this.camera)}computeTransmittance(e){let r=this.transmittanceMaterial;delete r.defines.TRANSMITTANCE_PRECISION_LOG,r.needsUpdate=!0,this.mesh.material=r,this.renderer.setRenderTarget(e.renderTarget),this.renderer.render(this.scene,this.camera)}computeOpticalDepth(e){let r=this.transmittanceMaterial;r.defines.TRANSMITTANCE_PRECISION_LOG="1",r.needsUpdate=!0,this.mesh.material=r,this.renderer.setRenderTarget(e.renderTarget),this.renderer.render(this.scene,this.camera)}computeDirectIrradiance(e){var n;let r=this.directIrradianceMaterial;r.defines.OUTPUT=e.output,r.additive=e.additive,this.type===nt?r.defines.TRANSMITTANCE_PRECISION_LOG="1":delete r.defines.TRANSMITTANCE_PRECISION_LOG,r.needsUpdate=!0;let i=r.uniforms;i.transmittanceTexture.value=((n=e.context.opticalDepth)==null?void 0:n.texture)??this.transmittanceRenderTarget.texture,this.mesh.material=r,this.renderer.setRenderTarget(e.renderTarget),this.renderer.render(this.scene,this.camera)}computeSingleScattering(e){var n;let r=this.singleScatteringMaterial;r.defines.OUTPUT=e.output,r.additive=e.additive,this.type===nt?r.defines.TRANSMITTANCE_PRECISION_LOG="1":delete r.defines.TRANSMITTANCE_PRECISION_LOG,r.needsUpdate=!0;let i=r.uniforms;i.transmittanceTexture.value=((n=e.context.opticalDepth)==null?void 0:n.texture)??this.transmittanceRenderTarget.texture,r.setUniforms(e.context),this.mesh.material=r,this.render3DRenderTarget(e.renderTarget,r)}computeScatteringDensity(e){var n;let r=this.scatteringDensityMaterial;this.type===nt?r.defines.TRANSMITTANCE_PRECISION_LOG="1":delete r.defines.TRANSMITTANCE_PRECISION_LOG,r.needsUpdate=!0;let i=r.uniforms;i.transmittanceTexture.value=((n=e.context.opticalDepth)==null?void 0:n.texture)??this.transmittanceRenderTarget.texture,i.scatteringOrder.value=e.scatteringOrder,r.setUniforms(e.context),this.mesh.material=r,this.render3DRenderTarget(e.renderTarget,r)}computeIndirectIrradiance(e){let r=this.indirectIrradianceMaterial;r.defines.OUTPUT=e.output,r.additive=e.additive,r.needsUpdate=!0;let i=r.uniforms;i.scatteringOrder.value=e.scatteringOrder-1,r.setUniforms(e.context),this.mesh.material=r,this.renderer.setRenderTarget(e.renderTarget),this.renderer.render(this.scene,this.camera)}computeMultipleScattering(e){var n;let r=this.multipleScatteringMaterial;r.defines.OUTPUT=e.output,r.additive=e.additive,this.type===nt?r.defines.TRANSMITTANCE_PRECISION_LOG="1":delete r.defines.TRANSMITTANCE_PRECISION_LOG,r.needsUpdate=!0;let i=r.uniforms;i.transmittanceTexture.value=((n=e.context.opticalDepth)==null?void 0:n.texture)??this.transmittanceRenderTarget.texture,r.setUniforms(e.context),this.mesh.material=r,this.render3DRenderTarget(e.renderTarget,r)}*precompute(e,r){this.computeTransmittance({renderTarget:this.transmittanceRenderTarget}),this.type===nt&&(Cs(e.opticalDepth!=null),this.computeOpticalDepth({renderTarget:e.opticalDepth})),this.computeDirectIrradiance({renderTarget:e.deltaIrradiance,context:e,output:"deltaIrradiance",additive:!1}),this.computeDirectIrradiance({renderTarget:this.irradianceRenderTarget,context:e,output:"irradiance",additive:r}),this.renderer.setRenderTarget(null),yield,this.computeSingleScattering({renderTarget:e.deltaRayleighScattering,context:e,output:"deltaRayleigh",additive:!1}),this.computeSingleScattering({renderTarget:e.deltaMieScattering,context:e,output:"deltaMie",additive:!1}),this.computeSingleScattering({renderTarget:this.scatteringRenderTarget,context:e,output:"scattering",additive:r}),this.singleMieScatteringRenderTarget!=null&&this.computeSingleScattering({renderTarget:this.singleMieScatteringRenderTarget,context:e,output:"singleMieScattering",additive:r}),this.renderer.setRenderTarget(null),yield;for(let i=2;i<=4;++i)this.computeScatteringDensity({renderTarget:e.deltaScatteringDensity,context:e,scatteringOrder:i}),this.computeIndirectIrradiance({renderTarget:e.deltaIrradiance,context:e,scatteringOrder:i,output:"deltaIrradiance",additive:!1}),this.computeIndirectIrradiance({renderTarget:this.irradianceRenderTarget,context:e,scatteringOrder:i,output:"irradiance",additive:!0}),this.computeMultipleScattering({renderTarget:e.deltaMultipleScattering,context:e,output:"deltaMultipleScattering",additive:!1}),this.computeMultipleScattering({renderTarget:this.scatteringRenderTarget,context:e,output:"scattering",additive:!0}),this.higherOrderScatteringRenderTarget!=null&&this.computeMultipleScattering({renderTarget:this.higherOrderScatteringRenderTarget,context:e,output:"scattering",additive:!0}),this.renderer.setRenderTarget(null),yield}async update(e=Et.DEFAULT){var s;this.updating=!0;let r=e.toUniform();this.transmittanceMaterial.uniforms.ATMOSPHERE=r,this.directIrradianceMaterial.uniforms.ATMOSPHERE=r,this.singleScatteringMaterial.uniforms.ATMOSPHERE=r,this.scatteringDensityMaterial.uniforms.ATMOSPHERE=r,this.indirectIrradianceMaterial.uniforms.ATMOSPHERE=r,this.multipleScatteringMaterial.uniforms.ATMOSPHERE=r;let i=this.renderer,n=new kn(this.type);n.lambdas.set(680,550,440),n.luminanceFromRadiance.identity();let a=i.autoClear;return i.autoClear=!1,await md(this.precompute(n,!1)),i.autoClear=a,n.dispose(),await Os(this.renderer,this.transmittanceRenderTarget,this.transmittanceRenderTarget.texture),await Os(this.renderer,this.irradianceRenderTarget,this.irradianceRenderTarget.texture),this.updating=!1,(s=this.disposeQueue)==null||s.call(this),this.textures}dispose(e={}){var i,n,a,s;if(this.updating){this.disposeQueue=()=>{this.dispose(e),this.disposeQueue=void 0};return}let{textures:r=!0}=e;r||(this.transmittanceRenderTarget.textures.splice(0,1),this.scatteringRenderTarget.textures.splice(0,1),this.irradianceRenderTarget.textures.splice(0,1),(i=this.singleMieScatteringRenderTarget)==null||i.textures.splice(0,1),(n=this.higherOrderScatteringRenderTarget)==null||n.textures.splice(0,1)),this.transmittanceRenderTarget.dispose(),this.scatteringRenderTarget.dispose(),this.irradianceRenderTarget.dispose(),(a=this.singleMieScatteringRenderTarget)==null||a.dispose(),(s=this.higherOrderScatteringRenderTarget)==null||s.dispose(),this.transmittanceMaterial.dispose(),this.directIrradianceMaterial.dispose(),this.singleScatteringMaterial.dispose(),this.scatteringDensityMaterial.dispose(),this.indirectIrradianceMaterial.dispose(),this.multipleScatteringMaterial.dispose(),this.mesh.geometry.dispose()}};var IT=1/Math.sqrt(Math.PI),MT=Math.sqrt(3)/(2*Math.sqrt(Math.PI));var pd={ellipsoid:Se.WGS84,correctAltitude:!0};var gd=`precision highp float;
precision highp sampler3D;

#define RECIPROCAL_PI 0.3183098861837907

#include "core/raySphereIntersection"

#include "bruneton/definitions"

uniform AtmosphereParameters ATMOSPHERE;
uniform vec3 SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
uniform vec3 SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;

uniform sampler2D transmittance_texture;
uniform sampler3D scattering_texture;
uniform sampler2D irradiance_texture;
uniform sampler3D single_mie_scattering_texture;
uniform sampler3D higher_order_scattering_texture;

#include "bruneton/common"
#include "bruneton/runtime"

uniform vec3 sunDirection;
uniform float cosSunAngularRadius;
uniform vec3 moonDirection;
uniform float moonAngularRadius;
uniform float lunarRadianceScale;
uniform vec3 groundAlbedo;

#include "sky"

#ifdef HAS_SHADOW_LENGTH
uniform sampler2D shadowLengthBuffer;
#endif // HAS_SHADOW_LENGTH

in vec2 vUv;
in vec3 vCameraPosition;
in vec3 vRayDirection;

layout(location = 0) out vec4 outputColor;

#include <mrt_layout>

void main() {
  float shadowLength = 0.0;
  #ifdef HAS_SHADOW_LENGTH
  shadowLength = texture(shadowLengthBuffer, vUv).r;
  #endif // HAS_SHADOW_LENGTH

  vec3 cameraPosition = vCameraPosition;
  vec3 rayDirection = normalize(vRayDirection);
  vec3 dRDdx = dFdx(rayDirection);
  vec3 dRDdy = dFdy(rayDirection);
  float fragmentAngle = length(dRDdx + dRDdy) / length(rayDirection);

  #ifdef GROUND_ALBEDO

  float r = length(cameraPosition);
  float mu = dot(cameraPosition, rayDirection) / r;
  bool intersectsGround = RayIntersectsGround(ATMOSPHERE, r, mu);
  if (intersectsGround) {
    float distanceToGround = raySphereFirstIntersection(
      cameraPosition,
      rayDirection,
      ATMOSPHERE.bottom_radius
    );
    vec3 groundPosition = rayDirection * distanceToGround + cameraPosition;
    vec3 surfaceNormal = normalize(groundPosition);
    vec3 skyIrradiance;
    vec3 sunIrradiance = GetSunAndSkyIrradiance(
      cameraPosition,
      surfaceNormal,
      sunDirection,
      skyIrradiance
    );
    vec3 transmittance;
    vec3 inscatter = GetSkyRadianceToPoint(
      cameraPosition,
      ATMOSPHERE.bottom_radius * surfaceNormal,
      shadowLength,
      sunDirection,
      transmittance
    );
    vec3 radiance = groundAlbedo * RECIPROCAL_PI * (sunIrradiance + skyIrradiance);
    outputColor.rgb = radiance * transmittance + inscatter;
  } else {
    outputColor.rgb = getSkyRadiance(
      cameraPosition,
      rayDirection,
      shadowLength,
      sunDirection,
      moonDirection,
      moonAngularRadius,
      lunarRadianceScale,
      fragmentAngle
    );
  }

  #else // GROUND_ALBEDO

  outputColor.rgb = getSkyRadiance(
    cameraPosition,
    rayDirection,
    shadowLength,
    sunDirection,
    moonDirection,
    moonAngularRadius,
    lunarRadianceScale,
    fragmentAngle
  );

  #endif // GROUND_ALBEDO

  outputColor.a = 1.0;

  #include <mrt_output>
}
`,vd=`precision highp float;
precision highp sampler3D;

uniform mat4 inverseProjectionMatrix;
uniform mat4 inverseViewMatrix;
uniform vec3 cameraPosition;
uniform mat4 worldToECEFMatrix;
uniform vec3 altitudeCorrection;

layout(location = 0) in vec3 position;

out vec2 vUv;
out vec3 vCameraPosition;
out vec3 vRayDirection;

void getCameraRay(out vec3 origin, out vec3 direction) {
  bool isPerspective = inverseProjectionMatrix[2][3] != 0.0; // 4th entry in the 3rd column

  if (isPerspective) {
    // Calculate the camera ray for a perspective camera.
    vec4 viewPosition = inverseProjectionMatrix * vec4(position, 1.0);
    vec4 worldDirection = inverseViewMatrix * vec4(viewPosition.xyz, 0.0);
    origin = cameraPosition;
    direction = worldDirection.xyz;
  } else {
    // Unprojected points to calculate direction.
    vec4 nearPoint = inverseProjectionMatrix * vec4(position.xy, -1.0, 1.0);
    vec4 farPoint = inverseProjectionMatrix * vec4(position.xy, -0.9, 1.0);
    nearPoint /= nearPoint.w;
    farPoint /= farPoint.w;

    // Calculate world values
    vec4 worldDirection = inverseViewMatrix * vec4(farPoint.xyz - nearPoint.xyz, 0.0);
    vec4 worldOrigin = inverseViewMatrix * nearPoint;

    // Outputs
    direction = worldDirection.xyz;
    origin = worldOrigin.xyz;
  }
}

void main() {
  vUv = position.xy * 0.5 + 0.5;

  vec3 direction, origin;
  getCameraRay(origin, direction);

  vec3 cameraPositionECEF = (worldToECEFMatrix * vec4(origin, 1.0)).xyz;
  vCameraPosition = (cameraPositionECEF + altitudeCorrection) * METER_TO_LENGTH_UNIT;
  vRayDirection = (worldToECEFMatrix * vec4(direction, 0.0)).xyz;

  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`,Ad=Object.defineProperty,Xn=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&Ad(e,r,n),n},to={...gi,sun:!0,moon:!0,moonAngularRadius:.0045,lunarRadianceScale:1,ground:!0,groundAlbedo:new Us(0)},$t=class extends ze{constructor(e){let{sun:r,moon:i,moonDirection:n,moonAngularRadius:a,lunarRadianceScale:s,ground:o,groundAlbedo:c,...l}={...to,...e};super({name:"SkyMaterial",glslVersion:Wn,vertexShader:vd,fragmentShader:k(gd,{core:{raySphereIntersection:Bt},bruneton:{common:ve,definitions:Ae,runtime:Vt},sky:zs}),...l,uniforms:{inverseProjectionMatrix:new m(new ne),inverseViewMatrix:new m(new ne),moonDirection:new m((n==null?void 0:n.clone())??new O),moonAngularRadius:new m(a),lunarRadianceScale:new m(s),groundAlbedo:new m(c.clone()),shadowLengthBuffer:new m(null),...l.uniforms},defines:{PERSPECTIVE_CAMERA:"1"},depthWrite:!1,depthTest:!0}),this.shadowLength=null,this.sun=r,this.moon=i,this.ground=o}onBeforeRender(e,r,i,n,a,s){super.onBeforeRender(e,r,i,n,a,s);let{uniforms:o,defines:c}=this;o.inverseProjectionMatrix.value.copy(i.projectionMatrixInverse),o.inverseViewMatrix.value.copy(i.matrixWorld);let l=c.PERSPECTIVE_CAMERA!=null,u=i.isPerspectiveCamera===!0;u!==l&&(u?c.PERSPECTIVE_CAMERA="1":delete c.PERSPECTIVE_CAMERA,this.needsUpdate=!0);let h=this.groundAlbedo,p=c.GROUND_ALBEDO!=null,v=h.r!==0||h.g!==0||h.b!==0;v!==p&&(v?this.defines.GROUND_ALBEDO="1":delete this.defines.GROUND_ALBEDO,this.needsUpdate=!0);let A=this.shadowLength,g=c.HAS_SHADOW_LENGTH!=null,S=A!=null;S!==g&&(S?c.HAS_SHADOW_LENGTH="1":(delete c.HAS_SHADOW_LENGTH,o.shadowLengthBuffer.value=null),this.needsUpdate=!0),S&&(o.shadowLengthBuffer.value=A.map)}get moonDirection(){return this.uniforms.moonDirection.value}get moonAngularRadius(){return this.uniforms.moonAngularRadius.value}set moonAngularRadius(e){this.uniforms.moonAngularRadius.value=e}get lunarRadianceScale(){return this.uniforms.lunarRadianceScale.value}set lunarRadianceScale(e){this.uniforms.lunarRadianceScale.value=e}get groundAlbedo(){return this.uniforms.groundAlbedo.value}};Xn([C("SUN")],$t.prototype,"sun");Xn([C("MOON")],$t.prototype,"moon");Xn([C("GROUND")],$t.prototype,"ground");var Td=`precision highp float;
precision highp sampler3D;

#include "bruneton/definitions"

uniform AtmosphereParameters ATMOSPHERE;
uniform vec3 SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
uniform vec3 SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;

uniform sampler2D transmittance_texture;
uniform sampler3D scattering_texture;
uniform sampler2D irradiance_texture;
uniform sampler3D single_mie_scattering_texture;
uniform sampler3D higher_order_scattering_texture;

#include "bruneton/common"
#include "bruneton/runtime"

uniform vec3 sunDirection;

in vec3 vCameraPosition;
in vec3 vRayDirection;

layout(location = 0) out vec4 outputColor;

#include <mrt_layout>

in vec3 vColor;

void main() {
  #if !defined(PERSPECTIVE_CAMERA)
  outputColor = vec4(0.0);
  discard; // Rendering celestial objects without perspective doesn't make sense.
  #endif // !defined(PERSPECTIVE_CAMERA)

  #ifdef BACKGROUND
  vec3 rayDirection = normalize(vRayDirection);
  float r = length(vCameraPosition);
  float mu = dot(vCameraPosition, rayDirection) / r;

  if (RayIntersectsGround(ATMOSPHERE, r, mu)) {
    discard;
  }

  vec3 transmittance;
  vec3 radiance = GetSkyRadiance(
    vCameraPosition,
    normalize(vRayDirection),
    0.0, // Shadow length
    sunDirection,
    transmittance
  );
  radiance += transmittance * vColor;
  outputColor = vec4(radiance, 1.0);
  #else // BACKGROUND
  outputColor = vec4(vColor, 1.0);
  #endif // BACKGROUND

  #include <mrt_output>
}
`,Sd=`precision highp float;
precision highp sampler3D;

#define saturate(x) clamp(x, 0.0, 1.0)

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 matrixWorld;
uniform vec3 cameraPosition;
uniform float cameraFar;
uniform mat4 worldToECEFMatrix;
uniform vec3 altitudeCorrection;
uniform float pointSize;
uniform vec2 magnitudeRange;
uniform float intensity;

layout(location = 0) in vec3 position;
layout(location = 1) in float magnitude;
layout(location = 2) in vec3 color;

out vec3 vCameraPosition;
out vec3 vRayDirection;
out vec3 vEllipsoidCenter;
out vec3 vColor;

void main() {
  // Magnitude is stored between 0 to 1 within the given range.
  float m = mix(magnitudeRange.x, magnitudeRange.y, magnitude);
  vec3 v = pow(vec3(10.0), -vec3(magnitudeRange, m) / 2.5);
  vColor = vec3(intensity * color);
  vColor *= saturate((v.z - v.y) / (v.x - v.y));

  #ifdef BACKGROUND
  vec3 worldDirection = normalize(matrixWorld * vec4(position, 1.0)).xyz;
  vec3 cameraPositionECEF = (worldToECEFMatrix * vec4(cameraPosition, 1.0)).xyz;
  vCameraPosition = (cameraPositionECEF + altitudeCorrection) * METER_TO_LENGTH_UNIT;
  vRayDirection = (worldToECEFMatrix * vec4(worldDirection, 0.0)).xyz;
  gl_Position =
    projectionMatrix * viewMatrix * vec4(cameraPosition + worldDirection * cameraFar, 1.0);
  #else // BACKGROUND
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  #endif // BACKGROUND

  gl_PointSize = pointSize;
}
`,Ed=Object.defineProperty,ro=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&Ed(e,r,n),n},io={...gi,pointSize:1,intensity:1,background:!0,ground:!0},Cr=class extends ze{constructor(e){let{pointSize:r,intensity:i,background:n,ground:a,...s}={...io,...e};super({name:"StarsMaterial",glslVersion:Wn,vertexShader:Sd,fragmentShader:k(Td,{bruneton:{common:ve,definitions:Ae,runtime:Vt}}),...s,uniforms:{projectionMatrix:new m(new ne),modelViewMatrix:new m(new ne),viewMatrix:new m(new ne),matrixWorld:new m(new ne),cameraFar:new m(0),pointSize:new m(0),magnitudeRange:new m(new Bs(-2,8)),intensity:new m(i),...s.uniforms},defines:{PERSPECTIVE_CAMERA:"1"},depthWrite:!0,depthTest:!0}),this.pointSize=r,this.background=n,this.ground=a}onBeforeRender(e,r,i,n,a,s){super.onBeforeRender(e,r,i,n,a,s);let o=this.uniforms;o.projectionMatrix.value.copy(i.projectionMatrix),o.modelViewMatrix.value.copy(i.modelViewMatrix),o.viewMatrix.value.copy(i.matrixWorldInverse),o.matrixWorld.value.copy(a.matrixWorld),o.cameraFar.value=i.far,o.pointSize.value=this.pointSize*e.getPixelRatio();let c=i.isPerspectiveCamera===!0;this.defines.PERSPECTIVE_CAMERA!=null!==c&&(c?this.defines.PERSPECTIVE_CAMERA="1":delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0)}get magnitudeRange(){return this.uniforms.magnitudeRange.value}get intensity(){return this.uniforms.intensity.value}set intensity(e){this.uniforms.intensity.value=e}};ro([C("BACKGROUND")],Cr.prototype,"background");ro([C("GROUND")],Cr.prototype,"ground");var xd={ellipsoid:Se.WGS84,correctAltitude:!0,distance:1};import{Vector3 as W,Vector2 as V,Matrix4 as Z,Object3D as no,Box3 as wd,Uniform as d,GLSL3 as Ci,Vector4 as ue,RawShaderMaterial as aa,Camera as fo,WebGLRenderTarget as yd,HalfFloatType as mo,LinearFilter as Si,RedFormat as Cd,WebGLArrayRenderTarget as Dd,EventDispatcher as Rd,Matrix3 as _d,Texture as ao,Data3DTexture as so}from"three";var Qn=Vt,Zn=ve,Kn=Ae;var _r=class t{constructor(e=0,r=0,i=0,n=0){this.expTerm=e,this.exponent=r,this.linearTerm=i,this.constantTerm=n}set(e=0,r=0,i=0,n=0){return this.expTerm=e,this.exponent=r,this.linearTerm=i,this.constantTerm=n,this}clone(){return new t(this.expTerm,this.exponent,this.linearTerm,this.constantTerm)}copy(e){return this.expTerm=e.expTerm,this.exponent=e.exponent,this.linearTerm=e.linearTerm,this.constantTerm=e.constantTerm,this}},Id=["channel","altitude","height","densityScale","shapeAmount","shapeDetailAmount","weatherExponent","shapeAlteringBias","coverageFilterWidth","shadow","densityProfile"];function Md(t,e){if(e!=null)for(let r of Id){let i=e[r];i!=null&&(t[r]instanceof _r?t[r].copy(i):t[r]=i)}}var $n=class po{constructor(e){this.channel="r",this.altitude=0,this.height=0,this.densityScale=.2,this.shapeAmount=1,this.shapeDetailAmount=1,this.weatherExponent=1,this.shapeAlteringBias=.35,this.coverageFilterWidth=.6,this.densityProfile=new _r(0,0,.75,.25),this.shadow=!1,this.set(e)}set(e){return Md(this,e),this}clone(){return new po(this)}copy(e){return this.channel=e.channel,this.altitude=e.altitude,this.height=e.height,this.densityScale=e.densityScale,this.shapeAmount=e.shapeAmount,this.shapeDetailAmount=e.shapeDetailAmount,this.weatherExponent=e.weatherExponent,this.shapeAlteringBias=e.shapeAlteringBias,this.coverageFilterWidth=e.coverageFilterWidth,this.densityProfile.copy(e.densityProfile),this.shadow=e.shadow,this}};$n.DEFAULT=new $n;var Ye=$n,er=Array.from({length:8},()=>({value:0,flag:0})),Dr=Array.from({length:3},()=>({min:0,max:0}));function Pd(t,e){return t.value!==e.value?t.value-e.value:t.flag-e.flag}var ea=class go extends Array{constructor(e){super(new Ye(e==null?void 0:e[0]),new Ye(e==null?void 0:e[1]),new Ye(e==null?void 0:e[2]),new Ye(e==null?void 0:e[3]))}set(e){return this[0].set(e==null?void 0:e[0]),this[1].set(e==null?void 0:e[1]),this[2].set(e==null?void 0:e[2]),this[3].set(e==null?void 0:e[3]),this}reset(){return this[0].copy(Ye.DEFAULT),this[1].copy(Ye.DEFAULT),this[2].copy(Ye.DEFAULT),this[3].copy(Ye.DEFAULT),this}clone(){return new go(this)}copy(e){return this[0].copy(e[0]),this[1].copy(e[1]),this[2].copy(e[2]),this[3].copy(e[3]),this}get localWeatherChannels(){return this[0].channel+this[1].channel+this[2].channel+this[3].channel}packValues(e,r){return r.set(this[0][e],this[1][e],this[2][e],this[3][e])}packSums(e,r,i){return i.set(this[0][e]+this[0][r],this[1][e]+this[1][r],this[2][e]+this[2][r],this[3][e]+this[3][r])}packDensityProfiles(e,r){return r.set(this[0].densityProfile[e],this[1].densityProfile[e],this[2].densityProfile[e],this[3].densityProfile[e])}packIntervalHeights(e,r){for(let s=0;s<4;++s){let o=this[s],c=er[s];c.value=o.altitude,c.flag=0,c=er[s+4],c.value=o.altitude+o.height,c.flag=1}er.sort(Pd);let i=0,n=0;for(let s=0;s<er.length;++s){let{value:o,flag:c}=er[s];if(n===0&&s>0){let l=Dr[i++];l.min=er[s-1].value,l.max=o}n+=c===0?1:-1}for(;i<3;++i){let s=Dr[i];s.min=0,s.max=0}let a=Dr[0];e.x=a.min,r.x=a.max,a=Dr[1],e.y=a.min,r.y=a.max,a=Dr[2],e.z=a.min,r.z=a.max}};ea.DEFAULT=new ea([{channel:"r",altitude:750,height:650,densityScale:.2,shapeAmount:1,shapeDetailAmount:1,weatherExponent:1,shapeAlteringBias:.35,coverageFilterWidth:.6,shadow:!0},{channel:"g",altitude:1e3,height:1200,densityScale:.2,shapeAmount:1,shapeDetailAmount:1,weatherExponent:1,shapeAlteringBias:.35,coverageFilterWidth:.6,shadow:!0},{channel:"b",altitude:7500,height:500,densityScale:.003,shapeAmount:.4,shapeDetailAmount:0,weatherExponent:1,shapeAlteringBias:.35,coverageFilterWidth:.5},{channel:"a"}]);var vo=ea,Nd=!0,oo="Invariant failed";function ot(t,e){if(!t){if(Nd)throw new Error(oo);var r=oo;throw new Error(r)}}var Ei=class t{constructor(e,r){this.near=[new W,new W,new W,new W],this.far=[new W,new W,new W,new W],e!=null&&r!=null&&this.setFromCamera(e,r)}clone(){return new t().copy(this)}copy(e){for(let r=0;r<4;++r)this.near[r].copy(e.near[r]),this.far[r].copy(e.far[r]);return this}setFromCamera(e,r){let i=e.isOrthographicCamera===!0,n=e.projectionMatrixInverse;this.near[0].set(1,1,-1),this.near[1].set(1,-1,-1),this.near[2].set(-1,-1,-1),this.near[3].set(-1,1,-1);for(let a=0;a<4;++a)this.near[a].applyMatrix4(n);this.far[0].set(1,1,1),this.far[1].set(1,-1,1),this.far[2].set(-1,-1,1),this.far[3].set(-1,1,1);for(let a=0;a<4;++a){let s=this.far[a];s.applyMatrix4(n);let o=Math.abs(s.z);i?s.z*=Math.min(r/o,1):s.multiplyScalar(Math.min(r/o,1))}return this}split(e,r=[]){for(let i=0;i<e.length;++i){let n=r[i]??=new t;if(i===0)for(let a=0;a<4;++a)n.near[a].copy(this.near[a]);else for(let a=0;a<4;++a)n.near[a].lerpVectors(this.near[a],this.far[a],e[i-1]);if(i===e.length-1)for(let a=0;a<4;++a)n.far[a].copy(this.far[a]);else for(let a=0;a<4;++a)n.far[a].lerpVectors(this.near[a],this.far[a],e[i])}return r.length=e.length,r}applyMatrix4(e){for(let r=0;r<4;++r)this.near[r].applyMatrix4(e),this.far[r].applyMatrix4(e);return this}},bd={uniform:(t,e,r,i,n=[])=>{for(let a=0;a<t;++a)n[a]=(e+(r-e)*(a+1)/t)/r;return n.length=t,n},logarithmic:(t,e,r,i,n=[])=>{for(let a=0;a<t;++a)n[a]=e*(r/e)**((a+1)/t)/r;return n.length=t,n},practical:(t,e,r,i=.5,n=[])=>{for(let a=0;a<t;++a){let s=(e+(r-e)*(a+1)/t)/r,o=e*(r/e)**((a+1)/t)/r;n[a]=Tn(s,o,i)}return n.length=t,n}};function Od(t,e,r,i,n,a=[]){return bd[t](e,r,i,n,a)}var co=new W,lo=new W,Ud=new Z,uo=new Z,Ld=new Ei,Bd=new wd,Fd={maxFar:null,farScale:1,splitMode:"practical",splitLambda:.5,margin:0,fade:!0},ta=class{constructor(e){this.cascades=[],this.mapSize=new V,this.cameraFrustum=new Ei,this.frusta=[],this.splits=[],this._far=0;let{cascadeCount:r,mapSize:i,maxFar:n,farScale:a,splitMode:s,splitLambda:o,margin:c,fade:l}={...Fd,...e};this.cascadeCount=r,this.mapSize.copy(i),this.maxFar=n,this.farScale=a,this.splitMode=s,this.splitLambda=o,this.margin=c,this.fade=l}get cascadeCount(){return this.cascades.length}set cascadeCount(e){if(e!==this.cascadeCount){for(let r=0;r<e;++r)this.cascades[r]??={interval:new V,matrix:new Z,inverseMatrix:new Z,projectionMatrix:new Z,inverseProjectionMatrix:new Z,viewMatrix:new Z,inverseViewMatrix:new Z};this.cascades.length=e}}get far(){return this._far}updateIntervals(e){let r=this.cascadeCount,i=this.splits,n=this.far;Od(this.splitMode,r,e.near,n,this.splitLambda,i),this.cameraFrustum.setFromCamera(e,n),this.cameraFrustum.split(i,this.frusta);let a=this.cascades;for(let s=0;s<r;++s)a[s].interval.set(i[s-1]??0,i[s]??0)}getFrustumRadius(e,r){let i=r.near,n=r.far,a=Math.max(n[0].distanceTo(n[2]),n[0].distanceTo(i[2]));if(this.fade){let s=e.near,o=this.far,c=n[0].z/(o-s);a+=.25*c**2*(o-s)}return a*.5}updateMatrices(e,r,i=1){let n=Ud.lookAt(co.setScalar(0),lo.copy(r).multiplyScalar(-1),no.DEFAULT_UP),a=uo.multiplyMatrices(uo.copy(n).invert(),e.matrixWorld),s=this.frusta,o=this.cascades;ot(s.length===o.length);let c=this.margin,l=this.mapSize;for(let u=0;u<s.length;++u){let h=s[u],p=o[u],v=this.getFrustumRadius(e,s[u]),A=-v,g=v,S=v,D=-v;p.projectionMatrix.makeOrthographic(A,g,S,D,-this.margin,v*2+this.margin);let{near:y,far:E}=Ld.copy(h).applyMatrix4(a),N=Bd.makeEmpty();for(let K=0;K<4;K++)N.expandByPoint(y[K]),N.expandByPoint(E[K]);let L=N.getCenter(co);L.z=N.max.z+c;let Y=(g-A)/l.width,ee=(S-D)/l.height;L.x=Math.round(L.x/Y)*Y,L.y=Math.round(L.y/ee)*ee,L.applyMatrix4(n);let de=lo.copy(r).multiplyScalar(i).add(L);p.inverseViewMatrix.lookAt(L,de,no.DEFAULT_UP).setPosition(de)}}update(e,r,i){this._far=this.maxFar!=null?Math.min(this.maxFar,e.far*this.farScale):e.far*this.farScale,this.updateIntervals(e),this.updateMatrices(e,r,i);let n=this.cascades,a=this.cascadeCount;for(let s=0;s<a;++s){let{matrix:o,inverseMatrix:c,projectionMatrix:l,inverseProjectionMatrix:u,viewMatrix:h,inverseViewMatrix:p}=n[s];u.copy(l).invert(),h.copy(p).invert(),o.copy(l).multiply(h),c.copy(p).multiply(u)}}},ho=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],Ao=ho.reduce((t,e,r)=>{let i=new V;for(let n=0;n<16;++n)if(ho[n]===r){i.set((n%4+.5)/4,(Math.floor(n/4)+.5)/4);break}return[...t,i]},[]),Hd={resolutionScale:1,lightShafts:!0,shapeDetail:!0,turbulence:!0,haze:!0,clouds:{multiScatteringOctaves:8,accurateSunSkyLight:!0,accuratePhaseFunction:!1,maxIterationCount:500,minStepSize:50,maxStepSize:1e3,maxRayDistance:2e5,perspectiveStepScale:1.01,minDensity:1e-5,minExtinction:1e-5,minTransmittance:.01,maxIterationCountToGround:3,maxIterationCountToSun:2,minSecondaryStepSize:100,secondaryStepScale:2,maxShadowLengthIterationCount:500,minShadowLengthStepSize:50,maxShadowLengthRayDistance:2e5},shadow:{cascadeCount:3,mapSize:new V(512,512),maxIterationCount:50,minStepSize:100,maxStepSize:1e3,minDensity:1e-5,minExtinction:1e-5,minTransmittance:1e-4}},T=Hd,Gd={low:{...T,lightShafts:!1,shapeDetail:!1,turbulence:!1,clouds:{...T.clouds,accurateSunSkyLight:!1,maxIterationCount:200,minStepSize:100,maxRayDistance:1e5,minDensity:1e-4,minExtinction:1e-4,minTransmittance:.1,maxIterationCountToGround:0,maxIterationCountToSun:1},shadow:{...T.shadow,maxIterationCount:25,minDensity:1e-4,minExtinction:1e-4,minTransmittance:.01,cascadeCount:2,mapSize:new V(256,256)}},medium:{...T,lightShafts:!1,turbulence:!1,clouds:{...T.clouds,minDensity:1e-4,minExtinction:1e-4,accurateSunSkyLight:!1,maxIterationCountToSun:2,maxIterationCountToGround:1},shadow:{...T.shadow,minDensity:1e-4,minExtinction:1e-4,mapSize:new V(256,256)}},high:T,ultra:{...T,clouds:{...T.clouds,minStepSize:10},shadow:{...T.shadow,mapSize:new V(1024,1024)}}},zd=`precision highp float;
precision highp sampler3D;
precision highp sampler2DArray;

#include <common>
#include <packing>

#include "core/depth"
#include "core/math"
#include "core/turbo"
#include "core/generators"
#include "core/raySphereIntersection"
#include "core/cascadedShadowMaps"
#include "core/interleavedGradientNoise"
#include "core/vogelDisk"

#include "atmosphere/bruneton/definitions"

uniform AtmosphereParameters ATMOSPHERE;
uniform vec3 SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
uniform vec3 SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;

uniform sampler2D transmittance_texture;
uniform sampler3D scattering_texture;
uniform sampler2D irradiance_texture;
uniform sampler3D single_mie_scattering_texture;
uniform sampler3D higher_order_scattering_texture;

#include "atmosphere/bruneton/common"
#include "atmosphere/bruneton/runtime"

#include "types"
#include "parameters"
#include "clouds"

#if !defined(RECIPROCAL_PI4)
#define RECIPROCAL_PI4 0.07957747154594767
#endif // !defined(RECIPROCAL_PI4)

uniform sampler2D depthBuffer;
uniform mat4 viewMatrix;
uniform mat4 reprojectionMatrix;
uniform mat4 viewReprojectionMatrix;
uniform float cameraNear;
uniform float cameraFar;
uniform float cameraHeight;
uniform vec2 temporalJitter;
uniform vec2 targetUvScale;
uniform float mipLevelScale;

// Scattering
const vec2 scatterAnisotropy = vec2(SCATTER_ANISOTROPY_1, SCATTER_ANISOTROPY_2);
const float scatterAnisotropyMix = SCATTER_ANISOTROPY_MIX;
uniform float skyLightScale;
uniform float groundBounceScale;
uniform float powderScale;
uniform float powderExponent;

// Primary raymarch
uniform int maxIterationCount;
uniform float minStepSize;
uniform float maxStepSize;
uniform float maxRayDistance;
uniform float perspectiveStepScale;

// Secondary raymarch
uniform int maxIterationCountToSun;
uniform int maxIterationCountToGround;
uniform float minSecondaryStepSize;
uniform float secondaryStepScale;

// Beer shadow map
uniform sampler2DArray shadowBuffer;
uniform vec2 shadowTexelSize;
uniform vec2 shadowIntervals[SHADOW_CASCADE_COUNT];
uniform mat4 shadowMatrices[SHADOW_CASCADE_COUNT];
uniform float shadowFar;
uniform float maxShadowFilterRadius;

// Shadow length
#ifdef SHADOW_LENGTH
uniform int maxShadowLengthIterationCount;
uniform float minShadowLengthStepSize;
uniform float maxShadowLengthRayDistance;
#endif // SHADOW_LENGTH

in vec2 vUv;
in vec3 vCameraPosition;
in vec3 vCameraDirection; // Direction to the center of screen
in vec3 vRayDirection; // Direction to the texel
in vec3 vViewPosition;
in GroundIrradiance vGroundIrradiance;
in CloudsIrradiance vCloudsIrradiance;

layout(location = 0) out vec4 outputColor;
layout(location = 1) out vec3 outputDepthVelocity;
#ifdef SHADOW_LENGTH
layout(location = 2) out float outputShadowLength;
#endif // SHADOW_LENGTH

float getViewZ(const float depth) {
  #ifdef PERSPECTIVE_CAMERA
  return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
  #else // PERSPECTIVE_CAMERA
  return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
  #endif // PERSPECTIVE_CAMERA
}

vec3 ecefToWorld(const vec3 positionECEF) {
  return (ecefToWorldMatrix * vec4(positionECEF - altitudeCorrection, 1.0)).xyz;
}

vec2 getShadowUv(const vec3 worldPosition, const int cascadeIndex) {
  vec4 clip = shadowMatrices[cascadeIndex] * vec4(worldPosition, 1.0);
  clip /= clip.w;
  return clip.xy * 0.5 + 0.5;
}

float getDistanceToShadowTop(const vec3 rayPosition) {
  // Distance to the top of the shadows along the sun direction, which matches
  // the ray origin of BSM.
  return raySphereSecondIntersection(
    rayPosition,
    sunDirection,
    vec3(0.0),
    bottomRadius + shadowTopHeight
  );
}

#ifdef DEBUG_SHOW_CASCADES

const vec3 cascadeColors[4] = vec3[4](
  vec3(1.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(0.0, 0.0, 1.0),
  vec3(1.0, 1.0, 0.0)
);

vec3 getCascadeColor(const vec3 rayPosition) {
  vec3 worldPosition = ecefToWorld(rayPosition);
  int cascadeIndex = getCascadeIndex(
    viewMatrix,
    worldPosition,
    shadowIntervals,
    cameraNear,
    shadowFar
  );
  vec2 uv = getShadowUv(worldPosition, cascadeIndex);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec3(1.0);
  }
  return cascadeColors[cascadeIndex];
}

vec3 getFadedCascadeColor(const vec3 rayPosition, const float jitter) {
  vec3 worldPosition = ecefToWorld(rayPosition);
  int cascadeIndex = getFadedCascadeIndex(
    viewMatrix,
    worldPosition,
    shadowIntervals,
    cameraNear,
    shadowFar,
    jitter
  );
  return cascadeIndex >= 0
    ? cascadeColors[cascadeIndex]
    : vec3(1.0);
}

#endif // DEBUG_SHOW_CASCADES

float readShadowOpticalDepth(
  const vec2 uv,
  const float distanceToTop,
  const float distanceOffset,
  const int cascadeIndex
) {
  // r: frontDepth, g: meanExtinction, b: maxOpticalDepth, a: maxOpticalDepthTail
  // Also see the discussion here: https://x.com/shotamatsuda/status/1885322308908442106
  vec4 shadow = texture(shadowBuffer, vec3(uv, float(cascadeIndex)));
  float distanceToFront = max(0.0, distanceToTop - distanceOffset - shadow.r);
  return min(shadow.b + shadow.a, shadow.g * distanceToFront);
}

float sampleShadowOpticalDepthPCF(
  const vec3 worldPosition,
  const float distanceToTop,
  const float distanceOffset,
  const float radius,
  const int cascadeIndex
) {
  vec2 uv = getShadowUv(worldPosition, cascadeIndex);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return 0.0;
  }
  if (radius < 0.1) {
    return readShadowOpticalDepth(uv, distanceToTop, distanceOffset, cascadeIndex);
  }
  float sum = 0.0;
  vec2 offset;
  #pragma unroll_loop_start
  for (int i = 0; i < 16; ++i) {
    #if UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT
    offset = vogelDisk(
      UNROLLED_LOOP_INDEX,
      SHADOW_SAMPLE_COUNT,
      interleavedGradientNoise(gl_FragCoord.xy + temporalJitter * resolution) * PI2
    );
    sum += readShadowOpticalDepth(
      uv + offset * radius * shadowTexelSize,
      distanceToTop,
      distanceOffset,
      cascadeIndex
    );
    #endif // UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT
  }
  #pragma unroll_loop_end
  return sum / float(SHADOW_SAMPLE_COUNT);
}

float sampleShadowOpticalDepth(
  const vec3 rayPosition,
  const float distanceOffset,
  const float radius,
  const float jitter
) {
  float distanceToTop = getDistanceToShadowTop(rayPosition);
  if (distanceToTop <= 0.0) {
    return 0.0;
  }
  vec3 worldPosition = ecefToWorld(rayPosition);
  int cascadeIndex = getFadedCascadeIndex(
    viewMatrix,
    worldPosition,
    shadowIntervals,
    cameraNear,
    shadowFar,
    jitter
  );
  return cascadeIndex >= 0
    ? sampleShadowOpticalDepthPCF(
      worldPosition,
      distanceToTop,
      distanceOffset,
      radius,
      cascadeIndex
    )
    : 0.0;
}

#ifdef DEBUG_SHOW_SHADOW_MAP
vec4 getCascadedShadowMaps(vec2 uv) {
  vec4 coord = vec4(vUv, vUv - 0.5) * 2.0;
  vec4 shadow = vec4(0.0);
  if (uv.y > 0.5) {
    if (uv.x < 0.5) {
      shadow = texture(shadowBuffer, vec3(coord.xw, 0.0));
    } else {
      #if SHADOW_CASCADE_COUNT > 1
      shadow = texture(shadowBuffer, vec3(coord.zw, 1.0));
      #endif // SHADOW_CASCADE_COUNT > 1
    }
  } else {
    if (uv.x < 0.5) {
      #if SHADOW_CASCADE_COUNT > 2
      shadow = texture(shadowBuffer, vec3(coord.xy, 2.0));
      #endif // SHADOW_CASCADE_COUNT > 2
    } else {
      #if SHADOW_CASCADE_COUNT > 3
      shadow = texture(shadowBuffer, vec3(coord.zy, 3.0));
      #endif // SHADOW_CASCADE_COUNT > 3
    }
  }

  #if !defined(DEBUG_SHOW_SHADOW_MAP_TYPE)
  #define DEBUG_SHOW_SHADOW_MAP_TYPE 0
  #endif // !defined(DEBUG_SHOW_SHADOW_MAP_TYPE

  const float frontDepthScale = 1e-5;
  const float meanExtinctionScale = 10.0;
  const float maxOpticalDepthScale = 0.01;
  vec3 color;
  #if DEBUG_SHOW_SHADOW_MAP_TYPE == 1
  color = vec3(shadow.r * frontDepthScale);
  #elif DEBUG_SHOW_SHADOW_MAP_TYPE == 2
  color = vec3(shadow.g * meanExtinctionScale);
  #elif DEBUG_SHOW_SHADOW_MAP_TYPE == 3
  color = vec3((shadow.b + shadow.a) * maxOpticalDepthScale);
  #else // DEBUG_SHOW_SHADOW_MAP_TYPE
  color =
    (shadow.rgb + vec3(0.0, 0.0, shadow.a)) *
    vec3(frontDepthScale, meanExtinctionScale, maxOpticalDepthScale);
  #endif // DEBUG_SHOW_SHADOW_MAP_TYPE
  return vec4(color, 1.0);
}
#endif // DEBUG_SHOW_SHADOW_MAP

vec2 henyeyGreenstein(const vec2 g, const float cosTheta) {
  vec2 g2 = g * g;
  // prettier-ignore
  return RECIPROCAL_PI4 *
    ((1.0 - g2) / max(vec2(1e-7), pow(1.0 + g2 - 2.0 * g * cosTheta, vec2(1.5))));
}

#ifdef ACCURATE_PHASE_FUNCTION

float draine(float u, float g, float a) {
  float g2 = g * g;
  // prettier-ignore
  return (1.0 - g2) *
    (1.0 + a * u * u) /
    (4.0 * (1.0 + a * (1.0 + 2.0 * g2) / 3.0) * PI * pow(1.0 + g2 - 2.0 * g * u, 1.5));
}

// Numerically-fitted large particles (d=10) phase function It won't be
// plausible without a more precise multiple scattering.
// Reference: https://research.nvidia.com/labs/rtr/approximate-mie/
float phaseFunction(const float cosTheta, const float attenuation) {
  const float gHG = 0.988176691700256; // exp(-0.0990567/(d-1.67154))
  const float gD = 0.5556712547839497; // exp(-2.20679/(d+3.91029) - 0.428934)
  const float alpha = 21.995520856274638; // exp(3.62489 - 8.29288/(d+5.52825))
  const float weight = 0.4819554318404214; // exp(-0.599085/(d-0.641583)-0.665888)
  return mix(
    henyeyGreenstein(vec2(gHG) * attenuation, cosTheta).x,
    draine(cosTheta, gD * attenuation, alpha),
    weight
  );
}

#else // ACCURATE_PHASE_FUNCTION

float phaseFunction(const float cosTheta, const float attenuation) {
  const vec2 g = scatterAnisotropy;
  const vec2 weights = vec2(1.0 - scatterAnisotropyMix, scatterAnisotropyMix);
  // A similar approximation is described in the Frostbite's paper, where phase
  // angle is attenuated instead of anisotropy.
  return dot(henyeyGreenstein(g * attenuation, cosTheta), weights);
}

#endif // ACCURATE_PHASE_FUNCTION

float phaseFunction(const float cosTheta) {
  return phaseFunction(cosTheta, 1.0);
}

float marchOpticalDepth(
  const vec3 rayOrigin,
  const vec3 rayDirection,
  const int maxIterationCount,
  const float mipLevel,
  const float jitter,
  out float rayDistance
) {
  int iterationCount = int(
    max(0.0, remap(mipLevel, 0.0, 1.0, float(maxIterationCount + 1), 1.0) - jitter)
  );
  if (iterationCount == 0) {
    // Fudge factor to approximate the mean optical depth.
    // TODO: Remove it.
    return 0.5;
  }
  float stepSize = minSecondaryStepSize / float(iterationCount);
  float nextDistance = stepSize * jitter;
  float opticalDepth = 0.0;
  for (int i = 0; i < iterationCount; ++i) {
    rayDistance = nextDistance;
    vec3 position = rayDistance * rayDirection + rayOrigin;
    vec2 uv = getGlobeUv(position);
    float height = length(position) - bottomRadius;
    WeatherSample weather = sampleWeather(uv, height, mipLevel);
    MediaSample media = sampleMedia(weather, position, uv, mipLevel, jitter);
    opticalDepth += media.extinction * stepSize;
    nextDistance += stepSize;
    stepSize *= secondaryStepScale;
  }
  return opticalDepth;
}

float marchOpticalDepth(
  const vec3 rayOrigin,
  const vec3 rayDirection,
  const int maxIterationCount,
  const float mipLevel,
  const float jitter
) {
  float rayDistance;
  return marchOpticalDepth(
    rayOrigin,
    rayDirection,
    maxIterationCount,
    mipLevel,
    jitter,
    rayDistance
  );
}

float approximateMultipleScattering(const float opticalDepth, const float cosTheta) {
  // Multiple scattering approximation
  // See: https://fpsunflower.github.io/ckulla/data/oz_volumes.pdf
  // a: attenuation, b: contribution, c: phase attenuation
  vec3 coeffs = vec3(1.0); // [a, b, c]
  const vec3 attenuation = vec3(0.5, 0.5, 0.5); // Should satisfy a <= b
  float scattering = 0.0;
  float beerLambert;
  #pragma unroll_loop_start
  for (int i = 0; i < 12; ++i) {
    #if UNROLLED_LOOP_INDEX < MULTI_SCATTERING_OCTAVES
    beerLambert = exp(-opticalDepth * coeffs.y);
    scattering += coeffs.x * beerLambert * phaseFunction(cosTheta, coeffs.z);
    coeffs *= attenuation;
    #endif // UNROLLED_LOOP_INDEX < MULTI_SCATTERING_OCTAVES
  }
  #pragma unroll_loop_end
  return scattering;
}

// TODO: Construct spherical harmonics of degree 2 using 2 sample points
// positioned near the horizon occlusion points on the sun direction plane.
vec3 getGroundSunSkyIrradiance(
  const vec3 position,
  const vec3 surfaceNormal,
  const float height,
  out vec3 skyIrradiance
) {
  #ifdef ACCURATE_SUN_SKY_LIGHT
  return GetSunAndSkyIrradiance(
    (position - surfaceNormal * height) * METER_TO_LENGTH_UNIT,
    surfaceNormal,
    sunDirection,
    skyIrradiance
  );
  #else // ACCURATE_SUN_SKY_LIGHT
  skyIrradiance = vGroundIrradiance.sky;
  return vGroundIrradiance.sun;
  #endif // ACCURATE_SUN_SKY_LIGHT
}

vec3 getCloudsSunSkyIrradiance(const vec3 position, const float height, out vec3 skyIrradiance) {
  #ifdef ACCURATE_SUN_SKY_LIGHT
  return GetSunAndSkyScalarIrradiance(position * METER_TO_LENGTH_UNIT, sunDirection, skyIrradiance);
  #else // ACCURATE_SUN_SKY_LIGHT
  float alpha = remapClamped(height, minHeight, maxHeight);
  skyIrradiance = mix(vCloudsIrradiance.minSky, vCloudsIrradiance.maxSky, alpha);
  return mix(vCloudsIrradiance.minSun, vCloudsIrradiance.maxSun, alpha);
  #endif // ACCURATE_SUN_SKY_LIGHT
}

#ifdef GROUND_BOUNCE
vec3 approximateRadianceFromGround(
  const vec3 position,
  const vec3 surfaceNormal,
  const float height,
  const float mipLevel,
  const float jitter
) {
  float opticalDepthToGround = marchOpticalDepth(
    position,
    -surfaceNormal,
    maxIterationCountToGround,
    mipLevel,
    jitter
  );
  vec3 skyIrradiance;
  vec3 sunIrradiance = getGroundSunSkyIrradiance(position, surfaceNormal, height, skyIrradiance);
  const float groundAlbedo = 0.3;
  vec3 groundIrradiance = skyIrradiance + (1.0 - coverage) * sunIrradiance;
  vec3 bouncedRadiance = groundAlbedo * RECIPROCAL_PI * groundIrradiance;
  return bouncedRadiance * exp(-opticalDepthToGround);
}
#endif // GROUND_BOUNCE

vec4 marchClouds(
  const vec3 rayOrigin,
  const vec3 rayDirection,
  const vec2 rayNearFar,
  const float cosTheta,
  const float jitter,
  const float rayStartTexelsPerPixel,
  out float frontDepth,
  out ivec3 sampleCount
) {
  vec3 radianceIntegral = vec3(0.0);
  float transmittanceIntegral = 1.0;
  float weightedDistanceSum = 0.0;
  float transmittanceSum = 0.0;

  float maxRayDistance = rayNearFar.y - rayNearFar.x;
  float stepSize = minStepSize + (perspectiveStepScale - 1.0) * rayNearFar.x;
  // I don't understand why spatial aliasing remains unless doubling the jitter.
  float rayDistance = stepSize * jitter * 2.0;

  for (int i = 0; i < maxIterationCount; ++i) {
    if (rayDistance > maxRayDistance) {
      break; // Termination
    }

    vec3 position = rayDistance * rayDirection + rayOrigin;
    float height = length(position) - bottomRadius;
    float mipLevel = log2(max(1.0, rayStartTexelsPerPixel + rayDistance * 1e-5));

    #if !defined(DEBUG_MARCH_INTERVALS)
    if (insideLayerIntervals(height)) {
      stepSize *= perspectiveStepScale;
      rayDistance += mix(stepSize, maxStepSize, min(1.0, mipLevel));
      continue;
    }
    #endif // !defined(DEBUG_MARCH_INTERVALS)

    // Sample rough weather.
    vec2 uv = getGlobeUv(position);
    WeatherSample weather = sampleWeather(uv, height, mipLevel);

    #ifdef DEBUG_SHOW_SAMPLE_COUNT
    ++sampleCount.x;
    #endif // DEBUG_SHOW_SAMPLE_COUNT

    if (!any(greaterThan(weather.density, vec4(minDensity)))) {
      // Step longer in empty space.
      // TODO: This produces banding artifacts.
      // Possible improvement: Binary search refinement
      stepSize *= perspectiveStepScale;
      rayDistance += mix(stepSize, maxStepSize, min(1.0, mipLevel));
      continue;
    }

    // Sample detailed participating media.
    MediaSample media = sampleMedia(weather, position, uv, mipLevel, jitter, sampleCount);

    if (media.extinction > minExtinction) {
      vec3 skyIrradiance;
      vec3 sunIrradiance = getCloudsSunSkyIrradiance(position, height, skyIrradiance);
      vec3 surfaceNormal = normalize(position);

      // March optical depth to the sun for finer details, which BSM lacks.
      float sunRayDistance = 0.0;
      float opticalDepth = marchOpticalDepth(
        position,
        sunDirection,
        maxIterationCountToSun,
        mipLevel,
        jitter,
        sunRayDistance
      );

      if (height < shadowTopHeight) {
        // Obtain the optical depth from BSM at the ray position.
        opticalDepth += sampleShadowOpticalDepth(
          position,
          // Take account of only positions further than the marched ray
          // distance.
          sunRayDistance,
          // Apply PCF only when the sun is close to the horizon.
          maxShadowFilterRadius * remapClamped(dot(sunDirection, surfaceNormal), 0.1, 0.0),
          jitter
        );
      }

      vec3 radiance = sunIrradiance * approximateMultipleScattering(opticalDepth, cosTheta);

      #ifdef GROUND_BOUNCE
      // Fudge factor for the irradiance from ground.
      if (height < shadowTopHeight && mipLevel < 0.5) {
        vec3 groundRadiance = approximateRadianceFromGround(
          position,
          surfaceNormal,
          height,
          mipLevel,
          jitter
        );
        radiance += groundRadiance * RECIPROCAL_PI4 * groundBounceScale;
      }
      #endif // GROUND_BOUNCE

      // Crude approximation of sky gradient. Better than none in the shadows.
      float skyGradient = dot(weather.heightFraction * 0.5 + 0.5, media.weight);
      radiance += skyIrradiance * RECIPROCAL_PI4 * skyGradient * skyLightScale;

      // Finally multiply by scattering.
      radiance *= media.scattering;

      #ifdef POWDER
      radiance *= 1.0 - powderScale * exp(-media.extinction * powderExponent);
      #endif // POWDER

      #ifdef DEBUG_SHOW_CASCADES
      if (height < shadowTopHeight) {
        radiance = 1e-3 * getFadedCascadeColor(position, jitter);
      }
      #endif // DEBUG_SHOW_CASCADES

      // Energy-conserving analytical integration of scattered light
      // See 5.6.3 in https://media.contentapi.ea.com/content/dam/eacom/frostbite/files/s2016-pbs-frostbite-sky-clouds-new.pdf
      float transmittance = exp(-media.extinction * stepSize);
      float clampedExtinction = max(media.extinction, 1e-7);
      vec3 scatteringIntegral = (radiance - radiance * transmittance) / clampedExtinction;
      radianceIntegral += transmittanceIntegral * scatteringIntegral;
      transmittanceIntegral *= transmittance;

      // Aerial perspective affecting clouds
      // See 5.9.1 in https://media.contentapi.ea.com/content/dam/eacom/frostbite/files/s2016-pbs-frostbite-sky-clouds-new.pdf
      weightedDistanceSum += rayDistance * transmittanceIntegral;
      transmittanceSum += transmittanceIntegral;
    }

    if (transmittanceIntegral <= minTransmittance) {
      break; // Early termination
    }

    // Take a shorter step because we've already hit the clouds.
    stepSize *= perspectiveStepScale;
    rayDistance += stepSize;
  }

  // The final product of 5.9.1 and we'll evaluate this in aerial perspective.
  frontDepth = transmittanceSum > 0.0 ? weightedDistanceSum / transmittanceSum : -1.0;

  return vec4(radianceIntegral, remapClamped(transmittanceIntegral, 1.0, minTransmittance));
}

#ifdef SHADOW_LENGTH

float marchShadowLength(
  const vec3 rayOrigin,
  const vec3 rayDirection,
  const vec2 rayNearFar,
  const float jitter
) {
  float shadowLength = 0.0;
  float maxRayDistance = rayNearFar.y - rayNearFar.x;
  float stepSize = minShadowLengthStepSize;
  float rayDistance = stepSize * jitter;
  const float attenuationFactor = 1.0 - 5e-4;
  float attenuation = 1.0;

  // TODO: This march is closed, and sample resolution can be much lower.
  // Refining the termination by binary search will make it much more efficient.
  for (int i = 0; i < maxShadowLengthIterationCount; ++i) {
    if (rayDistance > maxRayDistance) {
      break; // Termination
    }
    vec3 position = rayDistance * rayDirection + rayOrigin;
    float opticalDepth = sampleShadowOpticalDepth(position, 0.0, 0.0, jitter);
    shadowLength += (1.0 - exp(-opticalDepth)) * stepSize * attenuation;
    stepSize *= perspectiveStepScale;
    rayDistance += stepSize;
  }
  return shadowLength;
}

#endif // SHADOW_LENGTH

#ifdef HAZE

vec4 approximateHaze(
  const vec3 rayOrigin,
  const vec3 rayDirection,
  const float maxRayDistance,
  const float cosTheta,
  const float shadowLength
) {
  float modulation = remapClamped(coverage, 0.2, 0.4);
  if (cameraHeight * modulation < 0.0) {
    return vec4(0.0);
  }
  float density = modulation * hazeDensityScale * exp(-cameraHeight * hazeExponent);
  if (density < 1e-7) {
    return vec4(0.0); // Prevent artifact in views from space
  }

  // Blend two normals by the difference in angle so that normal near the
  // ground becomes that of the origin, and in the sky that of the horizon.
  vec3 normalAtOrigin = normalize(rayOrigin);
  vec3 normalAtHorizon = (rayOrigin - dot(rayOrigin, rayDirection) * rayDirection) / bottomRadius;
  float alpha = remapClamped(dot(normalAtOrigin, normalAtHorizon), 0.9, 1.0);
  vec3 normal = mix(normalAtOrigin, normalAtHorizon, alpha);

  // Analytical optical depth where density exponentially decreases with height.
  // Based on: https://iquilezles.org/articles/fog/
  float angle = max(dot(normal, rayDirection), 1e-5);
  float exponent = angle * hazeExponent;
  float linearTerm = density / hazeExponent / angle;

  // Derive the optical depths separately for with and without shadow length.
  float expTerm = 1.0 - exp(-maxRayDistance * exponent);
  float shadowExpTerm = 1.0 - exp(-min(maxRayDistance, shadowLength) * exponent);
  float opticalDepth = expTerm * linearTerm;
  float shadowOpticalDepth = max((expTerm - shadowExpTerm) * linearTerm, 0.0);
  float transmittance = saturate(1.0 - exp(-opticalDepth));
  float shadowTransmittance = saturate(1.0 - exp(-shadowOpticalDepth));

  vec3 skyIrradiance = vGroundIrradiance.sky;
  vec3 sunIrradiance = vGroundIrradiance.sun;
  vec3 inscatter = sunIrradiance * phaseFunction(cosTheta) * shadowTransmittance;
  inscatter += skyIrradiance * RECIPROCAL_PI4 * skyLightScale * transmittance;
  inscatter *= hazeScatteringCoefficient / (hazeAbsorptionCoefficient + hazeScatteringCoefficient);
  return vec4(inscatter, transmittance);
}

#endif // HAZE

void applyAerialPerspective(
  const vec3 cameraPosition,
  const vec3 frontPosition,
  const float shadowLength,
  inout vec4 color
) {
  vec3 transmittance;
  vec3 inscatter = GetSkyRadianceToPoint(
    cameraPosition * METER_TO_LENGTH_UNIT,
    frontPosition * METER_TO_LENGTH_UNIT,
    shadowLength * METER_TO_LENGTH_UNIT,
    sunDirection,
    transmittance
  );
  color.rgb = color.rgb * transmittance + inscatter * color.a;
}

bool rayIntersectsGround(const vec3 cameraPosition, const vec3 rayDirection) {
  float r = length(cameraPosition);
  float mu = dot(cameraPosition, rayDirection) / r;
  return mu < 0.0 && r * r * (mu * mu - 1.0) + bottomRadius * bottomRadius >= 0.0;
}

struct IntersectionResult {
  bool ground;
  vec4 first;
  vec4 second;
};

IntersectionResult getIntersections(const vec3 cameraPosition, const vec3 rayDirection) {
  IntersectionResult intersections;
  intersections.ground = rayIntersectsGround(cameraPosition, rayDirection);
  raySphereIntersections(
    cameraPosition,
    rayDirection,
    bottomRadius + vec4(0.0, minHeight, maxHeight, shadowTopHeight),
    intersections.first,
    intersections.second
  );
  return intersections;
}

vec2 getRayNearFar(const IntersectionResult intersections) {
  vec2 nearFar;
  if (cameraHeight < minHeight) {
    // View below the clouds
    if (intersections.ground) {
      nearFar = vec2(-1.0); // No clouds to the ground
    } else {
      nearFar = vec2(intersections.second.y, intersections.second.z);
      nearFar.y = min(nearFar.y, maxRayDistance);
    }
  } else if (cameraHeight < maxHeight) {
    // View inside the total cloud layer
    if (intersections.ground) {
      nearFar = vec2(cameraNear, intersections.first.y);
    } else {
      nearFar = vec2(cameraNear, intersections.second.z);
    }
  } else {
    // View above the clouds
    nearFar = vec2(intersections.first.z, intersections.second.z);
    if (intersections.ground) {
      // Clamp the ray at the min height.
      nearFar.y = intersections.first.y;
    }
  }
  return nearFar;
}

#ifdef SHADOW_LENGTH
vec2 getShadowRayNearFar(const IntersectionResult intersections) {
  vec2 nearFar;
  if (cameraHeight < shadowTopHeight) {
    if (intersections.ground) {
      nearFar = vec2(cameraNear, intersections.first.x);
    } else {
      nearFar = vec2(cameraNear, intersections.second.w);
    }
  } else {
    nearFar = vec2(intersections.first.w, intersections.second.w);
    if (intersections.ground) {
      // Clamp the ray at the ground.
      nearFar.y = intersections.first.x;
    }
  }
  nearFar.y = min(nearFar.y, maxShadowLengthRayDistance);
  return nearFar;
}
#endif // SHADOW_LENGTH

#ifdef HAZE
vec2 getHazeRayNearFar(const IntersectionResult intersections) {
  vec2 nearFar;
  if (cameraHeight < maxHeight) {
    if (intersections.ground) {
      nearFar = vec2(cameraNear, intersections.first.x);
    } else {
      nearFar = vec2(cameraNear, intersections.second.z);
    }
  } else {
    nearFar = vec2(cameraNear, intersections.second.z);
    if (intersections.ground) {
      // Clamp the ray at the ground.
      nearFar.y = intersections.first.x;
    }
  }
  return nearFar;
}
#endif // HAZE

float getRayDistanceToScene(const vec3 rayDirection, out float viewZ) {
  float depth = readDepthValue(depthBuffer, vUv * targetUvScale + temporalJitter);
  if (depth < 1.0 - 1e-7) {
    depth = reverseLogDepth(depth, cameraNear, cameraFar);
    viewZ = getViewZ(depth);
    return -viewZ / dot(rayDirection, vCameraDirection);
  }
  viewZ = 0.0;
  return 0.0;
}

void main() {
  #ifdef DEBUG_SHOW_SHADOW_MAP
  outputColor = getCascadedShadowMaps(vUv);
  outputDepthVelocity = vec3(0.0);
  #ifdef SHADOW_LENGTH
  outputShadowLength = 0.0;
  #endif // SHADOW_LENGTH
  return;
  #endif // DEBUG_SHOW_SHADOW_MAP

  vec3 cameraPosition = vCameraPosition + altitudeCorrection;
  vec3 rayDirection = normalize(vRayDirection);
  float cosTheta = dot(sunDirection, rayDirection);

  IntersectionResult intersections = getIntersections(cameraPosition, rayDirection);
  vec2 rayNearFar = getRayNearFar(intersections);
  #ifdef SHADOW_LENGTH
  vec2 shadowRayNearFar = getShadowRayNearFar(intersections);
  #endif // SHADOW_LENGTH
  #ifdef HAZE
  vec2 hazeRayNearFar = getHazeRayNearFar(intersections);
  #endif // HAZE

  float sceneViewZ;
  float rayDistanceToScene = getRayDistanceToScene(rayDirection, sceneViewZ);
  if (rayDistanceToScene > 0.0) {
    rayNearFar.y = min(rayNearFar.y, rayDistanceToScene);
    #ifdef SHADOW_LENGTH
    shadowRayNearFar.y = min(shadowRayNearFar.y, rayDistanceToScene);
    #endif // SHADOW_LENGTH
    #ifdef HAZE
    hazeRayNearFar.y = min(hazeRayNearFar.y, rayDistanceToScene);
    #endif // HAZE
  }

  bool intersectsGround = any(lessThan(rayNearFar, vec2(0.0)));
  bool intersectsScene = rayNearFar.y < rayNearFar.x;

  float stbn = getSTBN();

  vec4 color = vec4(0.0);
  float frontDepth = rayNearFar.y;
  vec3 depthVelocity = vec3(0.0);
  float shadowLength = 0.0;
  bool hitClouds = false;

  if (!intersectsGround && !intersectsScene) {
    vec3 rayOrigin = rayNearFar.x * rayDirection + cameraPosition;

    vec2 globeUv = getGlobeUv(rayOrigin);
    #ifdef DEBUG_SHOW_UV
    outputColor = vec4(vec3(checker(globeUv, localWeatherRepeat + localWeatherOffset)), 1.0);
    outputDepthVelocity = vec3(0.0);
    #ifdef SHADOW_LENGTH
    outputShadowLength = 0.0;
    #endif // SHADOW_LENGTH
    return;
    #endif // DEBUG_SHOW_UV

    float mipLevel = getMipLevel(globeUv * localWeatherRepeat) * mipLevelScale;
    mipLevel = mix(0.0, mipLevel, min(1.0, 0.2 * cameraHeight / maxHeight));

    float marchedFrontDepth;
    ivec3 sampleCount = ivec3(0);
    color = marchClouds(
      rayOrigin,
      rayDirection,
      rayNearFar,
      cosTheta,
      stbn,
      pow(2.0, mipLevel),
      marchedFrontDepth,
      sampleCount
    );

    #ifdef DEBUG_SHOW_SAMPLE_COUNT
    outputColor = vec4(vec3(sampleCount) / vec3(500.0, 5.0, 5.0), 1.0);
    outputDepthVelocity = vec3(0.0);
    #ifdef SHADOW_LENGTH
    outputShadowLength = 0.0;
    #endif // SHADOW_LENGTH
    return;
    #endif // DEBUG_SHOW_SAMPLE_COUNT

    // Front depth will be -1.0 when no samples are accumulated.
    hitClouds = marchedFrontDepth >= 0.0;
    if (hitClouds) {
      frontDepth = rayNearFar.x + marchedFrontDepth;

      #ifdef SHADOW_LENGTH
      // Clamp the shadow length ray at the clouds.
      shadowRayNearFar.y = mix(
        shadowRayNearFar.y,
        min(frontDepth, shadowRayNearFar.y),
        color.a // Interpolate by the alpha for smoother edges.
      );

      // Shadow length must be computed before applying aerial perspective.
      if (all(greaterThanEqual(shadowRayNearFar, vec2(0.0)))) {
        shadowLength = marchShadowLength(
          shadowRayNearFar.x * rayDirection + cameraPosition,
          rayDirection,
          shadowRayNearFar,
          stbn
        );
      }
      #endif // SHADOW_LENGTH

      #ifdef HAZE
      // Clamp the haze ray at the clouds.
      hazeRayNearFar.y = mix(
        hazeRayNearFar.y,
        min(frontDepth, hazeRayNearFar.y),
        color.a // Interpolate by the alpha for smoother edges.
      );
      #endif // HAZE

      // Apply aerial perspective.
      vec3 frontPosition = cameraPosition + frontDepth * rayDirection;
      applyAerialPerspective(cameraPosition, frontPosition, shadowLength, color);

      // Velocity for temporal resolution.
      vec3 frontPositionWorld = ecefToWorld(frontPosition);
      vec4 prevClip = reprojectionMatrix * vec4(frontPositionWorld, 1.0);
      prevClip /= prevClip.w;
      vec2 prevUv = prevClip.xy * 0.5 + 0.5;
      vec2 velocity = vUv - prevUv;
      depthVelocity = vec3(frontDepth, velocity);
    }
  }

  if (!hitClouds) {
    #ifdef SHADOW_LENGTH
    if (all(greaterThanEqual(shadowRayNearFar, vec2(0.0)))) {
      shadowLength = marchShadowLength(
        shadowRayNearFar.x * rayDirection + cameraPosition,
        rayDirection,
        shadowRayNearFar,
        stbn
      );
    }
    #endif // SHADOW_LENGTH

    // Velocity for temporal resolution. Here reproject in the view space for
    // greatly reducing the precision errors.
    frontDepth = sceneViewZ < 0.0 ? -sceneViewZ : cameraFar;
    vec3 frontView = vViewPosition * frontDepth;
    vec4 prevClip = viewReprojectionMatrix * vec4(frontView, 1.0);
    prevClip /= prevClip.w;
    vec2 prevUv = prevClip.xy * 0.5 + 0.5;
    vec2 velocity = vUv - prevUv;
    depthVelocity = vec3(frontDepth, velocity);
  }

  #ifdef DEBUG_SHOW_FRONT_DEPTH
  outputColor = vec4(turbo(frontDepth / maxRayDistance), 1.0);
  outputDepthVelocity = vec3(0.0);
  #ifdef SHADOW_LENGTH
  outputShadowLength = 0.0;
  #endif // SHADOW_LENGTH
  return;
  #endif // DEBUG_SHOW_FRONT_DEPTH

  #ifdef HAZE
  vec4 haze = approximateHaze(
    cameraNear * rayDirection + cameraPosition,
    rayDirection,
    hazeRayNearFar.y - hazeRayNearFar.x,
    cosTheta,
    shadowLength
  );
  color.rgb = mix(color.rgb, haze.rgb, haze.a);
  color.a = color.a * (1.0 - haze.a) + haze.a;
  #endif // HAZE

  outputColor = color;
  outputDepthVelocity = depthVelocity;
  #ifdef SHADOW_LENGTH
  outputShadowLength = shadowLength * METER_TO_LENGTH_UNIT;
  #endif // SHADOW_LENGTH
}
`,To=`float getSTBN() {
  ivec3 size = textureSize(stbnTexture, 0);
  vec3 scale = 1.0 / vec3(size);
  return texture(stbnTexture, vec3(gl_FragCoord.xy, float(frame % size.z)) * scale).r;
}

// Straightforward spherical mapping
vec2 getSphericalUv(const vec3 position) {
  vec2 st = normalize(position.yx);
  float phi = atan(st.x, st.y);
  float theta = asin(normalize(position).z);
  return vec2(phi * RECIPROCAL_PI2 + 0.5, theta * RECIPROCAL_PI + 0.5);
}

vec2 getCubeSphereUv(const vec3 position) {
  // Cube-sphere relaxation by: http://mathproofs.blogspot.com/2005/07/mapping-cube-to-sphere.html
  // TODO: Tile and fix seams.
  // Possible improvements:
  // https://iquilezles.org/articles/texturerepetition/
  // https://gamedev.stackexchange.com/questions/184388/fragment-shader-map-dot-texture-repeatedly-over-the-sphere
  // https://github.com/mmikk/hextile-demo

  vec3 n = normalize(position);
  vec3 f = abs(n);
  vec3 c = n / max(f.x, max(f.y, f.z));
  vec2 m;
  if (all(greaterThan(f.yy, f.xz))) {
    m = c.y > 0.0 ? vec2(-n.x, n.z) : n.xz;
  } else if (all(greaterThan(f.xx, f.yz))) {
    m = c.x > 0.0 ? n.yz : vec2(-n.y, n.z);
  } else {
    m = c.z > 0.0 ? n.xy : vec2(n.x, -n.y);
  }

  vec2 m2 = m * m;
  float q = dot(m2.xy, vec2(-2.0, 2.0)) - 3.0;
  float q2 = q * q;
  vec2 uv;
  uv.x = sqrt(1.5 + m2.x - m2.y - 0.5 * sqrt(-24.0 * m2.x + q2)) * (m.x > 0.0 ? 1.0 : -1.0);
  uv.y = sqrt(6.0 / (3.0 - uv.x * uv.x)) * m.y;
  return uv * 0.5 + 0.5;
}

vec2 getGlobeUv(const vec3 position) {
  return getCubeSphereUv(position);
}

float getMipLevel(const vec2 uv) {
  const float mipLevelScale = 0.1;
  vec2 coord = uv * resolution;
  vec2 ddx = dFdx(coord);
  vec2 ddy = dFdy(coord);
  float deltaMaxSqr = max(dot(ddx, ddx), dot(ddy, ddy)) * mipLevelScale;
  return max(0.0, 0.5 * log2(max(1.0, deltaMaxSqr)));
}

bool insideLayerIntervals(const float height) {
  bvec3 gt = greaterThan(vec3(height), minIntervalHeights);
  bvec3 lt = lessThan(vec3(height), maxIntervalHeights);
  return any(bvec3(gt.x && lt.x, gt.y && lt.y, gt.z && lt.z));
}

struct WeatherSample {
  vec4 heightFraction; // Normalized height of each layer
  vec4 density;
};

vec4 shapeAlteringFunction(const vec4 heightFraction, const vec4 bias) {
  // Apply a semi-circle transform to round the clouds towards the top.
  vec4 biased = pow(heightFraction, bias);
  vec4 x = clamp(biased * 2.0 - 1.0, -1.0, 1.0);
  return 1.0 - x * x;
}

WeatherSample sampleWeather(const vec2 uv, const float height, const float mipLevel) {
  WeatherSample weather;
  weather.heightFraction = remapClamped(vec4(height), minLayerHeights, maxLayerHeights);

  vec4 localWeather = pow(
    textureLod(
      localWeatherTexture,
      uv * localWeatherRepeat + localWeatherOffset,
      mipLevel
    ).LOCAL_WEATHER_CHANNELS,
    weatherExponents
  );
  #ifdef SHADOW
  localWeather *= shadowLayerMask;
  #endif // SHADOW

  vec4 heightScale = shapeAlteringFunction(weather.heightFraction, shapeAlteringBiases);

  // Modulation to control weather by coverage parameter.
  // Reference: https://github.com/Prograda/Skybolt/blob/master/Assets/Core/Shaders/Clouds.h#L63
  vec4 factor = 1.0 - coverage * heightScale;
  weather.density = remapClamped(
    mix(localWeather, vec4(1.0), coverageFilterWidths),
    factor,
    factor + coverageFilterWidths
  );

  return weather;
}

vec4 getLayerDensity(const vec4 heightFraction) {
  // prettier-ignore
  return densityProfile.expTerms * exp(densityProfile.exponents * heightFraction) +
    densityProfile.linearTerms * heightFraction +
    densityProfile.constantTerms;
}

struct MediaSample {
  float density;
  vec4 weight;
  float scattering;
  float extinction;
};

MediaSample sampleMedia(
  const WeatherSample weather,
  const vec3 position,
  const vec2 uv,
  const float mipLevel,
  const float jitter,
  out ivec3 sampleCount
) {
  vec4 density = weather.density;

  // TODO: Define in physical length.
  vec3 surfaceNormal = normalize(position);
  float localWeatherSpeed = length(localWeatherOffset);
  vec3 evolution = -surfaceNormal * localWeatherSpeed * 2e4;

  vec3 turbulence = vec3(0.0);
  #ifdef TURBULENCE
  vec2 turbulenceUv = uv * localWeatherRepeat * turbulenceRepeat;
  turbulence =
    turbulenceDisplacement *
    (texture(turbulenceTexture, turbulenceUv).rgb * 2.0 - 1.0) *
    dot(density, remapClamped(weather.heightFraction, vec4(0.3), vec4(0.0)));
  #endif // TURBULENCE

  vec3 shapePosition = (position + evolution + turbulence) * shapeRepeat + shapeOffset;
  float shape = texture(shapeTexture, shapePosition).r;
  density = remapClamped(density, vec4(1.0 - shape) * shapeAmounts, vec4(1.0));

  #ifdef DEBUG_SHOW_SAMPLE_COUNT
  ++sampleCount.y;
  #endif // DEBUG_SHOW_SAMPLE_COUNT

  #ifdef SHAPE_DETAIL
  if (mipLevel * 0.5 + (jitter - 0.5) * 0.5 < 0.5) {
    vec3 detailPosition = (position + turbulence) * shapeDetailRepeat + shapeDetailOffset;
    float detail = texture(shapeDetailTexture, detailPosition).r;
    // Fluffy at the top and whippy at the bottom.
    vec4 modifier = mix(
      vec4(pow(detail, 6.0)),
      vec4(1.0 - detail),
      remapClamped(weather.heightFraction, vec4(0.2), vec4(0.4))
    );
    modifier = mix(vec4(0.0), modifier, shapeDetailAmounts);
    density = remapClamped(density * 2.0, vec4(modifier * 0.5), vec4(1.0));

    #ifdef DEBUG_SHOW_SAMPLE_COUNT
    ++sampleCount.z;
    #endif // DEBUG_SHOW_SAMPLE_COUNT
  }
  #endif // SHAPE_DETAIL

  // Apply the density profiles.
  density = saturate(density * densityScales * getLayerDensity(weather.heightFraction));

  MediaSample media;
  float densitySum = density.x + density.y + density.z + density.w;
  media.weight = density / densitySum;
  media.scattering = densitySum * scatteringCoefficient;
  media.extinction = densitySum * absorptionCoefficient + media.scattering;
  return media;
}

MediaSample sampleMedia(
  const WeatherSample weather,
  const vec3 position,
  const vec2 uv,
  const float mipLevel,
  const float jitter
) {
  ivec3 sampleCount;
  return sampleMedia(weather, position, uv, mipLevel, jitter, sampleCount);
}
`,kd=`precision highp float;
precision highp sampler3D;

#include "atmosphere/bruneton/definitions"

uniform AtmosphereParameters ATMOSPHERE;
uniform vec3 SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;
uniform vec3 SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;

uniform sampler2D transmittance_texture;
uniform sampler3D scattering_texture;
uniform sampler2D irradiance_texture;
uniform sampler3D single_mie_scattering_texture;
uniform sampler3D higher_order_scattering_texture;

#include "atmosphere/bruneton/common"
#include "atmosphere/bruneton/runtime"

#include "types"

uniform mat4 inverseProjectionMatrix;
uniform mat4 inverseViewMatrix;
uniform vec3 cameraPosition;
uniform mat4 worldToECEFMatrix;
uniform vec3 altitudeCorrection;

// Atmosphere
uniform float bottomRadius;
uniform vec3 sunDirection;

// Cloud layers
uniform float minHeight;
uniform float maxHeight;

layout(location = 0) in vec3 position;

out vec2 vUv;
out vec3 vCameraPosition;
out vec3 vCameraDirection; // Direction to the center of screen
out vec3 vRayDirection; // Direction to the texel
out vec3 vViewPosition;

out GroundIrradiance vGroundIrradiance;
out CloudsIrradiance vCloudsIrradiance;

void sampleSunSkyIrradiance(const vec3 positionECEF) {
  vGroundIrradiance.sun = GetSunAndSkyScalarIrradiance(
    positionECEF * METER_TO_LENGTH_UNIT,
    sunDirection,
    vGroundIrradiance.sky
  );

  vec3 surfaceNormal = normalize(positionECEF);
  vec2 radii = (bottomRadius + vec2(minHeight, maxHeight)) * METER_TO_LENGTH_UNIT;
  vCloudsIrradiance.minSun = GetSunAndSkyScalarIrradiance(
    surfaceNormal * radii.x,
    sunDirection,
    vCloudsIrradiance.minSky
  );
  vCloudsIrradiance.maxSun = GetSunAndSkyScalarIrradiance(
    surfaceNormal * radii.y,
    sunDirection,
    vCloudsIrradiance.maxSky
  );
}

void main() {
  vUv = position.xy * 0.5 + 0.5;

  vec3 viewPosition = (inverseProjectionMatrix * vec4(position, 1.0)).xyz;
  vec3 worldDirection = (inverseViewMatrix * vec4(viewPosition.xyz, 0.0)).xyz;
  vec3 cameraDirection = normalize((inverseViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz);
  vCameraPosition = (worldToECEFMatrix * vec4(cameraPosition, 1.0)).xyz;
  vCameraDirection = (worldToECEFMatrix * vec4(cameraDirection, 0.0)).xyz;
  vRayDirection = (worldToECEFMatrix * vec4(worldDirection, 0.0)).xyz;
  vViewPosition = viewPosition;

  sampleSunSkyIrradiance(vCameraPosition + altitudeCorrection);

  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`,So=`uniform vec2 resolution;
uniform int frame;
uniform sampler3D stbnTexture;

// Atmosphere
uniform float bottomRadius;
uniform mat4 worldToECEFMatrix;
uniform mat4 ecefToWorldMatrix;
uniform vec3 altitudeCorrection;
uniform vec3 sunDirection;

// Participating medium
uniform float scatteringCoefficient;
uniform float absorptionCoefficient;

// Primary raymarch
uniform float minDensity;
uniform float minExtinction;
uniform float minTransmittance;

// Shape and weather
uniform sampler2D localWeatherTexture;
uniform vec2 localWeatherRepeat;
uniform vec2 localWeatherOffset;
uniform float coverage;
uniform sampler3D shapeTexture;
uniform vec3 shapeRepeat;
uniform vec3 shapeOffset;

#ifdef SHAPE_DETAIL
uniform sampler3D shapeDetailTexture;
uniform vec3 shapeDetailRepeat;
uniform vec3 shapeDetailOffset;
#endif // SHAPE_DETAIL

#ifdef TURBULENCE
uniform sampler2D turbulenceTexture;
uniform vec2 turbulenceRepeat;
uniform float turbulenceDisplacement;
#endif // TURBULENCE

// Haze
#ifdef HAZE
uniform float hazeDensityScale;
uniform float hazeExponent;
uniform float hazeScatteringCoefficient;
uniform float hazeAbsorptionCoefficient;
#endif // HAZE

// Cloud layers
uniform vec4 minLayerHeights;
uniform vec4 maxLayerHeights;
uniform vec3 minIntervalHeights;
uniform vec3 maxIntervalHeights;
uniform vec4 densityScales;
uniform vec4 shapeAmounts;
uniform vec4 shapeDetailAmounts;
uniform vec4 weatherExponents;
uniform vec4 shapeAlteringBiases;
uniform vec4 coverageFilterWidths;
uniform float minHeight;
uniform float maxHeight;
uniform float shadowTopHeight;
uniform float shadowBottomHeight;
uniform vec4 shadowLayerMask;
uniform CloudDensityProfile densityProfile;
`,ra=`struct GroundIrradiance {
  vec3 sun;
  vec3 sky;
};

struct CloudsIrradiance {
  vec3 minSun;
  vec3 minSky;
  vec3 maxSun;
  vec3 maxSky;
};

struct CloudDensityProfile {
  vec4 expTerms;
  vec4 exponents;
  vec4 linearTerms;
  vec4 constantTerms;
};
`,Wd=Object.defineProperty,he=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&Wd(e,r,n),n},Vd=new W,Yd=new ce,re=class extends ze{constructor({parameterUniforms:e,layerUniforms:r,atmosphereUniforms:i},n=Et.DEFAULT){super({name:"CloudsMaterial",glslVersion:Ci,vertexShader:k(kd,{atmosphere:{bruneton:{common:Zn,definitions:Kn,runtime:Qn}},types:ra}),fragmentShader:mt(k(zd,{core:{depth:ei,math:Me,turbo:wn,generators:Ss,raySphereIntersection:Bt,cascadedShadowMaps:$r,interleavedGradientNoise:ti,vogelDisk:ri},atmosphere:{bruneton:{common:Zn,definitions:Kn,runtime:Qn}},types:ra,parameters:So,clouds:To})),uniforms:{...e,...r,...i,depthBuffer:new d(null),viewMatrix:new d(new Z),inverseProjectionMatrix:new d(new Z),inverseViewMatrix:new d(new Z),reprojectionMatrix:new d(new Z),viewReprojectionMatrix:new d(new Z),resolution:new d(new V),cameraNear:new d(0),cameraFar:new d(0),cameraHeight:new d(0),frame:new d(0),temporalJitter:new d(new V),targetUvScale:new d(new V),mipLevelScale:new d(1),stbnTexture:new d(null),skyLightScale:new d(1),groundBounceScale:new d(1),powderScale:new d(.8),powderExponent:new d(150),maxIterationCount:new d(T.clouds.maxIterationCount),minStepSize:new d(T.clouds.minStepSize),maxStepSize:new d(T.clouds.maxStepSize),maxRayDistance:new d(T.clouds.maxRayDistance),perspectiveStepScale:new d(T.clouds.perspectiveStepScale),minDensity:new d(T.clouds.minDensity),minExtinction:new d(T.clouds.minExtinction),minTransmittance:new d(T.clouds.minTransmittance),maxIterationCountToSun:new d(T.clouds.maxIterationCountToSun),maxIterationCountToGround:new d(T.clouds.maxIterationCountToGround),minSecondaryStepSize:new d(T.clouds.minSecondaryStepSize),secondaryStepScale:new d(T.clouds.secondaryStepScale),shadowBuffer:new d(null),shadowTexelSize:new d(new V),shadowIntervals:new d(Array.from({length:4},()=>new V)),shadowMatrices:new d(Array.from({length:4},()=>new Z)),shadowFar:new d(0),maxShadowFilterRadius:new d(6),shadowLayerMask:new d(new ue().setScalar(1)),maxShadowLengthIterationCount:new d(T.clouds.maxShadowLengthIterationCount),minShadowLengthStepSize:new d(T.clouds.minShadowLengthStepSize),maxShadowLengthRayDistance:new d(T.clouds.maxShadowLengthRayDistance),hazeDensityScale:new d(3e-5),hazeExponent:new d(.001),hazeScatteringCoefficient:new d(.9),hazeAbsorptionCoefficient:new d(.5)}},n),this.temporalUpscale=!0,this.depthPacking=0,this.localWeatherChannels="rgba",this.shapeDetail=T.shapeDetail,this.turbulence=T.turbulence,this.shadowLength=T.lightShafts,this.haze=T.haze,this.multiScatteringOctaves=T.clouds.multiScatteringOctaves,this.accurateSunSkyLight=T.clouds.accurateSunSkyLight,this.accuratePhaseFunction=T.clouds.accuratePhaseFunction,this.shadowCascadeCount=T.shadow.cascadeCount,this.shadowSampleCount=8,this.scatterAnisotropy1=.7,this.scatterAnisotropy2=-.2,this.scatterAnisotropyMix=.5}onBeforeRender(e,r,i,n,a,s){let o=this.defines.USE_LOGARITHMIC_DEPTH_BUFFER!=null,c=e.capabilities.logarithmicDepthBuffer;c!==o&&(c?this.defines.USE_LOGARITHMIC_DEPTH_BUFFER="1":delete this.defines.USE_LOGARITHMIC_DEPTH_BUFFER);let l=this.defines.POWDER!=null,u=this.uniforms.powderScale.value>0;u!==l&&(u?this.defines.POWDER="1":delete this.defines.POWDER,this.needsUpdate=!0);let h=this.defines.GROUND_BOUNCE!=null;(this.uniforms.groundBounceScale.value>0&&this.uniforms.maxIterationCountToGround.value>0)!==h&&(u?this.defines.GROUND_BOUNCE="1":delete this.defines.GROUND_BOUNCE,this.needsUpdate=!0)}copyCameraSettings(e){e.isPerspectiveCamera===!0?this.defines.PERSPECTIVE_CAMERA!=="1"&&(this.defines.PERSPECTIVE_CAMERA="1",this.needsUpdate=!0):this.defines.PERSPECTIVE_CAMERA!=null&&(delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0);let r=this.uniforms;r.viewMatrix.value.copy(e.matrixWorldInverse),r.inverseViewMatrix.value.copy(e.matrixWorld);let i=this.previousProjectionMatrix??e.projectionMatrix,n=this.previousViewMatrix??e.matrixWorldInverse,a=r.inverseProjectionMatrix.value,s=r.inverseViewMatrix.value,o=r.reprojectionMatrix.value,c=r.viewReprojectionMatrix.value;if(this.temporalUpscale){let h=r.frame.value%16,p=r.resolution.value,v=Ao[h],A=(v.x-.5)/p.x*4,g=(v.y-.5)/p.y*4;r.temporalJitter.value.set(A,g),r.mipLevelScale.value=.25,a.copy(e.projectionMatrix),a.elements[8]+=A*2,a.elements[9]+=g*2,a.invert(),o.copy(i),o.elements[8]+=A*2,o.elements[9]+=g*2,o.multiply(n),c.copy(o).multiply(s)}else r.temporalJitter.value.setScalar(0),r.mipLevelScale.value=1,a.copy(e.projectionMatrixInverse),o.copy(i).multiply(n),c.copy(o).multiply(s);r.cameraNear.value=e.near,r.cameraFar.value=e.far;let l=e.getWorldPosition(r.cameraPosition.value),u=Vd.copy(l).applyMatrix4(r.worldToECEFMatrix.value);try{r.cameraHeight.value=Yd.setFromECEF(u).height}catch{}}copyReprojectionMatrix(e){this.previousProjectionMatrix??=new Z,this.previousViewMatrix??=new Z,this.previousProjectionMatrix.copy(e.projectionMatrix),this.previousViewMatrix.copy(e.matrixWorldInverse)}setSize(e,r,i,n){this.uniforms.resolution.value.set(e,r),i!=null&&n!=null?this.uniforms.targetUvScale.value.set(e/i,r/n):this.uniforms.targetUvScale.value.setScalar(1),this.previousProjectionMatrix=void 0,this.previousViewMatrix=void 0}setShadowSize(e,r){this.uniforms.shadowTexelSize.value.set(1/e,1/r)}get depthBuffer(){return this.uniforms.depthBuffer.value}set depthBuffer(e){this.uniforms.depthBuffer.value=e}};he([Be("DEPTH_PACKING")],re.prototype,"depthPacking");he([Sn("LOCAL_WEATHER_CHANNELS",{validate:t=>/^[rgba]{4}$/.test(t)})],re.prototype,"localWeatherChannels");he([C("SHAPE_DETAIL")],re.prototype,"shapeDetail");he([C("TURBULENCE")],re.prototype,"turbulence");he([C("SHADOW_LENGTH")],re.prototype,"shadowLength");he([C("HAZE")],re.prototype,"haze");he([Be("MULTI_SCATTERING_OCTAVES",{min:1,max:12})],re.prototype,"multiScatteringOctaves");he([C("ACCURATE_SUN_SKY_LIGHT")],re.prototype,"accurateSunSkyLight");he([C("ACCURATE_PHASE_FUNCTION")],re.prototype,"accuratePhaseFunction");he([Be("SHADOW_CASCADE_COUNT",{min:1,max:4})],re.prototype,"shadowCascadeCount");he([Be("SHADOW_SAMPLE_COUNT",{min:1,max:16})],re.prototype,"shadowSampleCount");he([Jr("SCATTER_ANISOTROPY_1")],re.prototype,"scatterAnisotropy1");he([Jr("SCATTER_ANISOTROPY_2")],re.prototype,"scatterAnisotropy2");he([Jr("SCATTER_ANISOTROPY_MIX")],re.prototype,"scatterAnisotropyMix");var Xd=`// Taken from https://gist.github.com/TheRealMJP/c83b8c0f46b63f3a88a5986f4fa982b1
// TODO: Use 5-taps version: https://www.shadertoy.com/view/MtVGWz
// Or even 4 taps (requires preprocessing in the input buffer):
// https://www.shadertoy.com/view/4tyGDD

/**
 * MIT License
 *
 * Copyright (c) 2019 MJP
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

vec4 textureCatmullRom(sampler2D tex, vec2 uv) {
  vec2 texSize = vec2(textureSize(tex, 0));

  // We're going to sample a a 4x4 grid of texels surrounding the target UV
  // coordinate. We'll do this by rounding down the sample location to get the
  // exact center of our "starting" texel. The starting texel will be at
  // location [1, 1] in the grid, where [0, 0] is the top left corner.
  vec2 samplePos = uv * texSize;
  vec2 texPos1 = floor(samplePos - 0.5) + 0.5;

  // Compute the fractional offset from our starting texel to our original
  // sample location, which we'll feed into the Catmull-Rom spline function to
  // get our filter weights.
  vec2 f = samplePos - texPos1;

  // Compute the Catmull-Rom weights using the fractional offset that we
  // calculated earlier. These equations are pre-expanded based on our knowledge
  // of where the texels will be located, which lets us avoid having to evaluate
  // a piece-wise function.
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);

  // Work out weighting factors and sampling offsets that will let us use
  // bilinear filtering to simultaneously evaluate the middle 2 samples from the
  // 4x4 grid.
  vec2 w12 = w1 + w2;
  vec2 offset12 = w2 / (w1 + w2);

  // Compute the final UV coordinates we'll use for sampling the texture
  vec2 texPos0 = texPos1 - 1.0;
  vec2 texPos3 = texPos1 + 2.0;
  vec2 texPos12 = texPos1 + offset12;

  texPos0 /= texSize;
  texPos3 /= texSize;
  texPos12 /= texSize;

  vec4 result = vec4(0.0);
  result += texture(tex, vec2(texPos0.x, texPos0.y)) * w0.x * w0.y;
  result += texture(tex, vec2(texPos12.x, texPos0.y)) * w12.x * w0.y;
  result += texture(tex, vec2(texPos3.x, texPos0.y)) * w3.x * w0.y;

  result += texture(tex, vec2(texPos0.x, texPos12.y)) * w0.x * w12.y;
  result += texture(tex, vec2(texPos12.x, texPos12.y)) * w12.x * w12.y;
  result += texture(tex, vec2(texPos3.x, texPos12.y)) * w3.x * w12.y;

  result += texture(tex, vec2(texPos0.x, texPos3.y)) * w0.x * w3.y;
  result += texture(tex, vec2(texPos12.x, texPos3.y)) * w12.x * w3.y;
  result += texture(tex, vec2(texPos3.x, texPos3.y)) * w3.x * w3.y;

  return result;
}

vec4 textureCatmullRom(sampler2DArray tex, vec3 uv) {
  vec2 texSize = vec2(textureSize(tex, 0));
  vec2 samplePos = uv.xy * texSize;
  vec2 texPos1 = floor(samplePos - 0.5) + 0.5;
  vec2 f = samplePos - texPos1;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 offset12 = w2 / (w1 + w2);
  vec2 texPos0 = texPos1 - 1.0;
  vec2 texPos3 = texPos1 + 2.0;
  vec2 texPos12 = texPos1 + offset12;
  texPos0 /= texSize;
  texPos3 /= texSize;
  texPos12 /= texSize;
  vec4 result = vec4(0.0);
  result += texture(tex, vec3(texPos0.x, texPos0.y, uv.z)) * w0.x * w0.y;
  result += texture(tex, vec3(texPos12.x, texPos0.y, uv.z)) * w12.x * w0.y;
  result += texture(tex, vec3(texPos3.x, texPos0.y, uv.z)) * w3.x * w0.y;
  result += texture(tex, vec3(texPos0.x, texPos12.y, uv.z)) * w0.x * w12.y;
  result += texture(tex, vec3(texPos12.x, texPos12.y, uv.z)) * w12.x * w12.y;
  result += texture(tex, vec3(texPos3.x, texPos12.y, uv.z)) * w3.x * w12.y;
  result += texture(tex, vec3(texPos0.x, texPos3.y, uv.z)) * w0.x * w3.y;
  result += texture(tex, vec3(texPos12.x, texPos3.y, uv.z)) * w12.x * w3.y;
  result += texture(tex, vec3(texPos3.x, texPos3.y, uv.z)) * w3.x * w3.y;
  return result;
}
`,Qd=`precision highp float;
precision highp sampler2DArray;

#include "core/turbo"
#include "catmullRomSampling"
#include "varianceClipping"

uniform sampler2D colorBuffer;
uniform sampler2D depthVelocityBuffer;
uniform sampler2D colorHistoryBuffer;

#ifdef SHADOW_LENGTH
uniform sampler2D shadowLengthBuffer;
uniform sampler2D shadowLengthHistoryBuffer;
#endif // SHADOW_LENGTH

uniform vec2 texelSize;
uniform int frame;
uniform float varianceGamma;
uniform float temporalAlpha;
uniform vec2 jitterOffset;

in vec2 vUv;

layout(location = 0) out vec4 outputColor;
#ifdef SHADOW_LENGTH
layout(location = 1) out float outputShadowLength;
#endif // SHADOW_LENGTH

const ivec2 neighborOffsets[9] = ivec2[9](
  ivec2(-1, -1),
  ivec2(-1, 0),
  ivec2(-1, 1),
  ivec2(0, -1),
  ivec2(0, 0),
  ivec2(0, 1),
  ivec2(1, -1),
  ivec2(1, 0),
  ivec2(1, 1)
);

const ivec4[4] bayerIndices = ivec4[4](
  ivec4(0, 12, 3, 15),
  ivec4(8, 4, 11, 7),
  ivec4(2, 14, 1, 13),
  ivec4(10, 6, 9, 5)
);

vec4 getClosestFragment(const ivec2 coord) {
  vec4 result = vec4(1e7, 0.0, 0.0, 0.0);
  vec4 neighbor;
  #pragma unroll_loop_start
  for (int i = 0; i < 9; ++i) {
    neighbor = texelFetchOffset(depthVelocityBuffer, coord, 0, neighborOffsets[i]);
    if (neighbor.r < result.r) {
      result = neighbor;
    }
  }
  #pragma unroll_loop_end
  return result;
}

void temporalUpscale(
  const ivec2 coord,
  const ivec2 lowResCoord,
  const bool currentFrame,
  out vec4 outputColor,
  out float outputShadowLength
) {
  vec4 currentColor = texelFetch(colorBuffer, lowResCoord, 0);
  #ifdef SHADOW_LENGTH
  vec4 currentShadowLength = vec4(texelFetch(shadowLengthBuffer, lowResCoord, 0).rgb, 1.0);
  #endif // SHADOW_LENGTH

  if (currentFrame) {
    // Use the texel just rendered without any accumulation.
    outputColor = currentColor;
    #ifdef SHADOW_LENGTH
    outputShadowLength = currentShadowLength.r;
    #endif // SHADOW_LENGTH
    return;
  }

  vec4 depthVelocity = getClosestFragment(lowResCoord);
  vec2 velocity = depthVelocity.gb;
  vec2 prevUv = vUv - velocity;
  if (prevUv.x < 0.0 || prevUv.x > 1.0 || prevUv.y < 0.0 || prevUv.y > 1.0) {
    outputColor = currentColor;
    #ifdef SHADOW_LENGTH
    outputShadowLength = currentShadowLength.r;
    #endif // SHADOW_LENGTH
    return; // Rejection
  }

  // Variance clipping with a large variance gamma seems to work fine for
  // upsampling. This increases ghosting, of course, but it's hard to notice on
  // clouds.
  // vec4 historyColor = textureCatmullRom(colorHistoryBuffer, prevUv);
  vec4 historyColor = texture(colorHistoryBuffer, prevUv);
  vec4 clippedColor = varianceClipping(colorBuffer, vUv, currentColor, historyColor, varianceGamma);
  outputColor = clippedColor;

  #ifdef SHADOW_LENGTH
  // Sampling the shadow length history using scene depth doesn't make much
  // sense, but it's too hard to derive it properly. At least this approach
  // resolves the edges of scene objects.
  // vec4 historyShadowLength = vec4(textureCatmullRom(shadowLengthHistoryBuffer, prevUv).rgb, 1.0);
  vec4 historyShadowLength = vec4(texture(shadowLengthHistoryBuffer, prevUv).rgb, 1.0);
  vec4 clippedShadowLength = varianceClipping(
    shadowLengthBuffer,
    vUv,
    currentShadowLength,
    historyShadowLength,
    varianceGamma
  );
  outputShadowLength = clippedShadowLength.r;
  #endif // SHADOW_LENGTH
}

void temporalAntialiasing(const ivec2 coord, out vec4 outputColor, out float outputShadowLength) {
  vec4 currentColor = texelFetch(colorBuffer, coord, 0);
  #ifdef SHADOW_LENGTH
  vec4 currentShadowLength = vec4(texelFetch(shadowLengthBuffer, coord, 0).rgb, 1.0);
  #endif // SHADOW_LENGTH

  vec4 depthVelocity = getClosestFragment(coord);
  vec2 velocity = depthVelocity.gb;

  vec2 prevUv = vUv - velocity;
  if (prevUv.x < 0.0 || prevUv.x > 1.0 || prevUv.y < 0.0 || prevUv.y > 1.0) {
    outputColor = currentColor;
    #ifdef SHADOW_LENGTH
    outputShadowLength = currentShadowLength.r;
    #endif // SHADOW_LENGTH
    return; // Rejection
  }

  vec4 historyColor = texture(colorHistoryBuffer, prevUv);
  vec4 clippedColor = varianceClipping(colorBuffer, coord, currentColor, historyColor);
  outputColor = mix(clippedColor, currentColor, temporalAlpha);

  #ifdef SHADOW_LENGTH
  vec4 historyShadowLength = vec4(texture(shadowLengthHistoryBuffer, prevUv).rgb, 1.0);
  vec4 clippedShadowLength = varianceClipping(
    shadowLengthBuffer,
    coord,
    currentShadowLength,
    historyShadowLength
  );
  outputShadowLength = mix(clippedShadowLength.r, currentShadowLength.r, temporalAlpha);
  #endif // SHADOW_LENGTH
}

void main() {
  ivec2 coord = ivec2(gl_FragCoord.xy);

  #if !defined(SHADOW_LENGTH)
  float outputShadowLength;
  #endif // !defined(SHADOW_LENGTH)

  #ifdef TEMPORAL_UPSCALE
  ivec2 lowResCoord = coord / 4;
  int bayerValue = bayerIndices[coord.x % 4][coord.y % 4];
  bool currentFrame = bayerValue == frame % 16;
  temporalUpscale(coord, lowResCoord, currentFrame, outputColor, outputShadowLength);
  #else // TEMPORAL_UPSCALE
  temporalAntialiasing(coord, outputColor, outputShadowLength);
  #endif // TEMPORAL_UPSCALE

  #if defined(SHADOW_LENGTH) && defined(DEBUG_SHOW_SHADOW_LENGTH)
  outputColor = vec4(turbo(outputShadowLength * 0.05), 1.0);
  #endif // defined(SHADOW_LENGTH) && defined(DEBUG_SHOW_SHADOW_LENGTH)

  #ifdef DEBUG_SHOW_VELOCITY
  outputColor.rgb = outputColor.rgb + vec3(abs(texture(depthVelocityBuffer, vUv).gb) * 10.0, 0.0);
  #endif // DEBUG_SHOW_VELOCITY
}
`,Zd=`precision highp float;

layout(location = 0) in vec3 position;

out vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`,Eo=`#ifdef VARIANCE_9_SAMPLES
#define VARIANCE_OFFSET_COUNT 8
const ivec2 varianceOffsets[8] = ivec2[8](
  ivec2(-1, -1),
  ivec2(-1, 1),
  ivec2(1, -1),
  ivec2(1, 1),
  ivec2(1, 0),
  ivec2(0, -1),
  ivec2(0, 1),
  ivec2(-1, 0)
);
#else // VARIANCE_9_SAMPLES
#define VARIANCE_OFFSET_COUNT 4
const ivec2 varianceOffsets[4] = ivec2[4](ivec2(1, 0), ivec2(0, -1), ivec2(0, 1), ivec2(-1, 0));
#endif // VARIANCE_9_SAMPLES

// Reference: https://github.com/playdeadgames/temporal
vec4 clipAABB(const vec4 current, const vec4 history, const vec4 minColor, const vec4 maxColor) {
  vec3 pClip = 0.5 * (maxColor.rgb + minColor.rgb);
  vec3 eClip = 0.5 * (maxColor.rgb - minColor.rgb) + 1e-7;
  vec4 vClip = history - vec4(pClip, current.a);
  vec3 vUnit = vClip.xyz / eClip;
  vec3 aUnit = abs(vUnit);
  float maUnit = max(aUnit.x, max(aUnit.y, aUnit.z));
  if (maUnit > 1.0) {
    return vec4(pClip, current.a) + vClip / maUnit;
  }
  return history;
}

#ifdef VARIANCE_SAMPLER_ARRAY
#define VARIANCE_SAMPLER sampler2DArray
#define VARIANCE_SAMPLER_COORD ivec3
#else // VARIANCE_SAMPLER_ARRAY
#define VARIANCE_SAMPLER sampler2D
#define VARIANCE_SAMPLER_COORD ivec2
#endif // VARIANCE_SAMPLER_ARRAY

// Variance clipping
// Reference: https://developer.download.nvidia.com/gameworks/events/GDC2016/msalvi_temporal_supersampling.pdf
vec4 varianceClipping(
  const VARIANCE_SAMPLER inputBuffer,
  const VARIANCE_SAMPLER_COORD coord,
  const vec4 current,
  const vec4 history,
  const float gamma
) {
  vec4 moment1 = current;
  vec4 moment2 = current * current;
  vec4 neighbor;
  #pragma unroll_loop_start
  for (int i = 0; i < 8; ++i) {
    #if UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT
    neighbor = texelFetchOffset(inputBuffer, coord, 0, varianceOffsets[i]);
    moment1 += neighbor;
    moment2 += neighbor * neighbor;
    #endif // UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT
  }
  #pragma unroll_loop_end

  const float N = float(VARIANCE_OFFSET_COUNT + 1);
  vec4 mean = moment1 / N;
  vec4 varianceGamma = sqrt(max(moment2 / N - mean * mean, 0.0)) * gamma;
  vec4 minColor = mean - varianceGamma;
  vec4 maxColor = mean + varianceGamma;
  return clipAABB(clamp(mean, minColor, maxColor), history, minColor, maxColor);
}

vec4 varianceClipping(
  const VARIANCE_SAMPLER inputBuffer,
  const VARIANCE_SAMPLER_COORD coord,
  const vec4 current,
  const vec4 history
) {
  return varianceClipping(inputBuffer, coord, current, history, 1.0);
}

vec4 varianceClipping(
  const sampler2D inputBuffer,
  const vec2 coord,
  const vec4 current,
  const vec4 history,
  const float gamma
) {
  vec4 moment1 = current;
  vec4 moment2 = current * current;
  vec4 neighbor;
  #pragma unroll_loop_start
  for (int i = 0; i < 8; ++i) {
    #if UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT
    neighbor = textureOffset(inputBuffer, coord, varianceOffsets[i]);
    moment1 += neighbor;
    moment2 += neighbor * neighbor;
    #endif // UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT
  }
  #pragma unroll_loop_end

  const float N = float(VARIANCE_OFFSET_COUNT + 1);
  vec4 mean = moment1 / N;
  vec4 varianceGamma = sqrt(max(moment2 / N - mean * mean, 0.0)) * gamma;
  vec4 minColor = mean - varianceGamma;
  vec4 maxColor = mean + varianceGamma;
  return clipAABB(clamp(mean, minColor, maxColor), history, minColor, maxColor);
}

vec4 varianceClipping(
  const sampler2D inputBuffer,
  const vec2 coord,
  const vec4 current,
  const vec4 history
) {
  return varianceClipping(inputBuffer, coord, current, history, 1.0);
}
`,Kd=Object.defineProperty,xo=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&Kd(e,r,n),n},Ir=class extends aa{constructor({colorBuffer:e=null,depthVelocityBuffer:r=null,shadowLengthBuffer:i=null,colorHistoryBuffer:n=null,shadowLengthHistoryBuffer:a=null}={}){super({name:"CloudsResolveMaterial",glslVersion:Ci,vertexShader:Zd,fragmentShader:mt(k(Qd,{core:{turbo:wn},catmullRomSampling:Xd,varianceClipping:Eo})),uniforms:{colorBuffer:new d(e),depthVelocityBuffer:new d(r),shadowLengthBuffer:new d(i),colorHistoryBuffer:new d(n),shadowLengthHistoryBuffer:new d(a),texelSize:new d(new V),frame:new d(0),jitterOffset:new d(new V),varianceGamma:new d(2),temporalAlpha:new d(.1)}}),this.temporalUpscale=!0,this.shadowLength=!0}setSize(e,r){this.uniforms.texelSize.value.set(1/e,1/r)}onBeforeRender(e,r,i,n,a,s){let o=this.uniforms.frame.value%16,c=Ao[o],l=(c.x-.5)*4,u=(c.y-.5)*4;this.uniforms.jitterOffset.value.set(l,u)}};xo([C("TEMPORAL_UPSCALE")],Ir.prototype,"temporalUpscale");xo([C("SHADOW_LENGTH")],Ir.prototype,"shadowLength");var xi=class extends oe{constructor(e,r){super(e),this._mainCamera=new fo;let{shadow:i}=r;this.shadow=i}get mainCamera(){return this._mainCamera}set mainCamera(e){this._mainCamera=e}};function jn(t,{depthVelocity:e,shadowLength:r}){let i=new yd(1,1,{depthBuffer:!1,type:mo});i.texture.minFilter=Si,i.texture.magFilter=Si,i.texture.name=t;let n;e&&(n=i.texture.clone(),n.isRenderTargetTexture=!0,i.depthVelocity=n,i.textures.push(n));let a;return r&&(a=i.texture.clone(),a.isRenderTargetTexture=!0,a.format=Cd,i.shadowLength=a,i.textures.push(a)),Object.assign(i,{depthVelocity:n??null,shadowLength:a??null})}var ia=class extends xi{constructor({parameterUniforms:e,layerUniforms:r,atmosphereUniforms:i,...n},a){super("CloudsPass",n),this.atmosphere=a,this.width=0,this.height=0,this.currentMaterial=new re({parameterUniforms:e,layerUniforms:r,atmosphereUniforms:i},a),this.currentPass=new lr(this.currentMaterial),this.resolveMaterial=new Ir,this.resolvePass=new lr(this.resolveMaterial),this.initRenderTargets({depthVelocity:!0,shadowLength:T.lightShafts})}copyCameraSettings(e){this.currentMaterial.copyCameraSettings(e)}initialize(e,r,i){this.currentPass.initialize(e,r,i),this.resolvePass.initialize(e,r,i)}initRenderTargets(e){var s,o,c;(s=this.currentRenderTarget)==null||s.dispose(),(o=this.resolveRenderTarget)==null||o.dispose(),(c=this.historyRenderTarget)==null||c.dispose();let r=jn("Clouds",e),i=jn("Clouds.A",{...e,depthVelocity:!1}),n=jn("Clouds.B",{...e,depthVelocity:!1});this.currentRenderTarget=r,this.resolveRenderTarget=i,this.historyRenderTarget=n;let a=this.resolveMaterial.uniforms;a.colorBuffer.value=r.texture,a.depthVelocityBuffer.value=r.depthVelocity,a.shadowLengthBuffer.value=r.shadowLength,a.colorHistoryBuffer.value=n.texture,a.shadowLengthHistoryBuffer.value=n.shadowLength}copyShadow(){let e=this.shadow,r=this.currentMaterial.uniforms;for(let i=0;i<e.cascadeCount;++i){let n=e.cascades[i];r.shadowIntervals.value[i].copy(n.interval),r.shadowMatrices.value[i].copy(n.matrix)}r.shadowFar.value=e.far}copyReprojection(){this.currentMaterial.copyReprojectionMatrix(this.mainCamera)}swapBuffers(){let e=this.historyRenderTarget,r=this.resolveRenderTarget;this.resolveRenderTarget=e,this.historyRenderTarget=r;let i=this.resolveMaterial.uniforms;i.colorHistoryBuffer.value=r.texture,i.shadowLengthHistoryBuffer.value=r.shadowLength}update(e,r,i){this.currentMaterial.uniforms.frame.value=r,this.resolveMaterial.uniforms.frame.value=r,this.copyCameraSettings(this.mainCamera),this.copyShadow(),this.currentPass.render(e,null,this.currentRenderTarget),this.resolvePass.render(e,null,this.resolveRenderTarget),this.copyReprojection(),this.swapBuffers()}setSize(e,r){if(this.width=e,this.height=r,this.temporalUpscale){let i=Math.ceil(e/4),n=Math.ceil(r/4);this.currentRenderTarget.setSize(i,n),this.currentMaterial.setSize(i*4,n*4,e,r)}else this.currentRenderTarget.setSize(e,r),this.currentMaterial.setSize(e,r);this.resolveRenderTarget.setSize(e,r),this.resolveMaterial.setSize(e,r),this.historyRenderTarget.setSize(e,r)}setShadowSize(e,r,i){this.currentMaterial.shadowCascadeCount=i,this.currentMaterial.setShadowSize(e,r)}setDepthTexture(e,r){this.currentMaterial.depthBuffer=e,this.currentMaterial.depthPacking=r??0}get outputBuffer(){return this.historyRenderTarget.texture}get shadowBuffer(){return this.currentMaterial.uniforms.shadowBuffer.value}set shadowBuffer(e){this.currentMaterial.uniforms.shadowBuffer.value=e}get shadowLengthBuffer(){return this.historyRenderTarget.shadowLength}get temporalUpscale(){return this.currentMaterial.temporalUpscale}set temporalUpscale(e){e!==this.temporalUpscale&&(this.currentMaterial.temporalUpscale=e,this.resolveMaterial.temporalUpscale=e,this.setSize(this.width,this.height))}get lightShafts(){return this.currentMaterial.shadowLength}set lightShafts(e){e!==this.lightShafts&&(this.currentMaterial.shadowLength=e,this.resolveMaterial.shadowLength=e,this.initRenderTargets({depthVelocity:!0,shadowLength:e}),this.setSize(this.width,this.height))}};function jd(t,e){let r=t.properties.get(e.texture).__webglTexture,i=t.getContext();ot(i instanceof WebGL2RenderingContext),t.setRenderTarget(e);let n=[];if(r!=null)for(let a=0;a<e.depth;++a)i.framebufferTextureLayer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+a,r,0,a),n.push(i.COLOR_ATTACHMENT0+a);i.drawBuffers(n)}var wi=class extends lr{render(e,r,i,n,a){let s=this.fullscreenMaterial.uniforms;r!==null&&(s==null?void 0:s[this.input])!=null&&(s[this.input].value=r.texture),jd(e,i),e.render(this.scene,this.camera)}},qd=`precision highp float;
precision highp sampler3D;

#include <common>

#include "core/math"
#include "core/raySphereIntersection"
#include "types"
#include "parameters"
#include "structuredSampling"
#include "clouds"

uniform mat4 inverseShadowMatrices[CASCADE_COUNT];
uniform mat4 reprojectionMatrices[CASCADE_COUNT];

// Primary raymarch
uniform int maxIterationCount;
uniform float minStepSize;
uniform float maxStepSize;
uniform float opticalDepthTailScale;

in vec2 vUv;

layout(location = 0) out vec4 outputColor[CASCADE_COUNT];

// Redundant notation for prettier.
#if CASCADE_COUNT == 1
layout(location = 1) out vec3 outputDepthVelocity[CASCADE_COUNT];
#elif CASCADE_COUNT == 2
layout(location = 2) out vec3 outputDepthVelocity[CASCADE_COUNT];
#elif CASCADE_COUNT == 3
layout(location = 3) out vec3 outputDepthVelocity[CASCADE_COUNT];
#elif CASCADE_COUNT == 4
layout(location = 4) out vec3 outputDepthVelocity[CASCADE_COUNT];
#endif // CASCADE_COUNT

vec4 marchClouds(
  const vec3 rayOrigin,
  const vec3 rayDirection,
  const float maxRayDistance,
  const float jitter,
  const float mipLevel
) {
  // Setup structured volume sampling (SVS).
  // While SVS introduces spatial aliasing, it is indeed temporally stable,
  // which is important for lower-resolution shadow maps where a flickering
  // single pixel can be highly noticeable.
  vec3 normal = getStructureNormal(rayDirection, jitter);
  float rayDistance;
  float stepSize;
  intersectStructuredPlanes(
    normal,
    rayOrigin,
    rayDirection,
    clamp(maxRayDistance / float(maxIterationCount), minStepSize, maxStepSize),
    rayDistance,
    stepSize
  );

  #ifdef TEMPORAL_JITTER
  rayDistance -= stepSize * jitter;
  #endif // TEMPORAL_JITTER

  float extinctionSum = 0.0;
  float maxOpticalDepth = 0.0;
  float maxOpticalDepthTail = 0.0;
  float transmittanceIntegral = 1.0;
  float weightedDistanceSum = 0.0;
  float transmittanceSum = 0.0;

  int sampleCount = 0;
  for (int i = 0; i < maxIterationCount; ++i) {
    if (rayDistance > maxRayDistance) {
      break; // Termination
    }

    vec3 position = rayDistance * rayDirection + rayOrigin;
    float height = length(position) - bottomRadius;

    #if !defined(DEBUG_MARCH_INTERVALS)
    if (insideLayerIntervals(height)) {
      rayDistance += stepSize;
      continue;
    }
    #endif // !defined(DEBUG_MARCH_INTERVALS)

    // Sample rough weather.
    vec2 uv = getGlobeUv(position);
    WeatherSample weather = sampleWeather(uv, height, mipLevel);

    if (any(greaterThan(weather.density, vec4(minDensity)))) {
      // Sample detailed participating media.
      // Note this assumes an homogeneous medium.
      MediaSample media = sampleMedia(weather, position, uv, mipLevel, jitter);
      if (media.extinction > minExtinction) {
        extinctionSum += media.extinction;
        maxOpticalDepth += media.extinction * stepSize;
        transmittanceIntegral *= exp(-media.extinction * stepSize);
        weightedDistanceSum += rayDistance * transmittanceIntegral;
        transmittanceSum += transmittanceIntegral;
        ++sampleCount;
      }
    }

    if (transmittanceIntegral <= minTransmittance) {
      // A large amount of optical depth accumulates in the tail, beyond the
      // point of minimum transmittance. The expected optical depth seems to
      // decrease exponentially with the number of samples taken before reaching
      // the minimum transmittance.
      // See the discussion here: https://x.com/shotamatsuda/status/1886259549931520437
      maxOpticalDepthTail = min(
        opticalDepthTailScale * stepSize * exp(float(1 - sampleCount)),
        stepSize * 0.5 // Excessive optical depth only introduces aliasing.
      );
      break; // Early termination
    }
    rayDistance += stepSize;
  }

  if (sampleCount == 0) {
    return vec4(maxRayDistance, 0.0, 0.0, 0.0);
  }
  float frontDepth = min(weightedDistanceSum / transmittanceSum, maxRayDistance);
  float meanExtinction = extinctionSum / float(sampleCount);
  return vec4(frontDepth, meanExtinction, maxOpticalDepth, maxOpticalDepthTail);
}

void getRayNearFar(
  const vec3 sunPosition,
  const vec3 rayDirection,
  out float rayNear,
  out float rayFar
) {
  vec4 firstIntersections = raySphereFirstIntersection(
    sunPosition,
    rayDirection,
    vec3(0.0),
    bottomRadius + vec4(shadowTopHeight, shadowBottomHeight, 0.0, 0.0)
  );
  rayNear = max(0.0, firstIntersections.x);
  rayFar = firstIntersections.y;
  if (rayFar < 0.0) {
    rayFar = 1e6;
  }
}

void cascade(
  const int cascadeIndex,
  const float mipLevel,
  out vec4 outputColor,
  out vec3 outputDepthVelocity
) {
  vec2 clip = vUv * 2.0 - 1.0;
  vec4 point = inverseShadowMatrices[cascadeIndex] * vec4(clip.xy, -1.0, 1.0);
  point /= point.w;
  vec3 sunPosition = (worldToECEFMatrix * vec4(point.xyz, 1.0)).xyz + altitudeCorrection;

  vec3 rayDirection = normalize(-sunDirection);
  float rayNear;
  float rayFar;
  getRayNearFar(sunPosition, rayDirection, rayNear, rayFar);

  vec3 rayOrigin = rayNear * rayDirection + sunPosition;
  float stbn = getSTBN();
  vec4 color = marchClouds(rayOrigin, rayDirection, rayFar - rayNear, stbn, mipLevel);
  outputColor = color;

  // Velocity for temporal resolution.
  #ifdef TEMPORAL_PASS
  vec3 frontPosition = color.x * rayDirection + rayOrigin;
  vec3 frontPositionWorld = (ecefToWorldMatrix * vec4(frontPosition - altitudeCorrection, 1.0)).xyz;
  vec4 prevClip = reprojectionMatrices[cascadeIndex] * vec4(frontPositionWorld, 1.0);
  prevClip /= prevClip.w;
  vec2 prevUv = prevClip.xy * 0.5 + 0.5;
  vec2 velocity = (vUv - prevUv) * resolution;
  outputDepthVelocity = vec3(color.x, velocity);
  #else // TEMPORAL_PASS
  outputDepthVelocity = vec3(0.0);
  #endif // TEMPORAL_PASS
}

// TODO: Calculate from the main camera frustum perhaps?
const float mipLevels[4] = float[4](0.0, 0.5, 1.0, 2.0);

void main() {
  #pragma unroll_loop_start
  for (int i = 0; i < 4; ++i) {
    #if UNROLLED_LOOP_INDEX < CASCADE_COUNT
    cascade(UNROLLED_LOOP_INDEX, mipLevels[i], outputColor[i], outputDepthVelocity[i]);
    #endif // UNROLLED_LOOP_INDEX < CASCADE_COUNT
  }
  #pragma unroll_loop_end
}
`,Jd=`precision highp float;

layout(location = 0) in vec3 position;

out vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`,$d=`// Implements Structured Volume Sampling in fragment shader:
// https://github.com/huwb/volsample
// Implementation reference:
// https://www.shadertoy.com/view/ttVfDc

void getIcosahedralVertices(const vec3 direction, out vec3 v1, out vec3 v2, out vec3 v3) {
  // Normalization scalers to fit dodecahedron to unit sphere.
  const float a = 0.85065080835204; // phi / sqrt(2 + phi)
  const float b = 0.5257311121191336; // 1 / sqrt(2 + phi)

  // Derive the vertices of icosahedron where triangle intersects the direction.
  // See: https://www.ppsloan.org/publications/AmbientDice.pdf
  const float kT = 0.6180339887498948; // 1 / phi
  const float kT2 = 0.38196601125010515; // 1 / phi^2
  vec3 absD = abs(direction);
  float selector1 = dot(absD, vec3(1.0, kT2, -kT));
  float selector2 = dot(absD, vec3(-kT, 1.0, kT2));
  float selector3 = dot(absD, vec3(kT2, -kT, 1.0));
  v1 = selector1 > 0.0 ? vec3(a, b, 0.0) : vec3(-b, 0.0, a);
  v2 = selector2 > 0.0 ? vec3(0.0, a, b) : vec3(a, -b, 0.0);
  v3 = selector3 > 0.0 ? vec3(b, 0.0, a) : vec3(0.0, a, -b);
  vec3 octantSign = sign(direction);
  v1 *= octantSign;
  v2 *= octantSign;
  v3 *= octantSign;
}

void swapIfBigger(inout vec4 a, inout vec4 b) {
  if (a.w > b.w) {
    vec4 t = a;
    a = b;
    b = t;
  }
}

void sortVertices(inout vec3 a, inout vec3 b, inout vec3 c) {
  const vec3 base = vec3(0.5, 0.5, 1.0);
  vec4 aw = vec4(a, dot(a, base));
  vec4 bw = vec4(b, dot(b, base));
  vec4 cw = vec4(c, dot(c, base));
  swapIfBigger(aw, bw);
  swapIfBigger(bw, cw);
  swapIfBigger(aw, bw);
  a = aw.xyz;
  b = bw.xyz;
  c = cw.xyz;
}

vec3 getPentagonalWeights(const vec3 direction, const vec3 v1, const vec3 v2, const vec3 v3) {
  float d1 = dot(v1, direction);
  float d2 = dot(v2, direction);
  float d3 = dot(v3, direction);
  vec3 w = exp(vec3(d1, d2, d3) * 40.0);
  return w / (w.x + w.y + w.z);
}

vec3 getStructureNormal(
  const vec3 direction,
  const float jitter,
  out vec3 a,
  out vec3 b,
  out vec3 c,
  out vec3 weights
) {
  getIcosahedralVertices(direction, a, b, c);
  sortVertices(a, b, c);
  weights = getPentagonalWeights(direction, a, b, c);
  return jitter < weights.x
    ? a
    : jitter < weights.x + weights.y
      ? b
      : c;
}

vec3 getStructureNormal(const vec3 direction, const float jitter) {
  vec3 a, b, c, weights;
  return getStructureNormal(direction, jitter, a, b, c, weights);
}

// Reference: https://github.com/huwb/volsample/blob/master/src/unity/Assets/Shaders/RayMarchCore.cginc
void intersectStructuredPlanes(
  const vec3 normal,
  const vec3 rayOrigin,
  const vec3 rayDirection,
  const float samplePeriod,
  out float stepOffset,
  out float stepSize
) {
  float NoD = dot(rayDirection, normal);
  stepSize = samplePeriod / abs(NoD);

  // Skips leftover bit to get from rayOrigin to first strata plane.
  stepOffset = -mod(dot(rayOrigin, normal), samplePeriod) / NoD;

  // mod() gives different results depending on if the arg is negative or
  // positive. This line makes it consistent, and ensures the first sample is in
  // front of the viewer.
  if (stepOffset < 0.0) {
    stepOffset += stepSize;
  }
}
`,ef=Object.defineProperty,rr=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&ef(e,r,n),n},Xe=class extends aa{constructor({parameterUniforms:e,layerUniforms:r,atmosphereUniforms:i}){super({name:"ShadowMaterial",glslVersion:Ci,vertexShader:Jd,fragmentShader:mt(k(qd,{core:{math:Me,raySphereIntersection:Bt},types:ra,parameters:So,structuredSampling:$d,clouds:To})),uniforms:{...e,...r,...i,inverseShadowMatrices:new d(Array.from({length:4},()=>new Z)),reprojectionMatrices:new d(Array.from({length:4},()=>new Z)),resolution:new d(new V),frame:new d(0),stbnTexture:new d(null),maxIterationCount:new d(T.shadow.maxIterationCount),minStepSize:new d(T.shadow.minStepSize),maxStepSize:new d(T.shadow.maxStepSize),minDensity:new d(T.shadow.minDensity),minExtinction:new d(T.shadow.minExtinction),minTransmittance:new d(T.shadow.minTransmittance),opticalDepthTailScale:new d(2)},defines:{SHADOW:"1",TEMPORAL_PASS:"1",TEMPORAL_JITTER:"1"}}),this.localWeatherChannels="rgba",this.cascadeCount=T.shadow.cascadeCount,this.temporalPass=!0,this.temporalJitter=!0,this.shapeDetail=T.shapeDetail,this.turbulence=T.turbulence,this.cascadeCount=T.shadow.cascadeCount}setSize(e,r){this.uniforms.resolution.value.set(e,r)}};rr([Sn("LOCAL_WEATHER_CHANNELS",{validate:t=>/^[rgba]{4}$/.test(t)})],Xe.prototype,"localWeatherChannels");rr([Be("CASCADE_COUNT",{min:1,max:4})],Xe.prototype,"cascadeCount");rr([C("TEMPORAL_PASS")],Xe.prototype,"temporalPass");rr([C("TEMPORAL_JITTER")],Xe.prototype,"temporalJitter");rr([C("SHAPE_DETAIL")],Xe.prototype,"shapeDetail");rr([C("TURBULENCE")],Xe.prototype,"turbulence");var tf=`precision highp float;
precision highp sampler2DArray;

#define VARIANCE_9_SAMPLES 1
#define VARIANCE_SAMPLER_ARRAY 1

#include "varianceClipping"

uniform sampler2DArray inputBuffer;
uniform sampler2DArray historyBuffer;

uniform vec2 texelSize;
uniform float varianceGamma;
uniform float temporalAlpha;

in vec2 vUv;

layout(location = 0) out vec4 outputColor[CASCADE_COUNT];

const ivec2 neighborOffsets[9] = ivec2[9](
  ivec2(-1, -1),
  ivec2(-1, 0),
  ivec2(-1, 1),
  ivec2(0, -1),
  ivec2(0, 0),
  ivec2(0, 1),
  ivec2(1, -1),
  ivec2(1, 0),
  ivec2(1, 1)
);

vec4 getClosestFragment(const ivec3 coord) {
  vec4 result = vec4(1e7, 0.0, 0.0, 0.0);
  vec4 neighbor;
  #pragma unroll_loop_start
  for (int i = 0; i < 9; ++i) {
    neighbor = texelFetchOffset(
      inputBuffer,
      coord + ivec3(0, 0, CASCADE_COUNT),
      0,
      neighborOffsets[i]
    );
    if (neighbor.r < result.r) {
      result = neighbor;
    }
  }
  #pragma unroll_loop_end
  return result;
}

void cascade(const int cascadeIndex, out vec4 outputColor) {
  ivec3 coord = ivec3(gl_FragCoord.xy, cascadeIndex);
  vec4 current = texelFetch(inputBuffer, coord, 0);

  vec4 depthVelocity = getClosestFragment(coord);
  vec2 velocity = depthVelocity.gb * texelSize;
  vec2 prevUv = vUv - velocity;
  if (prevUv.x < 0.0 || prevUv.x > 1.0 || prevUv.y < 0.0 || prevUv.y > 1.0) {
    outputColor = current;
    return; // Rejection
  }

  vec4 history = texture(historyBuffer, vec3(prevUv, float(cascadeIndex)));
  vec4 clippedHistory = varianceClipping(inputBuffer, coord, current, history, varianceGamma);
  outputColor = mix(clippedHistory, current, temporalAlpha);
}

void main() {
  #pragma unroll_loop_start
  for (int i = 0; i < 4; ++i) {
    #if UNROLLED_LOOP_INDEX < CASCADE_COUNT
    cascade(UNROLLED_LOOP_INDEX, outputColor[i]);
    #endif // UNROLLED_LOOP_INDEX < CASCADE_COUNT
  }
  #pragma unroll_loop_end
}
`,rf=`precision highp float;

layout(location = 0) in vec3 position;

out vec2 vUv;

void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`,nf=Object.defineProperty,af=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&nf(e,r,n),n},yi=class extends aa{constructor({inputBuffer:e=null,historyBuffer:r=null}={}){super({name:"ShadowResolveMaterial",glslVersion:Ci,vertexShader:rf,fragmentShader:mt(k(tf,{varianceClipping:Eo})),uniforms:{inputBuffer:new d(e),historyBuffer:new d(r),texelSize:new d(new V),varianceGamma:new d(1),temporalAlpha:new d(.01)},defines:{}}),this.cascadeCount=T.shadow.cascadeCount}setSize(e,r){this.uniforms.texelSize.value.set(1/e,1/r)}};af([Be("CASCADE_COUNT",{min:1,max:4})],yi.prototype,"cascadeCount");function qn(t){let e=new Dd(1,1,1,{depthBuffer:!1});return e.texture.type=mo,e.texture.minFilter=Si,e.texture.magFilter=Si,e.texture.name=t,e}var na=class extends xi{constructor({parameterUniforms:e,layerUniforms:r,atmosphereUniforms:i,...n}){super("ShadowPass",n),this.width=0,this.height=0,this.currentMaterial=new Xe({parameterUniforms:e,layerUniforms:r,atmosphereUniforms:i}),this.currentPass=new wi(this.currentMaterial),this.resolveMaterial=new yi,this.resolvePass=new wi(this.resolveMaterial),this.initRenderTargets()}initialize(e,r,i){this.currentPass.initialize(e,r,i),this.resolvePass.initialize(e,r,i)}initRenderTargets(){var a,s,o;(a=this.currentRenderTarget)==null||a.dispose(),(s=this.resolveRenderTarget)==null||s.dispose(),(o=this.historyRenderTarget)==null||o.dispose();let e=qn("Shadow"),r=this.temporalPass?qn("Shadow.A"):null,i=this.temporalPass?qn("Shadow.B"):null;this.currentRenderTarget=e,this.resolveRenderTarget=r,this.historyRenderTarget=i;let n=this.resolveMaterial.uniforms;n.inputBuffer.value=e.texture,n.historyBuffer.value=(i==null?void 0:i.texture)??null}copyShadow(){let e=this.shadow,r=this.currentMaterial.uniforms;for(let i=0;i<e.cascadeCount;++i){let n=e.cascades[i];r.inverseShadowMatrices.value[i].copy(n.inverseMatrix)}}copyReprojection(){let e=this.shadow,r=this.currentMaterial.uniforms;for(let i=0;i<e.cascadeCount;++i){let n=e.cascades[i];r.reprojectionMatrices.value[i].copy(n.matrix)}}swapBuffers(){ot(this.historyRenderTarget!=null),ot(this.resolveRenderTarget!=null);let e=this.historyRenderTarget,r=this.resolveRenderTarget;this.resolveRenderTarget=e,this.historyRenderTarget=r,this.resolveMaterial.uniforms.historyBuffer.value=r.texture}update(e,r,i){this.currentMaterial.uniforms.frame.value=r,this.copyShadow(),this.currentPass.render(e,null,this.currentRenderTarget),this.temporalPass&&(ot(this.resolveRenderTarget!=null),this.resolvePass.render(e,null,this.resolveRenderTarget),this.copyReprojection(),this.swapBuffers())}setSize(e,r,i=this.shadow.cascadeCount){var n,a;this.width=e,this.height=r,this.currentMaterial.cascadeCount=i,this.resolveMaterial.cascadeCount=i,this.currentMaterial.setSize(e,r),this.resolveMaterial.setSize(e,r),this.currentRenderTarget.setSize(e,r,this.temporalPass?i*2:i),(n=this.resolveRenderTarget)==null||n.setSize(e,r,i),(a=this.historyRenderTarget)==null||a.setSize(e,r,i)}get outputBuffer(){return this.temporalPass?(ot(this.historyRenderTarget!=null),this.historyRenderTarget.texture):this.currentRenderTarget.texture}get temporalPass(){return this.currentMaterial.temporalPass}set temporalPass(e){e!==this.temporalPass&&(this.currentMaterial.temporalPass=e,this.initRenderTargets(),this.setSize(this.width,this.height))}};function sf(t){return{scatteringCoefficient:new d(1),absorptionCoefficient:new d(0),coverage:new d(.3),localWeatherTexture:new d(t.localWeatherTexture),localWeatherRepeat:new d(t.localWeatherRepeat),localWeatherOffset:new d(t.localWeatherOffset),shapeTexture:new d(t.shapeTexture),shapeRepeat:new d(t.shapeRepeat),shapeOffset:new d(t.shapeOffset),shapeDetailTexture:new d(t.shapeDetailTexture),shapeDetailRepeat:new d(t.shapeDetailRepeat),shapeDetailOffset:new d(t.shapeDetailOffset),turbulenceTexture:new d(t.turbulenceTexture),turbulenceRepeat:new d(t.turbulenceRepeat),turbulenceDisplacement:new d(350)}}function of(){return{minLayerHeights:new d(new ue),maxLayerHeights:new d(new ue),minIntervalHeights:new d(new W),maxIntervalHeights:new d(new W),densityScales:new d(new ue),shapeAmounts:new d(new ue),shapeDetailAmounts:new d(new ue),weatherExponents:new d(new ue),shapeAlteringBiases:new d(new ue),coverageFilterWidths:new d(new ue),minHeight:new d(0),maxHeight:new d(0),shadowTopHeight:new d(0),shadowBottomHeight:new d(0),shadowLayerMask:new d(new ue),densityProfile:new d({expTerms:new ue,exponents:new ue,linearTerms:new ue,constantTerms:new ue})}}var Jn=[0,0,0,0];function cf(t,e){e.packValues("altitude",t.minLayerHeights.value),e.packSums("altitude","height",t.maxLayerHeights.value),e.packIntervalHeights(t.minIntervalHeights.value,t.maxIntervalHeights.value),e.packValues("densityScale",t.densityScales.value),e.packValues("shapeAmount",t.shapeAmounts.value),e.packValues("shapeDetailAmount",t.shapeDetailAmounts.value),e.packValues("weatherExponent",t.weatherExponents.value),e.packValues("shapeAlteringBias",t.shapeAlteringBiases.value),e.packValues("coverageFilterWidth",t.coverageFilterWidths.value);let r=t.densityProfile.value;e.packDensityProfiles("expTerm",r.expTerms),e.packDensityProfiles("exponent",r.exponents),e.packDensityProfiles("linearTerm",r.linearTerms),e.packDensityProfiles("constantTerm",r.constantTerms);let i=1/0,n=0,a=1/0,s=0;Jn.fill(0);for(let o=0;o<e.length;++o){let{altitude:c,height:l,shadow:u}=e[o],h=c+l;l>0&&(c<i&&(i=c),u&&c<a&&(a=c),h>n&&(n=h),u&&h>s&&(s=h)),Jn[o]=u?1:0}i!==1/0?(t.minHeight.value=i,t.maxHeight.value=n):(ot(n===0),t.minHeight.value=0),a!==1/0?(t.shadowBottomHeight.value=a,t.shadowTopHeight.value=s):(ot(s===0),t.shadowBottomHeight.value=0),t.shadowLayerMask.value.fromArray(Jn)}function lf(t,e){return{bottomRadius:new d(t.bottomRadius),topRadius:new d(t.topRadius),worldToECEFMatrix:new d(e.worldToECEFMatrix),ecefToWorldMatrix:new d(e.ecefToWorldMatrix),altitudeCorrection:new d(e.altitudeCorrection),sunDirection:new d(e.sunDirection)}}var uf=`uniform sampler2D cloudsBuffer;

void mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {
  #ifdef SKIP_RENDERING
  outputColor = inputColor;
  #else // SKIP_RENDERING
  vec4 clouds = texture(cloudsBuffer, uv);
  outputColor.rgb = inputColor.rgb * (1.0 - clouds.a) + clouds.rgb;
  outputColor.a = inputColor.a * (1.0 - clouds.a) + clouds.a;
  #endif // SKIP_RENDERING
}
`,hf=Object.defineProperty,df=(t,e,r,i)=>{for(var n=void 0,a=t.length-1,s;a>=0;a--)(s=t[a])&&(n=s(e,r,n)||n);return n&&hf(e,r,n),n},Rr=new W,ff=new V,mf=new _d,pf=["maxIterationCount","minStepSize","maxStepSize","maxRayDistance","perspectiveStepScale","minDensity","minExtinction","minTransmittance","maxIterationCountToSun","maxIterationCountToGround","minSecondaryStepSize","secondaryStepScale","maxShadowFilterRadius","maxShadowLengthIterationCount","minShadowLengthStepSize","maxShadowLengthRayDistance","hazeDensityScale","hazeExponent","hazeScatteringCoefficient","hazeAbsorptionCoefficient"],gf=["multiScatteringOctaves","accurateSunSkyLight","accuratePhaseFunction"],vf=["maxIterationCount","minStepSize","maxStepSize","minDensity","minExtinction","minTransmittance","opticalDepthTailScale"],Af=["temporalJitter"],Tf=["temporalPass"],Sf=["cascadeCount","mapSize","maxFar","farScale","splitMode","splitLambda"],Ve={type:"change"},wo={resolutionScale:T.resolutionScale,width:ht.AUTO_SIZE,height:ht.AUTO_SIZE},tr=class extends cr{constructor(e=new fo,r,i=Et.DEFAULT){var u,h,p,v;super("CloudsEffect",uf,{attributes:Te.DEPTH,uniforms:new Map([["cloudsBuffer",new d(null)]])}),this.camera=e,this.atmosphere=i,this.cloudLayers=vo.DEFAULT.clone(),this.correctAltitude=!0,this.localWeatherRepeat=new V().setScalar(100),this.localWeatherOffset=new V,this.shapeRepeat=new W().setScalar(3e-4),this.shapeOffset=new W,this.shapeDetailRepeat=new W().setScalar(.006),this.shapeDetailOffset=new W,this.turbulenceRepeat=new V().setScalar(20),this.worldToECEFMatrix=new Z,this.ecefToWorldMatrix=new Z,this.altitudeCorrection=new W,this.sunDirection=new W,this.localWeatherVelocity=new V,this.shapeVelocity=new W,this.shapeDetailVelocity=new W,this._atmosphereOverlay=null,this._atmosphereShadow=null,this._atmosphereShadowLength=null,this.events=new Rd,this.frame=0,this.shadowCascadeCount=0,this.shadowMapSize=new V,this.onResolutionChange=()=>{this.setSize(this.resolution.baseWidth,this.resolution.baseHeight)},this.skipRendering=!0;let{resolutionScale:n,width:a,height:s,resolutionX:o=a,resolutionY:c=s}={...wo,...r};this.shadowMaps=new ta({cascadeCount:T.shadow.cascadeCount,mapSize:T.shadow.mapSize,splitLambda:.6}),this.parameterUniforms=sf({localWeatherTexture:((u=this.proceduralLocalWeather)==null?void 0:u.texture)??null,localWeatherRepeat:this.localWeatherRepeat,localWeatherOffset:this.localWeatherOffset,shapeTexture:((h=this.proceduralShape)==null?void 0:h.texture)??null,shapeRepeat:this.shapeRepeat,shapeOffset:this.shapeOffset,shapeDetailTexture:((p=this.proceduralShapeDetail)==null?void 0:p.texture)??null,shapeDetailRepeat:this.shapeDetailRepeat,shapeDetailOffset:this.shapeDetailOffset,turbulenceTexture:((v=this.proceduralTurbulence)==null?void 0:v.texture)??null,turbulenceRepeat:this.turbulenceRepeat}),this.layerUniforms=of(),this.atmosphereUniforms=lf(i,{worldToECEFMatrix:this.worldToECEFMatrix,ecefToWorldMatrix:this.ecefToWorldMatrix,altitudeCorrection:this.altitudeCorrection,sunDirection:this.sunDirection});let l={shadow:this.shadowMaps,parameterUniforms:this.parameterUniforms,layerUniforms:this.layerUniforms,atmosphereUniforms:this.atmosphereUniforms};this.shadowPass=new na(l),this.shadowPass.mainCamera=e,this.cloudsPass=new ia(l,i),this.cloudsPass.mainCamera=e,this.clouds=En(xn({},this.cloudsPass.currentMaterial,pf),this.cloudsPass.currentMaterial,gf),this.shadow=En(xn({},this.shadowPass.currentMaterial,vf),this.shadowPass.currentMaterial,Af,this.shadowPass,Tf,this.shadowMaps,Sf),this.resolution=new ht(this,o,c,n),this.resolution.addEventListener("change",this.onResolutionChange)}get mainCamera(){return this.camera}set mainCamera(e){this.camera=e,this.shadowPass.mainCamera=e,this.cloudsPass.mainCamera=e}initialize(e,r,i){this.shadowPass.initialize(e,r,i),this.cloudsPass.initialize(e,r,i)}updateSharedUniforms(e){cf(this.layerUniforms,this.cloudLayers);let{parameterUniforms:r}=this;r.localWeatherOffset.value.add(ff.copy(this.localWeatherVelocity).multiplyScalar(e)),r.shapeOffset.value.add(Rr.copy(this.shapeVelocity).multiplyScalar(e)),r.shapeDetailOffset.value.add(Rr.copy(this.shapeDetailVelocity).multiplyScalar(e));let i=this.worldToECEFMatrix;this.ecefToWorldMatrix.copy(i).invert();let n=this.camera.getWorldPosition(Rr).applyMatrix4(this.worldToECEFMatrix),a=this.altitudeCorrection;this.correctAltitude?Wt(n,this.atmosphere.bottomRadius,this.ellipsoid,a):a.setScalar(0);let s=this.ellipsoid.getSurfaceNormal(n,Rr),o=this.sunDirection.dot(s),c=Tn(1e6,1e3,o),l=mf.setFromMatrix4(i).transpose();this.shadowMaps.update(this.camera,Rr.copy(this.sunDirection).applyMatrix3(l),c)}updateWeatherTextureChannels(){let e=this.cloudLayers.localWeatherChannels;this.cloudsPass.currentMaterial.localWeatherChannels=e,this.shadowPass.currentMaterial.localWeatherChannels=e}updateAtmosphereComposition(){let{shadowMaps:e,shadowPass:r,cloudsPass:i}=this,n=r.currentMaterial.uniforms,a=i.currentMaterial.uniforms,s=this._atmosphereOverlay,o=Object.assign(this._atmosphereOverlay??{},{map:i.outputBuffer});s!==o&&(this._atmosphereOverlay=o,Ve.target=this,Ve.property="atmosphereOverlay",this.events.dispatchEvent(Ve));let c=this._atmosphereShadow,l=Object.assign(this._atmosphereShadow??{},{map:r.outputBuffer,mapSize:e.mapSize,cascadeCount:e.cascadeCount,intervals:a.shadowIntervals.value,matrices:a.shadowMatrices.value,inverseMatrices:n.inverseShadowMatrices.value,far:e.far,topHeight:a.shadowTopHeight.value});c!==l&&(this._atmosphereShadow=l,Ve.target=this,Ve.property="atmosphereShadow",this.events.dispatchEvent(Ve));let u=this._atmosphereShadowLength,h=i.shadowLengthBuffer!=null?Object.assign(this._atmosphereShadowLength??{},{map:i.shadowLengthBuffer}):null;u!==h&&(this._atmosphereShadowLength=h,Ve.target=this,Ve.property="atmosphereShadowLength",this.events.dispatchEvent(Ve))}update(e,r,i=0){var o,c,l,u;let{shadowMaps:n,shadowPass:a,cloudsPass:s}=this;if(n.cascadeCount!==this.shadowCascadeCount||!n.mapSize.equals(this.shadowMapSize)){let{width:h,height:p}=n.mapSize,v=n.cascadeCount;this.shadowMapSize.set(h,p),this.shadowCascadeCount=v,a.setSize(h,p,v),s.setShadowSize(h,p,v)}(o=this.proceduralLocalWeather)==null||o.render(e,i),(c=this.proceduralShape)==null||c.render(e,i),(l=this.proceduralShapeDetail)==null||l.render(e,i),(u=this.proceduralTurbulence)==null||u.render(e,i),++this.frame,this.updateSharedUniforms(i),this.updateWeatherTextureChannels(),a.update(e,this.frame,i),s.shadowBuffer=a.outputBuffer,s.update(e,this.frame,i),this.updateAtmosphereComposition(),this.uniforms.get("cloudsBuffer").value=this.cloudsPass.outputBuffer}setSize(e,r){let{resolution:i}=this;i.setBaseSize(e,r);let{width:n,height:a}=i;this.cloudsPass.setSize(n,a)}setDepthTexture(e,r){this.shadowPass.setDepthTexture(e,r),this.cloudsPass.setDepthTexture(e,r)}set qualityPreset(e){let{clouds:r,shadow:i,...n}=Gd[e];Object.assign(this,n),Object.assign(this.clouds,r),Object.assign(this.shadow,i)}get localWeatherTexture(){return this.proceduralLocalWeather??this.parameterUniforms.localWeatherTexture.value}set localWeatherTexture(e){e instanceof ao||e==null?(this.proceduralLocalWeather=void 0,this.parameterUniforms.localWeatherTexture.value=e):(this.proceduralLocalWeather=e,this.parameterUniforms.localWeatherTexture.value=e.texture)}get shapeTexture(){return this.proceduralShape??this.parameterUniforms.shapeTexture.value}set shapeTexture(e){e instanceof so||e==null?(this.proceduralShape=void 0,this.parameterUniforms.shapeTexture.value=e):(this.proceduralShape=e,this.parameterUniforms.shapeTexture.value=e.texture)}get shapeDetailTexture(){return this.proceduralShapeDetail??this.parameterUniforms.shapeDetailTexture.value}set shapeDetailTexture(e){e instanceof so||e==null?(this.proceduralShapeDetail=void 0,this.parameterUniforms.shapeDetailTexture.value=e):(this.proceduralShapeDetail=e,this.parameterUniforms.shapeDetailTexture.value=e.texture)}get turbulenceTexture(){return this.proceduralTurbulence??this.parameterUniforms.turbulenceTexture.value}set turbulenceTexture(e){e instanceof ao||e==null?(this.proceduralTurbulence=void 0,this.parameterUniforms.turbulenceTexture.value=e):(this.proceduralTurbulence=e,this.parameterUniforms.turbulenceTexture.value=e.texture)}get stbnTexture(){return this.cloudsPass.currentMaterial.uniforms.stbnTexture.value}set stbnTexture(e){this.cloudsPass.currentMaterial.uniforms.stbnTexture.value=e,this.shadowPass.currentMaterial.uniforms.stbnTexture.value=e}get resolutionScale(){return this.resolution.scale}set resolutionScale(e){this.resolution.scale=e}get temporalUpscale(){return this.cloudsPass.temporalUpscale}set temporalUpscale(e){this.cloudsPass.temporalUpscale=e}get lightShafts(){return this.cloudsPass.lightShafts}set lightShafts(e){this.cloudsPass.lightShafts=e}get shapeDetail(){return this.cloudsPass.currentMaterial.shapeDetail}set shapeDetail(e){this.cloudsPass.currentMaterial.shapeDetail=e,this.shadowPass.currentMaterial.shapeDetail=e}get turbulence(){return this.cloudsPass.currentMaterial.turbulence}set turbulence(e){this.cloudsPass.currentMaterial.turbulence=e,this.shadowPass.currentMaterial.turbulence=e}get haze(){return this.cloudsPass.currentMaterial.haze}set haze(e){this.cloudsPass.currentMaterial.haze=e}get scatteringCoefficient(){return this.parameterUniforms.scatteringCoefficient.value}set scatteringCoefficient(e){this.parameterUniforms.scatteringCoefficient.value=e}get absorptionCoefficient(){return this.parameterUniforms.absorptionCoefficient.value}set absorptionCoefficient(e){this.parameterUniforms.absorptionCoefficient.value=e}get coverage(){return this.parameterUniforms.coverage.value}set coverage(e){this.parameterUniforms.coverage.value=e}get turbulenceDisplacement(){return this.parameterUniforms.turbulenceDisplacement.value}set turbulenceDisplacement(e){this.parameterUniforms.turbulenceDisplacement.value=e}get scatterAnisotropy1(){return this.cloudsPass.currentMaterial.scatterAnisotropy1}set scatterAnisotropy1(e){this.cloudsPass.currentMaterial.scatterAnisotropy1=e}get scatterAnisotropy2(){return this.cloudsPass.currentMaterial.scatterAnisotropy2}set scatterAnisotropy2(e){this.cloudsPass.currentMaterial.scatterAnisotropy2=e}get scatterAnisotropyMix(){return this.cloudsPass.currentMaterial.scatterAnisotropyMix}set scatterAnisotropyMix(e){this.cloudsPass.currentMaterial.scatterAnisotropyMix=e}get skyLightScale(){return this.cloudsPass.currentMaterial.uniforms.skyLightScale.value}set skyLightScale(e){this.cloudsPass.currentMaterial.uniforms.skyLightScale.value=e}get groundBounceScale(){return this.cloudsPass.currentMaterial.uniforms.groundBounceScale.value}set groundBounceScale(e){this.cloudsPass.currentMaterial.uniforms.groundBounceScale.value=e}get powderScale(){return this.cloudsPass.currentMaterial.uniforms.powderScale.value}set powderScale(e){this.cloudsPass.currentMaterial.uniforms.powderScale.value=e}get powderExponent(){return this.cloudsPass.currentMaterial.uniforms.powderExponent.value}set powderExponent(e){this.cloudsPass.currentMaterial.uniforms.powderExponent.value=e}get atmosphereOverlay(){return this._atmosphereOverlay}get atmosphereShadow(){return this._atmosphereShadow}get atmosphereShadowLength(){return this._atmosphereShadowLength}get irradianceTexture(){return this.cloudsPass.currentMaterial.irradianceTexture}set irradianceTexture(e){this.cloudsPass.currentMaterial.irradianceTexture=e}get scatteringTexture(){return this.cloudsPass.currentMaterial.scatteringTexture}set scatteringTexture(e){this.cloudsPass.currentMaterial.scatteringTexture=e}get transmittanceTexture(){return this.cloudsPass.currentMaterial.transmittanceTexture}set transmittanceTexture(e){this.cloudsPass.currentMaterial.transmittanceTexture=e}get singleMieScatteringTexture(){return this.cloudsPass.currentMaterial.singleMieScatteringTexture}set singleMieScatteringTexture(e){this.cloudsPass.currentMaterial.singleMieScatteringTexture=e}get higherOrderScatteringTexture(){return this.cloudsPass.currentMaterial.higherOrderScatteringTexture}set higherOrderScatteringTexture(e){this.cloudsPass.currentMaterial.higherOrderScatteringTexture=e}get ellipsoid(){return this.cloudsPass.currentMaterial.ellipsoid}set ellipsoid(e){this.cloudsPass.currentMaterial.ellipsoid=e}get sunAngularRadius(){return this.cloudsPass.currentMaterial.sunAngularRadius}set sunAngularRadius(e){this.cloudsPass.currentMaterial.sunAngularRadius=e}};df([C("SKIP_RENDERING")],tr.prototype,"skipRendering");var yo=128,Co=32,Di="45a1c6c1bb9fd38b3680fd120795ff4c32df68ff",Ef=`https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${Di}/packages/clouds/assets/local_weather.png`,xf=`https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${Di}/packages/clouds/assets/shape.bin`,wf=`https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${Di}/packages/clouds/assets/shape_detail.bin`,yf=`https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${Di}/packages/clouds/assets/turbulence.png`;import{Camera as Do,RawShaderMaterial as Ro,Uniform as _o,GLSL3 as Io,Mesh as Mo,PlaneGeometry as Po,WebGL3DRenderTarget as Cf,RedFormat as Df,LinearFilter as sa,RepeatWrapping as Mr,NoColorSpace as No,WebGLRenderTarget as Rf,RGBAFormat as _f,LinearMipMapLinearFilter as If}from"three";var Ri=class{constructor({size:e,fragmentShader:r}){this.needsRender=!0,this.camera=new Do,this.size=e,this.material=new Ro({glslVersion:Io,vertexShader:`
        in vec3 position;
        out vec2 vUv;
        void main() {
          vUv = position.xy * 0.5 + 0.5;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,fragmentShader:r,uniforms:{layer:new _o(0)}}),this.mesh=new Mo(new Po(2,2),this.material),this.renderTarget=new Cf(e,e,e,{depthBuffer:!1,format:Df});let i=this.renderTarget.texture;i.minFilter=sa,i.magFilter=sa,i.wrapS=Mr,i.wrapT=Mr,i.wrapR=Mr,i.colorSpace=No,i.needsUpdate=!0}dispose(){this.renderTarget.dispose(),this.material.dispose()}render(e,r){if(this.needsRender){this.needsRender=!1;for(let i=0;i<this.size;++i)this.material.uniforms.layer.value=i/this.size,e.setRenderTarget(this.renderTarget,i),e.render(this.mesh,this.camera);e.setRenderTarget(null)}}get texture(){return this.renderTarget.texture}},Mf=`// Based on the following work with slight modifications.
// https://github.com/sebh/TileableVolumeNoise

/**
 * The MIT License (MIT)
 *
 * Copyright(c) 2017 S\xE9bastien Hillaire
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

precision highp float;
precision highp int;

#include "core/math"
#include "perlin"
#include "tileableNoise"

uniform float layer;

in vec2 vUv;

layout(location = 0) out float outputColor;

float getPerlinWorley(const vec3 point) {
  int octaveCount = 3;
  float frequency = 8.0;
  float perlin = getPerlinNoise(point, frequency, octaveCount);
  perlin = clamp(perlin, 0.0, 1.0);

  float cellCount = 4.0;
  vec3 noise = vec3(
    1.0 - getWorleyNoise(point, cellCount * 2.0),
    1.0 - getWorleyNoise(point, cellCount * 8.0),
    1.0 - getWorleyNoise(point, cellCount * 14.0)
  );
  float fbm = dot(noise, vec3(0.625, 0.25, 0.125));
  return remap(perlin, 0.0, 1.0, fbm, 1.0);
}

float getWorleyFbm(const vec3 point) {
  float cellCount = 4.0;
  vec4 noise = vec4(
    1.0 - getWorleyNoise(point, cellCount * 2.0),
    1.0 - getWorleyNoise(point, cellCount * 4.0),
    1.0 - getWorleyNoise(point, cellCount * 8.0),
    1.0 - getWorleyNoise(point, cellCount * 16.0)
  );
  vec3 fbm = vec3(
    dot(noise.xyz, vec3(0.625, 0.25, 0.125)),
    dot(noise.yzw, vec3(0.625, 0.25, 0.125)),
    dot(noise.zw, vec2(0.75, 0.25))
  );
  return dot(fbm, vec3(0.625, 0.25, 0.125));
}

void main() {
  vec3 point = vec3(vUv.x, vUv.y, layer);
  float perlinWorley = getPerlinWorley(point);
  float worleyFbm = getWorleyFbm(point);
  outputColor = remap(perlinWorley, worleyFbm - 1.0, 1.0);
}
`,bi=`// Ported from GLM: https://github.com/g-truc/glm/blob/master/glm/gtc/noise.inl

/**
 * OpenGL Mathematics (GLM)
 *
 * GLM is licensed under The Happy Bunny License or MIT License
 *
 * The Happy Bunny License (Modified MIT License)
 *
 * Copyright (c) 2005 - G-Truc Creation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * Restrictions:
 *  By making use of the Software for military purposes, you choose to make a
 *  Bunny unhappy.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * The MIT License
 *
 * Copyright (c) 2005 - G-Truc Creation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

vec4 mod289(const vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(const vec4 v) {
  return mod289((v * 34.0 + 1.0) * v);
}

vec4 taylorInvSqrt(const vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 fade(const vec4 v) {
  return v * v * v * (v * (v * 6.0 - 15.0) + 10.0);
}

// Classic Perlin noise, periodic version
float perlin(const vec4 position, const vec4 rep) {
  vec4 Pi0 = mod(floor(position), rep); // Integer part modulo rep
  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep
  vec4 Pf0 = fract(position); // Fractional part for interpolation
  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.y, Pi0.y, Pi1.y, Pi1.y);
  vec4 iz0 = vec4(Pi0.z);
  vec4 iz1 = vec4(Pi1.z);
  vec4 iw0 = vec4(Pi0.w);
  vec4 iw1 = vec4(Pi1.w);

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 ixy00 = permute(ixy0 + iw0);
  vec4 ixy01 = permute(ixy0 + iw1);
  vec4 ixy10 = permute(ixy1 + iw0);
  vec4 ixy11 = permute(ixy1 + iw1);

  vec4 gx00 = ixy00 / 7.0;
  vec4 gy00 = floor(gx00) / 7.0;
  vec4 gz00 = floor(gy00) / 6.0;
  gx00 = fract(gx00) - 0.5;
  gy00 = fract(gy00) - 0.5;
  gz00 = fract(gz00) - 0.5;
  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
  vec4 sw00 = step(gw00, vec4(0));
  gx00 -= sw00 * (step(0.0, gx00) - 0.5);
  gy00 -= sw00 * (step(0.0, gy00) - 0.5);

  vec4 gx01 = ixy01 / 7.0;
  vec4 gy01 = floor(gx01) / 7.0;
  vec4 gz01 = floor(gy01) / 6.0;
  gx01 = fract(gx01) - 0.5;
  gy01 = fract(gy01) - 0.5;
  gz01 = fract(gz01) - 0.5;
  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
  vec4 sw01 = step(gw01, vec4(0.0));
  gx01 -= sw01 * (step(0.0, gx01) - 0.5);
  gy01 -= sw01 * (step(0.0, gy01) - 0.5);

  vec4 gx10 = ixy10 / 7.0;
  vec4 gy10 = floor(gx10) / 7.0;
  vec4 gz10 = floor(gy10) / 6.0;
  gx10 = fract(gx10) - 0.5;
  gy10 = fract(gy10) - 0.5;
  gz10 = fract(gz10) - 0.5;
  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
  vec4 sw10 = step(gw10, vec4(0.0));
  gx10 -= sw10 * (step(0.0, gx10) - 0.5);
  gy10 -= sw10 * (step(0.0, gy10) - 0.5);

  vec4 gx11 = ixy11 / 7.0;
  vec4 gy11 = floor(gx11) / 7.0;
  vec4 gz11 = floor(gy11) / 6.0;
  gx11 = fract(gx11) - 0.5;
  gy11 = fract(gy11) - 0.5;
  gz11 = fract(gz11) - 0.5;
  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
  vec4 sw11 = step(gw11, vec4(0.0));
  gx11 -= sw11 * (step(0.0, gx11) - 0.5);
  gy11 -= sw11 * (step(0.0, gy11) - 0.5);

  vec4 g0000 = vec4(gx00.x, gy00.x, gz00.x, gw00.x);
  vec4 g1000 = vec4(gx00.y, gy00.y, gz00.y, gw00.y);
  vec4 g0100 = vec4(gx00.z, gy00.z, gz00.z, gw00.z);
  vec4 g1100 = vec4(gx00.w, gy00.w, gz00.w, gw00.w);
  vec4 g0010 = vec4(gx10.x, gy10.x, gz10.x, gw10.x);
  vec4 g1010 = vec4(gx10.y, gy10.y, gz10.y, gw10.y);
  vec4 g0110 = vec4(gx10.z, gy10.z, gz10.z, gw10.z);
  vec4 g1110 = vec4(gx10.w, gy10.w, gz10.w, gw10.w);
  vec4 g0001 = vec4(gx01.x, gy01.x, gz01.x, gw01.x);
  vec4 g1001 = vec4(gx01.y, gy01.y, gz01.y, gw01.y);
  vec4 g0101 = vec4(gx01.z, gy01.z, gz01.z, gw01.z);
  vec4 g1101 = vec4(gx01.w, gy01.w, gz01.w, gw01.w);
  vec4 g0011 = vec4(gx11.x, gy11.x, gz11.x, gw11.x);
  vec4 g1011 = vec4(gx11.y, gy11.y, gz11.y, gw11.y);
  vec4 g0111 = vec4(gx11.z, gy11.z, gz11.z, gw11.z);
  vec4 g1111 = vec4(gx11.w, gy11.w, gz11.w, gw11.w);

  vec4 norm00 = taylorInvSqrt(
    vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100))
  );
  g0000 *= norm00.x;
  g0100 *= norm00.y;
  g1000 *= norm00.z;
  g1100 *= norm00.w;

  vec4 norm01 = taylorInvSqrt(
    vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101))
  );
  g0001 *= norm01.x;
  g0101 *= norm01.y;
  g1001 *= norm01.z;
  g1101 *= norm01.w;

  vec4 norm10 = taylorInvSqrt(
    vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110))
  );
  g0010 *= norm10.x;
  g0110 *= norm10.y;
  g1010 *= norm10.z;
  g1110 *= norm10.w;

  vec4 norm11 = taylorInvSqrt(
    vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111))
  );
  g0011 *= norm11.x;
  g0111 *= norm11.y;
  g1011 *= norm11.z;
  g1111 *= norm11.w;

  float n0000 = dot(g0000, Pf0);
  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.y, Pf0.z, Pf0.w));
  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.z, Pf0.w));
  float n1100 = dot(g1100, vec4(Pf1.x, Pf1.y, Pf0.z, Pf0.w));
  float n0010 = dot(g0010, vec4(Pf0.x, Pf0.y, Pf1.z, Pf0.w));
  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.y, Pf1.z, Pf0.w));
  float n1110 = dot(g1110, vec4(Pf1.x, Pf1.y, Pf1.z, Pf0.w));
  float n0001 = dot(g0001, vec4(Pf0.x, Pf0.y, Pf0.z, Pf1.w));
  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.y, Pf0.z, Pf1.w));
  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
  float n1101 = dot(g1101, vec4(Pf1.x, Pf1.y, Pf0.z, Pf1.w));
  float n0011 = dot(g0011, vec4(Pf0.x, Pf0.y, Pf1.z, Pf1.w));
  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.z, Pf1.w));
  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.y, Pf1.z, Pf1.w));
  float n1111 = dot(g1111, Pf1);

  vec4 fade_xyzw = fade(Pf0);
  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
  return 2.2 * n_xyzw;
}
`,Oi=`// Based on the following work with slight modifications.
// https://github.com/sebh/TileableVolumeNoise

/**
 * The MIT License (MIT)
 *
 * Copyright(c) 2017 S\xE9bastien Hillaire
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

float hash(const float n) {
  return fract(sin(n + 1.951) * 43758.5453);
}

float noise(const vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);

  f = f * f * (3.0 - 2.0 * f);
  float n = p.x + p.y * 57.0 + 113.0 * p.z;
  return mix(
    mix(mix(hash(n + 0.0), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
    mix(
      mix(hash(n + 113.0), hash(n + 114.0), f.x),
      mix(hash(n + 170.0), hash(n + 171.0), f.x),
      f.y
    ),
    f.z
  );
}

float getWorleyNoise(const vec3 p, const float cellCount) {
  vec3 cell = p * cellCount;
  float d = 1.0e10;
  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        vec3 tp = floor(cell) + vec3(x, y, z);
        tp = cell - tp - noise(mod(tp, cellCount / 1.0));
        d = min(d, dot(tp, tp));
      }
    }
  }
  return clamp(d, 0.0, 1.0);
}

float getPerlinNoise(const vec3 point, const vec3 frequency, const int octaveCount) {
  // Noise frequency factor between octave, forced to 2.
  const float octaveFrequencyFactor = 2.0;

  // Compute the sum for each octave.
  float sum = 0.0;
  float roughness = 0.5;
  float weightSum = 0.0;
  float weight = 1.0;
  vec3 nextFrequency = frequency;
  for (int i = 0; i < octaveCount; ++i) {
    vec4 p = vec4(point.x, point.y, point.z, 0.0) * vec4(nextFrequency, 1.0);
    float value = perlin(p, vec4(nextFrequency, 1.0));
    sum += value * weight;
    weightSum += weight;
    weight *= roughness;
    nextFrequency *= octaveFrequencyFactor;
  }

  return sum / weightSum; // Intentionally skip clamping.
}

float getPerlinNoise(const vec3 point, const float frequency, const int octaveCount) {
  return getPerlinNoise(point, vec3(frequency), octaveCount);
}
`,_i=class extends Ri{constructor(){super({size:yo,fragmentShader:k(Mf,{core:{math:Me},perlin:bi,tileableNoise:Oi})})}},Pf=`// Based on the following work with slight modifications.
// https://github.com/sebh/TileableVolumeNoise

/**
 * The MIT License (MIT)
 *
 * Copyright(c) 2017 S\xE9bastien Hillaire
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

precision highp float;
precision highp int;

#include "core/math"
#include "perlin"
#include "tileableNoise"

uniform float layer;

in vec2 vUv;

layout(location = 0) out float outputColor;

void main() {
  vec3 point = vec3(vUv.x, vUv.y, layer);
  float cellCount = 2.0;
  vec4 noise = vec4(
    1.0 - getWorleyNoise(point, cellCount * 1.0),
    1.0 - getWorleyNoise(point, cellCount * 2.0),
    1.0 - getWorleyNoise(point, cellCount * 4.0),
    1.0 - getWorleyNoise(point, cellCount * 8.0)
  );
  vec3 fbm = vec3(
    dot(noise.xyz, vec3(0.625, 0.25, 0.125)),
    dot(noise.yzw, vec3(0.625, 0.25, 0.125)),
    dot(noise.zw, vec2(0.75, 0.25))
  );
  outputColor = dot(fbm, vec3(0.625, 0.25, 0.125));
}
`,Ii=class extends Ri{constructor(){super({size:Co,fragmentShader:k(Pf,{core:{math:Me},perlin:bi,tileableNoise:Oi})})}},Mi=class{constructor({size:e,fragmentShader:r}){this.needsRender=!0,this.camera=new Do,this.size=e,this.material=new Ro({glslVersion:Io,vertexShader:`
        in vec3 position;
        out vec2 vUv;
        void main() {
          vUv = position.xy * 0.5 + 0.5;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,fragmentShader:r,uniforms:{layer:new _o(0)}}),this.mesh=new Mo(new Po(2,2),this.material),this.renderTarget=new Rf(e,e,{depthBuffer:!1,format:_f});let i=this.renderTarget.texture;i.generateMipmaps=!0,i.minFilter=If,i.magFilter=sa,i.wrapS=Mr,i.wrapT=Mr,i.colorSpace=No,i.needsUpdate=!0}dispose(){this.renderTarget.dispose(),this.material.dispose()}render(e,r){this.needsRender&&(this.needsRender=!1,e.setRenderTarget(this.renderTarget),e.render(this.mesh,this.camera),e.setRenderTarget(null))}get texture(){return this.renderTarget.texture}},Nf=`precision highp float;
precision highp int;

#include "core/math"
#include "perlin"
#include "tileableNoise"

in vec2 vUv;

layout(location = 0) out vec4 outputColor;

float getWorleyFbm(
  const vec3 point,
  float frequency,
  float amplitude,
  const float lacunarity,
  const float gain,
  const int octaveCount
) {
  float noise = 0.0;
  for (int i = 0; i < octaveCount; ++i) {
    noise += amplitude * (1.0 - getWorleyNoise(point, frequency));
    frequency *= lacunarity;
    amplitude *= gain;
  }
  return noise;
}

void main() {
  vec3 point = vec3(vUv.x, vUv.y, 0.0);

  // Mid clouds
  {
    float worley = getWorleyFbm(
      point + vec3(0.5),
      8.0, // frequency
      0.4, // amplitude
      2.0, // lacunarity
      0.95, // gain
      4 // octaveCount
    );
    worley = smoothstep(1.0, 1.4, worley);
    outputColor.g = worley;
  }

  // Low clouds
  {
    float worley = getWorleyFbm(
      point,
      16.0, // frequency
      0.4, // amplitude
      2.0, // lacunarity
      0.95, // gain
      4 // octaveCount
    );
    worley = smoothstep(0.8, 1.4, worley);
    outputColor.r = saturate(worley - outputColor.g);
  }

  // High clouds
  {
    float perlin = getPerlinNoise(
      point,
      vec3(6.0, 12.0, 1.0), // frequency
      8 // octaveCount
    );
    perlin = smoothstep(-0.5, 0.5, perlin);
    outputColor.b = perlin;
  }

  // Extra
  {
    float perlin = getPerlinNoise(
      point + vec3(-19.1, 33.4, 47.2),
      32.0, // frequency
      4 // octaveCount
    );
    perlin = smoothstep(-0.5, 0.5, perlin);
    outputColor.a = perlin;
  }

  outputColor.a = 1.0;
}
`,Pi=class extends Mi{constructor(){super({size:512,fragmentShader:k(Nf,{core:{math:Me},perlin:bi,tileableNoise:Oi})})}},bf=`precision highp float;
precision highp int;

#include "core/math"
#include "perlin"
#include "tileableNoise"

in vec2 vUv;

layout(location = 0) out vec4 outputColor;

const vec3 frequency = vec3(12.0);
const int octaveCount = 3;

float perlin(const vec3 point) {
  return getPerlinNoise(point, frequency, octaveCount);
}

vec3 perlin3d(const vec3 point) {
  float perlin1 = perlin(point);
  float perlin2 = perlin(point.yzx + vec3(-19.1, 33.4, 47.2));
  float perlin3 = perlin(point.zxy + vec3(74.2, -124.5, 99.4));
  return vec3(perlin1, perlin2, perlin3);
}

vec3 curl(vec3 point) {
  const float delta = 0.1;
  vec3 dx = vec3(delta, 0.0, 0.0);
  vec3 dy = vec3(0.0, delta, 0.0);
  vec3 dz = vec3(0.0, 0.0, delta);

  vec3 px0 = perlin3d(point - dx);
  vec3 px1 = perlin3d(point + dx);
  vec3 py0 = perlin3d(point - dy);
  vec3 py1 = perlin3d(point + dy);
  vec3 pz0 = perlin3d(point - dz);
  vec3 pz1 = perlin3d(point + dz);

  float x = py1.z - py0.z - pz1.y + pz0.y;
  float y = pz1.x - pz0.x - px1.z + px0.z;
  float z = px1.y - px0.y - py1.x + py0.x;

  const float divisor = 1.0 / (2.0 * delta);
  return normalize(vec3(x, y, z) * divisor);
}

void main() {
  vec3 point = vec3(vUv.x, vUv.y, 0.0);
  outputColor.rgb = 0.5 * curl(point) + 0.5;
  outputColor.a = 1.0;
}
`,Ni=class extends Mi{constructor(){super({size:128,fragmentShader:k(bf,{core:{math:Me},perlin:bi,tileableNoise:Oi})})}};var ir={lat:30.2672,lon:-97.7431,name:"Austin, Texas"},Hf=t=>t*t*(3-2*t),Gf=Se.WGS84.getSurfaceNormal(new ce(ge(ir.lon),ge(ir.lat),0).toECEF()),bo=new wt;function Oo(t){return Ti(t,bo),yt.radToDeg(Math.asin(yt.clamp(bo.dot(Gf),-1,1)))}function dS(t){let e=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Chicago",year:"numeric",month:"2-digit",day:"2-digit"}).format(t),r=0;for(let s of[6,5]){let o=Date.parse(`${e}T00:00:00Z`)+s*36e5,c=new Intl.DateTimeFormat("en-US",{timeZone:"America/Chicago",hour:"numeric",hourCycle:"h23"}).format(o);if(Number(c)===0){r=o;break}}let i=null,n=null,a=Oo(new Date(r));for(let s=1;s<=1440;s++){let o=Oo(new Date(r+s*6e4));a<0&&o>=0&&i===null&&(i=new Date(r+s*6e4)),a>=0&&o<0&&(n=new Date(r+s*6e4)),a=o}return{midnight:new Date(r),rise:i,set:n}}var zf=t=>Math.min(1,Math.max(0,t));async function fS(t,{noise:e,date:r=new Date,quality:i,onReady:n}={}){let a;try{a=new Ff({canvas:t,depth:!1,antialias:!1,powerPreference:"high-performance",logarithmicDepthBuffer:!1})}catch{return null}if(!a.capabilities.isWebGL2)return a.dispose(),null;let s=matchMedia("(max-width: 760px)").matches||matchMedia("(pointer: coarse)").matches,o=matchMedia("(prefers-reduced-motion: reduce)");a.setPixelRatio(1),a.toneMapping=Uf,a.toneMappingExposure=10;let c=new ce(ge(ir.lon),ge(ir.lat),0),l=Se.WGS84.getEastNorthUpFrame(c.toECEF()),u=new wt,h=new wt,p=new wt;l.extractBasis(u,h,p);let v=new Bf,A=new Lf(s?70:58,1,10,1e6);A.up.copy(p);let g=new Q(A);g.sky=!0,g.sun=!0,g.moon=!0;let S=new tr(A);S.qualityPreset=i??(s?"low":"medium"),S.resolutionScale=s?.5:.75,S.coverage=.42,S.localWeatherVelocity.set(.0012,3e-4),S.localWeatherTexture=new Pi,S.shapeTexture=new _i,S.shapeDetailTexture=new Ii,S.turbulenceTexture=new Ni,S.events.addEventListener("change",R=>{R.property==="atmosphereOverlay"&&(g.overlay=S.atmosphereOverlay),R.property==="atmosphereShadow"&&(g.shadow=S.atmosphereShadow),R.property==="atmosphereShadowLength"&&(g.shadowLength=S.atmosphereShadowLength)});let D=new Sa(a,{frameBufferType:Of,multisampling:0});D.addPass(new Yi(v,A)),D.addPass(new Xi(A,S,g)),D.addPass(new Xi(A,new Ea({mode:ae.AGX})));let y;try{y=await new yr(a).update()}catch{return a.dispose(),null}Object.assign(g,y),Object.assign(S,y),await new Promise(R=>new ur().load(e,z=>{g.stbnTexture=z,S.stbnTexture=z,R()},void 0,R));let E=new wt,N=new wt,L=new wt,Y=0,ee=0,de=R=>{Ti(R,E),Yn(R,N),g.sunDirection.copy(E),g.moonDirection.copy(N),Y=yt.radToDeg(Math.asin(E.dot(p)));let z=Math.max(ge(9),Math.asin(yt.clamp(E.dot(p),-1,1))),Ce=Math.atan2(E.dot(u),E.dot(h));S.sunDirection.set(0,0,0).addScaledVector(u,Math.sin(Ce)*Math.cos(z)).addScaledVector(h,Math.cos(Ce)*Math.cos(z)).addScaledVector(p,Math.sin(z));let De=Y>-6?E:N;ee=Math.atan2(De.dot(u),De.dot(h)),a.toneMappingExposure=Y>8?10:Y>-6?10+(8-Y)*2.8:140,pe=24},K=0,Pe=()=>{let R=Hf(zf(K)),z=yt.lerp(4200,300,R),Ce=ge(yt.lerp(-9,14,R)),De=ee+ge(yt.lerp(-12,12,R));new ce(ge(ir.lon),ge(ir.lat),z).toECEF(A.position),L.set(0,0,0).addScaledVector(u,Math.sin(De)*Math.cos(Ce)).addScaledVector(h,Math.cos(De)*Math.cos(Ce)).addScaledVector(p,Math.sin(Ce)),A.lookAt(L.add(A.position))},Ne=0,ye=0,Ct=!1,Qe=0,pe=24,be=0,Ze=()=>{let R=t.clientWidth||1,z=t.clientHeight||1;R===Ne&&z===ye||(Ne=R,ye=z,D.setSize(R,z,!1),A.aspect=R/z,A.updateProjectionMatrix(),pe=24)},ct=!1,nr=R=>{if(Qe=0,!Ct||document.hidden)return;let z=be?Math.min(.1,(R-be)/1e3):1/60;be=R,Ze(),Pe(),(!o.matches||pe>0)&&(D.render(o.matches?0:z),pe>0&&pe--,ct||(ct=!0,n==null||n())),Qe=requestAnimationFrame(nr)},H=()=>{!Qe&&Ct&&(be=0,Qe=requestAnimationFrame(nr))},lt=new IntersectionObserver(([R])=>{Ct=R.isIntersecting,H()},{rootMargin:"200px"});lt.observe(t);let Dt=()=>H();return document.addEventListener("visibilitychange",Dt),de(r),Ze(),{setProgress(R){Math.abs(R-K)>1e-4&&(K=R,pe=24)},setDate(R){de(R),H()},get sunHeight(){return Y},async settle(R=48){Ze(),Pe();for(let z=0;z<R;z++)D.render(1/60);pe=0},destroy(){lt.disconnect(),document.removeEventListener("visibilitychange",Dt),cancelAnimationFrame(Qe),D.dispose(),a.dispose()}}}export{ir as AUSTIN,dS as daylightAt,fS as mountSky,Oo as sunHeightAt};
/*! Bundled license information:

postprocessing/build/index.js:
  (**
   * postprocessing v6.39.6 build Sun Nov 01 2026
   * https://github.com/pmndrs/postprocessing
   * Copyright 2015-2026 Raoul van Rüschen
   * @license Zlib
   *)

@takram/three-atmosphere/build/shared.js:
  (**
      @preserve
  
      Astronomy library for JavaScript (browser and Node.js).
      https://github.com/cosinekitty/astronomy
  
      MIT License
  
      Copyright (c) 2019-2023 Don Cross <cosinekitty@gmail.com>
  
      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to deal
      in the Software without restriction, including without limitation the rights
      to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
      copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:
  
      The above copyright notice and this permission notice shall be included in all
      copies or substantial portions of the Software.
  
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
      SOFTWARE.
  *)
  (**
   * @fileoverview Astronomy calculation library for browser scripting and Node.js.
   * @author Don Cross <cosinekitty@gmail.com>
   * @license MIT
   *)
*/
