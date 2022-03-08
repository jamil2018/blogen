import ExpandedPostSummaryLoader from "./ExpandedPostSummaryLoader";

const ExpandedPostSummaryLoaderDeck = ({ count }) => {
  return (
    <>
      {Array.from(Array(count).keys()).map((_) => (
        <ExpandedPostSummaryLoader />
      ))}
    </>
  );
};

export default ExpandedPostSummaryLoaderDeck;
