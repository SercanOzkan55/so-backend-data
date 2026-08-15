# Week 07 - Portfolio quality pass

Live URL: https://sercanozkan55.github.io/Portfolio/

## Findings and fixes

| Finding | Fix | Result |
| --- | --- | --- |
| The generated site still used `/so-backend-data` after the repository was renamed to `Portfolio`. Internal navigation, CSS, images, CV, canonical URLs, sitemap, and Open Graph links could therefore resolve to the old project path. | Updated the shared `base` constant to `/Portfolio` and rebuilt every static page. | All generated internal URLs now use the live GitHub Pages project path. |
| At phone widths, the header contained a 42px brand mark plus four text links. The previous gap and text sizing left no reliable room on 320px screens. | Hid the redundant in-page `Experience` header link below 600px, reduced the gap, and made the remaining links 44px-tall touch targets. | Header stays within the viewport and has tappable navigation targets. |
| Dense card copy and small inline links were harder to scan or tap on a phone. | Increased mobile lead line height, slightly reduced card-heading scale, and made text links at least 44px tall. | More comfortable reading and touch interaction without changing desktop layout. |
| The two largest PNG assets made the first view and social preview heavier than necessary. | Re-encoded `cv-analyzer.png` and `social-preview-v2.png` without changing their dimensions or visual content. | CV Analyzer capture reduced from 2,128 KB to 2,023 KB; social preview reduced from 1,528 KB to 1,238 KB. |

## Verification

- Generated every static page from the shared template after the route correction.
- Checked the build output for the obsolete `/so-backend-data` path.
- Ran an automated link inventory against all generated HTML pages: all internal targets exist.
- Checked the GitHub profile, CV Analyzer repository, and `cvanalyzer.dev`: all returned HTTP 200. LinkedIn returned HTTP 999 to an automated request, which is LinkedIn bot protection; verify that one by tapping it from a real phone/browser session.
- A real-phone pass remains required before final track submission: open the live URL at 320-430px width, tap the header links and case-study buttons, then add a phone screenshot here or in the track thread.
