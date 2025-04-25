(self.webpackChunkpangcg_components=self.webpackChunkpangcg_components||[]).push([[33],{69629:function(t,n,e){"use strict";var r;e.r(n),e.d(n,{demos:function(){return C}});var a=e(17061),c=e.n(a),l=e(17156),d=e.n(l),o=e(67294),p=e(95462),E=e(51636),O=e(92906),T=e(67247),P=e(33852),B=e.n(P),C={"editformtable-demo-editformtable":{component:o.memo(o.lazy(function(){return e.e(345).then(e.bind(e,21167))})),asset:{type:"BLOCK",id:"editformtable-demo-editformtable",refAtomIds:["EditFormTable"],dependencies:{"index.tsx":{type:"FILE",value:e(70554).Z},antd:{type:"NPM",value:"5.24.7"},"pangcg-components":{type:"NPM",value:"0.0.1"},react:{type:"NPM",value:"18.3.1"},dayjs:{type:"NPM",value:"1.11.13"}},entry:"index.tsx"},context:{antd:E,"pangcg-components":O,react:r||(r=e.t(o,2)),"antd/locale/zh_CN":T,"dayjs/locale/zh-cn":P},renderOpts:{compile:function(){var L=d()(c()().mark(function R(){var g,j=arguments;return c()().wrap(function(_){for(;;)switch(_.prev=_.next){case 0:return _.next=2,e.e(335).then(e.bind(e,37335));case 2:return _.abrupt("return",(g=_.sent).default.apply(g,j));case 3:case"end":return _.stop()}},R)}));function m(){return L.apply(this,arguments)}return m}()}}}},53002:function(t,n,e){"use strict";e.r(n),e.d(n,{ErrorBoundaryContext:function(){return a}});var r=e(67294),a=(0,r.createContext)(null)},51447:function(t,n,e){"use strict";e.r(n),e.d(n,{default:function(){return m},useErrorBoundary:function(){return R}});var r=e(56690),a=e.n(r),c=e(89728),l=e.n(c),d=e(66115),o=e.n(d),p=e(61655),E=e.n(p),O=e(26389),T=e.n(O),P=e(67294),B=e(53002),C={didCatch:!1,error:null};function L(){var g=arguments.length>0&&arguments[0]!==void 0?arguments[0]:[],j=arguments.length>1&&arguments[1]!==void 0?arguments[1]:[];return g.length!==j.length||g.some(function(y,_){return!Object.is(y,j[_])})}var m=function(g){E()(y,g);var j=T()(y);function y(_){var i;return a()(this,y),i=j.call(this,_),i.resetErrorBoundary=i.resetErrorBoundary.bind(o()(i)),i.state=C,i}return l()(y,[{key:"resetErrorBoundary",value:function(){var i=this.state.error;if(i!==null){for(var I,v,f=arguments.length,u=new Array(f),x=0;x<f;x++)u[x]=arguments[x];(I=(v=this.props).onReset)===null||I===void 0||I.call(v,{args:u,reason:"imperative-api"}),this.setState(C)}}},{key:"componentDidCatch",value:function(i,I){var v,f;(v=this.props)===null||v===void 0||(f=v.onError)===null||f===void 0||f.call(v,i,I)}},{key:"componentDidUpdate",value:function(i,I){var v=this.state.didCatch,f=this.props.resetKeys;if(v&&I.error!==null&&L(i.resetKeys,f)){var u,x;(u=(x=this.props).onReset)===null||u===void 0||u.call(x,{next:f,prev:i.resetKeys,reason:"keys"}),this.setState(C)}}},{key:"render",value:function(){var i=this.props,I=i.children,v=i.fallbackRender,f=i.FallbackComponent,u=i.fallback,x=this.state,A=x.didCatch,S=x.error,b=I;if(A){var F={error:S,resetErrorBoundary:this.resetErrorBoundary};if(typeof v=="function")b=v(F);else if(f)b=(0,P.createElement)(f,F);else if(u!==void 0)b=u;else throw console.error("react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop"),S}return(0,P.createElement)(B.ErrorBoundaryContext.Provider,{value:{didCatch:A,error:S,resetErrorBoundary:this.resetErrorBoundary}},b)}}],[{key:"getDerivedStateFromError",value:function(i){return{didCatch:!0,error:i}}}]),y}(P.Component);function R(){var g=P.useContext(B.ErrorBoundaryContext);if(g===null)throw new Error("useErrorBoundary must be used within an ErrorBoundary");return g}},92906:function(t,n,e){"use strict";e.r(n),e.d(n,{EditFormTable:function(){return y},ErrorBoundary:function(){return _.default},useErrorBoundary:function(){return _.useErrorBoundary}});var r=e(42122),a=e.n(r),c=e(70215),l=e.n(c),d=e(96864),o=e(65520),p=e(38289),E=e(34041),O=e(13457),T=e(84567),P=e(55742),B=e(47921),C=e(83622),L=e(67294),m=e(85893),R=["formListProps","recordCreatorProps","columns","dataSource"],g=d.default.RangePicker,j=function(I){var v=I.formListProps,f=I.recordCreatorProps,u=f===void 0?{creatorButtonShow:!1}:f,x=I.columns,A=I.dataSource,S=l()(I,R),b=o.Z.useFormInstance();(0,L.useEffect)(function(){v.name&&b.setFieldValue(v.name,A||[])},[A,v]);var F=function(M,s){switch(M){case"input":return(0,m.jsx)(p.Z,a()({},s));case"select":return(0,m.jsx)(E.default,a()({},s));case"datePicker":return(0,m.jsx)(d.default,a()({},s));case"rangePicker":return(0,m.jsx)(g,a()({},s));case"inputNumber":return(0,m.jsx)(O.Z,a()({},s));case"checkbox":return(0,m.jsx)(T.Z,a()({},s));case"radio":return(0,m.jsx)(P.ZP,a()({},s));default:return null}},z=function(){var M=b.getFieldValue(v.name)||[];return x.map(function(s){var D=s.dataIndex,$=s.componentType,U=$===void 0?"text":$,N=s.componentProps,k=s.formItemProps;return a()(a()({},s),{},{render:function(H,V,Y){var h=(M==null?void 0:M[Y])||{};if((s==null?void 0:s.customRender)instanceof Function)return s.customRender({text:(h==null?void 0:h[D])||void 0,record:h,index:Y},b);if((s==null?void 0:s.render)instanceof Function)return s.render((h==null?void 0:h[D])||"",h,Y);if(U==="text"){var K;return(h==null||(K=h[D])===null||K===void 0?void 0:K.toString())||""}return(0,m.jsx)(o.Z.Item,a()(a()({},k),{},{name:[Y,D],style:{marginBottom:0},children:F(U,N)}))}})})};return(0,m.jsx)(o.Z.List,a()(a()({},v||{}),{},{children:function(M,s){var D=s.add;return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(B.Z,a()(a()({},S||{}),{},{columns:z(),dataSource:M,pagination:!1})),u!=null&&u.creatorButtonShow?(0,m.jsx)("div",{style:{marginTop:24},children:(0,m.jsx)(C.ZP,a()(a()({},(u==null?void 0:u.buttonProps)||{type:"dashed",block:!0}),{},{onClick:function(){var U=u!=null&&u.record?u==null?void 0:u.record():{};console.log("0000",U),D(a()({},U))},children:(u==null?void 0:u.creatorButtonText)||"\u65B0\u589E\u4E00\u884C"}))}):null]})}}))},y=j,_=e(51447)},80037:function(t,n,e){"use strict";var r=e(85269).default;Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var a=r(e(5584)),c=n.default=a.default},5584:function(t,n,e){"use strict";var r=e(85269).default;Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var a=r(e(85369)),c=r(e(15704));const l={lang:Object.assign({placeholder:"\u8BF7\u9009\u62E9\u65E5\u671F",yearPlaceholder:"\u8BF7\u9009\u62E9\u5E74\u4EFD",quarterPlaceholder:"\u8BF7\u9009\u62E9\u5B63\u5EA6",monthPlaceholder:"\u8BF7\u9009\u62E9\u6708\u4EFD",weekPlaceholder:"\u8BF7\u9009\u62E9\u5468",rangePlaceholder:["\u5F00\u59CB\u65E5\u671F","\u7ED3\u675F\u65E5\u671F"],rangeYearPlaceholder:["\u5F00\u59CB\u5E74\u4EFD","\u7ED3\u675F\u5E74\u4EFD"],rangeMonthPlaceholder:["\u5F00\u59CB\u6708\u4EFD","\u7ED3\u675F\u6708\u4EFD"],rangeQuarterPlaceholder:["\u5F00\u59CB\u5B63\u5EA6","\u7ED3\u675F\u5B63\u5EA6"],rangeWeekPlaceholder:["\u5F00\u59CB\u5468","\u7ED3\u675F\u5468"]},a.default),timePickerLocale:Object.assign({},c.default)};l.lang.ok="\u786E\u5B9A";var d=n.default=l},82925:function(t,n,e){"use strict";var r=e(85269).default;Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var a=r(e(74219)),c=r(e(80037)),l=r(e(5584)),d=r(e(15704));const o="${label}\u4E0D\u662F\u4E00\u4E2A\u6709\u6548\u7684${type}",p={locale:"zh-cn",Pagination:a.default,DatePicker:l.default,TimePicker:d.default,Calendar:c.default,global:{placeholder:"\u8BF7\u9009\u62E9"},Table:{filterTitle:"\u7B5B\u9009",filterConfirm:"\u786E\u5B9A",filterReset:"\u91CD\u7F6E",filterEmptyText:"\u65E0\u7B5B\u9009\u9879",filterCheckAll:"\u5168\u9009",filterSearchPlaceholder:"\u5728\u7B5B\u9009\u9879\u4E2D\u641C\u7D22",emptyText:"\u6682\u65E0\u6570\u636E",selectAll:"\u5168\u9009\u5F53\u9875",selectInvert:"\u53CD\u9009\u5F53\u9875",selectNone:"\u6E05\u7A7A\u6240\u6709",selectionAll:"\u5168\u9009\u6240\u6709",sortTitle:"\u6392\u5E8F",expand:"\u5C55\u5F00\u884C",collapse:"\u5173\u95ED\u884C",triggerDesc:"\u70B9\u51FB\u964D\u5E8F",triggerAsc:"\u70B9\u51FB\u5347\u5E8F",cancelSort:"\u53D6\u6D88\u6392\u5E8F"},Modal:{okText:"\u786E\u5B9A",cancelText:"\u53D6\u6D88",justOkText:"\u77E5\u9053\u4E86"},Tour:{Next:"\u4E0B\u4E00\u6B65",Previous:"\u4E0A\u4E00\u6B65",Finish:"\u7ED3\u675F\u5BFC\u89C8"},Popconfirm:{cancelText:"\u53D6\u6D88",okText:"\u786E\u5B9A"},Transfer:{titles:["",""],searchPlaceholder:"\u8BF7\u8F93\u5165\u641C\u7D22\u5185\u5BB9",itemUnit:"\u9879",itemsUnit:"\u9879",remove:"\u5220\u9664",selectCurrent:"\u5168\u9009\u5F53\u9875",removeCurrent:"\u5220\u9664\u5F53\u9875",selectAll:"\u5168\u9009\u6240\u6709",deselectAll:"\u53D6\u6D88\u5168\u9009",removeAll:"\u5220\u9664\u5168\u90E8",selectInvert:"\u53CD\u9009\u5F53\u9875"},Upload:{uploading:"\u6587\u4EF6\u4E0A\u4F20\u4E2D",removeFile:"\u5220\u9664\u6587\u4EF6",uploadError:"\u4E0A\u4F20\u9519\u8BEF",previewFile:"\u9884\u89C8\u6587\u4EF6",downloadFile:"\u4E0B\u8F7D\u6587\u4EF6"},Empty:{description:"\u6682\u65E0\u6570\u636E"},Icon:{icon:"\u56FE\u6807"},Text:{edit:"\u7F16\u8F91",copy:"\u590D\u5236",copied:"\u590D\u5236\u6210\u529F",expand:"\u5C55\u5F00",collapse:"\u6536\u8D77"},Form:{optional:"\uFF08\u53EF\u9009\uFF09",defaultValidateMessages:{default:"\u5B57\u6BB5\u9A8C\u8BC1\u9519\u8BEF${label}",required:"\u8BF7\u8F93\u5165${label}",enum:"${label}\u5FC5\u987B\u662F\u5176\u4E2D\u4E00\u4E2A[${enum}]",whitespace:"${label}\u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26",date:{format:"${label}\u65E5\u671F\u683C\u5F0F\u65E0\u6548",parse:"${label}\u4E0D\u80FD\u8F6C\u6362\u4E3A\u65E5\u671F",invalid:"${label}\u662F\u4E00\u4E2A\u65E0\u6548\u65E5\u671F"},types:{string:o,method:o,array:o,object:o,number:o,date:o,boolean:o,integer:o,float:o,regexp:o,email:o,url:o,hex:o},string:{len:"${label}\u987B\u4E3A${len}\u4E2A\u5B57\u7B26",min:"${label}\u6700\u5C11${min}\u4E2A\u5B57\u7B26",max:"${label}\u6700\u591A${max}\u4E2A\u5B57\u7B26",range:"${label}\u987B\u5728${min}-${max}\u5B57\u7B26\u4E4B\u95F4"},number:{len:"${label}\u5FC5\u987B\u7B49\u4E8E${len}",min:"${label}\u6700\u5C0F\u503C\u4E3A${min}",max:"${label}\u6700\u5927\u503C\u4E3A${max}",range:"${label}\u987B\u5728${min}-${max}\u4E4B\u95F4"},array:{len:"\u987B\u4E3A${len}\u4E2A${label}",min:"\u6700\u5C11${min}\u4E2A${label}",max:"\u6700\u591A${max}\u4E2A${label}",range:"${label}\u6570\u91CF\u987B\u5728${min}-${max}\u4E4B\u95F4"},pattern:{mismatch:"${label}\u4E0E\u6A21\u5F0F\u4E0D\u5339\u914D${pattern}"}}},Image:{preview:"\u9884\u89C8"},QRCode:{expired:"\u4E8C\u7EF4\u7801\u8FC7\u671F",refresh:"\u70B9\u51FB\u5237\u65B0",scanned:"\u5DF2\u626B\u63CF"},ColorPicker:{presetEmpty:"\u6682\u65E0",transparent:"\u65E0\u8272",singleColor:"\u5355\u8272",gradientColor:"\u6E10\u53D8\u8272"}};var E=n.default=p},15704:function(t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;const e={placeholder:"\u8BF7\u9009\u62E9\u65F6\u95F4",rangePlaceholder:["\u5F00\u59CB\u65F6\u95F4","\u7ED3\u675F\u65F6\u95F4"]};var r=n.default=e},67247:function(t,n,e){t.exports=e(82925)},33852:function(t,n,e){(function(r,a){t.exports=a(e(27484))})(this,function(r){"use strict";function a(d){return d&&typeof d=="object"&&"default"in d?d:{default:d}}var c=a(r),l={name:"zh-cn",weekdays:"\u661F\u671F\u65E5_\u661F\u671F\u4E00_\u661F\u671F\u4E8C_\u661F\u671F\u4E09_\u661F\u671F\u56DB_\u661F\u671F\u4E94_\u661F\u671F\u516D".split("_"),weekdaysShort:"\u5468\u65E5_\u5468\u4E00_\u5468\u4E8C_\u5468\u4E09_\u5468\u56DB_\u5468\u4E94_\u5468\u516D".split("_"),weekdaysMin:"\u65E5_\u4E00_\u4E8C_\u4E09_\u56DB_\u4E94_\u516D".split("_"),months:"\u4E00\u6708_\u4E8C\u6708_\u4E09\u6708_\u56DB\u6708_\u4E94\u6708_\u516D\u6708_\u4E03\u6708_\u516B\u6708_\u4E5D\u6708_\u5341\u6708_\u5341\u4E00\u6708_\u5341\u4E8C\u6708".split("_"),monthsShort:"1\u6708_2\u6708_3\u6708_4\u6708_5\u6708_6\u6708_7\u6708_8\u6708_9\u6708_10\u6708_11\u6708_12\u6708".split("_"),ordinal:function(d,o){return o==="W"?d+"\u5468":d+"\u65E5"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY\u5E74M\u6708D\u65E5",LLL:"YYYY\u5E74M\u6708D\u65E5Ah\u70B9mm\u5206",LLLL:"YYYY\u5E74M\u6708D\u65E5ddddAh\u70B9mm\u5206",l:"YYYY/M/D",ll:"YYYY\u5E74M\u6708D\u65E5",lll:"YYYY\u5E74M\u6708D\u65E5 HH:mm",llll:"YYYY\u5E74M\u6708D\u65E5dddd HH:mm"},relativeTime:{future:"%s\u5185",past:"%s\u524D",s:"\u51E0\u79D2",m:"1 \u5206\u949F",mm:"%d \u5206\u949F",h:"1 \u5C0F\u65F6",hh:"%d \u5C0F\u65F6",d:"1 \u5929",dd:"%d \u5929",M:"1 \u4E2A\u6708",MM:"%d \u4E2A\u6708",y:"1 \u5E74",yy:"%d \u5E74"},meridiem:function(d,o){var p=100*d+o;return p<600?"\u51CC\u6668":p<900?"\u65E9\u4E0A":p<1100?"\u4E0A\u5348":p<1300?"\u4E2D\u5348":p<1800?"\u4E0B\u5348":"\u665A\u4E0A"}};return c.default.locale(l,null,!0),l})},71892:function(t,n,e){"use strict";e.r(n),e.d(n,{texts:function(){return a}});var r=e(95462);const a=[{value:"\u4E1A\u52A1\u5F00\u53D1\u4E2D\uFF0C\u4E00\u4E9B\u53EF\u7F16\u8F91 Table\uFF0C\u9891\u7E41\u4F7F\u7528\uFF0C\u4E00\u4E9B\u4E1A\u52A1\u4E4B\u5916\u7684\u989D\u5916\u914D\u7F6E\u6BCF\u6B21\u90FD\u9700\u8981\u8FDB\u884C\u914D\u7F6E\uFF0C\u73B0\u5728\u5C06\u989D\u5916\u7684\u914D\u7F6E\u7EDF\u4E00\u89C4\u5212\u8D77\u6765\uFF0C\u7528\u6237\u53EA\u9700\u8981\u5173\u6CE8\u4E1A\u52A1\u5373\u53EF",paraId:0,tocIndex:1},{value:"\u53C2\u6570",paraId:1,tocIndex:5},{value:"\u8BF4\u660E",paraId:1,tocIndex:5},{value:"\u7C7B\u578B",paraId:1,tocIndex:5},{value:"\u9ED8\u8BA4\u503C",paraId:1,tocIndex:5},{value:"\u7248\u672C",paraId:1,tocIndex:5},{value:"formListProps",paraId:1,tocIndex:5},{value:"\u53C2\u8003 Antd \u7684 formListProps\uFF08\u5FC5\u586B\uFF09",paraId:1,tocIndex:5},{value:"-",paraId:1,tocIndex:5},{value:"-",paraId:1,tocIndex:5},{value:"0.0.1",paraId:1,tocIndex:5},{value:"recordCreatorProps",paraId:1,tocIndex:5},{value:"\u521B\u5EFA\u4E00\u884C\u53C2\u6570(\u975E\u5FC5\u586B)",paraId:1,tocIndex:5},{value:"RecordCreatorProps",paraId:2,tocIndex:5},{value:"-",paraId:1,tocIndex:5},{value:"0.0.1",paraId:1,tocIndex:5},{value:"columns",paraId:1,tocIndex:5},{value:"\u8868\u683C\u5217\u7684\u914D\u7F6E\u63CF\u8FF0",paraId:1,tocIndex:5},{value:"CustomColumns",paraId:3,tocIndex:5},{value:"_",paraId:1,tocIndex:5},{value:"0.0.1",paraId:1,tocIndex:5},{value:"otherProps",paraId:1,tocIndex:5},{value:"\u5176\u4F59\u53C2\u6570\u7EE7\u627F antd \u7684 Table",paraId:1,tocIndex:5},{value:"-",paraId:1,tocIndex:5},{value:"_",paraId:1,tocIndex:5},{value:"0.0.1",paraId:1,tocIndex:5},{value:"\u53C2\u6570",paraId:4,tocIndex:6},{value:"\u8BF4\u660E",paraId:4,tocIndex:6},{value:"\u7C7B\u578B",paraId:4,tocIndex:6},{value:"\u9ED8\u8BA4\u503C",paraId:4,tocIndex:6},{value:"\u7248\u672C",paraId:4,tocIndex:6},{value:"creatorButtonShow",paraId:4,tocIndex:6},{value:"\u662F\u5426\u663E\u793A\u65B0\u589E\u6309\u94AE",paraId:4,tocIndex:6},{value:"boolean",paraId:4,tocIndex:6},{value:"false",paraId:4,tocIndex:6},{value:"0.0.1",paraId:4,tocIndex:6},{value:"creatorButtonText",paraId:4,tocIndex:6},{value:"\u65B0\u589E\u6309\u94AE\u6587\u6848\uFF08\u975E\u5FC5\u586B\uFF09",paraId:4,tocIndex:6},{value:"string",paraId:4,tocIndex:6},{value:"\u65B0\u589E\u4E00\u884C",paraId:4,tocIndex:6},{value:"0.0.1",paraId:4,tocIndex:6},{value:"record",paraId:4,tocIndex:6},{value:"\u65B0\u589E\u4E00\u884C\u7684\u6570\u636E",paraId:4,tocIndex:6},{value:"() => any",paraId:4,tocIndex:6},{value:"{}",paraId:4,tocIndex:6},{value:"0.0.1",paraId:4,tocIndex:6},{value:"buttonProps",paraId:4,tocIndex:6},{value:"\u7EE7\u627F Antd \u7684 Button",paraId:4,tocIndex:6},{value:"-",paraId:4,tocIndex:6},{value:"-",paraId:4,tocIndex:6},{value:"0.0.1",paraId:4,tocIndex:6},{value:"\u53C2\u6570",paraId:5,tocIndex:7},{value:"\u8BF4\u660E",paraId:5,tocIndex:7},{value:"\u7C7B\u578B",paraId:5,tocIndex:7},{value:"\u9ED8\u8BA4\u503C",paraId:5,tocIndex:7},{value:"\u7248\u672C",paraId:5,tocIndex:7},{value:"componentType",paraId:5,tocIndex:7},{value:"\u7EC4\u4EF6\u7C7B\u578B",paraId:5,tocIndex:7},{value:"ComponentType",paraId:6,tocIndex:7},{value:"text",paraId:5,tocIndex:7},{value:"0.0.1",paraId:5,tocIndex:7},{value:"componentProps",paraId:5,tocIndex:7},{value:"\u7EC4\u4EF6\u7C7B\u578B\u5BF9\u5E94\u7684\u5C5E\u6027\uFF08\u7EE7\u627F Antd \u5BF9\u5E94\u7684\u7EC4\u4EF6\u5C5E\u6027\uFF09",paraId:5,tocIndex:7},{value:"-",paraId:5,tocIndex:7},{value:"-",paraId:5,tocIndex:7},{value:"0.0.1",paraId:5,tocIndex:7},{value:"formItemProps",paraId:5,tocIndex:7},{value:"\u7EE7\u627F Antd \u7684 formItemProps",paraId:5,tocIndex:7},{value:"-",paraId:5,tocIndex:7},{value:"-",paraId:5,tocIndex:7},{value:"0.0.1",paraId:5,tocIndex:7},{value:"\u53C2\u6570",paraId:7,tocIndex:8},{value:"\u8BF4\u660E",paraId:7,tocIndex:8},{value:"\u7C7B\u578B",paraId:7,tocIndex:8},{value:"\u9ED8\u8BA4\u503C",paraId:7,tocIndex:8},{value:"\u7248\u672C",paraId:7,tocIndex:8},{value:"text",paraId:7,tocIndex:8},{value:"\u7EAF\u6587\u672C",paraId:7,tocIndex:8},{value:"string",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8},{value:"input",paraId:7,tocIndex:8},{value:"Antd \u7684 Input",paraId:7,tocIndex:8},{value:"Input",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8},{value:"select",paraId:7,tocIndex:8},{value:"Antd \u7684 Select",paraId:7,tocIndex:8},{value:"Select ",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8},{value:"datePicker",paraId:7,tocIndex:8},{value:"Antd \u7684 DatePicker",paraId:7,tocIndex:8},{value:"DatePicker",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8},{value:"RangePicker",paraId:7,tocIndex:8},{value:"Antd \u7684 RangePicker",paraId:7,tocIndex:8},{value:"RangePicker",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8},{value:"inputNumber",paraId:7,tocIndex:8},{value:"Antd \u7684 InputNumber",paraId:7,tocIndex:8},{value:"InputNumber",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8},{value:"checkbox",paraId:7,tocIndex:8},{value:"Antd \u7684 Checkbox",paraId:7,tocIndex:8},{value:"Checkbox",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8},{value:"radio",paraId:7,tocIndex:8},{value:"Antd \u7684 Radio",paraId:7,tocIndex:8},{value:"Radio",paraId:7,tocIndex:8},{value:"-",paraId:7,tocIndex:8},{value:"0.0.1",paraId:7,tocIndex:8}]},70554:function(t,n){"use strict";n.Z=`import { Button, ConfigProvider, Form, Popconfirm, Space } from 'antd';
import { EditColumnsType, EditFormTable } from 'pangcg-components';
import React from 'react';

// \u914D\u7F6E antd \u7684 \u56FD\u9645\u5316
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

interface PersonInfo {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  address: string;
  bothday: string;
  hireOrResignationDate: [string, string];
}

const EditFormTableDemo = () => {
  const [form] = Form.useForm();

  // \u5B9A\u4E49\u5217\u914D\u7F6E
  const columns: EditColumnsType<PersonInfo> = [
    {
      title: '\u59D3\u540D',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      componentType: 'input',
      // componentProps \u7EE7\u627F antd \u7684 InputProps\uFF0C \u53C2\u8003 antd \u7684 Input \u7EC4\u4EF6
      componentProps: {
        placeholder: '\u8BF7\u8F93\u5165\u59D3\u540D',
        maxLength: 50,
        allowClear: true,
      },
      // formItemProps \u7EE7\u627F antd \u7684 FormItemProps\uFF0C \u53C2\u8003 antd \u7684 FormItem \u7EC4\u4EF6
      formItemProps: {
        rules: [{ required: true, message: '\u59D3\u540D\u4E0D\u80FD\u4E3A\u7A7A' }],
      },
    },
    {
      title: '\u6027\u522B',
      dataIndex: 'gender',
      key: 'gender',
      width: 180,
      componentType: 'select',
      componentProps: {
        options: [
          { label: '\u7537', value: 'male' },
          { label: '\u5973', value: 'female' },
        ],
        placeholder: '\u8BF7\u9009\u62E9\u6027\u522B',
        allowClear: true,
        style: {
          width: '100%',
        },
      },
      formItemProps: {
        rules: [{ required: true, message: '\u8BF7\u9009\u62E9\u6027\u522B' }],
      },
    },
    {
      title: '\u5E74\u9F84',
      dataIndex: 'age',
      key: 'age',
      width: 200,
      render: (value) => {
        return <div style={{ color: 'red' }}>{value || ''}</div>;
      },
    },
    {
      title: '\u51FA\u751F\u5E74\u6708',
      dataIndex: 'bothday',
      key: 'bothday',
      width: 200,
      componentType: 'datePicker',
      componentProps: {
        placeholder: '\u8BF7\u9009\u62E9\u51FA\u751F\u5E74\u6708',
        allowClear: true,
        style: {
          width: '100%',
        },
      },
      formItemProps: {
        rules: [{ required: true, message: '\u8BF7\u9009\u62E9\u51FA\u751F\u5E74\u6708' }],
      },
    },
    {
      title: '\u5165\u804C/\u79BB\u804C\u65E5\u671F',
      dataIndex: 'hireOrResignationDate',
      key: 'hireOrResignationDate',
      width: 240,
      componentType: 'rangePicker',
      componentProps: {
        placeholder: ['\u8BF7\u9009\u62E9\u5165\u804C\u65E5\u671F', '\u8BF7\u9009\u62E9\u79BB\u804C\u65E5\u671F'],
        allowClear: true,
        style: {
          width: '100%',
        },
      },
      formItemProps: {
        rules: [{ required: true, message: '\u8BF7\u9009\u62E9\u5165\u804C/\u79BB\u804C\u65E5\u671F' }],
      },
    },
    {
      title: '\u64CD\u4F5C',
      dataIndex: 'option',
      key: 'option',
      width: 120,
      fixed: 'right',
      customRender: ({ text, record, index }, form_s: any) => {
        return (
          <Space size="middle">
            <Popconfirm
              title="\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u8BB0\u5F55\u5417\uFF1F"
              okText="\u786E\u5B9A"
              cancelText="\u53D6\u6D88"
              onConfirm={() => {
                const curList = form_s?.getFieldValue('list');
                console.log('\u5220\u9664', text, record, index, curList);
                form_s.setFieldValue(
                  'list',
                  curList.filter((items: any, inx: number) => inx !== index),
                );
              }}
            >
              <a>\u5220\u9664</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // form\u63D0\u4EA4\u4E8B\u4EF6
  const onFinish = (values: any) => {
    console.log('values', values);
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Button
        type="primary"
        onClick={() => {
          form.submit();
        }}
        style={{ marginBottom: 12 }}
      >
        \u6253\u5370\u6570\u636E
      </Button>
      <Form form={form} onFinish={onFinish}>
        <EditFormTable
          formListProps={{ name: 'list' }}
          recordCreatorProps={{
            creatorButtonShow: true,
            record: () => {
              return {
                name: '\u65B0\u8BB0\u5F55',
                gender: 'male',
                age: '18',
                id: (Math.random() * 10).toFixed(2),
              };
            },
          }}
          rowKey={'id'}
          columns={columns}
          dataSource={[
            {
              id: '0000',
              name: '\u5C0F\u521A',
              age: 32,
              gender: 'male',
              address: '\u897F\u6E56\u533A\u6E56\u5E95\u516C\u56ED1\u53F7',
            },
            {
              id: '11111',
              name: '\u5C0F\u7406\u60F3',
              age: 35,
              gender: 'female',
              address: '\u897F\u6E56\u533A\u6E56\u5E95\u516C\u56ED1\u53F7',
            },
          ]}
          scroll={{ x: 'max-content' }}
        />
      </Form>
    </ConfigProvider>
  );
};

export default EditFormTableDemo;
`},74219:function(t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var e={items_per_page:"\u6761/\u9875",jump_to:"\u8DF3\u81F3",jump_to_confirm:"\u786E\u5B9A",page:"\u9875",prev_page:"\u4E0A\u4E00\u9875",next_page:"\u4E0B\u4E00\u9875",prev_5:"\u5411\u524D 5 \u9875",next_5:"\u5411\u540E 5 \u9875",prev_3:"\u5411\u524D 3 \u9875",next_3:"\u5411\u540E 3 \u9875",page_size:"\u9875\u7801"},r=n.default=e},26114:function(t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.commonLocale=void 0;var e=n.commonLocale={yearFormat:"YYYY",dayFormat:"D",cellMeridiemFormat:"A",monthBeforeYear:!0}},85369:function(t,n,e){"use strict";var r=e(6142).default;Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var a=r(e(83449)),c=e(26114),l=(0,a.default)((0,a.default)({},c.commonLocale),{},{locale:"zh_CN",today:"\u4ECA\u5929",now:"\u6B64\u523B",backToToday:"\u8FD4\u56DE\u4ECA\u5929",ok:"\u786E\u5B9A",timeSelect:"\u9009\u62E9\u65F6\u95F4",dateSelect:"\u9009\u62E9\u65E5\u671F",weekSelect:"\u9009\u62E9\u5468",clear:"\u6E05\u9664",week:"\u5468",month:"\u6708",year:"\u5E74",previousMonth:"\u4E0A\u4E2A\u6708 (\u7FFB\u9875\u4E0A\u952E)",nextMonth:"\u4E0B\u4E2A\u6708 (\u7FFB\u9875\u4E0B\u952E)",monthSelect:"\u9009\u62E9\u6708\u4EFD",yearSelect:"\u9009\u62E9\u5E74\u4EFD",decadeSelect:"\u9009\u62E9\u5E74\u4EE3",previousYear:"\u4E0A\u4E00\u5E74 (Control\u952E\u52A0\u5DE6\u65B9\u5411\u952E)",nextYear:"\u4E0B\u4E00\u5E74 (Control\u952E\u52A0\u53F3\u65B9\u5411\u952E)",previousDecade:"\u4E0A\u4E00\u5E74\u4EE3",nextDecade:"\u4E0B\u4E00\u5E74\u4EE3",previousCentury:"\u4E0A\u4E00\u4E16\u7EAA",nextCentury:"\u4E0B\u4E00\u4E16\u7EAA",yearFormat:"YYYY\u5E74",cellDateFormat:"D",monthBeforeYear:!1}),d=n.default=l},85269:function(t){function n(e){return e&&e.__esModule?e:{default:e}}t.exports=n,t.exports.__esModule=!0,t.exports.default=t.exports},63739:function(t,n,e){var r=e(32126);function a(c,l,d){return(l=r(l))in c?Object.defineProperty(c,l,{value:d,enumerable:!0,configurable:!0,writable:!0}):c[l]=d,c}t.exports=a,t.exports.__esModule=!0,t.exports.default=t.exports},6142:function(t){function n(e){return e&&e.__esModule?e:{default:e}}t.exports=n,t.exports.__esModule=!0,t.exports.default=t.exports},83449:function(t,n,e){var r=e(63739);function a(l,d){var o=Object.keys(l);if(Object.getOwnPropertySymbols){var p=Object.getOwnPropertySymbols(l);d&&(p=p.filter(function(E){return Object.getOwnPropertyDescriptor(l,E).enumerable})),o.push.apply(o,p)}return o}function c(l){for(var d=1;d<arguments.length;d++){var o=arguments[d]!=null?arguments[d]:{};d%2?a(Object(o),!0).forEach(function(p){r(l,p,o[p])}):Object.getOwnPropertyDescriptors?Object.defineProperties(l,Object.getOwnPropertyDescriptors(o)):a(Object(o)).forEach(function(p){Object.defineProperty(l,p,Object.getOwnPropertyDescriptor(o,p))})}return l}t.exports=c,t.exports.__esModule=!0,t.exports.default=t.exports},61834:function(t,n,e){var r=e(22560).default;function a(c,l){if(r(c)!="object"||!c)return c;var d=c[Symbol.toPrimitive];if(d!==void 0){var o=d.call(c,l||"default");if(r(o)!="object")return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return(l==="string"?String:Number)(c)}t.exports=a,t.exports.__esModule=!0,t.exports.default=t.exports},32126:function(t,n,e){var r=e(22560).default,a=e(61834);function c(l){var d=a(l,"string");return r(d)=="symbol"?d:d+""}t.exports=c,t.exports.__esModule=!0,t.exports.default=t.exports},22560:function(t){function n(e){"@babel/helpers - typeof";return t.exports=n=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(r){return typeof r}:function(r){return r&&typeof Symbol=="function"&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r},t.exports.__esModule=!0,t.exports.default=t.exports,n(e)}t.exports=n,t.exports.__esModule=!0,t.exports.default=t.exports}}]);
