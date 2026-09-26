"""Reproduce draft screenshot measurements; manually traced polygons use CSS px.
These outer book outlines are a framing proxy, not approved subject masks.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).parent
cases = {
    'phone-before': {'file': 'before-jonah-and-the-whale-2-360x660.png', 'polygon': [(0,75),(360,92),(360,367),(0,347)], 'shipWidth': 263},
    'phone-after': {'file': 'after-jonah-and-the-whale-2-360x660.png', 'polygon': [(35,285),(71,118),(299,125),(317,304)], 'shipWidth': 151},
    'desktop-before': {'file': 'before-jonah-and-the-whale-2-1440x900.png', 'polygon': [(200,463),(291,84),(824,103),(794,549)], 'shipWidth': 350},
    'desktop-after': {'file': 'after-jonah-and-the-whale-2-1440x900.png', 'polygon': [(67,724),(154,279),(761,295),(798,766)], 'shipWidth': 405},
}
# Baseline gradient: alpha 0 at 31svh, 179/255 at 46svh.
# Count every pixel past the interpolated 0.10 alpha boundary as obscured.
threshold = 660 * .31 + (0.10 / (179 / 255)) * (660 * .15)
results = {}
for key, case in cases.items():
    width, height = Image.open(root / case['file']).size
    mask = Image.new('1', (width,height));ImageDraw.Draw(mask).polygon(case['polygon'], fill=1)
    area = sum(mask.getdata())
    obscured = sum(mask.crop((0, round(threshold), width, height)).getdata()) if key == 'phone-before' else 0
    results[key] = {**case, 'areaPx': area, 'obscuredPercent': round(obscured/area*100,2)}
    if key.startswith('desktop'):
        # Same available art rectangle in both captures, independent of framing.
        results[key]['occupancyPercent'] = round(area / ((1440*.62-24)*800)*100,2)
    poly = ' '.join(f'{x},{y}' for x,y in case['polygon'])
    line = f'<path d="M0 {threshold}H{width}" stroke="red" stroke-width="2"/>' if key=='phone-before' else ''
    (root/f'{key}-annotation.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><image href="{case["file"]}" width="{width}" height="{height}"/><polygon points="{poly}" fill="#00ff001f" stroke="lime" stroke-width="2"/>{line}</svg>')
results['method'] = {'baselineScrimAlphaThreshold':0.10,'baselineScrimBoundaryY':threshold,'outlineTolerancePx':3,'shipWidthTolerancePx':5,'scope':'Manual outer book outlines, including standing illustration and base; clipped to viewport. Desktop denominator identical in both captures. Not full critical-subject/animation acceptance.'}
(root/'measurements.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
