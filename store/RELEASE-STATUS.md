# Estado de pruebas — 2026-09-05

## Google Play

- App creada: Meditation Timer, español (España), gratuita.
- Paquete: `com.pau.meditationtimer`.
- App ID de Play Console: `4973367817255180345`.
- Versión `1.0.0 (2) — Primera prueba` publicada en prueba interna. La consola confirma «Activo» y «Disponible para testers internos».
- Grupo de pruebas: Meditation Timer — Pau; una cuenta del titular.
- Enlace de incorporación: https://play.google.com/apps/internaltest/4701601392540903008
- Puede mostrar temporalmente `com.pau.meditationtimer (unreviewed)`.
- Advertencia no bloqueante: no se ha adjuntado mapping de desofuscación R8/ProGuard.
- Consola: https://play.google.com/console/u/0/developers/8867876611018789857/app/4973367817255180345/tracks/4701601392540903008?tab=releases

## Apple

- Identificador registrado: `com.pau.meditationtimer`.
- Ficha creada: Meditation Timer · YogaBond. El nombre genérico Meditation Timer no estaba disponible.
- App Store Connect ID: `6809041268`; Team ID: `W543Q9Q8K5`.
- Descripción, palabras clave, versión 1.0.0 y notas de revisión guardadas; no requiere inicio de sesión. Publicación comercial configurada como manual.
- Grupo TestFlight «Pruebas internas» creado con el titular como tester.
- Credenciales renovadas por el titular. Build iOS `c23b9d2c-fa46-4e53-999f-389c9b87265c` completada: versión 1.0.0 (2).
- Envío `0d173d82-538e-4661-a6f7-f2816999a058` completado mediante la clave existente de EAS Submit; Apple ha recibido el binario. Procesamiento completado. Build 1.0.0 (2) asignada al grupo «Pruebas internas» con un tester; instrucciones específicas guardadas.
- App Store Connect muestra un acuerdo de desarrollador actualizado pendiente. No se ha aceptado.
- Consola: https://appstoreconnect.apple.com/apps/6809041268/distribution

Para crear futuras builds iOS desde este proyecto:

```sh
npx eas-cli@latest build --platform ios --profile testing --no-wait
```

Después de verificar la build concreta terminada, enviarla con su ID:

```sh
npx eas-cli@latest submit --platform ios --profile testing --id ID_DE_LA_BUILD_VERIFICADA
```

## Expo y validación

- Proyecto: https://expo.dev/accounts/paugnu/projects/meditation-timer
- EAS project ID: `e90d6b2f-30e8-4cde-8518-3e12b0a9287a`.
- Build AAB completada: `63bdac3e-3592-456d-a2bf-c3ab53b9fc03`.
- Build APK para instalación directa: `2abb49c8-d77e-4bf2-98d4-2c5cacac104c`.
- TypeScript, 17 pruebas de lógica y 12 pruebas de interfaz superadas.
- Android e iOS compilados nativamente por EAS. No se han probado físicamente en este entorno.
- APK directo completado: https://expo.dev/artifacts/eas/W9m_HjF9jv5jzhlxOmTn3lqM_PeeXIhEZlek5Tw-VEY.apk

## Antes del lanzamiento público

No hay publicación comercial. Completar capturas reales en Android/iOS, URL pública de privacidad y soporte, declaraciones de contenido/privacidad y comprobaciones físicas. Los textos de ficha, borrador de privacidad e instrucciones de pruebas están en `store/es-ES/`.

## Actualización iOS 1.0.0 (3)

- Build EAS: `3859e6b2-3163-4e73-b217-099101b399f8`, compilada correctamente.
- Envío EAS: `1809c92a-a2a3-4b03-86ab-3bbd27f52233`, binario recibido por App Store Connect.
- Apple ha procesado la build 3 y la ha distribuido al grupo Pruebas internas. App Store Connect muestra Installed 1.0.0 (3) para el tester en iPhone 15. Notas de prueba guardadas.
- Corrige zona segura y salida de Ajustes, cambia preset 20 por 45 e incorpora gong CC0 con carga local previa.
- TypeScript y 30 pruebas superadas. Pendiente de confirmar en iPhone la cabecera y reproducción audible.
- Android de Google Play sigue en build 2; estos cambios aún no se han distribuido allí.

## Cambios locales pendientes de próxima compilación

- Cierre de Ajustes con × a la derecha.
- Traducciones es, ca, en, nl, fr, ru; selector de idioma persistido.
- Calendario mensual en Registro con minutos meditados por día, sin ceros, conservando la lista.
- TypeScript y 36 pruebas verificadas; disponible en la previsualización web. TestFlight sigue en 1.0.0 (3).
- Calendario revisado: selección de hoy por defecto, lista filtrada por día, total diario y estado vacío; selección visual y diseño más compacto.
- Confirmación de guardado al finalizar antes de cero, traducida a seis idiomas. La finalización automática conserva el guardado directo.
- Reloj sustituido por halo de energía: estela en giro lento, arco independiente de progreso y pausa de animación; respeta Reducir movimiento y segundo plano.
- Distribución estable al iniciar/pausar y enlace «Una app de YogaBond» en los créditos de Ajustes.
- Revisió completa de la traducció ca a la variant valenciana, amb imperatius en les accions; selector Valencià i locale ca-ES-valencia.

## Actualización 1.1.0 — 6 de septiembre de 2026

- Icono de halo, calendario diario, seis idiomas y variante valenciana, gong real, confirmación para guardar al finalizar antes de tiempo, animación y transiciones estables.
- TypeScript, 23 pruebas de lógica y 21 pruebas de interfaz correctas.
- Android 1.1.0 (4): EAS 57233ec8-abca-4633-b8f0-2464008f2fb5 compilado correctamente. AAB publicado en prueba interna; Google Play confirma «Disponible para testers internos», 6 sept 7:01. Enlace: https://play.google.com/apps/internaltest/4701601392540903008 . Advertencia no bloqueante: falta archivo de desofuscación R8/ProGuard.
- iOS 1.1.0 (5): EAS 198c4385-4216-47cf-8160-93fbf847d122 compilado y enviado correctamente a App Store Connect; envío 48f54e5d-1531-4d93-b289-1913226c0707. Apple procesando. La sesión web ha caducado; disponibilidad en el grupo aún sin confirmar.
- Los builds preliminares Android (3) e iOS (4) de 1.1.0 quedan sustituidos y no se han distribuido.
- Valoración nativa preparada tras cinco sesiones completas, un intento persistido por instalación. Desactivada durante la beta mediante extra.publicReviewsEnabled=false; activar al publicar públicamente. No hay cobros ni propinas implementados.
- Google Play: nombre Meditation Timer · YogaBond, descripción e icono guardados en borrador de ficha; faltan recursos para la ficha pública. iOS ya utiliza ese nombre. Dentro de la aplicación se mantiene Meditation Timer.

### Desarrollo posterior a 1.1.0 (Android 4 / iOS 5)

Eliminación individual de registros desde la lista diaria, con confirmación y traducciones. Disponible en desarrollo; todavía no incluida en los binarios distribuidos arriba.

### Publicación de eliminación individual — 6 de septiembre

Validación: TypeScript, 23 pruebas de lógica y 22 de interfaz; la regresión de eliminación verifica confirmación, cancelación, actualización de totales, último registro del día y persistencia.

Builds de distribución en curso:
- Android 1.1.0 (5): 5e0d97de-17b5-40cd-bae7-e0f320cc01b1.
- iOS 1.1.0 (6): edf803b4-a297-4f00-b960-fb180a3fad88.

Google Play: borrador de versión interna 3 con notas de la corrección. App Store Connect sigue con la sesión web cerrada; envío por EAS disponible.

Resultado de distribución:
- Android 1.1.0 (5) publicado; Google Play confirma «Disponible para testers internos», 6 sept 7:26. https://play.google.com/apps/internaltest/4701601392540903008 .
- iOS 1.1.0 (6) compilado y enviado correctamente a App Store Connect. Procesamiento/disponibilidad en TestFlight sin confirmar porque la sesión web sigue caducada.

### Preparación de publicación pública iOS

Sesión recuperada. Ficha española actualizada a versión 1.1.0 con descripción, palabras clave, copyright y notas de revisión. Publicación automática tras aprobación seleccionada. Contacto de revisión: datos profesionales de YogaBond. Apple muestra acuerdo de desarrollador actualizado pendiente de aceptación por el titular. Continúan pendientes páginas públicas de privacidad/soporte, enlace de privacidad en la app y capturas de iPhone/iPad.

Ficha pública preparada en App Store Connect: subtítulo «Temporizador, gong y registro», categoría Health & Fitness, clasificación 4+, derechos de contenido de terceros (gong CC0), declaración de no ser dispositivo médico, precio cero y disponibilidad en 175 regiones. Mac y Vision Pro desmarcados para limitar el lanzamiento a iPhone/iPad. Privacidad «Data Not Collected» guardada como borrador, aún sin publicar por faltar la URL. No se ha enviado a revisión. Consentimiento de alojamiento en yogabond.es pendiente de respuesta; acuerdo actualizado y capturas también pendientes.

## 2026-09-06 · Public iOS preparation: deployed YogaBond pages
- Apple privacy URL saved and Data Not Collected responses published after explicit user confirmation.
- Spanish support URL: https://www.yogabond.es/es#meditation-timer-support
- Spanish marketing URL: https://www.yogabond.es/es/meditation-timer
- App Settings now includes privacy/support links in all six languages; public native review policy enabled (one attempt after five completed sessions).
- iOS 1.1.0 build 7 requested: b3a193ec-609d-4b62-ac1a-eb52b0a7b560. EAS submission scheduled: 5d6ae3f8-d37f-4193-81b8-f9079b619e0b. Completion not yet verified.
- TypeScript and 23 unit tests passed. E2E: 20 passed initially; two startup/time-limit failures passed when rerun serially (22 scenarios total).
- Native store screenshots still absent: iPhone 6.5 inch (1242x2688 or 1284x2778); iPad 12.9/13 inch (2048x2732 or 2064x2752). YogaBond landing screenshots are explicitly web captures at 390x844; not uploaded as native captures.
- Updated Apple Developer Program License Agreement open at /account/agree/XG8DNV4HYY/terms; separate acceptance confirmation requested and pending.
- App is still Prepare for Submission, not sent for App Review/publicly released.

- iOS build 7: EAS Submit confirmó carga correcta en App Store Connect (log /tmp/public-ios-submit.log). Pendiente selección para revisión.
- Seis capturas originales de Chrome guardadas en store/ios-public/screenshots; procedencia y dimensiones en README.md. No subidas a Apple.

- Se subieron las seis capturas de Chrome por petición explícita del usuario: tres iPhone a 1242×2688 y tres iPad a 2048×2732. Exportaciones PNG reescaladas proporcionalmente, sin cambios de contenido, en screenshots/store. Apple mostró 3/10 para ambos dispositivos.
- Contrato pendiente abierto en la pestaña del usuario: https://developer.apple.com/account/agree/XG8DNV4HYY/terms . No aceptado por el agente.
- Tras recargar, Apple Developer muestra el contrato XG8DNV4HYY emitido el 18 de agosto de 2026 y aceptado el 6 de septiembre de 2026; el agente no pulsó Agree. No queda pendiente esta aceptación.
- Capturas iPhone persistentes tras recargar (3/10); iPad subida confirmada (3/10).

## 2026-09-06 11:07 Europe/Madrid · Enviada a App Review
- Versión iOS 1.1.0 (7) seleccionada, guardada y enviada a revisión.
- Apple confirmó «1 Item Submitted» y estado final «Waiting for Review».
- Submission ID: 5793463f-8940-497d-a2d9-0746901d0b83.
- Seguimiento: https://appstoreconnect.apple.com/apps/6809041268/distribution/reviewsubmissions/details/5793463f-8940-497d-a2d9-0746901d0b83
- Publicación automática después de aprobación seleccionada. Todavía no aprobada ni públicamente disponible.

## Android public launch preparation — 2026-09-06

- Google Play saved: privacy URL, unrestricted app access, no ads, no advertising ID, non-government, no financial features, health use for stress management/relaxation, adult target audience, data safety (no collection/sharing), IARC PEGI 3 / Everyone. IARC terms explicitly authorized by Pau.
- Category: Salud y fitness; public support info@yogabond.es; HTTPS marketing page.
- Final Android build 1.1.0 (7): `66e47225-fbf1-49ff-8118-d3daf67f33f0`, FINISHED. Local bundle `/tmp/meditation-timer-1.1.0-7.aab`.
- Build 6 superseded. Removed unused FOREGROUND_SERVICE permissions and disabled expo-audio background playback config plugin. Actual build 7 AAB manifest verified: no FOREGROUND_SERVICE permissions, no AudioControlsService; exact alarms, notifications and RestoreFocusReceiver retained.
- Three new original Chrome captures at 432×768, exported proportionally to 1080×1920 under `store/android-public/screenshots/`. Web captures, no fabricated history/native UI. Google feature graphic reuses original app icon and Raleway.
- Store resources/upload and public production submission still in progress; not yet submitted.

### Android public submission confirmed — 2026-09-06

- Uploaded AAB 7 (1.1.0), target API 36, Android 7/API 24 minimum, ~21 MB Play download.
- Created production release `1.1.0 (7) · Lanzamiento público`, full launch to 176 countries/regions plus rest of world.
- Spanish listing saved with icon, feature graphic, three 9:16 phone captures and current functionality including individual session deletion. Icon and feature graphic labeled AI-assisted; real Chrome captures not labeled synthetic.
- Confirmed `Enviar 11 cambios a revisión`. Google Play shows **Cambios en revisión**; automated preliminary checks still running (up to 14 minutes displayed), followed automatically by app review. Managed publishing is disabled, so approved changes publish automatically.
- Only release validation warning: no R8/ProGuard deobfuscation file; no blocking validation errors.
- Not yet publicly available. Review outcome remains external to this submission.

- Internal channel updated to the same AAB 7, release `1.1.0 (7) · Versión de lanzamiento`, available to internal testers on 6 Sep 2026 at 12:02 Europe/Madrid. Supersedes build 5 and removes it from the active release.
- Google Play Content overview now confirms **Ya estás al día** with no outstanding declarations; the obsolete foreground-service warning is resolved.
- Public submission remains **Cambios en revisión**, preliminary checks up to 10 minutes remaining at final verification. No further action pending from Pau at this point.

## Unified app name — 2026-09-07

Google rejected the initial Android public submission for a store listing/name mismatch. The reviewer screenshot showed the installed launcher name “Meditation Timer” while the store lists “Meditation Timer · YogaBond”. Pau chose to use the full name everywhere.

- Updated Expo native display name, web name/short name, in-app header and settings credits to `Meditation Timer · YogaBond`.
- Store names already use this exact name. Bundle/package identifiers and storage keys are unchanged.
- `npm run typecheck` passed. Local web preview shows the full title.
- New Android build 8: `03c49c23-ce03-41d9-bf73-6025c7fc74a7`.
- New iOS build 8: `2474da96-4385-4a96-86f4-4a610f9c735f`.
- EAS accepted both builds using existing credentials; compilation pending. Neither new binary has been submitted to a store yet.

### Build 8 submission update — 2026-09-07

- Both EAS builds finished. Downloaded artifacts to `/tmp/meditation-timer-8.aab` and `/tmp/meditation-timer-8.ipa`; verified full Android resource name and iOS `CFBundleDisplayName` as `Meditation Timer · YogaBond` (iOS build number 8).
- Android production release `1.1.0 (8) · Nombre unificado` saved, excluding build 7. Replaced the old timer store screenshot with `store/android-public/screenshots/phone-timer-name8.png`: original in-app Chromium web capture at 432×768, proportionally exported to 1080×1920. Existing settings/calendar captures retained.
- Sent all 11 changes to Google Play. Console confirms **Cambios en revisión** for build 8, with preliminary checks still running. This is a submission, not approval/public availability.
- iOS build 8 uploaded successfully through EAS Submit, submission `e152f10c-0682-4235-a3c0-6a1969c74734`. Success log: `/tmp/name-ios-submit.log`.
- Apple browser session expired. Asked Pau to sign in again. Still pending: confirm Apple processing, select build 8 for public review, update store screenshots that show the previous title, and submit the corrected version. Do not interpret the EAS upload as an App Review submission. Last confirmed public iOS submission was build 7; its current review status has not been verified.

## 1.2.0 (9) — 8 de septiembre de 2026 · pendiente de compilar

Cambios de producto posteriores a la build 8, ninguno distribuido todavía.

- Cabecera eliminada: la pantalla principal ya no muestra el nombre de la app. `expo.name` y el
  nombre del lanzador siguen siendo `Meditation Timer · YogaBond`, que es lo que Google comparaba.
- Sonido de fondo en bucle con fundido cruzado, seleccionable bajo el botón de inicio. Dos ambientes
  sintetizados propios en `assets/ambience/`, provisionales, pendientes de sustituir por CC0 reales.
  Comparte el volumen del gong; solo suena con el temporizador en marcha.
- Ajustes pasa a una rueda discreta bajo el play. Finalizar solo aparece en pausa o al completar.
- Distribución en dos columnas en pantallas bajas; antes el botón de inicio quedaba fuera.

Correcciones de revisión de tienda aplicadas en esta versión:

- `SYSTEM_ALERT_WINDOW` (lo añade `expo-dev-client`) ahora se elimina vía `blockedPermissions`.
  **Verificar en el AAB de la build 9**, como se hizo con FOREGROUND_SERVICE en la 7.
- Pantalla de arranque con fondo `#181613`; antes era blanca y destellaba en cada arranque en frío.
- Icono monocromo de Android 13+ regenerado a 1024 y enlazado en `adaptiveIcon.monochromeImage`.
  `icon.png` y `adaptive-icon.png` no han cambiado: el icono de las tiendas sigue igual.
- `enableProguardInReleaseBuilds` activado para que el AAB lleve el mapping de R8 y Play pueda
  desofuscar. Sin shrink de recursos. **Riesgo: R8 cambia el comportamiento en release; la build 9
  necesita prueba en dispositivo antes de enviarse.** Se revierte quitando el plugin de app.json.
- Permiso de avisos solicitable desde Ajustes, en vez de solo al pulsar iniciar.
- Límites de escalado tipográfico en la hoja de ajustes y en los textos de la pantalla principal.
- Copia de ficha en inglés preparada en `store/en-GB/listing.md`; sin subir. Necesita páginas de
  privacidad y soporte en inglés, que hoy no existen.

Validación: TypeScript, 27 pruebas de lógica, 32 escenarios Playwright y expo-doctor 21/21.
Sin compilación nativa: este entorno no tiene JDK, Android SDK ni Xcode.

Pendiente y no hecho aquí:

- Capturas nativas de tienda. Las de `store/*/screenshots/*.png` se regeneraron el 8 de septiembre
  a resolución exacta con `scripts/capture-screenshots.ts`, pero **siguen siendo capturas web**.
- iOS: la última versión enviada a revisión es la 1.1.0 (7), con el nombre antiguo del lanzador.
  La build 8 se subió por EAS Submit y nunca se seleccionó. Falta iniciar sesión, elegir la build
  nueva, actualizar capturas y enviar.
- Google Play: la ficha muestra capturas de la build 8, con la cabecera que ya no existe.

## 2026-09-08 · Estado real de iOS y revisión de cambios remotos

- Tras recuperar la sesión de Apple, se confirmó que 1.1.0 (7) seguía en Waiting for Review.
- Se canceló el envío para sustituirlo. Apple confirmó **Developer Rejected**, una retirada solicitada por nosotros, no un rechazo de Apple.
- El usuario cambió la tarea a recuperar y revisar el repositorio antes de seleccionar/reenviar otro build. **Actualmente no queda ese envío esperando revisión.** Build 8 sigue subido, pero no seleccionado ni reenviado.
- Recuperado `origin/main` mediante fast-forward a `fb2cf04`, sin conflictos ni cambios locales previos. Contiene la futura 1.2.0 (9).
- Sustituidos dos WAV sintéticos por cuatro grabaciones CC0 estéreo: lluvia, mar, viento y pájaros al amanecer. Fuentes/licencias, edición reproducible y hashes en `assets/ambience/`. Sin envío a tiendas en esta tarea.
- Corregido `enableProguardInReleaseBuilds` por `enableMinifyInReleaseBuilds`, que es la opción efectiva en Expo SDK 57. La introspección confirma `android.enableMinifyInReleaseBuilds=true`; el AAB final aún requiere validación nativa.
- Validación de esta tarea: TypeScript, 27 pruebas de lógica y 33 escenarios web correctos; repetida con éxito la prueba de los cuatro bucles después de la edición final de lluvia. Revisión y límites en `docs/REVIEW-2026-09-08.md`.

## 2026-09-08 · Capturas actualizadas con los cuatro ambientes

- Generadas y revisadas visualmente 24 capturas PNG originales de Chrome sobre la exportación web de producción, sin indicadores de Expo, retoques ni reescalado.
- Ocho vistas por formato: lluvia, olas, viento, pájaros, ejecución, pausa, ajustes y calendario. Registro vacío; la sesión real de prueba se descartó.
- Android 1080×2400; iPhone 1242×2688; iPad 2048×2732. ZIP, hojas de contacto y manifiesto SHA-256 en `store/captures-2026-09-08/`.
- Actualizado el script reproducible `scripts/capture-screenshots.ts`. Son capturas web, no nativas. No se han subido ni se ha enviado otra versión a las tiendas en esta tarea.

## 2026-09-08 · Compilación y subida 1.2.0 (10)

- Solicitada compilación EAS para ambas plataformas con perfil `testing` (distribución store). Incrementados los contadores locales a 10.
- Android terminado: `e33cb84c-a3de-4ae7-b894-c60961a759e9`, versión 1.2.0 (10). AAB descargado en `/tmp/meditation-timer-1.2.0-10.aab`, SHA-256 `1a177cb040ba902fe79fb81c12d0c9b0cf17dbb5f64ffe4f35bdcad943800673`.
- Validación del AAB: nombre completo presente en recursos, paquete y versión correctos; cuatro M4A idénticos por SHA-256 a los originales preparados; mapping R8 incluido; ausentes RECORD_AUDIO, SYSTEM_ALERT_WINDOW y FOREGROUND_SERVICE. No sustituye una prueba de ejecución nativa en dispositivo.
- Google Play: guardadas descripción con cuatro ambientes y ocho capturas nuevas de teléfono. Subido AAB 10 a un nuevo borrador de producción, excluyendo el 8. Estado de envío final pendiente de confirmar más abajo.
- **iOS bloqueado:** EAS rechazó crear la compilación por agotamiento del cupo gratuito mensual, renovación indicada el 1 de octubre de 2026. No existe compilación iOS 1.2.0 (10) terminada ni enviada. Solicitado al usuario ampliar el plan si desea compilar antes; no se ha contratado ningún plan.
- Sesión de App Store Connect caducada; solicitado inicio de sesión. Sigue pendiente sustituir el envío retirado y actualizar las capturas de Apple.
- **Envío Android confirmado:** pulsados «Enviar 3 cambios a revisión» y «Reiniciar revisión». Google muestra **Cambios en revisión** para **1.2.0 (10) · Sonidos ambiente**, junto con ficha actualizada y declaraciones existentes. Sustituye el envío de la build 8 y reinicia su plazo. Comprobaciones rápidas automáticas aún en curso (hasta 14 minutos); no equivale a aprobación ni disponibilidad pública.
- Única advertencia de validación: aumento del tamaño de descarga por los ambientes. Google estima 38 MB para nuevas descargas; sin pérdida de dispositivos admitidos. Publicación gestionada desactivada, lanzamiento al 100 % tras aprobación.

## 2026-09-09 · Android publicado e iOS reanudado

- Verificado en Play Console: última publicación el 8 de septiembre; producción **Activa**, última versión **1.2.0 (10) · Sonidos ambiente**, 177 países/regiones. Ya no hay cambios pendientes en Resumen de publicación.
- El usuario recibe un aviso IARC «Live Rating Notice»: clasificaciones generadas a partir del cuestionario, no un rechazo. El correo por sí solo no acredita publicación; el estado anterior se comprobó directamente en Play Console.
- Tras confirmar el usuario la ampliación de Expo, EAS acepta iOS **1.2.0 (11)**, build `eec31a79-8eab-4d75-ad55-c455a91c1012`. El contador iOS sube de 10 a 11, Android permanece 10.
- Programada subida a Apple mediante EAS Submit `63609d42-8b35-44da-8a2c-881a9026ab64`, a la espera de terminar la compilación. Programación no equivale a subida terminada ni envío a App Review.
- Solicitado inicio de sesión en App Store Connect para completar ficha, capturas y revisión pública.
- Recuperada la sesión de Apple durante la tarea. Guardada ficha **1.2.0**, descripción con ambientes y notas de revisión; retirado el vínculo a build 7. Tras recargar, estado **Prepare for Submission** y sin build seleccionada, esperando la nueva.
- Subidas ocho capturas nuevas por dispositivo (iPhone 6.5 pulgadas e iPad 13 pulgadas); temporizador movido a primera posición. Son las capturas originales de Chrome preparadas el 8 de septiembre, no capturas nativas.
- Compilación iOS **FINISHED**, IPA descargado en `/tmp/meditation-timer-1.2.0-11.ipa`; SHA-256 `8eeeefdc9e443eb5aaafc4cb88a86c1ff1de73197f6157046f99079ab3feed22`. Verificados CFBundleDisplayName completo, identificador, versión 1.2.0, build 11 y los cuatro M4A idénticos por SHA-256. Sin UIBackgroundModes, coherente con ambientes solo en primer plano. Validación del paquete, no prueba en dispositivo.
- EAS Submit ha empezado a transferir la build a App Store Connect. La validación de ficha de Apple solo exige elegir una build; las capturas y demás metadatos cumplen los requisitos de formulario.
- **Subida iOS confirmada:** EAS Submit informa «Successfully uploaded the new binary to App Store Connect». TestFlight confirma **Version 1.2.0, Build (11): Processing**, creada el 9 de septiembre a las 16:45 (hora local). No se ha enviado todavía a revisión pública: Apple aún no permite seleccionar la build en procesamiento.
- **Envío público iOS confirmado:** Apple terminó de procesar la build 11, seleccionada y guardada en la ficha 1.2.0. Pulsados «Add for Review» y «Submit for Review»; confirmación **1 Item Submitted**, borradores 0. Envío `aa6459e7-3439-48c6-9125-60e92790d45c` en https://appstoreconnect.apple.com/apps/6809041268/distribution/reviewsubmissions/details/aa6459e7-3439-48c6-9125-60e92790d45c . Publicación automática tras aprobación seleccionada. Pendiente de revisión, no aprobado ni publicado todavía.

## 2026-09-12 · Selección de siete ambientes y versión 1.3.0

- Integradas las siete grabaciones elegidas por el usuario: lluvia B, mar A, viento C, pájaros A, campanas C, ruido marrón C y tormenta T8 de MrAuralization, titulada «Tormenta lejana».
- Audio local sin conexión; nivel equilibrado y unión circular. Créditos y enlaces de licencia en Ajustes (seis Pixabay Content License y una CC BY 4.0); fuentes, adaptaciones y hashes en `assets/ambience/`.
- Verificación: TypeScript, 27 pruebas de lógica y 34 escenarios web correctos, incluidos los siete bucles y los créditos. Comprobaciones numéricas de clipping, padding y discontinuidad correctas. No sustituye una prueba nativa en dispositivo.
- Confirmado por App Store Connect API: iOS 1.2.0 (11) ya está READY_FOR_SALE. Recuperado acceso mediante la clave existente de EAS Submit; no es necesario iniciar sesión web para tramitar esta versión.
- Compilaciones EAS solicitadas: Android 1.3.0 (11), `d387f77e-2172-4c74-ac07-adc74a917f0f`; iOS 1.3.0 (12), `a6e6efa0-c7c4-496f-b395-0f5d31f9a104`. Subida iOS programada `f152854a-0e03-4db5-ab51-2570e8abbb5c`.
- Creada ficha iOS 1.3.0 por API, con descripción/novedades/notas actualizadas, contactos de revisión conservados y ocho capturas existentes por dispositivo. Publicación automática tras aprobación. Google Play: descripción guardada y borrador de producción 1.3.0 (11) preparado, pendiente del AAB.
- iOS EAS FINISHED; verificado IPA 1.3.0 (12), identificador y nombre correctos, siete M4A idénticos por SHA-256 y sin UIBackgroundModes. SHA-256 del IPA: `5a06cbc62a0a015b1f8ed339d8f3ec0444dff8c238c274035879a7fda537e25c`. Subida a Apple en curso; todavía no enviado a revisión.
- **iOS enviado a App Review por API:** build 12 válida asociada a 1.3.0; envío `b1589fcb-87c5-4110-8397-a6e57318249f`, confirmado WAITING_FOR_REVIEW el 12 de septiembre a las 07:37 (hora local). No aprobado todavía.
- Android EAS FINISHED; AAB 1.3.0 (11) verificado: siete M4A idénticos por SHA-256, paquete/nombre correctos, splash #181613, mapping R8 presente y sin RECORD_AUDIO, SYSTEM_ALERT_WINDOW ni FOREGROUND_SERVICE. SHA-256: `07b050b6e69e1314c3cbe4d6bfbd5ed8feacb25fae0c27b1a284b164c8e62233`. Subida a Google Play en curso.
- **Android enviado:** confirmados «Enviar 2 cambios a revisión» y «Enviar cambios a revisión». Play Console muestra **Cambios en revisión** para 1.3.0 (11) y descripción actualizada. Comprobaciones rápidas en curso (hasta 14 minutos); publicación gestionada desactivada, lanzamiento al 100 % en los países actuales tras aprobación. No aprobado ni publicado todavía.
- Google Play estima 70,1 MB de descarga (+32 MB); única advertencia por tamaño, sin pérdida de dispositivos compatibles.

## 2026-09-13 · Tanpura elegida y fundidos sin gong

- Seleccionada la grabación de Maxwell Flowers en Insight Timer (09:59). Pendiente del permiso escrito de redistribución exigido por la fuente y del archivo de audio; no incorporada ni publicada. Selección y borrador de solicitud no enviado en `store/TANPURA-SELECTION.md`.
- Confirmado que los fundidos existentes funcionan con ambos gongs desactivados. Añadido escenario web que mide niveles intermedios de entrada/salida hasta silencio al completar, y ausencia de gong. No ha sido necesario cambiar el motor de reproducción.
- TypeScript, 27 pruebas de lógica y 35 escenarios web correctos. Sin nueva compilación ni envío a tiendas; no es una prueba nativa en dispositivo.

## 2026-09-13 — Tanpura added locally

- Added the user-selected “Electronic Tanpuar 4” by sankalp (Freesound 155497, CC BY 4.0) as the eighth ambience, Tanpura. Bundled HQ-preview-derived AAC, with attribution and adaptation notice in Settings and source documentation.
- Removed the initial silence and final decay; matched pluck envelopes and used a 12-second crossfade to create a 239.932-second loop. Decoded audio has no padding or clipping; the quietest 100 ms is −29.89 dBFS. Seam preview: `store/audio-previews/tanpura-loop-seam.wav` (join at 6 s).
- Validation: TypeScript and all 27 unit tests pass; all 35 Playwright tests pass, including eight-file loop playback, Tanpura persistence, credits, and Tanpura fade-in/out with both gongs disabled.
- This addition has not been built or submitted to stores. Native iOS/Android loop playback still needs device verification; the previously submitted release does not contain Tanpura.

## 2026-09-13 · 1.4.0 con Tanpura para TestFlight y pruebas internas

- El usuario autoriza subir a TestFlight y Android. Se prepara el canal interno de Google Play, conservando la publicación pública 1.3.0.
- Estado previo confirmado: iOS 1.3.0 (12) READY_FOR_SALE; Android 1.3.0 (11) publicado al 100 %, sin cambios pendientes.
- Compilaciones EAS testing solicitadas: Android 1.4.0 (12), `7580ac22-32fe-4a12-b939-5e786225db8c`; iOS 1.4.0 (13), `19558300-67bd-4620-9573-61ec1c9339ac`. Ambas aceptadas y en curso; todavía sin subida a las tiendas.
- iOS EAS FINISHED. IPA 1.4.0 (13) verificado: identificador/nombre correctos, ocho M4A idénticos por SHA-256 y sin UIBackgroundModes. SHA-256 del IPA: `d07606b142ba18593b445b558a8af7a28ef5716270780dda6f3d69359baf460b`.
- Subida iOS programada: `92746038-ba39-47c2-91df-88889bc48e0b`. El primer intento con notas de prueba fue rechazado antes de crear la subida por una restricción de plan de EAS; el segundo, sin ese parámetro, fue aceptado. No se ha cambiado el plan.
- **TestFlight disponible:** EAS Submit FINISHED; Apple build `c09f077f-400e-4e38-be3c-0cd14b6a4582` (13) VALID e internalBuildState IN_BETA_TESTING. Grupo existente «Pruebas internas» con acceso automático a todas las builds. Notas de prueba es-ES guardadas por App Store Connect API. No se ha enviado 1.4.0 a App Review público.
- Android EAS FINISHED. AAB 1.4.0 (12) verificado: ocho M4A idénticos por SHA-256, paquete y versión correctos, mapping R8 incluido, sin RECORD_AUDIO, SYSTEM_ALERT_WINDOW ni FOREGROUND_SERVICE. Subida iniciada a la versión 5 del canal interno de Google Play.
- SHA-256 del AAB 1.4.0 (12): `abaf7f4df4c3863755d0f6e5a089977b03be17487131299965144f107b28affb`. Google Play procesó el paquete sin errores: única advertencia por tamaño (73,6 MB; comparado con la antigua build 7 del canal interno), sin pérdida de dispositivos compatibles.
- **Android disponible para testers internos:** confirmados «Guardar y publicar» y el diálogo final. Google Play muestra canal Activo, última versión **1.4.0 (12) · Tanpura**, **Disponible para testers internos**, publicada el 13 de septiembre a las 06:42. Enlace de acceso del canal: https://play.google.com/apps/internaltest/4701601392540903008 . Puede tardar en propagarse a los dispositivos.
- Objetivo completado: TestFlight 1.4.0 (13) y Google Play interno 1.4.0 (12). La versión pública continúa siendo 1.3.0. Validación de paquetes y subida, no prueba de reproducción en dispositivo.

## 2026-09-13 · Publicación de 1.4.0 autorizada en ambas tiendas

- El usuario autoriza publicar la app en todas las stores. Se reutilizan las compilaciones verificadas de TestFlight y Google Play interno, sin nueva compilación.
- **iOS enviado a App Review:** ficha 1.4.0 `8ab6eaef-e984-4819-b397-08b45f24ead3`, build 13 `c09f077f-400e-4e38-be3c-0cd14b6a4582`. Descripción y notas actualizadas con Tanpura, ocho capturas conservadas por dispositivo. Publicación AFTER_APPROVAL. Envío `9f615fed-58c6-4152-8078-ef351ced07e5`, confirmado WAITING_FOR_REVIEW. Todavía no aprobado ni publicado.
- Android: promovida build 12 desde pruebas internas al borrador de producción 1.4.0 (12) · Tanpura, versión de canal 5. Validación sin incidencias, sin pérdida de dispositivos; lanzamiento al 100 % en todos los países de destino actuales. Guardado, pendiente de enviar a revisión.
- **Android enviado a revisión:** descripción actualizada a ocho sonidos, incluida Tanpura. Confirmados «Enviar 2 cambios a revisión» y «Enviar cambios a revisión». Google Play muestra **Cambios en revisión** para producción 1.4.0 (12) y la ficha es-ES. Comprobaciones rápidas en curso (hasta 14 minutos); publicación gestionada desactivada, lanzamiento completo tras aprobación. No equivale a aprobación ni disponibilidad pública.
- Envíos públicos completados en ambas tiendas. App Store 1.4.0 (13): WAITING_FOR_REVIEW y AFTER_APPROVAL, enviado 2026-09-13T04:58:32Z. Google Play 1.4.0 (12): Cambios en revisión. La aprobación depende de cada tienda.
