import { test } from '@substrate-system/tapzero'
import { waitFor } from '@substrate-system/dom'
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

test('all done', () => {
    // @ts-expect-error browser global
    window.testsFinished = true
})
