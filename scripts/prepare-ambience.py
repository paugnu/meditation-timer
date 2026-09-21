"""Prepare the eight user-selected recordings: pip install numpy scipy soundfile imageio-ffmpeg.
Usage: python scripts/prepare-ambience.py /path/to/downloaded-originals
Expects {rain,waves,wind,birds,storm,chimes,brown,tanpura}.mp3; see assets/ambience/LICENSE.md.
"""
import argparse, pathlib, subprocess, json, hashlib
import numpy as np
import soundfile as sf
from scipy.signal import butter,sosfilt
from scipy.ndimage import maximum_filter1d,uniform_filter1d
import imageio_ffmpeg
parser=argparse.ArgumentParser()
parser.add_argument('originals',type=pathlib.Path)
parser.add_argument('--only',nargs='+',default=['rain','waves','wind','birds','storm','chimes','brown','tanpura'])
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
src=args.originals
out=root/'assets/ambience'
ff=imageio_ffmpeg.get_ffmpeg_exe(); rate=44100; overlap=12*rate
report=json.loads((out/'audio-report.json').read_text()) if (out/'audio-report.json').exists() else {}
for name in args.only:
 source=src/(name+'.mp3')
 start=12 if name == 'tanpura' else 5
 length=252 if name == 'tanpura' else 900
 raw=subprocess.check_output([ff,'-v','error','-i',str(source),'-ss',str(start),'-t',str(length),'-ar',str(rate),'-ac','2','-f','f32le','-'])
 x=np.frombuffer(raw,dtype='<f4').reshape(-1,2).astype(np.float64)
 # Leave the recording's stop/handling sounds outside the loop, and align to AAC frames.
 if name == 'tanpura':
  # Match the slow pluck envelope within the stable interior, excluding the final decay.
  candidates=range(round(230*rate/1024), (len(x)-overlap)//1024+1)
  frame=441
  reference=np.sqrt(np.mean(x[:overlap].reshape(-1,frame,2)**2,axis=(1,2)))
  def match(frames):
   tail=x[frames*1024:frames*1024+overlap]
   envelope=np.sqrt(np.mean(tail.reshape(-1,frame,2)**2,axis=(1,2)))
   return np.corrcoef(reference,envelope)[0,1]
  loop_frames=max(candidates,key=match)
  x=x[:loop_frames*1024+overlap]
 else:
  x=x[:((len(x)-5*rate-overlap)//1024)*1024+overlap]
 if len(x) < rate*90: raise ValueError(f'{name}: recording too short')
 x=sosfilt(butter(2,20,fs=rate,btype='highpass',output='sos'),x,axis=0)
 theta=np.linspace(0,np.pi/2,overlap)[:,None]
 join=x[-overlap:]*np.cos(theta)+x[:overlap]*np.sin(theta)
 y=np.concatenate([x[overlap:-overlap],join])
 # Balance average level without letting an isolated peak turn the whole track down.
 y*=10**(-26/20)/np.sqrt(np.mean(y*y))
 peak=maximum_filter1d(np.max(np.abs(y),axis=1),size=8821,mode='wrap')
 envelope=uniform_filter1d(peak,size=4411,mode='wrap')
 y*=np.minimum(1,10**(-6/20)/np.maximum(envelope,1e-12))[:,None]
 # AAC reconstruction can leave a tiny edge offset on low-frequency noise.
 if name == 'brown':
  edge=round(rate*.005); ramp=np.sin(np.linspace(0,np.pi/2,edge))[:,None]
  y[:edge]*=ramp; y[-edge:]*=ramp[::-1]
 pcm=src/(name+'-loop.wav');sf.write(pcm,y,rate,subtype='PCM_24')
 dest=out/(name+'.m4a')
 subprocess.run([ff,'-v','error','-y','-i',str(pcm),'-c:a','aac','-b:a','128k','-movflags','+faststart',str(dest)],check=True)
 decoded=subprocess.check_output([ff,'-v','error','-i',str(dest),'-f','f32le','-'])
 d=np.frombuffer(decoded,dtype='<f4').reshape(-1,2)
 rms=lambda a:float(20*np.log10(max(1e-12,np.sqrt(np.mean(a*a)))))
 seam=np.concatenate([d[-rate*6:],d[:rate*6]])
 sf.write(src/(name+'-seam.wav'),seam,rate,subtype='PCM_16')
 report[name]={'seconds':len(y)/rate,'bytes':dest.stat().st_size,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'decoded_samples':len(d),'pcm_samples':len(y),'peak_dbfs':float(20*np.log10(np.max(np.abs(d)))),'rms_dbfs':rms(d),'boundary_step':np.abs(d[0]-d[-1]).tolist(),'typical_step_p99':np.quantile(np.abs(np.diff(d,axis=0)),.99,axis=0).tolist(),'edge_rms_db':[rms(d[-rate:]),rms(d[:rate])]}
 if name == 'tanpura':
  windows=d[:len(d)//4410*4410].reshape(-1,4410,2)
  quietest=rms(windows[np.argmin(np.mean(windows*windows,axis=(1,2)))])
  report[name]['quietest_100ms_dbfs']=quietest
  report[name]['source_start_seconds']=start
  report[name]['source_end_seconds']=start+len(x)/rate
  assert quietest > -45, 'tanpura: silent gap'
 assert len(d) == len(y), f'{name}: encoder added padding'
 assert np.max(np.abs(d)) < 1, f'{name}: clipping'
 assert np.all(np.abs(d[0]-d[-1]) < np.quantile(np.abs(np.diff(d,axis=0)),.99,axis=0)), f'{name}: seam transient'
 (out/'audio-report.json').write_text(json.dumps(report,indent=2)+'\n')
 print(name,report[name],flush=True)
(out/'audio-report.json').write_text(json.dumps(report,indent=2)+'\n')
