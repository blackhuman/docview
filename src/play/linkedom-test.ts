import { parseHTML } from "linkedom";
import {Demo } from './demo'
import { renderToString } from 'react-dom/server'
import { D } from "vitest/dist/reporters-yx5ZTtEV.js";
import React from "react";

const file = Bun.file('src/play/output/Daisy Jones & the Six/titlepage.xhtml')

const {
  // note, these are *not* globals
  window, document, customElements,
  HTMLElement,
  Event, CustomEvent
  // other exports ..
} = parseHTML(await file.text())

const componentString = renderToString(React.createElement(Demo))
const componentFragment = document.createRange().createContextualFragment(componentString)
document.body.appendChild(componentFragment)

// document.body.style.width = '80%'

console.log('document', document.toString())

const blob = new Blob([document.toString()], { type: file.type })