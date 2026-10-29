# radio input
![tests](https://github.com/substrate-system/radio-input/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@substrate-system/radio-input?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![install size](https://packagephobia.com/badge?p=@substrate-system/radio-input)](https://packagephobia.com/result?p=@substrate-system/radio-input)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

Radio inputs with some style. [See a live demo](https://substrate-system.github.io/radio-input/)

<!-- toc -->

- [install](#install)
- [API](#api)
  * [ESM](#esm)
  * [attributes](#attributes)
  * [Render the markup yourself](#render-the-markup-yourself)
  * [JavaScript API](#javascript-api)
- [CSS](#css)
  * [Import CSS](#import-css)
  * [CSS variables](#css-variables)
- [Example](#example)
  * [HTML](#html)
  * [pre-built](#pre-built)

<!-- tocstop -->

## install

```sh
npm i -S @substrate-system/radio-input
```

## API

This exposes ESM and common JS via [package.json `exports` field](https://nodejs.org/api/packages.html#exports). Just import the package, then use the tag, `<radio-input>`, in HTML.

### ESM
```js
import '@substrate-system/radio-input'
import '@substrate-system/radio-input/css'
// or minified CSS
import '@substrate-system/radio-input/css/min'
```

### attributes

In addition to standard `input[type=radio]` attributes, you can pass in the following

#### `label`
Pass in some text to use as the label element. It is rendered as text,
not HTML.

Without a `label`, a bare `<input>` is rendered. Give it an accessible
name with `aria-label` or `aria-labelledby`.

```html
<radio-input name="size" value="s" aria-label="Small"></radio-input>
```

#### forwarded attributes

These are copied to the inner `<input>` and stay on the host. Removing
one from the host removes it from the input too:

`name`, `value`, `checked`, `disabled`, `required`, and `form`.

These describe the focusable control, so they are moved to the inner
`<input>` and removed from the host. That happens when the element
renders, and again whenever one is set on the host later:

`id`, `tabindex`, `autofocus`, and every `aria-*` attribute.

Because they are moved, removing one from the host afterwards does
nothing: it is no longer there. To set and clear these from a
framework, use the [`controlAttributes`](#controlattributes) property,
or change the inner input directly with the `control` property. When
you [render the markup yourself](#render-the-markup-yourself), nothing
is moved: put these attributes on your `<input>` directly.

### Render the markup yourself

If the host already contains an `<input type="radio">` when it
connects, the element keeps that node and only adds behavior. Nothing
is replaced. Use this with a framework like Preact, so the framework
owns every node.

```html
<radio-input name="size">
  <label class="radio-input">
    <input type="radio" value="s">
    <span>Small</span>
  </label>
</radio-input>
```

Use the `radio-input` class on the label to get the default layout.
The `label` attribute is ignored in this case, and the inner input's
own attributes are left alone.

### JavaScript API

```js
const radio = document.querySelector('radio-input')

// Get/set the current checked state of the inner input
console.log(radio.checked)  // false
radio.checked = true

// Get/set value
console.log(radio.value)  // "example1"
radio.value = "example3"

// Get/set disabled state
console.log(radio.disabled)  // false
radio.disabled = true

// The inner input
radio.control?.setAttribute('aria-invalid', 'true')

// Get/set the id of the inner input
console.log(radio.inputId)  // ""
radio.inputId = "my-radio"
```

The `checked` attribute sets the default state, like it does on a
native input. Once someone picks a radio, use the `checked` property
to read or change the current state.

#### `controlAttributes`

Use this property to set and clear the inner input's `aria-*`,
`tabindex`, and `autofocus` from a framework. Each value you set
replaces the last one, so a name it no longer lists is removed from the
input. `null` clears everything it set. Write names as lowercase
attribute names, like `tabindex`, not `tabIndex`. Other names,
including `id`, are ignored; use `inputId` for the id.

Values are written the way Preact writes attributes. `null` and
`undefined` remove the attribute. For `aria-*`, `true` and `false`
become `"true"` and `"false"`. For other names, `true` adds the
attribute and `false` removes it.

```js
import { html } from 'htm/preact'

function Choice ({ bad }) {
    return html`<radio-input
        name="size"
        value="s"
        label="Small"
        controlAttributes=${{ 'aria-invalid': bad }}
    ></radio-input>`
}
```

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

These variables are shared with the other `@substrate-system` form
controls, so an app can set them once. Each one has a fallback.

```css
:root {
    --substrate-accent: currentColor;  /* the checked dot */
    --substrate-surface: #fff;  /* the circle background */
    --substrate-border: currentColor;  /* the circle border */
    --substrate-focus: currentColor;  /* focus ring color */
    --substrate-focus-width: 2px;  /* focus ring width */
}
```

`--form-control-color` still works as a fallback for
`--substrate-accent`.

The label text inherits its font size.

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

### pre-built
This package exposes minified JS and CSS files too. Copy them to a location that is
accessible to your web server, then link to them in HTML.

#### copy
```sh
cp ./node_modules/@substrate-system/radio-input/dist/index.min.js ./public/radio-input.min.js
cp ./node_modules/@substrate-system/radio-input/dist/style.min.css ./public/radio-input.min.css
```

#### HTML
```html
<head>
    <link rel="stylesheet" href="./radio-input.min.css">
</head>
<body>
    <!-- ... -->
    <script type="module" src="./radio-input.min.js"></script>
</body>
```
