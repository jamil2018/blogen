import { memo } from "react";
import ExpandedPostSummaryLoader from "./ExpandedPostSummaryLoader";

const ExpandedPostSummaryLoaderDeck = memo(({ count }) => {
  return (
    <>
      {Array.from(Array(count).keys()).map((_, index) => (
        <ExpandedPostSummaryLoader key={index} />
      ))}
    </>
  );
});

export default ExpandedPostSummaryLoaderDeck;
