import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminDeleteConfirmation from "../../../components/AdminDeleteConfirmation";
import { deleteMultipleUsersById } from "../../../data/userQueryFunctions";

const AdminUserDeleteScreen = ({
  showSuccessAlertHandler,
  userId,
  handleModalClose,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteMultipleUsersById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSuccessAlertHandler();
      handleModalClose();
    }
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
