const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quản lý Sản xuất Bún API',
      version: '1.0.0',
      description: 'API documentation for Quản lý Sản xuất Bún',
      contact: {
        name: 'Ly My Duyen',
        email: 'lymyduyen@example.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://quanly-sanxuat-tts-vnpt.onrender.com/api' : 'http://localhost:3001/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: process.env.NODE_ENV === 'production' ? 'https' : 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/Routers/**/*.js',
    './src/Controllers/**/*.js',
    './src/models/**/*.js',
    './src/Middleware/**/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

function setupSwagger(app) {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at /api-docs');
}

module.exports = setupSwagger; 