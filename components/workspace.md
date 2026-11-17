# Drag-and-drop workspace

Panel docking, tab rearranging, split containers and accessible workspace layout. The following is the component's design and interaction contract; the Web reference implementation and native capability boundaries are described separately.

## Structure

- Workspace dock container
- Dockable panels with grab handles and header tabs
- Drop zone indicators (split left/right/top/bottom, center tab insert)
- Floating drag preview proxy
- Layout preset and reset controls

## State matrix

| State | Must satisfy |
| --- | --- |
| Resting | All docked panels fit viewport cleanly; split ratios preserved |
| Dragging panel | Semi-transparent drag preview follows pointer; drop targets activate |
| Drop candidate active | Drop zone indicator highlights destination region with clear visual line/overlay |
| Dropped / Settled | Layout tree updates immediately; keyboard focus follows into moved panel |
| Cancelled | Esc key or pointer cancel restores previous layout without layout shift |
| Minimized / Maximized | Single panel expands to fill container; other panels restore on exit |

## Keyboard behavior

| Shortcut | Action |
| --- | --- |
| Alt+M / Option+M | Activate panel move mode on focused panel header |
| Arrow keys (in move mode) | Select target dock position (left, right, above, below, center tab) |
| Enter / Space | Confirm move and dock panel into selected position |
| Escape | Cancel active drag or move mode and restore previous position |
| Ctrl+Tab / Ctrl+Shift+Tab | Cycle between panels within workspace container |

## Tokens and sizing

Use --xu-surface, --xu-canvas, --xu-control-border, --xu-brand, --xu-focus and --xu-muted. Panel headers maintain a minimum height of 36 px; drag grab handles provide at least 44 px touch targets. Drop indicator lines use a 2 px brand highlight. Components must support dark and light themes and respect reduced motion preferences.

## Native mapping

widgets.Workspace / widgets.SplitView; native multi-canvas host docking, OLE / Cocoa drag-and-drop protocol bridging with platform drop targets.

## Acceptance

- Default layout, active dragging, drop zone highlighting, maximized and restored states can all be verified.
- Full keyboard alternative allows re-docking and tab reordering without requiring pointer dragging (WCAG 2.5.7).
- At 320 px or narrow viewports, workspace collapses gracefully into single-column or tabbed views.
- Screen readers announce panel moves, dock positions and layout configuration changes via live regions.
- Automated tests cover layout tree serialization, reordering and drag cancellation; physical pointer and touch gestures are verified on target hardware.
