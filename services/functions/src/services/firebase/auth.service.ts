import type { App } from "firebase-admin/app"
import type { UserRecord } from "firebase-admin/auth"
import { getAuth } from "firebase-admin/auth"
import { logger } from "../../utils/logger"
import { CustomClaims } from "../../types"

/**
 * Clase que contiene los servicios de Firebase Auth
 */
export class FirebaseAuthService {
  private auth

  /**
   * Constructor
   * @param {App} app - Instancia de Firebase App
   */
  constructor(app: App) {
    this.auth = getAuth(app)
  }

  /**
   * Buscar un usuario por su email
   * @param {string} email - Correo electrónico del usuario
   */
  public async getUserByEmail(email: string) {
    try {
      const result = await this.auth.getUserByEmail(email)

      if (!result.customClaims?.user_id_database) {
        await this.disableUser(result.uid)
      }
      return result
    } catch (error) {
      logger.error(`FirebaseAuthService.getUserByEmail: ${email}`, error)
      return null
    }
  }
  /**
   * Crear un usuario
   * @param {Object} params - Parámetros del usuario
   */
  public async createUser(params: { email?: string; phoneNumber?: string; displayName?: string }) {
    try {
      return await this.auth.createUser({
        ...params,
        emailVerified: true,
      })
    } catch (error) {
      logger.error(`FirebaseAuthService.createUser: ${params.email}`, error)
      throw error
    }
  }

  /**
   * Actualizar un usuario
   * @param {string} uid - UID del usuario
   * @param {Object} params - Parámetros del usuario
   */
  public async updateUser(uid: string, params: { email?: string; phoneNumber?: string; displayName?: string }) {
    try {
      return await this.auth.updateUser(uid, params)
    } catch (error) {
      logger.error(`FirebaseAuthService.updateUser: ${uid}`, error)
      throw error
    }
  }

  /**
   * Actualizar reclamos personalizados de un usuario
   * @param {UserRecord} userRecord - Instancia de UserRecord
   * @param {Object} claims - Parámetros de reclamos personalizados
   */
  public async updateCustomUserClaims(userRecord: UserRecord, claims: CustomClaims | object) {
    try {
      return await this.auth.setCustomUserClaims(userRecord.uid, claims)
    } catch (error) {
      logger.error(`FirebaseAuthService.updateCustomUserClaims: ${userRecord.uid}`, error)
      throw error
    }
  }

  /**
   * Decodificar el token de un usuario
   * @param {string} token - Token de autenticación
   */
  public async verifyUserTokenId(token: string) {
    const result = await this.auth.verifyIdToken(token)
    if (!result.user_id_database) {
      await this.disableUser(result.uid)
    }
    return result
  }

  /**
   * Obtener el usuario por UID
   * @param {string} uid - UID del usuario
   */
  public async getUserByUid(uid: string) {
    return await this.auth.getUser(uid)
  }

  /**
   * Eliminar un usuario
   * @param {string} uid - UID del usuario
   */
  public async deleteUser(uid: string) {
    return await this.auth.deleteUser(uid)
  }

  /**
   * Obtener todos los usuarios por email
   * @param {Object[]} emails - Lista de emails
   */
  public async listUsersByEmail(emails: { email: string }[]) {
    return await this.auth.getUsers(emails)
  }

  /**
   * Deshabilitar usuario
   * @param {string} uid - UID del usuario
   */
  public async disableUser(uid: string) {
    await this.auth.updateUser(uid, { disabled: true })
  }

  /**
   * Habilitar usuario
   * @param {string} uid - UID del usuario
   */
  public async enableUser(uid: string) {
    await this.auth.updateUser(uid, { disabled: false })
  }
}
