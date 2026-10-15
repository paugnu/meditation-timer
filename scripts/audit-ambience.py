"""Measure the six ambiences requested for review; never decode birds or tanpura.
Requires ffmpeg, ffprobe and numpy. Run: python3 scripts/audit-ambience.py
Writes assets/ambience/audit-report.json; does not modify any audio file.
"""
import hashlib, json, pathlib, subprocess
import numpy as np
from numpy.lib.stride_tricks import sliding_window_view

root=pathlib.Path(__file__).resolve().parents[1]
assets=root/'assets/ambience'
names=['rain','waves','wind','storm','chimes','brown']
original_report=json.loads((assets/'audio-report.json').read_text())

def decode(path,rate=None,channels=None):
 command=['ffmpeg','-v','error','-i',str(path)]
 if rate: command+=['-ar',str(rate)]
 if channels: command+=['-ac',str(channels)]
 return np.frombuffer(subprocess.check_output(command+['-f','f32le','-']),dtype='<f4')

def rms(x):
 return float(20*np.log10(max(1e-12,float(np.sqrt(np.mean(x*x))))))

def repetition(x):
 # Whole-recording correlation finds exact short loops even in an otherwise long file.
 rate=2000
 x=x.astype(np.float64); x-=x.mean()
 fft_size=1<<(2*len(x)-1).bit_length()
 spectrum=np.fft.rfft(x,fft_size)
 correlation=np.fft.irfft(spectrum*np.conj(spectrum),fft_size)[:len(x)]
 energy=np.r_[0,np.cumsum(x*x)];lags=np.arange(len(x))
 correlation/=np.sqrt(np.maximum(1e-20,energy[len(x)-lags]*(energy[-1]-energy[lags])))
 first=rate*5; last=len(x)//2
 best=first+int(np.argmax(correlation[first:last]))
 # Compare changing energy in five bands, in 10-second excerpts one second apart.
 # Per-window centering prevents two similarly quiet stretches looking like duplicates.
 frames=x[:len(x)//200*200].reshape(-1,200)
 spectrum=np.abs(np.fft.rfft(frames*np.hanning(200)))**2
 powers=np.stack([np.log10(np.maximum(1e-15,spectrum[:,a:b].mean(1)))
  for a,b in [(2,10),(10,20),(20,40),(40,70),(70,101)]],axis=1)
 powers/=np.maximum(1e-6,powers.std(0))
 windows=sliding_window_view(powers,100,axis=0)[::10].copy()
 windows-=windows.mean(2,keepdims=True)
 windows=windows.reshape(-1,500)
 windows/=np.maximum(1e-6,np.linalg.norm(windows,axis=1))[:,None]
 similarity=windows@windows.T
 times=np.arange(len(windows))
 similarity[np.abs(times[:,None]-times)<=20]=-1
 pair=np.unravel_index(np.argmax(similarity),similarity.shape)
 # Check whether the most similar dynamics really reuse the same waveform, allowing ±1 s alignment.
 a,b=sorted(int(i) for i in pair)
 left=x[a*rate:(a+10)*rate]; right=x[(b-1)*rate:(b+11)*rate]
 size=1<<(len(left)+len(right)-1).bit_length()
 matches=np.fft.irfft(np.fft.rfft(right,size)*np.fft.rfft(left[::-1],size),size)[len(left)-1:len(right)]
 energy=np.r_[0,np.cumsum(right*right)]
 matches/=np.sqrt(np.maximum(1e-20,np.sum(left*left)*(energy[len(left):]-energy[:-len(left)])))
 return {'whole_track_peak_correlation':float(correlation[best]),
  'whole_track_peak_lag_seconds':best/rate,
  'most_similar_10s_spectral_dynamics':float(similarity[pair]),
  'excerpt_start_seconds':[int(i) for i in pair],
  'excerpt_waveform_peak_correlation_within_1s':float(np.max(matches))}

report={'method':{
 'reviewed':names,'excluded_by_request':['birds','tanpura'],
 'waveform':'Normalized autocorrelation of 2 kHz mono audio; lags from 5 s to half the recording.',
 'excerpts':'Five log-power bands from 20–1000 Hz, 100 ms frames; 10 s windows at 1 s intervals, separated by >20 s. Per-band whole-track standardization and per-window centering. Strongest candidate also compared by waveform with ±1 s alignment.',
 'limits':'Numerical screening, not a listening test. Tonal ringing/natural swells can correlate without copied audio. These measurements cannot establish subjective repetitiveness or native gapless playback.'},'sounds':{}}
for name in names:
 path=assets/(name+'.m4a')
 metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(path)]))['streams'][0]
 rate=int(metadata['sample_rate']); channels=int(metadata['channels'])
 decoded=decode(path).reshape(-1,channels)
 boundary=np.abs(decoded[0]-decoded[-1])
 p99=np.quantile(np.abs(np.diff(decoded,axis=0)),.99,axis=0)
 sha=hashlib.sha256(path.read_bytes()).hexdigest()
 old=original_report[name]
 result={'sha256':sha,'matches_preparation_report':sha==old['sha256'],
  'seconds':len(decoded)/rate,'decoded_samples':len(decoded),'sample_rate':rate,'channels':channels,
  'decoded_samples_match_prepared_pcm':len(decoded)==old['pcm_samples'],
  'peak_dbfs':float(20*np.log10(np.max(np.abs(decoded)))),'rms_dbfs':rms(decoded),
  'boundary_step_ratio_to_p99':(boundary/p99).tolist(),
  'edge_rms_db':[rms(decoded[-rate:]),rms(decoded[:rate])],
  'cycles_per_30_minutes':1800/(len(decoded)/rate)}
 assert result['matches_preparation_report'], f'{name}: audio/preparation report mismatch'
 assert result['decoded_samples_match_prepared_pcm'], f'{name}: unexpected decoded padding'
 assert np.max(np.abs(decoded))<1, f'{name}: clipping'
 assert np.all(boundary<p99), f'{name}: boundary transient'
 del decoded
 result['repetition']=repetition(decode(path,2000,1))
 report['sounds'][name]=result
 print(f'{name}: {result["seconds"]:.3f} s, peak {result["peak_dbfs"]:.2f} dBFS; checks passed',flush=True)
(assets/'audit-report.json').write_text(json.dumps(report,indent=2)+'\n')
