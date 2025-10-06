// Environment variables exposed by Vite
export const ENV = (import.meta as any).env?.ENV || 'remote'; // Force remote mode
export const VM_IP_ADDRESS = '34.58.242.177'; // Hardcoded for reliability

// API URL based on environment
export const API_URL = ENV === 'remote' 
  ? `http://${VM_IP_ADDRESS}:3000`
  : 'http://localhost:3000';

console.log('Environment:', ENV);
console.log('VM IP Address:', VM_IP_ADDRESS);
console.log('API URL:', API_URL); 