Imágenes que se muestran cuando alguien hace clic en un enlace del juego.

Para reemplazarlas por las tuyas:
  1. Deja el archivo en esta carpeta (jpg, png, gif o svg).
  2. En public/app.js, en el escenario que quieras, agrega:
       meme: '/assets/mi-imagen.gif'
  3. Si un escenario no define `meme`, se usa el de respaldo:
       danger -> /assets/caiste.svg
       safe   -> /assets/enlace-seguro.svg

Ojo con los derechos: los memes que circulan en internet suelen tener
imagenes con copyright. Para material corporativo conviene usar creaciones
propias o imagenes con licencia libre.
