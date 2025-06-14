# Cómo usar

- Usos básicos: texto sobre o seleccionar (resaltar) texto para traducir.
  - Pruebe el despiadado con texto de ejemplo:
```console

Proletarier aller Länder, vereinigt euch!

```

  - Si la traducción no funciona, verifique el idioma de destino actual
    - Verifique [cómo cambiar el idioma] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#change-language)
    - Este traductor omitirá el texto si los idiomas de origen y de destino son idénticos.

![Alt Text](/doc/reagre.gif)


- Mantenga presionada la tecla <Kbd> Left-Ctrl </ kbd> para escuchar la pronunciación TTS cuando aparece una información sobre herramientas. Presione <KBD> ESC </ KBD> para detener la voz.
  - Pruebe Double Presione <KBD> Left-Ctrl </ kbd> para escuchar el texto de resultados traducido
![result](/doc/20.gif)


- Presione la tecla <Kbd> Right-Alt </ kbd> para traducir el texto que está escribiendo (o cualquier texto resaltado) en el cuadro de entrada. Si es necesario, puede deshacer la acción presionando <KBD> Ctrl </ kbd> + <kbd> z </ kbd>.
  - Si la traducción no funciona, asegúrese de que su idioma de destino actual coincida con su lenguaje de escritura.
  - If <kbd> right-alt </ kbd> se usa como hangul swap,
Use otra clave para trabajar.

![result](/doc/11.gif)


- Traducir el texto del cuadro de búsqueda de URL escribiendo <KBD>/</ KBD>+<KBD> Space </ kbd> antes de su consulta.

![result](/doc/21.gif)


- Soporte de PDF en línea para mostrar información de herramientas traducida usando PDF.JS (el archivo PDF de computadora local necesita permiso adicional, consulte [Excepción] (https://github.com/ttop32/mousetooltiptranslator/blob/main/doc/intro.md#exception)))

![result](/doc/12.gif)


- Admite subtítulos duales para videos de YouTube.

![result](/doc/16.gif)


- Procese OCR al contener <kbd> a la izquierda </kbd> llave + mouse en una imagen (por ejemplo, manga)

![result](/doc/15.gif)


- Ejecutar el lector automático por presionar <KBD> F2 </KBD> tecla
  - Comienza a leer mouse a través del texto hasta el final con TTS
  - Para detener el lector automático, presione <KBD> ESC </KBD>
  - Pruebe Double Presione <KBD> F2 </KBD> Para escuchar el texto de texto de resultados traducido

![result](/doc/30.gif)


- Active el traductor de reconocimiento de voz manteniendo presionado la tecla <Kbd> Right-Ctrl </ kbd>.
  - El lenguaje de reconocimiento de voz predeterminado es el inglés.
  - Si el lenguaje de reconocimiento de voz y el lenguaje de destino son los mismos, se salta.
  - Se requiere permiso de audio
  - Solo compatible con navegadores basados ​​en cromo, como Google Chrome, MS-Edge, Vivaldi, Opera, Brave, ARC y Yandex.
- Personalizar la tecla de acceso directo
  - Desde Chrome: // extensiones/accesos directos o la página de configuración interna del navegador equivalente, accesible reemplazando Chrome: // con la URL interna de su navegador (por ejemplo, Edge: //, navegador: //, o valiente: // etc.).
# Cambiar el idioma
- Cambiar el idioma actual en la página de configuración
  - Se puede acceder a la página de configuración haciendo clic en el botón de rompecabezas (extensión) ubicado en la parte superior derecha de su navegador.

![result](/doc/14.gif)



# Excepción

- Si el lenguaje de texto de origen y el lenguaje traducido son los mismos, se saltará.
- Si la página no se enfoca, la entrada de clave no se detecta.
Haga clic en la página de enfoque antes del teclado de entrada.
- La aplicación no funcionará si el estado web está fuera de línea.
- Si el sitio es <https://chrome.google.com/extensions>, no funciona porque Chrome Security Razon.
- Si no se le da permiso al archivo local, no se puede manejar PDF local.
  - Si el archivo no se abre, intente arrastrarlo y soltarlo en la pestaña.
  - Mostrará una advertencia de permiso y redirigirá a la página de permiso.
  - En la página redirigida, asegúrese de seleccionar "permitir el acceso a las URL de archivo" para acceder a los archivos.
  - Reabrir PDF para afectar de inmediato
![result](/doc/10.gif)
