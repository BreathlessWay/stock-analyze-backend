var n=Object.defineProperty;var o=Object.getOwnPropertySymbols;var l=Object.prototype.hasOwnProperty,p=Object.prototype.propertyIsEnumerable;var s=(r,e,t)=>e in r?n(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,i=(r,e)=>{for(var t in e||(e={}))l.call(e,t)&&s(r,t,e[t]);if(o)for(var t of o(e))p.call(e,t)&&s(r,t,e[t]);return r};import{b as c,u as h}from"./props-B6bMdywq.js";import{d as m,r as u,L as d,o as f,f as y,Y as _}from"./index-BWLoIWRc.js";const w=m({__name:"VisitAmount",props:i({},c),setup(r){const e=u(null),{setOptions:t}=h(e);return d(()=>{t({tooltip:{trigger:"axis",axisPointer:{lineStyle:{width:1,color:"#019680"}}},grid:{left:"1%",right:"1%",top:"2  %",bottom:0,containLabel:!0},xAxis:{type:"category",data:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]},yAxis:{type:"value",max:8e3,splitNumber:4},series:[{data:[3e3,2e3,3333,5e3,3200,4200,3200,2100,3e3,5100,6e3,3200,4800],type:"bar",barMaxWidth:80}]})}),(a,b)=>(f(),y("div",{ref_key:"chartRef",ref:e,style:_({height:a.height,width:a.width})},null,4))}});export{w as _};
