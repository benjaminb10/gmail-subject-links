// Makes URLs in Gmail subject lines clickable:
// h2.hP is the open email's subject, span.bog the subject in the inbox list.
const SUBJECT_SELECTOR = 'h2.hP, span.bog';
const URL_RE = /\bhttps?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;

function linkify(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('a')) continue;
    URL_RE.lastIndex = 0;
    if (URL_RE.test(node.textContent)) nodes.push(node);
  }

  for (const node of nodes) {
    const text = node.textContent;
    const frag = document.createDocumentFragment();
    let last = 0;
    URL_RE.lastIndex = 0;
    for (const match of text.matchAll(URL_RE)) {
      frag.append(text.slice(last, match.index));
      const a = document.createElement('a');
      a.href = match[0];
      a.textContent = match[0];
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'gsl-link';
      frag.append(a);
      last = match.index + match[0].length;
    }
    frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

// In the inbox list a click opens the email; open only the link instead.
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a.gsl-link');
  if (!a) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  window.open(a.href, '_blank', 'noopener');
}, true);

function scan() {
  document.querySelectorAll(SUBJECT_SELECTOR).forEach(linkify);
}

let pending = false;
new MutationObserver(() => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    scan();
  });
}).observe(document.body, { childList: true, subtree: true, characterData: true });

scan();
