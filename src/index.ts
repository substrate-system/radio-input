import {
    toAttributes,
    type Attrs
} from '@substrate-system/web-component/attributes'
import { define } from '@substrate-system/web-component/util'

// for docuement.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'radio-input': RadioInput
    }
}

export class RadioInput extends HTMLElement {
    static observedAttributes = ['label', 'name', 'value', 'checked']

    handleChange_label (oldValue:string, newValue:string) {
        if (newValue === null) return
        const label = this.querySelector('label')
        if (!label) return
        label.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = `\n            ${newValue}\n        `
            }
        })
    }

    attributeChangedCallback (
        name:string,
        oldValue:string,
        newValue:string
    ) {
        const handler = this[`handleChange_${name}`]
        if (handler) {
            handler.call(this, oldValue, newValue)
        } else {
            this.render()
        }
    }

    disconnectedCallback () {
    }

    connectedCallback () {
        this.render()
    }

    render () {
        const labelText = this.getAttribute('label')
        if (!labelText) return

        const obj:Attrs = {}
        for (const attr of Array.from(this.attributes)) {
            obj[attr.name] = attr.value
        }

        this.innerHTML = `<label class="radio-input">
            <input type="radio" ${toAttributes(obj)} />
            ${labelText}
        </label>`
    }
}

define('radio-input', RadioInput)
