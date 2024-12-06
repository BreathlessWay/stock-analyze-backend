import{d as U,r as m,u as B,a9 as O,o as w,D as N,w as a,i as e,j as p,g as V,k as R,l as q,aQ as D,n as S,aR as j,a0 as z,B as M,_ as P,ar as Q,as as $}from"./index-BWLoIWRc.js";const F=U({__name:"BasicSetting",setup(A){const v={name:{required:!0,message:"请输入网站名称",trigger:"blur"},mobile:{required:!0,message:"请输入联系电话",trigger:"input"}},i=m(null),_=B(),f=O(),n=m({name:"",mobile:"",icpCode:"",address:"",loginCode:0,closeText:"网站维护中，暂时无法访问！本网站正在进行系统维护和技术升级，网站暂时无法访问，敬请谅解！",systemOpen:!0});function g(s){s||f.warning({title:"提示",content:"您确定要关闭系统访问吗？该操作立马生效，请慎重操作！",positiveText:"确定",negativeText:"取消",onPositiveClick:()=>{_.success("操作成功")},onNegativeClick:()=>{n.value.systemOpen=!0}})}function c(){i.value.validate(s=>{s?_.error("验证失败，请填写完整信息"):_.success("验证成功")})}return(s,l)=>{const u=R,t=q,d=D,r=S,b=j,C=z,x=M,y=P,k=Q,T=$;return w(),N(T,{cols:"2 s:2 m:2 l:3 xl:3 2xl:3",responsive:"screen"},{default:a(()=>[e(k,null,{default:a(()=>[e(y,{"label-width":80,model:n.value,rules:v,ref_key:"formRef",ref:i},{default:a(()=>[e(t,{label:"网站名称",path:"name"},{default:a(()=>[e(u,{value:n.value.name,"onUpdate:value":l[0]||(l[0]=o=>n.value.name=o),placeholder:"请输入网站名称"},null,8,["value"])]),_:1}),e(t,{label:"备案编号",path:"icpCode"},{default:a(()=>[e(u,{placeholder:"请输入备案编号",value:n.value.icpCode,"onUpdate:value":l[1]||(l[1]=o=>n.value.icpCode=o)},null,8,["value"])]),_:1}),e(t,{label:"联系电话",path:"mobile"},{default:a(()=>[e(u,{placeholder:"请输入联系电话",value:n.value.mobile,"onUpdate:value":l[2]||(l[2]=o=>n.value.mobile=o)},null,8,["value"])]),_:1}),e(t,{label:"联系地址",path:"address"},{default:a(()=>[e(u,{value:n.value.address,"onUpdate:value":l[3]||(l[3]=o=>n.value.address=o),type:"textarea",placeholder:"请输入联系地址"},null,8,["value"])]),_:1}),e(t,{label:"登录验证码",path:"loginCode"},{default:a(()=>[e(b,{value:n.value.loginCode,"onUpdate:value":l[4]||(l[4]=o=>n.value.loginCode=o),name:"loginCode"},{default:a(()=>[e(r,null,{default:a(()=>[e(d,{value:1},{default:a(()=>l[7]||(l[7]=[p("开启")])),_:1}),e(d,{value:0},{default:a(()=>l[8]||(l[8]=[p("关闭")])),_:1})]),_:1})]),_:1},8,["value"])]),_:1}),e(t,{label:"网站开启访问",path:"systemOpen"},{default:a(()=>[e(C,{size:"large",value:n.value.systemOpen,"onUpdate:value":[l[5]||(l[5]=o=>n.value.systemOpen=o),g]},null,8,["value"])]),_:1}),e(t,{label:"网站关闭提示",path:"closeText"},{default:a(()=>[e(u,{value:n.value.closeText,"onUpdate:value":l[6]||(l[6]=o=>n.value.closeText=o),type:"textarea",placeholder:"请输入网站关闭提示"},null,8,["value"])]),_:1}),V("div",null,[e(r,null,{default:a(()=>[e(x,{type:"primary",onClick:c},{default:a(()=>l[9]||(l[9]=[p("更新基本信息")])),_:1})]),_:1})])]),_:1},8,["model"])]),_:1})]),_:1})}}});export{F as _};
