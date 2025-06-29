import { EntityList } from "../../../components/EntityList/EntityList";
import userService from "../../../services/userService";
import { UserInput } from "../../../types/userInterface";
import React from "react";

const UserList = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
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
    </div>
  );
};

export default UserList;
