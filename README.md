# Control de Acceso Vehicular con NFC - PWA

Una Progressive Web App (PWA) desarrollada para el control de acceso vehicular del condominio Bonaventure utilizando tecnología NFC y la API Web NFC del navegador.

## 🚀 Características

- **Lectura de tarjetas NFC MIFARE Classic 1k**
- **Registro de nuevas tarjetas**
- **Gestión de eventos de acceso (entrada/salida)**
- **Interfaz responsive con Material Design**
- **Funcionalidad offline básica**
- **Instalable como app nativa**
- **Optimizada para Chrome Android**

## 📱 Requisitos del Sistema

### Dispositivo
- **Android** con soporte NFC
- **Chrome** versión 89 o superior
- **Conexión a internet** para comunicación con el backend

### Navegador
- **Chrome Android** (requerido para Web NFC API)
- **HTTPS** obligatorio para PWA y NFC

## 🛠️ Instalación y Configuración

### 1. Servir la Aplicación

#### Opción A: Servidor Local (Desarrollo)
```bash
# Usando Python 3
python -m http.server 8000

# Usando Node.js (http-server)
npx http-server -p 8000

# Usando PHP
php -S localhost:8000
```

#### Opción B: Servidor Web (Producción)
```bash
# Copiar archivos al directorio web del servidor
cp -r * /var/www/html/nfc-access/

# Configurar HTTPS (obligatorio para PWA)
# Ejemplo con Apache
<VirtualHost *:443>
    ServerName tu-dominio.com
    DocumentRoot /var/www/html/nfc-access
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
</VirtualHost>
```

### 2. Acceder a la Aplicación

1. Abrir **Chrome** en dispositivo Android
2. Navegar a `https://tu-dominio.com` (o `http://localhost:8000` para desarrollo)
3. La aplicación detectará automáticamente el soporte NFC

### 3. Instalar como PWA

1. En Chrome Android, tocar el menú (⋮)
2. Seleccionar **"Agregar a pantalla de inicio"**
3. Confirmar la instalación
4. La app aparecerá como aplicación nativa

## 📋 Uso de la Aplicación

### Módulo de Lectura de Tarjeta

1. **Iniciar Escaneo**: Tocar "Iniciar Escaneo NFC"
2. **Acercar Tarjeta**: Colocar tarjeta NFC cerca del dispositivo
3. **Ver Información**: Se mostrarán los datos del propietario
4. **Registrar Acceso**: Tocar "Entrada" o "Salida"

### Módulo de Registro de Tarjeta

1. **Completar Formulario**: Ingresar usuario WordPress y etiqueta
2. **Leer Tarjeta**: Tocar "Leer Tarjeta para Registro"
3. **Acercar Tarjeta**: Colocar tarjeta NFC cerca del dispositivo
4. **Registrar**: Tocar "Registrar Tarjeta"

## 🔧 API Endpoints

La aplicación se comunica con los siguientes endpoints:

### Lectura de Propietario
```
GET https://api.bonaventurecclub.com/nfc_access/cards/owner/{uid}
```

### Registro de Acceso
```
POST https://api.bonaventurecclub.com/nfc_access/access/log
Content-Type: application/json

{
  "card_uid": "UID_LEÍDO",
  "access_type": "entrada" | "salida",
  "guard_user": "Nombre del vigilante"
}
```

### Registro de Tarjeta
```
POST https://api.bonaventurecclub.com/nfc_access/cards/register
Content-Type: application/json

{
  "wp_user_login": "usuario_ingresado",
  "card_uid": "UID_LEÍDO",
  "label": "etiqueta_ingresada"
}
```

## 📁 Estructura del Proyecto

```
android_nfcaccess/
├── index.html              # Aplicación principal (HTML, CSS, JS)
├── manifest.json           # Configuración PWA
├── service-worker.js       # Service Worker para funcionalidad offline
└── README.md              # Este archivo
```

## 🎨 Personalización

### Cambiar Logo
Modificar la URL en `index.html`:
```html
<img src="https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1.png" 
     alt="Logo Bonaventure" class="logo">
```

### Cambiar Colores
Modificar las variables CSS en `index.html`:
```css
:root {
  --primary-color: #1976d2;
  --secondary-color: #42a5f5;
  --success-color: #4caf50;
  --error-color: #f44336;
}
```

### Cambiar Usuario Vigilante
Modificar en `index.html`:
```javascript
this.guardUser = 'Tu Nombre de Vigilante';
```

## 🐛 Solución de Problemas

### NFC No Funciona
- ✅ Verificar que sea **Chrome Android**
- ✅ Verificar que el dispositivo tenga **NFC habilitado**
- ✅ Verificar que la página use **HTTPS**
- ✅ Verificar permisos de NFC en Chrome

### PWA No Se Instala
- ✅ Verificar que el servidor use **HTTPS**
- ✅ Verificar que `manifest.json` sea válido
- ✅ Verificar que el service worker esté registrado

### Errores de Conexión
- ✅ Verificar conexión a internet
- ✅ Verificar que los endpoints de API sean correctos
- ✅ Verificar CORS en el servidor backend

### Tarjeta No Se Lee
- ✅ Verificar que la tarjeta sea **MIFARE Classic 1k**
- ✅ Acercar la tarjeta más al dispositivo
- ✅ Intentar varias veces
- ✅ Verificar que la tarjeta no esté dañada

## 🔒 Seguridad

- La aplicación requiere **HTTPS** para funcionar
- Los datos se transmiten de forma segura al backend
- No se almacenan datos sensibles localmente
- Se requiere permiso explícito para usar NFC

## 📱 Compatibilidad

| Navegador | Soporte NFC | Soporte PWA |
|-----------|-------------|-------------|
| Chrome Android | ✅ | ✅ |
| Chrome Desktop | ❌ | ✅ |
| Firefox | ❌ | ✅ |
| Safari | ❌ | ✅ |

## 🚀 Despliegue en Producción

### 1. Configurar Servidor Web
```bash
# Nginx
server {
    listen 443 ssl;
    server_name tu-dominio.com;
    root /var/www/html/nfc-access;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para PWA
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Configurar HTTPS
- Obtener certificado SSL válido
- Configurar redirección HTTP → HTTPS
- Verificar que todos los recursos usen HTTPS

### 3. Optimizaciones
- Habilitar compresión gzip
- Configurar cache headers
- Minificar archivos para producción

## 📞 Soporte

Para soporte técnico o reportar problemas:

- **Email**: soporte@bonaventurecclub.com
- **Teléfono**: +1 (555) 123-4567
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

## 📄 Licencia

Este proyecto está desarrollado específicamente para el condominio Bonaventure. Todos los derechos reservados.

---

**Desarrollado con ❤️ para Bonaventure Condominium Club**
