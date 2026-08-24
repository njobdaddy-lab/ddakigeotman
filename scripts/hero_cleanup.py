from pathlib import Path

app_path = Path('assets/js/app.js')
css_path = Path('assets/css/home-stitch.css')
app = app_path.read_text(encoding='utf-8')
css = css_path.read_text(encoding='utf-8')

app_replacements = {
    './assets/css/home-stitch.css?v=stage1fix4': './assets/css/home-stitch.css?v=stage1fix5',
    './assets/examples/hero-before-strawberry.jpg?v=hero-proof-1': './assets/examples/hero-before-v2.webp?v=hero-v2-1',
    './assets/examples/hero-after-blueberry.jpg?v=hero-proof-1': './assets/examples/hero-after-v2.webp?v=hero-v2-1',
}
for old, new in app_replacements.items():
    if old not in app:
        raise SystemExit(f'Expected app.js text missing: {old}')
    app = app.replace(old, new)

old_rule = '.nmd-proof-card img{width:100%;height:100%;object-fit:cover;display:block}'
new_rule = '.nmd-proof-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}'
if old_rule not in css:
    raise SystemExit('Expected desktop Hero img rule missing')
css = css.replace(old_rule, new_rule)

old_override = """/* Dedicated local hero assets. Keep the original img tags only as JS clipping carriers. */
.nmd-proof-card.before{
  background-image:url('../examples/hero-before-strawberry-1536.webp?v=hq-1536-1');
  background-size:cover;background-position:center;background-repeat:no-repeat;
}
.nmd-proof-card.after{
  background-image:url('../examples/hero-after-blueberry-1536.webp?v=hq-1536-1');
  background-size:cover;background-position:center;background-repeat:no-repeat;
}
.nmd-proof-card.before img,.nmd-proof-card.after img{opacity:0}

"""
if old_override not in css:
    raise SystemExit('Expected desktop Hero workaround block missing')
css = css.replace(old_override, '/* Hero comparison images render directly from their img src. */\n\n')

old_mobile = """  .nmd-compare{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#f3efe7;touch-action:none;user-select:none;-webkit-user-select:none}
  .nmd-compare{background-image:url('../examples/hero-before-strawberry-1536.webp?v=hq-1536-1');background-size:cover;background-position:center;background-repeat:no-repeat}
  .nmd-compare img{position:absolute;inset:0;width:100%;height:100%;display:block}
  .nmd-compare>img:first-child{opacity:0}
  .nmd-compare-after{clip-path:inset(0 0 0 50%);background-image:url('../examples/hero-after-blueberry-1536.webp?v=hq-1536-1');background-size:cover;background-position:center;background-repeat:no-repeat;object-fit:none;object-position:-9999px -9999px;color:transparent;font-size:0}
"""
new_mobile = """  .nmd-compare{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#f3efe7;touch-action:none;user-select:none;-webkit-user-select:none}
  .nmd-compare img{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center}
  .nmd-compare-after{clip-path:inset(0 0 0 50%)}
"""
if old_mobile not in css:
    raise SystemExit('Expected mobile Hero workaround block missing')
css = css.replace(old_mobile, new_mobile)

for forbidden in (
    'object-position:-9999px',
    'nmd-proof-card.before img,.nmd-proof-card.after img{opacity:0}',
    "background-image:url('../examples/hero-before-strawberry-1536.webp",
    "background-image:url('../examples/hero-after-blueberry-1536.webp",
):
    if forbidden in css:
        raise SystemExit(f'Hero workaround still present: {forbidden}')

app_path.write_text(app, encoding='utf-8')
css_path.write_text(css, encoding='utf-8')
print('Hero Stage 1 cleanup complete')
