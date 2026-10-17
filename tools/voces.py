# Graba las frases de Molí (audio/guion/frases.json) con la voz de los videos y de audio/sync: Kokoro «ef_dora», velocidad 1.0.
#   pip install kokoro-onnx soundfile
#   descarga kokoro-v1.0.onnx y voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx/releases) en --modelos
#   python3 tools/voces.py --modelos <carpeta>
# Crea audio/guion/<clave>.mp3 (las sabías van con clave sab/<huella>). Las que ya existen no se vuelven a grabar (usa --todo para regrabar).
import argparse, json, os, subprocess, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FILTRO = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
          'silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16')

def main():
    a = argparse.ArgumentParser()
    a.add_argument('--modelos', required=True, help='carpeta con kokoro-v1.0.onnx y voices-v1.0.bin')
    a.add_argument('--todo', action='store_true', help='regraba también las que ya existen')
    o = a.parse_args()
    k = Kokoro(os.path.join(o.modelos, 'kokoro-v1.0.onnx'), os.path.join(o.modelos, 'voices-v1.0.bin'))
    F = json.load(open(os.path.join(RAIZ, 'audio/guion/frases.json'), encoding='utf-8'))
    for clave, texto in {**F['frases'], **F['sabias']}.items():
        ruta = os.path.join(RAIZ, 'audio/guion', clave + '.mp3')
        if os.path.exists(ruta) and os.path.getsize(ruta) > 0 and not o.todo:
            continue
        os.makedirs(os.path.dirname(ruta), exist_ok=True)
        voz, sr = k.create(texto, voice='ef_dora', speed=1.0, lang='es')
        with tempfile.NamedTemporaryFile(suffix='.wav') as t:
            sf.write(t.name, voz, sr)
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', t.name, '-af', FILTRO,
                            '-ac', '1', '-ar', '24000', '-b:a', '48k', ruta], check=True)
        print('✓', clave, '·', texto[:60])

main()
