import { EntityList } from "../../../components/EntityList/EntityList";
import userService from "../../../services/userService";
import { UserInput } from "../../../types/userInterface";

const UserList = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
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
    </div>
  );
};

export default UserList;
