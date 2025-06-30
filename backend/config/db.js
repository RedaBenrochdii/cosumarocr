// backend/config/db.js
import sql from 'mssql';

const config = {
  user: 'reda', // 🔐 Ton login SQL Server
  password: 'reda@2025', // 🔐 Ton mot de passe SQL Server
  server: 'localhost',
  database: 'cosum', // 🔁 Remplace par le nom exact (ex. cosumar ou cosumutuel)
  options: {
    trustServerCertificate: true,
    enableArithAbort: true
  },
  port: 1433,
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connecté à SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Erreur connexion SQL :', err);
    process.exit(1);
  });
