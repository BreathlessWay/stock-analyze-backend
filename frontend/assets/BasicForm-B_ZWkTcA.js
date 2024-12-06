var re=Object.defineProperty,ie=Object.defineProperties;var ce=Object.getOwnPropertyDescriptors;var H=Object.getOwnPropertySymbols;var fe=Object.prototype.hasOwnProperty,de=Object.prototype.propertyIsEnumerable;var J=(e,l,o)=>l in e?re(e,l,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[l]=o,B=(e,l)=>{for(var o in l||(l={}))fe.call(l,o)&&J(e,o,l[o]);if(H)for(var o of H(l))de.call(l,o)&&J(e,o,l[o]);return e},X=(e,l)=>ie(e,ce(l));var C=(e,l,o)=>new Promise((w,d)=>{var g=n=>{try{r(o.next(n))}catch(m){d(m)}},c=n=>{try{r(o.throw(n))}catch(m){d(m)}},r=n=>n.done?w(n.value):Promise.resolve(n.value).then(g,c);r((o=o.apply(e,l)).next())});import{d as ee,o as f,f as $,g as pe,h as u,aJ as W,cu as Y,cZ as _e,c_ as te,c$ as q,aS as me,r as F,a as ge,A as N,H as be,L as ye,d0 as ve,p as Be,C as G,D as y,w as a,i as O,b_ as ke,bE as Oe,F as L,X as Q,aT as z,bm as we,ch as K,j as M,t as D,E as Pe,Z as T,Y as x,N as he,a1 as Se,m as Ce,n as Fe,d1 as Ne,aQ as Ve,aR as je,l as Me,ar as De,B as Ee,as as Re,_ as Ue}from"./index-BWLoIWRc.js";import{s as ze,p as I,Q as Te}from"./propTypes-DDD-Xta1.js";import{D as Ae}from"./DownOutlined-7KlFnkGg.js";const Ie={xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 1024 1024"},$e=pe("path",{d:"M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 0 0 140 768h75c5.1 0 9.9-2.5 12.9-6.6L512 369.8l284.1 391.6c3 4.1 7.8 6.6 12.9 6.6h75c6.5 0 10.3-7.4 6.5-12.7z",fill:"currentColor"},null,-1),Ge=[$e],Le=ee({name:"UpOutlined",render:function(l,o){return f(),$("svg",Ie,Ge)}});function Qe(e){return e==="NInput"?"请输入":["NPicker","NSelect","NCheckbox","NRadio","NSwitch","NDatePicker","NTimePicker"].includes(e)?"请选择":""}function We({emit:e,getProps:l,formModel:o,getSchema:w,formElRef:d,defaultFormModel:g,loadingSub:c,handleFormValues:r}){function n(){return C(this,null,function*(){var s;return(s=u(d))==null?void 0:s.validate()})}function m(s){return C(this,null,function*(){s&&s.preventDefault(),c.value=!0;const{submitFunc:b}=u(l);if(b&&W(b))return yield b(),c.value=!1,!1;if(!u(d))return!1;try{yield n();const p=V();return c.value=!1,e("submit",p),p}catch(p){return e("submit",!1),c.value=!1,console.error(p),!1}})}function P(){return C(this,null,function*(){var s;yield(s=u(d))==null?void 0:s.restoreValidation()})}function E(){return C(this,null,function*(){const{resetFunc:s,submitOnReset:b}=u(l);if(s&&W(s)&&(yield s()),!u(d))return;Object.keys(o).forEach(j=>{o[j]=u(g)[j]||null}),yield P();const p=r(Y(u(o)));e("reset",p),b&&(yield m())})}function V(){return u(d)?r(Y(u(o))):{}}function R(s){return C(this,null,function*(){const b=u(w).map(v=>v.field).filter(Boolean);Object.keys(s).forEach(v=>{const p=s[v];b.includes(v)&&(o[v]=p)})})}function k(s){c.value=s}return{handleSubmit:m,validate:n,resetFields:E,getFieldsValue:V,clearValidate:P,setFieldsValue:R,setLoading:k}}function Ze({defaultFormModel:e,getSchema:l,formModel:o}){function w(g){if(!_e(g))return{};const c={};for(const r of Object.entries(g)){let[,n]=r;const[m]=r;!m||te(n)&&n.length===0||W(n)||q(n)||(me(n)&&(n=n.trim()),ze(c,m,n))}return c}function d(){const g=u(l),c={};g.forEach(r=>{const{defaultValue:n}=r;q(n)||(c[r.field]=n,o[r.field]=n)}),e.value=c}return{handleFormValues:w,initDefault:d}}const He={labelWidth:{type:[Number,String],default:80},schemas:{type:[Array],default:()=>[]},layout:{type:String,default:"inline"},inline:{type:Boolean,default:!1},size:{type:String,default:"medium"},labelPlacement:{type:String,default:"left"},isFull:{type:Boolean,default:!0},showActionButtonGroup:I.bool.def(!0),showResetButton:I.bool.def(!0),resetButtonOptions:Object,showSubmitButton:I.bool.def(!0),submitButtonOptions:Object,showAdvancedButton:I.bool.def(!0),submitButtonText:{type:String,default:"查询"},resetButtonText:{type:String,default:"重置"},gridProps:Object,giProps:Object,baseGridStyle:{type:Object},collapsed:{type:Boolean,default:!1},collapsedRows:{type:Number,default:1}},Je=ee({name:"BasicForm",components:{DownOutlined:Ae,UpOutlined:Le,QuestionCircleOutlined:Te},props:B({},He),emits:["reset","submit","register"],setup(e,{emit:l,attrs:o}){const w=F({}),d=ge({}),g=F({}),c=F(null),r=F(null),n=F(!0),m=F(!1),P=F(!1),E=N(()=>Object.assign({size:e.size,type:"primary"},e.submitButtonOptions)),V=N(()=>Object.assign({size:e.size,type:"default"},e.resetButtonOptions));function R(i){var S;const h=(S=i.componentProps)!=null?S:{},U=i.component;return B({clearable:!0,placeholder:Qe(u(U))},h)}const k=N(()=>{const i=B(B({},e),u(g)),h={rules:{}};return(i.schemas||[]).forEach(S=>{S.rules&&te(S.rules)&&(h.rules[S.field]=S.rules)}),B(B({},i),u(h))}),s=N(()=>{const{layout:i}=u(k);return i==="inline"}),b=N(()=>{const{gridProps:i}=u(k);return X(B({},i),{collapsed:s.value?n.value:!1,responsive:"screen"})}),v=N(()=>B(B(B({},o),e),u(k))),p=N(()=>{const i=u(c)||u(k).schemas;for(const h of i){const{defaultValue:U}=h;U&&(h.defaultValue=U)}return i}),{handleFormValues:j,initDefault:A}=Ze({defaultFormModel:w,getSchema:p,formModel:d}),{handleSubmit:t,validate:_,resetFields:Z,getFieldsValue:ne,clearValidate:oe,setFieldsValue:le}=We({emit:l,getProps:k,formModel:d,getSchema:p,formElRef:r,defaultFormModel:w,loadingSub:m,handleFormValues:j});function se(){n.value=!n.value}function ue(i){return C(this,null,function*(){g.value=ve(u(g)||{},i)})}const ae={getFieldsValue:ne,setFieldsValue:le,resetFields:Z,validate:_,clearValidate:oe,setProps:ue,submit:t};return be(()=>p.value,i=>{u(P)||i!=null&&i.length&&(A(),P.value=!0)}),ye(()=>{A(),l("register",ae)}),{formElRef:r,formModel:d,getGrid:b,getProps:k,getBindValue:v,getSchema:p,getSubmitBtnOptions:E,getResetBtnOptions:V,handleSubmit:t,resetFields:Z,loadingSub:m,isInline:s,getComponentProps:R,unfoldToggle:se}}});function Xe(e,l,o,w,d,g){const c=G("QuestionCircleOutlined"),r=he,n=Se,m=Ce,P=Fe,E=Ne,V=Ve,R=je,k=Me,s=De,b=Ee,v=G("DownOutlined"),p=G("UpOutlined"),j=Re,A=Ue;return f(),y(A,z(e.getBindValue,{model:e.formModel,ref:"formElRef"}),{default:a(()=>[O(j,ke(Oe(e.getGrid)),{default:a(()=>[(f(!0),$(L,null,Q(e.getSchema,t=>(f(),y(s,z({ref_for:!0},t.giProps,{key:t.field}),{default:a(()=>[O(k,{label:t.label,path:t.field},we({default:a(()=>[t.slot?K(e.$slots,t.slot,{key:0,model:e.formModel,field:t.field,value:e.formModel[t.field]},void 0,!0):t.component==="NCheckbox"?(f(),y(E,{key:1,value:e.formModel[t.field],"onUpdate:value":_=>e.formModel[t.field]=_},{default:a(()=>[O(P,null,{default:a(()=>[(f(!0),$(L,null,Q(t.componentProps.options,_=>(f(),y(m,{key:_.value,value:_.value,label:_.label},null,8,["value","label"]))),128))]),_:2},1024)]),_:2},1032,["value","onUpdate:value"])):t.component==="NRadioGroup"?(f(),y(R,{key:2,value:e.formModel[t.field],"onUpdate:value":_=>e.formModel[t.field]=_},{default:a(()=>[O(P,null,{default:a(()=>[(f(!0),$(L,null,Q(t.componentProps.options,_=>(f(),y(V,{key:_.value,value:_.value},{default:a(()=>[M(D(_.label),1)]),_:2},1032,["value"]))),128))]),_:2},1024)]),_:2},1032,["value","onUpdate:value"])):(f(),y(Pe(t.component),z({key:3,ref_for:!0},e.getComponentProps(t),{value:e.formModel[t.field],"onUpdate:value":_=>e.formModel[t.field]=_,class:{isFull:t.isFull!=!1&&e.getProps.isFull}}),null,16,["value","onUpdate:value","class"])),t.suffix?K(e.$slots,t.suffix,{key:4,model:e.formModel,field:t.field,value:e.formModel[t.field]},void 0,!0):T("",!0)]),_:2},[t.labelMessage?{name:"label",fn:a(()=>[M(D(t.label)+" ",1),O(n,{trigger:"hover",style:x(t.labelMessageStyle)},{trigger:a(()=>[O(r,{size:"18",class:"text-gray-400 cursor-pointer"},{default:a(()=>[O(c)]),_:1})]),default:a(()=>[M(" "+D(t.labelMessage),1)]),_:2},1032,["style"])]),key:"0"}:void 0]),1032,["label","path"])]),_:2},1040))),128)),e.getProps.showActionButtonGroup?(f(),y(s,{key:0,span:e.isInline?"":24,suffix:!!e.isInline},{default:a(({overflow:t})=>[O(P,{align:"center",justify:e.isInline?"end":"start",style:x({"margin-left":`${e.isInline?12:e.getProps.labelWidth}px`})},{default:a(()=>[e.getProps.showSubmitButton?(f(),y(b,z({key:0},e.getSubmitBtnOptions,{onClick:e.handleSubmit,loading:e.loadingSub,"attr-type":"submit"}),{default:a(()=>[M(D(e.getProps.submitButtonText),1)]),_:1},16,["onClick","loading"])):T("",!0),e.getProps.showResetButton?(f(),y(b,z({key:1},e.getResetBtnOptions,{onClick:e.resetFields}),{default:a(()=>[M(D(e.getProps.resetButtonText),1)]),_:1},16,["onClick"])):T("",!0),e.isInline&&e.getProps.showAdvancedButton?(f(),y(b,{key:2,type:"primary",text:"","icon-placement":"right",onClick:e.unfoldToggle},{icon:a(()=>[t?(f(),y(r,{key:0,size:"14",class:"unfold-icon"},{default:a(()=>[O(v)]),_:1})):(f(),y(r,{key:1,size:"14",class:"unfold-icon"},{default:a(()=>[O(p)]),_:1}))]),default:a(()=>[M(" "+D(t?"展开":"收起"),1)]),_:2},1032,["onClick"])):T("",!0)]),_:2},1032,["justify","style"])]),_:1},8,["span","suffix"])):T("",!0)]),_:3},16)]),_:3},16,["model"])}const et=Be(Je,[["render",Xe],["__scopeId","data-v-c36fe6fa"]]);export{et as _};
