import { memo } from "react";
import ExpandedPostSummaryLoader from "./ExpandedPostSummaryLoader";

const ExpandedPostSummaryLoaderDeck = memo(({ count }) => {
  return (
    <>
      {Array.from(Array(count).keys()).map((_) => (
        <ExpandedPostSummaryLoader />
      ))}
    </>
  );
});

export default ExpandedPostSummaryLoaderDeck;
