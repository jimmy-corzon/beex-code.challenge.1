import { ResponseCodes } from "./types"

export const ResCodes: ResponseCodes = {
  // Éxito
  OK: 0, // Operación exitosa

  // Autenticación
  AUTHENTICATION_ERROR: 1000, // Error de autenticación
  INVALID_CREDENTIALS: 1001, // Credenciales inválidas
  TOKEN_EXPIRED: 1002, // Token expirado
  TOKEN_INVALID: 1003, // Token inválido
  ACCOUNT_LOCKED: 1004, // Cuenta bloqueada
  ACCOUNT_DISABLED: 1005, // Cuenta deshabilitada

  // Autorización
  UNAUTHORIZED: 2000, // No autorizado
  FORBIDDEN: 2001, // Prohibido
  INSUFFICIENT_PERMISSIONS: 2002, // Permisos insuficientes

  // Errores de datos
  INVALID_DATA: 3000, // Datos inválidos
  DUPLICATE_FIELD: 3001, // Campo duplicado
  DUPLICATE_ENTRY: 3002, // Entrada duplicada
  DATA_NOT_FOUND: 3003, // Datos no encontrados
  VALIDATION_ERROR: 3004, // Error de validación
  DATA_CONFLICT: 3005, // Conflicto de datos
  DATA_TOO_LARGE: 3006, // Datos demasiado grandes
  DATA_TOO_SMALL: 3007, // Datos demasiado pequeños
  DATA_TYPE_MISMATCH: 3008, // Tipo de datos no coincide
  DATA_LINKED: 3009, // Datos vinculados, no se puede eliminar

  // Errores de servicios externos
  EXTERNAL_SERVICE_ERROR: 4000, // Error de servicio externo
  SERVICE_UNAVAILABLE: 4001, // Servicio no disponible
  TIMEOUT: 4002, // Tiempo de espera agotado
  EXTERNAL_API_ERROR: 4003, // Error en API externa
  NETWORK_ERROR: 4004, // Error de red

  // Errores del proveedor de datos
  NO_RECORDS: 5000, // No hay registros
  DATABASE_ERROR: 5001, // Error de base de datos
  CONSTRAINT_VIOLATION: 5002, // Violación de restricción
  FOREIGN_KEY_VIOLATION: 5003, // Violación de clave foránea
  UNIQUE_CONSTRAINT_VIOLATION: 5004, // Violación de restricción única
  TRANSACTION_FAILED: 5005, // Transacción fallida

  // Errores del servidor
  INTERNAL_SERVER_ERROR: 6000, // Error interno del servidor
  BAD_REQUEST: 6001, // Solicitud incorrecta
  NOT_FOUND: 6002, // No encontrado
  METHOD_NOT_ALLOWED: 6003, // Método no permitido
  CONFLICT: 6004, // Conflicto
  UNSUPPORTED_MEDIA_TYPE: 6005, // Tipo de medio no soportado
  RATE_LIMIT_EXCEEDED: 6006, // Límite de solicitudes excedido
  SERVICE_OVERLOADED: 6007, // Servicio sobrecargado

  // Errores de seguridad
  CSRF_TOKEN_INVALID: 7000, // Token CSRF inválido
  XSS_DETECTED: 7001, // XSS detectado
  SQL_INJECTION_DETECTED: 7002, // Inyección SQL detectada
  UNAUTHORIZED_ACCESS_ATTEMPT: 7003, // Intento de acceso no autorizado

  // Errores de usuario
  USER_NOT_FOUND: 8000, // Usuario no encontrado
  USER_ALREADY_EXISTS: 8001, // Usuario ya existe
  USER_CREATION_FAILED: 8002, // Fallo en la creación del usuario
  USER_UPDATE_FAILED: 8003, // Fallo en la actualización del usuario
  USER_DELETION_FAILED: 8004, // Fallo en la eliminación del usuario

  // Errores de archivos
  FILE_NOT_FOUND: 9000, // Archivo no encontrado
  FILE_UPLOAD_FAILED: 9001, // Fallo en la carga del archivo
  FILE_TOO_LARGE: 9002, // Archivo demasiado grande
  UNSUPPORTED_FILE_TYPE: 9003, // Tipo de archivo no soportado

  // Errores desconocidos
  UNKNOWN: 9999, // Error desconocido
}
