# 📊 Calculadora de Notas UNJFSC - Extensión de Chrome/Edge

Extensión que calcula automáticamente las notas necesarias para alcanzar tu promedio deseado en la Intranet UNJFSC.

## ✨ Características

- **Activación automática**: Se carga automáticamente al ingresar a la página de evaluaciones parciales
- **Verificación inteligente**: Valida que exista la tabla de notas antes de inyectar el script
- **Cálculo equitativo**: Distribuye las notas necesarias proporcionalmente entre los PM vacíos
- **Interfaz integrada**: Se adapta perfectamente al diseño de la intranet
- **Sin clicks**: Solo instala y navega a la página

## 🚀 Instalación

### Chrome

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el **Modo de desarrollador** (esquina superior derecha)
3. Click en **Cargar extensión sin empaquetar**
4. Selecciona la carpeta `Ext` que contiene estos archivos:
   - `manifest.json`
   - `content.js`
   - `icon16.png`, `icon64.png`, `icon128.png`
5. ¡Listo! La extensión aparecerá en tu lista

### Microsoft Edge

1. Abre Edge y ve a `edge://extensions/`
2. Activa el **Modo de desarrollador** (esquina inferior izquierda)
3. Click en **Cargar descomprimida**
4. Selecciona la carpeta `Ext`
5. ¡Listo!

## 📖 Uso

1. Ingresa a la Intranet UNJFSC: https://intranet.unjfsc.edu.pe/ZonaEstudiante/frmEvaluacionesParciales.aspx
2. La calculadora aparecerá automáticamente debajo de tu tabla de notas
3. Ingresa tu promedio deseado (por defecto: 10.5)
4. Las notas necesarias se calcularán automáticamente y aparecerán en **azul** en la tabla

## 🛠️ Archivos del proyecto

```
Ext/
├── manifest.json      # Configuración de la extensión
├── content.js         # Script principal que se inyecta
├── icon16.png         # Icono 16x16px
├── icon48.png         # Icono 48x48px
├── icon128.png        # Icono 128x128px
└── README.md          # Este archivo
```

## 🔧 Solución de problemas

**La extensión no aparece en la página:**
- Verifica que estés en la URL exacta: `https://intranet.unjfsc.edu.pe/ZonaEstudiante/frmEvaluacionesParciales.aspx`
- Recarga la página (F5)
- Abre la consola del navegador (F12) y busca el mensaje: `✅ Calculadora de Notas UNJFSC cargada exitosamente`

**La extensión no se instala:**
- Asegúrate de que todos los archivos estén en la misma carpeta
- Verifica que el `manifest.json` sea válido

## 📝 Versión

**1.0.0** - Primera versión de la extensión

## 👨‍💻 Desarrollo

Esta extensión usa Manifest V3 y Content Scripts para inyectar el código JavaScript directamente en la página de la intranet cuando detecta la URL específica.
