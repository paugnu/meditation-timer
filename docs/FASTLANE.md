# Compilaciones con Fastlane

Fastlane compila paquetes firmados y los verifica antes de subirlos. Los flujos manuales de
GitHub Actions compilan Android en Ubuntu e iOS en macOS, sin EAS Build. La entrada
`publish=true` permite el envío público: producción de Google Play o App Review con publicación
automática tras aprobación. Sin esa entrada, Android solo compila e iOS llega hasta TestFlight.

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
  versiones y subir a los canales interno y producción. No hace falta para compilar.

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

## Android: GitHub Actions → Google Play

El flujo `.github/workflows/android-release.yml` usa Ubuntu 24.04, JDK 17, Node 22 y Ruby 3.3,
con una sola ejecución simultánea en `main`. Instala las herramientas del SDK necesarias
y verifica el SHA-256 de bundletool antes de usarlo. Las claves existentes se guardan como:

- `ANDROID_KEYSTORE_BASE64`: keystore de subida existente en base64.
- `ANDROID_CREDENTIALS_JSON`: JSON con `android.keystore`, alias y contraseñas. El restaurador
  reemplaza cualquier ruta local por la ruta temporal del keystore en el ejecutor.
- `GOOGLE_PLAY_JSON_KEY`: contenido JSON de la cuenta de servicio con acceso a la app.

Los secretos se restauran solo en `RUNNER_TEMP/android-signing`, con archivos privados,
y se eliminan incluso si falla un paso. El flujo verifica firma, versión, permisos bloqueados,
sonidos, mapping, splash y servicio multimedia del AAB real. Conserva AAB y recibo durante siete días.

```bash
gh workflow run android-release.yml --ref main -f publish=true
```

Con `publish=true`, `fastlane android publish` envía el AAB a producción con lanzamiento
completo y `changes_not_sent_for_review=false`. No convierte silenciosamente un fallo de revisión
en un borrador. Conserva textos e imágenes de la ficha y añade las novedades en español.
Confirmar después el código en Google Play y distinguir envío aceptado de aprobación/disponibilidad.
Si el AAB introduce un permiso nuevo, revisar también **Contenido de la aplicación**: la API puede
aceptar la subida y dejar una declaración pendiente. Para `FOREGROUND_SERVICE_MEDIA_PLAYBACK`,
la declaración requiere el caso de reproducción multimedia y un enlace público a un vídeo real
del inicio y uso de la función. Guardar la declaración y enviarla desde **Resumen de publicación**;
comprobar que no queden cambios sin enviar. El vídeo de 1.6.0 está en `store/review/`.

## iOS: GitHub Actions → TestFlight y App Store

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
En GitHub: **Actions → iOS TestFlight and App Store → Run workflow → main**.

El flujo ejecuta typecheck y pruebas unitarias, genera iOS, instala CocoaPods,
compila y verifica el IPA real: firma, identificador y equipo, versión, perfil App
Store vigente, ausencia de firma debug y permiso de micrófono, JavaScript de
producción, capacidad de audio en segundo plano y hashes del gong y los ocho ambientes. Guarda el IPA y un recibo con
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

Para publicar una nueva versión con autorización del usuario:

```bash
gh workflow run ios-testflight.yml --ref main -f publish=true
```

Después de que Apple procese el IPA, `fastlane ios publish` selecciona el número de build
de `app.json`, conserva la ficha y las capturas heredadas, actualiza solo las novedades y envía
a App Review con `AFTER_APPROVAL`. Rechaza una versión editable diferente para evitar renombrarla.
`WAITING_FOR_REVIEW` o `IN_REVIEW` significa enviada, no publicada; verificar la versión, build
y modo de publicación en App Store Connect y registrar el resultado.
