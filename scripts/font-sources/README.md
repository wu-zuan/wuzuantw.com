# Font sources

Wuzuan Ink is a renamed, modified SIL OFL 1.1 derivative of LXGW WenKai TC.
Source TTFs are excluded from git. Generated WOFF2s are checked in; normal
`npm run build` does not download or regenerate fonts.

Fetch the Regular and Bold TTFs from the Google Fonts `ofl/lxgwwenkaitc`
directory into this folder. URLs and SHA-256 hashes of the source versions
used for this build are recorded in `public/fonts/ink/coverage.json`.
The required upstream license is in `public/fonts/OFL.txt`.

Regenerate after changing the outline design or expanding the core subset:

```sh
python -m pip install -r scripts/lettering-requirements.txt
python scripts/build-ink-fonts.py
npm run build
```

All supported characters, including those not currently used by the site, are
shipped in disjoint Unicode subsets. New content within this repertoire loads
the corresponding extended font automatically. Both weights have identical
character coverage. The font's outlines and generated SVG lettering are OFL;
they are not original-from-scratch Chinese glyph designs.
