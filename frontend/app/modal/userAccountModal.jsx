import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import UserService from "../services/UserService";

const UserModal = ({ visible, onHide, userId, onUserUpdated }) => {
  const [user, setUser] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    status: 1,
  });

  useEffect(() => {
    if (userId) {
      UserService.getUserById(userId).then((data) => {
        setUser(data);
      });
    } else {
      setUser({ username: "", fullName: "", email: "", phone: "", status: 1 });
    }
  }, [userId]);

  const handleSave = async () => {
    if (userId) {
      await UserService.updateUser(userId, user);
    } else {
      await UserService.createUser(user);
    }
    onUserUpdated();
    onHide();
  };

  return (
    <Dialog header="User Information" visible={visible} onHide={onHide} modal>
      <div className="p-fluid">
        <div className="p-field">
          <label>Username</label>
          <InputText value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} disabled={!!userId} />
        </div>
        <div className="p-field">
          <label>Full Name</label>
          <InputText value={user.fullName} onChange={(e) => setUser({ ...user, fullName: e.target.value })} />
        </div>
        <div className="p-field">
          <label>Email</label>
          <InputText value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        </div>
        <div className="p-field">
          <label>Phone</label>
          <InputText value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
        </div>
        <div className="p-field">
          <label>Status</label>
          <InputText value={user.status} onChange={(e) => setUser({ ...user, status: e.target.value })} />
        </div>
      </div>
      <div className="p-d-flex p-jc-end">
        <Button label="Save" icon="pi pi-check" onClick={handleSave} autoFocus />
      </div>
    </Dialog>
  );
};

export default UserModal;