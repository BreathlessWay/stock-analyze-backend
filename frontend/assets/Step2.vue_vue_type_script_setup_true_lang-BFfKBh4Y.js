import{d as k,r as s,u as B,o as N,D as A,w as t,i as n,g as a,j as i,l as C,$ as V,k as q,B as U,n as j,_ as R}from"./index-BWLoIWRc.js";const T={style:{"margin-left":"80px"}},$=k({__name:"Step2",emits:["prevStep","nextStep"],setup(D,{emit:d}){const p=s(null),f=B(),u=s(!1),l=s({password:"086611"}),c={password:{required:!0,message:"请输入支付密码",trigger:"blur"}},r=d;function g(){r("prevStep")}function v(){u.value=!0,p.value.validate(_=>{_?f.error("验证失败，请填写完整信息"):setTimeout(()=>{r("nextStep")},1500)})}return(_,e)=>{const o=C,x=V,b=q,m=U,w=j,y=R;return N(),A(y,{"label-width":90,model:l.value,rules:c,"label-placement":"left",ref_key:"form2Ref",ref:p,style:{"max-width":"500px",margin:"40px auto 0 80px"}},{default:t(()=>[n(o,{label:"付款账户",path:"myAccount"},{default:t(()=>e[1]||(e[1]=[a("span",null,"NaiveUiAdmin@163.com",-1)])),_:1}),n(o,{label:"收款账户",path:"account"},{default:t(()=>e[2]||(e[2]=[a("span",null,"NaiveUiAdmin@qq.com",-1)])),_:1}),n(o,{label:"收款人姓名",path:"name"},{default:t(()=>e[3]||(e[3]=[a("span",null,"Ah jung",-1)])),_:1}),n(o,{label:"转账金额",path:"money"},{default:t(()=>e[4]||(e[4]=[a("span",null,"￥1980",-1)])),_:1}),n(x),n(o,{label:"支付密码",path:"password"},{default:t(()=>[n(b,{type:"password",value:l.value.password,"onUpdate:value":e[0]||(e[0]=S=>l.value.password=S)},null,8,["value"])]),_:1}),a("div",T,[n(w,null,{default:t(()=>[n(m,{type:"primary",loading:u.value,onClick:v},{default:t(()=>e[5]||(e[5]=[i("提交")])),_:1},8,["loading"]),n(m,{onClick:g},{default:t(()=>e[6]||(e[6]=[i("上一步")])),_:1})]),_:1})])]),_:1},8,["model"])}}});export{$ as _};
