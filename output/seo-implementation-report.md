# SEO implementation and remaining verification

Implemented locally on November 7, 2026. Not deployed.

## Editorial changes

- Distinct primary seed intent, title, description, and pricing factors for 18 service pages: see `seo-intent-map.json`. These are not validated search-volume or ranking claims.
- Homepage and Services titles match the supplied wording; homepage description matches the supplied description.
- Added buyer guidance covering properties, tenant hours, price factors, information to supply, assessment, scope, scheduling, and completion.
- Visible breadcrumbs and matching BreadcrumbList data on top-level non-home pages.
- Preserved project-photo spaces; no invented projects, customer reviews, or outcomes.

## Technical changes

- Production internal page links, canonical annotations, social URLs, and sitemap use the preferred HTTPS domain and extensionless paths.
- Known `.html` URLs redirect to canonical paths; extensionless paths internally serve the corresponding static files.
- Domain aliases remain redirected. Empty `/commercial-roofing/houston` and its `.html` variant now redirect to the roofing hub in local configuration.
- Sitemap includes 31 nonempty, indexable, self-canonical production pages. Draft copies and the empty Houston roofing file are excluded.
- Service schema descriptions match the revised services. Removed office opening-hours and precise-geolocation assertions from business schemas because emergency availability does not establish office hours or exact coordinates.
- Run `python scripts/validate-seo.py` before deployment. Static checks do not prove hosting behavior or Google indexing.

## Live results before deployment

Raw evidence: `seo-live-audit.json`.

- Both construction-domain variants and the preferred domain's `www` variant redirect with 301 to the preferred domain.
- Tested roof-repair `.html` and extensionless URLs both return 200. Both declare the extensionless canonical. New local format redirects are not live yet.
- All five newly created service URLs return 404 on the live host. Their files and rewrite rules are local and must be deployed before live success can be verified.
- Live construction/Houston returns 200 with a `.html` canonical.
- Live roofing/Houston returns 200 without a canonical; its local file is empty. The prepared redirect avoids serving that empty destination.
- Tested successful responses did not report noindex in the captured meta/header checks. This is not a complete indexability audit.

## City-page review

The main construction page now leads with commercial repairs and renovations. The Houston construction page still emphasizes ground-up builds, general contracting, and industrial construction. Its geographic intent overlaps the hub, but a merge should consider actual query, conversion, and backlink data and any genuinely distinct work represented there. No construction city pages were deleted or redirected in this pass. Existing city pages received URL normalization; no new city pages were created. Review Houston first, then the other city pages for unique local evidence and leads before expanding them.

## Account-dependent work

No connected Search Console, Keyword Planner, or Business Profile capability was available for this task.

- Search Console: inspect live and Google-selected canonicals after deployment; review indexing and query/page performance, especially the construction hub versus Houston page; submit the updated sitemap.
- Keyword Planner: validate the seed targets by Houston service area and commercial intent; retain distinct page purposes rather than repeating one broad construction target.
- Business Profile: verify the real business name, actual available categories, hours, address/service-area settings, and offered services in the account. Do not change the name to include search keywords. Do not invent reviews or categories.

Prepared Business Profile description (not published):

> All-Type Roofing & Construction serves shopping centers, storefronts, offices, warehouses, and other commercial properties across Greater Houston. Services include commercial roofing, roof repairs and maintenance, concrete and masonry repairs, stucco and exterior repairs, tenant improvements, painting, and waterproofing. We plan work around property access, tenant schedules, and building operations. Contact All-Type for planned commercial service or 24/7 emergency roof and building repair.

Upload approved original project photos and request genuine customer feedback through the actual profile. Category selection must be checked in the live category picker; it was not verified here.

## Case-study intake

For each approved real project, supply: property type and location suitable for publication; the original problem; completed scope; materials actually used; tenant/access constraints; completion date; verified outcome; approved before/during/after photos and captions. Populate existing gallery spaces only after these details are available.

## Source guidance

- [Google helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google canonicalization guidance](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google local ranking guidance](https://support.google.com/business/answer/7091?hl=en)

These changes improve consistency and usefulness; they do not establish a prior indexing penalty or guarantee rankings.
