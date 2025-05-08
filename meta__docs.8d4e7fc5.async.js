"use strict";(self.webpackChunkpangcg_components=self.webpackChunkpangcg_components||[]).push([[904],{84575:function(t,a,n){n.r(a),n.d(a,{demos:function(){return d}});var o=n(67294),e=n(20284),d={}},60792:function(t,a,n){n.r(a),n.d(a,{demos:function(){return d}});var o=n(67294),e=n(76098),d={}},4645:function(t,a,n){n.r(a),n.d(a,{demos:function(){return d}});var o=n(67294),e=n(81294),d={}},11171:function(t,a,n){n.r(a),n.d(a,{demos:function(){return d}});var o=n(67294),e=n(68537),d={}},16394:function(t,a,n){n.r(a),n.d(a,{texts:function(){return e}});var o=n(20284);const e=[{value:"\u8FD9\u91CC\u662F\u9AD8\u9636\u51FD\u6570\u7684\u6587\u6863\u5185\u5BB9\u3002",paraId:0,tocIndex:0}]},6467:function(t,a,n){n.r(a),n.d(a,{texts:function(){return e}});var o=n(76098);const e=[{value:"\u63D0\u4F9B\u4E86\u4E00\u7CFB\u5217\u5E38\u7528\u7684\u6570\u636E\u9A8C\u8BC1\u51FD\u6570\uFF0C\u5305\u62EC\u90AE\u7BB1\u3001\u624B\u673A\u53F7\u3001\u8EAB\u4EFD\u8BC1\u53F7\u3001URL \u7B49\u9A8C\u8BC1\u3002",paraId:0,tocIndex:1},{value:"\u9A8C\u8BC1\u5B57\u7B26\u4E32\u662F\u5426\u4E3A\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740\u3002",paraId:1,tocIndex:3},{value:`function isEmail(value: string): boolean;
`,paraId:2,tocIndex:3},{value:"value",paraId:3,tocIndex:4},{value:": \u8981\u9A8C\u8BC1\u7684\u5B57\u7B26\u4E32",paraId:3,tocIndex:4},{value:"boolean",paraId:4,tocIndex:5},{value:": \u5982\u679C\u662F\u6709\u6548\u7684\u90AE\u7BB1\u5730\u5740\u8FD4\u56DE ",paraId:4,tocIndex:5},{value:"true",paraId:4,tocIndex:5},{value:"\uFF0C\u5426\u5219\u8FD4\u56DE ",paraId:4,tocIndex:5},{value:"false",paraId:4,tocIndex:5},{value:`import { isEmail, EMAIL_PATTERN } from 'pangcg-components';

isEmail('test@example.com'); // true
isEmail('invalid-email'); // false

// \u76F4\u63A5\u4F7F\u7528\u6B63\u5219\u8868\u8FBE\u5F0F
EMAIL_PATTERN.test('test@example.com'); // true
`,paraId:5,tocIndex:6},{value:"\u9A8C\u8BC1\u5B57\u7B26\u4E32\u662F\u5426\u4E3A\u6709\u6548\u7684\u624B\u673A\u53F7\u7801\uFF08\u4E2D\u56FD\u5927\u9646\uFF09\u3002",paraId:6,tocIndex:7},{value:`function isPhoneNumber(value: string): boolean;
`,paraId:7,tocIndex:7},{value:"value",paraId:8,tocIndex:8},{value:": \u8981\u9A8C\u8BC1\u7684\u5B57\u7B26\u4E32",paraId:8,tocIndex:8},{value:"boolean",paraId:9,tocIndex:9},{value:": \u5982\u679C\u662F\u6709\u6548\u7684\u624B\u673A\u53F7\u7801\u8FD4\u56DE ",paraId:9,tocIndex:9},{value:"true",paraId:9,tocIndex:9},{value:"\uFF0C\u5426\u5219\u8FD4\u56DE ",paraId:9,tocIndex:9},{value:"false",paraId:9,tocIndex:9},{value:`import { isPhoneNumber, PHONE_NUMBER_PATTERN } from 'pangcg-components';

isPhoneNumber('13812345678'); // true
isPhoneNumber('12345'); // false

// \u76F4\u63A5\u4F7F\u7528\u6B63\u5219\u8868\u8FBE\u5F0F
PHONE_NUMBER_PATTERN.test('13812345678'); // true
`,paraId:10,tocIndex:10},{value:"\u9A8C\u8BC1\u5B57\u7B26\u4E32\u662F\u5426\u4E3A\u6709\u6548\u7684 URL \u5730\u5740\u3002",paraId:11,tocIndex:11},{value:`function isURL(value: string): boolean;
`,paraId:12,tocIndex:11},{value:"value",paraId:13,tocIndex:12},{value:": \u8981\u9A8C\u8BC1\u7684\u5B57\u7B26\u4E32",paraId:13,tocIndex:12},{value:"boolean",paraId:14,tocIndex:13},{value:": \u5982\u679C\u662F\u6709\u6548\u7684 URL \u8FD4\u56DE ",paraId:14,tocIndex:13},{value:"true",paraId:14,tocIndex:13},{value:"\uFF0C\u5426\u5219\u8FD4\u56DE ",paraId:14,tocIndex:13},{value:"false",paraId:14,tocIndex:13},{value:`import { isURL } from 'pangcg-components';

isURL('https://example.com'); // true
isURL('invalid-url'); // false
`,paraId:15,tocIndex:14},{value:"\u9A8C\u8BC1\u5B57\u7B26\u4E32\u662F\u5426\u4E3A\u6709\u6548\u7684\u8EAB\u4EFD\u8BC1\u53F7\u7801\uFF08\u4E2D\u56FD\u5927\u9646\uFF09\u3002",paraId:16,tocIndex:15},{value:`function isIDCard(value: string): boolean;
`,paraId:17,tocIndex:15},{value:"value",paraId:18,tocIndex:16},{value:": \u8981\u9A8C\u8BC1\u7684\u5B57\u7B26\u4E32",paraId:18,tocIndex:16},{value:"boolean",paraId:19,tocIndex:17},{value:": \u5982\u679C\u662F\u6709\u6548\u7684\u8EAB\u4EFD\u8BC1\u53F7\u7801\u8FD4\u56DE ",paraId:19,tocIndex:17},{value:"true",paraId:19,tocIndex:17},{value:"\uFF0C\u5426\u5219\u8FD4\u56DE ",paraId:19,tocIndex:17},{value:"false",paraId:19,tocIndex:17},{value:`import { isIDCard, ID_CARD_PATTERN } from 'pangcg-components';

isIDCard('110101199003077890'); // true
isIDCard('12345'); // false

// \u76F4\u63A5\u4F7F\u7528\u6B63\u5219\u8868\u8FBE\u5F0F
ID_CARD_PATTERN.test('110101199003077890'); // true
`,paraId:20,tocIndex:18},{value:"\u9A8C\u8BC1\u503C\u662F\u5426\u4E3A\u6570\u5B57\u3002",paraId:21,tocIndex:19},{value:`function isNumeric(value: any): boolean;
`,paraId:22,tocIndex:19},{value:"value",paraId:23,tocIndex:20},{value:": \u8981\u9A8C\u8BC1\u7684\u503C",paraId:23,tocIndex:20},{value:"boolean",paraId:24,tocIndex:21},{value:": \u5982\u679C\u662F\u6570\u5B57\u8FD4\u56DE ",paraId:24,tocIndex:21},{value:"true",paraId:24,tocIndex:21},{value:"\uFF0C\u5426\u5219\u8FD4\u56DE ",paraId:24,tocIndex:21},{value:"false",paraId:24,tocIndex:21},{value:`import { isNumeric } from 'pangcg-components';

isNumeric('123'); // true
isNumeric('abc'); // false
`,paraId:25,tocIndex:22},{value:"\u68C0\u67E5\u503C\u662F\u5426\u4E3A\u7A7A\uFF08\u652F\u6301\u5B57\u7B26\u4E32\u3001\u6570\u7EC4\u3001\u5BF9\u8C61\u7B49\u7C7B\u578B\uFF09\u3002",paraId:26,tocIndex:23},{value:`function isEmpty(value: any): boolean;
`,paraId:27,tocIndex:23},{value:"value",paraId:28,tocIndex:24},{value:": \u8981\u68C0\u67E5\u7684\u503C",paraId:28,tocIndex:24},{value:"boolean",paraId:29,tocIndex:25},{value:": \u5982\u679C\u503C\u4E3A\u7A7A\u8FD4\u56DE ",paraId:29,tocIndex:25},{value:"true",paraId:29,tocIndex:25},{value:"\uFF0C\u5426\u5219\u8FD4\u56DE ",paraId:29,tocIndex:25},{value:"false",paraId:29,tocIndex:25},{value:`import { isEmpty } from 'pangcg-components';

isEmpty(''); // true
isEmpty([]); // true
isEmpty({}); // true
isEmpty(null); // true
isEmpty(undefined); // true
isEmpty('hello'); // false
isEmpty([1, 2, 3]); // false
isEmpty({ key: 'value' }); // false
`,paraId:30,tocIndex:26},{value:"\u751F\u6210 32 \u4F4D\u968F\u673A\u5B57\u7B26\u4E32\uFF08\u5305\u542B\u6570\u5B57\u548C\u5B57\u6BCD\uFF09\u3002",paraId:31,tocIndex:27},{value:`function generateUUID(): string;
`,paraId:32,tocIndex:27},{value:"\u65E0",paraId:33,tocIndex:28},{value:"string",paraId:34,tocIndex:29},{value:": \u8FD4\u56DE 32 \u4F4D\u968F\u673A\u5B57\u7B26\u4E32",paraId:34,tocIndex:29},{value:`import { generateUUID } from 'pangcg-components';

// \u751F\u6210\u552F\u4E00ID
const id = generateUUID();
// \u4F8B\u5982: "8fA2Tq7pX3nKc9LzEjR6Vb1mD4sG5oYh"

// \u5728\u8868\u5355\u4E2D\u4F7F\u7528
const form = {
  id: generateUUID(),
  name: 'John Doe',
  email: 'john@example.com',
};

// \u5728DOM\u5143\u7D20\u4E2D\u4F7F\u7528
const element = document.createElement('div');
element.id = generateUUID();

// \u751F\u6210\u4E34\u65F6\u4F1A\u8BDDID
const sessionId = generateUUID();

// \u751F\u6210\u6587\u4EF6\u540D
const fileName = \`report-\${generateUUID()}.pdf\`;
`,paraId:35,tocIndex:30}]},29839:function(t,a,n){n.r(a),n.d(a,{texts:function(){return e}});var o=n(81294);const e=[{value:"pangcg-components \u662F\u4E00\u4E2A\u73B0\u4EE3\u5316\u7684\u524D\u7AEF\u7EC4\u4EF6\u5E93\u548C\u5DE5\u5177\u51FD\u6570\u5E93\uFF0C\u63D0\u4F9B\u4E86\u4E00\u7CFB\u5217\u5E38\u7528\u7684\u7EC4\u4EF6\u548C\u5DE5\u5177\u51FD\u6570\uFF0C\u5E2E\u52A9\u4F60\u66F4\u9AD8\u6548\u5730\u5F00\u53D1\u524D\u7AEF\u5E94\u7528\u3002",paraId:0,tocIndex:1},{value:"\u{1F680} \u7B80\u5355\u6613\u7528\uFF1A\u63D0\u4F9B\u76F4\u89C2\u7684 API\uFF0C\u6613\u4E8E\u4E0A\u624B",paraId:1,tocIndex:2},{value:"\u{1F4E6} \u8F7B\u91CF\u7EA7\uFF1A\u6309\u9700\u5F15\u5165\uFF0C\u4F53\u79EF\u5C0F\u5DE7",paraId:1,tocIndex:2},{value:"\u{1F527} \u7C7B\u578B\u5B89\u5168\uFF1A\u4F7F\u7528 TypeScript \u7F16\u5199\uFF0C\u63D0\u4F9B\u5B8C\u6574\u7684\u7C7B\u578B\u5B9A\u4E49",paraId:1,tocIndex:2},{value:"\u{1F4DD} \u6587\u6863\u5B8C\u5584\uFF1A\u8BE6\u7EC6\u7684\u6587\u6863\u548C\u793A\u4F8B",paraId:1,tocIndex:2},{value:"\u4F7F\u7528\u4F60\u559C\u6B22\u7684\u5305\u7BA1\u7406\u5668\u5B89\u88C5\uFF1A",paraId:2,tocIndex:3},{value:`npm install pangcg-components --save
`,paraId:3},{value:`cnpm install pangcg-components --save
`,paraId:4},{value:`yarn add pangcg-components --save
`,paraId:5},{value:`pnpm add pangcg-components --save
`,paraId:6}]},51446:function(t,a,n){n.r(a),n.d(a,{texts:function(){return e}});var o=n(68537);const e=[]}}]);
