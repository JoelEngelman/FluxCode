// Flux live-preview bridge.
// Turns Flux program output into a real, visible preview inside the Live Preview pane.
(function () {
  const run = document.getElementById('runBtn');
  const refresh = document.getElementById('refresh');
  const code = document.getElementById('code');
  const frame = document.getElementById('frame');
  const terminal = document.getElementById('terminal');

  function isFlux() {
    return window.state?.current?.endsWith('.flux') || document.getElementById('languageLabel')?.textContent === 'Flux' || document.getElementById('fileName')?.textContent?.endsWith('.flux');
  }

  function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function renderFluxPreview() {
    if (!isFlux() || !window.FluxRuntime) return false;
    const source = code?.innerText || code?.textContent || '';
    const lines = [];
    let result;
    try {
      result = await window.FluxRuntime.run(source, { print: (...values) => lines.push(values.join(' ')) });
    } catch (error) {
      result = { output: '', error: error?.message || String(error) };
    }

    const output = result.output || lines.join('\n');
    const error = result.error || '';
    const title = error ? 'Flux program error' : 'Flux program output';
    const body = error ? `<div class="error">${escapeHtml(error)}</div>` : `<pre>${escapeHtml(output || '(No output — your Flux program ran successfully.)')}</pre>`;
    frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:28px;font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#10152a,#171c35);color:#f5f7ff;min-height:100vh;box-sizing:border-box}h1{font-size:20px;margin:0 0 16px}pre{white-space:pre-wrap;line-height:1.7;margin:0;padding:18px;border-radius:16px;background:#ffffff12;border:1px solid #ffffff1c;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.error{padding:16px;border-radius:16px;background:#ff3b3018;border:1px solid #ff3b3040;color:#ffb8b3;white-space:pre-wrap}</style></head><body><h1>⚡ ${title}</h1>${body}</body></html>`;
    terminal.textContent = `Flux runtime\n$ flux run ${document.getElementById('fileName')?.textContent || 'main.flux'}\n` + (output ? output + '\n' : '') + (error ? `✗ ${error}\n` : '✓ Program finished.\n');
    return true;
  }

  if (run) run.addEventListener('click', () => { if (isFlux()) renderFluxPreview(); }, true);
  if (refresh) refresh.addEventListener('click', () => { if (isFlux()) renderFluxPreview(); }, true);
  if (code) {
    let timer;
    code.addEventListener('input', () => {
      if (!isFlux()) return;
      clearTimeout(timer);
      timer = setTimeout(renderFluxPreview, 450);
    });
  }
  window.FluxLivePreview = { render: renderFluxPreview };
})();
