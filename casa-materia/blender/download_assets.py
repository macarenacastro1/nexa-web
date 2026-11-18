import json,sys,os,urllib.request
op=urllib.request.build_opener();op.addheaders=[('User-Agent','nexa-casa-materia/1.0')];urllib.request.install_opener(op)
A=sys.argv[1]
def get(u): return json.load(urllib.request.urlopen(u))
def dl(u,p):
    os.makedirs(os.path.dirname(p),exist_ok=True)
    if not os.path.exists(p):
        with urllib.request.urlopen(u) as r, open(p,'wb') as o: o.write(r.read())
models=sys.argv[2].split(',') if sys.argv[2] else []
for m in models:
    f=get(f'https://api.polyhaven.com/files/{m}')
    g=f['gltf']['1k']['gltf']
    base=f'{A}/models/{m}'
    dl(g['url'],f'{base}/{m}.gltf')
    for rel,inc in g.get('include',{}).items(): dl(inc['url'],f'{base}/{rel}')
    print('model',m)
for t in (sys.argv[3].split(',') if sys.argv[3] else []):
    f=get(f'https://api.polyhaven.com/files/{t}')
    for mp in ['Diffuse','nor_gl','Rough','AO','Displacement','arm']:
        if mp in f and '1k' in f[mp]:
            fmt='jpg' if 'jpg' in f[mp]['1k'] else 'png'
            dl(f[mp]['1k'][fmt]['url'],f'{A}/tex/{t}/{mp}.{fmt}')
    print('tex',t)
for h in (sys.argv[4].split(',') if len(sys.argv)>4 and sys.argv[4] else []):
    f=get(f'https://api.polyhaven.com/files/{h}')
    dl(f['hdri']['2k']['hdr']['url'],f'{A}/hdri/{h}_2k.hdr'); print('hdri',h)
