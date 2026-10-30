# Navigation and hierarchy

Navigation reflects content structure. Primary navigation answers "Which area am I in?", secondary navigation answers "What am I looking at?", and the page title answers "What task does this page accomplish?"

## Basic conventions

- Page navigation uses real hash links and supports refresh, forward and back.
- The current location uses aria-current="page", together with a change in shape or text.
- Navigation groups have visible headings and avoid mixing resources, actions and status. The main navigation keeps entries for resource areas. The directory of 12 standards expands on demand through a native details element and is expanded by default while reading a standard.
- Headings follow the h1 → h2 → h3 hierarchy. Each page has only one h1.
- The in-page table of contents uses directly accessible section links, such as #/standards/05-icons#section-2. After navigation, focus moves to the section heading, and the fixed top bar must not cover the heading. On narrow screens, the table of contents sits above the body text and collapses with a native details element.

## Tabs and filters

Tabs switch content within the same area. Filters narrow the same data set. The two must not be mixed. This library's component showcase uses regular buttons with aria-pressed to switch preview subsets and does not pretend to be an ARIA tablist. If a product uses a real tablist, it must implement tab, tabpanel, the selection relationship and arrow-key operation.

## Narrow-screen navigation

Below 1000 px, the sidebar becomes an expandable area at the top. The menu button keeps aria-expanded and aria-controls in sync. When closed, its child items leave the Tab order. Clicking a target collapses the navigation. Escape collapses it and returns to the menu trigger. Because this is an in-page expandable area, it does not use modal semantics.

## Search and empty results

Standards search matches titles and summaries. ICON search matches English names, Chinese names and categories. Search fields have visible labels, and the result count is announced through a polite status region. Empty results explain how to recover and provide a way to clear the search.

## Acceptance

Opening a document deep link directly locates the target. Browser back restores the previous page. The skip-to-content link works. Hidden content in the mobile menu must not receive keyboard focus. Unknown routes show a clear way back.
