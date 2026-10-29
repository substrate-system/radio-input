import { WebComponent, define } from '@substrate-system/web-component'

// for docuement.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'radio-input':RadioInput
    }
}

/**
 * Host attributes that are mirrored onto the inner input. They stay on the
 * host, so a framework that later removes one from the host also removes it
 * from the input.
 */
const MIRRORED = [
    'name', 'value', 'checked', 'disabled', 'required', 'form',
]

/**
 * Host attributes that describe the focusable control, so they are moved to
 * the inner input when this element renders it. `aria-*` attributes are
 * moved too. Left on the host, these would make a second tab stop, or fail
 * axe's `aria-prohibited-attr`, because the host has no role.
 */
const MOVED = ['id', 'tabindex', 'autofocus']

/**
 * Attributes for the inner input, keyed by name. Values follow Preact:
 * `null` and `undefined` remove the attribute, `aria-*` booleans become
 * `"true"` and `"false"`, and for other names `true` is present and
 * `false` removes it.
 */
export type ControlAttributes = Record<
    string,
    string|number|boolean|null|undefined
>

/**
 * The names `controlAttributes` accepts. `id` goes through `inputId`.
 */
function isControlName (name:string):boolean {
    return name === 'tabindex' ||
        name === 'autofocus' ||
        name.startsWith('aria-')
}

/**
 * The attribute value Preact would write, or `null` to remove it.
 */
function attributeValue (
    name:string,
    value:ControlAttributes[string]
):string|null {
    if (value === null || value === undefined) return null
    if (typeof value === 'boolean') {
        if (name.startsWith('aria-')) return String(value)
        return value ? '' : null
    }
    return String(value)
}

export class RadioInput extends WebComponent.create('radio-input') {
    static TAG:string = 'radio-input'
    private _input:HTMLInputElement|null = null
    // true if this element created the inner markup, false if it hydrated
    // markup that was already there
    private _ownsMarkup = false
    // moves control attributes set on the host after render
    private _observer = new MutationObserver(() => this._moveFromHost())
    private _controlAttributes:ControlAttributes = {}
    // names that `controlAttributes` put on the input last time
    private _appliedControl:string[] = []

    static get observedAttributes () {
        return ['label', ...MIRRORED]
    }

    /**
     * The inner input. Use it to change a moved attribute, like `aria-*` or
     * `tabindex`, after connect.
     */
    get control ():HTMLInputElement|null {
        return this._input
    }

    /**
     * The `id` of the inner input. Before the element renders, this is the
     * host `id`, which is moved to the input on render.
     */
    get inputId ():string {
        return this._input ? this._input.id : this.id
    }

    set inputId (value:string) {
        if (this._input) {
            this._input.id = value
        } else {
            this.id = value
        }
    }

    /**
     * Attributes for the inner input: `aria-*`, `tabindex`, and
     * `autofocus`. Setting this replaces the last value, so a name it no
     * longer lists is removed from the input. `null` clears them all.
     */
    get controlAttributes ():ControlAttributes {
        return { ...this._controlAttributes }
    }

    set controlAttributes (value:ControlAttributes|null) {
        this._controlAttributes = (value && typeof value === 'object') ?
            { ...value } :
            {}
        this._applyControlAttributes()
    }

    /**
     * The current checked state of the inner input. Before render, this
     * reads and writes the host `checked` attribute.
     */
    get checked ():boolean {
        return this._input ?
            this._input.checked :
            this.hasAttribute('checked')
    }

    set checked (value:boolean) {
        if (this._input) {
            this._input.checked = value
        } else {
            this.toggleAttribute('checked', !!value)
        }
    }

    get value ():string {
        return this._input ?
            this._input.value :
            (this.getAttribute('value') ?? '')
    }

    set value (value:string) {
        if (this._input) {
            this._input.value = value
        } else {
            this.setAttribute('value', value)
        }
    }

    get disabled ():boolean {
        return this._input ?
            this._input.disabled :
            this.hasAttribute('disabled')
    }

    set disabled (value:boolean) {
        if (this._input) {
            this._input.disabled = value
        } else {
            this.toggleAttribute('disabled', !!value)
        }
    }

    attributeChangedCallback (
        name:string,
        _oldValue:string|null,
        newValue:string|null
    ) {
        if (!this._input) return

        if (name === 'label') {
            if (this._ownsMarkup) this._renderLabel(newValue?.trim() ?? '')
            return
        }

        this._forward(name, newValue)
    }

    connectedCallback () {
        // A value set before this element upgraded is an own property that
        // hides the accessor. Remove it and set it again through the class.
        if (Object.prototype.hasOwnProperty.call(this, 'controlAttributes')) {
            const value = Reflect.get(this, 'controlAttributes')
            Reflect.deleteProperty(this, 'controlAttributes')
            this.controlAttributes = value
        }

        this.render()
        if (this._ownsMarkup) {
            // Attributes set while disconnected were not observed
            this._moveFromHost()
            // No attribute filter, because `aria-*` names are open
            this._observer.observe(this, { attributes: true })
        }
    }

    disconnectedCallback () {
        this._observer.disconnect()
    }

    /**
     * Move control attributes from the host to the inner input. Removing
     * one from the host is itself a mutation, but the next call finds
     * nothing left to move.
     */
    private _moveFromHost () {
        const input = this._input
        if (!input) return

        for (const { name, value } of Array.from(this.attributes)) {
            if (!MOVED.includes(name) && !name.startsWith('aria-')) continue
            this.removeAttribute(name)
            if (name === 'id') {
                this.inputId = value
            } else {
                input.setAttribute(name, value)
            }
        }
    }

    /**
     * Copy one host attribute onto the inner input.
     */
    private _forward (name:string, value:string|null) {
        const input = this._input
        if (!input) return

        if (value === null) {
            input.removeAttribute(name)
        } else {
            input.setAttribute(name, value)
        }
    }

    /**
     * Write `controlAttributes` to the inner input, and remove the names
     * it set last time but no longer lists.
     */
    private _applyControlAttributes () {
        const input = this._input
        if (!input) return

        const applied:string[] = []
        for (const [name, value] of Object.entries(this._controlAttributes)) {
            if (!isControlName(name)) continue
            const attr = attributeValue(name, value)
            if (attr === null) {
                input.removeAttribute(name)
            } else {
                input.setAttribute(name, attr)
                applied.push(name)
            }
        }

        for (const name of this._appliedControl) {
            if (!applied.includes(name)) input.removeAttribute(name)
        }
        this._appliedControl = applied
    }

    private _forwardMirrored () {
        for (const name of MIRRORED) {
            if (this.hasAttribute(name)) {
                this._forward(name, this.getAttribute(name))
            }
        }
    }

    private _renderLabel (labelText:string) {
        const input = this._input!

        if (labelText === '') {
            this.replaceChildren(input)
            return
        }

        const span = this.querySelector('label.radio-input > span')
        if (span && input.parentElement === span.parentElement) {
            span.textContent = labelText
            return
        }

        const label = document.createElement('label')
        label.className = 'radio-input'
        const newSpan = document.createElement('span')
        newSpan.textContent = labelText
        label.append(input, newSpan)
        this.replaceChildren(label)
    }

    render () {
        // Hydrate if the markup is already here, so a framework that
        // rendered it keeps ownership of every node.
        const existing = this.querySelector<HTMLInputElement>(
            'input[type="radio"]'
        )

        // When hydrating, leave the input's own attributes alone. The
        // framework that rendered it should set `aria-*`, `id`, and the rest
        // on the input directly.
        if (existing) {
            this._input = existing
            this._forwardMirrored()
            this._applyControlAttributes()
            return
        }

        const input = document.createElement('input')
        input.type = 'radio'
        this._input = input
        this._ownsMarkup = true

        // Before the input is in the DOM, so `autofocus` takes effect
        this._forwardMirrored()
        this._moveFromHost()
        this._applyControlAttributes()

        this._renderLabel(this.getAttribute('label')?.trim() ?? '')
    }
}

define(RadioInput.TAG, RadioInput)
