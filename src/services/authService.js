// Ici tu peux remplacer par de vrais appels fetch/axios vers ton backend
export async function login(email, password) {
    // mock : on renvoie un token factice et un user minimal
    if (email === 'admin@exemple.com' && password === 'password') {
      return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
        user: { id: 1, name: 'Admin', email }
      };
    }
    throw new Error('Identifiants invalides');
  }
  
  export function logout() {
    // ici tu pourrais appeler une route backend pour invalider le token
  }
  
  export function getUserFromToken(token) {
    // mock : on parse le token pour récupérer l’email
    const payload = { email: 'admin@exemple.com', name: 'Admin' };
    return payload;
  }
  