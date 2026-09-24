# Android local con Fastlane

Fastlane compila un AAB firmado y lo verifica antes de permitir una subida al canal
interno de Google Play. No usa EAS Build ni modifica el canal de producción. iOS
sigue usando el proceso existente; la automatización con macOS está pendiente.

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
