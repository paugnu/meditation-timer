# Capturas para App Store Connect

Generadas el 8 de septiembre de 2026 con `npx tsx scripts/capture-screenshots.ts` sobre la app real
servida en http://localhost:8081, usando Chrome con Playwright.

- `phone-*.png`: 1242 × 2688, viewport 414 × 896 con `deviceScaleFactor` 3.
- `tablet-*.png`: 2048 × 2732, viewport 1024 × 1366 con `deviceScaleFactor` 2.
- Tres vistas por formato: timer, settings, calendar. Español, tema noche, registro vacío.
- Renderizadas directamente a la resolución exigida por la ficha: **no hay reescalado**, a
  diferencia de las capturas anteriores. Sin recortes, sin retoque, sin interfaz de iOS añadida.

**Siguen siendo capturas de React Native Web, no de un dispositivo iOS.** Los interruptores y las
barras de desplazamiento los dibuja el navegador y difieren del binario nativo: en `phone-settings`
el interruptor activo aparece con pulgar turquesa, que no es el color de la app. La sección Sin
interrupciones muestra además el texto de la variante web. Apple espera en la directriz 2.3.3
capturas de la app en el dispositivo correspondiente.

Reflejan la versión de desarrollo posterior a la build 8: sin título en la cabecera, con selector de
sonido de fondo bajo el botón de inicio y con Finalizar oculto mientras la sesión corre. Las capturas
subidas hoy a las tiendas corresponden a builds anteriores y no muestran nada de esto.

Los archivos `*.jpg` y `screenshots/store/*.png` son el juego anterior, reescalado desde 414 × 896.
Se conservan como registro de lo que se subió; no los reutilices.
