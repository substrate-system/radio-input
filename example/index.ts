import '../src/index.css'
import '../src/index.js'
import './index.css'
import Debug from '@substrate-system/debug'
const debug = Debug('radio-input')

document.body.innerHTML += `
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
`

document.querySelector('form')?.addEventListener('submit', ev => {
    ev.preventDefault()
    const els = (ev.target as HTMLFormElement).elements
    debug('submit, `example.value`', els['example'].value)
})
