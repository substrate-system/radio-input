import { attributesAsObject, setAttributes } from '@substrate-system/util'

// for docuement.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'radio-input': RadioInput
    }
}

export class RadioInput extends HTMLElement {
    connectedCallback () {
        if (this.innerHTML) return
        const attrs = Array.from(this.attributes)
        const obj = attributesAsObject(attrs)
        const labelText = this.getAttribute('label')

        if (!labelText) throw new Error('Missing label')

        this.innerHTML = `<label class="radio-input">
            <input type="radio" />
            ${labelText}
        </label>`

        const input = this.querySelector('input')!
        setAttributes(input, obj)
    }
}

customElements.define('radio-input', RadioInput)
