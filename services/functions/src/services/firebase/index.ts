// import { getApps, initializeApp, ServiceAccount, cert } from "firebase-admin/app"
import { getApps, initializeApp } from "firebase-admin/app"
import { FirebaseAuthService } from "./auth.service"
import { AppOptions } from "firebase-admin"
import { APP_ENVIRONMENT } from "../../config/env"
import { logger } from "firebase-functions/v2"

/**
 * Clase que contiene los servicios de Firebase
 */
export class FirebaseService {
  public auth: FirebaseAuthService

  /**
   * Constructor
   */
  constructor() {
    let appOptionsFirebase: AppOptions | undefined

    logger.info("🔥", "Initializing Firebase", APP_ENVIRONMENT)

    if (APP_ENVIRONMENT === "development" || APP_ENVIRONMENT === "test") {
      /* Data Local */
      process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"
      process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199"
      appOptionsFirebase = {
        projectId: "dyratravel-data-engine",
      }

      /* Data Production */
      // process.env.FIRESTORE_EMULATOR_HOST = ""
      // process.env.FIREBASE_AUTH_EMULATOR_HOST = ""
      // process.env.FIREBASE_STORAGE_EMULATOR_HOST = ""
      // appOptionsFirebase = {
      //   credential: cert(require("../../../secrets/serviceAccountKey.json") as ServiceAccount),
      // }
    }

    const alreadyInitializedApps = getApps()

    const currentApp = alreadyInitializedApps.length === 0 ? initializeApp(appOptionsFirebase) : alreadyInitializedApps[0]

    this.auth = new FirebaseAuthService(currentApp)
  }
}
