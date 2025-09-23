# Exora Barbería - PWA de Gestión de Citas

Una aplicación web progresiva (PWA) completa para trabajadores de barbería que permite visualizar y gestionar las citas diarias a través de un sistema de tarjetas deslizables.

## 🚀 Características

- **Autenticación segura** con JWT y validación Zod
- **Interfaz de tarjetas deslizables** con gestos touch y animaciones fluidas
- **PWA completa** con funcionalidad offline y cache inteligente
- **Diseño responsive** optimizado para móviles y especialmente iPhone
- **Gestión de estado** con Zustand para rendimiento óptimo
- **Notificaciones elegantes** con React Hot Toast
- **TypeScript** para desarrollo seguro y escalable

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS con variables CSS personalizadas
- **Estado**: Zustand
- **HTTP Client**: Axios con interceptors
- **PWA**: Vite-plugin-PWA + Workbox
- **Animaciones**: React Spring + React Use Gesture
- **Routing**: React Router DOM
- **Validación**: Zod
- **Notificaciones**: React Hot Toast

## 📱 Diseño Visual

### Colores de la Marca
```css
--exora-primary: #555BF6    /* Azul principal */
--exora-secondary: #FD778B  /* Rosa secundario */
--exora-dark: #02145C       /* Azul oscuro */
--exora-light-blue: #D2E9FF /* Azul claro */
--exora-light-yellow: #FCFFA8 /* Amarillo claro */
--exora-background: #f8f8f8 /* Fondo */
```

### Fuente
- **Work Sans** de Google Fonts con pesos 300-900

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm

### Configuración Local

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tu configuración de API
```

3. **Iniciar desarrollo**:
```bash
npm run dev
```

4. **Abrir navegador**:
```
http://localhost:5173
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Construye para producción
npm run preview      # Preview del build

# Validación
npm run type-check   # Verifica tipos TypeScript
npm run lint         # Ejecuta ESLint
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── AppointmentCard.tsx   # Tarjeta de cita
│   ├── CardStack.tsx         # Stack de tarjetas con gestos
│   ├── DateSelector.tsx      # Selector de fecha
│   ├── BottomNavigation.tsx  # Navegación inferior
│   └── LoadingSpinner.tsx    # Spinner de carga
├── pages/              # Páginas principales  
│   ├── Login.tsx            # Página de login
│   └── Dashboard.tsx        # Dashboard principal
├── stores/             # Gestión de estado Zustand
│   ├── authStore.ts         # Estado de autenticación
│   └── appointmentStore.ts  # Estado de citas
├── services/           # Servicios API
│   ├── api.ts              # Cliente HTTP configurado
│   └── auth.service.ts     # Servicio de autenticación
├── types/              # Tipos TypeScript
│   └── index.ts            # Interfaces principales
├── utils/              # Utilidades
│   ├── constants.ts        # Constantes y datos mock
│   └── helpers.ts          # Funciones helper
├── hooks/              # Hooks personalizados
│   └── useSwipeGesture.ts  # Hook para gestos swipe
├── App.tsx             # Componente raíz con routing
├── main.tsx           # Punto de entrada
└── index.css          # Estilos globales y variables CSS
```

## 🔐 Autenticación

### Login de Prueba
Para desarrollo, la aplicación maneja errores de API graciosamente y carga datos mock:

- **Email**: cualquier email válido
- **Contraseña**: mínimo 6 caracteres

### JWT Token Storage
- Tokens almacenados en localStorage
- Interceptors de Axios manejan automáticamente la autenticación
- Auto-logout en caso de token expirado

## 📊 API Integration

### Endpoints Esperados

```typescript
// Autenticación
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }

// Citas
GET /api/appointments?date=YYYY-MM-DD&professional_id=string
Headers: { Authorization: "Bearer {token}" }
Response: Appointment[]
```

### Datos Mock Incluidos
La aplicación incluye datos de ejemplo que se cargan automáticamente si la API no está disponible.

## 📱 PWA Features

### Service Worker
- **Cache de assets** estáticos (HTML, CSS, JS, imágenes)
- **Network-first** para llamadas a API
- **Cache-first** para recursos estáticos
- **Notificación** de actualización disponible

### Manifest
- **Instalable** en dispositivos móviles
- **Iconos** optimizados (192px y 512px)
- **Standalone mode** para experiencia nativa
- **Theme colors** configurados

### Offline Support
- Funcionalidad básica offline con datos cacheados
- Fallback a datos mock si no hay conexión
- Sync automático al reconectar

## 🎯 Funcionalidades Principales

### Sistema de Tarjetas
- **Gestos swipe** left/right para navegar
- **Stack 3D** con efecto de profundidad
- **Animaciones fluidas** con React Spring
- **Indicadores** de posición visual

### Datos de Cita
- Información completa del cliente
- Servicios y variantes
- Sucursal y horario
- Descuentos aplicados
- Comentarios opcionales

### Navegación
- **Selector de fecha** con acceso rápido
- **Botones de navegación** anterior/siguiente
- **FAB central** para agregar citas
- **Safe area** para dispositivos iPhone

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Despliegue en Netlify/Vercel
1. Conectar repositorio
2. Configurar build command: `npm run build`
3. Configurar publish directory: `dist`
4. Añadir variables de entorno

### Despliegue en Servidor Propio
```bash
# Build
npm run build

# Servir con nginx o servidor estático
# Los archivos están en ./dist/
```

### Variables de Entorno para Producción
```bash
VITE_API_URL=https://api.tudominio.com
NODE_ENV=production
```

## 🔧 Desarrollo

### Hot Reload
Vite proporciona hot reload automático durante desarrollo.

### TypeScript Strict Mode
Proyecto configurado con TypeScript strict para máxima seguridad de tipos.

### ESLint
Configuración incluida para mantener calidad de código.

## 📱 Compatibilidad

- **iOS Safari** 13+
- **Android Chrome** 80+
- **Desktop Chrome/Firefox/Edge** últimas versiones
- **Optimizado** especialmente para dispositivos móviles

## 🐛 Troubleshooting

### Error de API
- Verifica que `VITE_API_URL` esté configurada correctamente
- La app funcionará con datos mock si la API falla

### Problemas de Build
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

Si el build falla con un error parecido a `crypto.getRandomValues is not a function`, asegúrate de estar utilizando Node.js 18.17 o superior (Vite 5 requiere las APIs de Web Crypto disponibles a partir de esa versión). Actualiza tu entorno o configura `nvm`/`volta` para usar al menos Node 18 antes de ejecutar `npm run build`.

### Issues de PWA
- Verifica que el Service Worker esté registrado en DevTools
- Limpia cache del navegador si hay problemas

## 📄 Licencia

Este proyecto es de uso interno para Exora Barbería.

---

**Desarrollado con ❤️ por el equipo de Exora**

Para soporte técnico, contactar al equipo de desarrollo.