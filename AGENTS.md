<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI Conventions & Global Shortcuts
- **Modal Close Buttons**: Always use the `<X />` icon component from `lucide-react` for modal close buttons. This ensures that the global `Esc` shortcut can reliably detect and close modals.
- **Creation Buttons**: Always use the standard `.btn` class for "Add New", "Create New", or similar action buttons. This ensures the global `Alt+C` shortcut can automatically detect and trigger these actions.
