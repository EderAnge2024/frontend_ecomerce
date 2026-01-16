#!/bin/bash

# Script para instalar dependencias de seguridad para ECOMMERCE-MOBILE
# Ejecutar desde la raíz del proyecto: ./scripts/install-security-deps.sh

echo "🔒 Instalando dependencias de seguridad para ECOMMERCE-MOBILE..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecutar desde la raíz del proyecto ECOMMERCE-MOBILE"
    exit 1
fi

# Instalar Expo SecureStore para almacenamiento seguro
echo "📦 Instalando expo-secure-store..."
npx expo install expo-secure-store

# Instalar crypto para funciones de encriptación
echo "📦 Instalando expo-crypto..."
npx expo install expo-crypto

# Instalar local authentication para biometría (opcional)
echo "📦 Instalando expo-local-authentication..."
npx expo install expo-local-authentication

# Instalar network para verificar conectividad
echo "📦 Instalando @react-native-async-storage/async-storage (actualizar)..."
npm install @react-native-async-storage/async-storage@latest

# Verificar instalación
echo "✅ Verificando instalación..."

# Verificar que las dependencias estén en package.json
if grep -q "expo-secure-store" package.json; then
    echo "✅ expo-secure-store instalado"
else
    echo "❌ expo-secure-store NO instalado"
fi

if grep -q "expo-crypto" package.json; then
    echo "✅ expo-crypto instalado"
else
    echo "❌ expo-crypto NO instalado"
fi

if grep -q "expo-local-authentication" package.json; then
    echo "✅ expo-local-authentication instalado"
else
    echo "❌ expo-local-authentication NO instalado"
fi

echo ""
echo "🔒 CONFIGURACIÓN DE SEGURIDAD COMPLETADA"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Revisar el archivo SECURITY_AUDIT_MOBILE.md"
echo "2. Actualizar AuthContext para usar SecureStorage"
echo "3. Configurar variables de entorno de producción"
echo "4. Deshabilitar debug mode en producción"
echo "5. Implementar certificate pinning si es necesario"
echo ""
echo "⚠️  IMPORTANTE:"
echo "- Nunca subir archivos .env a control de versiones"
echo "- Usar .env.production para configuración de producción"
echo "- Realizar testing de seguridad antes del despliegue"
echo ""
echo "🚀 ¡Listo para implementar las mejoras de seguridad!"