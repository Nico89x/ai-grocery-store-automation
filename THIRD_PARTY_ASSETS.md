# 3D character assets and provenance

The store, robot, product geometry, neutral packaging, neighbourhood geometry and procedural surface textures are project code. Human anatomy, skin/hair textures, jeans, jacket, shoes and rig data are adapted from the **MakeHuman CC0 core/system assets**. Characters are fictional generated humans, not scans of identifiable people.

## Sources and license

- [MakeHuman core asset license](https://static.makehumancommunity.org/about/license.html): core assets are CC0.
- [CC0 system asset pack and per-asset manifest](https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html).
- [Official CC0 archive](https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip).
- Base mesh, default rig, skin weights and young character shape targets: [official MakeHuman repository](https://github.com/makehumancommunity/makehuman/tree/master/makehuman/data). [Asset license](https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md).
- The complete CC0 dedication is bundled at `public/assets/humans/CC0-LICENSE.txt`.

Core asset copyright notices name Data Collection AB, Joel Palmius and Jonas Hauquier. The weight data carries their 2021 CC0 notice; the system asset headers record the September 2020 CC0 release. Sources were retrieved on 8 October 2026. We use **asset data only**; no AGPL MakeHuman application code is included or executed.

## Included derivatives

| Local models / texture     | Original CC0 asset                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| casual-light / casual-dark | hm08 base.obj, default.mhskel, default_weights.mhw, caucasian-male-young / african-male-young shape targets |
| casual-female              | Same base and rig, caucasian-female-young target                                                            |
| Skin maps                  | young_caucasian_male, young_african_male, young_caucasian_female                                            |
| Jacket and jeans           | male_casualsuit05                                                                                           |
| Female jeans               | female_casualsuit01; the shirt uses our plain material, without its source emblem                           |
| Hair                       | short02, bob01                                                                                              |
| Shoes                      | shoes01                                                                                                     |
| Eyes                       | low-poly, brown_eye                                                                                         |

Our importer applies the shape targets and clothing fit mappings, removes authoring helpers and covered body faces, converts to metres and glTF 2.0, reduces the rig to 20 anatomical bones, normalizes the four strongest skin weights and corrects UV orientation. Texture derivatives are resized to 256–1024 pixels. React instances share geometry/textures and clone their skeletons/materials. Gait, head movement, selection, sitting and cycling poses are project animation code; source motion clips are not used.

All resulting GLB and image files are **bundled locally**. The live demo never requests the MakeHuman site. No credentials are needed. Model download failures fall back to the app's existing 3D error state; the HTML product list and local automation remain usable.

## Rebuilding (optional development step)

The checked-in derivatives are sufficient for `npm install`, `npm run dev` and `npm run build`. Rebuilding is not part of CI or the normal setup.

```bash
node scripts/fetch-human-assets.mjs
python scripts/prepare-human-textures.py # Python + Pillow required
node scripts/build-human-models.mjs
npm test
```

Sources are kept in ignored `work/makehuman/`. The downloader extracts selected files via HTTP ZIP ranges rather than downloading the whole archive. Rebuild targets use upstream master; review changes before replacing checked-in derivatives. CC0 permits reuse and modification; documenting it here keeps the portfolio's own work and incorporated asset data transparent.
