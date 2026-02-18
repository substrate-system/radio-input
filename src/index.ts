import {
    toAttributes,
    type Attrs
} from '@substrate-system/web-component/attributes'

// for docuement.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'radio-input': RadioInput
    }
}

export class RadioInput extends HTMLElement {
    constructor () {
        super()

        const labelText = this.getAttribute('label')
        if (!labelText) throw new Error('Missing label')

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

customElements.define('radio-input', RadioInput)
