export function genRoomId() {
  return (new Date().getTime().toString(36) + Math.random().toString(36).slice(2)).substring(0, 8).toUpperCase();
}