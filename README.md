# WinTrust - Sistema de Sorteos con World ID

WinTrust es una mini-app dentro del ecosistema Worldcoin que permite a los usuarios participar en sorteos verificados con World ID.

## 🚀 Características

- Verificación de identidad con World ID
- Sistema de sorteos con números únicos
- Backend seguro y escalable
- Integración con MiniKit de Worldcoin

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Express.js, TypeScript
- **Autenticación**: World ID (IDKit)
- **Base de datos**: In-memory (preparado para migrar a persistente)

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Credenciales de World ID (APP_ID y ACTION_ID)

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/wintrust.git
cd wintrust
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
# Crea un archivo .env en la raíz del proyecto
cp .env.example .env
```

4. Edita el archivo `.env` con tus credenciales:
```env
# Frontend
NEXT_PUBLIC_APP_ID=tu_app_id
NEXT_PUBLIC_ACTION_ID=tu_action_id

# Backend
PORT=3001
APP_ID=tu_app_id
ACTION_ID=tu_action_id
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 🚀 Desarrollo

1. Inicia el servidor de desarrollo:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server:dev
```

2. Accede a la aplicación:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📡 API Endpoints

### Sorteos

- `GET /sorteos` - Lista todos los sorteos activos
- `GET /sorteos/:id` - Obtiene detalles de un sorteo
- `POST /sorteos/participar` - Permite participar en un sorteo
- `GET /sorteos/:id/ganador` - Obtiene el ganador de un sorteo

### Ejemplo de participación

```typescript
const response = await fetch('http://localhost:3001/sorteos/participar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    raffleId: '123',
    numero_elegido: 42, // opcional
    proof: {
      nullifier_hash: '...',
      merkle_root: '...',
      proof: '...',
      verification_level: '...'
    },
    action: 'sorteo_123_compra_abc123' // único por compra
  })
});
```

## 🔒 Seguridad

- Verificación robusta de World ID
- Rate limiting por IP
- Validación de datos
- Enmascaramiento de nullifier_hash
- CORS configurado
- Headers de seguridad

## 📝 Licencia

MIT

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
