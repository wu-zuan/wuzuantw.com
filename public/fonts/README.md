# Wuzuan Ink

A site-specific handwriting treatment of **LXGW WenKai TC**, licensed under
SIL Open Font License 1.1. Copyright 2024 The LXGW WenKai Project Authors
(https://github.com/lxgw/LxgwWenkaiTC). The full upstream notice is in `OFL.txt`.
The modified font and SVG lettering remain under OFL, not the site's ISC license.

This is a custom derivative, not a claim that 22,401 glyphs were drawn from
scratch, nor a claim that this style has never existed on another website.

Design changes apply to every glyph in both Regular (400) and Bold (700):

- A 94% width treatment around the advance center, retaining readable spacing.
- A consistent forward pen angle.
- A shallow rising contour arc and restrained baseline variation.
- Renamed family metadata, without claiming upstream author endorsement.

All 22,401 supported codepoints are included in **both** weights. This covers
the site's Traditional Chinese, English, numbers and punctuation, plus the
upstream repertoire. It does not cover all of Unicode. System fallback remains
available only for unsupported characters or when font files cannot load.

Current pages load only the small v2 core subsets in `ink-fonts-core.css`; all
text in the rendered pages is covered by them. The v1 complete family remains
available in `ink-fonts.css` for future content that needs a broader repertoire.
Each v1 weight has 22 extended subsets with disjoint Unicode ranges.
The current site's full text is checked against the font repertoire during QA.

`ink/coverage.json` records source URLs, SHA-256 hashes, character coverage and
file sizes. See `scripts/font-sources/README.md` for reproducible generation.
Generated fonts are checked in; ordinary builds do not require Python/network.
