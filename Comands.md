# 🧹 Resetear Caché en React Native (sin afectar proyectos React Web)

Este documento explica cómo limpiar la caché de React Native de forma segura, sin modificar ni interferir con otros proyectos React (web).  
Los comandos funcionan para proyectos creados con **React Native CLI** y **Expo**.

---

## 📌 1. Limpiar caché de Metro Bundler (comando principal)

Este comando reinicia el servidor de Metro y limpia toda su caché:

```sh
npx react-native start --reset-cache
