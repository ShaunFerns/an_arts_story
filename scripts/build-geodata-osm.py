#!/usr/bin/env python3
"""Produce a Rathdown-centred 1km geographic snapshot from OSM's standard API.
Uses the named Rathdown House way 310375422, not guessed scene coordinates.
OpenStreetMap contributors / ODbL; see https://www.openstreetmap.org/copyright.
"""
import concurrent.futures, gzip, io, json, math, os, sys, time, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
# Approximate search centre corroborated by OSM-derived Mapcarta page for way 310375422.
SEED_LAT, SEED_LON = 53.35499, -6.27961
ANCHOR_WAY = '310375422'
DLAT = 1.045/111.195
DLON = DLAT/math.cos(math.radians(SEED_LAT))
lat_bounds=[SEED_LAT-DLAT,SEED_LAT,SEED_LAT+DLAT]
lon_bounds=[SEED_LON-DLON,SEED_LON,SEED_LON+DLON]
boxes=[(lon_bounds[i],lat_bounds[j],lon_bounds[i+1],lat_bounds[j+1]) for i in range(2) for j in range(2)]
urls=['https://api.openstreetmap.org/api/0.6/map?bbox=', 'https://www.openstreetmap.org/api/0.6/map?bbox=']
def load_one(box):
    b=','.join(f'{x:.7f}' for x in box)
    failed=[]
    for base in urls:
        try:
            req=urllib.request.Request(base+b,headers={'User-Agent':'AnArtsStory-TUDublin/0.10 (noncommercial research prototype, github.com/ShaunFerns/an_arts_story)','Accept-Encoding':'gzip,deflate'})
            with urllib.request.urlopen(req,timeout=32) as res:
                raw=res.read()
                if res.headers.get('Content-Encoding')=='gzip':raw=gzip.decompress(raw)
            root=ET.fromstring(raw)
            if root.tag!='osm':raise ValueError('Not OSM XML')
            print('OSM API box',b,'bytes',len(raw),'nodes',len(root.findall('node')),'ways',len(root.findall('way')),flush=True)
            return root
        except Exception as e:
            failed.append(f'{base}: {e}')
    raise RuntimeError('OSM API fetch failed '+b+' / '+'; '.join(failed))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    roots=list(pool.map(load_one, boxes))
nodes={};ways={}
for root in roots:
    for e in root:
        if e.tag=='node':nodes[e.get('id')]=(float(e.get('lat')),float(e.get('lon')), {t.get('k'):t.get('v') for t in e.findall('tag')})
        if e.tag=='way':ways[e.get('id')]=e
print('Merged OSM objects:',len(nodes),'nodes,',len(ways),'ways',flush=True)
if ANCHOR_WAY not in ways:
    raise SystemExit('ERROR: Verified Rathdown House OSM way 310375422 missing from download; refusing invented anchor.')
anchor_way=ways[ANCHOR_WAY]
anchor_nodes=[nodes[nd.get('ref')] for nd in anchor_way.findall('nd') if nd.get('ref') in nodes]
if not anchor_nodes:raise SystemExit('Rathdown outline has no georeferenced nodes')
lat0=sum(n[0] for n in anchor_nodes)/len(anchor_nodes)
lon0=sum(n[1] for n in anchor_nodes)/len(anchor_nodes)
cos=math.cos(math.radians(lat0))
def xy(n):return [round((n[1]-lon0)*111195*cos,1),round((n[0]-lat0)*111195,1)]
interesting={'building','highway','barrier','railway','landuse','leisure','natural','name','name:en'}
keys={'building','height','building:levels','highway','surface','barrier','railway','landuse','leisure','natural','access','foot','area','historic','name','name:en','entrance'}
features=[]
for way_id,e in ways.items():
    tags={t.get('k'):t.get('v') for t in e.findall('tag')}
    if not any(k in tags for k in interesting):continue
    if 'building' in tags:kind='building'
    elif 'highway' in tags:kind='road'
    elif 'barrier' in tags:kind='barrier'
    elif 'railway' in tags:kind='railway'
    elif 'landuse' in tags or 'leisure' in tags or 'natural' in tags:kind='land'
    else:kind='poi'
    coordinates=[xy(nodes[nd.get('ref')]) for nd in e.findall('nd') if nd.get('ref') in nodes]
    if len(coordinates)<2:continue
    cx=sum(p[0] for p in coordinates)/len(coordinates);cy=sum(p[1] for p in coordinates)/len(coordinates)
    if math.hypot(cx,cy)>1020:continue
    features.append({'id':'way/'+way_id,'kind':kind,'name':tags.get('name',tags.get('name:en','')),'coords':coordinates,'tags':{k:v for k,v in tags.items() if k in keys}})
# Point-like named objects with useful institution names, if available.
for nid,(lat,lon,tags) in nodes.items():
    name=tags.get('name','')
    if not name or not any(s in name.lower() for s in ('east quad','lower house','rathdown','broadstone','central quad','academic hub','glassmanogue')):continue
    coords=[xy((lat,lon,tags))]
    if math.hypot(*coords[0])<1020:features.append({'id':'node/'+nid,'kind':'poi','name':name,'coords':coords,'tags':{k:v for k,v in tags.items() if k in keys}})
counts={}
for f in features:counts[f['kind']]=counts.get(f['kind'],0)+1
anchor_tags={t.get('k'):t.get('v') for t in anchor_way.findall('tag')}
output={'version':1,'source':'© OpenStreetMap contributors (ODbL 1.0)','sourceUrl':'https://www.openstreetmap.org/copyright','snapshotAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'anchor':{'name':anchor_tags.get('name','Rathdown House'),'id':'way/'+ANCHOR_WAY,'lat':lat0,'lon':lon0},'radius':1000,'units':'Metres: X east, Y north; Rathdown House centroid at (0,0)','counts':counts,'features':features}
path=Path('geo/data.json');path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(output,separators=(',',':')),encoding='utf-8')
print('Generated',path,'bytes',path.stat().st_size,'anchor',output['anchor'],'counts',counts,flush=True)
print('Named landmarks',[(f['name'],f['id']) for f in features if any(s in f['name'].lower() for s in ('quad','rathdown','lower house','broadstone'))][:30],flush=True)