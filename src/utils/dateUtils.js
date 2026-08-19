export const getPostFormattedDate = (date) =>
  new Date(date).toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
