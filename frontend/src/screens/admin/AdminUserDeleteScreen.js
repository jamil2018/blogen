import { useMutation, useQueryClient } from "react-query";
import AdminDeleteConfirmation from "../../components/AdminDeleteConfirmation";
import { deleteMultipleUsersById } from "../../data/userQueryFunctions";

const AdminUserDeleteScreen = ({
  showSuccessAlertHandler,
  userId,
  handleModalClose,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(deleteMultipleUsersById, {
    onSuccess: () => {
      queryClient.invalidateQueries("users");
      showSuccessAlertHandler();
      handleModalClose();
    },
  });
  const handleUserDelete = () => {
    mutation.mutate(userId);
  };
  return (
    <AdminDeleteConfirmation
      deleteAction={handleUserDelete}
      cancelAction={handleModalClose}
    />
  );
};

export default AdminUserDeleteScreen;
