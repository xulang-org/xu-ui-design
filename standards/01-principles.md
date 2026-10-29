# Design principles

XUUI is the shared design language for XU ecosystem interfaces. This library keeps the standards, consumable resources and a browser reference implementation together, so design and development can check against the same result.

## Scope

It is for designers and developers in the XU ecosystem, for developer tools, project management, package management, documentation platforms and settings interfaces. The first reference implementation uses HTML, CSS and JavaScript. This does not mean the XU native UI framework has implemented these components.

## Four guiding principles

- Precise: every color, spacing value, state and icon has a clear purpose and source.
- Restrained: cinnabar red is for key actions and brand recognition. Avoid large areas of emphasis and decorative glow.
- Operable: interfaces must support real input, feedback and recovery. Showcase pages follow this rule too.
- Single source: standards reference tokens. The showcase and exported resources are generated from the same source files.

## Brand boundaries

Brand display uses all-caps XU, XUUI, XUFLOW, XUPKG and XUDOCS. Code identifiers, repository names and CLIs use their actual casing. The brand mark is a dedicated asset and must not be redrawn from generic icons. The totem keeps its original geometry and proportions: no stretching, no rotation, no added graphic attachments.

The brand assets in the showcase come from brand/xu_classic.svg at commit 8d36bb410511f12429a12c8596d672e5e0b5a29f of the website repository. The brand manual serves as background reference. This library re-measures contrast for UI semantic colors and does not carry over contrast conclusions from the old manual that do not state their background.

## Decision order

First confirm the task and content, then choose the page pattern and components, and finally complete the visuals with semantic tokens. Prefer reusing the same pattern for the same task. Do not add useless metrics or cards just to fill the layout.

## Acceptance

- Each primary action can clearly describe its result and can recover from failure.
- The standards express the same semantics in dark and light themes.
- Primary tasks can still be completed on narrow screens, with the keyboard and when zoomed in.
- Sample data is clearly labeled and must not pose as production status or performance evidence.

Continue reading: [Color and themes](02-color.md), [Delivery and governance](12-delivery.md).
