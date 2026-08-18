import EditUserPostScreen from "../../../../../screens/user/posts/EditUserPostScreen";

type EditUserPostPageProps = {
  params: Promise<{ editPostId: string }>;
};

export default async function EditUserPostPage({
  params,
}: EditUserPostPageProps) {
  const { editPostId } = await params;
  return <EditUserPostScreen key={editPostId} />;
}
