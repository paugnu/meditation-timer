# Compilaciones con Fastlane

Fastlane compila un AAB firmado y lo verifica antes de permitir una subida al canal
interno de Google Play. No usa EAS Build ni modifica el canal de producción. iOS se compila en macOS
con GitHub Actions y se sube a TestFlight por API.

## Preparación

- Node.js 22.13 o posterior, JDK 17, Python 3 y Ruby 3.3 o posterior con Bundler y
  cabeceras de desarrollo. Las versiones de las gemas están fijadas en `Gemfile.lock`.
- Android SDK: plataforma 36, Build Tools 35.0.0 y 36.0.0, NDK 27.1.12297006, CMake 3.22.1 y
  Platform Tools. Gradle puede instalar componentes adicionales requeridos por Expo.
- [bundletool 1.18.3](https://github.com/google/bundletool/releases/tag/1.18.3), JAR oficial.
  SHA-256: `a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29`.
- `credentials.json` con el formato local de EAS (`android.keystore`, incluidos
  `keystorePath`, `keystorePassword`, `keyAlias` y `keyPassword`). Las rutas relativas
  del keystore se resuelven desde la carpeta del JSON. Reutilizar la firma existente.
- Un JSON de cuenta de servicio con acceso a esta app en Google Play para consultar
  versiones y subir al canal interno. No hace falta para compilar.

Los archivos de claves, `credentials.json`, `secrets/`, dependencias locales y
resultados de compilación están excluidos de Git. Mantener permisos privados en las claves.

```bash
bundle config set --local path vendor/bundle
bundle install
export JAVA_HOME=/ruta/al/jdk17
export ANDROID_HOME=/ruta/al/Android/Sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
export BUNDLETOOL_JAR=/ruta/a/bundletool.jar
export GOOGLE_PLAY_JSON_KEY=/ruta/privada/google-play-service-account.json
export FASTLANE_OPT_OUT_USAGE=1
```

En este equipo Bundler se llama `bundle3.3`. Los SDK y bundletool están en
`~/Android/Sdk` y `~/.local/share/meditation-build/bundletool.jar`. Se instalaron
cabeceras Ruby en esa última carpeta sin cambiar paquetes del sistema; para
reinstalar gemas con extensiones nativas aquí, usar:

```bash
RUBYOPT=-r"$HOME/.local/share/meditation-build/ruby-headers.rb" \
LIBRARY_PATH="$HOME/.local/share/meditation-build/ruby-dev/usr/lib/x86_64-linux-gnu" \
bundle3.3 install
```

## Compilar y verificar

1. Consultar los números usados con `bundle exec fastlane android status`.
2. Preparar un `android.versionCode` nuevo en `app.json`; Fastlane no lo incrementa
   automáticamente. No reutilizar códigos que ya se hayan subido, aunque estén en borrador.
3. Ejecutar `npm run typecheck && npm test` y, si cambia la interfaz, `npm run test:e2e`.
4. Ejecutar `bundle exec fastlane android build`.

La tarea genera Android mediante Expo prebuild y firma la variante release con un
script de Gradle externo al proyecto generado. Las contraseñas se leen del JSON:
no se pasan como argumentos del proceso ni se imprimen en los registros.
El AAB queda en `build-artifacts/meditation-timer-VERSION-CODE.aab`.

La verificación comprueba el paquete y la versión, firma contra el keystore,
ausencia de firma debug y permisos bloqueados, restauración de No molestar,
mapping R8, hashes de los ocho ambientes y del gong, y color del splash.
No sustituye las pruebas físicas de audio, brillo, notificaciones y No molestar.

## Subir un paquete existente

```bash
bundle exec fastlane android verify aab:/ruta/absoluta/al/paquete.aab
bundle exec fastlane android internal aab:/ruta/absoluta/al/paquete.aab
```

`internal` vuelve a verificar el paquete y sube exclusivamente a pruebas internas,
sin cambiar textos, capturas ni imágenes de la ficha. No inicia otra compilación.
Una carga correcta no demuestra que el paquete esté disponible: confirmar el código
en el canal interno con `status` y registrar el resultado en `store/RELEASE-STATUS.md`.

## iOS: GitHub Actions → TestFlight

El flujo `.github/workflows/ios-testflight.yml` se ejecuta manualmente en `main`,
con un máximo de 60 minutos y una sola ejecución simultánea. Usa el ejecutor
estándar `macos-26`, Xcode 26.6, Node 22 y Ruby 3.3. El repositorio público permite
usar ejecutores estándar gratuitamente; si cambia su visibilidad, revisar la cuota.

Los secretos del repositorio son:

- `IOS_DISTRIBUTION_P12_BASE64`: certificado existente con su clave privada, en base64.
- `IOS_CERTIFICATE_PASSWORD`: contraseña de ese certificado.
- `IOS_PROVISIONING_PROFILE_BASE64`: perfil App Store para `com.pau.meditationtimer`.
- `ASC_API_KEY_JSON`: JSON Fastlane con `key_id`, `issuer_id`, `key` e `in_house: false`.

Las claves se restauran únicamente en el directorio temporal. Fastlane crea un
llavero temporal, importa la firma y configura el proyecto iOS generado por Expo.
El llavero y el perfil instalado se eliminan al terminar; el flujo también limpia
las credenciales si falla un paso. No se exportan secretos como artefactos.

Antes de lanzar el flujo, consultar App Store Connect, asignar una versión válida y
un `ios.buildNumber` no usado en `app.json`, verificar los cambios y subirlos a `main`.
En GitHub: **Actions → iOS TestFlight → Run workflow → main**.

El flujo ejecuta typecheck y pruebas unitarias, genera iOS, instala CocoaPods,
compila y verifica el IPA real: firma, identificador y equipo, versión, perfil App
Store vigente, ausencia de firma debug y permiso de micrófono, JavaScript de
producción, y hashes del gong y los ocho ambientes. Guarda el IPA y un recibo con
SHA-256 durante siete días. Después lo sube y espera hasta 15 minutos al procesado
por Apple. Si esa espera expira, consultar Apple antes de repetir una subida.
Una compilación válida no sustituye las pruebas físicas en iPhone.

Para hacerlo desde un Mac local con Xcode 26.4 o posterior:

```bash
npm ci
bundle install
export IOS_SIGNING_DIR=/ruta/privada/ios-signing
export ASC_API_KEY_PATH=/ruta/privada/asc-api-key.json
bundle exec fastlane ios build
bundle exec fastlane ios internal ipa:/ruta/absoluta/al/paquete.ipa
```

La carpeta de firma contiene `ios-distribution.p12`, `ios-certificate-password.txt`
y `ios.mobileprovision`. La tarea `internal` no envía la versión a App Review ni
publica en App Store. Confirmar el procesado y acceso del grupo interno en Apple,
y añadir el resultado a `store/RELEASE-STATUS.md`.
