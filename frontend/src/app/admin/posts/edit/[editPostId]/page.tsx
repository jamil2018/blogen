import EditPostScreen from "../../../../../screens/admin/posts/EditPostScreen";

type EditPostPageProps = {
  params: Promise<{ editPostId: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { editPostId } = await params;
  return <EditPostScreen key={editPostId} />;
}
