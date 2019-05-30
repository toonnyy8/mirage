import "@babel/polyfill"

let src = document.createElement("script")
src.src = URL.createObjectURL(new Blob([`console.log("hi")`], { type: 'text/html' }))
document.head.appendChild(src)
