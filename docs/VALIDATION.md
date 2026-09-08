# Validación

## Automatizada (2026-09-05)

- 10 pruebas de lógica: fechas límite, suspensión, pausa/reanudación, doble inicio, reinicio, recuperación, datos corruptos, finalización idempotente, límites y formato.
- 4 pruebas de interfaz con Playwright/Chrome a 390×844: ciclo de sesión y recarga; ajustes, validación y persistencia; finalización/reinicio; almacenamiento corrupto.
- TypeScript sin errores.
- Expo Doctor: 21/21 comprobaciones.
- Exportación de los bundles de Android, iOS y web completada.
- Prebuild de Android/iOS completado; sonido copiado a los recursos nativos.
- Autolinking detecta `expo.modules.meditationfocus.MeditationFocusModule`.

Las exportaciones validan el código JavaScript y recursos; **no equivalen a una compilación nativa de Kotlin/Swift ni a una prueba física**. Este entorno no tiene JDK/Android SDK ni Xcode. No se han generado APK/IPA firmados ni se ha publicado en tiendas.

## Revisión visual

Revisión en navegador de reloj nocturno, ajustes y tema claro/azul. Reloj dibujado con SVG; sin imágenes de pantalla ni capturas de la referencia como UI. Diseño de una columna con límite de tamaño del reloj y ajustes desplazables para pantallas pequeñas.

## Pruebas físicas antes de publicar

1. Android 14 y Android 15+: instalar build propia; conceder y denegar por separado notificaciones, No molestar y alarmas exactas. Verificar que la sesión siempre puede empezar y que los fallos muestran un aviso.
2. Sesión de un minuto: escuchar gong en primer plano, bloquear pantalla y probar en segundo plano. Comprobar que no suena dos veces al regresar.
3. Pausar/finalizar antes del vencimiento: esperar hasta la hora original y verificar ausencia de aviso.
4. Activar No molestar automático, iniciar, pausar, continuar, finalizar y dejar vencer. Verificar restauración incluso con proceso suspendido. Probar modo previo ya activo y cambios manuales durante la sesión.
5. Reiniciar teléfono o actualizar durante una sesión: comprobar restauración del modo anterior. Forzar detención requiere comprobar manualmente No molestar: el sistema puede cancelar las alarmas.
6. iPhone/iPad: sonido activo/silencioso, permiso de notificaciones denegado y Concentración con/sin autorización de avisos para la app.
7. Volumen cero y gong desactivado: ningún sonido en primer ni segundo plano.
8. Modo día/noche, rotación, teléfono pequeño, tableta y tamaños grandes de texto. VoiceOver/TalkBack: etiquetas de botones, duración y ajustes.
9. Hacer una sesión larga con ahorro de batería para evaluar retrasos del fabricante. Documentar las excepciones que encuentre cada dispositivo.

## Dependencias

Se mantienen las versiones compatibles con Expo SDK 57. La auditoría npm inicial reporta avisos moderados transitivos; no se aplica `npm audit fix --force` porque cambia versiones fuera de la matriz del SDK. Revisar antes de la publicación junto con las actualizaciones de Expo.


## Ampliación de configuración y registro

- 17 pruebas de lógica superadas: incluye duración efectiva sin pausas, recuperación de sesiones vencidas, duplicados, registros corruptos y migración del ajuste de gong.
- 12 pruebas de interfaz superadas: incluye guardar y consultar el registro, sesión finalizada antes de tiempo, vencimiento antes de reabrir, persistencia de interruptores y las cuatro combinaciones de sonido al inicio/final. En las pruebas de sonido se observan las llamadas a reproducción, sin emitir audio; no sustituyen una escucha en dispositivo.
- Botón Ajustes visible en reposo y pausa; dos pestañas: Configuración y Registro. Los cambios de duración durante una pausa se aplican a la próxima sesión.
- Las sesiones de menos de un segundo no se registran, para evitar entradas por toques accidentales. El tiempo se almacena en milisegundos y se muestra sin redondear hacia arriba.
- El registro comienza con esta versión; no se inventan meditaciones anteriores. Una sesión en curso heredada de la versión previa conserva su tiempo, con fecha de inicio aproximada si no había metadatos.
- Comprobar en móvil gong al inicio/final, volumen cero, pausa/reanudación sin repetición y registro después de bloquear o cerrar la app.

## Ajuste visual inspirado en YogaBond

Referencia revisada: https://www.yogabond.es/ (cabecera terracota #85471E, tonos crema y títulos serif). Adaptación sutil en `src/theme.ts`: fondo claro crema, noche cálida, terracota con variante legible en oscuro y serif del sistema únicamente en títulos. Se conserva la esfera y la tipografía de la cuenta atrás. El ámbar anterior pasa al nuevo color predeterminado; los otros colores elegidos se conservan. Ajustes e historial comparten la paleta. TypeScript, 17 pruebas de lógica y 12 de interfaz superados; revisión visual del temporizador nocturno en navegador.


## Tipografía Raleway

Raleway Regular únicamente para títulos. El temporizador, los totales, las etiquetas y los campos usan la tipografía nativa del sistema. Raleway se incluye mediante @expo-google-fonts/raleway y se carga con expo-font, sin CDN; ya no se carga ExtraLight. La cuenta atrás conserva cifras alineadas y tabulares.

## Distribución interna (2026-09-05, posterior a las comprobaciones iniciales)

La build Android de EAS `63bdac3e-3592-456d-a2bf-c3ab53b9fc03` ha compilado nativamente y su AAB firmado se ha publicado en el canal de prueba interna de Google Play. La consola confirma que está disponible para testers internos. TypeScript y las 29 pruebas vuelven a pasar. Esta validación sustituye la limitación inicial de compilación Android; iOS sigue pendiente de credenciales de firma renovadas. Véase `store/RELEASE-STATUS.md`.

La build iOS `c23b9d2c-fa46-4e53-999f-389c9b87265c` ha compilado y se ha enviado correctamente a App Store Connect (1.0.0, build 2). Procesamiento de Apple completado y build asignada al grupo interno; no equivale a una prueba física. El APK Android de instalación directa también ha terminado correctamente.


## Correcciones de la primera prueba en iPhone — build 3

- Modal de Ajustes con SafeAreaProvider propio y presentación fullScreen para calcular los márgenes de la ventana nativa. Cabecera con botón textual Cerrar. Un valor de duración vacío o inválido ya no impide salir: se conserva el último valor válido.
- Presets 5, 10, 15, 30, 45 y 60; sigue siendo posible escribir 20 manualmente y se conserva la preferencia existente.
- Carga local del gong con downloadFirst y espera acotada de isLoaded antes de reproducir. Se evita buscar la posición cero antes de cargar; errores visibles dentro del modal.
- Sustituido el sonido sintetizado por Meditation Gong de Marble Toast, CC0. WAV PCM16 mono, 44.1 kHz, 15.832 s; pico 0.85 y RMS 0.159. Fuente documentada en assets/gong-LICENSE.md.
- TypeScript, 17 pruebas de lógica y 13 de interfaz superados. Regresión nueva: elegir 45, cerrar, reabrir, vaciar la duración y poder salir conservando el valor válido.
- La reproducción audible y la zona segura requieren confirmar el resultado en el iPhone del tester; las pruebas web no sustituyen esa comprobación.

## Idiomas y calendario — desarrollo posterior a build 3

- Seis catálogos completos (es, ca, en, nl, fr, ru), siguiendo los idiomas públicos de https://www.yogabond.es/. Selector accesible de idioma persistido; compatibilidad con preferencias previas sin idioma (español). Interfaz, fechas, duraciones, avisos y notificaciones traducidos.
- Calendario mensual de lunes a domingo sobre la lista existente. Agrupa las duraciones efectivas por fecha local de inicio, excluye pausas y no reparte sesiones nocturnas artificialmente. Días sin sesiones sin cifra; prácticas de menos de un minuto muestran <1 min; minutos enteros sin redondear al alza.
- 21 pruebas de lógica y 15 de interfaz superadas. Cobertura añadida: sumas diarias, sesiones nocturnas, febrero bisiesto, cambio de año, días vacíos, integridad de catálogos e interpolaciones, los seis idiomas, persistencia tras recargar y navegación mensual conservando la lista.
- Revisión visual web a 390 y 320 px, incluyendo ruso. Botón × a la derecha de Ajustes. No se ha distribuido aún esta actualización a TestFlight ni Google Play.

## Selección diaria del calendario — 6 de septiembre

- Registro abre en el día local actual. Cada fecha es pulsable y filtra la lista; la fecha elegida tiene fondo sólido, hoy conserva un borde y el botón Hoy vuelve a la fecha actual.
- Cambiar de mes selecciona su primer día para mantener visibles y coherentes la selección y la lista. Se muestran la fecha y el total diario sobre las sesiones, con un estado vacío específico para días sin práctica.
- Revisión de diseño: resumen y calendario más compactos, botones de día de 56 puntos de alto, selección accesible y acceso Hoy permanente. Revisión visual a 390 y 320 px (español y ruso).
- TypeScript, 21 pruebas de lógica y 15 de interfaz superadas. La regresión cubre hoy seleccionado, varias sesiones de un día, otro día con una sesión breve, un mes vacío y vuelta a hoy.
- Solo desarrollo/previsualización; pendiente de distribución a las tiendas.

## Ajuste visual del calendario

Selección con contorno circular alrededor del número, hoy con un punto independiente, sin fondos rectangulares y minutos en una sola línea. Se conserva el área pulsable completa de cada día y el filtrado. TypeScript y regresión de selección diaria verificados; previsualización inspeccionada visualmente.

## Confirmación al finalizar antes de cero

- Finalizar pausa y persiste la sesión antes de mostrar Guardar meditación, Finalizar sin guardar y Cancelar, en los seis idiomas.
- La espera de confirmación no suma tiempo; guardar conserva el instante de parada. Descartar limpia la sesión activa sin añadir registros. Cancelar deja la sesión pausada para poder continuar.
- Si el temporizador ya ha llegado a cero, se guarda automáticamente sin pedir confirmación ni duplicar el registro.
- Pruebas de interfaz añadidas para guardar/descartar tras esperar dos minutos, persistencia tras recargar, cancelación seguida de continuación y finalización automática.

## Halo de meditación

Reloj sustituido por halo SVG de brillo tenue, arco fijo que completa la duración real y estela independiente con giro lineal de 24 segundos. Animación nativa de transformación, sin bloquear interacciones; se detiene al pausar, completar o pasar a segundo plano. Respeta Reducir movimiento. Inspección visual en previsualización; TypeScript y regresiones de temporizador superadas. Pendiente de comprobar en una nueva build física.

La estela se reinicia al iniciar una sesión nueva mediante una identidad de animación independiente. Pausar/continuar mantiene la misma identidad y posición; el final de una sesión no arrastra su ángulo a la siguiente. Regresión de reinicio y prueba de pausa/reanudación incluidas.

Al pulsar Finalizar se reinicia inmediatamente la estela, antes de decidir si guardar. Su punta inicial está a las doce (160, 24 en el SVG), coincidiendo con el inicio del arco de progreso. La pausa normal conserva la posición.

## Distribución estable al iniciar y créditos YogaBond

Se mantienen visibles las barras del sistema, el hueco de cabecera se conserva al ocultar título y Ajustes y Finalizar tiene espacio reservado incluso antes de comenzar. Los avisos se superponen sobre un margen inferior reservado, sin desplazar el halo. Créditos con enlace https://www.yogabond.es/ y textos en los seis idiomas. Regresión de posiciones del halo y cuenta atrás al iniciar/pausar; requiere confirmar los márgenes del sistema en la siguiente build nativa.

La cabecera (título y acceso a configuración) ahora aparece y desaparece con una transición de opacidad de 1,2 segundos y aceleración/desaceleración suave. Conserva su espacio y no retrasa el inicio ni la pausa del temporizador.

## Valoraciones y versión 1.1.0

TypeScript, 23 pruebas de lógica y 21 pruebas de interfaz superadas. Valoración nativa mediante expo-store-review 57: un único intento persistido por instalación tras cinco sesiones completadas automáticamente, excluyendo abandonos. Se espera al final del gong y se evita solicitarla durante sesiones o configuración. Las tiendas deciden si muestran el diálogo. `extra.publicReviewsEnabled` permanece false durante la beta; habilitar antes de la distribución pública. Borrar datos/reinstalar elimina el marcador local. No requiere URL pública para la API nativa.

Fuentes: https://docs.expo.dev/versions/v57.0.0/sdk/storereview/ . Aportaciones económicas no implementadas: revisar compras integradas para propinas en iOS y condiciones de aportaciones sin contraprestaciones en Android antes de definir el cobro: https://developer.apple.com/app-store/review/guidelines/#in-app-purchase y https://support.google.com/googleplay/android-developer/answer/10281818?hl=en-GB .

## Eliminación individual de meditaciones

Cada sesión de la lista diaria ofrece Eliminar registro, con confirmación en la propia fila y Cancelar. La eliminación se realiza por ID y se persiste con la cola de almacenamiento existente, conservando temporizador y preferencias. Calendario, totales y lista se recalculan sin cambiar el día elegido. Textos en los seis idiomas, incluida la variante valenciana. Regresión de interfaz para cancelar, eliminar una de varias sesiones, conservar otro día, persistir al recargar y eliminar la última sesión de un día sin mostrar cero minutos.
