# Meditation Timer

App de meditación en **Expo SDK 57 + React Native + TypeScript**, para Android e iOS. Recrea la pantalla de la referencia de Telesense: fondo negro o blanco, reloj de una aguja, cuenta atrás y botones sencillos. Interfaz en español, sin anuncios, cuentas, backend ni analítica.

## Ejecutar

Requisitos: Node.js >= 22.13, npm.

```bash
npm ci
npm run web            # vista de desarrollo en el navegador
npx expo start --go     # probar funciones compatibles con Expo Go
```

Para probar la integración completa usa una **development build**: Expo Go no incluye el módulo Android propio de No molestar ni instala nuestro sonido de notificación.

```bash
npm run android        # Android SDK + JDK + emulador o dispositivo USB
npm run ios            # macOS + Xcode + simulador/dispositivo
```

## Compilar con EAS

La configuración está en `eas.json`; los identificadores iniciales son `com.pau.meditationtimer`. Antes de publicar, revisa nombre e identificadores en `app.json`.

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview      # APK instalable
npx eas-cli@latest build --platform ios --profile preview          # simulador iOS
npx eas-cli@latest build --platform all --profile development      # cliente de desarrollo
npx eas-cli@latest build --platform all --profile production       # tiendas
```

EAS necesita una cuenta Expo y, para firmar versiones de iOS para dispositivos/tienda, credenciales Apple. No se han generado ni enviado binarios firmados a las tiendas.

## Funciones

- Duración de 1–180 minutos y accesos rápidos; 20 minutos por defecto.
- Inicio, pausa, continuación y finalización; repetir al completar.
- Reloj analógico de 16 marcas y cuenta atrás con segundos.
- Temas noche/día y cuatro colores.
- Gong incluido con interruptores independientes al inicio y al final, volumen y escucha previa. No vuelve a sonar al reanudar una pausa.
- Menú Ajustes con apartados Configuración y Registro; disponible también mientras la sesión está pausada.
- Idiomas: español, catalán, inglés, neerlandés, francés y ruso, seleccionables en Ajustes y guardados en el dispositivo.
- Calendario mensual con navegación y minutos reales acumulados por fecha local de inicio; días vacíos sin cero y sesiones menores de un minuto como <1 min. Se mantiene la lista completa debajo.
- Registro local de meditaciones: fecha, tiempo efectivo, objetivo, estado y tiempo total acumulado. Las pausas no suman tiempo y se conservan las sesiones finalizadas antes de tiempo.
- Preferencias, sesión e historial guardados localmente con AsyncStorage.
- Recuperación después de cerrar/reabrir; cuenta basada en fecha límite absoluta.
- Opción de pantalla encendida durante la sesión; barras del sistema ocultas mientras corre.
- Aviso local al terminar en Android/iOS. Se cancela al pausar/finalizar.
- No molestar automático en Android mediante módulo Expo local, con permisos explícitos del sistema. Restaura el estado al terminar, pausar, reiniciar el teléfono o actualizar la aplicación.
- En iOS, instrucciones para activar Concentración manualmente.

## Comportamiento por plataforma

| Función | Android instalado | iOS instalado | Web |
| --- | --- | --- | --- |
| Temporizador, ajustes, sesión persistente | Sí | Sí | Sí |
| Gong con app visible | Sí | Sí | Sí, tras interacción |
| Aviso con pantalla bloqueada | Notificación local | Notificación local | No |
| No molestar automático | Con permisos de política y alarmas exactas | No permitido por iOS | Manual |
| Pantalla encendida | Sí | Sí | Según soporte del navegador |

El gong en primer plano usa el volumen configurado dentro de la app. El sonido de la notificación usa el volumen/canal del sistema. Los permisos, el modo silencio/Concentración, las políticas de batería y el cierre forzado pueden impedir o retrasar avisos. No se reproduce otro gong tardío al volver a una sesión que venció en segundo plano. Android mantiene permitidas las alarmas cuando activa No molestar; no se promete bloquear cada posible interrupción.

El módulo nativo exige permiso de alarmas exactas antes de activar No molestar para poder programar su restauración. Android 15+ cambia la regla implícita propiedad de la app; en versiones anteriores conserva el filtro previo y evita sobrescribir un cambio de modo realizado por el usuario durante la sesión. Si el usuario fuerza la detención de la aplicación, Android puede cancelar alarmas: debe revisar No molestar manualmente. Tras reiniciar el teléfono se restaura No molestar; no se garantiza que sobreviva el aviso de una sesión anterior al reinicio.

## Verificación

```bash
npm run typecheck
npm test
npm run test:e2e        # requiere Google Chrome; o configura Chromium en playwright.config.ts
npx expo-doctor
npx expo export --platform all
npx expo prebuild --no-install
```

La guía y los resultados concretos están en [docs/VALIDATION.md](docs/VALIDATION.md). El plan y la matriz de extracción, con evidencias y decisiones propias, están en [docs/PLAN.md](docs/PLAN.md).

## Estructura

- `App.tsx`: pantalla principal adaptable.
- `src/timer.ts`: máquina de estados pura y recuperación.
- `src/history.ts`: registro, recuperación sin duplicados y cálculo del tiempo meditado.
- `src/hooks/useMeditation.ts`: sesión, persistencia, audio y ciclo de vida.
- `src/components/SettingsPanel.tsx`: ajustes.
- `src/services/`: notificaciones, almacenamiento y puente No molestar.
- `modules/meditation-focus/`: módulo Kotlin local autovinculado por Expo.
- `assets/gong.wav`: grabación «Meditation Gong» de Marble Toast (CC0), adaptada a WAV mono; fuente y licencia en `assets/gong-LICENSE.md`.
- `scripts/generate-gong.py`: alternativa sintetizada opcional; genera `gong-synth.wav`.
- `tests/`: pruebas de lógica y flujos web.

## Referencia y alcance

[Google Play: Meditation Timer de Telesense](https://play.google.com/store/apps/details?id=uk.co.telesense.tm.free&hl=en). Se ha revisado la ficha y sus seis capturas, no el APK. La pantalla principal reproduce los elementos observables; los ajustes no visibles se han diseñado expresamente. No hay afiliación con Telesense y no se incluyen sus imágenes o grabaciones en el producto.
