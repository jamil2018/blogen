import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { getAllPostsByAuthorId } from "../../data/postQueryFunctions";
import { getUserById } from "../../data/userQueryFunctions";
import {
  POST_DATA,
  SINGLE_AUTHOR_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";

const AuthorProfileScreen = () => {
  const { authorId } = useParams();

  const {
    data: authorData,
    isLoading: isAuthorDataLoading,
    isError: isAuthorDataError,
  } = useQuery([SINGLE_AUTHOR_DATA, authorId], ({ queryKey }) =>
    getUserById(queryKey[1])
  );

  const {
    data: authorPostData,
    isLoading: isAuthorPostDataLoading,
    isError: isAuthorPostDataError,
  } = useQuery([POST_DATA, authorId], ({ queryKey }) =>
    getAllPostsByAuthorId(queryKey[1])
  );

  return (
    <>
      <h1>Author Profile screen</h1>
    </>
  );
};

export default AuthorProfileScreen;
