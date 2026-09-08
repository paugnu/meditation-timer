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
