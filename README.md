# Meditation Timer · YogaBond

Temporizador de meditación para Android, iOS y web, hecho con **Expo SDK 57 + React Native + TypeScript**.
Sin anuncios, sin cuentas, sin backend y sin analítica: todo —preferencias, sesión en curso e historial—
se guarda solo en el dispositivo. Publicado bajo la marca YogaBond en Google Play y App Store.

Versión preparada para iOS: `1.5.1` (`buildNumber` 16). Android publicado: `1.5.0` (`versionCode` 16); incrementar su código antes de otra subida.
El estado de compilación y envío se registra en `store/RELEASE-STATUS.md`.
Identificador en ambas plataformas: `com.pau.meditationtimer`.

---

## Qué hace

**Sesión**
- Duración de 1 a 180 minutos, con accesos rápidos (5, 10, 15, 30, 45, 60). Por defecto 20.
  Tocar el tiempo abre un modal: los accesos rápidos guardan y cierran; la rueda permite elegir
  cualquier minuto y guardar, o cancelar sin cambios.
- Iniciar, pausar, continuar y finalizar. Mientras la sesión corre la pantalla ofrece solo pausar:
  para terminar antes de tiempo se pausa primero. Al finalizar antes de tiempo pregunta si quieres
  guardar la meditación; el reloj se congela antes de preguntar, así que decidir no cuenta como
  práctica.
- Cuenta atrás basada en una **fecha límite absoluta**: cerrar y reabrir la app no reinicia nada
  y una sesión vencida en segundo plano aparece como completada, sin gong tardío.
- Halo animado en lugar de esfera: estela en giro lento de 24 s y arco de progreso independiente.
  Respeta «Reducir movimiento» y se detiene en segundo plano.

**Sonido y avisos**
- Gong al inicio y al final con interruptores independientes, volumen y escucha previa.
  Reanudar una pausa no vuelve a sonar.
- Notificación local al terminar en Android/iOS, con canal propio para el sonido del gong.
  Se cancela al pausar o finalizar. El gong en primer plano usa el volumen de la app;
  el de la notificación, el canal y volumen del sistema.
- Sonido de fondo en bucle, elegible bajo la cuenta atrás con dos flechas o deslizando.
  Solo suena mientras el temporizador corre: elegirlo en reposo no reproduce nada, y pausar
  o terminar lo desvanece. Cambiar de ambiente hace fundido cruzado, nunca un corte.
  Comparte el volumen del gong, así que un único deslizador gobierna todo lo que suena.
  Al salir de la app el sistema lo detiene; al volver reaparece con un fundido de entrada.
- El gong y el fondo se turnan: con gong de inicio, el ambiente espera y entra bajo su cola;
  al terminar, el ambiente se retira mientras el gong suena. El retardo se calcula desde la
  duración real del gong, no de una constante.

**Sin interrupciones**
- Android: No molestar automático mediante un módulo Expo local en Kotlin, con permisos explícitos
  de política de notificaciones y alarmas exactas. Restaura el estado anterior al terminar, pausar,
  reiniciar el teléfono o actualizar la app.
- iOS: instrucciones dentro de Ajustes para activar Concentración manualmente (el sistema no permite
  automatizarlo).

**Registro**
- Calendario mensual (semana desde el lunes) con minutos reales por fecha local de inicio; los días
  vacíos no muestran cero y las sesiones de menos de un minuto aparecen como `<1`.
- Lista del día seleccionado con hora, tiempo efectivo, objetivo y estado, más el total acumulado.
  Las pausas no suman tiempo. Borrado individual de registros con confirmación.

**Interfaz**
- Arranque con el mismo halo de la sesión: imagen nativa estática, giro durante la carga y
  fundido al estar listos la fuente y los datos. Respeta «Reducir movimiento».
- Pantalla principal sin título ni cabecera: arriba el halo y la cuenta atrás, después el botón
  de inicio, y por debajo la zona de controles con el selector de sonido de fondo y una rueda de
  ajustes discreta.
- Temas noche/día y cuatro colores de acento (terracota, azul, verde, rosa), paleta YogaBond con
  titulares en Raleway incluida localmente.
- Seis idiomas seleccionables y persistidos: español, català/valencià, English, Nederlands, français,
  русский. 138 claves por idioma, con los mismos tokens de interpolación (hay una prueba que lo verifica).
  El criterio de la variante valenciana está en [docs/VALENCIAN.md](docs/VALENCIAN.md).
- Opción de mantener la pantalla encendida durante la sesión.
- Atenuación opcional durante la meditación tras 10 segundos sin tocar la pantalla. Un toque
  recupera el brillo sin accionar los controles y reinicia la espera. Pausar, completar o salir
  de la app restaura el brillo. Android recupera el modo de brillo del sistema; iOS respeta
  cambios manuales posteriores. En web se simula con una capa oscura.
- En pantallas bajas (teléfono en horizontal, Split View) el halo pasa a la izquierda y los
  controles a la derecha, para que el botón de inicio nunca quede fuera de la pantalla.
- El permiso de avisos se puede conceder desde Ajustes, sin esperar a que lo pida el botón de
  inicio. Los textos limitan su escalado para que las filas no se rompan con tamaños grandes.
- Petición de valoración nativa una sola vez por instalación, tras cinco sesiones completas y nunca
  durante una meditación.

---

## Ejecutar

Requisitos: Node.js ≥ 22.13 y npm.

```bash
npm ci
npm run web
```

Expo Go sirve para probar la lógica, pero **no** incluye el módulo Android de No molestar ni instala
el sonido de notificación. Para la integración completa hace falta una *development build*:

```bash
npm run android   # requiere Android SDK + JDK y emulador o dispositivo
npm run ios       # requiere macOS + Xcode
```

Para compilar Android y subirlo a pruebas internas sin EAS Build, ver
[el flujo local con Fastlane](docs/FASTLANE.md).

## Verificar

```bash
npm run typecheck
npm test          # 32 pruebas de lógica (node:test vía tsx)
npm run test:e2e  # 43 escenarios Playwright sobre la vista web; necesita Google Chrome
npx expo-doctor
npx expo export --platform all
npx expo prebuild --no-install
```

`playwright.config.ts` levanta `expo start --web` en el puerto 8081 a 390×844 y usa el canal `chrome`;
cámbialo a Chromium si no lo tienes. Resultados y pruebas físicas pendientes en
[docs/VALIDATION.md](docs/VALIDATION.md); plan y matriz de extracción en [docs/PLAN.md](docs/PLAN.md).

## Compilar y distribuir

Perfiles en `eas.json`: `development` (cliente de desarrollo), `preview` (APK interno / simulador iOS),
`production` y `testing` (AAB de tienda + envío a canal interno de Play y a TestFlight).

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform ios --profile testing --no-wait
npx eas-cli@latest submit --platform ios --profile testing --id ID_DE_LA_BUILD
```

El estado real de cada build, envío y revisión en Google Play y App Store Connect se lleva en
[store/RELEASE-STATUS.md](store/RELEASE-STATUS.md), junto con los textos de ficha en `store/es-ES/`,
`store/android-public/` y `store/ios-public/`.

---

## Comportamiento por plataforma

| Función | Android instalado | iOS instalado | Web |
| --- | --- | --- | --- |
| Temporizador, ajustes, sesión persistente | Sí | Sí | Sí |
| Gong con la app visible | Sí | Sí | Sí, tras una interacción |
| Aviso con pantalla bloqueada | Notificación local | Notificación local | No |
| No molestar automático | Con permisos de política y alarmas exactas | No permitido por iOS | Manual |
| Pantalla encendida | Sí | Sí | Según el navegador |

Los permisos, el modo silencio/Concentración, las políticas de batería del fabricante y el cierre
forzado pueden impedir o retrasar los avisos: no se promete ejecución de JavaScript en segundo plano.
Android mantiene las alarmas permitidas cuando activa No molestar, así que no se bloquea toda
interrupción posible. Si el usuario fuerza la detención de la app, Android puede cancelar la alarma de
restauración y habrá que revisar No molestar a mano.

## Estructura

```
App.tsx                      Pantalla principal, modal de confirmación y avisos
index.ts                     registerRootComponent
src/timer.ts                 Máquina de estados pura, recuperación y formato
src/history.ts               Registro, validación y tiempo efectivo sin pausas
src/calendar.ts              Agrupación por día local y cuadrícula del mes
src/ambience.ts              Lista de sonidos de fondo y recorrido del selector
src/settings.ts              Preferencias, valores por defecto y saneado
src/i18n.ts + src/locales/   Seis diccionarios e interpolación
src/theme.ts                 Paleta YogaBond y fuente de titulares
src/reviewPolicy.ts          Política pura de valoración (un intento por instalación)
src/hooks/useMeditation.ts   Sesión, persistencia, audio, permisos y ciclo de vida
src/hooks/useDimming.ts      Atenuación, toque para recuperar brillo y ciclo de vida
src/brightness.ts            Escrituras de brillo serializadas y restauración
src/hooks/useAmbience.ts     Motor de fundido cruzado del sonido de fondo
src/components/              ClockFace (halo), SettingsPanel, HistoryPanel, HistoryCalendar, Icon
src/services/                storage (AsyncStorage), alerts (notificaciones), focus, reviews
modules/meditation-focus/    Módulo Expo local en Kotlin para No molestar (Android)
assets/gong.wav              «Meditation Gong» de Marble Toast (CC0); licencia en gong-LICENSE.md
assets/ambience/             Grabaciones seleccionadas y bucles; fuentes en ambience/LICENSE.md
scripts/                     Generadores de ambientes, gong e iconos, y capturas de tienda
tests/                       Pruebas de lógica y flujos web (Playwright)
docs/, store/                Plan, validación, criterio de valencià y material de tienda
```

## Créditos y alcance

Gong: «Meditation Gong» de Marble Toast, CC0, adaptado a WAV mono; detalles en
[assets/gong-LICENSE.md](assets/gong-LICENSE.md). Titulares en Raleway (SIL OFL) empaquetada localmente.
Los ocho sonidos de fondo elegidos son lluvia suave, olas del mar, viento, pájaros al amanecer,
tormenta lejana, campanas de viento, ruido marrón y tanpura. Se incluyen sin conexión, en estéreo,
con unión cruzada y volumen equilibrado. Seis grabaciones usan la licencia de Pixabay y
«Rain with distant thunder», de MrAuralization, y «Electronic Tanpuar 4», de sankalp, CC BY 4.0. Créditos accesibles desde Ajustes;
fuentes, tratamiento y comprobaciones en [assets/ambience/LICENSE.md](assets/ambience/LICENSE.md).
La continuidad de la reproducción nativa debe verificarse también en iPhone y Android;
las comprobaciones de archivos no sustituyen esa prueba.

El diseño de la pantalla principal partió de una revisión de la ficha pública y las seis capturas de
[Meditation Timer de Telesense](https://play.google.com/store/apps/details?id=uk.co.telesense.tm.free&hl=en);
no se revisó el APK, no hay afiliación y no se incluye ninguna imagen ni grabación suya. Los ajustes,
el registro y la identidad visual son propios.
