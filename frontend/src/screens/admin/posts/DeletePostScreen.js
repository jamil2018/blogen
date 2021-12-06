import { useMutation, useQueryClient } from "react-query";
import AdminDeleteConfirmation from "../../../components/AdminDeleteConfirmation";
import { deleteMultiplePostsById } from "../../../data/postQueryFunctions";

const DeletePostScreen = ({
  showSuccessAlertHandler,
  postId,
  handleModalClose,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(deleteMultiplePostsById, {
    onSuccess: () => {
      queryClient.invalidateQueries("posts");
      showSuccessAlertHandler();
      handleModalClose();
    },
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
