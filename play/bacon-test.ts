import { Property, Value } from 'baconjs'
import { Bus } from 'baconjs'

const bus = new Bus<number>()
// bus.onValue(v => console.log('onValue', v))
bus.firstToPromise().then(v => console.log('value', v))
bus.push(1)
// bus.firstToPromise().then(v => console.log('value', v))
// bus.push(2)
// bus.toProperty(3).firstToPromise().then(v => console.log('value2', v))