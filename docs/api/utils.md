---
toc: content #在页面右侧展示锚点链接
---

# 通用 API

## 概述

提供了一系列常用的数据验证函数，包括邮箱、手机号、身份证号、URL 等验证。

## 函数列表

### isEmail

验证字符串是否为有效的邮箱地址。

```typescript
function isEmail(value: string): boolean;
```

#### 参数

- `value`: 要验证的字符串

#### 返回值

- `boolean`: 如果是有效的邮箱地址返回 `true`，否则返回 `false`

#### 示例

```typescript
import { isEmail, EMAIL_PATTERN } from 'pangcg-components';

isEmail('test@example.com'); // true
isEmail('invalid-email'); // false

// 直接使用正则表达式
EMAIL_PATTERN.test('test@example.com'); // true
```

### isPhoneNumber

验证字符串是否为有效的手机号码（中国大陆）。

```typescript
function isPhoneNumber(value: string): boolean;
```

#### 参数

- `value`: 要验证的字符串

#### 返回值

- `boolean`: 如果是有效的手机号码返回 `true`，否则返回 `false`

#### 示例

```typescript
import { isPhoneNumber, PHONE_NUMBER_PATTERN } from 'pangcg-components';

isPhoneNumber('13812345678'); // true
isPhoneNumber('12345'); // false

// 直接使用正则表达式
PHONE_NUMBER_PATTERN.test('13812345678'); // true
```

### isURL

验证字符串是否为有效的 URL 地址。

```typescript
function isURL(value: string): boolean;
```

#### 参数

- `value`: 要验证的字符串

#### 返回值

- `boolean`: 如果是有效的 URL 返回 `true`，否则返回 `false`

#### 示例

```typescript
import { isURL } from 'pangcg-components';

isURL('https://example.com'); // true
isURL('invalid-url'); // false
```

### isIDCard

验证字符串是否为有效的身份证号码（中国大陆）。

```typescript
function isIDCard(value: string): boolean;
```

#### 参数

- `value`: 要验证的字符串

#### 返回值

- `boolean`: 如果是有效的身份证号码返回 `true`，否则返回 `false`

#### 示例

```typescript
import { isIDCard, ID_CARD_PATTERN } from 'pangcg-components';

isIDCard('110101199003077890'); // true
isIDCard('12345'); // false

// 直接使用正则表达式
ID_CARD_PATTERN.test('110101199003077890'); // true
```

### isNumeric

验证值是否为数字。

```typescript
function isNumeric(value: any): boolean;
```

#### 参数

- `value`: 要验证的值

#### 返回值

- `boolean`: 如果是数字返回 `true`，否则返回 `false`

#### 示例

```typescript
import { isNumeric } from 'pangcg-components';

isNumeric('123'); // true
isNumeric('abc'); // false
```

### isEmpty

检查值是否为空（支持字符串、数组、对象等类型）。

```typescript
function isEmpty(value: any): boolean;
```

#### 参数

- `value`: 要检查的值

#### 返回值

- `boolean`: 如果值为空返回 `true`，否则返回 `false`

#### 示例

```typescript
import { isEmpty } from 'pangcg-components';

isEmpty(''); // true
isEmpty([]); // true
isEmpty({}); // true
isEmpty(null); // true
isEmpty(undefined); // true
isEmpty('hello'); // false
isEmpty([1, 2, 3]); // false
isEmpty({ key: 'value' }); // false
```

### generateUUID

生成 32 位随机字符串（包含数字和字母）。

```typescript
function generateUUID(): string;
```

#### 参数

无

#### 返回值

- `string`: 返回 32 位随机字符串

#### 示例

```typescript
import { generateUUID } from 'pangcg-components';

// 生成唯一ID
const id = generateUUID();
// 例如: "8fA2Tq7pX3nKc9LzEjR6Vb1mD4sG5oYh"

// 在表单中使用
const form = {
  id: generateUUID(),
  name: 'John Doe',
  email: 'john@example.com',
};

// 在DOM元素中使用
const element = document.createElement('div');
element.id = generateUUID();

// 生成临时会话ID
const sessionId = generateUUID();

// 生成文件名
const fileName = `report-${generateUUID()}.pdf`;
```
