export function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr
}

export function renderMarkdown(text) {
  if (!text) return ''
  let html = escapeHtml(text)

  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  html = html.replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')

  html = html.replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
  html = html.replace(/^\d+\. (.*$)/gm, '<ol><li>$1</li></ol>')

  html = html.replace(/<\/ul>\n<ul>/g, '')
  html = html.replace(/<\/ol>\n<ol>/g, '')

  html = html.replace(/(^|\n)([^\n<#>*`-][^\n]*)(\n|$)/g, '$1<p>$2</p>$3')

  html = linkify(html)

  return html
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function linkify(text) {
  const urlPattern = /(https?:\/\/[^\s<>"']+)/g
  return text.replace(
    urlPattern,
    (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  )
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    return true
  } catch {
    return false
  }
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
