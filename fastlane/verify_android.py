"""Validate the actual release bundle before allowing an internal upload."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ANDROID = "{http://schemas.android.com/apk/res/android}"


def run(*args, env=None):
    return subprocess.check_output(args, text=True, stderr=subprocess.STDOUT, env=env)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def verify(bundle):
    config = json.loads((ROOT / "app.json").read_text())["expo"]
    tool = Path(os.environ["BUNDLETOOL_JAR"]).resolve()
    run("java", "-jar", str(tool), "validate", f"--bundle={bundle}")
    manifest = ET.fromstring(run("java", "-jar", str(tool), "dump", "manifest", f"--bundle={bundle}", "--module=base"))
    require(manifest.get("package") == config["android"]["package"], "Wrong package")
    require(manifest.get(ANDROID + "versionCode") == str(config["android"]["versionCode"]), "Wrong version code")
    require(manifest.get(ANDROID + "versionName") == config["version"], "Wrong version name")
    application = manifest.find("application")
    require(application is not None and application.get(ANDROID + "debuggable") != "true", "Debuggable bundle")
    permissions = {e.get(ANDROID + "name") for e in manifest if e.tag.startswith("uses-permission")}
    for blocked in config["android"]["blockedPermissions"]:
        require(blocked not in permissions, f"Unexpected permission: {blocked}")
    require("android.permission.SCHEDULE_EXACT_ALARM" in permissions, "Missing exact alarm permission")
    require(any(e.get(ANDROID + "name", "").endswith("RestoreFocusReceiver") for e in application.findall("receiver")), "Missing DND restoration receiver")

    signature = run("jarsigner", "-J-Duser.language=en", "-verify", str(bundle))
    require("jar verified." in signature, "Bundle signature could not be verified")
    credentials_path = Path(os.environ.get("ANDROID_CREDENTIALS", ROOT / "credentials.json")).resolve()
    key = json.loads(credentials_path.read_text())["android"]["keystore"]
    key_path = Path(key["keystorePath"])
    if not key_path.is_absolute():
        key_path = credentials_path.parent / key_path
    env = dict(os.environ, MEDITATION_STORE_PASSWORD=key["keystorePassword"])
    certificate = run("keytool", "-J-Duser.language=en", "-list", "-v", "-keystore", str(key_path), "-alias", key["keyAlias"], "-storepass:env", "MEDITATION_STORE_PASSWORD", env=env)
    bundle_certificate = run("keytool", "-J-Duser.language=en", "-printcert", "-jarfile", str(bundle))
    match = re.search(r"SHA256: ([A-F0-9:]+)", certificate)
    require(match is not None, "Signing certificate fingerprint unavailable")
    fingerprint = match.group(1)
    require(f"SHA256: {fingerprint}" in bundle_certificate, "Bundle uses a different signing key")
    require("CN=Android Debug" not in bundle_certificate, "Debug signing key is not allowed")

    with zipfile.ZipFile(bundle) as archive:
        names = archive.namelist()
        mapping = "BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map"
        require(mapping in names and archive.getinfo(mapping).file_size > 0, "Missing R8 mapping")
        sounds = {hashlib.sha256(archive.read(n)).hexdigest() for n in names if n.endswith((".m4a", ".wav"))}
        ambience = sorted((ROOT / "assets/ambience").glob("*.m4a"))
        require(len(ambience) == 8, "Expected eight source ambience recordings")
        for sound in [ROOT / "assets/gong.wav", *ambience]:
            require(hashlib.sha256(sound.read_bytes()).hexdigest() in sounds, f"Missing or modified audio: {sound.name}")

    resources = run("java", "-jar", str(tool), "dump", "resources", f"--bundle={bundle}", "--resource=color/splashscreen_background", "--values")
    colors = set(re.findall(r"\[COLOR_\w+\]\s+#([0-9a-f]+)", resources.lower(), re.IGNORECASE))
    require(bool(colors) and colors <= {"181613", "ff181613"}, "Wrong splash background")
    print(json.dumps({"bundle": str(bundle), "version": config["version"], "versionCode": config["android"]["versionCode"], "sha256": hashlib.sha256(bundle.read_bytes()).hexdigest(), "signingSha256": fingerprint, "verified": True}, indent=2))


if __name__ == "__main__":
    try:
        verify(Path(sys.argv[1]).resolve())
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as error:
        # Do not echo external tool output, which may contain credentials.
        print(f"Bundle verification failed: {error}", file=sys.stderr)
        sys.exit(1)
