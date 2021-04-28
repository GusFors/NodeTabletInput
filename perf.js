const { performance, PerformanceObserver } = require('perf_hooks')
const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(entry)
  })
})
perfObserver.observe({ entryTypes: ['measure'], buffer: true })

performance.mark('example-start')
setTimeout(() => {
  performance.mark('example-end')
  performance.measure('example', 'example-start', 'example-end')
}, 3000)

