export interface ResponseJson {
  code: number
  message: string
  error?: any
  data?: any
}

export interface ResponseCodes {
  [key: string]: number
}
