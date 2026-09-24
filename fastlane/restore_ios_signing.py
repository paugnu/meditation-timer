"""Restore CI secrets without placing their contents in command arguments or logs."""
import base64
import json
import os
from pathlib import Path

os.umask(0o077)
destination = Path(os.environ['IOS_SIGNING_DIR'])
destination.mkdir(parents=True, exist_ok=True)
for variable, filename in [
    ('IOS_DISTRIBUTION_P12_BASE64', 'ios-distribution.p12'),
    ('IOS_PROVISIONING_PROFILE_BASE64', 'ios.mobileprovision'),
]:
    value = os.environ[variable]
    if not value:
        raise ValueError(f'Missing secret: {variable}')
    (destination / filename).write_bytes(base64.b64decode(value, validate=True))
password = os.environ['IOS_CERTIFICATE_PASSWORD']
if not password:
    raise ValueError('Missing certificate password')
(destination / 'ios-certificate-password.txt').write_text(password)
api = json.loads(os.environ['ASC_API_KEY_JSON'])
for field in ('key_id', 'issuer_id', 'key'):
    if not api.get(field):
        raise ValueError(f'Missing App Store Connect key field: {field}')
Path(os.environ['ASC_API_KEY_PATH']).write_text(json.dumps(api))
print('Temporary signing credentials restored')
