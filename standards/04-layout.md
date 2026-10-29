# Layout and spacing

Layout starts from content relationships. It uses a 4 px base unit and builds order with semantic grouping and white space, instead of wrapping every piece of content in its own card.

## Spacing scale

| Token | Value | Typical use |
| --- | --- | --- |
| space-1 | 4 px | Visual spacing inside icons |
| space-2 | 8 px | Icon and text, controls in the same group |
| space-3 | 12 px | Form labels and descriptions |
| space-4 | 16 px | Control groups, spacing inside panels |
| space-6 | 24 px | Spacing between groups, page margins on narrow screens |
| space-8 | 32 px | Spacing between content modules |
| space-12 | 48 px | Spacing between major sections |
| space-16 | 64 px | White space in the desktop main area |

## Responsive contract

| Width | Navigation | Main content | Behavior |
| --- | --- | --- | --- |
| 320–599 px | Top menu expanded | Single column, 16 px margins | Controls wrap; icon details open in a dialog |
| 600–999 px | Top menu expanded | 32 px margins, columns by content | Icon inspector kept from 840 px |
| 1000–1279 px | 216 px sidebar | Main content area and resource inspector | Document table of contents collapses above body text |
| 1280 px and above | 216 px sidebar | Cover and preview side by side | Body text and in-page table of contents in columns |

Breakpoints are content boundaries of the reference implementation, not device models. Individual components should also wrap when their container narrows. Do not hide an entire primary feature to pass mobile acceptance.

## Control density

sm = 32 px, md = 40 px, lg = 48 px. The default md is for desktop. Standalone icon buttons are at least 44 × 44 px. Touch and narrow-screen modes raise the minimum height of regular controls to 44 px. Visual size and interaction target are evaluated separately.

## Radius, layers and scrims

radius-sm = 4 px is for small tags, radius-md = 8 px for controls, and radius-lg = 12 px for panels. Overlays prefer borders and scrims to establish hierarchy. z-sticky, z-menu and z-toast handle regular layering. The native dialog uses the browser top layer. Do not substitute an ever-increasing z-index for focus isolation.

## Acceptance

A 320 px viewport has no page-level horizontal overflow. Long titles, long paths and Chinese descriptions are not truncated in ways that lose key meaning. Tables keep the relationship between headers and data, and scroll regions have a keyboard entry point.

The ICON library is a resource search interface. Categories are grouped with headings and spacing; a single icon is highlighted only on hover or selection. The grid in the inspector carries real SVG coordinate measurement and is not a full-page decorative background. In shorter windows, the inspector uses internal scrolling, so the full content and export actions remain accessible after expanding the source code.
