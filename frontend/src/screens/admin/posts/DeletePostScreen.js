import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminDeleteConfirmation from "../../../components/AdminDeleteConfirmation";
import { deleteMultiplePostsById } from "../../../data/postQueryFunctions";

const DeletePostScreen = ({
  showSuccessAlertHandler,
  postId,
  handleModalClose,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteMultiplePostsById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      showSuccessAlertHandler();
      handleModalClose();
    }
  });
  const handleUserDelete = () => {
    mutation.mutate(postId);
  };
  return (
    <AdminDeleteConfirmation
      deleteAction={handleUserDelete}
      cancelAction={handleModalClose}
    />
  );
};

export default DeletePostScreen;
