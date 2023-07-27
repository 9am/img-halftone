<div align="center">
	<img src="https://github.com/9am/9am.github.io/assets/1435457/3310c374-8cd7-4c2b-ad68-c349ede61598" alt="img-tissue" width="180" height="180" />
	<h1>&lt;img-halftone&gt;</h1>
	<p>A web component turns &lt;img&gt; into halftone.🥑</p>
</div>

## Features
- Print halftone image with **CMYK**.
- Halftone is performed in **web worker**.
- Render with **Canvas** or **HTML element**.
- A className **`loading`** on the host to indicate processing.

## Demo
[**codepen**](https://codepen.io/9am/pen/jOQdrmX)

## Usage

#### Install

```
npm install @9am/img-halftone
```

#### JavaScript
```js
import '@9am/img-halftone'
```

#### HTML

```html
<img-halftone src="img.png"></img-halftone>
```

## Documentation

### &lt;img-halftone&gt; attributes

|Name|Type|Default|Description|
|:--:|:--:|:-----:|:----------|
|`src`|{string}|**Required**|The image URL|
|`varient`|{canvas \| grid}|canvas|The Render type (Notice: using 'grid' with small cellsize will cause layout performance problem.)|
|`cellsize`|{number}|4|The cell size for each dot in pixel|

## License
[MIT](LICENSE)
