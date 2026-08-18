import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminDeleteConfirmation from "../../../components/AdminDeleteConfirmation";
import { deleteMultipleCategoriesById } from "../../../data/categoryQueryFunctions";

const DeleteCategoryScreen = ({
  showSuccessAlertHandler,
  categoryId,
  handleModalClose,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteMultipleCategoriesById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showSuccessAlertHandler();
      handleModalClose();
    }
  });
  const handleUserDelete = () => {
    mutation.mutate(categoryId);
  };
  return (
    <AdminDeleteConfirmation
      deleteAction={handleUserDelete}
      cancelAction={handleModalClose}
    />
  );
};

export default DeleteCategoryScreen;
