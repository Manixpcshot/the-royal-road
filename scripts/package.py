from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
dist.mkdir(exist_ok=True)
version = json.loads((root / 'package.json').read_text())['version']
public = root / 'public'
for target in ['cpanel','vps']:
    with ZipFile(dist / f'royal-road-{target}-{version}.zip','w',ZIP_DEFLATED) as archive:
        for path in sorted(public.rglob('*')):
            if path.is_file():
                archive.write(path, path.relative_to(public if target=='cpanel' else root))
        if target=='cpanel':
            archive.writestr('.htaccess','DirectoryIndex index.html\nAddType text/javascript .mjs\n')
        else:
            for name in ['server.mjs','package.json','royal-road.service','README.md','test/rules.test.mjs','test/narration.test.mjs','scripts/package.py']:
                archive.write(root/name,name)

# Artists and translators can download the illustrations independently.
with ZipFile(dist / f'royal-road-art-{version}.zip', 'w', ZIP_DEFLATED) as archive:
    for group in ['city', 'portrait', 'surface', 'scene']:
        for asset in sorted((public / 'art' / group).glob('*.webp')):
            archive.write(asset, asset.relative_to(public / 'art'))
