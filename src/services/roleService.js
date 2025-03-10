const Role = require('../models/roleModel');

class RoleService {
  static async getAllRoles() {
    return Role.getAll();
  }

  static async createRole(roleData) {
    // Kiểm tra tên quyền đã tồn tại
    const existingRoles = await Role.getAll();
    const roleExists = existingRoles.some(
      role => role.Ten_quyen.toLowerCase() === roleData.tenQuyen.toLowerCase()
    );
    
    if (roleExists) {
      throw new Error('Tên quyền đã tồn tại');
    }

    return Role.create(roleData);
  }

  static async updateRole(id, roleData) {
    const role = await Role.findById(id);
    if (!role) {
      throw new Error('Không tìm thấy quyền');
    }

    // Kiểm tra tên quyền mới có trùng với quyền khác không
    if (roleData.tenQuyen !== role.Ten_quyen) {
      const existingRoles = await Role.getAll();
      const roleExists = existingRoles.some(
        r => r.Id !== id && r.Ten_quyen.toLowerCase() === roleData.tenQuyen.toLowerCase()
      );
      
      if (roleExists) {
        throw new Error('Tên quyền đã tồn tại');
      }
    }

    return Role.update(id, roleData);
  }
}

module.exports = RoleService; 