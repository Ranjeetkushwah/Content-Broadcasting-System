const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Content Broadcasting System API',
      version: '1.0.0',
      description: 'A comprehensive backend system for educational content management with approval workflows and scheduled broadcasting',
      contact: {
        name: 'Backend Developer',
        email: 'developer@example.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            role: {
              type: 'string',
              enum: ['principal', 'teacher'],
              description: 'User role'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Content: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Content ID'
            },
            title: {
              type: 'string',
              description: 'Content title'
            },
            description: {
              type: 'string',
              description: 'Content description'
            },
            subject: {
              type: 'string',
              description: 'Subject category'
            },
            file_url: {
              type: 'string',
              description: 'File URL'
            },
            file_type: {
              type: 'string',
              description: 'File type (jpg, png, gif)'
            },
            file_size: {
              type: 'integer',
              description: 'File size in bytes'
            },
            status: {
              type: 'string',
              enum: ['uploaded', 'pending', 'approved', 'rejected'],
              description: 'Content status'
            },
            rejection_reason: {
              type: 'string',
              description: 'Reason for rejection (if rejected)'
            },
            uploaded_by: {
              type: 'integer',
              description: 'ID of user who uploaded content'
            },
            uploaded_by_name: {
              type: 'string',
              description: 'Name of user who uploaded content'
            },
            start_time: {
              type: 'string',
              format: 'date-time',
              description: 'When content becomes visible'
            },
            end_time: {
              type: 'string',
              format: 'date-time',
              description: 'When content stops being visible'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Content creation timestamp'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT authentication token'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error description'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            }
          }
        },
        LiveContentResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            teacher: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: 'Teacher ID'
                },
                name: {
                  type: 'string',
                  description: 'Teacher name'
                }
              }
            },
            subjects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  subject: {
                    type: 'string',
                    description: 'Subject name'
                  },
                  content: {
                    $ref: '#/components/schemas/Content'
                  }
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
