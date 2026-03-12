import { WebComponent, define } from '@substrate-system/web-component'
import {
    toAttributes,
    type Attrs
} from '@substrate-system/web-component/attributes'

// for docuement.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'radio-input':RadioInput
    }
}

const FORM_ATTRS = [
    'name', 'id', 'value', 'checked', 'disabled',
    'required', 'form', 'autofocus', 'tabindex',
] as const

export class RadioInput extends WebComponent.create('radio-input') {
    static TAG:string = 'radio-input'
    _forwarding = false

    static get observedAttributes () {
        return ['label', ...FORM_ATTRS]
    }

    handleChange_label (_oldValue:string, newValue:string) {
        if (newValue === null) return
        const label = this.querySelector('label')
        if (!label) return
        label.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent =
                    `\n            ${newValue}\n        `
            }
        })
    }

    async attributeChangedCallback (
        name:string,
        oldValue:string,
        newValue:string
    ) {
        if (this._forwarding) return

        if ((FORM_ATTRS as readonly string[]).includes(name)) {
            const input = this.querySelector('input')
            if (!input) return
            this._forwarding = true
            if (newValue === null) {
                input.removeAttribute(name)
            } else {
                input.setAttribute(name, newValue)
            }
            this.removeAttribute(name)
            this._forwarding = false
            return
        }

        const handler = this[`handleChange_${name}`]
        if (handler) {
            handler.call(this, oldValue, newValue)
        } else {
            this.render()
        }
    }

    connectedCallback () {
        this.render()
    }

    render () {
        const labelText = this.getAttribute('label')
        if (!labelText) return

        const inputAttrs:Attrs = {}
        for (const attr of FORM_ATTRS) {
            if (this.hasAttribute(attr)) {
                inputAttrs[attr] =
                    this.getAttribute(attr) || ''
            }
        }

        this.innerHTML = `<label class="radio-input">
            <input type="radio"
                ${toAttributes(inputAttrs)} />
            ${labelText}
        </label>`

        this._forwarding = true
        for (const attr of FORM_ATTRS) {
            this.removeAttribute(attr)
        }
        this._forwarding = false
    }
}

define(RadioInput.TAG, RadioInput)
