# Wuzuan Ink identity

The entire site uses Wuzuan Ink, a custom outline derivative of LXGW WenKai TC.
Chinese, Latin, digits, punctuation, metadata and code labels share this family.
The palette remains the original `#0a0a12`, `#00f2ff`, `#7000ff`.

- `wuzuan-wordmark.svg` and `wuzuan-name.svg` are exported from the same modified
  font used for live text. These derived outlines are under SIL OFL 1.1, with
  copyright and license in `../../fonts/OFL.txt`.
- `icons.svg` contains 26 original sketch UI symbols; `scribble.svg`, `spark.svg`
  and `favicon.svg` are original supporting marks under the repository ISC license.
- The service symbols are illustrative, not official replacement logos.
- Third-party event/team artwork retains its original attribution and colors.

See `../../fonts/README.md` for exact font scope and source attribution. Rebuild
the font and wordmarks using `scripts/build-ink-fonts.py`. Site styles live in a
single `public/css/style.css`; font subset declarations are generated separately
in `public/css/ink-fonts-core.css`. There is no second theme override stylesheet.
