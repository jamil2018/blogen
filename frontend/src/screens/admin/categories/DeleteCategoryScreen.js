import { useMutation, useQueryClient } from "react-query";
import AdminDeleteConfirmation from "../../../components/AdminDeleteConfirmation";
import { deleteMultipleCategoriesById } from "../../../data/categoryQueryFunctions";

const DeleteCategoryScreen = ({
  showSuccessAlertHandler,
  categoryId,
  handleModalClose,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(deleteMultipleCategoriesById, {
    onSuccess: () => {
      queryClient.invalidateQueries("categories");
      showSuccessAlertHandler();
      handleModalClose();
    },
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
