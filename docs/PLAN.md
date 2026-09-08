# Plan de implementación — Meditation Timer

Fecha: 2026-09-05. Referencia: https://play.google.com/store/apps/details?id=uk.co.telesense.tm.free&hl=en

## Extracción
Se ha leído la ficha y revisado visualmente sus seis capturas públicas. No se ha instalado el APK: las opciones que no aparecen en las capturas no se presentan como verificadas.

| Función observada | Evidencia | Implementación |
| --- | --- | --- |
| Temporizador sin meditación guiada, sin anuncios | Descripción | App local, sin cuenta ni backend |
| Inicio con un toque | Descripción y captura 5 | Botón circular de inicio |
| Pausa | Capturas 1–4 | Pausa, continuar y finalizar |
| Reloj de una aguja y cuenta atrás | Todas las capturas | SVG propio, 16 marcas, aguja y dígitos finos |
| Tema día/noche | Capturas 2–3 | Fondos blanco/negro |
| Color configurable | Captura 4 | Paleta ámbar, azul, verde, rosa |
| Gong opcional | Descripción | Grabación CC0 de Marble Toast, volumen y prueba |
| Evitar interrupciones | Descripción | Android: módulo local No molestar; iOS: instrucciones para activar Concentración |
| Teléfonos y tabletas | Capturas 5–6 | Diseño adaptable y áreas seguras |

Decisiones propias: duración editable (1–180 minutos), valor inicial 20 minutos observado en captura; conservar preferencias; recuperar una sesión al abrir la app; opción de pantalla encendida. Los ajustes se diseñan desde cero porque la ficha no los muestra. Nombre e icono propios; no se distribuyen las capturas de referencia como recursos de la app.

## Ejecución
1. [x] Revisar descripción y seis capturas, separar evidencia de supuestos.
2. [x] Crear proyecto Expo + TypeScript compatible con Android/iOS y vista web de desarrollo.
3. [x] Reproducir pantalla principal y construir ajustes accesibles en español.
4. [x] Implementar máquina de estados con fecha límite absoluta, pausa y recuperación.
5. [x] Añadir audio local, notificaciones locales y conservación de preferencias.
6. [x] Integrar No molestar en Android y alternativa explícita en iOS.
7. [x] Validar tipos, pruebas de temporizador, exportaciones y flujos de interfaz.
8. [x] Documentar compilación EAS y pruebas físicas pendientes.

## Criterios de aceptación
- Inicio/pausa/continuar/finalizar funcionan sin acumular deriva de intervalos.
- Cerrar/reabrir no reinicia una sesión; una sesión vencida muestra finalización.
- Preferencias sobreviven al reinicio; entradas dañadas recuperan valores seguros.
- Al cancelar o pausar se retiran los avisos pendientes y se restaura No molestar.
- Los permisos denegados se explican sin bloquear la meditación.
- Tema claro y oscuro, pantallas pequeñas y tabletas legibles.
- No se promete ejecución JavaScript en segundo plano: los avisos dependen del sistema operativo y sus permisos.

## Fuentes técnicas
- https://docs.expo.dev/versions/v57.0.0/
- https://docs.expo.dev/versions/v57.0.0/sdk/audio/
- https://docs.expo.dev/versions/v57.0.0/sdk/notifications/
- https://docs.expo.dev/modules/get-started/
- https://developer.android.com/reference/android/app/NotificationManager
