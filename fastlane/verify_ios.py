"""Verify the signed IPA, release metadata and bundled audio, using macOS tools."""
import datetime
import hashlib
import json
import plistlib
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEAM = 'W543Q9Q8K5'
PACKAGE = 'com.pau.meditationtimer'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def run(*args):
    return subprocess.check_output(args, stderr=subprocess.PIPE)


def verify(ipa):
    config = json.loads((ROOT / 'app.json').read_text())['expo']
    with tempfile.TemporaryDirectory() as directory:
        with zipfile.ZipFile(ipa) as archive:
            require(all(not Path(n).is_absolute() and '..' not in Path(n).parts for n in archive.namelist()), 'Unsafe IPA paths')
        run('ditto', '-x', '-k', str(ipa), directory)
        apps = list(Path(directory).glob('Payload/*.app'))
        require(len(apps) == 1, 'Expected exactly one app')
        app = apps[0]
        info = plistlib.loads((app / 'Info.plist').read_bytes())
        require(info['CFBundleIdentifier'] == PACKAGE, 'Wrong bundle identifier')
        require(info['CFBundleShortVersionString'] == config['version'], 'Wrong version')
        require(info['CFBundleVersion'] == config['ios']['buildNumber'], 'Wrong build number')
        require(info.get('ITSAppUsesNonExemptEncryption') is False, 'Unexpected encryption declaration')
        require('NSMicrophoneUsageDescription' not in info, 'Unexpected microphone permission')
        require('audio' not in info.get('UIBackgroundModes', []), 'Unexpected background audio mode')
        require((app / 'main.jsbundle').is_file(), 'Missing production JavaScript bundle')
        run('codesign', '--verify', '--deep', '--strict', str(app))
        entitlement_bytes = run('codesign', '--display', '--entitlements', ':-', str(app))
        entitlements = plistlib.loads(entitlement_bytes)
        require(entitlements.get('application-identifier') == f'{TEAM}.{PACKAGE}', 'Wrong signing application identifier')
        require(entitlements.get('com.apple.developer.team-identifier') == TEAM, 'Wrong signing team')
        require(not entitlements.get('get-task-allow', False), 'Debug signing is forbidden')
        profile = plistlib.loads(run('security', 'cms', '-D', '-i', str(app / 'embedded.mobileprovision')))
        require(profile['ExpirationDate'] > datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None), 'Expired provisioning profile')
        require(not profile.get('ProvisionedDevices') and not profile.get('ProvisionsAllDevices'), 'Not an App Store provisioning profile')
        require(profile['Entitlements']['application-identifier'] == f'{TEAM}.{PACKAGE}', 'Wrong embedded profile')
        audio_hashes = {hashlib.sha256(p.read_bytes()).hexdigest() for p in app.rglob('*') if p.is_file() and p.suffix in ('.wav', '.m4a')}
        sources = [ROOT / 'assets/gong.wav', *sorted((ROOT / 'assets/ambience').glob('*.m4a'))]
        require(len(sources) == 9, 'Expected gong and eight ambience sources')
        for source in sources:
            require(hashlib.sha256(source.read_bytes()).hexdigest() in audio_hashes, f'Missing or modified bundled audio: {source.name}')
        receipt = {'file': ipa.name, 'sha256': hashlib.sha256(ipa.read_bytes()).hexdigest(),
                   'version': info['CFBundleShortVersionString'], 'build': info['CFBundleVersion'],
                   'bundle': PACKAGE, 'team': TEAM, 'audioFilesVerified': len(sources),
                   'profileExpires': profile['ExpirationDate'].isoformat()}
        ipa.with_suffix('.verified.json').write_text(json.dumps(receipt, indent=2) + '\n')
        print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    verify(Path(sys.argv[1]).resolve())
