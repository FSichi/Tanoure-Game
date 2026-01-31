# Requerimientos juego interactivo

## Prompt:
![Imagen cargada](https://chatgpt.com/backend-api/estuary/content?id=file_000000005b50720ebe936e393b858a36&ts=491634&p=fs&cid=1&sig=15cb9469abf88dbb3e17b96fbf64dd30d7fc499829ee56d053e25a328f859434&v=0)

Tengo una tarea importante. Un posible cliente me envio una pequena descripcion de un mini juego para sus stands show. Necesito que me ayudes a descrifar los requerimientos y hacer un prompt para que el IDE antigravity lo codee. Te mando los audios:

Texto del cliente:

Para hacer un autoejecutable de un juego que necesito proyectar en mis shows, que me permita mover una fichas de lugar en vivo y en directo. (Aqui lo mejor creo que es web)

Hola Facundo ¿Cómo andás? Te lo mando en audio por más fácil de explicar es un juego que consiste en lo siguiente. Aparece sobre la pantalla seis imágenes fijas y abajo numerada del uno al seis las mismas imágenes pero desordenadas. Entonces la persona en un tiempo determinado tiene que ir ordenando esas imágenes eh diciendo por ejemplo cambio el uno por el tres, el cuatro por el cinco. Todo eso ehh haciéndolo después de haber visto cómo estaba desordenado y sin poder verlo de vuelta. O sea tratando de recordar el orden y diciendo números, entonces yo necesito que la aplicación haga eso, me presente las seis imágenes fijas, tapadas las seis imágenes este móviles digamos, se destapa para que la persona las vea y después eh de memoria tiene que tratar de ordenarla, eso se

Me parece interesante esto que me decís sí eh o sea yo puedo explicarles perfectamente qué es lo que quiero a al programa pero no lo sé programar así que si esto lo hace estaría buenísimo. Yo las imágenes las tengo a todas. Tengo el el fondo, las imágenes fijas y las mismas imágenes móviles cada una por separado. Así que me imagino que se puede hacer

--- FIN TEXTO CLIENTE

Ahi te adjunte una imagen para que mas o menos infieras lo que necesito hacer. La persona tiene 4 segundos aprox (quiza lo mejor sea dejar configurable ese parametro). Para poder ver la fila de arriba, luego tiene 20 segundos para intentar ordenar en el orden que vio. Con la indicacion de por ejemplo.

## Prompt:
![Imagen cargada](https://chatgpt.com/backend-api/estuary/content?id=file_00000000c09c720ebf6369dc819be845&ts=491634&p=fs&cid=1&sig=eb60be746759765f67629271d57e6d91ed22d696c1e827ca5714ae8cd538799f&v=0)

Tengo una tarea importante. Un posible cliente me envio una pequena descripcion de un mini juego para sus stands show. Necesito que me ayudes a descrifar los requerimientos y hacer un prompt para que el IDE antigravity lo codee. 

Te mando los textos: Texto del cliente: Para hacer un autoejecutable de un juego que necesito proyectar en mis shows, que me permita mover una fichas de lugar en vivo y en directo. (Aqui lo mejor creo que es web) Hola Facundo ¿Cómo andás? Te lo mando en audio por más fácil de explicar es un juego que consiste en lo siguiente. Aparece sobre la pantalla seis imágenes fijas y abajo numerada del uno al seis las mismas imágenes pero desordenadas. Entonces la persona en un tiempo determinado tiene que ir ordenando esas imágenes eh diciendo por ejemplo cambio el uno por el tres, el cuatro por el cinco. Todo eso ehh haciéndolo después de haber visto cómo estaba desordenado y sin poder verlo de vuelta. O sea tratando de recordar el orden y diciendo números, entonces yo necesito que la aplicación haga eso, me presente las seis imágenes fijas, tapadas las seis imágenes este móviles digamos, se destapa para que la persona las vea y después eh de memoria tiene que tratar de ordenarla, eso se Me parece interesante esto que me decís sí eh o sea yo puedo explicarles perfectamente qué es lo que quiero a al programa pero no lo sé programar así que si esto lo hace estaría buenísimo. Yo las imágenes las tengo a todas. Tengo el el fondo, las imágenes fijas y las mismas imágenes móviles cada una por separado. Así que me imagino que se puede hacer --- FIN TEXTO CLIENTE 

Ahi te adjunte una imagen para que mas o menos infieras lo que necesito hacer. 

1. La persona tiene 4 segundos aprox (quiza lo mejor sea dejar configurable ese parametro). Para poder ver la fila de arriba. Son 6 imagenes.  

2. Luego la fila de arriba se oculta y tiene 20 segundos para intentar ordenar en el orden que vio. Con la indicacion de por ejemplo, el 1 por el 3, haciendo referencia a que intercambia las posiciones de las imagenes 1 y 3. El 2 por el 5, lo mismo, y asi. Despues de 20 segundos. Termina la posibilidad de seguir jugando y se revela la fila oculta original de arriba. A partir de ahi se marcan los aciertos y errores. 

Basicamente seria eso. Mi entendimiento es que conviene una aplicacion web, realizada en React + Tailwind con animaciones y que sea facilmente configurable en parametros. Me deberia permitir crear un juego, subir las 6 imagenes y jugarlo. Luego si quiero crear otro juego, repito el proceso. Se entiende? Quiero un promot para que antigravity lo codee

## Response:
Perfecto, se entiende **muy bien** 👍  
Voy a hacer esto en 3 capas, bien prolijo para que lo puedas usar tal cual con el cliente **y** con Antigravity:

1.  **Descifrado funcional (qué juego es)**
2.  **Requerimientos claros (funcionales + técnicos)**
3.  **Prompt listo para Antigravity (copiar/pegar y codear)**

* * *

1️⃣ Qué es exactamente el juego (en criollo)
--------------------------------------------

Es un **juego de memoria visual + ordenamiento**, pensado para shows en vivo y proyección en pantalla grande.

**Flujo del juego:**

1.  Se muestran **6 imágenes objetivo** (fila superior) durante un tiempo corto (ej: 4 segundos).
2.  La fila superior **se oculta completamente**.
3.  Abajo hay **las mismas 6 imágenes**, pero **desordenadas y numeradas del 1 al 6**.
4.  El jugador **NO toca las imágenes**, sino que:
    *   Da instrucciones tipo:
        > “cambio la 1 por la 3”, “la 2 por la 5”
    *   El operador ejecuta esos swaps en vivo.
5.  El jugador tiene **20 segundos** para ordenar.
6.  Al terminar el tiempo:
    *   Se revela la fila superior original.
    *   Se comparan posiciones.
    *   Se marcan **aciertos y errores** visualmente.

👉 Es básicamente un **“memory swap puzzle” dirigido por voz**.

* * *

2️⃣ Requerimientos bien definidos
---------------------------------

### 🎮 Requerimientos funcionales

#### Juego

*   Cantidad fija: **6 imágenes**
*   Dos filas:
    *   **Fila superior (objetivo)** → visible solo al inicio
    *   **Fila inferior (jugable)** → visible siempre
*   Numeración visible del 1 al 6 en la fila inferior
*   Mecánica de intercambio:
    *   Swap entre dos posiciones (ej: posición 1 ↔ 3)

#### Tiempos (configurables)

*   Tiempo de visualización inicial (default: **4s**)
*   Tiempo de juego/memoria (default: **20s**)

#### Estados del juego

1.  `SETUP` → carga de imágenes
2.  `PREVIEW` → se muestra fila superior
3.  `PLAYING` → fila superior oculta, swaps habilitados
4.  `RESULT` → se revela la solución y se muestran aciertos/errores

* * *

### 🎨 UI / UX

*   Pensado para **pantalla grande / proyector**
*   Animaciones claras y lentas:
    *   Fade / slide al ocultar y mostrar
    *   Swap animado entre imágenes
*   Feedback visual:
    *   ✅ Verde = posición correcta
    *   ❌ Rojo = incorrecta
*   Contadores visibles:
    *   Timer regresivo
    *   Estado del juego

* * *

### 🧩 Configuración del juego

Debe permitir:

*   Crear un nuevo juego
*   Subir:
    *   Fondo (opcional)
    *   6 imágenes (una sola carga que se usa arriba y abajo)
*   Configurar:
    *   Tiempo de preview
    *   Tiempo de juego
*   Reiniciar el juego fácilmente
*   Crear otro juego repitiendo el proceso

👉 Idealmente **sin backend**, todo en memoria/local.

* * *

### 🛠️ Requerimientos técnicos

*   **Aplicación web**
*   Stack:
    *   React
    *   Tailwind CSS
    *   Animaciones (CSS o Framer Motion)
*   Fullscreen friendly
*   Sin login
*   Pensada para:
    *   Chrome
    *   Modo kiosk
    *   Empaquetable como autoejecutable (Electron / Chrome App)

* * *

3️⃣ Prompt para Antigravity (copy–paste ready 🚀)
-------------------------------------------------

Este es el prompt que yo usaría **tal cual**:

* * *

### 🧠 PROMPT PARA ANTIGRAVITY

> Construí una aplicación web interactiva tipo juego de memoria visual, pensada para ser proyectada en pantalla grande durante eventos en vivo.
> 
> ### Stack obligatorio
> 
> *   React
> *   Tailwind CSS
> *   Animaciones suaves (preferentemente Framer Motion)
>     
> 
> * * *
> 
> ### Descripción del juego
> 
> El juego tiene **6 imágenes** y funciona en cuatro estados:
> 
> #### 1\. SETUP
> 
> *   Interfaz para crear un juego:
>     *   Subir 6 imágenes
>     *   Configurar:
>         *   Tiempo de visualización inicial (default 4 segundos)
>         *   Tiempo de juego (default 20 segundos)
> *   Botón “Iniciar juego”
>     
> 
> #### 2\. PREVIEW
> 
> *   Se muestran las 6 imágenes en una fila superior durante el tiempo configurado
> *   La fila inferior muestra las mismas imágenes pero desordenadas y numeradas del 1 al 6
>     
> 
> #### 3\. PLAYING
> 
> *   La fila superior se oculta completamente
> *   El jugador tiene X segundos para ordenar la fila inferior
> *   El operador puede hacer swaps entre posiciones (ej: swap 1 ↔ 3)
> *   Cada swap debe tener animación clara
> *   Mostrar countdown visible
>     
> 
> #### 4\. RESULT
> 
> *   Se revela nuevamente la fila superior original
> *   Comparar ambas filas posición por posición
> *   Marcar:
>     *   Verde: imagen correcta
>     *   Rojo: imagen incorrecta
>         
> 
> * * *
> 
> ### Reglas importantes
> 
> *   El usuario NO debe volver a ver la solución hasta el final
> *   El juego debe poder reiniciarse fácilmente
> *   Todo debe funcionar sin backend
>     
> 
> * * *
> 
> ### UI / UX
> 
> *   Optimizado para pantalla grande
> *   Diseño simple, contrastado
> *   Botones grandes
> *   Animaciones lentas y claras
>     
> 
> * * *
> 
> ### Extra
> 
> *   Código limpio y modular
> *   Componentes reutilizables
> *   Variables de configuración centralizadas
>     
> 
> Entregar el proyecto listo para correr en navegador y fácilmente empaquetable como app autoejecutable.

* * *

🧠 Tip estratégico (extra)
--------------------------

Cuando se lo muestres al cliente, vendelo así:

> “Es un juego de memoria dirigido por voz, pensado para shows, donde el público participa sin tocar la pantalla.”

Eso **vende mucho más** que “un jueguito con imágenes”.

Si querés, en el próximo mensaje puedo:

*   Ajustar el prompt a **Electron**
*   Simplificar el setup para operador no técnico
*   Diseñar el layout exacto en ASCII / wireframe

Decime 🔥



---
Powered by [ChatGPT Exporter](https://www.chatgptexporter.com)