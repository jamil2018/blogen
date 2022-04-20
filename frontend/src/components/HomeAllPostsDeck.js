import { memo } from "react";
import { calculateReadingTime } from "../utils/dataFormat";
import { getBase64ImageURL } from "../utils/imageConvertion";
import ExpandedPostSummaryCard from "./ExpandedPostSummaryCard";

const HomeAllPostsDeck = memo(({ posts }) => {
  return posts.map((post) => (
    <ExpandedPostSummaryCard
      key={post._id}
      authorId={post.author._id}
      authorImageURL={post.author.imageURL}
      authorImageFileName={post.author.imageFileName}
      authorName={post.author.name}
      postId={post._id}
      postTitle={post.title}
      postSummary={post.summary}
      postCreationDate={post.createdAt}
      postReadingTime={calculateReadingTime(post.description)}
      postTags={post.tags}
      postImageURL={post.imageURL}
    />
  ));
});

export default HomeAllPostsDeck;
