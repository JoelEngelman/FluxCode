# FluxCode ✦

**FluxCode** is an all-in-one desktop coding studio designed around one idea: open the app and build.

### What is here now
- Modern Electron desktop shell with an Apple-inspired liquid-glass interface.
- Monaco-style lightweight editor surface with multiple files.
- Instant HTML/CSS/JavaScript live preview.
- GitHub connection from inside the app.
- Browse the authenticated user's repositories.
- Browse repository trees and open files.
- Edit files and publish commits back to GitHub.
- Cloudflare account connection foundation.
- Encrypted local credential storage using Electron `safeStorage`.
- No separate Node/Python/etc. installation is required for the packaged app.

### Product direction
FluxCode is intended to grow into a self-contained coding environment with:

**Languages:** JavaScript/TypeScript, HTML/CSS, Python, Java, C/C++, C#, Rust, Go, PHP, Ruby, Swift, Kotlin, Lua, SQL, Bash and more.

**Cloud:** Cloudflare Workers, Pages, D1, KV, R2, Queues and deployments directly from the project workspace.

**Developer tools:** project creation, Git branches, commits, diffs, terminals, logs, debugging, extensions, package management, secrets, environment variables and one-click previews.

**Publishing:** GitHub publishing plus Cloudflare deployment, with Electron packaging for distributing FluxCode itself.

### Security model
Credentials are never placed in renderer JavaScript. The Electron preload bridge exposes narrow API methods, while secrets are kept through the operating system-backed Electron `safeStorage` mechanism. Use least-privilege GitHub and Cloudflare tokens.

### Development
The repository intentionally has a very small bootstrap. During development, Electron itself is the only package required by the app runtime. A packaged release will bundle the Electron runtime so end users do not need Node.js, Python, Git, or other command-line runtimes installed separately.

```bash
npm install
npm start
```

> The current version is the foundation/prototype. Full offline language execution requires bundling or sandboxing language runtimes in later releases; the editor and web preview already work without those runtimes.
