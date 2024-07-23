import { test } from '@bicycle-codes/tapzero'
import '../src/index.js'

test('radio-input', t => {
    document.body.innerHTML += `
        <radio-input
            name="example"
            value="example1"
            label="example one"
        ></radio-input>
    `

    const el = document.querySelector('radio-input input[type="radio"]')
    t.ok(el, 'should find a radio input')
})
