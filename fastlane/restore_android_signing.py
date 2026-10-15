"""Restore CI secrets in private temporary files without logging their contents."""
import base64
import binascii
import json
import os
from pathlib import Path
import sys


def restore():
    os.umask(0o077)
    destination = Path(os.environ['RUNNER_TEMP']).resolve() / 'android-signing'
    encoded = os.environ.get('ANDROID_KEYSTORE_BASE64', '')
    if not encoded:
        raise ValueError('Missing secret: ANDROID_KEYSTORE_BASE64')
    keystore = base64.b64decode(encoded, validate=True)
    if not keystore:
        raise ValueError('Empty Android keystore')
    credentials = json.loads(os.environ.get('ANDROID_CREDENTIALS_JSON', ''))
    key = credentials['android']['keystore']
    fields = ('keystorePassword', 'keyAlias', 'keyPassword')
    for field in fields:
        if not isinstance(key.get(field), str) or not key[field]:
            raise ValueError(f'Missing Android signing field: {field}')
    # Ignore any workstation path in the secret; only use the restored CI keystore.
    key = {field: key[field] for field in fields}
    key['keystorePath'] = str(destination / 'upload.jks')
    play = None
    if os.environ.get('PUBLISH_TO_PLAY') == 'true':
        play = json.loads(os.environ.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON', ''))
        if play.get('type') != 'service_account' or not all(isinstance(play.get(field), str) and play[field] for field in ('private_key', 'client_email', 'token_uri')):
            raise ValueError('Invalid Google Play service account JSON')
    destination.mkdir(mode=0o700, parents=True, exist_ok=True)
    (destination / 'upload.jks').write_bytes(keystore)
    (destination / 'credentials.json').write_text(json.dumps({'android': {'keystore': key}}))
    if play is not None:
        (destination / 'google-play.json').write_text(json.dumps(play))
    print('Temporary Android signing credentials restored')


if __name__ == '__main__':
    try:
        restore()
    except (ValueError, KeyError, TypeError, AttributeError, OSError, binascii.Error):
        # JSON parsing errors can contain input; expose no secret values on failure.
        print('Could not restore Android credentials; check the configured signing secrets.', file=sys.stderr)
        sys.exit(1)
