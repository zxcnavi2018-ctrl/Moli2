# Graba las frases de Molí (audio/guion/frases.json) con la voz de los videos.
#   pip install edge-tts
#   python3 tools/voces.py --voz <la voz de los videos, p. ej. es-MX-DaliaNeural>
# Crea audio/guion/<clave>.mp3 (y audio/guion/sab/<huella>.mp3). Las que ya existen no se vuelven a grabar (usa --todo para regrabar).
import argparse, asyncio, json, os, sys
import edge_tts

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

async def grabar(voz, texto, ruta, proxy):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    await edge_tts.Communicate(texto, voz, proxy=proxy).save(ruta)

async def main():
    a = argparse.ArgumentParser()
    a.add_argument('--voz', required=True, help='la misma voz de los videos y de audio/sync')
    a.add_argument('--todo', action='store_true', help='regraba también las que ya existen')
    a.add_argument('--proxy', default=os.environ.get('HTTPS_PROXY'))
    o = a.parse_args()
    F = json.load(open(os.path.join(RAIZ, 'audio/guion/frases.json'), encoding='utf-8'))
    todas = {**F['frases'], **F['sabias']}
    for clave, texto in todas.items():
        ruta = os.path.join(RAIZ, 'audio/guion', clave + '.mp3')
        if os.path.exists(ruta) and os.path.getsize(ruta) > 0 and not o.todo:
            continue
        await grabar(o.voz, texto, ruta, o.proxy)
        print('✓', clave, '·', texto[:60])

asyncio.run(main())
