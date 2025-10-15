# 🎯 Juego de Tablas de Multiplicar

## 📝 Descripción

Aplicación web interactiva para practicar las tablas de multiplicar de manera divertida y efectiva. El juego presenta preguntas aleatorias, proporciona retroalimentación inmediata y lleva un registro del progreso del usuario.

## 🚀 Características

- ✅ Preguntas de multiplicación aleatorias (números del 1 al 10)
- ✅ Retroalimentación inmediata (correcta/incorrecta)
- ✅ Sistema de puntuación (aciertos y errores)
- ✅ Registro automático de resultados en localStorage
- ✅ Interfaz moderna y atractiva con gradiente de colores
- ✅ Respuesta con tecla Enter para mayor comodidad
- ✅ Diseño responsive adaptable a diferentes dispositivos

## 📂 Estructura del Proyecto

```
juego-matematico-tablas/
├── index.html      # Archivo principal HTML con la interfaz del juego
├── script.js       # Lógica del juego en JavaScript
├── records.json    # Ejemplo de estructura de datos para los registros
└── README.md       # Este archivo con las instrucciones
```

## 🎮 Cómo Usar

### Opción 1: Usar GitHub Pages

1. Ve a la configuración del repositorio (Settings)
2. En la sección "Pages", selecciona la rama "main" como fuente
3. Guarda los cambios
4. Accede al juego en: `https://gasv1984-prog.github.io/juego-matematico-tablas/`

### Opción 2: Ejecutar Localmente

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/gasv1984-prog/juego-matematico-tablas.git
   ```

2. **Navegar al directorio:**
   ```bash
   cd juego-matematico-tablas
   ```

3. **Abrir el archivo index.html:**
   - Doble clic en el archivo `index.html`, o
   - Abrir con tu navegador web preferido, o
   - Usar un servidor local como Live Server en VS Code

## 🎯 Instrucciones del Juego

1. **Inicio:** Al cargar la página, verás una pregunta de multiplicación aleatoria
2. **Responder:** Ingresa tu respuesta en el campo de texto
3. **Comprobar:** 
   - Haz clic en el botón "Comprobar", o
   - Presiona la tecla **Enter**
4. **Retroalimentación:** Verás si tu respuesta fue correcta o incorrecta
5. **Siguiente:** Haz clic en "Siguiente" para continuar con otra pregunta
6. **Puntuación:** Observa tus aciertos y errores en la parte superior

## 💾 Sistema de Registros

El juego guarda automáticamente todos los intentos en el **localStorage** del navegador con la siguiente información:

- Fecha y hora del intento (timestamp)
- Pregunta realizada
- Respuesta correcta
- Respuesta del usuario
- Si fue correcta o incorrecta

### Estructura de Datos (records.json)

El archivo `records.json` muestra un ejemplo de cómo se estructuran los datos:

```json
[
  {
    "timestamp": "2025-10-14T22:47:00.000Z",
    "question": "5 × 7",
    "correctAnswer": 35,
    "userAnswer": 35,
    "isCorrect": true
  }
]
```

**Nota:** Los registros se guardan en localStorage del navegador, no en el archivo records.json.

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Estructura de la aplicación
- **CSS3:** Estilos y diseño responsive
- **JavaScript (Vanilla):** Lógica del juego
- **localStorage:** Almacenamiento de datos en el navegador

## 🎨 Características del Diseño

- Gradiente de fondo púrpura moderno
- Efectos de hover en botones
- Retroalimentación visual con colores (verde para correcto, rojo para incorrecto)
- Diseño centrado y responsive
- Efecto de vidrio esmerilado (backdrop-filter)

## 📱 Compatibilidad

El juego es compatible con:
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (tablets y smartphones)
- ✅ Diferentes resoluciones de pantalla

## 🔧 Personalización

### Cambiar el Rango de Números

En `script.js`, modifica las líneas:
```javascript
num1 = Math.floor(Math.random() * 10) + 1; // Cambia el 10 para ajustar el rango
num2 = Math.floor(Math.random() * 10) + 1;
```

### Modificar Colores

En `index.html`, ajusta los valores CSS en la sección `<style>`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📊 Ejemplo de Uso

1. Se muestra: "¿Cuánto es 7 × 8?"
2. Usuario responde: 56
3. Sistema muestra: "✅ ¡Correcto! ¡Muy bien!"
4. Se actualiza el contador de aciertos
5. Se guarda el registro en localStorage

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## 👨‍💻 Autor

**gasv1984-prog**

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un [issue](https://github.com/gasv1984-prog/juego-matematico-tablas/issues) en el repositorio.

---

¡Disfruta practicando las tablas de multiplicar! 🎉
