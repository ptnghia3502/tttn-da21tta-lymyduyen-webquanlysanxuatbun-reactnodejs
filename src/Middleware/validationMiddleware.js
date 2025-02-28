const Joi = require('joi');

// Các validation rules thường dùng
const commonRules = {
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Tên đăng nhập không được để trống',
      'string.min': 'Tên đăng nhập phải có ít nhất {#limit} ký tự',
      'string.max': 'Tên đăng nhập không được vượt quá {#limit} ký tự'
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
      'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    }),

  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Họ tên không được để trống',
      'string.min': 'Họ tên phải có ít nhất {#limit} ký tự',
      'string.max': 'Họ tên không được vượt quá {#limit} ký tự'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số'
    })
};

// Schema cho người dùng
const userSchema = {
  register: Joi.object({
    username: commonRules.username,
    password: commonRules.password,
    fullName: commonRules.fullName,
    email: commonRules.email,
    phone: commonRules.phone
  }),

  update: Joi.object({
    fullName: commonRules.fullName,
    email: commonRules.email,
    phone: commonRules.phone,
    status: Joi.number()
      .valid(0, 1)
      .required()
      .messages({
        'any.only': 'Trạng thái không hợp lệ'
      })
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Mật khẩu cũ không được để trống'
      }),
    newPassword: commonRules.password
  })
};

// Schema cho quyền
const roleSchema = {
  create: Joi.object({
    tenQuyen: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Tên quyền không được để trống',
        'string.min': 'Tên quyền phải có ít nhất {#limit} ký tự',
        'string.max': 'Tên quyền không được vượt quá {#limit} ký tự'
      })
  }),

  assignRole: Joi.object({
    userId: Joi.number()
      .required()
      .messages({
        'number.base': 'ID người dùng không hợp lệ'
      }),
    roleIds: Joi.array()
      .items(Joi.number())
      .min(1)
      .required()
      .messages({
        'array.base': 'Danh sách quyền không hợp lệ',
        'array.min': 'Phải chọn ít nhất một quyền'
      })
  })
};

// Middleware validation
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(err => ({
        field: err.path[0],
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  userSchema,
  roleSchema,
  validate
}; 