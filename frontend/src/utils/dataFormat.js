export const formatDate = (data) => {
  return data.map((d) => {
    d.createdAt = new Date(d.createdAt).toLocaleDateString();
    d.updatedAt = new Date(d.updatedAt).toLocaleDateString();
    return d;
  });
};

export const getUniqueDates = (data, type) => {
  const dateFormattedData = formatDate(data);
  if (type === "createdAt") {
    return [...new Set(dateFormattedData.map((d) => d.createdAt))];
  } else {
    return [...new Set(dateFormattedData.map((d) => d.updatedAt))];
  }
};

export const formatData = (data, type) => {
  const uniqueDates = getUniqueDates(data, type);
  const dateFormattedData = formatDate(data);
  return uniqueDates.map((date) => {
    const count = dateFormattedData.filter((d) => d.createdAt === date).length;
    return {
      date: date,
      count: count,
    };
  });
};
