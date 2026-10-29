import { test } from '@substrate-system/tapzero'
import { waitFor } from '@substrate-system/dom'
import { type RadioInput } from '../src/index.js'
import '../src/index.js'

test('radio-input', async t => {
    document.body.innerHTML += `
        <radio-input
            name="example"
            value="example1"
            label="example one"
        ></radio-input>
    `

    const el = await waitFor('radio-input input[type="radio"]')
    t.ok(el, 'should find a radio input')
    t.equal(el?.getAttribute('name'), 'example', 'should pass `name` to input')
    const label = await waitFor('radio-input label')
    t.ok(label, 'should create a label tag if you pass in the label attribute')
})

test('label attribute is rendered as text', async t => {
    const el = document.createElement('radio-input')
    el.setAttribute('label', '<img src="x" onerror="window.__xss = 1">')
    document.body.replaceChildren(el)
    await waitFor('radio-input input')

    t.equal(el.querySelectorAll('img').length, 0, 'no img element is created')
    t.equal(el.querySelector('label span')?.textContent,
        el.getAttribute('label'), 'label text comes from the attribute')
})

test('renders a bare input without a label', async t => {
    document.body.innerHTML = '<radio-input name="a" aria-label="A">' +
        '</radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    const input = el.querySelector('input[type="radio"]')

    t.ok(input, 'renders the input')
    t.equal(el.querySelector('label'), null, 'no label element')
    t.equal(input?.getAttribute('aria-label'), 'A', 'input gets aria-label')
})

test('changing the label attribute keeps the same input', async t => {
    document.body.innerHTML = '<radio-input label="One"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    const input = el.querySelector('input') as HTMLInputElement

    el.setAttribute('label', 'Two')
    t.equal(el.querySelector('span')?.textContent, el.getAttribute('label'),
        'label text updates')
    t.equal(el.querySelector('input'), input, 'input node is kept')

    el.removeAttribute('label')
    t.equal(el.querySelector('label'), null, 'label is removed')
    t.equal(el.querySelector('input'), input, 'input node is still kept')

    el.setAttribute('label', 'Three')
    t.equal(el.querySelector('input')?.labels?.length, 1,
        'adding a label again labels the input')
    t.equal(el.querySelector('input'), input, 'input node is still kept')
})

test('mirrored attributes stay on the host, including removal',
    async t => {
        document.body.innerHTML = '<radio-input label="x" disabled ' +
            'required form="f" value="v"></radio-input>'
        const el = await waitFor('radio-input') as RadioInput
        const input = el.querySelector('input') as HTMLInputElement

        t.equal(input.disabled, true, 'disabled is forwarded')
        t.equal(input.required, true, 'required is forwarded')
        t.equal(input.getAttribute('form'), 'f', 'form is forwarded')
        t.equal(input.value, 'v', 'value is forwarded')
        t.ok(el.hasAttribute('disabled'), 'host keeps disabled')
        t.ok(el.hasAttribute('required'), 'host keeps required')

        el.removeAttribute('disabled')
        el.removeAttribute('required')
        el.removeAttribute('form')
        el.removeAttribute('value')
        t.equal(input.disabled, false, 'input is no longer disabled')
        t.equal(input.required, false, 'required is removed')
        t.ok(!input.hasAttribute('form'), 'form is removed')
        t.ok(!input.hasAttribute('value'), 'value is removed')
    })

test('focus and aria-* attributes move to the inner input', async t => {
    document.body.innerHTML = '<radio-input label="Show metric" ' +
        'aria-describedby="hint" tabindex="0" id="metric" autofocus>' +
        '</radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    const input = el.querySelector('input') as HTMLInputElement

    t.equal(input.getAttribute('aria-describedby'), 'hint',
        'input gets aria-describedby')
    t.equal(input.tabIndex, 0, 'input gets tabindex')
    t.equal(input.id, 'metric', 'input gets the id')
    t.ok(input.hasAttribute('autofocus'), 'input gets autofocus')

    t.ok(!el.hasAttribute('aria-describedby'),
        'host no longer has aria-describedby')
    t.ok(!el.hasAttribute('tabindex'), 'host no longer has tabindex')
    t.ok(!el.hasAttribute('id'), 'host no longer has the id')
    t.ok(!el.hasAttribute('autofocus'), 'host no longer has autofocus')
})

test('hydrates existing markup without replacing the input', async t => {
    const el = document.createElement('radio-input')
    el.setAttribute('name', 'metric')
    el.setAttribute('label', 'ignored')
    const label = document.createElement('label')
    label.className = 'radio-input'
    const input = document.createElement('input')
    input.type = 'radio'
    const span = document.createElement('span')
    span.textContent = 'Show metric'
    label.append(input, span)
    el.append(label)

    let clicks = 0
    input.addEventListener('click', () => clicks++)

    document.body.replaceChildren(el)
    await waitFor('radio-input')

    t.equal(el.querySelector('input'), input, 'same input node is kept')
    t.equal(el.querySelector('label'), label, 'same label node is kept')
    t.equal(el.querySelector('span'), span, 'same span node is kept')
    t.equal(el.querySelectorAll('input').length, 1, 'no extra input')
    t.equal(input.name, 'metric', 'host name is forwarded')

    input.click()
    t.equal(clicks, 1, 'listener attached before connecting still fires')
    t.equal(el.checked, true, 'host.checked reads the hydrated input')
})

test('hydration does not restore removed attributes', async t => {
    const el = document.createElement('radio-input')
    const input = document.createElement('input')
    input.type = 'radio'
    input.setAttribute('aria-invalid', 'true')
    el.append(input)

    document.body.replaceChildren(el)
    await waitFor('radio-input')

    t.equal(input.getAttribute('aria-invalid'), 'true',
        'the input keeps its own attributes')
    input.removeAttribute('aria-invalid')
    el.setAttribute('name', 'metric')
    t.ok(!input.hasAttribute('aria-invalid'),
        'aria-invalid is not added back')
})

test('checked, value, and disabled properties', async t => {
    document.body.innerHTML = `
        <radio-input name="group" value="a" label="A"></radio-input>
        <radio-input name="group" value="b" label="B"></radio-input>
    `
    await waitFor('radio-input input')
    const [a, b] = Array.from(document.querySelectorAll('radio-input'))
    const inputA = a.querySelector('input') as HTMLInputElement

    a.checked = true
    t.equal(inputA.checked, true, 'setting checked checks the input')
    t.equal(a.checked, true, 'checked reads the input')

    b.querySelector('input')?.click()
    t.equal(b.checked, true, 'the clicked radio is checked')
    t.equal(a.checked, false, 'the other radio reads as unchecked')

    a.value = 'c'
    t.equal(inputA.value, 'c', 'setting value changes the input')
    t.equal(a.value, 'c', 'value reads the input')

    a.disabled = true
    t.equal(inputA.disabled, true, 'setting disabled disables the input')
    a.disabled = false
    t.equal(inputA.disabled, false, 'unsetting disabled enables the input')
})

test('properties set before render end up on the input', async t => {
    const el = document.createElement('radio-input')
    el.checked = true
    el.disabled = true
    el.value = 'early'
    document.body.replaceChildren(el)
    await waitFor('radio-input input')

    const input = el.control as HTMLInputElement
    t.equal(input.checked, true, 'input is checked')
    t.equal(input.disabled, true, 'input is disabled')
    t.equal(input.value, 'early', 'input has the value')
})

test('control and inputId expose the inner input', async t => {
    document.body.innerHTML = '<radio-input id="first"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    const input = el.querySelector('input') as HTMLInputElement

    t.equal(el.control, input, 'control is the inner input')
    t.equal(el.inputId, 'first', 'inputId reads the inner id')

    el.inputId = 'second'
    t.equal(input.id, 'second', 'setting inputId changes the inner id')
    t.equal(el.id, '', 'host still has no id')
})

test('inputId set before render ends up on the inner input', async t => {
    const el = document.createElement('radio-input')
    el.inputId = 'early'
    document.body.replaceChildren(el)
    await waitFor('radio-input input')

    t.equal(el.control?.id, 'early', 'inner input has the id')
    t.equal(el.id, '', 'host has no id')
})

/** Let pending MutationObserver callbacks run */
function mutations ():Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
}

test('a control attribute set after render moves too', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="Late"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.setAttribute('aria-invalid', 'true')
    el.setAttribute('tabindex', '-1')
    await mutations()
    t.equal(el.control!.getAttribute('aria-invalid'), 'true',
        'input gets aria-invalid')
    t.equal(el.control!.getAttribute('tabindex'), '-1',
        'input gets tabindex')
    t.ok(!el.hasAttribute('aria-invalid'), 'host has no aria-invalid')
    t.ok(!el.hasAttribute('tabindex'), 'host has no tabindex')
})

test('an id set after render moves to the input', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="Id"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.id = 'late'
    await mutations()
    t.equal(el.control!.id, 'late', 'input has the id')
    t.equal(el.id, '', 'host has no id')
})

test('a reconnected radio-input still moves attributes', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="Again"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.remove()
    document.body.append(el)
    el.setAttribute('aria-describedby', 'hint')
    await mutations()
    t.equal(el.control!.getAttribute('aria-describedby'), 'hint',
        'input gets aria-describedby')
    t.ok(!el.hasAttribute('aria-describedby'), 'host does not keep it')
})

test('hydration does not move attributes set after render', async t => {
    const el = document.createElement('radio-input') as RadioInput
    const input = document.createElement('input')
    input.type = 'radio'
    el.append(input)
    document.body.replaceChildren(el)
    await waitFor('radio-input')
    el.setAttribute('aria-invalid', 'true')
    await mutations()
    t.ok(!input.hasAttribute('aria-invalid'), 'app input is untouched')
})

test('controlAttributes puts attributes on the input only', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="Prop"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.controlAttributes = { 'aria-describedby': 'hint', tabindex: 0 }
    t.equal(el.control!.getAttribute('aria-describedby'), 'hint',
        'input gets aria-describedby')
    t.equal(el.control!.getAttribute('tabindex'), '0', 'input gets tabindex')
    t.ok(!el.hasAttribute('aria-describedby'), 'host does not')
})

test('controlAttributes removes a name it no longer lists', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="Drop"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.controlAttributes = { 'aria-invalid': 'true', 'aria-label': 'x' }
    el.controlAttributes = { 'aria-label': 'x' }
    t.ok(!el.control!.hasAttribute('aria-invalid'), 'aria-invalid is gone')
    t.equal(el.control!.getAttribute('aria-label'), 'x', 'others stay')
    el.controlAttributes = null
    t.ok(!el.control!.hasAttribute('aria-label'), 'null clears all')
    el.controlAttributes = { 'aria-label': 'x' }
    Reflect.set(el, 'controlAttributes', '')
    t.ok(!el.control!.hasAttribute('aria-label'), 'empty string clears all')
})

test('controlAttributes set before render reaches the input', async t => {
    const el = document.createElement('radio-input') as RadioInput
    el.setAttribute('label', 'Early')
    el.controlAttributes = { 'aria-required': true }
    document.body.replaceChildren(el)
    await waitFor('radio-input')
    t.equal(el.control!.getAttribute('aria-required'), 'true',
        'input has aria-required')
})

test('controlAttributes ignores names it does not move', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="Ignore"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.controlAttributes = { name: 'x', id: 'y' }
    t.equal(el.control!.getAttribute('name'), 'g', 'name is unchanged')
    t.notEqual(el.control!.id, 'y', 'id is ignored')
})

test('controlAttributes writes booleans as Preact does', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="Bools"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.controlAttributes = { 'aria-invalid': false, autofocus: true }
    t.equal(el.control!.getAttribute('aria-invalid'), 'false',
        'aria false is the string "false"')
    t.equal(el.control!.getAttribute('autofocus'), '', 'true is present')
    el.controlAttributes = { autofocus: false }
    t.ok(!el.control!.hasAttribute('autofocus'), 'false removes it')
})

test('controlAttributes survive a label change', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="One"></radio-input>'
    const el = await waitFor('radio-input') as RadioInput
    el.controlAttributes = { 'aria-describedby': 'hint' }
    el.setAttribute('label', 'Two')
    t.equal(el.control!.getAttribute('aria-describedby'), 'hint',
        'property value is kept')
})

test('controlAttributes touches only its own radio', async t => {
    document.body.innerHTML =
        '<radio-input name="g" value="a" label="A"></radio-input>' +
        '<radio-input name="g" value="b" label="B"></radio-input>'
    await waitFor('radio-input')
    const [a, b] = Array.from(
        document.querySelectorAll('radio-input')
    ) as RadioInput[]
    a.controlAttributes = { 'aria-invalid': 'true' }
    t.ok(!b.control!.hasAttribute('aria-invalid'), 'b is untouched')
})

test('controlAttributes applies to a hydrated input', async t => {
    const el = document.createElement('radio-input') as RadioInput
    const input = document.createElement('input')
    input.type = 'radio'
    el.append(input)
    el.controlAttributes = { 'aria-invalid': 'true' }
    document.body.replaceChildren(el)
    await waitFor('radio-input')
    t.equal(input.getAttribute('aria-invalid'), 'true', 'app input has it')
})

test('controlAttributes set before upgrade still works', async t => {
    // A document with no browsing context does not upgrade custom elements
    const doc = document.implementation.createHTMLDocument('')
    const el = doc.createElement('radio-input') as RadioInput
    el.setAttribute('label', 'Upgrade')
    el.controlAttributes = { 'aria-invalid': 'true' }
    document.body.replaceChildren(el)
    await waitFor('radio-input input')
    t.equal(el.control!.getAttribute('aria-invalid'), 'true',
        'input gets the value set before upgrade')
    el.controlAttributes = null
    t.ok(!el.control!.hasAttribute('aria-invalid'),
        'setting it after upgrade still clears it')
})

test('all done', () => {
    // @ts-expect-error browser global
    window.testsFinished = true
})
