import { memo } from "react";
import { useMutation, useQueryClient } from "react-query";
import AdminDeleteConfirmation from "../../components/AdminDeleteConfirmation";
import { deleteCommentById } from "../../data/commentQueryFunctions";
import { COMMENT_DATA } from "../../definitions/reactQueryConstants/queryConstants";

const DeleteCommentScreen = memo(({ postId, commentId, handleModalClose }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation(deleteCommentById, {
    onSuccess: () => {
      queryClient.invalidateQueries(COMMENT_DATA);
      handleModalClose();
    },
  });
  const handleUserDelete = () => {
    mutation.mutate({ postId, commentId });
  };
  return (
    <AdminDeleteConfirmation
      deleteAction={handleUserDelete}
      cancelAction={handleModalClose}
      singleItem={true}
    />
  );
});

export default DeleteCommentScreen;
