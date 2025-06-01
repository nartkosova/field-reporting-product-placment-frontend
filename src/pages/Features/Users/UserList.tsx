import { EntityList } from "../../../components/EntityList/EntityList";
import userService from "../../../services/userService";
import { UserInput } from "../../../types/userInterface";

const UserList = () => {
  return (
    <EntityList
      title="Përdoruesit"
      fetchAll={async () => {
        const users = await userService.getAllUsers();
        return users.map((u: UserInput) => ({
          id: u.user_id,
          name: u.user,
          role: u.role,
          created_at: u.created_at,
        }));
      }}
      onDelete={userService.deleteUser}
      editPath="/settings/edit/users"
      itemLabel="përdoruesin"
    />
  );
};

export default UserList;
