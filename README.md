# Ecommerce Mobile Application 📱

Esta es la aplicación móvil del sistema de e-commerce, desarrollada con **React Native** y **Expo**.

## 🚀 Características

- **Expo SDK 54**: Desarrollo moderno y multiplataforma.
- **React Native 0.81**: Alto rendimiento y componentes nativos.
- **Navegación Intuitiva**: Implementada con `expo-router` y `react-navigation`.
- **Gestión de Estado**: Context Providers para autenticación y carrito.
- **Seguridad**: Autenticación local y almacenamiento seguro (`expo-secure-store`).
- **Carrito de Compras**: Persistencia local y sincronización con la lógica de negocio.
- **Diseño Premium**: Interfaz moderna con animaciones suaves (`react-native-reanimated`).

## 📁 Estructura del Proyecto

```
ECCOMERCE-MOBILE/
├── app/                  # Directorio principal de expo-router
│   ├── auth/             # Pantallas de Login, Registro y Recuperación
│   ├── modules/          # Módulos principales (Inicio, Menú, Perfil, Admin)
│   ├── navigation/       # Componentes de navegación y headers
│   ├── screens/          # Pantallas de la aplicación (Carrito, etc.)
│   ├── context/          # Context Providers para estado global
│   └── _layout.jsx       # Layout raíz de la navegación
├── components/           # Componentes reutilizables
│   ├── context/          # Contextos específicos de componentes
│   ├── security/         # Componentes relacionados con seguridad
│   └── services/         # Servicios y lógica de negocio
├── config/               # Configuraciones del proyecto
├── scripts/              # Scripts de utilidad y mantenimiento
└── app.json              # Configuración de Expo
```

## 🛠️ Instalación y Requisitos

### Prerrequisitos
- **Node.js**: v18 o superior.
- **Expo Go**: Instalado en tu dispositivo móvil (iOS/Android).
- **Backend**: El backend debe estar ejecutándose para que la app funcione correctamente.

### Pasos para iniciar

1. **Entrar al directorio**:
   ```bash
   cd ECCOMERCE-MOBILE
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar entorno**:
   Crea un archivo `.env` basado en `.env.example`:
   ```env
   # Ejemplo de configuración
   API_URL=http://tu-ip-local:3000
   ```
   > [!IMPORTANT]
   > Usa tu IP local en lugar de `localhost` para que el dispositivo móvil pueda conectar con el backend.

4. **Iniciar el servidor de Expo**:
   ```bash
   npm start
   ```

5. **Escanear el código QR**:
   Abre la app **Expo Go** en tu móvil y escanea el código que aparece en la terminal.

## 📱 Comandos Disponibles

- `npm start`: Inicia el servidor de desarrollo de Expo.
- `npm run android`: Inicia la app en un emulador de Android.
- `npm run ios`: Inicia la app en un simulador de iOS.
- `npm run web`: Inicia la versión web del proyecto.
- `npm run diagnose`: Ejecuta el script de diagnóstico de conexión.
- `npm run test-api`: Prueba la conexión con el servidor API.

## 🔐 Seguridad y Autenticación

La aplicación utiliza un sistema de autenticación robusto:
- **JWT**: Gestión de tokens para sesiones persistentes.
- **Secure Store**: Almacenamiento cifrado de credenciales.
- **Local Auth**: Soporte para biometría (según dispositivo).

## 🛒 Gestión del Carrito

El carrito está implementado en `app/screens/CarritoScreen.jsx` y utiliza `carritoContext.tsx` para:
- Añadir y eliminar productos.
- Sincronizar cantidades.
- Calcular totales automáticamente.
- Persistir la selección entre sesiones.

## 🐛 Solución de Problemas

### Error de Conexión (Network Error)
1. Asegúrate de que el backend esté corriendo.
2. Verifica que tu móvil y PC estén en la misma red Wi-Fi.
3. Asegúrate de estar usando la **IP local** de tu PC en la configuración de la app.
4. Intenta ejecutar `npm run diagnose` para detectar problemas.

### Problemas de Caché de Expo
Si la app se comporta de forma extraña:
```bash
npx expo start -c
```

---
**Desarrollado para un ecosistema de e-commerce integral.** 🚀
