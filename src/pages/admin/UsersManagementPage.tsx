import React from "react";
import { UsersManagementPage as UsersManagementView } from "../../features/admin/components/UsersManagementPage";

export const UsersManagementPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UsersManagementView />
    </div>
  );
};
