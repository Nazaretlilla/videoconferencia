//Config.js
//Variables de entorno
module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://jbecerracumbrera:juabeccum@cluster0.i48ax4n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    JWT_SECRET: process.env.JWT_SECRET || 'pedosfruti'
  };
  