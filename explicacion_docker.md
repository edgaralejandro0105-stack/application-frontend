# Guía: ¿Qué es Docker y por qué lo usamos en La Casona?

Este documento tiene como objetivo explicar de manera sencilla qué es Docker, cómo funciona y cuáles son los beneficios directos de haberlo implementado en nuestro proyecto (Frontend y Backend).

---

## 1. ¿Qué es Docker? (La Analogía de los Contenedores)

Imagina que estás organizando una mudanza. Tienes libros, vajilla, ropa y electrónicos. Si metes todo suelto en el camión, es muy probable que algo se rompa, se pierda o que las cosas se mezclen. Además, descargar todo en la casa nueva sería un caos.

Para solucionar esto, usas **cajas estandarizadas**. Metes los objetos en cajas, las cierras y las etiquetas. Ahora, al transportista no le importa si dentro hay vasos de cristal o ropa; él solo sabe cómo mover cajas. Al llegar a la casa nueva, abres la caja y tienes tus cosas exactamente como las guardaste.

**Docker hace exactamente esto, pero con software:**
En lugar de objetos físicos, Docker empaqueta tu aplicación (El Frontend de La Casona, por ejemplo) junto con **todo lo que necesita para funcionar** (librerías, configuración del sistema, versiones exactas de Node.js, etc.) dentro de una "caja virtual" llamada **Contenedor**.

De esta manera, el servidor que alojará nuestra aplicación solo necesita saber cómo ejecutar contenedores. No necesita instalar Node.js, ni configurar variables extrañas; simplemente toma nuestro contenedor y lo hace funcionar.

---

## 2. ¿Por qué se implementó en este proyecto?

En el ecosistema de La Casona tenemos varias piezas móviles:
1. El **Backend** (Nuestra API y servidor en Node.js/Express).
2. El **Frontend Administrativo** (El panel de control hecho en React/Vite).
3. La **Base de Datos** (PostgreSQL).

Mantener todo esto sincronizado puede ser complejo a la hora de subirlo a internet. Aquí te detallo las razones exactas de por qué lo configuré:

### A. Para evitar el "En mi máquina sí funciona" 💻
Es el problema más común en programación. A veces el código funciona perfecto en tu computadora, pero cuando lo subes al servidor de producción, se rompe porque el servidor tiene una versión diferente de Windows/Linux o le falta alguna instalación.
**Solución Docker:** El contenedor lleva su propia minicomputadora adentro. Si funciona en tu PC, **garantizado** funcionará en el servidor.

### B. Para simular el entorno real de Producción (Nginx) 🌐
Actualmente usamos `npm run dev` para ver el Frontend. Esto levanta un servidor de desarrollo temporal. Sin embargo, en la vida real (producción), las aplicaciones React se empaquetan en archivos estáticos (HTML y CSS puro) y deben ser servidas por un servidor web profesional de alto rendimiento llamado **Nginx**.
**Solución Docker:** El `Dockerfile` que cree para el Frontend hace dos cosas automáticamente:
1. Compila el código de React.
2. Descarga un servidor Nginx, mete nuestro código compilado dentro de él y lo configura para manejar las rutas (evitando errores 404 al recargar la página).

### C. Para levantar todo con un solo comando (Orquestación) 🚀
Levantar el sistema manualmente implica abrir una consola para el backend (`npm run dev`), otra para el frontend, y asegurarnos de que la base de datos esté encendida.
**Solución Docker:** Gracias al archivo `docker-compose.yml`, le enseñamos a Docker cómo se relacionan nuestras aplicaciones. Con ejecutar un solo comando:
```bash
docker-compose up -d
```
Docker se encarga de encender el Backend, encender el Frontend y conectarlos en una misma red privada. 

### D. Facilidad extrema de Despliegue (Deploy) ☁️
El día de mañana, cuando quieras alojar La Casona en un servidor en la nube (como DigitalOcean, AWS, Render o Google Cloud), la mayoría de estas plataformas tienen integración nativa con Docker. Simplemente les pasamos nuestro `Dockerfile` y ellos se encargan del resto en cuestión de minutos.

---

## 3. Archivos que se agregaron y qué hacen:

- **`Dockerfile`**: Es la "receta" o manual de instrucciones. Le dice a Docker paso a paso cómo construir nuestra caja (contenedor). Ejemplo: *"Descarga Node, instala dependencias, compila el código y ponlo en Nginx"*.
- **`.dockerignore`**: Funciona igual que el `.gitignore`. Le dice a Docker qué archivos (como `node_modules` locales) NO debe meter en la caja para que no pese tanto.
- **`nginx.conf`**: Es un archivo de configuración para el servidor Nginx (el que servirá nuestra web real) para asegurarnos de que funciones como React Router no fallen al recargar la página.
- **`docker-compose.yml`**: Es el "director de orquesta". Controla múltiples contenedores al mismo tiempo. Aquí definimos que el Frontend depende del Backend y en qué puertos de nuestra computadora deben exponerse.

## Resumen
Por ahora no tienes que preocuparte por estos archivos durante el desarrollo diario. Fueron agregados como **infraestructura proactiva** para asegurar que el día que La Casona salga a producción, el proceso sea rápido, seguro y profesional.
