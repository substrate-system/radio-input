# radio input
![tests](https://github.com/substrate-system/radio-input/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@substrate-system/radio-input?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![install size](https://packagephobia.com/badge?p=@substrate-system/radio-input)](https://packagephobia.com/result?p=@substrate-system/radio-input)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

Radio inputs with some style.

[See a live demo](https://substrate-system.github.io/radio-input/)

<!-- toc -->

## install

```sh
npm i -S @substrate-system/radio-input
```

## API

This exposes ESM and common JS via [package.json `exports` field](https://nodejs.org/api/packages.html#exports).

### ESM
```js
import '@substrate-system/radio-input'
```

### attributes

In addition to standard `input[type=radio]` attributes, you can pass in the following

#### `label`
Pass in some text to use as the label element.

## CSS

### Import CSS

```js
import '@substrate-system/radio-input/css'
```

Or minified:
```js
import '@substrate-system/radio-input/css/min'
```

### CSS variables
Override these to customize

```css
radio-input {
    --form-control-color: #4281CB;
}
```

## Example
This calls the global function `customElements.define`. Just import, then use
the tag in your HTML.

```js
import '@substrate-system/radio-input'
import '@substrate-system/radio-input/css'
```

### HTML
```html
<form>
    <radio-input
        name="example"
        value="example1"
        label="example one"
    ></radio-input>
    <radio-input
        name="example"
        value="example2"
        label="example two"
    ></radio-input>

    <button type="submit">submit</button>
</form>
```

### pre-built JS
This package exposes minified JS files too. Copy them to a location that is
accessible to your web server, then link to them in HTML.

#### copy
```sh
cp ./node_modules/@substrate-system/radio-input/dist/index.min.js ./public/radio-input.min.js
```

#### HTML
```html
<script type="module" src="./radio-input.min.js"></script>
```
