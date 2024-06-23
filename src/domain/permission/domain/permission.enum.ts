export enum PermissionEnum {
  SUPER_USER = "SUPER001",
  CAN_LOGIN = "LOGIN001",
  CAN_USE_USER = "USER0001",
  CAN_READ_USER = "USER0002",
  CAN_WRITE_USER = "USER0003",
  CAN_USE_PERMISSION = "PERM0001",
  CAN_READ_PERMISSION = "PERM0002",
  CAN_WRITE_PERMISSION = "PERM0003",
  CAN_USE_CHAT = "CHAT0001",
  CAN_READ_CHAT = "CHAT0002",
  CAN_WRITE_CHAT = "CHAT0003",
}

export enum PermissionDescriptionEnum {
  SUPER_USER = "슈퍼유저",
  CAN_LOGIN = "로그인 가능 권한",
  CAN_USE_USER = "유저 관련 API 사용 권한(R + W)",
  CAN_READ_USER = "유저 관련 API 사용 권한(R)",
  CAN_WRITE_USER = "유저 관련 API 사용 권한(W)",
  CAN_USE_PERMISSION = "권한 관련 API 사용 권한(R + W)",
  CAN_READ_PERMISSION = "권한 관련 API 사용 권한(R)",
  CAN_WRITE_PERMISSION = "권한 관련 API 사용 권한(W)",
  CAN_USE_CHAT = "채팅/챗봇 관련 API 사용 권한(R + W)",
  CAN_READ_CHAT = "채팅/챗봇 관련 API 사용 권한(R)",
  CAN_WRITE_CHAT = "채팅/챗봇 관련 API 사용 권한(W)",
}