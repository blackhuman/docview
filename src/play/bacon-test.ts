import { Property, Value } from 'baconjs'
import { Bus } from 'baconjs'
import * as Bacon from 'baconjs'

const bus = new Bus<void>()
// bus.onValue(v => console.log('onValue', v))
bus.onValue(v => console.log('onValue', v))
bus.push()
bus.push()